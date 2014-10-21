/*
 *
 * https://github.com/davidcaseria/StripeFire
 *
 * Copyright (c) 2014 David Caseria
 * Licensed under the MIT license.
 */

'use strict';

var hash = require('hash-object');

// Creates a function to handle responses from Stripe
var responseHandler = function(err, obj) {
    var callback = typeof this.callback === 'function' ? this.callback : function() {};
    delete this.callback;
    
    if (err) {
        this.childSnapshot.ref().set({
            err: err.raw
        });
    } else if(this.action !== 'delete') {
        obj._hash = hash(obj);
        this.childSnapshot.ref().set(obj);
    }

    callback.call(this, err, obj);
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
            // Retrieve stripe object and store in location
            stripe[object.toLowerCase() + 's'].retrieve(data.id, function (err, obj) {
                if (err) {
                    childSnapshot.ref().set({
                        err: err.raw
                    });
                } else {
                    obj._hash = hash(obj);
                    childSnapshot.ref().set(obj);
                }
            });
        } else {
            // Generate access token if a function is provided
            if(typeof accessToken === 'function') {
                accessToken = accessToken.call({
                    action: 'create',
                    childSnapshot: childSnapshot
                }, data);
            }
            
            // Alter request if function is provided
            if(typeof alterRequest === 'function') {
                data = alterRequest.call({
                    accessToken: accessToken,
                    action: 'create',
                    childSnapshot: childSnapshot
                }, data);
            }
            
            // Check if access token should be used on create
            if (accessToken) {
                stripe[object.toLowerCase() + 's'].create(data, accessToken, function(err, obj) {
                    responseHandler.call({
                        accessToken: accessToken,
                        action: 'create',
                        callback: callback,
                        childSnapshot: childSnapshot
                    }, err, obj);
                });
            } else {
                stripe[object.toLowerCase() + 's'].create(data, function(err, obj) {
                    responseHandler.call({
                        action: 'create',
                        callback: callback,
                        childSnapshot: childSnapshot
                    }, err, obj);
                });
            }
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
                            parentObj._hash = hash(parentObj);
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
        var data = oldChildSnapshot.val();
        
        // Generate access token if a function is provided
        if(typeof accessToken === 'function') {
            accessToken = accessToken.call({
                action: 'delete',
                childSnapshot: oldChildSnapshot
            }, data);
        }
        
        if (accessToken) {
            stripe[object.toLowerCase() + 's'].del(data.id, accessToken, function(err, obj) {
                responseHandler.call({
                    accessToken: accessToken,
                    action: 'delete',
                    callback: callback,
                    childSnapshot: oldChildSnapshot
                }, err, obj);
            });
        } else {
            stripe[object.toLowerCase() + 's'].del(data.id, function(err, obj) {
                responseHandler.call({
                    accessToken: accessToken,
                    action: 'delete',
                    callback: callback,
                    childSnapshot: oldChildSnapshot
                }, err, obj);
            });
        }
    };
};

StripeObject.prototype.update = function (keys, callback, accessToken, alterRequest) {
    var stripe = this.stripe;
    var object = this.object;

    return function (childSnapshot) {
        var data = childSnapshot.val();
        var _hash = data._hash;
        delete data._hash;
        
        // Check if object has changed via sha1 hash (or is an error)
        if (!data.err && _hash !== hash(data)) {
            // Create update request to send to Stripe
            var request = {};
            for (var i = 0; i < keys.length; i++) {
                var key = keys[i];
                if (data[key]) {
                    request[key] = data[key];
                }
            }
            
            // Generate access token if a function is provided
            if(typeof accessToken === 'function') {
                accessToken = accessToken.call({
                    action: 'update',
                    childSnapshot: childSnapshot
                }, data);
            }
            
            // Alter request if function is provided
            if(typeof alterRequest === 'function') {
                request = alterRequest.call({
                    accessToken: accessToken,
                    action: 'update',
                    childSnapshot: childSnapshot
                }, request);
            }
            
            // Check if access token should be used on update
            if (accessToken) {
                stripe[object.toLowerCase() + 's'].update(data.id, request, accessToken, function(err, obj) {
                    responseHandler.call({
                        accessToken: accessToken,
                        action: 'update',
                        callback: callback,
                        childSnapshot: childSnapshot
                    }, err, obj);
                });
            } else {
                stripe[object.toLowerCase() + 's'].update(data.id, request, function(err, obj) {
                    responseHandler.call({
                        action: 'update',
                        callback: callback,
                        childSnapshot: childSnapshot
                    }, err, obj);
                });
            }
        }
    };
};

module.exports = StripeObject;