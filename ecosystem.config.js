module.exports = {
  apps: [
    {
      name: 'notion-nice-webapp',
      exec_mode: 'cluster',
      instances: 'max', // Or a number of instances
      script: 'node_modules/next/dist/bin/next',
      args: 'start',
    }
  ]
}
