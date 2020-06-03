import { randomBytes } from "crypto"

export function getOrThrow<T>(value: T | undefined, message?: string): T {
  if (value) {
    return value
  }

  throw new Error(message || 'Unexpected undefined value')
}

export function generateNonce() {
  return randomBytes(48).toString('base64')
}
