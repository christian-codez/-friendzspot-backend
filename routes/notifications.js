var express = require('express');
var router = express.Router();
const auth = require('../middlewares/auth');
const NotificationController = require('../controllers/notificationController');

/* GET all notifications */
router.get('/', NotificationController.index);
router.get('/my-notifications/', auth, NotificationController.friendRequests);
router.post('/', auth, NotificationController.create);
router.delete('/', auth, NotificationController.delete);

module.exports = router;
