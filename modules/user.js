var mongoose = require('mongoose')
mongoose.connect('mongodb://localhost:27017/psw-mng-sys', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
});
var conn = mongoose.Collection

var userSchema = new mongoose.Schema({
  username: {
    type: String,
    require: true,
    index: {
      unique: true,
    }},
  password: {
      type: String,
      require: true,
      index: {
        unique: true,
      }},
  email: {
    type: String,
    require: true,
    index: {
    unique: true,
  }},
  date:{
    type: Date,
    default: Date.now
  }
});

var userModel = mongoose.model('users', userSchema)
module.exports = userModel;
