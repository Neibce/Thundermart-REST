module.exports = {
  apps: [{
  name: 'api',
  script: './main.js',
  instances: 0,
  exec_mode: 'cluster',
  error_file: 'err.log',
  out_file: 'out.log',
  log_file: 'combined.log',
  time: true
  }]
}