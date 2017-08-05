const R = require('ramda');
const Loki = require('lokijs');

let db;
let totalsCollection;
let configCollection;

function init() {
    return new Promise(resolve => {

        db = new Loki('freckle-overtime.db.json', {
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
    return R.head(configCollection.find({}));
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
    insertTotals,
    deleteTotalsSince,
    resetTotals,
    loadConfig,
    hasConfig,
    saveConfig,
    persist
};
