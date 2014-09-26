var Firebase = require('firebase'),
    should = require('should');

var stripeFire = require('../lib/stripe-fire.js')('private key');

describe('StripeFire', function () {

    describe('charges', function () {
        it('should exist', function () {
            (typeof stripeFire.charges !== 'undefined').should.be.true;
        });

        it('should be a function', function () {
            (stripeFire.charges).should.be.a.Function;
        });
    });

    describe('customers', function () {
        it('should exist', function () {
            (typeof stripeFire.customers !== 'undefined').should.be.true;
        });

        it('should be a function', function () {
            (stripeFire.customers).should.be.a.Function;
        });

        var customers = new stripeFire.customers(new Firebase('https://stripe-fire.firebaseio.com/customers'));

        describe('cards', function () {
            it('should exist', function () {
                (typeof customers.cards !== 'undefined').should.be.true;
            });

            it('should be a function', function () {
                (customers.cards).should.be.a.Function;
            });
        });
    });
});