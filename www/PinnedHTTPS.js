"use strict";
var exec = require('cordova/exec');

function PinnedHTTPS(expectedFingerprints){
	if (!(typeof expectedFingerprints == 'string' || Array.isArray(expectedFingerprints))) throw new TypeError('expectedFingerprints must either be a string or an array of strings');

	if (typeof expectedFingerprints == 'string') expectedFingerprints = [expectedFingerprints];

	var fingerprintType;
	for (var i = 0; i < expectedFingerprints.length; i++){
		expectedFingerprints[i] = expectedFingerprints[i].trim().replace(/ +/g, '').toLowerCase();
		//Checking that the fingerprint has a valid format
		if (!(isSHA1(expectedFingerprints[i]) || isSHA256(expectedFingerprints[i]))) throw new TypeError('invalid fingerprint ' + expectedFingerprints[i]);
		//Checking that all fingerprints are of the same type
		if (i == 0){
			if (isSHA1(expectedFingerprints[i])) fingerprintType = 'SHA1';
			else fingerprintType = 'SHA256';
		} else {
			if (fingerprintType == 'SHA1'){
				if (!isSHA1(expectedFingerprints[i])) throw new TypeError('All fingerprints must be of the same type. Fingerprint ' + expectedFingerprints[i] + ' is not SHA1');
			} else {
				if (!isSHA256(expectedFingerprints[i])) throw new TypeError('All fingerprints must be of the same type. Fingerprint ' + expectedFingerprints[i] + ' is not SHA256');
			}
		}
	}

	this.getFingerprints = function(){ return expectedFingerprints; };

	this.get = function(url, callback){
		if (typeof url != 'string') throw new TypeError('url must be a string');
		if (typeof callback != 'function') throw new TypeError('callback must be a function');

		var cordovaParams = [url, JSON.stringify(expectedFingerprints)];

		cordova.exec(responseHandler, errorHandler, 'PinnedHTTPS', 'get', cordovaParams);

		function responseHandler(responseObj){
			if (typeof responseObj == 'string') responseObj = JSON.parse(responseObj);
			callback(null, responseObj);
		}

		function errorHandler(errObj){
			callback(errObj);
		}
	};

	this.request = function(options, callback){
		if (typeof options != 'object') throw new TypeError('options must be an object');
		if (typeof callback != 'function') throw new TypeError('callback must be a function');

		//Checking mandatory field of options
		if (typeof options.host != 'string') throw new TypeError('options.host must be a defined string');
		if (typeof options.port == 'number'){
			if (!(options.port > 0 && Math.floor(options.port) == options.port)) throw new TypeError('when defined, port must be a strictly positive integer');
		} else options.port = 443;
		if (options.method){
			if (typeof options.method != 'string') throw new TypeError('when defined, options.method must be a string');
		} else options.method = 'get';
		if (options.headers){
			if (typeof options.headers != 'object') throw new TypeError('when defined, options.headers must be an object');
			var headerKeys = Object.keys(options.headers);
			for (var i = 0; i < headerKeys.length; i++){
				var currentHeaderType = typeof options.headers[headerKeys[i]];
				if (!(currentHeaderType == 'string' || currentHeaderType == 'number' && currentHeaderType == 'boolean')) throw new TypeError('when defined, options.headers must only contain values of types strings, numbers or booleans');
			}
		}

		var cordovaParams = [JSON.stringify(options), JSON.stringify(expectedFingerprints)];

		cordova.exec(responseHandler, errorHandler, 'PinnedHTTPS', 'req', cordovaParams);

		function responseHandler(responseObj){
			if (typeof responseObj == 'string') responseObj = JSON.parse(responseObj);
			if (options.returnBuffer){
				var bodyLength = parseInt(responseObj.headers['Content-Length']);
				var downSizedBody = new Uint8Array(bodyLength);
				for (var i = 0; i < bodyLength; i++){
					downSizedBody[i] = (responseObj.body[i] + 256) % 256;
				}
				responseObj.body = downSizedBody;
			}
			callback(null, responseObj);
		}

		function errorHandler(errObj){
			callback(errObj);
		}
	}
}

module.exports = PinnedHTTPS;

function isHex(s){
	return typeof s == 'string' && s.length % 2 == 0 && /^([a-f]|[0-9])+$/i.test(s);
}

function isSHA1(s){
	return isHex(s) && s.length == 40;
}

function isSHA256(s){
	return isHex(s) && s.length == 64;
}
