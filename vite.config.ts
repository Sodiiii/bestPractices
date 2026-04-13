import { defineConfig } from 'vite'
import svgr from 'vite-plugin-svgr'
import react from '@vitejs/plugin-react'
import postcssPresetEnv from 'postcss-preset-env'

function getVendorChunk(id: string) {
  const normalizedId = id.replace(/\\/g, '/')

  if (!normalizedId.includes('/node_modules/'))
    return undefined

  if (normalizedId.includes('/react/') || normalizedId.includes('/react-dom/') || normalizedId.includes('/scheduler/'))
    return 'vendor-react'

  if (normalizedId.includes('/react-router/') || normalizedId.includes('/nuqs/'))
    return 'vendor-router'

  if (normalizedId.includes('/mobx/') || normalizedId.includes('/mobx-react/'))
    return 'vendor-state'

  if (normalizedId.includes('/highcharts/') || normalizedId.includes('/highcharts-react-official/'))
    return 'vendor-charts'

  if (normalizedId.includes('/@tiptap/') || normalizedId.includes('/highlight.js/'))
    return 'vendor-editor'

  if (
    normalizedId.includes('/@tanstack/react-table/')
    || normalizedId.includes('/@tanstack/table-core/')
    || normalizedId.includes('/@tanstack/react-virtual/')
    || normalizedId.includes('/@tanstack/virtual-core/')
  ) {
    return 'vendor-data'
  }

  if (normalizedId.includes('/react-grid-layout/') || normalizedId.includes('/react-resizable/'))
    return 'vendor-grid'

  if (
    normalizedId.includes('/react-hook-form/')
    || normalizedId.includes('/@hookform/resolvers/')
    || normalizedId.includes('/zod/')
  ) {
    return 'vendor-forms'
  }

  if (
    normalizedId.includes('/@tinkerbells/xenon-ui/')
  ) {
    return 'vendor-ui-xenon'
  }

  if (
    normalizedId.includes('/antd/')
    || normalizedId.includes('/@ant-design/')
  ) {
    return 'vendor-ui-antd'
  }

  if (
    normalizedId.includes('/rc-')
    || normalizedId.includes('/@popperjs/')
  ) {
    return 'vendor-ui-rc'
  }

  return 'vendor-misc'
}

export default ({ mode }: { mode: string }) => defineConfig({
  base: '/best_practices/',
  plugins: [
    react(),
    svgr(),
  ],

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
        manualChunks: getVendorChunk,
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
  },
})
