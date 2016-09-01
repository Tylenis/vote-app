"use strict";

require("dotenv").config();
var jwtStrategy = require("passport-jwt").Strategy;
var ExtractJwt = require('passport-jwt').ExtractJwt;
var User = require("../models/user.js");

module.exports = function(passport){
    var opts = {};
    opts.secretOrKey = process.env.SECRET;
    opts.jwtFromRequest = ExtractJwt.fromAuthHeader();
    
    passport.use(new jwtStrategy(opts, function(jwt_payload, done){
        User.findOne({_id: jwt_payload._id}, function(err, user){
            if(err){
                return done(err);
            }
            if(user){
                return done(null, user);
            } else {
                return done(null, false);
            }
        });
    }));
    
};