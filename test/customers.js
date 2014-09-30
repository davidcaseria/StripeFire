var Firebase = require('firebase'),
    should = require('should'),
    stripe = require('stripe')('sk_test_BQokikJOvBiI2HlWgH4olfQ2');

describe('Customers', function () {
    var stripeFire = require('../lib/stripe-fire.js')('sk_test_BQokikJOvBiI2HlWgH4olfQ2');

    before(function (done) {
        stripe.tokens.create({
            card: {
                number: '4242424242424242',
                exp_month: 12,
                exp_year: 2015,
                cvc: '123'
            }
        }, function (err, token) {
            var ref = new Firebase('https://stripe-fire.firebaseio.com/customers');
            ref.remove(function () {
                ref.push({
                    card: token.id
                }, function () {
                    done();
                });
            });
        });
    });
    
    it('should be a function', function () {
        (stripeFire.customers).should.be.a.Function;
    });

    var customers;
    it('should create a customer', function (done) {
        customers = stripeFire.customers('https://stripe-fire.firebaseio.com/customers', done);
    });
    
    it('should have a cards property', function() {
        customers.should.have.property('cards');
    });
    
    it('should have a subscriptions property', function() {
        customers.should.have.property('subscriptions');
    });

    describe('Cards', function () {

        before(function (done) {
            stripe.tokens.create({
                card: {
                    number: '4242424242424242',
                    exp_month: 12,
                    exp_year: 2015,
                    cvc: '123'
                }
            }, function (err, token) {
                var ref = new Firebase('https://stripe-fire.firebaseio.com/customer-cards');
                ref.remove(function () {
                    var customersRef = ref.child('customers').push({
                        card: token.id
                    }, function () {
                        stripe.tokens.create({
                            card: {
                                number: '5555555555554444',
                                exp_month: 12,
                                exp_year: 2015,
                                cvc: '123'
                            }
                        }, function(err, token) {
                            ref.child('cards').child(customersRef.name()).set({
                                card: token.id
                            }, function () {
                                done();
                            });
                        });
                    });
                });
            });
        });

        it('should be a function', function () {
            (customers.cards).should.be.a.Function;
        });

        it('should add a card to an existing customer', function (done) {
            var customers = stripeFire.customers('https://stripe-fire.firebaseio.com/customer-cards/customers', function (err) {
                if (err) {
                    throw err;
                }
                customers.cards('https://stripe-fire.firebaseio.com/customer-cards/cards', done);
            });
        });
    });
});