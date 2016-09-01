"use strict";

module.exports = function (app, passport, User, Poll, jwt, secret) {
	app.route("/")
		.get(function (req, res) {
			res.sendFile(process.cwd()+"/public/index.html");
		});
		
	app.route("/sign-up")
		.post(function(req, res){
			if(!req.body.username || !req.body.password){
				res.json({success: false, msg: "Please pass name and password."});
			} else {
				var newUser = new User({
					username: req.body.username,
					password: req.body.password
				});
				newUser.save(function(err){
					if(err){
						return res.json({success: false, msg: "Username already exists."});
					}
					res.json({success: true});
				});
			}
		});
		
	app.route("/log-in")
		.post(function(req, res){
			User.findOne({
				username: req.body.username
			}, function(err, user){
				if(err){
					res.json({success: false, msg: "Sorry, we encountered a problem. Please try again later!"});
				}
				if(!user){
					res.json({success: false, msg: "User not found!"});
				} else {
					user.comparePassword(req.body.password, function(err, isMatch){
						if(isMatch && !err){
							var token = jwt.encode(user, secret);
							res.json({success: true, token: "JWT " + token});
						} else {
							res.json({success: false, msg: "Wrong password!"});
						}
					});
				}
			});
		});
		
	app.route("/change-password")
		.post(passport.authenticate("jwt", {session: false}), function(req, res){
			User.findOne({username: req.body.username}, function(err, user){
				if(err){
					res.json({success: false, msg: "Sorry, we encountered a problem. Please try again later!"});
				} else {
					user.comparePassword(req.body.old, function(err, isMatch){
						if(isMatch&&!err){
							user.password = req.body.new;
							user.save(function(err){
								if(err){
									return res.json({success: false, msg: "Sorry, we encountered a problem. Please try again later!"});
								} else {
									res.json({success: true, msg: "Password changed successfully!"});
								}
							});
						} else {
							res.json({success: false, msg: "Wrong Old password!"});
						}
					});
				}
			});
		});
		
	app.route("/delete-account")
		.post(passport.authenticate("jwt", {session: false}), function(req, res){
			User.findById(req.body.userid, function(err, user){
				if(err){
					return res.json({success: false, msg: "User not found!"});
				} else {
					user.comparePassword(req.body.password, function(err, isMatch){
						if(isMatch&&!err){
							Poll.remove({"author": req.body.userid}, function(err){
								if(err){
									return res.json({success: false, msg: "Sorry, we encountered a problem. Please try again later!"});
								} else {
									user.remove(function(err){
										if(err){
											return res.json({success: false, msg: "Sorry, we encountered a problem. Please try again later!"});
										} else {
											return res.json({success: true, msg: "Account successfully deleted!"});
										}
									});
								}
							});
						} else {
							return res.json({success: false, msg: "Wrong password!"});
						}
					});
				}
			});
		});
			
	app.route("/auth")
		.get(passport.authenticate("jwt", {session: false}), function(req, res){
			var token = getToken(req.headers);
			var decoded = jwt.decode(token, secret);
			User.findOne({username: decoded.username}, function(err, user){
				if(err){
					return res.json({success: false, msg: "Sorry, we encountered a problem. Please try again later!"});
				}
				if(!user){
					return res.status(403).json({success: false, msg: "Authentication failed. User not found."});
				} else {
					Poll.find({author: decoded._id}, function(err, polls){
						if(err){
							return res.json({success: false, msg: "Sorry, we encountered a problem. Please try again later!"});
						} else {
							res.json({success: true,
							msg: "Welcome  " + user.username + "!",
							username: user.username,
							userId: user._id,
							pollqty: polls.length
							});
						}
					});
				}
			});
		});
	app.route("/polls")
		.get(function(req, res){
			Poll.find(function(err, polls){
				if(err){
					return res.json({success: false, msg: "Sorry, we encountered a problem. Please try again later!"});
				} else {
					res.json({success: true, data: polls});
				}
			});
		})
		.post(passport.authenticate("jwt", {session: false}), function(req, res){
			var options = req.body.options.map(function(current, index, array){
				var obj = {};
				obj[current] = 0;
				return obj;
			});
			var data = {
				title: req.body.title,
				author: req.user.id,
				options: options
			};
			
			var poll = new Poll(data);
			poll.save(function(err){
				if(err){
					return res.json({success: false, msg: "Poll already exists."});
				} else {
					res.json({success: true});
				}
			});
		});
	app.route("/poll/:pollId")
		.get(function(req, res){
			Poll.findOne({"_id": req.params.pollId}, function(err, poll){
				if(err){
					return res.json({success: false, msg: "Nothing found."});
				} else {
					return res.json(poll);
				}
			});
		});
	app.route("/vote")
		.post(function(req, res){
			Poll.findById(req.body.pollId, function(err, poll){
				if(err){
					return res.json({success: false, msg: "Voting failed."});
				} else {
					if(req.body.optionindex == poll.options.length){
						var obj = {};
						obj[req.body.option] = 1;
						poll.options.push(obj);
					} else {
						poll.options[req.body.optionindex][req.body.option] += 1;
					}
					poll.markModified("options");
					poll.save(function(){
						return res.json({success: true, msg: "Success."});
					});
				}
			});
		});
	app.route("/pollresults/:pollId")
		.get(function(req, res){
			Poll.findOne({"_id": req.params.pollId}, function(err, poll){
				if(err){
					return res.json({success: false, msg: "Sorry, we encountered a problem. Please try again later!"});
				} else {
					var labels = [];
					var data = [];
					poll.options.forEach(function(value, index, array){
						var key = Object.keys(value)[0];
						labels.push(key);
						data.push(value[key]);
					});
					res.json({
						success: true,
						labels: labels,
						data: data,
						title: poll.title
					});
				}
			});
		});
		app.route("/mypolls/:userId")
			.get(passport.authenticate("jwt", {session: false}), function(req, res){
				Poll.find({"author": req.params.userId}, function(err, data){
					if(err){
						return res.json({success: false, msg: "Sorry, we encountered a problem. Please try again later!"});
					} else {
						res.json({success: true, data: data});
					}
				});
			});
			
		app.route("/mypolls/update")
			.post(passport.authenticate("jwt", {session: false}), function(req, res){
				Poll.findById(req.body.pollId, function(err, poll){
					if(err){
						return res.json({success: false, msg: "Sorry, we encountered a problem. Please try again later!"});
					} else {
						if(req.body.action == "add"){
							poll.options.push(req.body.newoption);
							poll.markModified("options");
							poll.save(function(){
								return res.json({success: true, msg: "Option added."});
							});
						} else if (req.body.action == "del"){
							poll.options.splice(req.body.optionindex, 1);
							poll.markModified("options");
							poll.save(function(){
								return res.json({success: true, msg: "Option deleted."});
							});
						} else {
							res.json({success: false, msg: "No action provided!"});
						}
					}
				});
			});
		app.route("/mypolls/delete")
			.post(passport.authenticate("jwt", {session: false}), function(req, res){
				Poll.findOneAndRemove({"_id": req.body.pollId}, function(err){
					if(err){
						return res.json({success: false, msg: "Sorry, we encountered a problem. Please try again later!"});
					} else {
						return res.json({success: true, msg: "Poll deleted."});
					}
				});
			});
			
		function getToken(headers){
			if(headers && headers.authorization){
				var parted = headers.authorization.split(" ");
				if(parted.length === 2){
					return parted[1];
				} else {
					return null;
				}
			} else {
				return null;
			}
		}
};