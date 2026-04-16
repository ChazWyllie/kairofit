import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  // Vite 8 uses OXC by default and reads "jsx: preserve" from tsconfig.json (needed by Next.js).
  // Override OXC's jsx config here so it transforms JSX before vite:import-analysis runs.
  // @ts-expect-error -- oxc is a Vite 8 option not yet reflected in vitest/config types
  oxc: {
    jsx: {
      runtime: 'automatic',
      importSource: 'react',
    },
  },
  test: {
    // jsdom enables browser APIs (DOM, window, localStorage) needed for component tests.
    // Pure utility tests work under both node and jsdom; use jsdom as the safer default.
    environment: 'jsdom',
    globals: true,
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
    exclude: [],
    setupFiles: ['./vitest.setup.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/lib/**/*.ts', 'src/components/**/*.tsx'],
      exclude: ['src/lib/**/*.test.ts', 'src/components/**/*.test.tsx', 'src/types/**'],
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
})
