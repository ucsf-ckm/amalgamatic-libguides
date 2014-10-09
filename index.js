var querystring = require('querystring');
var cheerio = require('cheerio');
var https = require('https');
var extend = require('util-extend');

var options = {
    url: 'https://lgapi.libapps.com/widgets.php?site_id=407&widget_type=1&search_match=2&search_type=0&sort_by=count_hit&list_format=1&output_format=1&load_type=2&enable_description=0&enable_group_search_limit=0&enable_subject_search_limit=0&widget_embed_type=2&config_id=1410964327647'
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
            var $ = cheerio.load(rawData);
            var result = [];

            var rawResults = $('ul li a');
            
            rawResults.each(function () {
                result.push({
                    name: $(this).text(),
                    url: $(this).attr('href')
                });
            });
            
            callback(null, {data: result});
        });
    }).on('error', function (e) {
        callback(e);
    });
};