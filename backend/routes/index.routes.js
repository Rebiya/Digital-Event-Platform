// backend/routes/index.routes.js
const express = require('express');
const router = express.Router();
const { getToken } = require('../controllers/tokenController');

// Use POST method to handle token request
router.post('/token', getToken);

module.exports = router;
