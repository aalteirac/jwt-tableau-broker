const express = require('express'),
bodyParser = require('body-parser'),
jwt    = require('jsonwebtoken'),
http = require('http');
https = require('https');
querystring = require('querystring');
config = require('./config'),

app = express(); 

app.set('Secret', config.secret);

app.use(bodyParser.urlencoded({ extended: true }));

app.use(bodyParser.json());
const  authRoutes = express.Router(); 
app.use('/api', authRoutes);

authRoutes.use((req, res, next) =>{
    var token = req.headers['access-token'];
    if (token) {
      jwt.verify(token, app.get('Secret'), (err, decoded) =>{      
        if (err) {
          return res.json({ success: false, message: 'Failed to authenticate token.' });    
        } else {
          req.decoded = decoded;    
          next();
        }
      });
    } else {
      return res.status(403).send({ 
          message: 'What the hell are thinking? You need a JWT to enter!' 
      }); 
    }
  });

app.listen(3000,()=>{
 console.log('server is running on port 3000') 
});

app.get('/', function(req, res) {
  res.send('App is running on http://localhost:3000/');
});

//JUST FOR TEST PURPOSE, REMOVE IT ASAP :-)
app.post('/gimmeJWT',(req,res)=>{
  const payload = {
      ofcourse:  true
    };
  var token = jwt.sign(payload, app.get('Secret'), {
    expiresIn: "365d"
  });
  res.json({
    token: token
  });
})
authRoutes.get('/getTicket',async (req,res)=>{
  if(req.query.username){
    var tck=await getTabTicket(config.tabserver,req.query.username);
    res.json(tck)
  }
  else{
    res.send("No username query param defined, come on... how can I request a session if I don't have the user name....");
  }
})

function getTabTicket(tableauServer, username, site){
  return new Promise((resolve,reject)=>{
    let url = new URL(tableauServer + '/trusted');
    let body = {
        username: username,
    };
    if (site) {
        body['target_site'] = site;
    }
    let postData = querystring.stringify(body);
    let proto = http;
    if (url.protocol === 'https:') {
        proto = https;
    }
    let req = proto.request({
        method: 'POST',
        hostname: url.hostname,
        path: '/trusted',
        headers: {'Content-Type': 'application/x-www-form-urlencoded'}
    }, function (response) {
        let ticketData = '';
        response.on('data', function (chunk) {
            ticketData += chunk;
        });
        response.on('end', function () {
            let contents = {ticket: ticketData};
            resolve(contents);
        });
    });
    req.on('error', function (error) {
      reject(error);
      console.log('ERROR: ' + error);
    });
    req.write(postData);
    req.end();
  })  
}