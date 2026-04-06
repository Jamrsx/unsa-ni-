// vite.config.js
import { fileURLToPath, URL } from 'node:url'
import { resolve, dirname } from 'node:path'
import { fileURLToPath as toPath } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

const __dirname = dirname(toPath(import.meta.url))

export default defineConfig({
    plugins: [vue()],
    root: '.',
    publicDir: 'public',

    build: {
        rollupOptions: {
            input: {
                index:       resolve(__dirname, 'index.html'),
                signin:      resolve(__dirname, 'signin.html'),
                signup:      resolve(__dirname, 'signup.html'),
                duel:        resolve(__dirname, 'duel.html'),
                onboarding:  resolve(__dirname, 'onboarding.html'),
                result:      resolve(__dirname, 'result.html'),
                lobbies:     resolve(__dirname, 'lobbies.html'),
                room:        resolve(__dirname, 'room.html'),
                lobby:       resolve(__dirname, 'lobby.html'),
                home:        resolve(__dirname, 'home.html'),
                solo:        resolve(__dirname, 'solo.html'),
                event:       resolve(__dirname, 'event.html'),
                blog:        resolve(__dirname, 'blog.html'),
                admin:       resolve(__dirname, 'admin.html'),
                inspector:   resolve(__dirname, 'inspector.html'),
                dashboard:   resolve(__dirname, 'dashboard.html'),
            }
        }
    },

    server: {
        host: '0.0.0.0',
        port: 5173,
        proxy: {
            '/admin': {
                target: 'http://localhost:3000',
                changeOrigin: true,
                secure: false,
            },
            '/api': {
                target: 'http://localhost:3000',
                changeOrigin: true,
                secure: false,
            },
            '/socket.io': {
                target: 'ws://localhost:3000',
                ws: true,
                changeOrigin: true,
            }
        },
    },

    resolve: {
        alias: {
            '/js': fileURLToPath(new URL('./src/js', import.meta.url))
        }
    }
})