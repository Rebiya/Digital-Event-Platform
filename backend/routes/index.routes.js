// backend/routes/index.routes.js
const express = require('express');
const router = express.Router();
const breakoutRoutes = require('../routes/breakoutRoutes');
const token = require('../routes/tokenRoutes')


// Use breakout routes
router.use(breakoutRoutes);
router.use(token);
module.exports = router;
