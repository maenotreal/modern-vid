const express = require('express');
const router = express.Router();

const bcrypt = require('bcrypt');

//mongodb schema load
let User = require('../schemas/userSchema');
const { error } = require('winston');


let compareResult 

router.get('/', function(req, res, next) {
    res.render('login', {title: "Login"})
});

router.post('/', async function(req, res, next) {
    const loginData = req.body;
    try{
        //searching for user and comparing pass with hash
        let user = await User.findOne({login: {$eq: loginData.login}});
        if (!user)
            return res.status(400).json({
                error: 'user does not exist',
            });
        else
            compareResult = await bcrypt.compare(loginData.password, user.password);
        
        //comparing result and givin awnser to request.
        if (compareResult === true)
             res.cookie('token', user.JWT, {
            maxAge: 604800000,
            secure: true,
            httpOnly: true
            })
                .redirect('/');
        else
            return res.status(403).json({
                error: 'password is not correct',
        });
    } catch (e) {
        res.status(500)
        .setHeader("Content-Type", "text/plain");
        log("Exception occurred", e.stack)
        .end("An exception occured")
        .redirect('/');
    }
});

module.exports = router;