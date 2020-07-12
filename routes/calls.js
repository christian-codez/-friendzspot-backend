var express = require('express');
var router = express.Router();
const auth = require('../middlewares/auth');
const callController = require('../controllers/callController');

router.post('/audio-call-initiated', auth, callController.audioCallInitiated);
router.post('/audio-call-accepted', auth, callController.audioCallAccepted);
router.post('/call-ended/:receiverID', auth, callController.callEnded);

module.exports = router;
