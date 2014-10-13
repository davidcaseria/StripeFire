/*global describe,it*/
'use strict';
var assert = require('assert'),
    stripeFire = require('../lib/stripe-fire.js')('sk_test_BQokikJOvBiI2HlWgH4olfQ2');

describe('StripeFire', function () {

    it('should have a charges property', function () {
        assert.ok(stripeFire.charges);
    });

    it('should have a coupons property', function () {
        assert.ok(stripeFire.coupons);
    });

    it('should have a customers property', function () {
        assert.ok(stripeFire.customers);
    });

    it('should have a plans property', function () {
        assert.ok(stripeFire.plans);
    });
});