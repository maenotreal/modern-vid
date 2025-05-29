const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const Schema = mongoose.Schema;

let userSchema = new Schema({
    _id: {type: String},
    login: { type: String, require: true, unique: true},
    username: { type: String, require: true},
    vid_ids: {type: Array, require: false},
    token: {type: String, require: false, unique: true},
    password: { type: String, require: true, minLength: 6},
}, {
    collection : 'userData'
    });

let User = mongoose.model('User', userSchema);

module.exports = User;