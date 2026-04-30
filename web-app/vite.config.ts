import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import {ViteImageOptimizer} from 'vite-plugin-image-optimizer';


// https://vite.dev/config/
export default defineConfig({
    plugins: [
        react(),
        tailwindcss(),
        ViteImageOptimizer({
            png: {
                quality: 50
            },
            svg: {
                multipass: true,
                plugins: [
                    {
                        name: 'preset-default',
                        params: {
                            overrides: {
                                cleanupNumericValues: false,
                                cleanupIds: {
                                    minify: false,
                                    remove: false,
                                },
                                convertPathData: false,
                            },
                        },
                    },
                    'sortAttrs',
                    {
                        name: 'addAttributesToSVGElement',
                        params: {
                            attributes: [{xmlns: 'http://www.w3.org/2000/svg'}],
                        },
                    },
                ],
            },

        }),],
    server: {
        proxy: {
            '/api': {
                target: 'http://localhost:6060',
                changeOrigin: true,
            }
        }
    },
})
