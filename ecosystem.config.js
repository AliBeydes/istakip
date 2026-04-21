module.exports = {
  apps: [
    {
      name: 'istakip-backend',
      cwd: './server',
      script: 'src/index.js',
      interpreter: 'node',
      env: {
        NODE_ENV: 'production',
        PORT: 3020
      },
      watch: false,
      restart_delay: 3000,
      max_restarts: 10,
      min_uptime: '10s',
      autorestart: true,
      max_memory_restart: '500M',
      log_file: './logs/backend.log',
      out_file: './logs/backend-out.log',
      error_file: './logs/backend-error.log',
      merge_logs: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
    },
    {
      name: 'istakip-frontend',
      cwd: './client',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3000',
      interpreter: 'node',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      watch: false,
      restart_delay: 3000,
      max_restarts: 10,
      min_uptime: '10s',
      autorestart: true,
      max_memory_restart: '500M',
      log_file: './logs/frontend.log',
      out_file: './logs/frontend-out.log',
      error_file: './logs/frontend-error.log',
      merge_logs: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
    }
  ]
};
