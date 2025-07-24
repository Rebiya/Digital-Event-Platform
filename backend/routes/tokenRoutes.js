const express = require('express');
const { getToken, claimHost } = require('../controllers/tokenController');
const router = express.Router();

router.post('/token', getToken);
router.post('/claim-host', claimHost);

module.exports = router;


