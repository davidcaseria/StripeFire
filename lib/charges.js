module.exports = function (key) {
    var Firebase = require('firebase'),
        stripe = require('stripe')(key);

    function charges(ref, accessToken, beforeCreate, callback) {
        ref = ref instanceof Firebase ? ref : new Firebase(ref);

        ref.on('child_added', function (childSnapshot, prevChildName) {
            var charge = childSnapshot.val();

            if (charge.id) {
                stripe.charges.retrieve(charge.id, function (err, charge) {
                    childSnapshot.ref().set(err ? err.raw : charge);
                });
            } else {
                var create = function (charge) {
                    if (accessToken) {
                        stripe.charges.create(charge, typeof accessToken === 'string' ? accessToken : accessToken(charge), function (err, charge) {
                            childSnapshot.ref().set(err ? err.raw : charge);
                            if (callback) {
                                callback(err, charge);
                            }
                        });
                    } else {
                        stripe.charges.create(charge, function (err, charge) {
                            childSnapshot.ref().set(err ? err.raw : charge);
                            if (callback) {
                                callback(err, charge);
                            }
                        });
                    }
                };

                if (beforeCreate) {
                    beforeCreate(charge, create);
                } else {
                    create(charge);
                }
            }
        });
    }

    return charges;
};