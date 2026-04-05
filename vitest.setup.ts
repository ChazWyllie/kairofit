import '@testing-library/jest-dom'

// jsdom 29 exposes localStorage but its clear() is not callable in the Vitest
// worker context. Provide a complete implementation so all tests can call
// localStorage.clear(), .getItem(), .setItem(), and .removeItem().
const createStorageMock = () => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string): string | null => store[key] ?? null,
    setItem: (key: string, value: string): void => {
      store[key] = String(value)
    },
    removeItem: (key: string): void => {
      delete store[key]
    },
    clear: (): void => {
      store = {}
    },
    get length(): number {
      return Object.keys(store).length
    },
    key: (index: number): string | null => Object.keys(store)[index] ?? null,
  }
}

Object.defineProperty(window, 'localStorage', {
  value: createStorageMock(),
  writable: true,
})
