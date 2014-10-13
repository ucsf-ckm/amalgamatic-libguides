/* global document */

var querystring = require('querystring');
var cheerio = require('cheerio');
var extend = require('util-extend');
var phantom = require('phantom');
var url = require('url');

var options = {
    url: 'http://guides.ucsf.edu/srch.php'};

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

    var err, rv;

    // LibGuides API results do not match search page results.
    // Search page uses JavaScript to show results.
    // So, let's use a headless browser...

    phantom.create(function (ph) {
        ph.createPage(function (page) {
            page.open(myUrl, function (status) {
                if (status === 'success') {
                    page.evaluate(
                        function () {
                            var el = document.getElementById('s-lg-srch-list');
                            return el && el.innerHTML;
                        },
                        function (rawHtml) {
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
                            ph.exit();
                        }
                    );
                } else {
                    err = new Error('page load failed: ' + myUrl);
                    callback(err);
                }
            });
        });
    });
};
