const express = require('express');
const { getRoomParticipants } = require('../controllers/participants.controller.js');

const router = express.Router();

router.get('/participants', getRoomParticipants);    // URL path: GET /users

module.exports = router;
