var express = require('express');
var router = express.Router();
const UserController = require('../controllers/userController');

/* CREATE new user */
router.get('/', UserController.index);
router.get('/:userId', UserController.single);
router.post('/', UserController.create);
router.patch('/:userId', UserController.update);
router.delete('/:userId', UserController.delete);

module.exports = router;
