var express = require('express');
var router = express.Router();
var userModule = require('../modules/user')
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken')
var passCatModel = require('../modules/password_category')
var passModel = require('../modules/add_password')
const { check, validationResult } = require('express-validator');

var getPassCat = passCatModel.find({});
var getAllPass = passModel.find({});



if (typeof localStorage === "undefined" || localStorage === null) {
  var LocalStorage = require('node-localstorage').LocalStorage;
  localStorage = new LocalStorage('./scratch');
}

/* All Middlewares here */
 function checkMail(req,res,next){
   var email = req.body.email
   var checkExistEmail = userModule.findOne({email:email})

   checkExistEmail.exec((err, data)=>{
     if(err) throw err;
     if(data){
        return res.render('signup', { title: 'Password Management System', msg: "Email Already Exist" });
     }
     next();
   })
 }

  function checkUserName(req,res,next){
   var username = req.body.uname
   var checkExistEmail = userModule.findOne({username:username})

   checkExistEmail.exec((err, data)=>{
     if(err) throw err;
     if(data){
        return res.render('signup', { title: 'Password Management System', msg: "Username Already Exist" });
     }
     next();
   })
 }


 function checkLoginUser(req,res,next){
   try {
     var userToken = localStorage.getItem('userToken')
     var decoded = jwt.verify(userToken, 'loginToken');
   } catch (err) {
     res.redirect('/')
   }
   next();
 }

/* GET/POST home page. */
router.get('/', function(req, res, next) {
  var loginUser = localStorage.getItem('loginUser');
  if(loginUser){
    res.redirect('/dashboard')
}else{
  res.render('index', { title: 'Password Management System', msg:'' });
}
});

router.post('/', function(req, res, next) {
  var username = req.body.uname;
  var password = req.body.password;
  var checkUser = userModule.findOne({username:username});

  checkUser.exec((err, data)=>{
    if(err) throw err
    var getuserID = data._id;
    var getPassword = data.password;
    if(bcrypt.compareSync(password, getPassword)){
        var token = jwt.sign({userID: getuserID}, 'loginToken')
        localStorage.setItem('userToken', token);
        localStorage.setItem('loginUser', username);
        res.redirect('/dashboard')
    }else{
        res.render('index', { title: 'Password Management System', msg:'invalid username and password' });
    }
  })

});


/* GET/POST View All Password page. */
router.get('/', checkLoginUser,function(req, res, next) {
  var loginUser = localStorage.getItem('loginUser');
   var perPage = 4;
   var page = req.params.page || 1;
  getAllPass.skip((perPage * page) - perPage)
    .limit(perPage).exec(function (err, data) {
    if(err) throw err
     passModel.countDocuments({}).exec((err, count) => {
      res.render('view-all-password', { title: 'Password Management System',
      loginUser:loginUser,
      records: data,
      current: page,
      pages: Math.ceil(count / perPage)
      });
  })
  })
});


router.get('/:page', checkLoginUser,function(req, res, next) {
  var loginUser = localStorage.getItem('loginUser');
   var perPage = 1;
   var page = req.params.page || 1;
  getAllPass.skip((perPage * page) - perPage)
    .limit(perPage).exec(function (err, data) {
    if(err) throw err
     passModel.countDocuments({}).exec((err, count) => {
      res.render('view-all-password', { title: 'Password Management System',
      loginUser:loginUser,
      records: data,
      current: page,
      pages: Math.ceil(count / perPage)
      });
  })
  })
});



module.exports = router;
