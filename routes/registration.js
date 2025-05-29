//logger import
const logger = require('../logger');

//Express libraries import
const express = require('express');
const router = express.Router();

//mongoose and user for work with DB
const mongoose = require('mongoose');
const User = require('../schemas/userSchema');

// page render
router.get('/', function(req, res, next){ 
    res.render('registration', {title: "Registration"})
});

//user registration request
router.post('/', async function(req, res, next){
    //creating payload for creating document in db
    const user = new User(req.body);

    try {
        //save user data
        await user.save();
        //sent cookie to user for easy auth
        res.cookie('token', user.JWT, {
            maxAge: 604800000,
            secure: true,
            httpOnly: true
        })
        .redirect('/');
    } catch (e) {
        logger.info(error(e));
        return res.status(400);
    }
})

module.exports = router;