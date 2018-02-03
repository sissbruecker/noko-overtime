const inquirer = require('inquirer');
const chalk = require('chalk');
const ora = require('ora');
const moment = require('moment');

const store = require('./store');
const config = require('./config');
const updater = require('./updater');
const calculator = require('./calculator');
const display = require('./display');
const debug = require('debug')('freckle');

const message = chalk.hex('#f160a2');

function configure(options) {
    return inquirer
        .prompt([
            {
                type: 'input',
                message: 'Enter your Freckle sub-domain',
                name: 'subDomain',
                validate(input) {
                    return input && input.length
                        ? true
                        : 'Sub domain must not be empty';
                }
            },
            {
                type: 'password',
                message: 'Enter your Freckle API authentication token',
                name: 'apiToken',
                validate(input) {
                    return input && input.length
                        ? true
                        : 'API token must not be empty';
                }
            },
            {
                type: 'checkbox',
                message: 'Select your workdays',
                name: 'workdays',
                choices: [
                    {
                        name: 'Monday',
                        value: 1,
                        checked: true
                    },
                    {
                        name: 'Tuesday',
                        value: 2,
                        checked: true
                    },
                    {
                        name: 'Wednesday',
                        value: 3,
                        checked: true
                    },
                    {
                        name: 'Thursday',
                        value: 4,
                        checked: true
                    },
                    {
                        name: 'Friday',
                        value: 5,
                        checked: true
                    },
                    {
                        name: 'Saturday',
                        value: 6,
                        checked: false
                    },
                    {
                        name: 'Sunday',
                        value: 0,
                        checked: false
                    }
                ]
            },
            {
                type: 'input',
                message: 'How many hours per day do you have to work?',
                name: 'workPerDay',
                default: '8',
                validate(input) {
                    const hours = Math.abs(parseFloat(input));

                    return Number.isNaN(hours)
                        ? 'Please enter a valid number'
                        : true;
                },
                filter(input) {
                    return Math.abs(parseFloat(input));
                }
            },
            {
                type: 'input',
                message: 'For how many days should I reload entries on each update?',
                name: 'updatePeriod',
                default: '30',
                validate(input) {
                    const days = Math.abs(parseFloat(input));

                    return Number.isNaN(days)
                        ? 'Please enter a valid number'
                        : true;
                },
                filter(input) {
                    return Math.abs(parseFloat(input));
                }
            },
            {
                type: 'input',
                message: 'Do you want to limit entries to a certain date (YYYY-MM-DD)? Leave blank to ignore this option',
                name: 'limitDate',
                default: '',
                validate(input) {

                    if (!input) return true;

                    return moment(input).isValid()
                        ? true
                        : 'Please enter a valid date or leave empty';
                }
            }

        ])
        .then(answers => {

            const { subDomain, apiToken, workdays, workPerDay, updatePeriod, limitDate } = answers;

            const configValues = {
                subDomain,
                apiToken,
                workdays,
                workPerDay: workPerDay * 60 * 60 * 1000, // Store as milliseconds
                updatePeriod: updatePeriod * 24 * 60 * 60 * 1000, // Store as milliseconds
                limitDate
            };

            store.saveConfig(configValues);
            store.persist();

            if (!options || !options.suppressSuccessMessage) {
                console.log(message('Done! Run the app again to get your overtime calculated!'));
            }
        });
}

async function update() {

    if (!store.hasConfig()) {
        console.log(message('Before we can start calculating your overtime please answer the following questions:'));
        await configure({ suppressSuccessMessage: true });
        config.init();
    }

    const spinner = ora();
    spinner.color = 'magenta';

    spinner.start('Loading time entries...');

    try {
        await updater.update();
    } catch (error) {
        debug(error);
        spinner.fail('Sorry, I could not load your time entries from Freckle. Please make sure you have configured the correct sub-domain and API token.');
        return;
    }

    spinner.stop();

    const totalSummary = calculator.getTotalSummary();
    const weekSummary = calculator.getWeekSummary();

    display.displaySummary(totalSummary, weekSummary);
}

function clear() {
    return inquirer
        .prompt([
            {
                type: 'confirm',
                message: 'Are you sure you want to clear all overtime data?',
                name: 'confirm'
            }
        ])
        .then(answers => {
            if (answers.confirm) {
                store.resetTotals();
                store.persist();
                console.log(message('All overtime data has been removed.'));
            }
        });
}

module.exports = {
    configure,
    update,
    clear
};
