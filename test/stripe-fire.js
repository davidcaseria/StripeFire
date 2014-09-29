var Firebase = require('firebase'),
    should = require('should'),
    stripe = require('stripe')('sk_test_BQokikJOvBiI2HlWgH4olfQ2');

describe('StripeFire', function () {

    var stripeFire = require('../lib/stripe-fire.js')('sk_test_BQokikJOvBiI2HlWgH4olfQ2');

    describe('charges', function () {

        before(function (done) {
            stripe.tokens.create({
                card: {
                    number: '4242424242424242',
                    exp_month: 12,
                    exp_year: 2015,
                    cvc: '123'
                }
            }, function (err, token) {
                var ref = new Firebase('https://stripe-fire.firebaseio.com/charges');
                ref.set({}, function () {
                    ref.push({
                        amount: 400,
                        currency: 'usd',
                        card: token.id
                    }, function () {
                        done();
                    });
                });
            });
        });

        it('should exist', function () {
            (typeof stripeFire.charges !== 'undefined').should.be.true;
        });

        it('should be a function', function () {
            (stripeFire.charges).should.be.a.Function;
        });

        var charges;
        it('should process a charge', function (done) {
            charges = stripeFire.charges('https://stripe-fire.firebaseio.com/charges', done);
        });

        describe('refunds', function () {

            before(function (done) {
                stripe.tokens.create({
                    card: {
                        number: '4242424242424242',
                        exp_month: 12,
                        exp_year: 2015,
                        cvc: '123'
                    }
                }, function (err, token) {
                    var ref = new Firebase('https://stripe-fire.firebaseio.com/charges-refunds');
                    ref.set({}, function () {
                        var chargeRef = ref.child('charges').push({
                            amount: 400,
                            currency: 'usd',
                            card: token.id
                        }, function () {
                            ref.child('refunds').child(chargeRef.name()).set({
                                amount: 400
                            }, function () {
                                done();
                            });
                        });
                    });
                });
            });

            it('should exist', function () {
                (typeof charges.refunds !== 'undefined').should.be.true;
            });

            it('should be a function', function () {
                (charges.refunds).should.be.a.Function;
            });

            it('should refund an existing charge', function (done) {
                var charges = stripeFire.charges('https://stripe-fire.firebaseio.com/charges-refunds/charges', function (err) {
                    if (err) {
                        throw err;
                    }
                    charges.refunds('https://stripe-fire.firebaseio.com/charges-refunds/refunds', done);
                });
            });
        });
    });

    describe('customers', function () {

        it('should exist', function () {
            (typeof stripeFire.customers !== 'undefined').should.be.true;
        });

        it('should be a function', function () {
            (stripeFire.customers).should.be.a.Function;
        });

    });
});