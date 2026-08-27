/**
 * Backend API (Google Apps Script Web App) untuk SIM Mutu Melawi.
 * Frontend (React SPA) memanggil endpoint ini sebagai REST-like JSON API.
 *
 * Konvensi:
 * - GET  ?action=xxx&...      -> query/read
 * - POST body JSON {action, payload} -> command/write
 */

function doGet(e) {
  var action = (e.parameter && e.parameter.action) || 'ping';
  return respond_(safeRoute_(action, e.parameter));
}

function doPost(e) {
  var body = {};
  try {
    body = JSON.parse(e.postData.contents);
  } catch (err) {
    return respond_({ ok: false, error: 'Invalid JSON body' });
  }
  var action = body.action || 'ping';
  return respond_(safeRoute_(action, body.payload || {}));
}

// Bungkus routeAction_ supaya error (mis. token tidak valid, belum login,
// tidak punya akses) selalu balik sebagai JSON { ok:false, error }, bukan
// halaman error HTML bawaan Apps Script.
function safeRoute_(action, params) {
  try {
    return routeAction_(action, params);
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

function routeAction_(action, params) {
  switch (action) {
    case 'ping':
      return { ok: true, action: 'ping', message: 'API SIM Mutu Melawi aktif', time: new Date().toISOString() };

    case 'getCurrentUser':
      return getCurrentUser_(params);

    case 'listSekolah':
      return listSekolah_(params);
    case 'getSekolahDetail':
      return getSekolahDetail_(params);
    case 'addSekolah':
      return addSekolah_(params);
    case 'importSiswaGuru':
      return importSiswaGuru_(params);
    case 'getRekapPresensi':
      return getRekapPresensi_(params);
    case 'seedDummyPresensi':
      return seedDummyPresensi_(params);

    // Placeholder untuk modul-modul berikutnya (belum diimplementasikan):
    // case 'getDashboardSummary': return getDashboardSummary_(params);
    // case 'importPresensi':      return importPresensi_(params);

    default:
      return { ok: false, error: 'Unknown action: ' + action };
  }
}

function respond_(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
