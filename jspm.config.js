SystemJS.config({
  nodeConfig: {
    "paths": {
      "htz-stick/": "src/"
    }
  },
  devConfig: {
    "map": {
      "plugin-babel": "npm:systemjs-plugin-babel@0.0.17"
    }
  },
  transpiler: "plugin-babel",
  packages: {
    "htz-stick": {
      "main": "index.js",
      "meta": {
        "*.js": {
          "loader": "plugin-babel"
        }
      }
    }
  }
});

SystemJS.config({
  packageConfigPaths: [
    "npm:@*/*.json",
    "npm:*.json",
    "github:*/*.json"
  ],
  map: {
    "htz-dispatch-event": "github:haaretz/htz-dispatch-event@1.0.1",
    "htz-has-passive-events": "github:haaretz/htz-has-passive-events@1.0.0",
    "lodash-es": "npm:lodash-es@4.16.4"
  },
  packages: {}
});
