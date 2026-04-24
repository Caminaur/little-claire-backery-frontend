import axios from 'axios'

const client = axios.create({
  baseURL: 'http://localhost:8000',
  withCredentials: true,
  withXSRFToken: true,
  headers: {
    Accept: 'application/json',
  },
})

// no-op in demo mode — no real backend
export async function ensureCsrf() {}

export default client
