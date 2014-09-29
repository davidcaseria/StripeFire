var Firebase = require('firebase'),
    should = require('should'),
    stripe = require('stripe')('sk_test_BQokikJOvBiI2HlWgH4olfQ2');

describe('StripeFire', function () {
    var stripeFire = require('../lib/stripe-fire.js')('sk_test_BQokikJOvBiI2HlWgH4olfQ2');

    it('should have a charges property', function() {
        stripeFire.should.have.property('charges');
    });
    
    it('should have a customers property', function() {
        stripeFire.should.have.property('customers');
    });
});