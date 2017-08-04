/**
 * Created by Sascha on 07.12.14.
 */
requirejs.config({

    paths: {
        'jquery': '../../bower_components/jquery/dist/jquery.min',
        'moment': '../../bower_components/moment/min/moment.min',
        'loki': '../../bower_components/lokijs/build/lokijs.min',
        'ramda': '../../bower_components/ramda/ramda.min'
    }
});

// Load global libs
requirejs([
    'jquery'
], function() {

    // Main program
    requirejs([
        'store',
        'updater',
        'calculator',
        'config'
    ], function(store, updater, calculator, config) {

        // Create tray / menu
        var gui = require('nw.gui');

        var tray = new gui.Tray({ title: '⌚'});
        var menu = new gui.Menu();

        var weeklyMenuItem = new gui.MenuItem({ label: 'Week', enabled: false });
        var totalMenuItem = new gui.MenuItem({ label: 'Total', enabled: false });
        var refreshMenuItem = new gui.MenuItem({ label: 'Refresh...'});
        var closeMenuItem = new gui.MenuItem({ label: 'Close'});
        var resetMenuItem = new gui.MenuItem({ label: 'Reset cache'});

        menu.append(weeklyMenuItem);
        menu.append(totalMenuItem);
        menu.append(new gui.MenuItem({ type: 'separator'}));
        menu.append(refreshMenuItem);
        menu.append(closeMenuItem);
        menu.append(new gui.MenuItem({ type: 'separator'}));
        menu.append(resetMenuItem);

        tray.menu = menu;

        // Exit application when close is clicked
        closeMenuItem.click = function() {
            gui.App.quit();
        };

        // Execute update when refresh is clicked
        refreshMenuItem.click = function() {
            updater.update();
        };

        // Reset store when reset is clicked
        resetMenuItem.click = function() {
            store.reset();
            store.save();
        };

        // Update labels when updater is running
        $(updater).on('updateStarted', function() {
            refreshMenuItem.label = 'Loading...';
            refreshMenuItem.enabled = false;
        });

        $(updater).on('updateFinished', function() {
            updateTotalSummary();
            updateWeeklySummary();
            refreshMenuItem.label = 'Refresh';
            refreshMenuItem.enabled = true;
        });

        var updateTotalSummary = function() {
            var summary = calculator.getTotalSummary();
            var differenceHours = (summary.difference / 1000 / 60 / 60).toFixed(1);
            var differenceDays = (summary.difference / config.workPerDay).toFixed(1);

            totalMenuItem.label = 'Total (' + differenceHours + 'h, ' + differenceDays + 'd)';
        };

        var updateWeeklySummary = function() {
            var summary = calculator.getWeekSummary();
            var differenceHours = (summary.difference / 1000 / 60 / 60).toFixed(1);
            var differenceDays = (summary.difference / config.workPerDay).toFixed(1);

            weeklyMenuItem.label = 'Week (' + differenceHours + 'h, ' + differenceDays + 'd)';
        };

        updateWeeklySummary();
        updateTotalSummary();
    });
});

