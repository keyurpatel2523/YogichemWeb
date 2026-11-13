module.exports = {
  apps: [
    {
      name: 'yogichem',
      script: 'node_modules/.bin/next',
      args: 'start -p 5000 -H 127.0.0.1',
      cwd: __dirname,
      instances: 1,
      exec_mode: 'fork',
      // Next.js auto-loads .env / .env.production from cwd — no env_file needed here.
      env: {
        NODE_ENV: 'production',
      },
      autorestart: true,
      max_restarts: 10,
      max_memory_restart: '512M',
      out_file: 'logs/out.log',
      error_file: 'logs/error.log',
      time: true,
    },
  ],
};
