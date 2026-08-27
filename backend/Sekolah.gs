/**
 * Modul Data Sekolah: Spreadsheet Config pusat (daftar sekolah) +
 * satu Spreadsheet data (Siswa/Guru) per sekolah.
 */

var CONFIG_SPREADSHEET_ID_KEY = 'CONFIG_SPREADSHEET_ID';
var SEKOLAH_SHEET = 'Sekolah';
var SEKOLAH_HEADERS = [
  'id_sekolah', 'npsn', 'nama_sekolah', 'kecamatan', 'desa', 'skema_input',
  'spreadsheet_id_data', 'folder_id', 'jumlah_siswa', 'jumlah_guru', 'status_aktif', 'updated_at',
];
var SISWA_HEADERS = ['nisn', 'nama', 'jenis_kelamin', 'kelas', 'tanggal_lahir', 'status'];
var GURU_HEADERS = ['nip_nuptk', 'nama', 'jenis_kelamin', 'status_kepegawaian', 'mapel', 'status'];
var PRESENSI_HEADERS = ['tanggal', 'nisn', 'nama', 'kelas', 'status'];

/**
 * Pindahkan file (mis. Spreadsheet yang baru dibuat lewat SpreadsheetApp.create,
 * yang selalu masuk ke root My Drive akun yang deploy) ke folder Drive Bersama
 * yang sudah disiapkan manual. Aman dipanggil untuk file yang parent-nya mana pun.
 */
function moveFileToFolder_(fileId, folderId) {
  if (!folderId) return;
  var file = DriveApp.getFileById(fileId);
  var target = DriveApp.getFolderById(folderId);
  target.addFile(file);
  var parents = file.getParents();
  while (parents.hasNext()) {
    var parent = parents.next();
    if (parent.getId() !== folderId) parent.removeFile(file);
  }
}

/**
 * Jalankan sekali secara manual dari editor Apps Script untuk membuat
 * Spreadsheet Config (kalau belum ada) dan menyimpan ID-nya.
 *
 * configFolderId (opsional): ID folder "00-Config" di Drive Bersama —
 * tempel dari URL folder itu (bagian setelah /folders/). Kalau diisi,
 * Spreadsheet Config langsung dibuat di dalam folder itu, bukan di My Drive.
 */
function setupConfigSpreadsheet(configFolderId) {
  var props = PropertiesService.getScriptProperties();
  var existingId = props.getProperty(CONFIG_SPREADSHEET_ID_KEY);
  if (existingId) {
    return { ok: true, message: 'Sudah ada', spreadsheetId: existingId };
  }
  var ss = SpreadsheetApp.create('SIM Mutu Melawi - Config');
  var sheet = ss.getSheets()[0];
  sheet.setName(SEKOLAH_SHEET);
  sheet.appendRow(SEKOLAH_HEADERS);
  var penggunaSheet = ss.insertSheet(PENGGUNA_SHEET);
  penggunaSheet.appendRow(PENGGUNA_HEADERS);
  moveFileToFolder_(ss.getId(), configFolderId);
  props.setProperty(CONFIG_SPREADSHEET_ID_KEY, ss.getId());
  return { ok: true, message: 'Spreadsheet Config dibuat', spreadsheetId: ss.getId(), url: ss.getUrl() };
}

function getConfigSheet_() {
  var props = PropertiesService.getScriptProperties();
  var id = props.getProperty(CONFIG_SPREADSHEET_ID_KEY);
  if (!id) {
    throw new Error('Config spreadsheet belum di-setup. Jalankan setupConfigSpreadsheet() dulu.');
  }
  return SpreadsheetApp.openById(id).getSheetByName(SEKOLAH_SHEET);
}

function readSheetAsObjects_(sheet) {
  var values = sheet.getDataRange().getValues();
  if (values.length < 2) return [];
  var headers = values[0];
  var rows = values.slice(1);
  return rows.map(function (row) {
    var obj = {};
    headers.forEach(function (h, i) { obj[h] = row[i]; });
    return obj;
  });
}

function listAllSekolah_() {
  var sheet = getConfigSheet_();
  return readSheetAsObjects_(sheet);
}

function listSekolah_(params) {
  var caller = resolveCaller_(params);
  var data = filterSekolahByAccess_(caller.roles, listAllSekolah_());
  return { ok: true, data: data };
}

function getSekolahDetail_(params) {
  var caller = resolveCaller_(params);
  var idSekolah = params.idSekolah;
  var sekolah = listAllSekolah_().filter(function (s) { return s.id_sekolah === idSekolah; })[0];
  if (!sekolah) return { ok: false, error: 'Sekolah tidak ditemukan: ' + idSekolah };
  if (!hasAccessToSekolah_(caller.roles, sekolah)) {
    return { ok: false, error: 'Tidak punya akses ke sekolah ini' };
  }

  var dataSs = SpreadsheetApp.openById(sekolah.spreadsheet_id_data);
  var siswa = readSheetAsObjects_(dataSs.getSheetByName('Siswa'));
  var guru = readSheetAsObjects_(dataSs.getSheetByName('Guru'));
  return { ok: true, sekolah: sekolah, siswa: siswa, guru: guru };
}

