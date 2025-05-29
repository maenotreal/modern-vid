// Schema for MongoDB
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jsonWT = require('jsonwebtoken');
const uuidv7 = require('uuidv7');

//declaring scheme
let userSchema = new mongoose.Schema({
    uuid: {type: String, require: true, unique: true},
    login: {type: String, require: true, unique: true, trim: true, lowercase: true},
    password: {type: String, require: true, minlength: 6, trim: true, default: "qwerty123"},
    username: {type: String, require: true},
    timestamp: {type: Date, require: true},
    JWT: {type: String, require: true, unique: true},
    video_ids: {type: Array, require: false},
}, {
    collection : 'userData'
});

//hashing password, granting uuid to document and creating JWT for user
userSchema.pre("save", async function (next) {
    const user = this;
    user.uuid = uuidv7.uuidv7();
    if (user.isModified("password")) {
        user.password = await bcrypt.hash(user.password, 8)
    }
    user.JWT = jsonWT.sign(this.uuid + this.login + this.username + toString(this.timestamp), process.env.SECRET_KEY)
    next();
})

let User = mongoose.model('User', userSchema);

module.exports = User;