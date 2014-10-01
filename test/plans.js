var Firebase = require('firebase'),
    should = require('should'),
    stripe = require('stripe')('sk_test_BQokikJOvBiI2HlWgH4olfQ2');

describe('Plans', function () {
    var stripeFire = require('../lib/stripe-fire.js')('sk_test_BQokikJOvBiI2HlWgH4olfQ2');
    
    before(function (done) {
        var ref = new Firebase('https://stripe-fire.firebaseio.com/plans');
        ref.remove(function () {
            var planRef = ref.push();
            var name = planRef.name();
            planRef.set({
                amount: 2000,
                interval: 'month',
                name: name,
                currency: 'usd'
            }, function () {
                done();
            });
        });
    });
    
    it('should be a function', function () {
        (stripeFire.plans).should.be.a.Function;
    });

    var plans;
    it('should create a plan', function (done) {
        plans = stripeFire.plans('https://stripe-fire.firebaseio.com/plans', done, null, function(planData) {
            planData.id = planData.name;
            return planData;
        });
    });
});