function addSekolah_(params) {
  requireRole_(params, ['admin_dinas']);

  var namaSekolah = params.namaSekolah;
  var npsn = params.npsn;
  var kecamatan = params.kecamatan;
  var desa = params.desa;
  var skemaInput = params.skemaInput || 'offline';
  var folderId = params.folderId || '';

  var dataSs = SpreadsheetApp.create('SIM Mutu Melawi - ' + namaSekolah);
  var siswaSheet = dataSs.getSheets()[0];
  siswaSheet.setName('Siswa');
  siswaSheet.appendRow(SISWA_HEADERS);
  var guruSheet = dataSs.insertSheet('Guru');
  guruSheet.appendRow(GURU_HEADERS);
  var presensiSheet = dataSs.insertSheet('Presensi');
  presensiSheet.appendRow(PRESENSI_HEADERS);
  moveFileToFolder_(dataSs.getId(), folderId);

  var idSekolah = 'SKL-' + Utilities.getUuid().slice(0, 8);
  var sheet = getConfigSheet_();
  sheet.appendRow([
    idSekolah, npsn, namaSekolah, kecamatan, desa, skemaInput,
    dataSs.getId(), folderId, 0, 0, true, new Date().toISOString(),
  ]);

  return { ok: true, idSekolah: idSekolah, spreadsheetId: dataSs.getId(), url: dataSs.getUrl() };
}

/**
 * payload: { idSekolah, siswa: [{nisn,nama,jenis_kelamin,kelas,tanggal_lahir,status}],
 *            guru: [{nip_nuptk,nama,jenis_kelamin,status_kepegawaian,mapel,status}] }
 * Menambahkan baris baru (append), bukan menimpa data lama.
 */
function importSiswaGuru_(params) {
  var caller = resolveCaller_(params);
  var idSekolah = params.idSekolah;
  var siswaRows = params.siswa || [];
  var guruRows = params.guru || [];

  var sekolah = listAllSekolah_().filter(function (s) { return s.id_sekolah === idSekolah; })[0];
  if (!sekolah) return { ok: false, error: 'Sekolah tidak ditemukan: ' + idSekolah };
  if (!canEditSekolah_(caller.roles, sekolah)) {
    return { ok: false, error: 'Tidak punya akses untuk mengubah data sekolah ini' };
  }

  var configSheet = getConfigSheet_();
  var values = configSheet.getDataRange().getValues();
  var headers = values[0];
  var idCol = headers.indexOf('id_sekolah');
  var ssIdCol = headers.indexOf('spreadsheet_id_data');
  var jumlahSiswaCol = headers.indexOf('jumlah_siswa');
  var jumlahGuruCol = headers.indexOf('jumlah_guru');
  var updatedAtCol = headers.indexOf('updated_at');

  var rowIndex = -1;
  var spreadsheetId = null;
  for (var i = 1; i < values.length; i++) {
    if (values[i][idCol] === idSekolah) {
      rowIndex = i;
      spreadsheetId = values[i][ssIdCol];
      break;
    }
  }
  if (rowIndex === -1) return { ok: false, error: 'Sekolah tidak ditemukan: ' + idSekolah };

  var dataSs = SpreadsheetApp.openById(spreadsheetId);

  if (siswaRows.length) {
    var siswaSheet = dataSs.getSheetByName('Siswa');
    var siswaValues = siswaRows.map(function (r) {
      return SISWA_HEADERS.map(function (h) { return r[h] || ''; });
    });
    siswaSheet.getRange(siswaSheet.getLastRow() + 1, 1, siswaValues.length, SISWA_HEADERS.length).setValues(siswaValues);
  }
  if (guruRows.length) {
    var guruSheet = dataSs.getSheetByName('Guru');
    var guruValues = guruRows.map(function (r) {
      return GURU_HEADERS.map(function (h) { return r[h] || ''; });
    });
    guruSheet.getRange(guruSheet.getLastRow() + 1, 1, guruValues.length, GURU_HEADERS.length).setValues(guruValues);
  }

  var newJumlahSiswa = dataSs.getSheetByName('Siswa').getLastRow() - 1;
  var newJumlahGuru = dataSs.getSheetByName('Guru').getLastRow() - 1;
  configSheet.getRange(rowIndex + 1, jumlahSiswaCol + 1).setValue(newJumlahSiswa);
  configSheet.getRange(rowIndex + 1, jumlahGuruCol + 1).setValue(newJumlahGuru);
  configSheet.getRange(rowIndex + 1, updatedAtCol + 1).setValue(new Date().toISOString());

  return { ok: true, jumlahSiswa: newJumlahSiswa, jumlahGuru: newJumlahGuru };
}
