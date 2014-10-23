# StripeFire

[![Build Status](https://travis-ci.org/davidcaseria/StripeFire.svg?branch=master)](https://travis-ci.org/davidcaseria/StripeFire)
[![NPM version](https://badge.fury.io/js/stripe-fire.svg)](http://badge.fury.io/js/stripe-fire)

A Node.js module that handles Stripe API calls for Firebase references.

StripeFire uses the following APIs:

- [Stripe API](https://stripe.com/docs/api/node)
- [Firebase API](https://www.firebase.com/docs/web/api/)

## Getting Started

Install the module: `npm install stripe-fire`

Require in Node.js file:

```js
var stripeFire = require("stripe-fire")("your Stripe private key");
```

## API Reference

A `StripeFire` object is used to store Firebase references for Stripe API objects for a specific Stripe account. The Stripe account is identified by the private key.

Each object accepts `ref`, `callback`, `accessToken`, and `alterRequest` parameters.

- `ref` *(required)*: an instance of a Firebase object or a string that points to a Firebase reference
- `callback` *(optional)*: a function which is called **after** a child is added to the specified reference *and* the API request is sent to Stripe; the function accepts two parameters: an error object and the Stripe object if the request is successful
- `accessToken` *(optional)*: a string or function which returns an access token to be sent with the Stripe API request (used for Stripe Connect); the function accepts one parameter: the data set in the Firebase child
- `alterRequest` *(optional)*: a function which is called **before** a request is sent to Stripe; the function accepts one parameter: the data set in the Firebase child

The reference should contain children which are all similar Stripe objects. Note the children names can be anything so long as they exist in parent objects.
For example, a refund child named `order1234` should have a corresponding charge child named `order1234`. This allows StripeFire to be agnostic about Stripe object ids.

After the API request is sent to Stripe the full Stripe object is stored at the same location where it was created (or an error object if an error occured).
For child objects i.e. refunds, cards, subscriptions, etc., the reference is deleted after a successful response from Stripe and the parent object i.e. charges, customers, etc. is updated.

The `callback`, `accessToken`, and `alterRequest` functions may be called with the `this` variable set with the following properties:

- `accessToken`: the access token used in the request
- `action`: create/delete/update as appropriate
- `childSnapshot`: the Firebase [DataSnapshot](https://www.firebase.com/docs/web/api/datasnapshot/) used to generate the request

### StripeFire(key)

Creates a `StripeFire` object which can be used to store references.

*Example:*
```js
//sk_test_BQokikJOvBiI2HlWgH4olfQ2 is the example Stripe private key
var stripeFire = require("stripe-fire")("sk_test_BQokikJOvBiI2HlWgH4olfQ2");
```

### StripeFire.charges(ref, [callback], [accessToken], [alterRequest])

Initializes and returns a `Charges` object.

*Example:*
```js
var charges = stripeFire.charges("https://stripe-fire.firebaseio.com/charges", function(err, charge) {
    // Called after a create/update charge request is sent to Stripe
}, "ACCESS_TOKEN", function(chargeData) {
    // Called before a create/update charge request is sent to Stripe
    return chargeData;
});
```

*Sample Client-Side Usage:*
```js
var chargesRef = new Firebase("https://stripe-fire.firebaseio.com/charges");

// Create a charge
chargesRef.push({
    amount: 400,
    currency: "usd",
    card: "token"
});

// Update a charge
chargesRef.child("ChargeName").update({
    description: "Updating description"
});
```

#### Charges.refunds(ref, [callback], [accessToken], [alterRequest])

Initializes a `Refunds` object which is a descendant of the `Charges` object. The charge with the same name as the refund will be retrieved from Stripe and saved under the `Charges` object reference.

*Example:*
```js
charges.refunds("https://stripe-fire.firebaseio.com/refunds", function(err, refund) {
    // Called after a create/update refund request is sent to Stripe
}, "ACCESS_TOKEN", function(refundData) {
    // Called before a create/update refund request is sent to Stripe
    return refundData;
});
```

*Sample Client-Side Usage:*
```js
var refundsRef = new Firebase("https://stripe-fire.firebaseio.com/refunds");
//"ChargeName" should exist as a child in the charges reference
refundsRef.child("ChargeName").set({
    amount: 400
});
```

### StripeFire.coupons(ref, [callback], [accessToken], [alterRequest])

Initializes a `Coupons` object.

*Example:*
```js
stripeFire.coupons("https://stripe-fire.firebaseio.com/coupons", function(err, coupon) {
    // Called after a create/delete/update coupon request is sent to Stripe
}, "ACCESS_TOKEN", function(couponData) {
    // Called before a create/update coupon request is sent to Stripe
    return couponData;
});
```

*Sample Client-Side Usage:*
```js
var couponsRef = new Firebase("https://stripe-fire.firebaseio.com/coupons");

// Create a coupon
couponsRef.push({
    percent_off: 25,
    duration: "repeating",
    duration_in_months: 3
});

// Update a coupon
couponsRef.child("CouponName").update({
    metadata: {
        key: "value"
    }
});
```

### StripeFire.customers(ref, [callback], [accessToken], [alterRequest])

Initializes and returns a `Customers` object.

*Example:*
```js
var customers = stripeFire.customers("https://stripe-fire.firebaseio.com/customers", function(err, customer) {
    // Called after a create/delete/update customer request is sent to Stripe
}, "ACCESS_TOKEN", function(customerData) {
    // Called before a create/update customer request is sent to Stripe
    return customerData;
});
```

*Sample Client-Side Usage:*
```js
var customersRef = new Firebase("https://stripe-fire.firebaseio.com/customers");

// Create a customer
customersRef.push({
    card: "token"
});

// Update a customer
customersRef.child("CustomerName").update({
    description: "Updating description"
});
```

#### Customers.cards(ref, [callback], [accessToken], [alterRequest])

Initializes a `Cards` object which is a descendant of the `Customers` object. The customer with the same name as the card's parent will be retrieved from Stripe and saved under the `Customers` object reference.

*Example:*
```js
customers.cards("https://stripe-fire.firebaseio.com/cards", function(err, card) {
    // Called after a create/update card request is sent to Stripe
}, "ACCESS_TOKEN", function(cardData) {
    // Called before a create/update card request is sent to Stripe
    return cardData;
});
```

*Sample Client-Side Usage:*
```js
var cardsRef = new Firebase("https://stripe-fire.firebaseio.com/cards");
//"CustomerName" should exist as a child in the customers reference
cardsRef.child("CustomerName").set({
    card: "token"
});
```

#### Customers.subscriptions(ref, [callback], [accessToken], [alterRequest])

Initializes a `Subscriptions` object which is a descendant of the `Customers` object. The customer with the same name as the subscription's parent will be retrieved from Stripe and saved under the `Customers` object reference.

*Example:*
```js
customers.subscriptions("https://stripe-fire.firebaseio.com/subscriptions", function(err, subscription) {
    // Called after a create/update subscription request is sent to Stripe
}, "ACCESS_TOKEN", function(subscriptionData) {
    // Called before a create/update subscription request is sent to Stripe
    return subscriptionData;
});
```

*Sample Client-Side Usage:*
```js
var subscriptionsRef = new Firebase("https://stripe-fire.firebaseio.com/subscriptions");
//"CustomerName" should exist as a child in the customers reference
subscriptionsRef.child("CustomerName").set({
    plan: "plan"
});
```

### StripeFire.plans(ref, [callback], [accessToken], [alterRequest])

Initializes a `Plans` object.

*Example:*
```js
stripeFire.plans("https://stripe-fire.firebaseio.com/plans", function(err, plan) {
    // Called after a create/delete/update plan request is sent to Stripe
}, "ACCESS_TOKEN", function(planData) {
    // Called before a create/update plan request is sent to Stripe
    // IMPORTANT: since id is reserved for retrieving objects this cannot be set in Firebase before being sent to Stripe
    planData.id = planData.name;
    return planData;
});
```

*Sample Client-Side Usage:*
```js
var plansRef = new Firebase("https://stripe-fire.firebaseio.com/plans");

// Create a plan
plansRef.push({
    amount: 2000,
    interval: "month",
    name: "name",
    currency: "usd"
});

// Update a plan
plansRef.child("PlanName").update({
    metadata: {
        key: "value"
    }
});
```


## Security Reference

Make sure to secure Firebase with the proper rules to protect the Stripe data. Checkout the [Firebase Security API](https://www.firebase.com/docs/security/) for more details.

To easily get started building Firebase rules you can use the [Blaze Security Compiler](https://www.firebase.com/docs/security/).

Install the Blaze Security Compiler with: `npm install -g blaze_compiler`

A sample [rules.yml](security/rules.yml) file has been provided as a boilerplate.


## Contributing

In lieu of a formal style guide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com).


## License

Copyright (c) 2014 David Caseria
Licensed under the MIT license.
