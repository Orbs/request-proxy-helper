var expect = require('chai').expect;
var _ = require('lodash');
var url = require('url');

var proxyHelper = require('../index');

var env = process.env;
var originalEnv = {
  http_proxy: env.http_proxy,
  HTTP_PROXY: env.HTTP_PROXY,
  https_proxy: env.https_proxy,
  HTTPS_PROXY: env.HTTPS_PROXY,
  NO_PROXY: env.NO_PROXY,
  no_proxy: env.no_proxy
};

function getEnvProxy() {
  return {
    host: env.http_proxy || env.HTTP_PROXY || env.https_proxy || env.HTTPS_PROXY,
    noproxy: env.no_proxy || env.NO_PROXY || 'localhost,127.0.0.1'    
  };
}
function clearEnvProxy() {
  delete env.http_proxy;
  delete env.HTTP_PROXY;
  delete env.https_proxy;
  delete env.HTTPS_PROXY;
  delete env.no_proxy;
  delete env.NO_PROXY;
}
function restoreEnvProxy() {
  env.http_proxy = originalEnv.http_proxy;
  env.HTTP_PROXY = originalEnv.HTTP_PROXY;
  env.https_proxy = originalEnv.https_proxy;
  env.HTTPS_PROXY = originalEnv.HTTPS_PROXY;
  env.no_proxy = originalEnv.no_proxy;
  env.NO_PROXY = originalEnv.NO_PROXY;
}

describe('when proxy environment variables are defined', function() {
  describe('#request-proxy-helper(requestOptions, proxyConfig)', function() {
    it('should return empty object when called without requestOptions', function(){
      expect(proxyHelper(undefined)).to.deep.equal({});
      expect(proxyHelper(undefined, {})).to.deep.equal({});
      expect(proxyHelper(undefined, {host: 'foo'})).to.deep.equal({});
    });
    it('should return requestOptions when called without requestOptions.url', function(){
      expect(proxyHelper({})).to.deep.equal({});
      expect(proxyHelper({foo:'bar'})).to.deep.equal({foo:'bar'});
    });
    it('should return requestOptions with environment proxy added when called without proxyConfig.host', function(){
      var opts = {url:'foo'};
      expect(proxyHelper(opts, undefined)).to.deep.equal(
        _.extend(opts, { proxy: getEnvProxy().host }));
      expect(proxyHelper(opts, {})).to.deep.equal(
        _.extend(opts, { proxy: getEnvProxy().host }));
      expect(proxyHelper(opts, {foo:'bar'})).to.deep.equal(
        _.extend(opts, { proxy: getEnvProxy().host }));
    });
    it('should return requestOptions when called with proxyConfig=false', function(){
      var opts = {url:'foo'};
      expect(proxyHelper(opts, false)).to.deep.equal(opts);
    });
    it('should return requestOptions with config proxy added when called with proxyConfig.host', function(){
      var opts = {url:'foo'};
      expect(proxyHelper(opts, {host:'bar'})).to.deep.equal(
        _.extend(opts, { proxy: 'bar' }));
    });
    // TODO: Make this work -- module appears to have bugs related
    // to environment no_proxy settings
    xit('should return requestOptions when called with requestOptions.host contained in environment NO_PROXY', function(){
      env.no_proxy = 'bar,foo';
      var opts = {url:'https://foo/path/to/file.js'};
      console.log(proxyHelper(opts));
      console.log(proxyHelper(opts, {}));
      console.log(getEnvProxy().noproxy);
      console.log(url.parse(opts.url).hostname);

      expect(proxyHelper(opts).proxy).to.be.undefined;
      expect(proxyHelper(opts,{}).proxy).to.be.undefined;
      expect(proxyHelper(opts,{foo:'bar'}).proxy).to.be.undefined;
      // expect(proxyHelper(opts, {}).proxy).to.equal(getEnvProxy().host);
      restoreEnvProxy();
    });
  });
});

describe('when proxy environment variables are undefined', function() {
  before(
    clearEnvProxy
  );
  after(
    restoreEnvProxy
  );
  describe('#request-proxy-helper(requestOptions, proxyConfig)', function() {
    it('should return empty object when called without requestOptions', function(){
      expect(proxyHelper(undefined)).to.deep.equal({});
      expect(proxyHelper(undefined, {})).to.deep.equal({});
      expect(proxyHelper(undefined, {host: 'foo'})).to.deep.equal({});
    });
    it('should return requestOptions when called without requestOptions.url', function(){
      expect(proxyHelper({})).to.deep.equal({});
      expect(proxyHelper({foo:'bar'})).to.deep.equal({foo:'bar'});
    });
    it('should return requestOptions when called without proxyConfig.host', function(){
      var opts = {url:'foo'};
      expect(proxyHelper(opts, undefined).proxy).to.be.undefined;
      expect(proxyHelper(opts, {}).proxy).to.be.undefined;
      expect(proxyHelper(opts, {foo:'bar'}).proxy).to.be.undefined;
    });
    it('should return requestOptions when called with proxyConfig=false', function(){
      var opts = {url:'foo'};
      expect(proxyHelper(opts, false)).to.deep.equal(opts);
    });
    it('should return requestOptions with config proxy added when called with proxyConfig.host', function(){
      var opts = {url:'foo'};
      expect(proxyHelper(opts, {host:'bar'})).to.deep.equal(
        _.extend(opts, { proxy: 'bar' }));
    });
  });
});