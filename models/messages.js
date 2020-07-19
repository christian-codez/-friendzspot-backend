const mongoose = require('mongoose');
const { newError } = require('../helpers/error');
const status = require('http-status');
const { User } = require('./user');

const messageSchema = new mongoose.Schema(
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
    group: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Group',
    },
    deletedStatus: {
      type: Boolean,
      required: true,
      trim: true,
      default: false,
      lowercase: true,
      enum: [true, false],
    },
    deletedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    message: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
    },
    attachments: [
      {
        type: String,
        trim: true,
      },
    ],
    location: {
      type: String,
      trim: true,
    },
    message_type: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      enum: ['friend', 'call', 'group'],
    },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

messageSchema.methods.toJSON = function () {
  const message = this.toObject({ getters: true });
  delete message.__v;
  delete message._id;
  return message;
};

messageSchema.statics.deleteChatMessage = async function (req) {
  const message = await this.findOne({ _id: req.params.id });

  if (message) {
    message.deletedStatus = true;
    message.deletedBy.push(req.user.id);
    await message.save();
  }

  return message;
};
messageSchema.statics.deleteChatMessageForever = async function (req) {
  const message = await this.findByIdAndDelete(req.params.id);
  return message;
};

messageSchema.statics.sendFriendMessage = async function (
  sender,
  receiver,
  message,
  message_type
) {
  //Check if the receipient has blocked the sender...
  const user = await User.findOne({ _id: receiver });
  const senderObject = await User.findOne({ _id: sender });
  const blockedSender = user.blocked.includes(sender);
  const blockedReceiver = senderObject.blocked.includes(receiver);

  if (blockedSender || blockedReceiver)
    throw newError(
      `Sorry, you cannot send a message to ${user.firstname}!`,
      status.BAD_REQUEST
    );

  const newmessage = await Message({
    sender: sender,
    receiver: receiver,
    message: message,
    message_type: message_type,
  }).save();

  const lastmessage = await this.findOne({ _id: newmessage._id })
    .populate('sender', '-password -friends')
    .populate('receiver', '-password -friends');

  return lastmessage;
};

messageSchema.statics.getUserMessages = async function (sender, receiver) {
  return await this.find({
    $or: [
      {
        sender: sender,
        receiver: receiver,
      },
      {
        sender: receiver,
        receiver: sender,
      },
    ],
  })
    .populate('sender', '-password -friends')
    .populate('receiver', '-password -friends');
};

messageSchema.statics.getLastUserMessages = async function (req) {
  const receiver = req.user.id;
  const messages = await this.find({
    $or: [
      {
        receiver: receiver,
      },
      {
        sender: receiver,
      },
    ],
  })
    .sort([['created_at', -1]])
    .populate('sender')
    .populate('receiver');

  return messages;
};

messageSchema.statics.clearChatHistory = async function (req) {
  const me = req.user.id;
  const friendId = req.params.friendId;

  return await this.deleteMany({
    $or: [
      {
        receiver: me,
        sender: friendId,
      },
      {
        sender: me,
        receiver: friendId,
      },
    ],
  });
};

const Message = mongoose.model('Message', messageSchema);

module.exports = { Message };
