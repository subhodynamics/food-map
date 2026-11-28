import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { checkHealth } from './api/health.js'

function healthEndpointPlugin() {
  let envVars = {}

  function registerHealthMiddleware(server) {
    server.middlewares.use(async (req, res, next) => {
      const reqPath = (req.url || '').split('?')[0]
      if (reqPath !== '/health') {
        next()
        return
      }

      if (req.method !== 'GET' && req.method !== 'HEAD') {
        res.statusCode = 405
        res.setHeader('Allow', 'GET, HEAD')
        res.end()
        return
      }

      const supabaseUrl = envVars.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL
      const supabaseKey =
        envVars.VITE_SUPABASE_ANON_KEY ||
        envVars.VITE_SUPABASE_PUBLISHABLE_KEY ||
        process.env.VITE_SUPABASE_ANON_KEY

      const { statusCode, payload } = await checkHealth({ supabaseUrl, supabaseKey })

      res.statusCode = statusCode
      res.setHeader('Content-Type', 'application/json; charset=utf-8')
      res.setHeader('Cache-Control', 'no-store, max-age=0')

      if (req.method === 'HEAD') {
        res.end()
        return
      }

      res.end(JSON.stringify(payload))
    })
  }

  return {
    name: 'onspot-health-endpoint',
    configResolved(config) {
      envVars = loadEnv(config.mode, config.root, '')
    },
    configureServer(server) {
      registerHealthMiddleware(server)
    },
    configurePreviewServer(server) {
      registerHealthMiddleware(server)
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), healthEndpointPlugin()],
})
