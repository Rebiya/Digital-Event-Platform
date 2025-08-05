const express = require('express');
const { createUser } = require('../controllers/user.Controllers');

const router = express.Router();

router.post('/users', createUser); // URL path: POST /users

module.exports = router;
