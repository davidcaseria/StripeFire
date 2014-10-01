var Firebase = require('firebase'),
    should = require('should'),
    stripe = require('stripe')('sk_test_BQokikJOvBiI2HlWgH4olfQ2');

describe('Coupons', function () {
    var stripeFire = require('../lib/stripe-fire.js')('sk_test_BQokikJOvBiI2HlWgH4olfQ2');
    
    before(function (done) {
        var ref = new Firebase('https://stripe-fire.firebaseio.com/coupons');
        ref.remove(function () {
            ref.push({
                percent_off: 25,
                duration: 'repeating',
                duration_in_months: 3
            }, function () {
                done();
            });
        });
    });
    
    it('should be a function', function () {
        (stripeFire.coupons).should.be.a.Function;
    });

    var coupons;
    it('should create a coupon', function (done) {
        coupons = stripeFire.coupons('https://stripe-fire.firebaseio.com/coupons', done);
    });
});