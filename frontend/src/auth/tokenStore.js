// Penyimpanan idToken di memori, terpisah dari React context supaya
// lapisan api/*.js (client.js dst.) tidak perlu bergantung ke React.
let idToken = null

export function setAuthToken(token) {
  idToken = token
}

export function getAuthToken() {
  return idToken
}
