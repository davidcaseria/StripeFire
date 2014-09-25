module.exports = function(key) {
    var Firebase = require('firebase'),
        stripe = require('stripe')(key);

    var getMethod = function(o, s) {
        s = s.replace(/\[(\w+)\]/g, '.$1'); // convert indexes to properties
        s = s.replace(/^\./, ''); // strip leading dot
        var a = s.split('.');
        while (a.length) {
            var n = a.shift();
            if (n in o) {
                o = o[n];
            } else {
                return;
            }
        }
        return o;
    };

    return {
        listen: function(ref, method, callback) {
            ref.on('child_added', function(childSnapshot, prevChildName) {
              getMethod(stripe, method)(childSnapshot.val(), callback);
            });
        }
    };
};