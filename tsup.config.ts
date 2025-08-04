import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['./cli.ts'],
  outDir:'bin',
  watch:true,

})
