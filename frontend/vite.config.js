import {defineConfig, transformWithEsbuild} from 'vite'
import react from '@vitejs/plugin-react'
import {serviceWorkerPlugin} from "@gautemo/vite-plugin-service-worker";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    {
      name: 'treat-js-files-as-jsx',
      async transform(code, id) {
        if (!id.match(/src\/.*\.js$/))  return null

        // Use the exposed transform from vite, instead of directly
        // transforming with esbuild
        return transformWithEsbuild(code, id, {
          loader: 'jsx',
          jsx: 'automatic',
        })
      },
    },
    react(),
    // {
    //   apply: "build",
    //   enforce: "post",
    //   transformIndexHtml() {
    //     buildSync({
    //       minify: true,
    //       bundle: true,
    //       entryPoints: [join(process.cwd(), "serviceWorker.js")],
    //       outfile: join(process.cwd(), "dist", "serviceWorker.js"),
    //     });
    //   },
    // },

  ],
  esbuild: {
    loader: 'jsx',
  },
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        '.js': 'jsx',
      },
    },
  },
  build: {

  }
})
