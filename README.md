# veracross

> get API data from Veracross in JSON  
> authenticate a user and return a user object upon success

## Install 
```
npm install --save veracross
```
 

## Usage

```
var veracross = require('veracross');
var apiData;
var user;

// set the API creds/details
veracross.setOptions('domainID', 'api.username', 'myApiPassword');

// asynchronous get request to endpoint
veracross.get('endpoint', 'count=1000', function(data){
	apiData = data;
});

// asynchronous authentication check on user credentials
veracross.authenticate('username', 'password', function(user){
	user = user;
});
```

## API

### .apiOptions
the `apiOptions` property is initialized as an empty object. `.setOptions()` assigns the properties needed for `.get()` and `.authenticate()` to run properly.


### .setOptions(domainID, apiUser, apiPass)

`domainID` is the string after the host in your Veracross URL. For example, if your Veracross URL is http://portals.veracross.com/starfleetacademy then you should use 'starfleetacademy' as the domainID in `.setOptions()`.  
`apiUser` and `apiPass` are the api username and password.


### .get(endpoint, query, callback)

`endpoint` is a string for the particular endpoint defined by Veracross. See the Veracross API documentation. `'.json'` concat happens automatically in the script.

`query` is a string that takes the form `'queryID1=val1,queryID2=val2'` No need to include the `?` -- that's added in the script. The `callback` function takes one argument `data` which holds the API data returned by `.get()` 

### .authenticate(username, password, callback)

`username` and `password` are credentials of the user for the function to check. `callback` function takes one argument. A successful authentication will return a `user` object.

Any errors will be thrown before the callback and print to the console.


## NOTES  
- this module calls the V2 API
- `.get()` retrieves JSON