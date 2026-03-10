const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    senderRole: {
        type: String,
        enum: ['user', 'admin'],
        required: true
    },
    receiver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false
    },
    groupId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ChatGroup',
        required: false
    },
    message: {
        type: String,
        required: function() {
            return !this.fileUrl; // Message is required only if no file is attached
        }
    },
    fileUrl: {
        type: String
    },
    fileType: {
        type: String,
        enum: ['image', 'video', 'document', 'audio']
    },
    fileName: {
        type: String
    },
    isRead: {
        type: Boolean,
        default: false
    },
    isEdited: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('ChatMessage', chatMessageSchema);
