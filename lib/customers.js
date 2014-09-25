module.exports = function(key) {
    var stripe = require('stripe')(key);
    
    function customers(ref, opts) {
        ref.on('child_added', function(childSnapshot, prevChildName) {
            var val = childSnapshot.val();
            if(!val.id) {
                stripe.customers.create(val, function(err, customer) {
                    if(!err) {
                        childSnapshot.ref().set(customer);
                    }
                });
            }
        });

        ref.on('child_changed', function(childSnapshot, prevChildName) {
            var val = childSnapshot.val();
            stripe.customers.update(val.id, val, function(err, customer) {
                if(!err) {
                    childSnapshot.ref().set(customer);
                }
            });
        });

        ref.on('child_removed', function(oldChildSnapshot) {
            var val = oldChildSnapshot.val();
            stripe.customers.del(val.id);
        });
    }

    customers.prototype.cards = function(ref) {
        
    }
    
    return customers;
};