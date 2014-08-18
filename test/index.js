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

// function getEnvProxy() {
//   return {
//     host: env.http_proxy || env.HTTP_PROXY || env.https_proxy || env.HTTPS_PROXY,
//     noproxy: env.no_proxy || env.NO_PROXY || 'localhost,127.0.0.1'    
//   };
// }
function clearEnvProxy() {
  delete env.http_proxy;
  delete env.HTTP_PROXY;
  delete env.https_proxy;
  delete env.HTTPS_PROXY;
  delete env.no_proxy;
  delete env.NO_PROXY;
}
function setEnvProxy() {
  env.http_proxy = 'a';
  env.HTTP_PROXY = 'b';
  env.https_proxy = 'c';
  env.HTTPS_PROXY = 'd';
  env.no_proxy = 'e';
  env.NO_PROXY = 'f';
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
  before(
    setEnvProxy
  );
  after(
    restoreEnvProxy
  );
  describe('#request-proxy-helper(requestOptions, proxyConfig)', function() {
    it('should return empty object when called without requestOptions', function(){
      expect(proxyHelper(undefined)).to.deep.equal({}).and.not.have.property('proxy');
      expect(proxyHelper(undefined, {})).to.deep.equal({}).and.not.have.property('proxy');
      expect(proxyHelper(undefined, {host: 'foo'})).to.deep.equal({}).and.not.have.property('proxy');
    });
    it('should return requestOptions when called without requestOptions.url', function(){
      expect(proxyHelper({})).to.deep.equal({}).and.not.have.property('proxy');
      expect(proxyHelper({foo:'bar'})).to.deep.equal({foo:'bar'}).and.not.have.property('proxy');
    });
    it('should return requestOptions with https environment proxy added when called without proxyConfig.host', function(){
      var opts = {url:'https://foo.com'};
      expect(proxyHelper(opts, undefined)).to.deep.equal(
        _.extend(opts, { proxy: env.https_proxy || env.HTTPS_PROXY || env.http_proxy || env.HTTP_PROXY }));
      expect(proxyHelper(opts, {})).to.deep.equal(
        _.extend(opts, { proxy: env.https_proxy || env.HTTPS_PROXY || env.http_proxy || env.HTTP_PROXY }));
      expect(proxyHelper(opts, {foo:'bar'})).to.deep.equal(
        _.extend(opts, { proxy: env.https_proxy || env.HTTPS_PROXY || env.http_proxy || env.HTTP_PROXY }));
    });
    it('should return requestOptions with http environment proxy added when called without proxyConfig.host', function(){
      var opts = {url:'http://foo.com'};
      expect(proxyHelper(opts, undefined)).to.deep.equal(
        _.extend(opts, { proxy: env.http_proxy || env.HTTP_PROXY }));
      expect(proxyHelper(opts, {})).to.deep.equal(
        _.extend(opts, { proxy: env.http_proxy || env.HTTP_PROXY }));
      expect(proxyHelper(opts, {foo:'bar'})).to.deep.equal(
        _.extend(opts, { proxy: env.http_proxy || env.HTTP_PROXY }));
    });
    it('should return requestOptions when called with proxyConfig=false', function(){
      var opts = {url:'foo'};
      expect(proxyHelper(opts, false)).to.deep.equal(opts).and.not.have.property('proxy');
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
      expect(proxyHelper(opts).proxy).to.be.undefined;
      expect(proxyHelper(opts,{}).proxy).to.be.undefined;
      expect(proxyHelper(opts,{foo:'bar'}).proxy).to.be.undefined;
      // expect(proxyHelper(opts, {}).proxy).to.equal(getEnvProxy().host);
      restoreEnvProxy();
    });
  });
  xdescribe('add tests for noproxy settings', function() {
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
      expect(proxyHelper(undefined)).to.deep.equal({}).and.not.have.property('proxy');
      expect(proxyHelper(undefined, {})).to.deep.equal({}).and.not.have.property('proxy');
      expect(proxyHelper(undefined, {host: 'foo'})).to.deep.equal({}).and.not.have.property('proxy');
    });
    it('should return requestOptions when called without requestOptions.url', function(){
      expect(proxyHelper({})).to.deep.equal({}).and.not.have.property('proxy');
      expect(proxyHelper({foo:'bar'})).to.deep.equal({foo:'bar'}).and.not.have.property('proxy');
    });
    it('should return requestOptions when called without proxyConfig.host', function(){
      var opts = {url:'foo'};
      expect(proxyHelper(opts, undefined).proxy).to.be.undefined;
      expect(proxyHelper(opts, {}).proxy).to.be.undefined;
      expect(proxyHelper(opts, {foo:'bar'}).proxy).to.be.undefined;
    });
    it('should return requestOptions when called with proxyConfig=false', function(){
      var opts = {url:'foo'};
      expect(proxyHelper(opts, false)).to.deep.equal(opts).and.not.have.property('proxy');
    });
    it('should return requestOptions with config proxy added when called with proxyConfig.host', function(){
      var opts = {url:'foo'};
      expect(proxyHelper(opts, {host:'bar'})).to.deep.equal(
        _.extend(opts, { proxy: 'bar' }));
    });
  });
  xdescribe('add tests for noproxy settings', function() {
  });
});