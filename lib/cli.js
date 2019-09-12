const program = require('commander');
const store = require('./store');
const config = require('./config');
const commands = require('./commands');

// Program definition
program
    .version('1.0.0');

// Configure command
program.command('configure')
    .alias('conf')
    .description('Configure Noko authentication and overtime calculation')
    .action(commands.configure);

// Update command
program
    .command('update')
    .description('(default) Update time entries and display overtime')
    .action(commands.update);

// Clear command
program
    .command('clear')
    .description('Remove all calculated overtime data.\n\n' +
        '\t\tThis does not affect any time entries made in Noko,\n' +
        '\t\tit only removes the locally calculated overtime totals.\n' +
        '\t\tThis may be useful if you need to force a recalculation\n' +
        '\t\tafter changing parameters like working hours.')
    .action(commands.clear);

// Run program
store
    .init()
    .then(() => config.init())
    .then(() => {
        if (process.argv.length == 2) {
            // Run update command by default (if there is no command param)
            commands.update();
        } else {
            program.parse(process.argv);
        }
    });
