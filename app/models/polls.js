"use strict";

var mongoose = require("mongoose");

var pollSchema = new mongoose.Schema({
    title: {type: String, required: true, unique: true},
    author: {type: String, required: true},
    options: [],
    created_at: {type: Date, default: Date.now}
});

var Poll = mongoose.model("Poll", pollSchema);
module.exports = Poll;