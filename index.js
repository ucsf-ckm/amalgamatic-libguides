var querystring = require('querystring');
var extend = require('util-extend');
var https = require('https');

// TODO: rm hard-coded site_id and key from here and test

var options = {
  url: 'http://lgapi.libapps.com/1.1/guides/?site_id=407&key=befbffce3a19371d8499b361c55f04cb&status=1',
};

exports.setOptions = function (newOptions) {
  options = extend(options, newOptions);
};

exports.search = function (query, callback) {
  'use strict';

  if (! query || ! query.searchTerm) {
    callback(null, {data: []});
    return;
  }

  var myUrl = options.url + '&' + querystring.stringify({search_terms: query.searchTerm});

  https.get(myUrl, function (res) {
    var rawData = '';

    res.on('data', function (chunk) {
      rawData += chunk;
    });

    res.on('end', function () {
      var rawResults;
      try {
        rawResults = JSON.parse(rawData);
      } catch (e) {
        return callback(e);
      }

      if (! (rawResults instanceof Array)) {
        return callback(new TypeError('response not an array'));
      }

      var result = [];

      rawResults.forEach(function (value) {
        if (typeof value === 'object' && value.name && value.url) {
          result.push({name: value.name, url: value.url});
        }
      });

      var rv = {data: result};
      if (options.searchUrl) {
        rv.url = options.searchUrl + '?' + querystring.stringify({q: query.searchTerm});
      }
      callback(null, rv);
    });
  }).on('error', function (e) {
    callback(e);
  });
};