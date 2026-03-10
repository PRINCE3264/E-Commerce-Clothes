const socketIO = require('socket.io');
const ChatMessage = require('../models/ChatMessage');
const ChatGroup = require('../models/ChatGroup');

const socketHandler = (server) => {
    const io = socketIO(server, {
        cors: {
            origin: "*", // In production, restrict this to your frontend URL
            methods: ["GET", "POST"]
        }
    });

    io.on('connection', (socket) => {
        console.log(`Socket Connected: ${socket.id}`);

        // Join a personal room (user level)
        socket.on('join_room', (userId) => {
            socket.join(userId);
            console.log(`User ${userId} joined room`);
        });

        // Join a group room
        socket.on('join_group', (groupId) => {
            socket.join(groupId);
            console.log(`User joined group room: ${groupId}`);
        });

        // Admins join a special room to get all user messages
        socket.on('join_admin_room', () => {
            socket.join('admins');
            console.log('Admin joined admins room');
        });

        // Send and Save Message
        socket.on('send_message', async (data) => {
            const { sender, senderRole, receiver, groupId, message, fileUrl, fileType, fileName } = data;

            try {
                // Save to database
                const newMessage = new ChatMessage({
                    sender,
                    senderRole,
                    receiver: receiver || null,
                    groupId: groupId || null,
                    message,
                    fileUrl,
                    fileType,
                    fileName
                });
                await newMessage.save();

                // If it's a group message
                if (groupId) {
                    io.to(groupId).emit('receive_message', newMessage);
                    // Update group's last message
                    await ChatGroup.findByIdAndUpdate(groupId, {
                        lastMessage: message || `Sent a ${fileType}`,
                        lastTimestamp: Date.now()
                    });
                } 
                // Private message logic
                else {
                    // If sent by user, notify admins
                    if (senderRole === 'user') {
                        io.to('admins').emit('receive_message', newMessage);
                        io.to(sender).emit('receive_message', newMessage);
                    } 
                    // If sent by admin, notify the specific user
                    else if (senderRole === 'admin') {
                        io.to(receiver).emit('receive_message', newMessage);
                        io.to('admins').emit('receive_message', newMessage);
                    }
                }
            } catch (error) {
                console.error('Socket error:', error);
            }
        });

        socket.on('delete_message', (data) => {
            const { messageId, userId, isAdmin } = data;
            if (isAdmin) {
                io.emit('message_deleted', messageId);
            } else {
                io.to(userId).emit('message_deleted', messageId);
                io.to('admins').emit('message_deleted', messageId);
            }
        });

        socket.on('update_message', (data) => {
            const { messageId, userId, newMessage, isAdmin } = data;
            if (isAdmin) {
                io.emit('message_updated', { messageId, newMessage });
            } else {
                io.to(userId).emit('message_updated', { messageId, newMessage });
                io.to('admins').emit('message_updated', { messageId, newMessage });
            }
        });

        socket.on('clear_chat', (data) => {
            const { userId } = data;
            io.to(userId).emit('chat_cleared');
            io.to('admins').emit('chat_cleared', userId);
        });

        socket.on('messages_read', (data) => {
            const { userId } = data;
            io.to(userId).emit('messages_read_update');
        });

        // Call signaling (simplified)
        socket.on('call_user', (data) => {
            const { offer, to, from, type } = data;
            io.to(to).emit('incoming_call', { offer, from, type });
        });

        socket.on('answer_call', (data) => {
            const { answer, to } = data;
            io.to(to).emit('call_answered', { answer });
        });

        socket.on('end_call', (data) => {
            const { to } = data;
            io.to(to).emit('call_ended');
        });

        socket.on('disconnect', () => {
            console.log('User disconnected');
        });
    });

    return io;
};

module.exports = socketHandler;
