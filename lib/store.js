const os = require('os');
const path = require('path');
const R = require('ramda');
const Loki = require('lokijs');
const debug = require('debug')('freckle');

const homeDir = os.homedir();
const dbLocation = path.join(homeDir, '.freckle-overtime.db');

let db;
let totalsCollection;
let configCollection;

function init() {
    return new Promise(resolve => {

        debug(`Using DB at: ${dbLocation}`);

        db = new Loki(dbLocation, {
            autoload: true,
            autoloadCallback: R.pipe(handleLoaded, resolve)
        });

        function handleLoaded() {
            totalsCollection = db.getCollection('totals') || db.addCollection('totals');
            configCollection = db.getCollection('config') || db.addCollection('config');
        }
    });
}

function selectAllTotals() {
    return totalsCollection.find();
}

function selectTotalsSince(from) {
    return totalsCollection.find({ timestamp: { $gte: from } });
}

function selectLatestTotal() {

    const latest = totalsCollection.maxRecord('timestamp');

    return totalsCollection.get(latest.index);
}

function insertTotals(totals) {
    totalsCollection.insert(totals);
}

function deleteTotalsSince(timestamp) {

    const totalsSince = totalsCollection.find({ timestamp: { $gte: timestamp } });

    totalsCollection.remove(totalsSince);

    // TODO: Workaround for bug: Set maxId manually to 0 if there are no more entries
    if (totalsCollection.data.length == 0) totalsCollection.maxId = 0;
}

function loadConfig() {
    return configCollection.findOne();
}

function hasConfig() {
    return loadConfig() != null;
}

function saveConfig(config) {
    configCollection.clear();
    configCollection.insert(config);
}

function resetTotals() {
    db.removeCollection('totals');
    totalsCollection = db.addCollection('totals');
}

function persist() {
    db.save();
}

module.exports = {
    init,
    selectAllTotals,
    selectTotalsSince,
    selectLatestTotal,
    insertTotals,
    deleteTotalsSince,
    resetTotals,
    loadConfig,
    hasConfig,
    saveConfig,
    persist
};
