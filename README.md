# PinnedHTTPS-Phonegap-Plugin


A phonegap plugin that will allow you to make HTTPS requests with certificate fingerprint verification


## Installation


```
phonegap plugin add https://github.com/LockateMe/PinnedHTTPS-Phonegap-Plugin
```

## Usage

This plugin compiles and has been tested as part of an other project (a phonegap app).

__NOTE:__ [There currently is an issue on iOS 7/8](http://stackoverflow.com/questions/25566647/nsurlconnectiondelegate-willsendrequestforauthenticationchallenge-wont-get-call)

```js
// The `fingerprints` parameter must either be a string or an array of strings; each string must be an SHA1 hash
var https = new navigator.httpsBuilder(fingerprints);

https.get('https://yoursite.tld/yourpath', function(err, res){
	if (err){
		//Handle errors here. err is a string
		if (err == 'INVALID_CERT'){
			//Certificate found on server doesn't match the provided fingerprint
		} else {
			//Other kinds of connection errors. Messages are more "human friendly"
		}
	} else {
		res.statusCode //Number
		res.headers //Object
		res.body //String
	}
});

var reqOptions = {method:'post', host:'yoursite.tld', path: '/yourpath', [port: 443], [headers: {header1: 'value1', header2: 'value2'}], [body: {}]};

https.request(reqOptions, function(err, res){
	if (err){
		//Handle errors here. err is a string
		if (err == 'INVALID_CERT'){
			//Certificate found on server doesn't match the provided fingerprint
		} else {
			//Other kinds of connection errors. Messages are more "human friendly"
		}
	} else {
		res.statusCode //Number
		res.headers //Object
		res.body //String
	}
});
```
