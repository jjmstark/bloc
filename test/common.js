'use strict';

var chai = require("chai");
var mocha = require('mocha');
var expect = chai.expect;
var promise = require('bluebird');
var assert = require('assert');

var blockapps = require("blockapps-js");

function makeid(){
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < 5; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    return text;
}

var options = {
    foo: "foo",
    address: "e1fd0d4a52b75a694de8b55528ad48e2e2cf7859",
    password: 'thepassword',
    username: makeid()
};

exports.options = options;
exports.chai = chai;
exports.blockapps = blockapps;
exports.assert = chai.assert;
exports.promise = promise;