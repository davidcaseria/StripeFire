module.exports = function (key) {
    var Firebase = require('firebase'),
        stripe = require('stripe')(key);

    function customers(ref, accessToken, beforeCreate, callback) {
        ref = ref instanceof Firebase ? ref : new Firebase(ref);

        ref.on('child_added', function (childSnapshot, prevChildName) {
            var customer = childSnapshot.val();

            if (customer.id) {
                stripe.customers.retrieve(customer.id, function (err, customer) {
                    childSnapshot.ref().set(err ? err.raw : customer);
                });
            } else {
                var create = function (customer) {
                    var saveCustomer = function (err, customer) {
                        childSnapshot.ref().set(err ? err.raw : customer);
                        if (callback) {
                            callback(err, customer);
                        }
                    };

                    if (accessToken) {
                        stripe.customers.create(customer, typeof accessToken === 'string' ? accessToken : accessToken(customer), saveCustomer);
                    } else {
                        stripe.customers.create(customer, saveCustomer);
                    }
                };

                if (beforeCreate) {
                    beforeCreate(customer, create);
                } else {
                    create(customer);
                }
            }
        });
    };

    return customers;
};