const userService = require('../services/user.Service.js');

// In controller
const createUser = async (req, res) => {
  try {
    const { username, email } = req.body;
    const user = await userService.createUser({ username, email });
    res.status(201).json({
      success: true,
      message: 'User created successfully.',
      data: user,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Something went wrong.',
      data: null,
    });
  }
};





module.exports = {
  createUser,
};
