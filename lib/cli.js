const program = require('commander');
const store = require('./store');
const config = require('./config');
const commands = require('./commands');

// Program definition
program
    .version('0.1.0');

// Configure command
program.command('configure')
    .alias('conf')
    .description('Configure freckle authentication and overtime calculation')
    .action(commands.configure);

// Update command
program
    .command('update')
    .description('(default) Update time entries and display overtime')
    .action(commands.update);

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
