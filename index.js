var url = require('url');

var env = process.env;

// Caching environment variables on module load made this module much more 
// difficult to test. This code was originally used:
//
// var envProxy = {
//   host: env.http_proxy || env.HTTP_PROXY || env.https_proxy || env.HTTPS_PROXY,
//   noproxy: env.no_proxy || env.NO_PROXY || 'localhost,127.0.0.1'
// };

// The code above was replaced with the getEnvProxy() function that looks up 
// env variables in realtime. This was necessary since tests had to modify
// env vars after this module was loaded. 

// The cached approach was failing because this module was loaded before env 
// variables were cleared in the tests, so this module would still use the 
// original env proxy setting even though tests thought no proxy was set.

// This solution is probably not the best, since it changes the implementation
// to accomodate a test, and the change is slightly less performant. However, 
// the code in question is really not in the critical path, and it should be
// acceptable for now. 

// To solve this issue and use the cache approach, may want to try unloading 
// this module from within the test and then reloading it. See here for ideas:
// http://stackoverflow.com/questions/9210542/node-js-require-cache-possible-to-invalidate/14801711#14801711
// http://blog.gleitzman.com/post/63925446383/play-it-again-sam-reloading-node-js-modules

function getEnvProxy() {
  return {
    host: env.http_proxy || env.HTTP_PROXY || env.https_proxy || env.HTTPS_PROXY,
    noproxy: env.no_proxy || env.NO_PROXY || 'localhost,127.0.0.1'    
  };
}

/*
  Return true if requestUrl has a hostname listed in noproxy values. If noproxy is truthy, then the 
  value of it is assumed to contain a comma-delimited list of hostnames that should not be proxied.
  If noproxy is falsey, then the current NO_PROXY environment variable value is used. If it is also
  falsey, then the default hostnames of 'localhost,127.0.0.1' won't be proxied.
*/
function ignoreProxy(requestUrl, noproxy) {
  return (noproxy || getEnvProxy().noproxy).split(',').indexOf(url.parse(requestUrl).hostname) !== -1;
}

/*
  Augments requestOptions object with a proxy property if proxy settings indicate that 
  the requestOptions.url should be proxied. When proxyConfig is explicitly set to false, 
  then skip proxy regardless of env settings. Otherwise, proxyConfig overrides env settings.
  When proxyConfig is undefined or falsey, but not false, then env settings are used.

  @param requestOptions
    see mikeal/request, should contain at least url

  @param proxyOpt
    {
      host: 'proxy.host.name:port',
      noproxy: 'no.proxy.host,127.0.0.1,localhost'
    }
*/
module.exports = function (requestOptions, proxyConfig) {
  requestOptions = requestOptions || {};
  if (requestOptions.url && !proxyConfig && proxyConfig !== false) {
    // proxyConfig is falsey but it not explicitly set to false
    // use environment proxy settings
    var host = getEnvProxy().host;
    if (host) {
      requestOptions.proxy = host;
    }
  }
  if (requestOptions.url && proxyConfig && proxyConfig.host && !ignoreProxy(requestOptions.url, proxyConfig.noproxy)) {
    // proxyConfig is defined and the current request should be proxied
    // add proxy to requestObject from proxyConfig or environment
    var host = proxyConfig.host || getEnvProxy().host;
    if (host) {
      requestOptions.proxy = host;
    }
  }
  return requestOptions;
}
