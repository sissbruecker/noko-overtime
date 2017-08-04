/**
 * Created by Sascha on 06.12.14.
 */
define([
    'moment'
], function (moment) {

    var config = {

        freckleSubDomain: '<your-subdomain>',
        freckleApiToken: '<your-api-token>',

        workdays: [1, 2, 3, 4, 5], // Sunday = 0 ... Saturday = 6
        workPerDay: 7 * 60 * 60 * 1000, // How much work per day (milliseconds)

        weekStart: 1, // Monday

        updatePeriod: 30 * 24 * 60 * 60 * 1000, // Load time entries for this period (milliseconds)
        startDate: '2016-01-01'
    };

    config.getRequiredTime = function (timestamp) {

        var day = moment(timestamp).day();

        return this.workdays.indexOf(day) >= 0 ? this.workPerDay : 0;
    };

    return config;
});
