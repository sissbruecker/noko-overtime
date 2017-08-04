#!/usr/bin/env node
const ora = require('ora');
const updater = require('./lib/updater');
const store = require('./lib/store');
const calculator = require('./lib/calculator');
const display = require('./lib/display');

const spinner = ora();
spinner.color = 'magenta';

store
    .init()
    .then(() => spinner.start('Loading time entries...'))
    .then(updater.update)
    .then(() => spinner.stop())
    .then(() => {
        const totalSummary = calculator.getTotalSummary();
        const weekSummary = calculator.getWeekSummary();

        display.displaySummary(totalSummary, weekSummary);
    });
