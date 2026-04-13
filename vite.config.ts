import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer'

export default ({ mode }: { mode: string }) => defineConfig({
  plugins: [
    react(),
    visualizer({ open: false }), // Для визуализации бандла
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
  },

  build: {
    target: 'esnext',
    minify: 'esbuild',
    outDir: `build-${mode}`,
    rollupOptions: {
      external: (id) => {
        // Exclude dev dependencies from production builds
        if (id.includes('@faker-js/faker') || id.includes('msw')) {
          return true
        }
        return false
      },
      output: {
        manualChunks(id) {
          const reactNodeModulesPattern = /[/\\]node_modules[/\\](?:react|react-dom)(?:[/\\]|$)/

          if (id.includes('node_modules')) {
            if (id.includes('@tinkerbells/xenon-ui')) {
              return 'vendor-ui'
            }
            if (id.includes('@tiptap/') || id.includes('prosemirror-')) {
              return 'vendor-tiptap'
            }
            if (
              id.includes('@tanstack/react-table')
              || id.includes('@tanstack/table-core')
              || id.includes('@tanstack/virtual-core')
              || id.includes('@tanstack/react-virtual')
            ) {
              return 'vendor-table'
            }
            if (id.includes('react-router')) {
              return 'vendor-router'
            }
            if (id.includes('@reduxjs/toolkit') || id.includes('react-redux') || id.includes('redux-persist')) {
              return 'vendor-redux'
            }
            if (reactNodeModulesPattern.test(id)) {
              return 'vendor-react'
            }
            if (id.includes('react-hook-form') || id.includes('@hookform/resolvers') || id.includes('zod')) {
              return 'vendor-forms'
            }
            if (id.includes('@faker-js/faker')) {
              return 'vendor-faker'
            }
            return 'vendor-other'
          }
          if (id.includes('src/shared/')) {
            return 'shared'
          }
          if (id.includes('src/features/')) {
            return 'features'
          }
          if (id.includes('src/entities/')) {
            return 'entities'
          }
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
  },
})
