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
    const user = new User(req.body);
    try {
        await user.save();
        logger.info('User '+user.uuid+' has been created');
        res.status(201).send({user});
    } catch (e) {
        res.status(400).send(e);
    }
})

module.exports = router;