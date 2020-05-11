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


/* GET/Post Signup Form. */
router.get('/signup', function(req, res, next) {
  var loginUser = localStorage.getItem('loginUser');
  if (loginUser) {
    res.redirect('/dashboard')
  } else {
  res.render('signup', { title: 'Password Management System', msg: "" });
  }
});


router.post('/signup', checkMail, checkUserName, function (req, res, next) {
  var username = req.body.uname;
  var email = req.body.email;
  var password = req.body.password;
  var confpassword = req.body.confpassword;
  
  if(password != confpassword){
          res.render('signup', { title: 'Password Management System', msg: "Password not matched " });

  }else{
    var password = bcrypt.hashSync(req.body.password,10)
      var userDetails = new userModule({
          username:username,
          email: email,
          password: password
        }) 

        userDetails.save((err, doc)=>{
          if(err) throw err;
          res.render('signup', { title: 'Password Management System', msg: "User Registered Successfully" });

        })
  }
});

/* GET Dashboard */
// router.get('/dashboard',checkLoginUser, function(req, res, next) {
//   var loginUser = localStorage.getItem('loginUser');
//   res.render('dashboard', { title: 'Password Management System',loginUser:loginUser, msg:'' });
// });

/* GET/POST Add New Password page. */

// router.get('/add-new-password', function (req, res, next) {
//   var loginUser = localStorage.getItem('loginUser');

//  getPassCat.exec((err, data) => {
//             if (err) throw err
//           res.render('add-new-password', { title: 'Password Management System',loginUser:loginUser, records:data,success:'' });
//     })
//   });

// router.post('/add-new-password', checkLoginUser, checkLoginUser, function (req, res, next) {
//   var loginUser = localStorage.getItem('loginUser');
//   var pass_cat = req.body.pass_cat
//   var project_name = req.body.project_name
//   var pass_details = req.body.pass_details
//   var password_details = new passModel({
//     password_category: pass_cat,
//     project_name: project_name,
//     password_details: pass_details
//   })
  
//     password_details.save(function(err,doc){
//        getPassCat.exec((err, data) => {
//             if (err) throw err
//           res.render('add-new-password', { title: 'Password Management System',loginUser:loginUser, records:data,success:'password details inserted successfully' });
//     })
//   })
// });


// /* GET/POST View All Password page. */
router.get('/view-all-password', checkLoginUser,function(req, res, next) {
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


router.get('/view-all-password/:page', checkLoginUser,function(req, res, next) {
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

router.get('/password_detail', checkLoginUser, function (req, res, next) {
 res.redirect('dashboard')
});

router.get('/password_detail/edit/:id', checkLoginUser, function (req, res, next) {
 var loginUser = localStorage.getItem('loginUser');
 var id= req.params.id
 var getPassdDetails = passModel.findById({_id:id})
  getPassdDetails.exec(function (err, data) {
    getPassCat.exec(function(err,data1){
    if(err) throw err
      res.render('edit_pass_category', { title: 'Password Management System',loginUser:loginUser,record:data,records:data1,success:'' });
      })
    })});

 router.post('/password_detail/edit/:id', checkLoginUser, function (req, res, next) {
 var loginUser = localStorage.getItem('loginUser');
 var id= req.params.id
 var pass_cat = req.body.pass_cat
 var project_name = req.body.project_name
 var pass_details = req.body.pass_details
 passModel.findByIdAndUpdate(id,{password_category:pass_cat,project_name:project_name,password_details:pass_details}).exec(function(err){
 if(err) throw err
  var getPassdDetails = passModel.findById({_id:id})
  getPassdDetails.exec(function (err, data) {
    getPassCat.exec(function(err,data1){
    if(err) throw err
      res.render('edit_pass_category', { title: 'Password Management System',loginUser:loginUser,record:data,records:data1,success:'' });
   })
    })
    })
  });


/* GET delete method in view all password. */
router.get('/password_detail/delete/:id', checkLoginUser, function (req, res, next) {
  var loginUser = localStorage.getItem('loginUser');
 var id = req.params.id
  var passdelete=passModel.findByIdAndDelete(id)
  passdelete.exec(function (err) {
    if(err) throw err; 
    res.redirect('/view-all-password')
  })
});


/* GET/POST Add New Category page. */

// router.get('/add-new-category',checkLoginUser, function (req, res, next) {
//   var loginUser = localStorage.getItem('loginUser');
//   res.render('addNewCategory', { title: 'Password Management System',loginUser:loginUser, errors: '',success:'' });
// });

// router.post('/add-new-category',[ check('passwordCategory', "Enter Category Name").isLength({ min: 2 })], function (req, res, next) {
//   var loginUser = localStorage.getItem('loginUser');
//   const errors = validationResult(req);
//   if (!errors.isEmpty()){
//       res.render('addNewCategory', { title: 'Password Management System',loginUser:loginUser,errors:errors.mapped(),success:'' });
//   }else{  
//      var passCatName = req.body.passwordCategory;
//      var passcatDetails = new passCatModel({
//        password_category: passCatName
//      })
//      passcatDetails.save((err,doc)=>{
//        if(err) throw err
//      res.render('addNewCategory', { title: 'Password Management System',loginUser:loginUser, errors:'',success:'password category inserted successfully' });
//       })
//   }
// });

/* GET/POST Add New Category page. */
// router.get('/passwordCategory', checkLoginUser, function (req, res, next) {
//   var loginUser = localStorage.getItem('loginUser');
//   getPassCat.exec(function(err, data){
//     if(err) throw err; 
//     res.render('password_category', { title: 'Password Management System',loginUser:loginUser,records:data});
//   })
// });

// /* GET delete function. */
// router.get('/passwordCategory/delete/:id', checkLoginUser, function (req, res, next) {
//   var loginUser = localStorage.getItem('loginUser');
//   var passcat_id = req.params.id;
//   var passdelete=passCatModel.findByIdAndDelete(passcat_id)
//   passdelete.exec(function (err) {
//     if(err) throw err; 
//     res.redirect('/passwordCategory')
//   })
// });

// /* GET Edit method. */
// router.get('/passwordCategory/edit/:id', checkLoginUser, function (req, res, next) {
//   var loginUser = localStorage.getItem('loginUser');
//   var passcat_id = req.params.id;
//   var passedit=passCatModel.findById(passcat_id)
//   passedit.exec(function (err, data) {
//     if(err) throw err; 
//     res.render('edit_password_detail', { title: 'Password Management System',loginUser:loginUser,records:data,success:'',errors:'',id:passcat_id});
//   })
// });

// /* POST Edit method. */
// router.post('/passwordCategory/edit', checkLoginUser, function (req, res, next) {
//   var loginUser = localStorage.getItem('loginUser');
//   var passcat_id = req.body.id;
//   var passwordCategory = req.body.passwordCategory;
//   var update_passCat=passCatModel.findByIdAndUpdate(passcat_id, {password_category:passwordCategory})
//   update_passCat.exec(function (err, doc) {
//     if(err) throw err; 
//     res.redirect('/passwordCategory')
//   })
// });




/* GET/Post Signup Form. */
router.get('/logout', function (req, res, next) {
  localStorage.removeItem('loginUser')
  localStorage.removeItem('userToken')
  res.redirect('/')
});


module.exports = router;
