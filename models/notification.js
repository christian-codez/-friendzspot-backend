const mongoose = require('mongoose');
const helper = require('../helpers/encrypt');

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

notificationSchema.statics.create = async function (req) {
  return await Notification({
    sender: req.user.id,
    receiver: req.body.receiver,
    notification_type: req.body.notification_type,
  }).save();
};

notificationSchema.statics.delete = async function (id) {
  const deleted = await this.findByIdAndDelete(id);
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

  const deleted = await this.findByIdAndDelete(notification._id);
  return deleted;
};

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = { Notification };
