/*jshint expr: true*/

var libguides = require('../index.js');

var path = require('path');

var Lab = require('lab');
var lab = exports.lab = Lab.script();

var expect = Lab.expect;
var describe = lab.experiment;
var it = lab.test;

describe('exports', function () {

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
		var myUrl = 'file://' + path.resolve(__dirname, 'fixtures/medicine.html');
		libguides.setOptions({url: myUrl});

		libguides.search({searchTerm: 'medicine'}, function (err, result) {
			expect(err).to.be.not.ok;
			expect(result.data.length).to.equal(10);
			done();
		});
	});

	it('returns an empty result if ridiculous search term is provided', function (done) {
		var myUrl = 'file://' + path.resolve(__dirname, 'fixtures/fhqwhgads.html');
		libguides.setOptions({url: myUrl});

		libguides.search({searchTerm: 'fhqwhgads'}, function (err, result) {
			expect(err).to.be.not.ok;
			expect(result.data.length).to.equal(0);
			done();
		});
	});

	it('returns an error object if there was an HTTP error', function (done) {
		var myUrl = 'file://' + path.resolve(__dirname, 'fixtures/404.html');
		libguides.setOptions({url: myUrl});

		libguides.search({searchTerm: 'medicine'}, function (err, result) {
			expect(result).to.be.not.ok;
			expect(err.message).to.equal('page load failed: ' + myUrl + '?q=medicine');
			done();
		});
	});

	it('should return a link to all results if searchUrl option is set', function (done) {
		var myUrl = 'file://' + path.resolve(__dirname, 'fixtures/medicine.html');
		libguides.setOptions({url: myUrl});

		libguides.search({searchTerm: 'medicine'}, function (err, result) {
			expect(err).to.be.not.ok;
			expect(result.url).to.equal(myUrl + '?q=medicine');
			done();
		});
	});
});
