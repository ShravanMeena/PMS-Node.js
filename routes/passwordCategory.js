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


router.get('/', checkLoginUser, function (req, res, next) {
  var loginUser = localStorage.getItem('loginUser');
  getPassCat.exec(function(err, data){
    if(err) throw err; 
    res.render('password_category', { title: 'Password Management System',loginUser:loginUser,records:data});
  })
});

/* GET delete function. */
router.get('/delete/:id', checkLoginUser, function (req, res, next) {
  var loginUser = localStorage.getItem('loginUser');
  var passcat_id = req.params.id;
  var passdelete=passCatModel.findByIdAndDelete(passcat_id)
  passdelete.exec(function (err) {
    if(err) throw err; 
    res.redirect('/passwordCategory')
  })
});

/* GET Edit method. */
router.get('/edit/:id', checkLoginUser, function (req, res, next) {
  var loginUser = localStorage.getItem('loginUser');
  var passcat_id = req.params.id;
  var passedit=passCatModel.findById(passcat_id)
  passedit.exec(function (err, data) {
    if(err) throw err; 
    res.render('edit_password_detail', { title: 'Password Management System',loginUser:loginUser,records:data,success:'',errors:'',id:passcat_id});
  })
});

/* POST Edit method. */
router.post('/edit', checkLoginUser, function (req, res, next) {
  var loginUser = localStorage.getItem('loginUser');
  var passcat_id = req.body.id;
  var passwordCategory = req.body.passwordCategory;
  var update_passCat=passCatModel.findByIdAndUpdate(passcat_id, {password_category:passwordCategory})
  update_passCat.exec(function (err, doc) {
    if(err) throw err; 
    res.redirect('/passwordCategory')
  })
});


module.exports = router;
