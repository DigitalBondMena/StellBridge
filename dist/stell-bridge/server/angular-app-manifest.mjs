
export default {
  bootstrap: () => import('./main.server.mjs').then(m => m.default),
  inlineCriticalCss: true,
  baseHref: '/',
  locale: undefined,
  routes: [
  {
    "renderMode": 0,
    "route": "/"
  },
  {
    "renderMode": 0,
    "preload": [
      "chunk-7ETIEF5I.js",
      "chunk-TRNR6F3X.js",
      "chunk-S4XWT7GN.js",
      "chunk-NFNGMI3M.js"
    ],
    "route": "/services"
  },
  {
    "renderMode": 0,
    "preload": [
      "chunk-QWUBZQ3N.js",
      "chunk-WMOMGK3D.js",
      "chunk-S4XWT7GN.js",
      "chunk-NFNGMI3M.js"
    ],
    "route": "/projects"
  },
  {
    "renderMode": 0,
    "preload": [
      "chunk-IEUCVJBY.js",
      "chunk-WMOMGK3D.js"
    ],
    "route": "/project-details/*"
  },
  {
    "renderMode": 0,
    "preload": [
      "chunk-O4KDMCRX.js",
      "chunk-TRNR6F3X.js",
      "chunk-NFNGMI3M.js"
    ],
    "route": "/service-details/*"
  },
  {
    "renderMode": 0,
    "preload": [
      "chunk-BXZRF6YY.js",
      "chunk-S4XWT7GN.js",
      "chunk-NFNGMI3M.js"
    ],
    "route": "/achievements"
  },
  {
    "renderMode": 0,
    "preload": [
      "chunk-PQKZ5W4Y.js",
      "chunk-NFNGMI3M.js"
    ],
    "route": "/contact-us"
  },
  {
    "renderMode": 0,
    "preload": [
      "chunk-KVMIAWEJ.js",
      "chunk-NFNGMI3M.js"
    ],
    "route": "/privacy"
  },
  {
    "renderMode": 0,
    "preload": [
      "chunk-4OUPJJ5G.js",
      "chunk-D7CGYABN.js",
      "chunk-NFNGMI3M.js"
    ],
    "route": "/about-us"
  },
  {
    "renderMode": 0,
    "redirectTo": "/",
    "route": "/**"
  }
],
  entryPointToBrowserMapping: undefined,
  assets: {
    'index.csr.html': {size: 12562, hash: 'a0a9de8d67cffdd9f673cf8f1b8b39abe40880424efd56b232354bb499ccb8db', text: () => import('./assets-chunks/index_csr_html.mjs').then(m => m.default)},
    'index.server.html': {size: 1619, hash: '905bdc6a4a51d423cd7124b93341b710bc0e03684eeaeac834bad7822cdd67e5', text: () => import('./assets-chunks/index_server_html.mjs').then(m => m.default)},
    'styles-DQ2JPSQC.css': {size: 502076, hash: 'jw9GnV74M7E', text: () => import('./assets-chunks/styles-DQ2JPSQC_css.mjs').then(m => m.default)}
  },
};
