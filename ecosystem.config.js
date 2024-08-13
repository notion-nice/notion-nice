module.exports = {
  apps: [
    {
      name: 'notion-nice-webapp',
      exec_mode: 'fork',
      script: 'node_modules/next/dist/bin/next',
      args: 'start',
    }
  ]
}
