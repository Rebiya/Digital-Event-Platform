const express = require('express');
const router = express.Router();
const { getToken } = require('../controllers/tokenController');

router.post('/token', getToken);

module.exports = router;
