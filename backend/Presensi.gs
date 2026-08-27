/**
 * Modul Presensi: rekap harian per sekolah, dibaca dari sheet `Presensi`
 * pada Spreadsheet data sekolah masing-masing (lihat Sekolah.gs).
 *
 * Catatan: seedDummyPresensi_ hanya untuk demo/uji coba selama data asli
 * (offline import, web, atau AppSheet) belum tersedia.
 */

var STATUS_LIST = ['Hadir', 'Sakit', 'Izin', 'Alpa'];
var DUMMY_KELAS = ['7A', '7B', '8A', '8B', '9A', '9B'];
var DUMMY_SISWA_PER_KELAS = 5;
var DUMMY_JUMLAH_HARI = 7;

function findSekolahRow_(idSekolah) {
  var sekolah = listAllSekolah_().filter(function (s) { return s.id_sekolah === idSekolah; })[0];
  if (!sekolah) throw new Error('Sekolah tidak ditemukan: ' + idSekolah);
  return sekolah;
}

function formatTanggal_(date) {
  return Utilities.formatDate(date, 'Asia/Jakarta', 'yyyy-MM-dd');
}

function summarizePresensi_(rows) {
  var summary = { Hadir: 0, Sakit: 0, Izin: 0, Alpa: 0 };
  rows.forEach(function (r) {
    if (summary.hasOwnProperty(r.status)) summary[r.status] += 1;
  });
  return summary;
}

/**
 * params: { idSekolah, tanggal? } — tanggal format 'yyyy-MM-dd', default hari ini.
 */
function getRekapPresensi_(params) {
  var caller = resolveCaller_(params);
  var idSekolah = params.idSekolah;
  var tanggal = params.tanggal || formatTanggal_(new Date());
  var sekolah = findSekolahRow_(idSekolah);
  if (!hasAccessToSekolah_(caller.roles, sekolah)) {
    return { ok: false, error: 'Tidak punya akses ke sekolah ini' };
  }

  var dataSs = SpreadsheetApp.openById(sekolah.spreadsheet_id_data);
  var allRows = readSheetAsObjects_(dataSs.getSheetByName('Presensi'));
  var rows = allRows.filter(function (r) { return r.tanggal === tanggal; });

  return { ok: true, tanggal: tanggal, rows: rows, summary: summarizePresensi_(rows) };
}

/**
 * Bikin data siswa + presensi dummy untuk sekolah tertentu, supaya modul ini
 * bisa dicoba/di-demo sebelum ada data asli. Aman dipanggil berkali-kali:
 * siswa dummy hanya dibuat kalau sheet Siswa masih kosong.
 */
function seedDummyPresensi_(params) {
  var caller = resolveCaller_(params);
  var idSekolah = params.idSekolah;
  var sekolah = findSekolahRow_(idSekolah);
  if (!canEditSekolah_(caller.roles, sekolah)) {
    return { ok: false, error: 'Tidak punya akses untuk mengubah data sekolah ini' };
  }
  var dataSs = SpreadsheetApp.openById(sekolah.spreadsheet_id_data);
  var siswaSheet = dataSs.getSheetByName('Siswa');

  var siswaList = readSheetAsObjects_(siswaSheet);
  if (siswaList.length === 0) {
    var siswaRows = [];
    var counter = 1;
    DUMMY_KELAS.forEach(function (kelas) {
      for (var i = 0; i < DUMMY_SISWA_PER_KELAS; i++) {
        siswaRows.push([
          '00' + (1000 + counter), 'Siswa Contoh ' + counter, counter % 2 === 0 ? 'P' : 'L',
          kelas, '2011-01-01', 'aktif',
        ]);
        counter++;
      }
    });
    siswaSheet.getRange(siswaSheet.getLastRow() + 1, 1, siswaRows.length, SISWA_HEADERS.length).setValues(siswaRows);
    siswaList = readSheetAsObjects_(siswaSheet);

    var configSheet = getConfigSheet_();
    var values = configSheet.getDataRange().getValues();
    var headers = values[0];
    var idCol = headers.indexOf('id_sekolah');
    var jumlahSiswaCol = headers.indexOf('jumlah_siswa');
    for (var r = 1; r < values.length; r++) {
      if (values[r][idCol] === idSekolah) {
        configSheet.getRange(r + 1, jumlahSiswaCol + 1).setValue(siswaList.length);
        break;
      }
    }
  }

  var presensiSheet = dataSs.getSheetByName('Presensi');
  var today = new Date();
  var presensiRows = [];
  for (var d = DUMMY_JUMLAH_HARI - 1; d >= 0; d--) {
    var date = new Date(today);
    date.setDate(date.getDate() - d);
    var tanggal = formatTanggal_(date);
    siswaList.forEach(function (siswa) {
      presensiRows.push([tanggal, siswa.nisn, siswa.nama, siswa.kelas, randomStatus_()]);
    });
  }
  presensiSheet.getRange(presensiSheet.getLastRow() + 1, 1, presensiRows.length, PRESENSI_HEADERS.length).setValues(presensiRows);

  return { ok: true, jumlahSiswa: siswaList.length, jumlahBaris: presensiRows.length };
}

function randomStatus_() {
  var roll = Math.random();
  if (roll < 0.88) return 'Hadir';
  if (roll < 0.93) return 'Sakit';
  if (roll < 0.97) return 'Izin';
  return 'Alpa';
}
