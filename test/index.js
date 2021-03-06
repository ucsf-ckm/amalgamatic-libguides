/*jshint expr: true*/

var libguides = require('../index.js');

var path = require('path');

var Lab = require('lab');
var lab = exports.lab = Lab.script();

var expect = require('code').expect;
var describe = lab.experiment;
var it = lab.test;
var after = lab.after;

// Set up web server for PhantomJS to interact with
var liveServer = require('live-server');
liveServer.start({
    root: path.resolve(__dirname, 'fixtures'),
    open: false
});

describe('exports', function () {

	after(function (done) {
		// delete variables leaked by live-server (only used for testing)
		delete global.numberOfOpenProcesses;
		delete global.waitingToOpenProcessDelay;
		delete global.maxNumberOfOpenProcesses;
		delete global.maxNumberOfOpenFiles;
		delete global.waitingToOpenFileDelay;
		delete global.numberOfOpenFiles;
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
		var myUrl = 'http://0.0.0.0:8080/medicine.html';
		libguides.setOptions({url: myUrl});

		libguides.search({searchTerm: 'medicine'}, function (err, result) {
			expect(err).to.be.not.ok;
			expect(result.data.length).to.equal(10);
			done();
		});
	});

	it('returns an empty result if ridiculous search term is provided', function (done) {
		var myUrl = 'http://0.0.0.0:8080/fhqwhgads.html';
		libguides.setOptions({url: myUrl});

		libguides.search({searchTerm: 'fhqwhgads'}, function (err, result) {
			expect(err).to.be.not.ok;
			expect(result.data.length).to.equal(0);
			done();
		});
	});

	it('returns an error object if PhantomJS returns failure', function (done) {
		var myUrl = 'file:///404.html'; // this is a file that does not exist
		libguides.setOptions({url: myUrl});

		libguides.search({searchTerm: 'medicine'}, function (err, result) {
			expect(result).to.be.not.ok;
			expect(err.message).to.equal('page load failed: ' + myUrl + '?q=medicine');
			done();
		});
	});

	it('returns an empty object if there was an HTTP error', function (done) {
		var myUrl = 'http://0.0.0.0:8080/404.html'; // URL does not exist, returns 404
		libguides.setOptions({url: myUrl});

		libguides.search({searchTerm: 'medicine'}, function (err, result) {
			expect(result).to.deep.equal({
				data: [], 
				url: 'http://0.0.0.0:8080/404.html?q=medicine'
      		});
			expect(err).to.be.null(); // alas, this is not actually ideal
			done();
		});
	});

	it('should return a link to all results', function (done) {
		var myUrl = 'http://0.0.0.0:8080//medicine.html';
		libguides.setOptions({url: myUrl});

		libguides.search({searchTerm: 'medicine'}, function (err, result) {
			expect(err).to.be.not.ok;
			expect(result.url).to.equal(myUrl + '?q=medicine');
			done();
		});
	});

	it('should expand URL to include a hostname', function (done) {
		var myUrl = 'http://0.0.0.0:8080//medicine.html';
		libguides.setOptions({url: myUrl});

		libguides.search({searchTerm: 'medicine'}, function (err, result) {
			var urlRegExp = /^file:\/\//;

			expect(err).to.be.not.ok;
			result.data.forEach(function (elem) {
				expect(urlRegExp.test(elem.url)).to.be.ok;
			});
			done();
		});
	});

	it('should allow us to send it extra url parameters', function (done) {
		var myUrl = 'http://0.0.0.0:8080/params.html';
		var myParams = {comeOn: 'fhqwhgads'};

		libguides.setOptions({url: myUrl, urlParameters: myParams});
		libguides.search({searchTerm: 'params'}, function (err, result) {
			expect(result.data.length).to.equal(10);
			done();
		});
	});

	it('should work from a different directory', function (done) {
		process.chdir('..');
		var myUrl = 'http://0.0.0.0:8080/medicine.html';
		libguides.setOptions({url: myUrl});

		libguides.search({searchTerm: 'medicine'}, function (err, result) {
			expect(err).to.be.not.ok;
			expect(result.data.length).to.equal(10);
			done();
		});
	});
});
