const express = require('express'),
bodyParser = require('body-parser'),
jwt    = require('jsonwebtoken'),
http = require('http'),
fs = require('fs'),
https = require('https'),
querystring = require('querystring'),
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
      var cert = fs.readFileSync('jwtbroker.key.pub'); 
      jwt.verify(token, cert, (err, decoded) =>{      
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
  var privateKey = fs.readFileSync('jwtbroker.key');
  var id=req.body.username;
  if(!id){
    res.json({error: "no valid username key in body request, check content-type is application/x-www-form-urlencoded"});
    return
  }
  const payload = {
      userID:  id
    };
  var token = jwt.sign(payload, privateKey, {
    expiresIn: "365d",
    algorithm:'RS256'
  });
  res.json({
    token: token
  });
})

authRoutes.get('/getTicket',async (req,res)=>{
  try {
    var tck=await getTabTicket(config.tabserver,req.decoded.userID);
    res.json(tck)
  } catch (error) {
    res.send(error)
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
        port:url.port,
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