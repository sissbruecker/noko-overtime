const { promisify } = require('util');
const moment = require('moment');
const request = require('request');
const R = require('ramda');
const config = require('./config');

const requestPromise = promisify(request);

function loadEntries(from) {

    const params = {};

    if (from) {
        params['search[from]'] = moment(from).format('YYYY-MM-DD');
    }

    const options = createRequest('entries.json', params);

    return executePagedRequest(options)
        .then(parseEntries);
}

function createRequest(resource, params) {

    const hasParams = params && Object.keys(params).length > 0;
    const urlParams = hasParams ?
        R.pipe(
            R.toPairs,
            R.map(R.join('=')),
            R.join('&'),
            R.concat('?')
        )(params)
        : '';

    const url = `https://${config.freckleSubDomain}.letsfreckle.com/api/${resource}${urlParams}`;

    return {
        url,
        headers: {
            'X-FreckleToken': config.freckleApiToken
        }
    };
}

function executePagedRequest(options) {

    let results = [];

    function loadPage(pageOptions) {

        return requestPromise(pageOptions)
            .then(response => {

                const items = JSON.parse(response.body);

                results = R.concat(results, items);

                const nextPageLink = response.headers.link;

                if (nextPageLink) {

                    const nextPageOptions = Object.assign({}, pageOptions, {
                        url: extractNextPageUrl(nextPageLink)
                    });

                    return loadPage(nextPageOptions);
                }

                return null;
            });
    }

    return loadPage(options)
        .then(() => results);
}

function extractNextPageUrl(link) {
    return link.substring(1, link.indexOf(';') - 1);
}

function parseEntries(freckleEntries) {
    return freckleEntries.map(freckleEntry => {

        const date = moment(freckleEntry.entry.date);
        const duration = freckleEntry.entry.minutes * 60 * 1000;

        return {
            date,
            duration
        };
    });
}

module.exports = {
    loadEntries
};
