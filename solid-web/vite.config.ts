import tailwindcss from '@tailwindcss/vite';
import {fileRoutes} from 'filesystem-routing/vite';
import {defineConfig} from 'vitest/config';
import solid from '@solidjs/vite-plugin';
import devtools from 'solid-devtools/vite';

export default defineConfig({
    plugins: [
        solid({
            start: true,
            serverFunctions: false,
            ssr: false,
            extensions: ['.jsx', '.tsx']
        }),
        fileRoutes({types: true}),
        tailwindcss(),
        devtools()
    ],
    server: {
        port: 5173,
        proxy: {
            '/api': {
                target: 'http://localhost:80',
                changeOrigin: true,
            }
        }
    },
    test: {
        environment: 'jsdom',
        globals: false,
        setupFiles: ['./vitest-setup.ts'],
        // if you have few tests, try commenting this
        // out to improve performance:
        isolate: false,
    },
    build: {
        target: 'esnext',
        // Keep images as asset files instead of inlining them into the JS bundle.
        assetsInlineLimit: 0,
    },
});
