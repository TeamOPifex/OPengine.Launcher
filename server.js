require('dotenv').load();
var connect = require('connect');
var serveStatic = require('serve-static');
var bodyParser = require('body-parser');
var qs = require('qs');
var request = require('request');

var app = connect();

app.use(bodyParser.urlencoded());

app.use(serveStatic(__dirname + '/build'));

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
           console.log('ERROR: ', err, u);
           if(err) return;

           if(u && u.email) {
               console.log(u.email);
           } else {
			   res.writeHead(301, { Location: 'http://launcher.opengine.io/noemail.html?access_token=' + params2.access_token });
			   res.end();
			   return;
		   }

           request.post({url:'http://opengine.io/add', formData: { email: u.email }}, function(err, res2, body2) {
               //console.log(err, res2, body2);
               var res3 = JSON.parse(body2);
               if(res3.claimed) {
                   res.writeHead(301, {Location: 'http://launcher.opengine.io/access.html?access_token=' + params2.access_token});
                   res.end();
                   return;
               }
               request({url: 'http://opengine.io/github?state=' + res3.token}, function(err2, res4, body3) {
                   //console.log(err2,res4, body3);
                  res.writeHead(301, {Location: 'http://launcher.opengine.io/access.html?access_token=' + params2.access_token});
                  res.end();
               });
           });
       });

    });

} else if(req._parsedUrl.pathname == '/signup') {

    var params2 = qs.parse(req._parsedUrl.query);

    request.post({url:'http://opengine.io/add', formData: { email: u.email }}, function(err, res2, body2) {
        //console.log(err, res2, body2);
        var res3 = JSON.parse(body2);
        if(res3.claimed) {
            res.writeHead(301, {Location: 'http://launcher.opengine.io/access.html?access_token=' + params2.access_token});
            res.end();
            return;
        }
        request({url: 'http://opengine.io/github?state=' + res3.token}, function(err2, res4, body3) {
            //console.log(err2,res4, body3);
           res.writeHead(301, {Location: 'http://launcher.opengine.io/access.html?access_token=' + params2.access_token});
           res.end();
        });
    });

    }
  else {
    res.end('Hello from the OPengine Launcher!\n');
  }
});

app.listen(3060);
