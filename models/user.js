const mongoose = require('mongoose');
const fs = require('fs');
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
    gender: {
      type: String,
      trim: true,
      lowercase: true,
      enum: ['male', 'female'],
    },
    password: {
      type: String,
      required: true,
    },
    socketId: {
      type: String,
      trim: true,
    },
    lastseen: {
      type: String,
      trim: true,
    },
    profilePhotoURL: {
      type: String,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
      lowercase: true,
    },
    userbio: {
      type: String,
      trim: true,
    },
    friends: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    blocked: [
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

userSchema.statics.findSocketID = async function (id) {
  return await this.findOne({ _id: id }).select('socketId');
};

userSchema.statics.getPeople = async function (req) {
  const friends = await this.findOne({ _id: req.user.id }).select('friends');

  const people = await this.find({ email: { $ne: req.user.email } }).select(
    '-password'
  );

  const peopleList = people.filter(person => {
    return !friends.friends.includes(person.id);
  });

  return peopleList;
};

userSchema.statics.findUser = async function (id) {
  return await this.findOne({ _id: id }).populate('friends', '-password');
};

userSchema.statics.getFriends = async function (req) {
  const friends = await this.findOne({ _id: req.user.id })
    .select('friends')
    .populate('friends', '-password -id');

  return friends;
};

userSchema.statics.getFriendsBasedOnSocketId = async function (socketId) {
  const friends = await this.findOne({ socketId: socketId })
    .select('friends')
    .populate('friends', '-password -id');

  return friends;
};

userSchema.statics.unFriend = async function (req) {
  const friendId = req.params.friendId;
  const userId = req.user.id;

  const user = await this.findOne({ _id: userId });

  const friends = user.friends;

  const filteredFriends = user.friends.filter(friend => {
    id = JSON.stringify(friend);
    requestFriendId = JSON.stringify(friendId);

    return id !== requestFriendId;
  });

  if (filteredFriends.length < friends.length) {
    user.friends = filteredFriends;
    await user.save();
  } else if (filteredFriends.length === friends.length) {
    throw newError('We could not find a friend', status.NOT_FOUND);
  }

  //Find the removedFriend
  const otherFriend = await this.findOne({ _id: friendId });
  const filteredOtherFriends = otherFriend.friends.filter(friend => {
    id = JSON.stringify(friend);
    yourId = JSON.stringify(userId);

    return id !== yourId;
  });

  if (filteredOtherFriends.length < otherFriend.friends.length) {
    otherFriend.friends = filteredOtherFriends;
    await otherFriend.save();
  } else if (filteredOtherFriends.length === otherFriend.friends.length) {
    throw newError(
      'We didnt find your ID in their friend list',
      status.NOT_FOUND
    );
  }

  return user;
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

userSchema.statics.blockFriend = async function (req) {
  const friendId = req.params.id;
  const uuid = req.user.id;

  //Find my account:
  const me = await this.findOne({ _id: uuid });

  //check if the user is a friend
  const friendExists = me.friends.filter(
    friend => JSON.stringify(friend) === JSON.stringify(friendId)
  );

  if (friendExists.length <= 0)
    throw newError('You are not friends with this person', status.BAD_REQUEST);

  //Add the Friend Id to the block array
  me.blocked.push(friendId);

  //Remove the friend Id from the friends array
  me.friends.remove(friendId);
  await me.save();

  return friendId;
};

userSchema.statics.getBlockFriends = async function (req) {
  const uuid = req.user.id;

  //Find my account:
  const me = await this.findOne({ _id: uuid })
    .select('blocked')
    .populate('blocked', '-password -socketId -__v');

  return me.blocked;
};

userSchema.statics.unBlockFriend = async function (req) {
  const friendId = req.params.id;
  const uuid = req.user.id;

  //Find my account:
  const me = await this.findOne({ _id: uuid });

  //Remove the Friend Id from the block array
  me.blocked.remove(friendId);

  //check of the user is a friend
  const friendExists = me.friends.filter(
    friend => JSON.stringify(friend) === JSON.stringify(friendId)
  );

  if (friendExists.length >= 1)
    throw newError(
      'You are already friends with this person',
      status.BAD_REQUEST
    );

  me.friends.push(friendId);
  await me.save();

  return friendId;
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
    { socketId: req.body.socketID, lastseen: new Date() },
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
  if (req.body.phone) user.phone = req.body.phone;
  if (req.body.userbio) user.userbio = req.body.userbio;
  // if (req.body.password)
  //   user.password = await helper.encrypt(req.body.password);

  //update the user account
  return await this.findOneAndUpdate({ _id: req.user.id }, user, {
    new: true,
  });
};
userSchema.statics.updateProfilePhoto = async function (req) {
  const imagePath = req.file.path.replace(/\\/g, '/');
  const user = await this.findOne({ _id: req.user.id });
  let prevPhotoUrl;
  if (user) {
    prevPhotoUrl = user.profilePhotoURL;
    user.profilePhotoURL = imagePath;
    await user.save();
    fs.unlink(prevPhotoUrl, err => {
      console.log(err);
    });
  }

  return user;
};

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await helper.encrypt(this.password);
  next();
});

const User = mongoose.model('User', userSchema);

module.exports = { User };
