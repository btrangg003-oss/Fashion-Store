const mongoose = require('mongoose');

const testSchema = new mongoose.Schema({
  name: String
});

testSchema.statics.findByName = function(name) {
  return this.findOne({ name });
};

const TestModel = mongoose.model('Test', testSchema);

console.log('TestModel:', TestModel);
console.log('TestModel.findByName:', typeof TestModel.findByName);
console.log('Success!');
