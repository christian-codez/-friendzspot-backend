const mongoose = require('mongoose');
const helper = require('../helpers/encrypt');
var uniqueValidator = require('mongoose-unique-validator');

const userSchema = new mongoose.Schema(
  {
    firstname: {
      type: String,
      required: true,
      minlength: 2,
      maxlength: 50,
      trim: true,
    },
    lastname: {
      type: String,
      required: true,
      minlength: 2,
      maxlength: 50,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    photo: {
      type: String,
      trim: true,
      lowercase: true,
    },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

userSchema.plugin(uniqueValidator);

userSchema.methods.toJSON = function () {
  const user = this.toObject({ getters: true });
  // delete user.password;
  delete user.__v;
  delete user._id;
  return user;
};

userSchema.statics.users = async function (email) {
  return await this.find().select('-password');
};

userSchema.statics.findUser = async function (req) {
  return await this.findOne({ _id: req.params.userId });
};

userSchema.statics.deleteUser = async function (req) {
  return await this.findByIdAndDelete(req.params.userId);
};

userSchema.statics.register = async function (req) {
  return await User({
    firstname: req.body.firstname,
    lastname: req.body.lastname,
    email: req.body.email,
    password: req.body.password,
  }).save();
};

userSchema.statics.updateUser = async function (req) {
  const user = {};

  if (req.body.firstname) user.firstname = req.body.firstname;
  if (req.body.lastname) user.lastname = req.body.lastname;
  if (req.body.email) user.email = req.body.email;
  if (req.body.password)
    user.password = await helper.encrypt(req.body.password);

  //update the user account
  return await this.findOneAndUpdate({ _id: req.params.userId }, user, {
    new: true,
  });
};

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await helper.encrypt(this.password);
  next();
});

const User = mongoose.model('User', userSchema);

module.exports = { User };
