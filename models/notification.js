const mongoose = require('mongoose');
const helper = require('../helpers/encrypt');
const { newError } = require('../helpers/error');
const status = require('http-status');
const notificationSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    notification_type: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      enum: ['friend_request', 'group_request'],
    },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

notificationSchema.statics.notifications = async function (req) {
  return await this.find();
};

notificationSchema.statics.findFriendRequests = async function (req) {
  return await this.find({
    receiver: req.user.id,
    notification_type: 'friend_request',
  }).populate('sender', '-password');
};

notificationSchema.statics.getSentFriendRequests = async function (req) {
  const requests = await this.find({
    sender: req.user.id,
    notification_type: 'friend_request',
  })
    .select('receiver ')
    .populate('receiver', '-password -socketId -updated_at');

  return requests;
};

notificationSchema.statics.receivedFriendRequests = async function (req) {
  const requests = await this.find({
    receiver: req.user.id,
    notification_type: 'friend_request',
  })
    .select('sender')
    .populate('sender', '-password -socketId -updated_at');

  return requests;
};

notificationSchema.statics.deleteSentFriendRequest = async function (req) {
  const deleted = await this.findOneAndRemove({
    _id: req.params.id,
    sender: req.user.id,
  });
  return deleted._id;
};

notificationSchema.statics.create = async function (req) {
  const existingNotification = await this.findOne({
    sender: req.user.id,
    receiver: req.body.receiver,
  });

  if (!existingNotification) {
    return await Notification({
      sender: req.user.id,
      receiver: req.body.receiver,
      notification_type: req.body.notification_type,
    }).save();
  } else {
    throw newError('Notification already sent!', status.BAD_REQUEST);
  }
};

notificationSchema.statics.delete = async function (id) {
  const deleted = await this.findByIdAndDelete(id);
  return deleted;
};

notificationSchema.statics.deleteFriendRequest = async function (id) {
  const deleted = await this.findOneAndRemove({
    _id: id,
    receiver: req.user.id,
  });
  return deleted;
};

notificationSchema.statics.deleteAfterAcceptingFriendRequest = async function (
  sender,
  receiver
) {
  const notification = await this.findOne({
    sender: sender,
    receiver: receiver,
  });

  if (notification) {
    const deleted = await this.findByIdAndDelete(notification._id);
    return deleted;
  }
};

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = { Notification };
