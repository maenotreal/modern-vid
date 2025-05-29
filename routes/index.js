var express = require('express');
var router = express.Router();
const jsonWT = require('jsonwebtoken');
const User = require('../schemas/userSchema');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
  if (req.cookies.token !== undefined) {
    let verificationState = jsonWT.verify(req.cookies.token, process.env.SECRET_KEY);
    console.log(verificationState);
  }


});

module.exports = router;
