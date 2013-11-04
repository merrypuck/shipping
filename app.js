/**
    * This code is the property of ShippingLocal Inc. and can not be copied
    * or redistributed without permission.
    *
    * Author(s):
    * -------
    *	Aaron Landy (aaronlan95@gmail.com)
    *
    *
*/

var express = require('express');
var connect = require('connect');
var http = require('http');
var path = require('path');
var sendgrid  = require('sendgrid')('crystal1', 'hacktnw');


var mongoose = require('mongoose');
var shipping_mongoose = require('./lib/shipping_mongoose');

var app = express();
var server = http.createServer(app);

//render html files instead of ejs files.
app.engine('html', require('ejs').renderFile);

app.configure(function(){
  app.set('port', 8000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'html');
  app.set('view options', {layout: false});
  app.use(connect.cookieParser('cookieKey8147530089'));
  app.use(connect.session({
    secret: 'sessionSecretKey8147530089',
    cookie: {maxAge : 7200000} // Expiers in 2 hours
    }));
  app.use(express.bodyParser());
  app.use(express.favicon()); 
  app.use(express.methodOverride());


app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));
});

app.use(function(req, res, next){
  // the status option, or res.statusCode = 404
  // are equivalent, however with the option we
  // get the "status" local available as well
  res.render('404', { status: 404, url: req.url });

});

app.use(function(req, res, next){
    res.render('500', {
      status: err.status || 500
    , error: err
  });

});



app.configure('development', function(){
  app.use(express.errorHandler());
});


function randomString(length) {
    var chars = '0123456789'.split('');

    if (! length) {
        length = Math.floor(Math.random() * chars.length);
    }

    var str = '';
    for (var i = 0; i < length; i++) {
        str += chars[Math.floor(Math.random() * chars.length)];
    }
    return str;
}

shipping_mongoose.init();
var User = mongoose.model('User', { 
  _id: String,
  firstName: String,
  lastName: String,
  address: String,
  cellNumber: String,
  email: String,
  password: String
});

var Delivery = mongoose.model('Delivery', {
  _id: String,
  pickupDate: String,
  pickupTime: String,
  pickupAddress: String,
  pickupDetails: String,

  deliveryDate: String,
  deliveryTime: String,
  deliveryAddress: String,
  deliveryDetails: String,
  deliveryStatus: String
});

app.get('/', function(req, res) {
  if(!req.session.userId) {
    res.render('login', {
      error : ''
    });
  }
  else {
    res.redirect('/wall')
  }
});


app.get('/login', function(req, res) {
  if(!req.session.userId) {
    res.render('login', {
     error : ''
    });
  }
  else {
    res.redirect('/wall')
  }
     
});

app.post('/login', function(req, res) {
  var email = req.body.email;
  console.log('email : ' + email);
  var password = req.body.password;
  User.findOne({'email' : email}, function(err, obj) {
        if(err || obj === null) {
          res.render('login', {
            error : 'Sorry, your email was not found.'
          });
        }
        else {
          if(password === obj.password) {
            console.log('obj :' + obj);
            req.session.userId = obj._id;
            res.redirect('/wall');
          }
          else {
             console.log('obj :' + obj);
            res.render('login', {
              error : 'Sorry, you email and password did not match.'
            });
          }
          
        }
    });
});

app.get('/signup', function(req, res) {
  res.render('signup', {
    error : 'Sorry some of that information is incorrect.'
  });
});
app.post('/signup', function(req, res) {
  var data = req.body;
  var userId = randomString(5);
  var user = new User({
            '_id' : userId,
            'firstName' : req.body.firstName,
            'lastName' : req.body.lastName,
            'address' : req.body.address,
            'zip' : req.body.zip,
            'cell' : req.body.cellNumber,
            'email' : req.body.email,
            'password': req.body.password,

            'companyName' : req.body.companyName,
            'companyAddress' : req.body.companyAddress,
            'companyNumber' : req.body.companyNumber,

            'billingFirstName' : req.body.billingFirstName,
            'billingLastName' : req.body.billingLastName,
            'billingAddress' : req.body.billingAddress,
            'billingZip' : req.body.billingZip,
            'billingCreditCard' : req.body.billingCreditCard,
            'billingExpiration' : req.body.billingExpiration,
            'billingPin' : req.body.billingPin
  });

  user.save(function (err) {
    if (err) {// ...
      console.log('mongoose error.');
      res.render('/', {});
    }
    else {
      sendgrid.send({
        to:      req.body.email,
        from:     'blandy@stonelandcapital.com',
        subject:  'hey you just won the loto',
        text:     'Shipping...confirmation, click this link'
      }, function(err, json) {
        if (err) { return console.error(err); }
        console.log(json);
      });
      req.session.userId = userId;
      res.redirect('wall');

    }
  });

});


app.get('/profile', function(req, res) {
  if(req.session.userId) {
     User.findOne({'_id' : req.session.userId}, function(err, obj) {
        if(err) {
        }
        else {
            res.render('user', {
              user: obj
            });
        }
    });
  }
  else {
    res.redirect('login');
  }
  
});

app.get('/id/:id', function(req, res) {
    console.log(req.body.email);
        
    shipping_mongoose.findFirst(User, {'_id' : req.params.id}, function(err, obj) {
    
    if(obj != null) {
      res.render('user', {
        user : obj
      });
    }
  });
        
});

app.get('/newdelivery', function(req, res) {
  res.render('newdelivery', {

  });
});

app.post('/newdelivery', function(req, res) {
  var deliveryId = randomString(7);
  var delivery = new Delivery({
    _id : deliveryId,
    pickupDate : req.body.pickupDate,
    pickupTime : req.body.pickupTime,
    pickupAddress : req.body.pickupAddress,
    pickupDetails : req.body.pickupDetails,

    deliveryDate : req.body.deliveryDate,
    deliveryTime : req.body.deliveryTime,
    deliveryAddress : req.body.deliveryAddress,
    deliveryDetails : req.body.deliveryDetails,
    deliveryStatus : 'unclaimed'

  });
  shipping_mongoose.saveToDB(delivery, function(callback) {
    if(callback != null) {
      console.log('saveToDB error');
    } 
  });
  res.redirect('delivery/' + deliveryId)

});

app.get('/delivery/:id', function(req, res) {
  var id = req.params.id;
  shipping_mongoose.findFirst(Delivery, {'_id' : id}, function(err, obj) {
    
    if(obj != null) {
      res.render('delivery', {
        obj : obj
      });
    }
  }); 
});

app.get('/wall', function(req, res) {
  if(req.session.userId) {
    Delivery.find({deliveryStatus : 'unclaimed'}, function(err, obj) {
      for(var i in obj) {
        console.log(obj[i]._id);
      }
      User.findOne({'_id' : req.session.userId}, function(err, userobj) {
        res.render('wall', {
          obj : obj,
          user : userobj
        });
      });
      
    }); 
  }
  else {
    res.redirect('/login');
  }
});

app.get('/delivery/:deliveryId', function(req, res) {
   Delivery.findOne({'_id' : req.params.deliveryId}, function(err, obj) {
        if(err) {

        }
        else {
            res.render('delivery', {
              obj : obj
            });
        }
    });
});

app.get('/logout', function(req, res) {
  req.session.userId = null;
  res.redirect('/login')
});
  

app.get('/username/:username/password/:password', function(req, res) {
    var username = req.params.username;
    var password = req.params.password;
    res.header('Access-Control-Allow-Origin', "*")
    res.send('true');
});

// Start the server.
server.listen(3000, function(req, res) {
    console.log('listening on port + 3000');
});