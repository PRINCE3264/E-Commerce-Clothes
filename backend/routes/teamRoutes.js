const express = require('express');
const router = express.Router();
const { getTeamMembers, getTeamMemberById } = require('../controllers/teamController');

router.get('/', getTeamMembers);
router.get('/:id', getTeamMemberById);

module.exports = router;
