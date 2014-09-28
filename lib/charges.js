module.exports = function (key) {
    var Firebase = require('firebase'),
        stripe = require('stripe')(key);

    return function (ref, callback, accessToken, alterRequest) {
        var chargesRef = ref instanceof Firebase ? ref : new Firebase(ref);

        chargesRef.on('child_added', function (childSnapshot) {
            var chargeData = childSnapshot.val();

            // Check if charge already has Stripe id
            if (chargeData.id) {
                stripe.charges.retrieve(chargeData.id, function (err, charge) {
                    childSnapshot.ref().set(err ? err.raw : charge);
                });
            } else {
                var createCharge = function (chargeRequest) {
                    // Save response back at location
                    var saveCharge = function (err, charge) {
                        childSnapshot.ref().set(err ? err.raw : charge);
                        if (callback) {
                            callback(err, charge);
                        }
                    };

                    // Check if access token should be used
                    if (accessToken) {
                        accessToken = typeof accessToken === 'string' ? accessToken : accessToken(chargeRequest);
                        stripe.charges.create(chargeRequest, accessToken, saveCharge);
                    } else {
                        stripe.charges.create(chargeRequest, saveCharge);
                    }
                };

                // Check if user provided an alter function
                if (alterRequest) {
                    alterRequest(chargeData, createCharge);
                } else {
                    createCharge(chargeData);
                }
            }
        });

        return {
            refunds: function (ref, callback, accessToken, alterRequest) {
                var refundsRef = ref instanceof Firebase ? ref : new Firebase(ref);

                refundsRef.on('child_added', function (childSnapshot) {
                    var refundData = childSnapshot.val();

                    // Check if refund already has Stripe id
                    if (refundData.id) {
                        stripe.charges.retrieveRefund(refundData.charge, refundData.id, function (err, refund) {
                            childSnapshot.ref().set(err ? err.raw : charge);
                        });
                    } else {
                        var createRefund = function (refundRequest) {
                            // Save response back at location
                            var saveRefund = function (err, refund) {
                                childSnapshot.ref().set(err ? err.raw : refund.refunds.data[refund.refunds.data.length - 1]);
                                if (callback) {
                                    callback(err, refund);
                                }
                            };

                            // Get Stripe charge id
                            chargesRef.child(childSnapshot.name()).once('value', function (dataSnapshot) {
                                var chargeId = dataSnapshot.val().id;

                                // Check if access token should be used
                                if (accessToken) {
                                    accessToken = typeof accessToken === 'string' ? accessToken : accessToken(refundRequest);
                                    stripe.charges.createRefund(chargeId, refundRequest, accessToken, saveRefund);
                                } else {
                                    stripe.charges.createRefund(chargeId, refundRequest, saveRefund);
                                }
                            });
                        };

                        // Check if user provided an alter function
                        if (alterRequest) {
                            alterRequest(refundData, createRefund);
                        } else {
                            createRefund(refundData);
                        }
                    }
                });
            }
        };
    };
};