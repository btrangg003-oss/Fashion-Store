console.log('1. Starting...');
const mongoose = require('mongoose');
console.log('2. Mongoose loaded');
const bcrypt = require('bcryptjs');
console.log('3. Bcrypt loaded');

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  name: String
});
console.log('4. Schema created');

userSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase() });
};
console.log('5. Static method added');

const User = mongoose.model('User', userSchema);
console.log('6. Model created:', User.modelName);
console.log('7. findByEmail:', typeof User.findByEmail);

module.exports = User;
console.log('8. Exported');
