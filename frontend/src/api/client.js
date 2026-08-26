const BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

async function callApi(action, { method = 'GET', payload, query } = {}) {
  if (!BASE_URL) {
    throw new Error('VITE_API_BASE_URL belum diatur (lihat frontend/.env.example)')
  }

  if (method === 'GET') {
    const url = new URL(BASE_URL)
    url.searchParams.set('action', action)
    Object.entries(query || {}).forEach(([key, value]) => url.searchParams.set(key, value))
    const res = await fetch(url.toString())
    return res.json()
  }

  const res = await fetch(BASE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ action, payload }),
  })
  return res.json()
}

export function ping() {
  return callApi('ping')
}

export default callApi
