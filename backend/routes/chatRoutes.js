const express = require('express');
const router = express.Router();
const { 
    getChatHistory, 
    getChatUsers, 
    updateMessage, 
    deleteMessage, 
    clearChat, 
    markMessagesAsRead,
    chatUpload,
    uploadFile,
    createGroup,
    getGroups,
    getGroupMessages
} = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');

router.get('/history/:userId', protect, getChatHistory);
router.get('/users', protect, getChatUsers);
router.put('/message/:id', protect, updateMessage);
router.delete('/message/:id', protect, deleteMessage);
router.delete('/clear/:userId', protect, clearChat);
router.put('/read/:userId', protect, markMessagesAsRead);
router.post('/upload', protect, chatUpload, uploadFile);
router.post('/groups', protect, createGroup);
router.get('/groups', protect, getGroups);
router.get('/group-history/:groupId', protect, getGroupMessages);

module.exports = router;
