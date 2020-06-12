var express = require('express');
var router = express.Router();
const UserController = require('../controllers/userController');
const auth = require('../middlewares/auth');
const fileUpload = require('../middlewares/file-upload');

/* CREATE new user */
router.get('/', UserController.index);
router.get('/my/friends', auth, UserController.getFriends);
router.post('/login', UserController.login);
router.post('/block-friend/:id', auth, UserController.blockFriend);
router.get('/block-friends', auth, UserController.getBlockFriends);
router.post('/unblock-friend/:id', auth, UserController.unBlockFriend);

router.get('/unfriend/:friendId', auth, UserController.unFriend);
router.get('/:userId', UserController.single);
router.get('/people/all', auth, UserController.people);
router.get('/login/:token', UserController.loginToken);
router.post('/', UserController.create);
router.post('/accept-friend-request', auth, UserController.acceptFriendRequest);
router.post('/update-my-socketid', auth, UserController.updateSocketID);
router.patch('/update/me', auth, UserController.update);
router.post(
  '/update/profile-photo',
  [auth, fileUpload.single('profile_photo_file')],
  UserController.updateProfilePhoto
);
router.post('/logout/:id', UserController.logout);
router.delete('/:userId', UserController.delete);

module.exports = router;
