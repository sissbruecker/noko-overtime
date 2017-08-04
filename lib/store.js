const R = require('ramda');
const Loki = require('lokijs');

let db;
let existingCollections;
let hasTotals;
let totalsCollection;

function init() {
    return new Promise(resolve => {

        db = new Loki('overtime.db', {
            autoload: true,
            autoloadCallback: R.pipe(handleLoaded, resolve)
        });

        function handleLoaded() {
            existingCollections = db.listCollections();
            hasTotals = R.find(R.propEq('name', 'totals'), existingCollections);
            totalsCollection = hasTotals ? db.getCollection('totals') : db.addCollection('totals');
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

function reset() {
    db.removeCollection('totals');
    totalsCollection = db.addCollection('totals');
}

function save() {
    db.save();
}

module.exports = {
    init,
    selectAllTotals,
    selectTotalsSince,
    insertTotals,
    deleteTotalsSince,
    reset,
    save
};
