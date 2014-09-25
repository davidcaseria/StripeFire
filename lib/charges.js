module.exports = function(key) {
    var stripe = require('stripe')(key);
    
    function charges(ref, opts) {
        ref.on('child_added', function(childSnapshot, prevChildName) {
            var val = childSnapshot.val();
            this.stripe.charges.create(val, function(err, charge) {
                if(err) {
                    childSnapshot.ref().set(err);
                }
                else {
                    childSnapshot.ref().set(charge);
                }
            });
        });
    }
    
    return charges;
};