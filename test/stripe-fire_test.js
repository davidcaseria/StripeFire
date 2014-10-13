/*global describe,it*/
'use strict';
var assert = require('assert'),
    stripeFire = require('../lib/stripe-fire.js');

describe('StripeFire', function () {
    var stripeFire = require('../lib/stripe-fire.js')('sk_test_BQokikJOvBiI2HlWgH4olfQ2');

    it('should have a charges property', function () {
        stripeFire.should.have.property('charges');
    });

    it('should have a coupons property', function () {
        stripeFire.should.have.property('coupons');
    });

    it('should have a customers property', function () {
        stripeFire.should.have.property('customers');
    });

    it('should have a plans property', function () {
        stripeFire.should.have.property('plans');
    });
});