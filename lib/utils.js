const properties = require('properties');
const waitSync = require('wait-sync');

function mountConfig(config, ns) {
  Object.defineProperty(config, ns.namespace, {
    get() {
      return parseConfig(ns.config());
    },
  });
}
function mergeConfig(config, ns) {
  const nsConfig = parseConfig(ns.config());
  Object.keys(nsConfig).forEach(key => {
    Object.defineProperty(config, key, {
      get() {
        return nsConfig[key];
      },
    });
  });
}

function loadApolloConfig(app) {
  try {
    const options = app.config.apollo;
    let done = false;
    let err;
    Promise.all(
      options.namespaces.map(async namespace => {
        const ns = app.apollo.namespace(namespace);
        await ns.ready();
        return ns;
      })
    )
      .then(nsArr => {
        done = true;
        nsArr.forEach(ns => {
          if (options.mountConfig) {
            mountConfig(app.config, ns);
          }
          if (options.mergeNamespace === ns.namespace) {
            mergeConfig(app.config, ns);
          }
        });
      })
      .catch(e => (err = e));
    let count = 0;
    while (!done) {
      if (err) {
        throw err;
      }
      count = count + 1;
      if (count > options.retry) {
        throw new Error('fetch configs timeout from apollo after retry 3 times');
      }
      waitSync(1);
    }
  } catch (error) {
    app.coreLogger.error(`fail to load config from apollo : ${error.message}`);
  }
}

function parseConfig(config) {
  try {
    let propertiesStr = '';
    Object.keys(config).forEach(key => {
      propertiesStr += `${key}=${config[key]}\n`;
    });
    return properties.parse(propertiesStr, {
      namespaces: true,
      reviver(key, value) {
        try {
          return JSON.parse(value);
        } catch (error) {
          return this.assert();
        }
      },
    });
  } catch (error) {
    return config;
  }
}

module.exports = {
  loadApolloConfig,
};
