import { defineConfig } from 'vite'
import svgr from 'vite-plugin-svgr'
import react from '@vitejs/plugin-react'
import postcssPresetEnv from 'postcss-preset-env'

export default ({ mode }: { mode: string }) => defineConfig({
  base: '/best_practices/',
  plugins: [
    react(),
    svgr(),
  ],
  publicDir: 'public',

  resolve: {
    alias: [
      { find: '@', replacement: '/src' },
    ],
  },
  css: {
    modules: {
      localsConvention: 'camelCase',
      generateScopedName: '[local]_[hash:base64:2]',
    },
    postcss: {
      plugins: [
        postcssPresetEnv({
          stage: 3,
          preserve: true,
        }),
      ],
    },
  },

  build: {
    target: 'es2022',
    minify: 'esbuild',
    outDir: `build-${mode}`,
    modulePreload: {
      polyfill: false,
    },
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      output: {
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
  },
})
