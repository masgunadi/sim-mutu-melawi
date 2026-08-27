import callApi from './client'

export function getCurrentUser() {
  return callApi('getCurrentUser')
}
