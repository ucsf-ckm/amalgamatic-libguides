/*jshint expr: true*/

var libguides = require('../index.js');

var nock = require('nock');
var path = require('path');

var Lab = require('lab');
var lab = exports.lab = Lab.script();

var Code = require('code');

var expect = Code.expect;
var describe = lab.experiment;
var it = lab.test;
var beforeEach = lab.beforeEach;

describe('exports', function () {

  beforeEach(function (done) {
    nock.cleanAll();
    nock.disableNetConnect();
    done();
  });

  it('returns an empty result if no search term provided', function (done) {
    libguides.search({searchTerm: ''}, function (err, result) {
      expect(err).to.be.not.ok;
      expect(result).to.deep.equal({data: []});
      done();
    });
  });

  it('returns an empty result if no first argument provided', function (done) {
    libguides.search(null, function (err, result) {
      expect(err).to.be.not.ok;
      expect(result).to.deep.equal({data: []});
      done();
    });
  });

  it('returns results if a non-ridiculous search term is provided', function (done) {
    nock('https://lgapi.libapps.com')
      .get('/1.1/guides/?site_id=407&key=befbffce3a19371d8499b361c55f04cb&status=1&search_terms=medicine')
      .replyWithFile(200, path.resolve(__dirname, 'fixtures/medicine.html'));
    
    libguides.search({searchTerm: 'medicine'}, function (err, result) {
      expect(err).to.be.null();
      expect(result.data.length).to.equal(3);
      done();
    });
  });

  it('returns an empty result if ridiculous search term is provided', function (done) {
    nock('https://lgapi.libapps.com')
      .get('/1.1/guides/?site_id=407&key=befbffce3a19371d8499b361c55f04cb&status=1&search_terms=fhqwhgads')
      .replyWithFile(200, path.resolve(__dirname, 'fixtures/fhqwhgads.html'));

    libguides.search({searchTerm: 'fhqwhgads'}, function (err, result) {
      expect(err).to.be.not.ok;
      expect(result.data.length).to.equal(0);
      done();
    });
  });

  it('returns an error object if there was an HTTP error', function (done) {
    nock('https://lgapi.libapps.com')
      .get('/1.1/guides/?site_id=407&key=befbffce3a19371d8499b361c55f04cb&status=1&search_terms=medicine')
      .replyWithError('page load failed');

    libguides.search({searchTerm: 'medicine'}, function (err, result) {
      expect(result).to.be.not.ok;
      expect(err.message).to.equal('page load failed');
      done();
    });
  });

  it('should return a link to all results', function (done) {
    nock('https://lgapi.libapps.com')
      .get('/1.1/guides/?site_id=407&key=befbffce3a19371d8499b361c55f04cb&status=1&search_terms=medicine')
      .replyWithFile(200, path.resolve(__dirname, 'fixtures/medicine.html'));

    libguides.setOptions({searchUrl: 'http://guides.ucsf.edu/srch.php'});

    libguides.search({searchTerm: 'medicine'}, function (err, result) {
      expect(err).to.be.not.ok;
      expect(result.url).to.equal('http://guides.ucsf.edu/srch.php?q=medicine');
      done();
    });
  });

  it('returns a SyntaxError if JSON is malformed', function (done) {
    nock('https://lgapi.libapps.com')
      .get('/1.1/guides/?site_id=407&key=befbffce3a19371d8499b361c55f04cb&status=1&search_terms=medicine')
      .reply(200, '{');
    
    libguides.search({searchTerm: 'medicine'}, function (err, result) {
      expect(err instanceof SyntaxError).to.be.ok;
      expect(result).to.be.undefined();
      done();
    });
  });

  it('returns a TypeError if JSON is not an array', function (done) {
    nock('https://lgapi.libapps.com')
      .get('/1.1/guides/?site_id=407&key=befbffce3a19371d8499b361c55f04cb&status=1&search_terms=medicine')
      .reply(200, '{}');
    
    libguides.search({searchTerm: 'medicine'}, function (err, result) {
      expect(err instanceof TypeError).to.be.ok;
      expect(result).to.be.undefined();
      done();
    });
  });

  it('should skip incomplete results', function (done) {
    nock('https://lgapi.libapps.com')
      .get('/1.1/guides/?site_id=407&key=befbffce3a19371d8499b361c55f04cb&status=1&search_terms=medicine')
      .reply(200, '["fhqwhgads", {}, {"name": "fhqwhgads"}]');
    
    libguides.search({searchTerm: 'medicine'}, function (err, result) {
      expect(err).to.be.null();
      expect(result.data.length).to.equal(0);
      done();
    });    
  });
});
