/*
 *
 * https://github.com/davidcaseria/StripeFire
 *
 * Copyright (c) 2014 David Caseria
 * Licensed under the MIT license.
 */

'use strict';

var sha1 = require('sha1');

// Creates a function to handle responses from Stripe
var responseHandler = function(err, obj) {
    var callback = typeof this.callback === 'function' ? this.callback : function() {};
    delete this.callback;
    
    if (err) {
        this.childSnapshot.ref().set({
            err: err.raw
        });
    } else {
        console.log(this.childSnapshot.name());
        console.log(JSON.stringify(JSON.stringify(obj)));
        console.log(sha1(JSON.stringify(obj)));
        
        obj._hash = sha1(JSON.stringify(obj));
        this.childSnapshot.ref().set(obj);
    }

    callback(err, obj, this);
};

function StripeObject(stripe, object) {
    this.stripe = stripe;
    this.object = object;
}

StripeObject.prototype.create = function (callback, accessToken, alterRequest) {
    var stripe = this.stripe;
    var object = this.object;

    return function (childSnapshot) {
        var data = childSnapshot.val();

        // Check if object already has Stripe id
        if (data.id) {
            stripe[object.toLowerCase() + 's'].retrieve(data.id, function (err, obj) {
                if (err) {
                    childSnapshot.ref().set({
                        err: err.raw
                    });
                } else {
                    obj._hash = sha1(JSON.stringify(obj));
                    childSnapshot.ref().set(obj);
                }
            });
        } else {
            var create = function (request) {
                // Check if access token should be used
                if (this.accessToken) {
                    this.accessToken = typeof this.accessToken === 'string' ? this.accessToken : this.accessToken(request);
                    stripe[object.toLowerCase() + 's'].create(request, this.accessToken, function(err, obj) {
                        responseHandler.call({
                            accessToken: this.accessToken,
                            action: 'create',
                            callback: callback,
                            childSnapshot: childSnapshot
                        }, err, obj);
                    });
                } else {
                    stripe[object.toLowerCase() + 's'].create(request, function(err, obj) {
                        responseHandler.call({
                            action: 'create',
                            callback: callback,
                            childSnapshot: childSnapshot
                        }, err, obj);
                    });
                }
            };

            // Alter request if user provided a function before creating
            create.call({
                accessToken: accessToken
            }, typeof alterRequest === 'function' ? alterRequest(data) : data);
        }
    };
};

StripeObject.prototype.createChild = function (parentRef, childObject, callback, accessToken, alterRequest) {
    var stripe = this.stripe;
    var object = this.object;

    return function (childSnapshot) {
        var data = childSnapshot.val();
        var parentName = childSnapshot.name();

        var create = function (request) {
            // Handle response from Stripe
            var handleResponse = function (err, childObj) {
                if (err) {
                    childSnapshot.ref().set({
                        err: err.raw
                    });
                    callback(err);
                } else {
                    childSnapshot.ref().remove();
                    stripe[object.toLowerCase() + 's'].retrieve(childObj[object.toLowerCase()], function (err, parentObj) {
                        if (err) {
                            parentRef.child(parentName).set({
                                err: err.raw
                            });
                            callback(err);
                        } else {
                            parentObj._hash = sha1(JSON.stringify(parentObj));
                            parentRef.child(parentName).set(parentObj);
                            callback(null, childObj);
                        }
                    });
                }
            };

            // Get Stripe id of parent object
            parentRef.child(parentName).once('value', function (dataSnapshot) {
                var parentObjectId = dataSnapshot.val().id;

                // Check if access token should be used
                if (accessToken) {
                    accessToken = typeof accessToken === 'string' ? accessToken : accessToken(request);
                    stripe[object.toLowerCase() + 's']['create' + childObject](parentObjectId, request, accessToken, handleResponse);
                } else {
                    stripe[object.toLowerCase() + 's']['create' + childObject](parentObjectId, request, handleResponse);
                }
            });
        };

        // Alter request if user provided a function before creating
        create(alterRequest ? alterRequest(data) : data);
    };
};

StripeObject.prototype.delete = function (callback, accessToken) {
    var stripe = this.stripe;
    var object = this.object;

    return function (oldChildSnapshot) {
        var name = oldChildSnapshot.name();

        // Check if access token should be used
        if (accessToken) {
            accessToken = typeof accessToken === 'string' ? accessToken : accessToken(name);
            stripe[object.toLowerCase() + 's'].del(name, accessToken, responseHandler(oldChildSnapshot, callback, 'delete'));
        } else {
            stripe[object.toLowerCase() + 's'].del(name, responseHandler(oldChildSnapshot, callback, 'delete'));
        }
    };
};

StripeObject.prototype.update = function (keys, callback, accessToken, alterRequest) {
    var stripe = this.stripe;
    var object = this.object;

    return function (childSnapshot) {
        var data = childSnapshot.val();
        var hash = data._hash;
        delete data._hash;
        
        console.log(childSnapshot.name());
        console.log(JSON.stringify(data));
        console.log(sha1(JSON.stringify(data)));
        
        // Check if object has changed via sha1 hash
        if (hash !== sha1(JSON.stringify(data))) {
            // Create update request to send to Stripe
            var request = {};
            for (var i = 0; i < keys.length; i++) {
                var key = keys[i];
                if (data[key]) {
                    request[key] = data[key];
                }
            }
            
            var update = function (request) {
                // Check if access token should be used
                if (this.accessToken) {
                    this.accessToken = typeof this.accessToken === 'string' ? this.accessToken : this.accessToken(request);
                    stripe[object.toLowerCase() + 's'].create(request, this.accessToken, function(err, obj) {
                        responseHandler.call({
                            accessToken: this.accessToken,
                            action: 'create',
                            callback: callback,
                            childSnapshot: childSnapshot
                        }, err, obj);
                    });
                } else {
                    stripe[object.toLowerCase() + 's'].create(request, function(err, obj) {
                        responseHandler.call({
                            action: 'create',
                            callback: callback,
                            childSnapshot: childSnapshot
                        }, err, obj);
                    });
                }
            };

            // Alter request if user provided a function before creating
            update.call({
                accessToken: accessToken
            }, typeof alterRequest === 'function' ? alterRequest(request) : request);
        }
    };
};

module.exports = StripeObject;