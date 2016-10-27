/**
 * A simple express.js server with a proxy
 */

var express = require('express');
var apiProxy = require('http-proxy').createProxyServer();
var fs = require('fs');

var yaml = require('js-yaml');
var deepExtend = require('deep-extend');
var chalk = require('chalk');

var app = express();

// TODO: rename it
var currentEnv = process.env.NODE_ENV || process.env.env;
if (!currentEnv) {
  currentEnv = 'production';
} else {
  console.log('Use', currentEnv, 'environment');
}

/**
 * Error handling in http-proxy
 */

apiProxy.on('error', function(err, req, res) {
  console.log(chalk.red('ERROR'), 'Error proxying request: ', req.url);
  res.writeHead(500, {
    'Content-Type': 'text/plain'
  });
  res.end('Error proxying request');
});

/**
 * Load configuration from named YAML file
 */

var getConfig = function(configName, errorHandler) {
  try {
    // Load configuration from YAML and return it
    var configFile = configDir + configName + '.yml';
    var config = yaml.safeLoad(fs.readFileSync(configFile, 'utf8'));
    var configPath, configData;

    // TODO: ES-6 this!
    // Load environment-based configuration
    configPath = configDir + currentEnv + '/' + configName + '.yml';

    if (fs.existsSync(configPath)) {
      configData = yaml.safeLoad(fs.readFileSync(configPath, 'utf8'));
      config = deepExtend(config, configData);
    }

    return config;

  } catch (e) {
    // Or call error callback when exception appears
    errorHandler(e);
  }
};

/**
 * Load primary configuration
 */

var configDir = __dirname + '/../config/';
var appConfig = getConfig('app', function(error) {
  console.log('ERROR', error);
});

/**
 * Initializes express app
 */

if (appConfig.server.port) {
  app.set('port', appConfig.server.port);
} else {
  app.set('port', process.env.PORT);
}

app.use(express.static(__dirname + '/../' + appConfig.server.root));
console.log('Express server serving directory ' + appConfig.server.root);

app.listen(app.get('port'), function() {
  console.log('Express server listening on port ' + app.get('port'));
});

/**
 * API: test page
 */

app.all('/test*', function(req, res) {

  console.log('Test page requested');
  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify([]));

});
