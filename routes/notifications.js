var express = require('express');
var router = express.Router();
const auth = require('../middlewares/auth');
const NotificationController = require('../controllers/notificationController');

/* GET all notifications */
router.get('/', NotificationController.index);
//Get all friend requests
router.get(
  '/sent-friend-requests',
  auth,
  NotificationController.getSentFriendRequests
);
//all received but pending friend requests
router.get(
  '/received-pending-friend-requests',
  auth,
  NotificationController.receivedFriendRequests
);

//delete a specific friend request
router.delete(
  '/remove-my-friend-request/:id',
  auth,
  NotificationController.deleteSentFriendRequest
);
router.get('/my-notifications/', auth, NotificationController.friendRequests);
router.post('/', auth, NotificationController.create);
router.delete('/delete/:id', auth, NotificationController.deleteFriendRequest);

module.exports = router;
