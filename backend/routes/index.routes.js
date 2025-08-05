// backend/routes/index.routes.js
const express = require('express');
const router = express.Router();
const breakoutRoutes = require('../routes/breakoutRoutes');
const token = require('../routes/tokenRoutes')
const userRoutes = require('./user.Routes.js');


// Use breakout routes
router.use(breakoutRoutes);
router.use(token);
router.use(userRoutes);
module.exports = router;
