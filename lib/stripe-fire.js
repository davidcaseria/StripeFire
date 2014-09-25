var charges = require('./charges.js'),
    customers = require('./customers.js');

module.exports = function(key) {
    return {
        charges: charges(key),
        customers: customers(key)
    };
};