var LocalStrategy = require('passport-local').Strategy;

var FacebookStrategy = require('passport-facebook').Strategy;

var User = require('../app/models/user');
var configAuth = require('./auth');

module.exports = function (passport) {
    passport.serializeUser(function(user, done){
        done(null, user.id);
    });
    passport.deserializeUser(function(id, done){
        User.findById(id, function (err, user) {
            done(err, user);
        });
    });

    passport.use('local-signup', new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true
    },
        function (req, email, password, done) {
            process.nextTick(function() {
                User.findOne({'local.email' : email}, function(err, user) {
                    if (err) {
                        console.log('error');
                        return done(err)
                    }
                    if (user) {
                        console.log('user exists ' + user);
                        return done(null, false, req.flash('signup-message', 'That email has already been taken'));
                    }else{
                        //create new user
                        var newUser = new User();
                        newUser.local.email = email;
                        newUser.local.password = newUser.generateHash(password);
                        console.log('Creating user....');
                        newUser.save(function(err){
                            if (err)
                                throw err;
                            console.log('New user created.');
                            return done(null, newUser, req.flash('signup-message', 'You have been signed up.' + 'Welcome '+ newUser.local.email));
                        });
                    }
                });   
            });
        }
    ));

    passport.use('local-login', new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true
    },
    function (req, email, password, done) {
       process.nextTick(function(){
           User.findOne({'local.email': email}, function(err, user){
               if (err) {
                   console.log(err);
                   return done(err);
               }
               if (!user) {
                   console.log('User not found');
                   return done(null, false, req.flash('login-message', 'Oops!! User not found.'));
               }

            //    if user is found but invalid password
               if (!user.validPassword(password)) {
                   return done(null, false, req.flash('login-message', 'Oops!! Wrong password.'));
               }
               return done(null, user);  
           });
       });
    }
));

    passport.use(new FacebookStrategy({
        clientID: configAuth.facebookAuth.clientID,
        clientSecret: configAuth.facebookAuth.clientSecret,
        callbackURL: configAuth.facebookAuth.callbackURl
    },
        function (accessToken, refreshToken, profile, done) {
            process.nextTick(function(){
                User.findOne({'facebook.id': profile.id}, function(err, user){
                    if (err) 
                        return done(err);
                    if (user) 
                        return done(null, user);
                    else
                        var newUser = new User();
                        newUser.facebook.id = profile.id;
                        newUser.facebook.token = accessToken;
                        newUser.facebook.name = profile.name;
                        newUser.facebook.email= profile.email;
                        newUser.save(function(err) {
                            if (err) 
                                return done(err);

                            return done(null, newUser);
                        });
                })
            })
        }
    ));
}