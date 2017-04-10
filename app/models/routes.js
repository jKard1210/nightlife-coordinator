module.exports = function(app, passport) {

var mongoose = require('mongoose');
const yelp = require('yelp-fusion');
        var db = require('../../config/database.js');
        
        const clientId = 'fcrJc79YtvNqTifSpY6uMA';
        const clientSecret = '3wQCiXAG3VExFCd3eeiyTYJTd0Bz5jljb6nntkbcfrjzyn35eMpxIovTzECLU7n7';
        var results;
        
        var Schema = mongoose.Schema;
         var placeSchema = new Schema({
                name: String,
                location: String,
                votes: Number
         });

        var place = mongoose.model('places', placeSchema);
        

    app.get('/', function(req, res) {
        res.render('index.ejs'); // load the index.ejs file
    });


    app.get('/login', function(req, res) {

        res.render('login.ejs', { message: req.flash('loginMessage') }); 
    });


app.post('/login', passport.authenticate('local-login', {
        successRedirect : '/front', // redirect to the secure profile section
        failureRedirect : '/login', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));

    app.get('/signup', function(req, res) {

        // render the page and pass in any flash data if it exists
        res.render('signup.ejs', { message: req.flash('signupMessage') });
    });
    
    
   app.post('/signup', passport.authenticate('local-signup', {
        successRedirect : '/front', // redirect to the secure profile section
        failureRedirect : '/signup', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));
    
    app.get('/vote/:zip/:name', isLoggedIn, function(req, res) {
        var zip = req.params.zip;
        var name = req.params.name;
        console.log(zip);
        console.log(name);
       place.findOneAndUpdate({'name': name}, {$inc: { "votes" : 1}}, function(err, data) {
            if (err) console.log(err);
            res.redirect('/home?zip=' + zip);
            
    })
    });
    
     app.get('/front', function(req, res) {
         
        res.render('front.ejs'); 
    });

    app.get('/home', function(req, res) {

    const searchRequest = {
  location: req.query.zip,
  term: "bar"
    };

    yelp.accessToken(clientId, clientSecret).then(response => {
  const client = yelp.client(response.jsonBody.access_token);

  client.search(searchRequest).then(response => {
   results = response.jsonBody.businesses;
   var prettyJson = JSON.stringify(results, null, 4);
   results.forEach(function(obj) {
       place.findOne({
           "name": obj.name,
           "location": obj.location.city 
       }, function(err, item) {
           if(err) console.log("a");
           if (item) { 
               obj.votes = 1;
               obj.votes = item.votes;
           }
           
           else {
            obj.votes = 0;
            var newPlace = new place({
            "name" : obj.name,
            "location": obj.location.city,
            "votes": 0
        });
        newPlace.save(function(err) {
                    if (err)
                        throw err;
                    return newPlace;
                });
           }
       })


            })
     setTimeout(function() {res.render('home.ejs', {
            data: results,
            zip: req.query.zip
        }); 
     }, 1000);
   });
  }).catch(e => {
  console.log(e);
});
})

      


    
    app.get('/create', isLoggedIn, function(req, res) {
        res.render('create.ejs', {
            user: req.user
        });
    });
    
    
    app.get('/account', isLoggedIn, function(req, res) {
        res.render('account.ejs', {
            user : req.user // get the user out of session and pass to template
        });
    });


    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });
    

};


function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on 
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/login');
}

