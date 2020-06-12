var express = require('express');
var router = express.Router();
const auth = require('../middlewares/auth');
const messageController = require('../controllers/messageController');

router.post('/send', auth, messageController.sendFriendMessage);
router.post('/get-user-messages', auth, messageController.getUserMessages);
router.post('/typing-started', auth, messageController.typingStarted);
router.post('/typing-stopped', auth, messageController.typingStopped);
router.delete(
  '/clear-chat-history/:friendId',
  auth,
  messageController.clearChatHistory
);
router.post('/lastmessages', auth, messageController.getLastUserMessages);

module.exports = router;
