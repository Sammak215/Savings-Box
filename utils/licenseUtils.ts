const LICENSE_KEY = 'sb_license_key'
const UNLOCKED_KEY = 'sb_unlocked'

export function saveLicense(key: string): void {
  localStorage.setItem(LICENSE_KEY, key)
  localStorage.setItem(UNLOCKED_KEY, 'true')
}

export function getLicense(): string | null {
  return localStorage.getItem(LICENSE_KEY)
}

export function clearLicense(): void {
  localStorage.removeItem(LICENSE_KEY)
  localStorage.removeItem(UNLOCKED_KEY)
}

export function isUnlocked(): boolean {
  return localStorage.getItem(UNLOCKED_KEY) === 'true'
}
