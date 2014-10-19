/*
 *
 * https://github.com/davidcaseria/StripeFire
 *
 * Copyright (c) 2014 David Caseria
 * Licensed under the MIT license.
 */

'use strict';

var Firebase = require('firebase'),
    StripeObject = require('./stripe-object.js');

var off = function(ref) {
    return function() {
        ref.off();
    };
};

module.exports = function (key) {
    var stripe = require('stripe')(key);

    return {
        charges: function (ref, callback, accessToken, alterRequest) {
            var Charge = new StripeObject(stripe, 'Charge');

            var chargesRef = ref instanceof Firebase ? ref : new Firebase(ref);
            chargesRef.on('child_added', Charge.create(callback, accessToken, alterRequest));
            chargesRef.on('child_changed', Charge.update(['description', 'metadata'], callback, accessToken));

            return {
                refunds: function (ref, callback, accessToken, alterRequest) {
                    var refundsRef = ref instanceof Firebase ? ref : new Firebase(ref);
                    refundsRef.on('child_added', Charge.createChild(chargesRef, 'Refund', callback, accessToken, alterRequest));
                    
                    return {
                        off: off(refundsRef)
                    };
                },
                off: off(chargesRef)
            };
        },
        coupons: function (ref, callback, accessToken, alterRequest) {
            var Coupon = new StripeObject(stripe, 'Coupon');

            var couponsRef = ref instanceof Firebase ? ref : new Firebase(ref);
            couponsRef.on('child_added', Coupon.create(callback, accessToken, alterRequest));
            couponsRef.on('child_changed', Coupon.update(['metadata'], callback, accessToken));
            
            return {
                off: off(couponsRef)
            };
        },
        customers: function (ref, callback, accessToken, alterRequest) {
            var Customer = new StripeObject(stripe, 'Customer');

            var customersRef = ref instanceof Firebase ? ref : new Firebase(ref);
            customersRef.on('child_added', Customer.create(callback, accessToken, alterRequest));
            customersRef.on('child_changed', Customer.update(['account_balance', 'card', 'coupon', 'default_card', 'description', 'email', 'metadata'], callback, accessToken));

            return {
                cards: function (ref, callback, accessToken, alterRequest) {
                    var cardsRef = ref instanceof Firebase ? ref : new Firebase(ref);
                    cardsRef.on('child_added', Customer.createChild(customersRef, 'Card', callback, accessToken, alterRequest));
                    
                    return {
                        off: off(cardsRef)
                    };
                },
                subscriptions: function (ref, callback, accessToken, alterRequest) {
                    var subscriptionsRef = ref instanceof Firebase ? ref : new Firebase(ref);
                    subscriptionsRef.on('child_added', Customer.createChild(customersRef, 'Subscription', callback, accessToken, alterRequest));
                    
                    return {
                        off: off(subscriptionsRef)
                    };
                },
                off: off(customersRef)
            };
        },
        plans: function (ref, callback, accessToken, alterRequest) {
            var Plan = new StripeObject(stripe, 'Plan');

            var plansRef = ref instanceof Firebase ? ref : new Firebase(ref);
            plansRef.on('child_added', Plan.create(callback, accessToken, alterRequest));
            plansRef.on('child_changed', Plan.update(['name', 'metadata', 'statement_description'], callback, accessToken));
            
            return {
                off: off(plansRef)
            };
        }
    };
};