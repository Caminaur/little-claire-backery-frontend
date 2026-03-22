import axios from 'axios'

const client = axios.create({
  baseURL: 'http://localhost:8000',
  withCredentials: true,
  withXSRFToken: true,
  headers: {
    Accept: 'application/json',
  },
})

let csrfInitialized = false

export async function ensureCsrf() {
  if (!csrfInitialized) {
    await client.get('/sanctum/csrf-cookie')
    csrfInitialized = true
  }
}

export default client
