const mongoose = require('mongoose');

const userTestSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  name: String
});

userTestSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase() });
};

const UserTest = mongoose.model('UserTest', userTestSchema);
module.exports = UserTest;
