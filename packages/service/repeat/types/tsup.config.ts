import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  outExtension({ format }) {
    return {
      js: format === 'cjs' ? '.cjs' : '.esm.js'
    }
  }
})
