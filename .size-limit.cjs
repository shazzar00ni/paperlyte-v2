module.exports = [
  {
    name: 'Main bundle (JS)',
    path: 'dist/assets/*.js',
    limit: '150 KB',
    gzip: true,
  },
  {
    name: 'Main bundle (CSS)',
    path: 'dist/assets/*.css',
    limit: '30 KB',
    gzip: true,
    running: false,
  },
]
