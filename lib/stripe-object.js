/*
 *
 * https://github.com/davidcaseria/StripeFire
 *
 * Copyright (c) 2014 David Caseria
 * Licensed under the MIT license.
 */

'use strict';

var sha1 = require('sha1');

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
                // Handle response from Stripe
                var handleResponse = function (err, obj) {
                    if (err) {
                        childSnapshot.ref().set({
                            err: err.raw
                        });
                    } else {
                        obj._hash = sha1(JSON.stringify(obj));
                        childSnapshot.ref().set(obj);
                        callback(null, obj);
                    }
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
};

StripeObject.prototype.createChild = function (parentRef, childObject, callback, accessToken, alterRequest) {
    var stripe = this.stripe;
    var object = this.object;

    return function (childSnapshot) {
        var data = childSnapshot.val();
        var parentName = childSnapshot.name();

        var create = function (request) {
            // Handle response from Stripe
            var handleReponse = function (err, childObj) {
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

StripeObject.prototype.delete = function (callback, accessToken) {
    var stripe = this.stripe;
    var object = this.object;

    return function (oldChildSnapshot) {
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

StripeObject.prototype.update = function (keys, callback) {
    var stripe = this.stripe;
    var object = this.object;

    return function (childSnapshot) {
        var data = childSnapshot.val();
        var hash = data._hash;
        delete data._hash;

        // Handle response from Stripe
        var handleResponse = function (err, obj) {
            if (err) {
                childSnapshot.ref().set({
                    err: err.raw
                });
            } else {
                obj._hash = sha1(JSON.stringify(obj));
                childSnapshot.ref().set(obj);
                callback(null, obj);
            }
        };

        // Check if object has changed via sha1 hash
        if (hash !== sha1(JSON.stringify(data))) {
            // Create update object to send to Stripe
            var obj = {};
            for (var i = 0; i < keys.length; i++) {
                var key = keys[i];
                if (data[key]) {
                    obj[key] = data[key];
                }
            }

            stripe[object.toLowerCase() + 's'].update(data.id, obj, handleResponse);
        }
    };
};

module.exports = StripeObject;