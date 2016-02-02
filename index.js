/* global document */

var querystring = require('querystring');
var cheerio = require('cheerio');
var extend = require('util-extend');
var phantom = require('phantom');
var url = require('url');

var options = {
    url: 'http://guides.ucsf.edu/srch.php'
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

    var myUrl = options.url + '?' + querystring.stringify({q: query.searchTerm});
    if (options.urlParameters) {
        myUrl += '&' + querystring.stringify(options.urlParameters);
    }

    var err, rv;

    // LibGuides API results do not match search page results.
    // Search page uses JavaScript to show results.
    // So, let's use a headless browser...

    var phantomOptions = {
        parameters: {'web-security': 'no'},
        binary: './node_modules/.bin/phantomjs'
    };

    phantom.create(phantomOptions, function (ph) {
        ph.createPage(function (page) {
            page.open(myUrl, function (status) {
                if (status === 'success') {
                    page.evaluate(
                        function () {
                            // $lab:coverage:off$
                            var el = document.getElementById('s-lg-srch-list');
                            return el && el.innerHTML;
                            // $lab:coverage:on$
                        },
                        function (rawHtml) {
                            ph.process.stdin.pause();
                            ph.process.stdout.pause();
                            ph.exit();

                            var result = [];

                            if (rawHtml) {
                                var $ = cheerio.load(rawHtml);

                                var rawResults = $('.s-lg-srch-listing-t a');
                    
                                rawResults.each(function () {
                                    result.push({
                                        name: $(this).text(),
                                        url: url.resolve(myUrl, $(this).attr('href'))
                                    });
                                });                        
                            }
                            
                            rv = {data: result, url: myUrl};
                            callback(null, rv);
                        }
                    );
                } else {
                    ph.process.stdin.pause();
                    ph.process.stdout.pause();
                    ph.exit();
                    err = new Error('page load failed: ' + myUrl);
                    callback(err);
                }
            });
        });
    });
};
