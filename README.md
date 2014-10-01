# StripeFire

[![Build Status](https://travis-ci.org/davidcaseria/StripeFire.svg?branch=master)](https://travis-ci.org/davidcaseria/StripeFire)
[![NPM version](https://badge.fury.io/js/stripe-fire.svg)](http://badge.fury.io/js/stripe-fire)

A Node.js module that handles Stripe API calls when data is added to a Firebase reference.

StripeFire uses the following APIs:
* [Stripe API](https://stripe.com/docs/api/node)
* [Firebase API](https://www.firebase.com/docs/web/api/)

## Installation

To install StripeFire, run the following command:

```bash
$ npm install stripe-fire
```

## API Reference

A `StripeFire` object is used to store Firebase references for Stripe API objects for a specific Stripe account. The Stripe account is identified by the private key.

Each object accepts `ref`, `callback`, `accessToken`, and `alterRequest` parameters.
* `ref` *(required)*: An instance of a Firebase object or a string that points to a Firbase reference
* `callback` *(optional)*: A function which is called **after** a child is added to the specified reference *and* the API request is sent to Stripe; the function accepts two parameters: an error object and the Stripe object if the request is successful
* `accessToken` *(optional)*: A string or function which returns an access token to be sent with the Stripe API request (used for Stripe Connect); the function accepts one parameter: the data set in the Firebase child
* `alterRequest` *(optional)*: A function which is called **before** a request is sent to Stripe; the function accepts one parameter: the data set in the Firebase child

The reference should contain children which are all similar Stripe objects. Note the children names can be anything so long as they exist in parent objects.
For example, a refund child named `order1234` should have a corresponding charge child named `order1234`. This allows StripeFire to be agnostic about Stripe object ids.

After the API request is sent to Stripe the full Stripe object is stored at the same location where it was created (or an error object if an error occured).
For child objects i.e. refunds, cards, subscriptions, etc., the reference is deleted after a successful response from Stripe and the parent object i.e. charges, customers, etc. is updated.

### StripeFire(key)

Creates a `StripeFire` object which can be used to store references.

*Example:*
```JavaScript
//sk_test_BQokikJOvBiI2HlWgH4olfQ2 is the example Stripe private key
var stripeFire = require("stripe-fire")("sk_test_BQokikJOvBiI2HlWgH4olfQ2");
```

### StripeFire.charges(ref, [callback], [accessToken], [alterRequest])

Initializes and returns a `Charges` object.

*Example:*
```JavaScript
var charges = stripeFire.charges("https://stripe-fire.firebaseio.com/charges", function(err, charge) {
    // Called after a create charge request is sent to Stripe
}, "ACCESS_TOKEN", function(chargeData) {
    // Called before a create charge request is sent to Stripe
    return chargeData;
});
```

*Client-Side Usage:*
```JavaScript
var chargesRef = new Firebase("https://stripe-fire.firebaseio.com/charges");
chargesRef.push({
    amount: 400,
    currency: "usd",
    card: "token"
});
```

#### Charges.refunds(ref, [callback], [accessToken], [alterRequest])

Initializes a `Refunds` object which is a descendant of the `Charges` object. The charge with the same name as the refund will be retrieved from Stripe and saved under the `Charges` object reference.

*Example:*
```JavaScript
charges.refunds("https://stripe-fire.firebaseio.com/refunds", function(err, refund) {
    // Called after a create refund request is sent to Stripe
}, "ACCESS_TOKEN", function(refundData) {
    // Called before a create refund request is sent to Stripe
    return refundData;
});
```

*Client-Side Usage:*
```JavaScript
var refundsRef = new Firebase("https://stripe-fire.firebaseio.com/refunds");
//"ChargeName" should exist as a child in the charges reference
refundsRef.child("ChargeName").set({
    amount: 400
});
```

### StripeFire.coupons(ref, [callback], [accessToken], [alterRequest])

Initializes a `Coupons` object.

*Example:*
```JavaScript
stripeFire.coupons("https://stripe-fire.firebaseio.com/coupons", function(err, coupon) {
    // Called after a create coupon request is sent to Stripe
}, "ACCESS_TOKEN", function(couponData) {
    // Called before a create coupon request is sent to Stripe
    return couponData;
});
```

*Client-Side Usage:*
```JavaScript
var couponsRef = new Firebase("https://stripe-fire.firebaseio.com/coupons");
couponsRef.push({
    percent_off: 25,
    duration: "repeating",
    duration_in_months: 3
});
```

### StripeFire.customers(ref, [callback], [accessToken], [alterRequest])

Initializes and returns a `Customers` object.

*Example:*
```JavaScript
var customers = stripeFire.customers("https://stripe-fire.firebaseio.com/customers", function(err, customer) {
    // Called after a create customer request is sent to Stripe
}, "ACCESS_TOKEN", function(customerData) {
    // Called before a create customer request is sent to Stripe
    return customerData;
});
```

*Client-Side Usage:*
```JavaScript
var customersRef = new Firebase("https://stripe-fire.firebaseio.com/customers");
customersRef.push({
    card: "token"
});
```

#### Customers.cards(ref, [callback], [accessToken], [alterRequest])

Initializes a `Cards` object which is a descendant of the `Customers` object. The customer with the same name as the card's parent will be retrieved from Stripe and saved under the `Customers` object reference.

*Example:*
```JavaScript
customers.cards("https://stripe-fire.firebaseio.com/cards", function(err, card) {
    // Called after a create card request is sent to Stripe
}, "ACCESS_TOKEN", function(cardData) {
    // Called before a create card request is sent to Stripe
    return cardData;
});
```

*Client-Side Usage:*
```JavaScript
var cardsRef = new Firebase("https://stripe-fire.firebaseio.com/cards");
//"CustomerName" should exist as a child in the customers reference
cardsRef.child("CustomerName").set({
    card: "token"
});
```

#### Customers.subscriptions(ref, [callback], [accessToken], [alterRequest])

Initializes a `Subscriptions` object which is a descendant of the `Customers` object. The customer with the same name as the subscription's parent will be retrieved from Stripe and saved under the `Customers` object reference.

*Example:*
```JavaScript
customers.subscriptions("https://stripe-fire.firebaseio.com/subscriptions", function(err, subscription) {
    // Called after a create subscription request is sent to Stripe
}, "ACCESS_TOKEN", function(subscriptionData) {
    // Called before a create subscription request is sent to Stripe
    return subscriptionData;
});
```

*Client-Side Usage:*
```JavaScript
var subscriptionsRef = new Firebase("https://stripe-fire.firebaseio.com/subscriptions");
//"CustomerName" should exist as a child in the customers reference
subscriptionsRef.child("CustomerName").set({
    plan: "plan"
});
```

### StripeFire.plans(ref, [callback], [accessToken], [alterRequest])

Initializes a `Plans` object.

*Example:*
```JavaScript
stripeFire.plans("https://stripe-fire.firebaseio.com/plans", function(err, plan) {
    // Called after a create plan request is sent to Stripe
}, "ACCESS_TOKEN", function(planData) {
    // Called before a create plan request is sent to Stripe
    // IMPORTANT: since id is reserved for retrieving objects this cannot be set in Firebase before being sent to Stripe
    planData.id = planData.name;
    return planData;
});
```

*Client-Side Usage:*
```JavaScript
var plansRef = new Firebase("https://stripe-fire.firebaseio.com/plans");
plansRef.push({
    amount: 2000,
    interval: "month",
    name: "name",
    currency: "usd"
});
```