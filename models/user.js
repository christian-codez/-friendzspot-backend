const mongoose = require('mongoose');
const helper = require('../helpers/encrypt');
const uniqueValidator = require('mongoose-unique-validator');
const { newError } = require('../helpers/error');
const status = require('http-status');
const { Notification } = require('../models/notification');

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
    socketId: {
      type: String,
      trim: true,
    },
    photo: {
      type: String,
      trim: true,
      lowercase: true,
    },
    friends: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
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

userSchema.statics.users = async function () {
  return await this.find().select('-password');
};

userSchema.statics.getPeople = async function (req) {
  return await this.find({ email: { $ne: req.user.email } }).select(
    '-password'
  );
};

userSchema.statics.findUser = async function (req) {
  return await this.findOne({ _id: req.params.userId }).populate(
    'friends',
    '-password'
  );
};
userSchema.statics.getFriends = async function (req) {
  const friends = await this.findOne({ _id: req.user.id })
    .select('friends')
    .populate('friends', '-password -id');

  return friends;
};

userSchema.statics.acceptFriendRequest = async function (req) {
  if (req.body.friendRequestID === req.user.id)
    throw newError('You cannot add yourself as a friend', status.BAD_REQUEST);

  const user = await this.findOne({ _id: req.user.id });
  if (!user) throw newError('User was not found', status.NOT_FOUND);

  //check if the id is already existing
  const checkFriendExist = user.friends.filter(friendId => {
    id = JSON.stringify(friendId);
    requestId = JSON.stringify(req.body.friendRequestID);
    return id === requestId;
  });

  if (checkFriendExist.length > 0)
    throw newError(
      'You are already friends with this user',
      status.BAD_REQUEST
    );

  // Add friend to receivers list
  user.friends.push(req.body.friendRequestID);
  await user.save();

  //get the senders
  const receiver = await this.findOne({ _id: req.body.friendRequestID });

  const isReceiverFriend = receiver.friends.filter(friendId => {
    id = JSON.stringify(friendId);
    receiverId = JSON.stringify(req.user.id);
    return id === receiverId;
  });

  if (!isReceiverFriend.length > 0) {
    receiver.friends.push(req.user.id);
    await receiver.save();
  }

  //delete from notification
  const result = await Notification.deleteAfterAcceptingFriendRequest(
    req.body.friendRequestID,
    req.user.id
  );

  return await this.findOne({ _id: req.user.id }).populate(
    'friends',
    '-password'
  );
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

userSchema.statics.updateSocketID = async function (req) {
  return await this.findOneAndUpdate(
    { _id: req.user.id },
    { socketId: req.body.socketID },
    {
      new: true,
    }
  );
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
