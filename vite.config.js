import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import autoprefixer from 'autoprefixer'
import tailwind from 'tailwindcss'
import tailwindConfig from './tailwind.config.js'


const [schema, host] = process.env.GITPOD_WORKSPACE_URL ? process.env.GITPOD_WORKSPACE_URL.split('://') : [null, null]
const publicUrl = `5173-${host}`

// https://vitejs.dev/config/
export default defineConfig({
  base: '',
  define: {
    __STAMP_CONTRACT__: '"TlqASNDLA1Uh8yFiH-BzR_1FDag4s735F3PoUFEv2Mo"',
    __BAR_CONTRACT__: '"rO8f4nTVarU6OtU2284C8-BIH6HscNd-srhWznUllTk"',
    __ASSET_SOURCE__: '"j9Lk3cTmukZS2-hae9GYxK1CuHtWtHcA1V5-tkIfu5k"'
  },
  plugins: [svelte()],
  server: {
    hmr: {
      clientPort: host ? 443 : 5173,
      host: host
        ? publicUrl
        : "localhost",
    }
  },
  css: {
    postcss: {
      plugins: [tailwind(tailwindConfig), autoprefixer],
    }

  }
})