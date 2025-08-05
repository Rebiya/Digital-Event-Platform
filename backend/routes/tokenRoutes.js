const express = require('express');
const { joinRoom } = require('../controllers/tokenController');
const router = express.Router();

router.post('/token', joinRoom);
// router.post('/claim-host', claimHost);

module.exports = router;


