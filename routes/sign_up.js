const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
let User = require('../models/userData');

router.get('/', function(req, res, next) {
    res.render('sign_up', {title: "Registration"})
});

router.post('/', async function (req,res,next){

   let data = {
       _id: new mongoose.Types.ObjectId(),
       login: req.body.login,
       username: req.body.name,
       token: jwt.sign({
           login : req.body.login,
           username : req.body.name
       }, process.env.SECRET_KEY),
       password: req.body.password
   }


   try {
       let user = await User.findOne({login: data.login});
        console.log(user);
       if (user) {
           return res.status(400).json({error: 'user already exist'});
       }

       await User.create(data);

       res.cookie('token', data.token, {
           maxAge: 604800000,
           secure: true,
           httpOnly: true
       });

       return res.redirect('/');
   } catch (error) {
       next(error);
   }
});

module.exports = router;