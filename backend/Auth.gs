/**
 * Modul Login & Hak Akses.
 *
 * Login pakai akun Google (Sign In with Google) di frontend. Frontend kirim
 * `idToken` di tiap request; backend verifikasi token itu ke Google, cari
 * emailnya di sheet Pengguna (Config), lalu tiap action menyaring data
 * sesuai cakupan peran orang itu.
 *
 * Satu email bisa punya lebih dari 1 baris di Pengguna (mis. Pengawas
 * dengan beberapa sekolah binaan = beberapa baris, sama seperti Orang Tua
 * dengan beberapa anak).
 */

var PENGGUNA_SHEET = 'Pengguna';
var PENGGUNA_HEADERS = ['email', 'nama', 'peran', 'cakupan_tipe', 'cakupan_nilai', 'status_aktif'];

// Peran dengan cakupan wilayah (bukan 1 sekolah spesifik) — lihat agregat, bukan edit.
var PERAN_WILAYAH = { kepala_desa: 'desa', camat: 'kecamatan' };

// Isi dengan OAuth Client ID dari Google Cloud Console (lihat docs/hak-akses.md) —
// dipakai untuk memastikan idToken benar-benar dibuat untuk aplikasi ini.
var GOOGLE_OAUTH_CLIENT_ID = 'ISI_SETELAH_BUAT_OAUTH_CLIENT_ID';

function getPenggunaSheet_() {
  var props = PropertiesService.getScriptProperties();
  var id = props.getProperty(CONFIG_SPREADSHEET_ID_KEY);
  if (!id) throw new Error('Config spreadsheet belum di-setup.');
  return SpreadsheetApp.openById(id).getSheetByName(PENGGUNA_SHEET);
}

/**
 * Verifikasi idToken ke endpoint resmi Google. Melempar error kalau token
 * tidak valid/kedaluwarsa/bukan untuk aplikasi ini.
 */
function verifyIdToken_(idToken) {
  var res = UrlFetchApp.fetch('https://oauth2.googleapis.com/tokeninfo?id_token=' + encodeURIComponent(idToken), {
    muteHttpExceptions: true,
  });
  if (res.getResponseCode() !== 200) {
    throw new Error('Sesi login tidak valid, silakan masuk lagi.');
  }
  var payload = JSON.parse(res.getContentText());
  if (GOOGLE_OAUTH_CLIENT_ID !== 'ISI_SETELAH_BUAT_OAUTH_CLIENT_ID' && payload.aud !== GOOGLE_OAUTH_CLIENT_ID) {
    throw new Error('Token bukan untuk aplikasi ini.');
  }
  return { email: payload.email, nama: payload.name || payload.email };
}

/**
 * params: { idToken }. Melempar error kalau belum login / token tidak valid.
 * Baris di Pengguna dengan status_aktif != true diabaikan.
 */
function resolveCaller_(params) {
  if (!params || !params.idToken) throw new Error('Anda belum login.');
  var identity = verifyIdToken_(params.idToken);

  var rows = readSheetAsObjects_(getPenggunaSheet_());
  var roles = rows.filter(function (r) {
    return r.email === identity.email && r.status_aktif === true;
  });

  return { email: identity.email, nama: identity.nama, roles: roles };
}

function getCurrentUser_(params) {
  var caller = resolveCaller_(params);
  return { ok: true, email: caller.email, nama: caller.nama, roles: caller.roles };
}

/**
 * true kalau salah satu peran caller punya cakupan yang mencakup `sekolah`
 * (baris dari sheet Sekolah — punya id_sekolah, kecamatan, desa).
 */
function hasAccessToSekolah_(roles, sekolah) {
  return roles.some(function (r) {
    if (r.peran === 'admin_dinas') return true;
    if (r.cakupan_tipe === 'sekolah') return r.cakupan_nilai === sekolah.id_sekolah;
    if (r.cakupan_tipe === 'kecamatan') return r.cakupan_nilai === sekolah.kecamatan;
    if (r.cakupan_tipe === 'desa') return r.cakupan_nilai === sekolah.desa;
    return false;
  });
}

/**
 * Lebih ketat dari hasAccessToSekolah_: cuma peran yang boleh MENGUBAH data
 * sekolah (admin dinas, atau kepala sekolah/operator sekolah itu sendiri).
 * Pengawas, camat, kepala desa, komite dst. cuma boleh lihat.
 */
function canEditSekolah_(roles, sekolah) {
  return roles.some(function (r) {
    if (r.peran === 'admin_dinas') return true;
    if (r.peran === 'kepala_sekolah' && r.cakupan_tipe === 'sekolah') {
      return r.cakupan_nilai === sekolah.id_sekolah;
    }
    return false;
  });
}

function filterSekolahByAccess_(roles, sekolahList) {
  return sekolahList.filter(function (s) { return hasAccessToSekolah_(roles, s); });
}

/**
 * Lempar error kalau caller tidak punya salah satu peran di `allowedRoles`.
 */
function requireRole_(params, allowedRoles) {
  var caller = resolveCaller_(params);
  var ok = caller.roles.some(function (r) { return allowedRoles.indexOf(r.peran) !== -1; });
  if (!ok) throw new Error('Aksi ini khusus untuk peran: ' + allowedRoles.join(', '));
  return caller;
}
