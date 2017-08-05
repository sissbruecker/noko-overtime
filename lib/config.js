const moment = require('moment');
const store = require('./store');

let configValues;

module.exports = {
    init() {
        if (!store.hasConfig()) return;

        configValues = store.loadConfig();
    },
    get subDomain() {
        return configValues.subDomain;
    },
    get apiToken() {
        return configValues.apiToken;
    },
    get workdays() {
        return configValues.workdays;
    },
    get workPerDay() {
        return configValues.workPerDay;
    },
    get weekStart() {
        return 1; // Monday
    },
    get updatePeriod() {
        return 6 * 30 * 24 * 60 * 60 * 1000; // Load time entries for this period (milliseconds)
    },
    get startDate() {
        return '2017-04-01'; // Load entries since this date
    },
    getRequiredTime(timestamp) {

        const day = moment(timestamp).day();

        return this.workdays.indexOf(day) >= 0 ? this.workPerDay : 0;
    }
};
