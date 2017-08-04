const R = require('ramda');
const moment = require('moment');
const api = require('./api');
const store = require('./store');
const config = require('./config');
const debug = require('debug')('freckle');

async function update() {

    // Load entries
    let from = moment()
        .milliseconds(-config.updatePeriod)
        .hours(0)
        .minutes(0)
        .seconds(0)
        .milliseconds(0);

    const minDateLimit = moment(config.startDate);

    if (from.isBefore(minDateLimit)) from = minDateLimit;

    debug(`Loading time entries from: ${from}`);

    const entries = await api.loadEntries(from);

    debug(`Loaded ${entries.length} time entries`);

    // Calculate totals
    const totals = calculateDailyTotals(entries);

    // Remove totals since minimum date
    const minTimestamp = R.pipe(
        R.map(R.prop('timestamp')),
        R.reduce(R.min, Infinity)
    )(totals);

    debug(`Deleting totals since ${moment(minTimestamp)}`);

    store.deleteTotalsSince(minTimestamp);

    // Save new totals
    debug(`Inserting ${totals.length} totals`);
    store.insertTotals(totals);
    store.save();
}

function calculateDailyTotals(entries) {

    const isSameYear = (d1, d2) => d1.year() == d2.year();
    const isSameMonth = (d1, d2) => d1.month() == d2.month();
    const isSameDay = (d1, d2) => d1.date() == d2.date();
    const isSameDate = R.allPass([isSameYear, isSameMonth, isSameDay]);

    const uniqueDates = R.pipe(
        R.map(R.prop('date')),
        R.uniqWith(isSameDate)
    )(entries);

    return uniqueDates.map(date => {

        const sumDurations = R.pipe(
            R.map(R.prop('duration')),
            R.sum
        );
        const entryMatchesDate = entry => isSameDate(entry.date, date);
        const entriesForDate = entries.filter(entryMatchesDate);

        return {
            timestamp: date.valueOf(),
            required: config.getRequiredTime(date),
            actual: sumDurations(entriesForDate)
        };
    });
}

module.exports = {
    update
};
