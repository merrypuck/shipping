
var mongoose = require('mongoose');

//--------------------------------

	// init() connects to wisdomly DB and initiates
	// schema by called shipping_schema module
  // Define user schema for collection 'users'.

//--------------------------------

shipping_mongoose = {

	init : function() {
		// Connect to Mongo on localhost, DB wisdomly
		mongoose.connect('mongodb://localhost/shipping');
		var db = mongoose.connection;

		// Error handling
		db.on('error', console.error.bind(console, 'connection error:'));

		db.once('open', function callback() {
		  console.log('Connected to DB');
		});
	},

/*-------------------------------

	// Methods

-------------------------------*/

//------------------------------

	// saveToDB(model, obj, callback) is a wrapper method to save an entry into a collection in DB-wisdomly.

	// Parameter: (obj) is an object which has all the fields and values needed to be saved in the collection 
	// which is defined by the model.

	// callback handles error, if no error, should return null.

//------------------------------

	saveToDB : function(obj, callback) {
		obj.save(function(err) {
			console.log('trying to Save succesfully to db.');
			if(err) {
				console.log(err);
				callback(err);
			}
			else {
				console.log('Saved succesfully to db.');
				callback(null);

			}
		});
	},

	// update document
	// dbInstance is document called
	updateDocument : function(model, obj, callback) {
		model.findOne(obj, function(err, dbInstance) {
			if(err) {
				callback(null);
			}
			else {
				for(key in obj) {
					dbInstance[key] = obj[key];
				}
				dbInstance.save(function(err) {
					if(err) {
						callback(null);
					}
				});
			}
		});
	},

// findFirst is a wrapper method for mongo's findOne function
// Parameters are : (model, obj, callback)
// o

	findFirst : function(model, obj, callback) {
		console.log(obj);
		model.findOne(obj, function(err, obj) {
			if(err) {
				callback(err, null);
			}
			else {
				callback(null, obj);
			}
		});
	},

// findAll is a wrapper method for mongo's find function

	findAll : function(model, obj, callback) {
		model.find(obj, function(err, obj) {
			if(err) {
				callback(err, null);
			}
			else {
				callback(null, obj);
			}
		});
	}

	};


module.exports = exports = shipping_mongoose;
