const express = require('express');
const router = express.Router();
const {
  createBreakoutRoom,
  getBreakoutRooms,
  joinBreakoutRoom,
  leaveBreakoutRoom,
  deleteBreakoutRoom
} = require('../controllers/breakoutController');

router.post('/create', createBreakoutRoom);
router.get('/:mainRoomName', getBreakoutRooms);
router.post('/join', joinBreakoutRoom);
router.post('/leave', leaveBreakoutRoom);
router.delete('/:mainRoomName/:breakoutRoomName', deleteBreakoutRoom);

module.exports = router;
