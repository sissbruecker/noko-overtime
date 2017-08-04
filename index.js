#!/usr/bin/env node
const updater = require('./lib/updater');
const store = require('./lib/store');
const calculator = require('./lib/calculator');
const config = require('./lib/config');

store
    .init()
    .then(updater.update)
    .then(() => {
        const totalSummary = calculator.getTotalSummary();
        const weekSummary = calculator.getWeekSummary();

        const totalDiffHours = (totalSummary.difference / 1000 / 60 / 60).toFixed(1);
        const totalDiffDays = (totalSummary.difference / config.workPerDay).toFixed(1);

        const weekDiffHours = (weekSummary.difference / 1000 / 60 / 60).toFixed(1);
        const weekDiffDays = (weekSummary.difference / config.workPerDay).toFixed(1);

        console.log(`Total (${totalDiffHours}h, ${totalDiffDays}d)`);
        console.log(`Week (${weekDiffHours}h, ${weekDiffDays}d)`);
    });
