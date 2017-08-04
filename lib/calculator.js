const R = require('ramda');
const moment = require('moment');
const store = require('./store');
const config = require('./config');

function getTotalSummary() {

    const totals = store.selectAllTotals();

    return summarize(totals);
}

function getWeekSummary() {

    const weekStart = moment()
        .hours(0)
        .minutes(0)
        .seconds(0)
        .milliseconds(0);

    while (weekStart.day() != config.weekStart) weekStart.day(weekStart.day() - 1);

    const totals = store.selectTotalsSince(weekStart.valueOf());

    return summarize(totals);
}

function summarize(totals) {
    const totalRequiredTime = R.sum(R.map(R.prop('required'))(totals));
    const totalActualTime = R.sum(R.map(R.prop('actual'))(totals));

    return {
        required: totalRequiredTime,
        actual: totalActualTime,
        difference: totalActualTime - totalRequiredTime
    };
}

module.exports = {
    getTotalSummary,
    getWeekSummary,
};
