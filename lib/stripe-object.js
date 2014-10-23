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
    } else if(this.action !== 'delete' && !this.child) {
        obj._hash = hash(obj);
        this.childSnapshot.ref().set(obj);
    }

    callback.call(this, err, obj);
};

function StripeObject(stripe, object) {
    this.stripe = stripe;
    this.object = object;
}

StripeObject.prototype.child = function (parentRef, childObject, keys, callback, accessToken, alterRequest) {
    var stripe = this.stripe;
    var object = this.object;

    return function (childSnapshot) {
        var data = childSnapshot.val();
        var name = childSnapshot.name();
        
        var action = data.id ? (data.deleted ? 'delete' : 'create') : 'update';
        
        // Generate access token if a function is provided
        if(typeof accessToken === 'function') {
            accessToken = accessToken.call({
                action: action,
                childSnapshot: childSnapshot
            }, data);
        }
        
        // Alter request if function is provided
        if(typeof alterRequest === 'function') {
            data = alterRequest.call({
                accessToken: accessToken,
                action: action,
                childSnapshot: childSnapshot
            }, data);
        }
        
        // Specify context for response handler
        var context = {
            accessToken: accessToken,
            action: action,
            callback: callback,
            child: true,
            childSnapshot: childSnapshot
        };
        
        // Get Stripe id of parent object
        parentRef.child(name).once('value', function (dataSnapshot) {
            var parentObjectId = dataSnapshot.val().id;
            
            // Create args array to send to Stripe function
            var args = [parentObjectId];
            
            if(action === 'create') {
                args.push(data);
            } else if(action === 'update') {
                args.push(data.id);
                
                var request = {};
                for (var i = 0; i < keys.length; i++) {
                    var key = keys[i];
                    if (data[key]) {
                        request[key] = data[key];
                    }
                }
                args.push(request);
            } else {
                args.push(data.id);
            }
            
            if(accessToken) {
                args.push(accessToken);
            }
            
            args.push(function(err, obj) {
                responseHandler.call(context, err, obj);
                if(accessToken) {
                    stripe[object.toLowerCase() + 's'].retrieve(obj[object.toLowerCase()], accessToken, function (err, obj) {
                        responseHandler.call({
                            childSnapshot: dataSnapshot
                        }, err, obj);
                    });
                } else {
                    stripe[object.toLowerCase() + 's'].retrieve(obj[object.toLowerCase()], function (err, obj) {
                        responseHandler.call({
                            childSnapshot: dataSnapshot
                        }, err, obj);
                    });
                }
            });
            
            // Call Stripe child action function
            stripe[object.toLowerCase() + 's'][action + childObject].apply(null, args);
        });
    };
};

StripeObject.prototype.create = function (callback, accessToken, alterRequest) {
    var stripe = this.stripe;
    var object = this.object;

    return function (childSnapshot) {
        var data = childSnapshot.val();
        
        // Generate access token if a function is provided
        if(typeof accessToken === 'function') {
            accessToken = accessToken.call({
                action: 'create',
                childSnapshot: childSnapshot
            }, data);
        }
        
        // Specify context for response handler
        var context = {
            accessToken: accessToken,
            callback: callback,
            childSnapshot: childSnapshot
        };

        // Check if object already has Stripe id
        if (data.id) {
            // Specify context action for response handler
            context.action = 'retrieve';
            
            // Check if access token should be used on retrieve
            if (accessToken) {
                stripe[object.toLowerCase() + 's'].retrieve(data.id, accessToken, function (err, obj) {
                    responseHandler.call(context, err, obj);
                });
            } else {
                stripe[object.toLowerCase() + 's'].retrieve(data.id, function (err, obj) {
                    responseHandler.call(context, err, obj);
                });
            }
        } else {
            // Alter request if function is provided
            if(typeof alterRequest === 'function') {
                data = alterRequest.call({
                    accessToken: accessToken,
                    action: 'create',
                    childSnapshot: childSnapshot
                }, data);
            }
            
            // Specify context action for response handler
            context.action = 'create';
            
            // Create args array to send to Stripe function
            var args = [data];
            
            if(accessToken) {
                args.push(accessToken);
            }
            
            args.push(function(err, obj) {
                responseHandler.call(context, err, obj);
            });
            
            // Call Stripe create function
            stripe[object.toLowerCase() + 's'].create.apply(this, args);
        }
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
        
        // Specify context for response handler
        var context = {
            accessToken: accessToken,
            action: 'delete',
            callback: callback,
            childSnapshot: oldChildSnapshot
        };
        
        // Create args array to send to Stripe function
        var args = [data.id];

        if(accessToken) {
            args.push(accessToken);
        }

        args.push(function(err, obj) {
            responseHandler.call(context, err, obj);
        });

        // Call Stripe delete function
        stripe[object.toLowerCase() + 's'].del.apply(null, args);
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
            
            // Specify context for response handler
            var context = {
                accessToken: accessToken,
                action: 'update',
                callback: callback,
                childSnapshot: childSnapshot
            };
            
            // Create args array to send to Stripe function
            var args = [data.id, request];

            if(accessToken) {
                args.push(accessToken);
            }

            args.push(function(err, obj) {
                responseHandler.call(context, err, obj);
            });

            // Call Stripe update function
            stripe[object.toLowerCase() + 's'].update.apply(null, args);
        }
    };
};

module.exports = StripeObject;