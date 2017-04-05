module.exports = function(app, passport) {

var mongoose = require('mongoose');
const yelp = require('yelp-fusion');
        var db = require('../../config/database.js');
        
        const clientId = 'fcrJc79YtvNqTifSpY6uMA';
        const clientSecret = '3wQCiXAG3VExFCd3eeiyTYJTd0Bz5jljb6nntkbcfrjzyn35eMpxIovTzECLU7n7';
        
        var Schema = mongoose.Schema;
         var pollSchema = new Schema({
                title: String,
                num: Number,
                r1: String,
                a1: Number,
                r2: String,
                a2: Number,
                r3: String,
                a3: Number,
                r4: String,
                a4: Number,
         });

        var poll = mongoose.model('polls', pollSchema);
        

    app.get('/', function(req, res) {
        res.render('index.ejs'); // load the index.ejs file
    });


    app.get('/login', function(req, res) {

        res.render('login.ejs', { message: req.flash('loginMessage') }); 
    });


app.post('/login', passport.authenticate('local-login', {
        successRedirect : '/home', // redirect to the secure profile section
        failureRedirect : '/login', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));

    app.get('/signup', function(req, res) {

        // render the page and pass in any flash data if it exists
        res.render('signup.ejs', { message: req.flash('signupMessage') });
    });
    
    
   app.post('/signup', passport.authenticate('local-signup', {
        successRedirect : '/home', // redirect to the secure profile section
        failureRedirect : '/signup', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));
    
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
   const results = response.jsonBody.businesses;
   const prettyJson = JSON.stringify(results, null, 4);
    console.log(results);
        res.render('home.ejs', {
            data: results,
            log: isLoggedIn
        });
  });
}).catch(e => {
  console.log(e);
});

      


    });
    
    app.get('/create', isLoggedIn, function(req, res) {
        res.render('create.ejs', {
            user: req.user
        });
    });
    
    app.get('/respond/:id', isLoggedIn, function(req, res) {
        var id =req.params.id;
        var r = req.query.option.valueOf();
        var pollObject;
        console.log(r);
        if (r == "a1") {
        poll.findOneAndUpdate({'_id': id}, {$inc: { "a1" : 1}}, function(err, data) {
            if (err) console.log(err);
            console.log(data);
           pollObject = data;
           res.render('pollView.ejs', {
                    data: pollObject
                    
                })
        });
        }
        else if (r == "a2") {
        poll.findOneAndUpdate({'_id': id}, {$inc: { "a2" : 1}}, function(err, data) {
            if (err) console.log(err);
            console.log(data);
             pollObject = data;
             res.render('pollView.ejs', {
                    data: pollObject
                    
                })
        });
        }
        else if (r == "a3") {
        poll.findOneAndUpdate({'_id': id}, {$inc: { "a3" : 1}}, function(err, data) {
            if (err) console.log(err);
            console.log(data);
             pollObject = data;
             res.render('pollView.ejs', {
                    data: pollObject
                    
                })
        });
        }
        else if (r == "a4") {
        poll.findOneAndUpdate({'_id': id}, {$inc: { "a4" : 1}}, function(err, data) {
            if (err) console.log(err);
            console.log(data);
             pollObject = data;
             res.render('pollView.ejs', {
                    data: pollObject
                    
                })
        });
        }


            
            })
    
    
    app.get('/account', isLoggedIn, function(req, res) {
        res.render('account.ejs', {
            user : req.user // get the user out of session and pass to template
        });
    });


    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });
    
    app.get('/sendPoll', function(req, res) {

        var newPoll = new poll({
            "title" : req.query.question,
            "r1": req.query.r1,
            "r2": req.query.r2,
            "r3": req.query.r3,
            "r4": req.query.r4,
            "a1": 0,
            "a2": 0,
            "a3": 0,
            "a4": 0,
        });
        newPoll.save(function(err) {
                    if (err)
                        throw err;
                    return newPoll;
                });
        
        res.redirect("/home");
    });
};

function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on 
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/');
}

