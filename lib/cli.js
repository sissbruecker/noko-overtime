const program = require('commander');
const inquirer = require('inquirer');
const chalk = require('chalk');
const ora = require('ora');
const store = require('./store');
const config = require('./config');
const updater = require('./updater');
const calculator = require('./calculator');
const display = require('./display');
const debug = require('debug')('freckle');

const message = chalk.hex('#f160a2');

// Program definition
program
    .version('0.1.0');

// Configure command
program.command('configure')
    .alias('conf')
    .description('Configure freckle authentication and overtime calculation')
    .action(configureCommand);

// Update command
program
    .command('update')
    .description('(default) Update time entries and display overtime')
    .action(updateCommand);

// Run update command by default

// Run program
store
    .init()
    .then(() => config.init())
    .then(() => {
        if (process.argv.length == 2) {
            updateCommand();
        } else {
            program.parse(process.argv);
        }
    });


function configureCommand(options) {
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
                message: 'Enter how many hours per day you have to work',
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
            }

        ])
        .then(answers => {

            const { subDomain, apiToken, workdays, workPerDay } = answers;

            const configValues = {
                subDomain,
                apiToken,
                workdays,
                workPerDay: workPerDay * 60 * 60 * 1000 // Store as milliseconds
            };

            store.saveConfig(configValues);
            store.persist();

            if (!options || !options.suppressSuccessMessage) {
                console.log(message('Done! Run the app again to get your overtime calculated!'));
            }
        });
}

async function updateCommand() {

    if (!store.hasConfig()) {
        console.log(message('Before we can start calculating your overtime please answer the following questions first:'));
        await configureCommand({ suppressSuccessMessage: true });
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
