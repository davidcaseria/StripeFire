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
    charges: function (ref, callback, accessToken, alterRequest) {
      var Charge = new StripeObject(stripe, 'Charge');

      var chargesRef = ref instanceof Firebase ? ref : new Firebase(ref);
      chargesRef.on('child_added', Charge.create(callback, accessToken, alterRequest));
      chargesRef.on('child_changed', Charge.update(['description', 'metadata'], callback, accessToken));

      return {
        refunds: function (ref, callback, accessToken, alterRequest) {
          var refundsRef = ref instanceof Firebase ? ref : new Firebase(ref);
          refundsRef.on('child_added', Charge.child(chargesRef, 'Refund', ['metadata'], callback, accessToken, alterRequest));

          return {
            off: refundsRef.off
          };
        },
        off: chargesRef.off
      };
    },
    coupons: function (ref, callback, accessToken, alterRequest) {
      var Coupon = new StripeObject(stripe, 'Coupon');

      var couponsRef = ref instanceof Firebase ? ref : new Firebase(ref);
      couponsRef.on('child_added', Coupon.create(callback, accessToken, alterRequest));
      couponsRef.on('child_changed', Coupon.update(['metadata'], callback, accessToken));
      couponsRef.on('child_removed', Coupon.delete(callback, accessToken));

      return {
        off: couponsRef.off
      };
    },
    customers: function (ref, callback, accessToken, alterRequest) {
      var Customer = new StripeObject(stripe, 'Customer');

      var customersRef = ref instanceof Firebase ? ref : new Firebase(ref);
      customersRef.on('child_added', Customer.create(callback, accessToken, alterRequest));
      customersRef.on('child_changed', Customer.update(['account_balance', 'card', 'coupon', 'default_card', 'description', 'email', 'metadata'], callback, accessToken));
      customersRef.on('child_removed', Customer.delete(callback, accessToken));

      return {
        cards: function (ref, callback, accessToken, alterRequest) {
          var cardsRef = ref instanceof Firebase ? ref : new Firebase(ref);
          cardsRef.on('child_added', Customer.child(customersRef, 'Card', ['address_city', 'address_country', 'address_line1', 'address_line2', 'address_state', 'address_zip', 'exp_month', 'exp_year', 'name'], callback, accessToken, alterRequest));

          return {
            off: cardsRef.off
          };
        },
        subscriptions: function (ref, callback, accessToken, alterRequest) {
          var subscriptionsRef = ref instanceof Firebase ? ref : new Firebase(ref);
          subscriptionsRef.on('child_added', Customer.createChild(customersRef, 'Subscription', ['plan', 'coupon', 'prorate', 'trial_end', 'card', 'quantity', 'application_fee_percent', 'metadata'], callback, accessToken, alterRequest));

          return {
            off: subscriptionsRef.off
          };
        },
        off: customersRef.off
      };
    },
    plans: function (ref, callback, accessToken, alterRequest) {
      var Plan = new StripeObject(stripe, 'Plan');

      var plansRef = ref instanceof Firebase ? ref : new Firebase(ref);
      plansRef.on('child_added', Plan.create(callback, accessToken, alterRequest));
      plansRef.on('child_changed', Plan.update(['name', 'metadata', 'statement_description'], callback, accessToken));
      plansRef.on('child_removed', Plan.delete(callback, accessToken));

      return {
        off: plansRef.off
      };
    }
  };
};