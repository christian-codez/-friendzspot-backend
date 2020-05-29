var express = require('express');
var router = express.Router();
const UserController = require('../controllers/userController');
const auth = require('../middlewares/auth');

/* CREATE new user */
router.get('/', UserController.index);
router.get('/my/friends', auth, UserController.getFriends);
router.get('/:userId', UserController.single);
router.get('/people/all', auth, UserController.people);
router.get('/login/:token', UserController.loginToken);
router.post('/', UserController.create);
router.post('/accept-friend-request', auth, UserController.acceptFriendRequest);
router.post('/update-my-socketid', auth, UserController.updateSocketID);
router.post('/login', UserController.login);
router.patch('/:userId', UserController.update);
router.delete('/:userId', UserController.delete);

module.exports = router;
