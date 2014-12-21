/*global before,beforeEach,describe,it*/
'use strict';

var expect = require('chai').expect,
  Firebase = require('firebase'),
  stripe = require('stripe')('sk_test_BQokikJOvBiI2HlWgH4olfQ2'),
  stripeFire = require('../lib/stripe-fire.js')('sk_test_BQokikJOvBiI2HlWgH4olfQ2');

var createToken = function (callback) {
  stripe.tokens.create({
    card: {
      number: '4242424242424242',
      exp_month: 12,
      exp_year: 2015,
      cvc: '123'
    }
  }, callback);
};

describe('StripeFire', function () {
  this.timeout(15000);

  before(function (done) {
    var ref = new Firebase('https://stripe-fire.firebaseio.com');
    ref.remove(done);
  });

  it('should have a charges function', function () {
    expect(stripeFire.charges).to.be.a('function');
  });

  it('should have a coupons function', function () {
    expect(stripeFire.coupons).to.be.a('function');
  });

  it('should have a customers function', function () {
    expect(stripeFire.customers).to.be.a('function');
  });

  it('should have a plans function', function () {
    expect(stripeFire.plans).to.be.a('function');
  });

  describe('Charges', function () {

    var chargeTest = 0;
    beforeEach(function (done) {
      chargeTest++;
      var ref = new Firebase('https://stripe-fire.firebaseio.com/charges/test-' + chargeTest);
      createToken(function (err, token) {
        if (err) {
          done(err);
        } else {
          ref.push({
            amount: 400,
            currency: 'usd',
            card: token.id
          }, done);
        }
      });
    });

    it('should create a charge', function (done) {
      stripeFire.charges('https://stripe-fire.firebaseio.com/charges/test-1', done);
    });

    it('should update a charge', function (done) {
      stripeFire.charges('https://stripe-fire.firebaseio.com/charges/test-2', function (err) {
        if (err) {
          done(err);
        } else if (this.action === 'create') {
          var ref = new Firebase('https://stripe-fire.firebaseio.com/charges/test-2/' + this.childSnapshot.key());
          ref.update({
            description: 'Updating description'
          });
        } else if (this.action === 'update') {
          done();
        }
      });
    });

    describe('Refunds', function () {

      it('should refund a charge', function (done) {
        var charges = stripeFire.charges('https://stripe-fire.firebaseio.com/charges/test-3', function (err) {
          if (err) {
            done(err);
          } else if (this.action === 'create') {
            var ref = new Firebase('https://stripe-fire.firebaseio.com/refunds/test-3/' + this.childSnapshot.key());
            ref.set({
              amount: 400
            }, function (err) {
              if (err) {
                done(err);
              } else {
                charges.refunds('https://stripe-fire.firebaseio.com/refunds/test-3', done);
              }
            });
          }
        });
      });

    });

  });

  describe('Coupons', function () {

    var couponTest = 0;
    beforeEach(function (done) {
      couponTest++;
      var ref = new Firebase('https://stripe-fire.firebaseio.com/coupons/test-' + couponTest);
      ref.push({
        percent_off: 25,
        duration: 'repeating',
        duration_in_months: 3
      }, done);
    });

    it('should create a coupon', function (done) {
      stripeFire.coupons('https://stripe-fire.firebaseio.com/coupons/test-1', done);
    });

    it('should update a coupon', function (done) {
      stripeFire.coupons('https://stripe-fire.firebaseio.com/coupons/test-2', function (err) {
        if (err) {
          done(err);
        } else if (this.action === 'create') {
          var ref = new Firebase('https://stripe-fire.firebaseio.com/coupons/test-2/' + this.childSnapshot.key());
          ref.update({
            metadata: {
              key: 'value'
            }
          });
        } else if (this.action === 'update') {
          done();
        }
      });
    });

    it('should delete a coupon', function (done) {
      stripeFire.coupons('https://stripe-fire.firebaseio.com/coupons/test-3', function (err) {
        if (err) {
          done(err);
        } else if (this.action === 'create') {
          var ref = new Firebase('https://stripe-fire.firebaseio.com/coupons/test-3/' + this.childSnapshot.key());
          ref.remove();
        } else if (this.action === 'delete') {
          done();
        }
      });
    });

  });

  describe('Customers', function () {

    var customerTest = 0;
    beforeEach(function (done) {
      customerTest++;
      var ref = new Firebase('https://stripe-fire.firebaseio.com/customers/test-' + customerTest);
      createToken(function (err, token) {
        if (err) {
          done(err);
        } else {
          ref.push({
            card: token.id
          }, done);
        }
      });
    });

    it('should create a customer', function (done) {
      stripeFire.customers('https://stripe-fire.firebaseio.com/customers/test-1', done);
    });

    it('should update a customer', function (done) {
      stripeFire.customers('https://stripe-fire.firebaseio.com/customers/test-2', function (err) {
        if (err) {
          done(err);
        } else if (this.action === 'create') {
          var ref = new Firebase('https://stripe-fire.firebaseio.com/customers/test-2/' + this.childSnapshot.key());
          ref.update({
            description: 'Updating description'
          });
        } else if (this.action === 'update') {
          done();
        }
      });
    });

    it('should delete a customer', function (done) {
      stripeFire.customers('https://stripe-fire.firebaseio.com/customers/test-3', function (err) {
        if (err) {
          done(err);
        } else if (this.action === 'create') {
          var ref = new Firebase('https://stripe-fire.firebaseio.com/customers/test-3/' + this.childSnapshot.key());
          ref.remove();
        } else if (this.action === 'delete') {
          done();
        }
      });
    });

    describe('Cards', function () {

      it('should create a card for a customer', function (done) {
        var customers = stripeFire.customers('https://stripe-fire.firebaseio.com/customers/test-4', function (err) {
          if (err) {
            done(err);
          } else if (this.action === 'create') {
            var ref = new Firebase('https://stripe-fire.firebaseio.com/cards/test-4/' + this.childSnapshot.key());
            createToken(function (err, token) {
              if (err) {
                done(err);
              } else {
                ref.set({
                  card: token.id
                }, function (err) {
                  if (err) {
                    done(err);
                  } else {
                    customers.cards('https://stripe-fire.firebaseio.com/cards/test-4', done);
                  }
                });
              }
            });
          }
        });
      });

    });

  });

  describe('Plans', function () {

    var planTest = 0;
    beforeEach(function (done) {
      planTest++;
      var ref = new Firebase('https://stripe-fire.firebaseio.com/plans/test-' + planTest);
      var planRef = ref.push();
      planRef.set({
        amount: 2000,
        interval: 'month',
        name: planRef.key(),
        currency: 'usd'
      }, done);
    });

    it('should create a plan', function (done) {
      stripeFire.plans('https://stripe-fire.firebaseio.com/plans/test-1', done, null, function (plan) {
        plan.id = plan.name;
        return plan;
      });
    });

    it('should update a plan', function (done) {
      stripeFire.plans('https://stripe-fire.firebaseio.com/plans/test-2', function (err) {
        if (err) {
          done(err);
        } else if (this.action === 'create') {
          var ref = new Firebase('https://stripe-fire.firebaseio.com/plans/test-2/' + this.childSnapshot.key());
          ref.update({
            metadata: {
              key: 'value'
            }
          });
        } else if (this.action === 'update') {
          done();
        }
      }, null, function (plan) {
        plan.id = plan.name;
        return plan;
      });
    });

    it('should delete a plan', function (done) {
      stripeFire.plans('https://stripe-fire.firebaseio.com/plans/test-3', function (err) {
        if (err) {
          done(err);
        } else if (this.action === 'create') {
          var ref = new Firebase('https://stripe-fire.firebaseio.com/plans/test-3/' + this.childSnapshot.key());
          ref.remove();
        } else if (this.action === 'delete') {
          done();
        }
      }, null, function (plan) {
        plan.id = plan.name;
        return plan;
      });
    });

  });

});