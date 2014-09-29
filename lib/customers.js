module.exports = function (key) {
    var Firebase = require('firebase'),
        stripe = require('stripe')(key);

    return function (ref, callback, accessToken, alterRequest) {
        var customersRef = ref instanceof Firebase ? ref : new Firebase(ref);

        customersRef.on('child_added', function (childSnapshot) {
            var customerData = childSnapshot.val();

            // Check if customer already has Stripe id
            if (customerData.id) {
                stripe.customers.retrieve(customerData.id, function (err, customer) {
                    childSnapshot.ref().set(err ? err.raw : customer);
                });
            } else {
                var createCustomer = function (customerRequest) {
                    // Save response back at location
                    var saveCustomer = function (err, customer) {
                        childSnapshot.ref().set(err ? err.raw : customer);
                        if (callback) {
                            callback(err, customer);
                        }
                    };

                    // Check if access token should be used
                    if (accessToken) {
                        accessToken = typeof accessToken === 'string' ? accessToken : accessToken(customerRequest);
                        stripe.customers.create(customerRequest, accessToken, saveCustomer);
                    } else {
                        stripe.customers.create(customerRequest, saveCustomer);
                    }
                };

                // Check if user provided an alter function
                if (alterRequest) {
                    alterRequest(customerData, createCustomer);
                } else {
                    createCustomer(customerData);
                }
            }
        });

        return {
            cards: function (ref, callback, accessToken, alterRequest) {

            },
            subscriptions: function (ref, callback, accessToken, alterRequest) {

            }
        };
    };
};