var mongoose = require('mongoose')
mongoose.connect('mongodb://localhost:27017/psw-mng-sys', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
});
var conn = mongoose.Collection

var passSchema = new mongoose.Schema({
  password_category: {
    type: String,
    require: true,
    },
     project_name: {
    type: String,
    require: true,
    },
    password_details: {
    type: String,
    require: true,
    },
  date:{
    type: Date,
    default: Date.now
  }
  
});

var passModel = mongoose.model('password_details', passSchema)
module.exports = passModel;
