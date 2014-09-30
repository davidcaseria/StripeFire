function StripeObject(stripe, object) {
    this.stripe = stripe;
    this.object = object;
}

StripeObject.prototype.create = function(callback, accessToken, alterRequest) {
    var stripe = this.stripe;
    var object = this.object;
    
    return function(childSnapshot) {
        var data = childSnapshot.val();

        // Check if object already has Stripe id
        if (data.id) {
            stripe[object.toLowerCase() + 's'].retrieve(data.id, function (err, obj) {
                childSnapshot.ref().set(err ? err.raw : obj);
            });
        } else {
            var create = function (request) {
                // Handle response from Stripe
                var handleResponse = function(err, obj) {
                    childSnapshot.ref().set(err ? err.raw : obj, function() {
                        if(callback) {
                            callback(err, obj);
                        }
                    });
                };

                // Check if access token should be used
                if (accessToken) {
                    accessToken = typeof accessToken === 'string' ? accessToken : accessToken(request);
                    stripe[object.toLowerCase() + 's'].create(request, accessToken, handleResponse);
                } else {
                    stripe[object.toLowerCase() + 's'].create(request, handleResponse);
                }
            };

            // Alter request if user provided a function before creating
            create(alterRequest ? alterRequest(data) : data);
        }
    };
}

StripeObject.prototype.createChild = function(parentRef, childObject, callback, accessToken, alterRequest) {
    var stripe = this.stripe;
    var object = this.object;
    
    return function (childSnapshot) {
        var data = childSnapshot.val();
        var parentName = childSnapshot.name();

        var create = function (request) {
            // Handle response from Stripe
            var handleReponse = function(err, obj) {
                if(err) {
                    childSnapshot.ref().set(err.raw);
                    if(callback) {
                        callback(err);
                    }
                }
                else {
                    childSnapshot.ref().remove();
                    stripe[object.toLowerCase() + 's'].retrieve(obj[object.toLowerCase()], function (err, obj) {
                        parentRef.child(parentName).set(err ? err.raw : obj, function() {
                            if (callback) {
                                callback(null, obj);
                            }
                        });
                    });
                }
            };

            // Get Stripe id of parent object
            parentRef.child(parentName).once('value', function (dataSnapshot) {
                var parentObjectId = dataSnapshot.val().id;

                // Check if access token should be used
                if (accessToken) {
                    accessToken = typeof accessToken === 'string' ? accessToken : accessToken(request);
                    stripe[object.toLowerCase() + 's']['create' + childObject](parentObjectId, request, accessToken, handleReponse);
                } else {
                    stripe[object.toLowerCase() + 's']['create' + childObject](parentObjectId, request, handleReponse);
                }
            });
        };

        // Alter request if user provided a function before creating
        create(alterRequest ? alterRequest(data) : data);
    };
};

StripeObject.prototype.delete = function(callback, accessToken) {
    var stripe = this.stripe;
    var object = this.object;
    
    return function(oldChildSnapshot) {
        var name = oldChildSnapshot.name();
        
        // Check if access token should be used
        if (accessToken) {
            accessToken = typeof accessToken === 'string' ? accessToken : accessToken(name);
            stripe[object.toLowerCase() + 's'].del(name, accessToken, callback);
        } else {
            stripe[object.toLowerCase() + 's'].del(name, callback);
        }
    };
};

module.exports = StripeObject;