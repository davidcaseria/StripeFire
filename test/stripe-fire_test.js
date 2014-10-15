/*global before,beforeEach,describe,it*/
'use strict';

var expect = require('chai').expect,
    Firebase = require('firebase'),
    stripe = require('stripe')('sk_test_BQokikJOvBiI2HlWgH4olfQ2'),
    stripeFire = require('../lib/stripe-fire.js')('sk_test_BQokikJOvBiI2HlWgH4olfQ2');

var createToken = function(callback) {
    stripe.tokens.create({
        card: {
            number: '4242424242424242',
            exp_month: 12,
            exp_year: 2015,
            cvc: '123'
        }
    }, callback);
};

describe('StripeFire', function() {
    
    before(function(done) {
        var ref = new Firebase('https://stripe-fire.firebaseio.com');
        ref.remove(done);
    });
    
    it('should have a charges function', function() {
        expect(stripeFire.charges).to.be.a('function');
    });
    
    it('should have a coupons function', function() {
        expect(stripeFire.coupons).to.be.a('function');
    });
    
    it('should have a customers function', function() {
        expect(stripeFire.customers).to.be.a('function');
    });
    
    it('should have a plans function', function() {
        expect(stripeFire.plans).to.be.a('function');
    });
    
    describe('Charges', function() {
        
        var chargeTest = 0;
        beforeEach(function(done) {
            chargeTest++;
            var ref = new Firebase('https://stripe-fire.firebaseio.com/charges/test-' + chargeTest);
            createToken(function(err, token) {
                ref.push({
                    amount: 400,
                    currency: 'usd',
                    card: token.id
                }, done);
            });
        });
        
        it('should create a charge', function(done) {
            stripeFire.charges('https://stripe-fire.firebaseio.com/charges/test-1', function(err) {
                /*console.log(err);
                console.log(charge.id);
                console.log(action);
                console.log(childSnapshot.name());*/
                done(err);
            });
        });
        
        /*it('should update a charge', function(done) {
            stripeFire.charges('https://stripe-fire.firebaseio.com/charges/test-2', function(err, charge, action, childSnapshot) {
                if(err) {
                    done(err);
                } else if (action === 'create') {
                    var ref = new Firebase('https://stripe-fire.firebaseio.com/charges/test-2/' + childSnapshot.name());
                    ref.update({
                        description: 'Updating description'
                    });
                } else  {
                    done();
                }
            });
        });*/
        
    });
    
});