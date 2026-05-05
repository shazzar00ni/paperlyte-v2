module.exports = [
  {
    name: 'Main bundle (JS)',
    path: 'dist/assets/*.js',
    limit: '150 KB',
    gzip: true,
    disablePlugins: ['@size-limit/esbuild'],
  },
  {
    name: 'Main bundle (CSS)',
    path: 'dist/assets/*.css',
    limit: '30 KB',
    gzip: true,
    disablePlugins: ['@size-limit/esbuild'],
  },
]
