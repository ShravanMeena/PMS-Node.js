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

router.get('/',checkLoginUser, function (req, res, next) {
  var loginUser = localStorage.getItem('loginUser');
  res.render('addNewCategory', { title: 'Password Management System',loginUser:loginUser, errors: '',success:'' });
});

router.post('/',[ check('passwordCategory', "Enter Category Name").isLength({ min: 2 })], function (req, res, next) {
  var loginUser = localStorage.getItem('loginUser');
  const errors = validationResult(req);
  if (!errors.isEmpty()){
      res.render('addNewCategory', { title: 'Password Management System',loginUser:loginUser,errors:errors.mapped(),success:'' });
  }else{  
     var passCatName = req.body.passwordCategory;
     var passcatDetails = new passCatModel({
       password_category: passCatName
     })
     passcatDetails.save((err,doc)=>{
       if(err) throw err
     res.render('addNewCategory', { title: 'Password Management System',loginUser:loginUser, errors:'',success:'password category inserted successfully' });
      })
  }
});

module.exports = router;
