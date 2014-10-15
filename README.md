amalgamatic-libguides
=====================

[LibGuides](http://www.springshare.com/libguides/) plugin for [Amalgamatic](https://github.com/ucsf-ckm/amalgamatic)

## Installation

Install amalgamatic and this plugin via `npm`:

`npm install amalgamatic amalgamatic-libguides`

## Usage

````
var amalgamatic = require('amalgamatic'),
    libguides = require('amalgamatic-libguides');

// Set the URL to point to your LibGuides search page
libguides.setOptions({url: 'http://guides.ucsf.edu/srch.php'});

// Add this plugin to your Amalgamatic instance along with any other plugins you've configured.
amalgamatic.add('libguides', libguides);

//Use it!
var callback = function (err, results) {
    if (err) {
        console.dir(err);
    } else {
        results.forEach(function (result) {
            console.log(result.name);
            console.dir(result.data);
        });
    }
};

amalgamatic.search({searchTerm: 'medicine'}, callback);
````

## Requirements

This uses `phantomjs` to scrape the search page because the LibGuides API does not return the same results in the same order. Therefore, you must have `phantomjs` installed to use this plugin.
