const express = require('express');
const router = express.Router();

/* GET users listing. */
router.post('/send', function (req, res, next) {
  console.log(req.body);
  const io = req.app.get('io');
  const socket = req.app.get('socket');
  console.log({ socket });
  io.emit('message', {
    sender: '1',
    receiver: '2',
    body: req.body.message,
  });
  res.send({ data: req.body });
});

module.exports = router;
