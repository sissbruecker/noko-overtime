const chalk = require('chalk');
const config = require('./config');

const header = chalk.hex('#31c5e0').underline;
const headerBold = header.bold;
const data = chalk.hex('#f160a2');
const dataBold = data.bold;

function displaySummary(totalSummary, weekSummary) {

    const formattedTotal = {
        hours: `${(totalSummary.difference / 1000 / 60 / 60).toFixed(1)}h`,
        days: `${(totalSummary.difference / config.workPerDay).toFixed(1)}d`
    };

    const formattedWeek = {
        hours: `${(weekSummary.difference / 1000 / 60 / 60).toFixed(1)}h`,
        days: `${(weekSummary.difference / config.workPerDay).toFixed(1)}d`
    };

    console.log(`\t\t${header('Hours')}\t\t${header('Days')}`);
    console.log(`\t${header('Week')}\t${data(formattedWeek.hours)}\t\t${data(formattedWeek.days)}`);
    console.log(`\t${headerBold('Total')}\t${dataBold(formattedTotal.hours)}\t\t${dataBold(formattedTotal.days)}`);
}


module.exports = {
    displaySummary
};
