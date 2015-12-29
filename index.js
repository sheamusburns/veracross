var https = require('https');
var querystring = require('querystring');
var parser = require('xml2js').parseString;



module.exports = (function(){

	return {
		apiOptions: {},
		setOptions : function(domainID, user, pass) {
				this.apiOptions.host = 'veracross.com';
				this.apiOptions.domainID = domainID;
				this.apiOptions.auth = user + ':' + pass;
				//console.log(this.apiOptions);
				return;
		},
		get: function(endpoint, query, callback) {
			var that = this;
			var endpoint = endpoint;
			var queryObj = querystring.parse(query);
			var countPerPage = function(obj) {
				return queryObj.count ? Number(queryObj.count) : 1000;
			};

			var whichJSON = endpoint + '.json' + '?' + query;
			console.log('GET: acquiring details on %s', endpoint, whichJSON);
			var pageNum = 1;
			var pageQuery = function() {
				return '&page=' + pageNum;
			};
			var options = function(){
				return {
					host: 'api.' + that.apiOptions.host,
					path: '/' + that.apiOptions.domainID + '/v2/' + whichJSON + pageQuery(), //count must be larger than the number of people in the db
					auth: that.apiOptions.auth
				};
			};
			var xTotal;
			var pages;
			var tempdata = '';
			var data = [];

			var initReq = https.get(options(), function(res) {
				xTotal = res.headers['x-total-count'];
				pages = Math.ceil(xTotal / countPerPage());
				console.log('GET: num of calls to make:', pages);
				console.log('GET: ...start api calls...\nGET:   getting %s objects', xTotal);
				apiCall();
				function apiCall() {
					tempdata = '';
					https.get(options(), function(res) {
						console.log('GET:     ' + endpoint + ' Call ' + pageNum + ', STATUS: ' + res.headers.status);
						//console.log('\nHEADERS: ' + JSON.stringify(res.headers));
						res.on('data', function(chunk) {
							tempdata += chunk
						});
						res.on('end', function(){
							data = data.concat(JSON.parse(tempdata));
							pageNum++
							pageQuery();
							options();
							if (pageNum > pages) {
								console.log('GET:   got %s objects\nGET: ...end api calls...', data.length);
								callback(data);
							}
							else {
								apiCall();
							}
						});
					});
				}
			});
		},
		authenticate: function(user, pass, callback){
			var that = this;
			var options = (function() {
				var query = querystring.stringify({
			  		username: user,
			  		password: pass
				});
				return {
			  		hostname: 'portals.' + that.apiOptions.host,
			  		path: '/' + that.apiOptions.domainID + '/authenticate?' + query,
			  		method: 'POST',
			  		auth: that.apiOptions.auth
				};
			})();

			var req = https.request(options, function(res) {
				data = '';
				console.log("\nAUTH: authentication call status: ", res.headers.status);
				//console.log("headers: ", res.headers);
				
				res.on('data', function(d) {
			    	data += d;
			  	});
			  	res.on('end', function(){
			  		parser(data, function(err, result){
			  			if (err) throw err;
			  			else if (result.auth.status[0] === 'success') {
			  				console.log('AUTH: Authentication successful. user returned.');
			  				callback(result);
			  			} else {
			  				console.log('AUTH: Authentication failed. Try again.')
			  			}
			  			
			  		});
			  	});
			});
			req.end();


			req.on('error', function(e) {
					console.error(e);
			});
		}
	}
})();