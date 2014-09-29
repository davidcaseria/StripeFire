module.exports = function (key) {
    var Firebase = require('firebase'),
        FireChild = require('fire-child'),
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
        
        customersRef.on('child_removed', function(oldChildSnapshot) {
            var customerData = oldChildSnapshot.val();
            stripe.customers.del(customerData.id);
        });

        return {
            cards: function (ref, callback, accessToken, alterRequest) {
                var cardsRef = new FireChild(ref);

                cardsRef.on(1, 'child_added', function (childSnapshot) {
                    var cardData = childSnapshot.val();

                    // Check if card already has Stripe id
                    if (cardData.id) {
                        stripe.customers.retrieveCard(cardData.customer, cardData.id, function (err, card) {
                            childSnapshot.ref().set(err ? err.raw : card);
                        });
                    } else {
                        var createCard = function (cardRequest) {
                            var customerName = childSnapshot.ref().parent().name();
                            
                            // Save response back at location
                            var saveCard = function (err, card) {
                                childSnapshot.ref().set(err ? err.raw : card);
                                if (!err) {
                                    stripe.customers.retrieve(card.customer, function (err, customer) {
                                        customersRef.child(customerName).set(err ? err.raw : customer);
                                    });
                                }
                                
                                if (callback) {
                                    callback(err, card);
                                }
                            };

                            // Get Stripe customer id
                            customersRef.child(customerName).once('value', function (dataSnapshot) {
                                var customerId = dataSnapshot.val().id;

                                // Check if access token should be used
                                if (accessToken) {
                                    accessToken = typeof accessToken === 'string' ? accessToken : accessToken(cardRequest);
                                    stripe.customers.createCard(customerId, cardRequest, accessToken, saveCard);
                                } else {
                                    stripe.customers.createCard(customerId, cardRequest, saveCard);
                                }
                            });
                        };

                        // Check if user provided an alter function
                        if (alterRequest) {
                            alterRequest(cardData, createCard);
                        } else {
                            createCard(cardData);
                        }
                    }
                });
                
                cardsRef.on(1, 'child_removed', function(oldChildSnapshot) {
                    var cardData = oldChildSnapshot.val();
                    var customerName = oldChildSnapshot.ref().parent().name();
                    
                    stripe.customers.deleteCard(cardData.customer, cardData.id, function(err, confirmation) {
                        // Update customer data with deleted card
                        if(!err) {
                            stripe.customers.retrieve(cardData.customer, function (err, customer) {
                                customersRef.child(customerName).set(err ? err.raw : customer);
                            });
                        }
                    });
                });
            },
            subscriptions: function (ref, callback, accessToken, alterRequest) {
                var subscriptionsRef = new FireChild(ref);

                subscriptionsRef.on(2, 'child_added', function (childSnapshot) {
                    var subscriptionData = childSnapshot.val();

                    // Check if subscription already has Stripe id
                    if (subscriptionData.id) {
                        stripe.customers.retrieveSubscription(subscriptionData.customer, subscriptionData.id, function (err, subscription) {
                            childSnapshot.ref().set(err ? err.raw : subscription);
                        });
                    } else {
                        var createSubscription = function (subscriptionRequest) {
                            var customerName = childSnapshot.ref().parent().name();
                            
                            // Save response back at location
                            var saveSubscription = function (err, subscription) {
                                childSnapshot.ref().set(err ? err.raw : subscription);
                                if (!err) {
                                    stripe.customers.retrieve(subscription.customer, function (err, customer) {
                                        customersRef.child(customerName).set(err ? err.raw : customer);
                                    });
                                }
                                
                                if (callback) {
                                    callback(err, subscription, childSnapshot.name());
                                }
                            };

                            // Get Stripe customer id
                            customersRef.child(customerName).once('value', function (dataSnapshot) {
                                var customerId = dataSnapshot.val().id;

                                // Check if access token should be used
                                if (accessToken) {
                                    accessToken = typeof accessToken === 'string' ? accessToken : accessToken(subscriptionRequest);
                                    stripe.customers.createCard(customerId, subscriptionRequest, accessToken, saveSubscription);
                                } else {
                                    stripe.customers.createCard(customerId, subscriptionRequest, saveSubscription);
                                }
                            });
                        };

                        // Check if user provided an alter function
                        if (alterRequest) {
                            alterRequest(subscriptionData, createSubscription);
                        } else {
                            createSubscription(subscriptionData);
                        }
                    }
                });
                
                subscriptionsRef.on('child_removed', function(oldChildSnapshot) {
                    var subscriptionData = oldChildSnapshot.val();
                    var customerName = oldChildSnapshot.ref().parent().name();
                    
                    stripe.customers.cancelSubscription(subscriptionData.customer, subscriptionData.id, function(err, confirmation) {
                        // Update customer data with canceled subscription
                        if(!err) {
                            stripe.customers.retrieve(subscriptionData.customer, function (err, customer) {
                                customersRef.child(customerName).set(err ? err.raw : customer);
                            });
                        }
                    });
                });
            }
        };
    };
};