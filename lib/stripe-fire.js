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

module.exports = function (key) {
    var stripe = require('stripe')(key);
    
    return {
        charges: function(ref, callback, accessToken, alterRequest) {
            var Charge = new StripeObject(stripe, 'Charge');
            
            var chargesRef = ref instanceof Firebase ? ref : new Firebase(ref);
            chargesRef.on('child_added', Charge.create(callback, accessToken, alterRequest));
            
            return {
                refunds: function(ref, callback, accessToken, alterRequest) {
                    var refundsRef = ref instanceof Firebase ? ref : new Firebase(ref);
                    refundsRef.on('child_added', Charge.createChild(chargesRef, 'Refund', callback, accessToken, alterRequest));
                }
            };
        },
        coupons: function(ref, callback, accessToken, alterRequest) {
            var Coupon = new StripeObject(stripe, 'Coupon');
            
            var couponsRef = ref instanceof Firebase ? ref : new Firebase(ref);
            couponsRef.on('child_added', Coupon.create(callback, accessToken, alterRequest));
        },
        customers: function(ref, callback, accessToken, alterRequest) {
            var Customer = new StripeObject(stripe, 'Customer');
            
            var customersRef = ref instanceof Firebase ? ref : new Firebase(ref);
            customersRef.on('child_added', Customer.create(callback, accessToken, alterRequest));
            
            return {
                cards: function(ref, callback, accessToken, alterRequest) {
                    var cardsRef = ref instanceof Firebase ? ref : new Firebase(ref);
                    cardsRef.on('child_added', Customer.createChild(customersRef, 'Card', callback, accessToken, alterRequest));
                },
                subscriptions: function(ref, callback, accessToken, alterRequest) {
                    var subscriptionsRef = ref instanceof Firebase ? ref : new Firebase(ref);
                    subscriptionsRef.on('child_added', Customer.createChild(customersRef, 'Subscription', callback, accessToken, alterRequest));
                }
            };
        },
        plans: function(ref, callback, accessToken, alterRequest) {
            var Plan = new StripeObject(stripe, 'Plan');
            
            var plansRef = ref instanceof Firebase ? ref : new Firebase(ref);
            plansRef.on('child_added', Plan.create(callback, accessToken, alterRequest));
        }
    };
};
