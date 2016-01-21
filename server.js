require('dotenv').load();
var connect = require('connect');
var serveStatic = require('serve-static');
var bodyParser = require('body-parser');
var qs = require('qs');
var request = require('request');

var app = connect();

app.use(bodyParser.urlencoded());

app.use(serveStatic(__dirname + '/build'));


function InviteToOrg(access_token) {

    var Github = require('github-api');
    var github = new Github({
        token: access_token,
        auth: "oauth"
    });

    var githubUser = github.getUser();
    githubUser.show(null, function(err, data) {
        var url = 'https://api.github.com/orgs/TeamOPifex/memberships/' + data.login + '?client_id=3a4a417d211d47f1ff03&client_secret=91c847760ce92ec9a41d8664e9bc30104b251ddf&role=member'
        var request = require('request');
        request.put({
        	url: url,
        	headers: {
        		'Accept': 'application/vnd.github.v3+json',
        		'Authorization': 'token ' + process.env.GITHUB_ACCESS_TOKEN,
        		'User-Agent': 'OPifex.Engine.Web'
        	}
        }, function (error, response, body) {
        	console.log(error, body);
        });
    });

}

function AddToTeam(access_token) {


        var Github = require('github-api');
        var github = new Github({
            token: access_token,
            auth: "oauth"
        });

        var githubUser = github.getUser();
        githubUser.show(null, function(err, data) {
            var url = 'https://api.github.com/teams/1810869/memberships/' + data.login + '?role=member'
            var request = require('request');
            request.put({
            	url: url,
            	headers: {
            		'Accept': 'application/vnd.github.v3+json',
            		'Authorization': 'token 40c7b0217c4843cd02e73d729a48580dca0f4716',
            		'User-Agent': 'OPifex.Engine.Web'
            	}
            }, function (error, response, body) {
            	console.log(error, body);
            });
        });

}

app.use(function(req, res) {
  if(req._parsedUrl.pathname == '/authentication') {

    console.log(req._parsedUrl);
    var params = qs.parse(req._parsedUrl.query);
    console.log(params);

    // https://github.com/login/oauth/access_token
    var url = 'https://github.com/login/oauth/access_token';
    url += '?client_id=' + process.env.GITHUB_CLIENT_ID;
    url += '&client_secret=' + process.env.GITHUB_SECRET_ID;
    url += '&code=' + params.code;
    url += '&redirect_uri=' + 'http://launcher.opengine.io/authentication/access';

    request({url: url}, function (error, response, body) {
       // Do more stuff with 'body' here
       //console.log(body);
       params2 = qs.parse(body);

       console.log('ACCESS TOKEN: ' + params2.access_token);

       var Github = require('github-api');
       var github = new Github({
         token: params2.access_token,
         auth: "oauth"
       });
       var user = github.getUser();
       //console.log('USER: ', user);

       user.show(null, function(err, u) {
           //console.log('ERROR: ', err, u);
		   console.log('!user.show');
           if(err) return;

           if(u && u.email) {
               console.log(u.email);
           } else {
				console.log('redirect to no-email');
			   res.writeHead(301, { Location: 'http://launcher.opengine.io/noemail.html?access_token=' + params2.access_token + '&d=' + (+new Date) });
			   res.end();
			   return;
		   }

		   console.log('!adding');
           request.post({url:'http://opengine.io/add', formData: { email: u.email }}, function(err, res2, body2) {
			console.log('!added');
               //console.log(err, res2, body2);
               var res3 = JSON.parse(body2);
               if(res3.claimed) {
                   res.writeHead(301, {Location: 'http://launcher.opengine.io/access.html?access_token=' + params2.access_token + '&d=' + (+new Date)});
                   res.end();
                   return;
               }
               request({url: 'http://opengine.io/github?state=' + res3.token}, function(err2, res4, body3) {
                   //console.log(err2,res4, body3);
                  InviteToOrg(params2.access_token);
                  res.writeHead(301, {Location: 'http://launcher.opengine.io/access.html?access_token=' + params2.access_token + '&d=' + (+new Date)});
                  res.end();
               });
           });
       });

    });

    } else if(req._parsedUrl.pathname == '/addemail') {

		   console.log('!/addemail');

        var params2 = qs.parse(req._parsedUrl.query);

		console.log('Add Request');
	   request.post({url:'http://opengine.io/add', formData: { email: params2.email }}, function(err, res2, body2) {
		console.log('yay');
		   //console.log(err, res2, body2);
		   var res3 = JSON.parse(body2);
		   if(res3.claimed) {
			   res.writeHead(301, {Location: 'http://launcher.opengine.io/access.html?access_token=' + params2.access_token + '&d=' + (+new Date)});
			   res.end();
			   return;
		   }
		   request({url: 'http://opengine.io/github?state=' + res3.token + "&code=" + params2.access_token }, function(err2, res4, body3) {
			   //console.log(err2,res4, body3);
              InviteToOrg(params2.access_token);
			  res.writeHead(301, {Location: 'http://launcher.opengine.io/access.html?access_token=' + params2.access_token + '&d=' + (+new Date)});
			  res.end();
		   });
	   });

   } else if(req._parsedUrl.pathname == '/addteam') {
       var params2 = qs.parse(req._parsedUrl.query);
       AddToTeam(params2.access_token);
       res.writeHead(301, {Location: 'http://launcher.opengine.io/access.html?access_token=' + params2.access_token + '&d=' + (+new Date)});
       res.end();
   } else {
		console.log(req._parsedUrl.pathname);
        res.end('Hello from the OPengine Launcher!\n');
    }
});

app.listen(3060);
