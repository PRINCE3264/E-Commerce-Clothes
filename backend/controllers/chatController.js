const ChatMessage = require('../models/ChatMessage');
const User = require('../models/User');
const ChatGroup = require('../models/ChatGroup');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directory exists
const uploadDir = 'uploads/chat';
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, uploadDir);
    },
    filename(req, file, cb) {
        cb(null, `chat-${Date.now()}${path.extname(file.originalname)}`);
    }
});

exports.chatUpload = multer({
    storage,
    limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit
}).single('file');

// @desc    Upload a file for chat
// @route   POST /api/chat/upload
// @access  Private
exports.uploadFile = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }

        const fileUrl = `/uploads/chat/${req.file.filename}`;
        let fileType = 'document'; // Default
        
        if (req.file.mimetype.startsWith('image/')) fileType = 'image';
        else if (req.file.mimetype.startsWith('video/')) fileType = 'video';
        else if (req.file.mimetype.startsWith('audio/')) fileType = 'audio';

        res.status(200).json({
            success: true,
            fileUrl,
            fileName: req.file.originalname,
            fileType
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get chat history between user and admin
// @route   GET /api/chat/history/:userId
// @access  Private
exports.getChatHistory = async (req, res) => {
    try {
        const { userId } = req.params;
        const currentUserId = req.user._id;

        // If user is not admin, they can only see their own chat
        if (req.user.role !== 'admin' && currentUserId.toString() !== userId) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        // Find messages where sender or receiver is the userId
        const messages = await ChatMessage.find({
            $or: [
                { sender: userId },
                { receiver: userId }
            ]
        }).sort({ createdAt: 1 });

        res.status(200).json({
            success: true,
            count: messages.length,
            data: messages
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get list of users who have chatted (for Admin)
// @route   GET /api/chat/users
// @access  Admin
exports.getChatUsers = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        // Aggregate unique users from ChatMessage
        const users = await ChatMessage.aggregate([
            {
                $match: { senderRole: 'user' }
            },
            {
                $group: {
                    _id: '$sender',
                    lastMessage: { $last: '$message' },
                    lastTimestamp: { $last: '$createdAt' }
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'userInfo'
                }
            },
            {
                $unwind: '$userInfo'
            },
            {
                $project: {
                    _id: 1,
                    name: '$userInfo.name',
                    email: '$userInfo.email',
                    lastMessage: 1,
                    lastTimestamp: 1
                }
            },
            {
                $sort: { lastTimestamp: -1 }
            }
        ]);

        res.status(200).json({
            success: true,
            data: users
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
// @desc    Update a chat message
// @route   PUT /api/chat/message/:id
// @access  Private
exports.updateMessage = async (req, res) => {
    try {
        const { message } = req.body;
        const chatMsg = await ChatMessage.findById(req.params.id);

        if (!chatMsg) {
            return res.status(404).json({ success: false, message: 'Message not found' });
        }

        // Only sender can update
        if (chatMsg.sender.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        chatMsg.message = message;
        chatMsg.isEdited = true;
        await chatMsg.save();

        res.status(200).json({ success: true, data: chatMsg });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Delete a message
// @route   DELETE /api/chat/message/:id
// @access  Private
exports.deleteMessage = async (req, res) => {
    try {
        const chatMsg = await ChatMessage.findById(req.params.id);

        if (!chatMsg) {
            return res.status(404).json({ success: false, message: 'Message not found' });
        }

        // Only sender can delete
        if (chatMsg.sender.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        await ChatMessage.findByIdAndDelete(req.params.id);

        res.status(200).json({ success: true, message: 'Message deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Clear chat history
// @route   DELETE /api/chat/clear/:userId
// @access  Private
exports.clearChat = async (req, res) => {
    try {
        const { userId } = req.params;

        // If user is not admin, they can only clear their own chat
        if (req.user.role !== 'admin' && req.user._id.toString() !== userId) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        await ChatMessage.deleteMany({
            $or: [
                { sender: userId },
                { receiver: userId }
            ]
        });

        res.status(200).json({ success: true, message: 'Chat history cleared' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Mark all messages from user as read
// @route   PUT /api/chat/read/:userId
// @access  Admin
exports.markMessagesAsRead = async (req, res) => {
    try {
        const { userId } = req.params;

        if (req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        await ChatMessage.updateMany(
            { sender: userId, receiver: null, isRead: false },
            { $set: { isRead: true } }
        );

        res.status(200).json({ success: true, message: 'Messages marked as read' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
// @desc    Create a new group
// @route   POST /api/chat/groups
// @access  Private
exports.createGroup = async (req, res) => {
    try {
        const { name, description, members } = req.body;
        const group = new ChatGroup({
            name,
            description,
            admin: req.user._id,
            members: [...new Set([...members, req.user._id.toString()])]
        });

        await group.save();
        res.status(201).json({ success: true, data: group });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get user groups
// @route   GET /api/chat/groups
// @access  Private
exports.getGroups = async (req, res) => {
    try {
        const groups = await ChatGroup.find({ members: req.user._id })
            .populate('members', 'name email avatar')
            .sort({ lastTimestamp: -1 });
        res.status(200).json({ success: true, data: groups });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get group chat history
// @route   GET /api/chat/group-history/:groupId
// @access  Private
exports.getGroupMessages = async (req, res) => {
    try {
        const { groupId } = req.params;
        const group = await ChatGroup.findById(groupId);
        
        if (!group || !group.members.includes(req.user._id)) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        const messages = await ChatMessage.find({ groupId })
            .populate('sender', 'name email avatar')
            .sort({ createdAt: 1 });

        res.status(200).json({ success: true, data: messages });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
