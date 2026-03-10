import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Trash2, Edit3, Check, RotateCcw, CheckCheck, Paperclip, Image as ImageIcon, File as FileIcon, Download, Play, Music, Video, Phone, MoreVertical, Plus } from 'lucide-react';
import { io } from 'socket.io-client';
import API from '../../utils/api';
import './LiveChat.css';

const SOCKET_URL = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://127.0.0.1:8000';

const LiveChat = ({ userData }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [socket, setSocket] = useState(null);
    const [unreadCount, setUnreadCount] = useState(0);
    const [editingMessage, setEditingMessage] = useState(null);
    const [editValue, setEditValue] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [isCalling, setIsCalling] = useState(null); // 'voice' or 'video'
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (!userData || userData.role === 'admin') return;

        const userId = userData.id || userData._id;
        if (!userId) return;

        const newSocket = io(SOCKET_URL);
        setSocket(newSocket);

        newSocket.emit('join_room', userId);

        newSocket.on('receive_message', (msg) => {
            setMessages((prev) => [...prev, msg]);
            if (!isOpen) {
                setUnreadCount((prev) => prev + 1);
            }
        });

        // Effect to join group rooms when messages load
        const joinGroupRooms = (msgs) => {
            const uniqueGroups = [...new Set(msgs.filter(m => m.groupId).map(m => m.groupId))];
            uniqueGroups.forEach(gid => newSocket.emit('join_group', gid));
        };

        newSocket.on('message_deleted', (messageId) => {
            setMessages((prev) => prev.filter(m => m._id !== messageId));
        });

        newSocket.on('message_updated', ({ messageId, newMessage }) => {
            setMessages((prev) => prev.map(m => m._id === messageId ? { ...m, message: newMessage, isEdited: true } : m));
        });

        newSocket.on('chat_cleared', () => {
            setMessages([]);
        });

        newSocket.on('messages_read_update', () => {
            setMessages((prev) => prev.map(m => m.senderRole === 'user' ? { ...m, isRead: true } : m));
        });

        // Call signaling
        newSocket.on('incoming_call', ({ from, type }) => {
            setIsCalling({ type, from, direction: 'incoming' });
            setIsOpen(true);
        });

        newSocket.on('call_ended', () => {
            setIsCalling(null);
        });

        // Load history
        API.get(`/chat/history/${userId}`)
            .then(res => {
                if (res.data.success) {
                    setMessages(res.data.data);
                    joinGroupRooms(res.data.data);
                }
            })
            .catch(err => console.error('Error loading chat history:', err));

        return () => newSocket.close();
    }, [userData]);

    useEffect(() => {
        if (isOpen) {
            setUnreadCount(0);
            scrollToBottom();
        }
    }, [isOpen, messages]);

    useEffect(() => {
        const handleOpenChat = () => setIsOpen(true);
        window.addEventListener('open_live_chat', handleOpenChat);
        return () => window.removeEventListener('open_live_chat', handleOpenChat);
    }, []);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!message.trim() || !socket) return;

        const userId = userData.id || userData._id;
        const messageData = {
            sender: userId,
            senderRole: 'user',
            receiver: null, // To Admin
            message: message.trim()
        };

        socket.emit('send_message', messageData);
        setMessage('');
    };

    const handleDeleteMessage = async (msgId) => {
        if (!window.confirm('Delete this message?')) return;
        try {
            const res = await API.delete(`/chat/message/${msgId}`);
            if (res.data.success) {
                const userId = userData.id || userData._id;
                socket.emit('delete_message', { messageId: msgId, userId });
            }
        } catch (err) {
            console.error('Delete error:', err);
        }
    };

    const handleStartEdit = (msg) => {
        setEditingMessage(msg._id);
        setEditValue(msg.message);
    };

    const handleUpdateMessage = async (e) => {
        e.preventDefault();
        if (!editValue.trim() || !editingMessage) return;

        try {
            const res = await API.put(`/chat/message/${editingMessage}`, { message: editValue.trim() });
            if (res.data.success) {
                const userId = userData.id || userData._id;
                socket.emit('update_message', { 
                    messageId: editingMessage, 
                    userId, 
                    newMessage: editValue.trim() 
                });
                setEditingMessage(null);
            }
        } catch (err) {
            console.error('Update error:', err);
        }
    };

    const handleClearChat = async () => {
        if (!window.confirm('Are you sure you want to clear your entire chat history?')) return;
        const userId = userData.id || userData._id;
        try {
            const res = await API.delete(`/chat/clear/${userId}`);
            if (res.data.success) {
                socket.emit('clear_chat', { userId });
            }
        } catch (err) {
            console.error('Clear error:', err);
        }
    };

    const handleStartCall = (type) => {
        if (!socket) return;
        const userId = userData.id || userData._id;
        setIsCalling({ type, direction: 'outgoing' });
        socket.emit('call_user', { 
            to: 'admins', // User calls admin
            from: userId, 
            type 
        });
    };

    const handleEndCall = () => {
        if (!socket || !isCalling) return;
        const target = isCalling.direction === 'outgoing' ? 'admins' : isCalling.from;
        socket.emit('end_call', { to: target });
        setIsCalling(null);
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Limit size to 100MB
        if (file.size > 100 * 1024 * 1024) {
            alert('File is too large (max 100MB)');
            return;
        }

        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await API.post('/chat/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (res.data.success) {
                const userId = userData.id || userData._id;
                const messageData = {
                    sender: userId,
                    senderRole: 'user',
                    receiver: null,
                    message: '', // Empty text
                    fileUrl: res.data.fileUrl,
                    fileType: res.data.fileType,
                    fileName: res.data.fileName
                };
                socket.emit('send_message', messageData);
            }
        } catch (err) {
            console.error('Upload error:', err);
            alert('Failed to upload file');
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const renderMessageContent = (msg) => {
        if (msg.fileUrl) {
            const fullUrl = `${SOCKET_URL}${msg.fileUrl}`;
            
            if (msg.fileType === 'image') {
                return <img src={fullUrl} alt="Attached" className="chat-image-preview" onClick={() => window.open(fullUrl)} />;
            }
            
            if (msg.fileType === 'video') {
                return (
                    <div className="chat-video-container">
                        <video src={fullUrl} controls className="chat-video-preview" />
                    </div>
                );
            }

            if (msg.fileType === 'audio') {
                return <audio src={fullUrl} controls className="chat-audio-player" />;
            }

            return (
                <div className="chat-file-attachment">
                    <FileIcon size={24} />
                    <div className="file-info">
                        <span className="file-name">{msg.fileName}</span>
                        <a href={fullUrl} download={msg.fileName} target="_blank" rel="noreferrer" className="file-download-btn">
                            <Download size={14} /> Download
                        </a>
                    </div>
                </div>
            );
        }
        return <div className="message-content">{msg.message}</div>;
    };

    if (!userData || userData.role === 'admin') return null;

    return (
        <div className="live-chat-container">
            {!isOpen && (
                <div className="chat-bubble" onClick={() => setIsOpen(true)}>
                    <MessageCircle size={30} />
                    {unreadCount > 0 && <span className="unread-badge">{unreadCount}</span>}
                </div>
            )}

            {isOpen && (
                <div className="chat-window">
                    <div className="chat-header">
                        <div className="header-left">
                            <div className="header-avatar-container">
                                {userData?.avatar ? (
                                    <img src={userData.avatar} alt="Profile" className="header-profile-pic" />
                                ) : (
                                    <div className="header-avatar">PF</div>
                                )}
                            </div>
                            <div className="header-user-info">
                                <span className="header-name">Pandit Fashion</span>
                                <span className="online-tag">online</span>
                            </div>
                        </div>
                        <div className="header-right">
                            <button className="header-action-btn" onClick={() => handleStartCall('video')} title="Video Call">
                                <Video size={20} />
                            </button>
                            <button className="header-action-btn" onClick={() => handleStartCall('voice')} title="Voice Call">
                                <Phone size={18} />
                            </button>
                            <button className="header-action-btn" onClick={handleClearChat} title="More Options">
                                <MoreVertical size={20} />
                            </button>
                            <button className="header-action-btn close-x" onClick={() => setIsOpen(false)} title="Close Chat">
                                <X size={20} />
                            </button>
                        </div>
                    </div>

                    {isCalling && (
                        <div className="calling-overlay">
                            <div className="calling-content">
                                <div className="calling-avatar-box">
                                    {userData?.avatar ? (
                                        <img src={userData.avatar} alt="Me" className="calling-profile-img" />
                                    ) : (
                                        <div className="calling-avatar">PF</div>
                                    )}
                                </div>
                                <h3>Pandit Fashion</h3>
                                <p>{isCalling.direction === 'incoming' ? 'Incoming' : 'Calling'} {isCalling.type} call...</p>
                                <div className="calling-actions">
                                    <button className="end-call-btn" onClick={handleEndCall}>
                                        <X size={24} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="chat-messages">
                        {messages.length === 0 && (
                            <p style={{ textAlign: 'center', color: '#888', marginTop: '2rem' }}>
                                How can we help you today?
                            </p>
                        )}
                        {messages.map((msg, index) => (
                            <div key={index} className={`message-wrapper ${msg.senderRole}`}>
                                <div className={`message ${msg.senderRole}`}>
                                    {editingMessage === msg._id ? (
                                        <form className="edit-message-form" onSubmit={handleUpdateMessage}>
                                            <input 
                                                autoFocus
                                                value={editValue}
                                                onChange={(e) => setEditValue(e.target.value)}
                                            />
                                            <div className="edit-actions">
                                                <button type="submit"><Check size={14} /></button>
                                                <button type="button" onClick={() => setEditingMessage(null)}><X size={14} /></button>
                                            </div>
                                        </form>
                                    ) : (
                                        <>
                                            {renderMessageContent(msg)}
                                            {msg.message && msg.fileUrl && <div className="message-text-below">{msg.message}</div>}
                                            <div className="message-footer">
                                                {msg.isEdited && <span className="edited-tag">(edited)</span>}
                                                <span className="msg-time-small">
                                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                                {msg.senderRole === 'user' && (
                                                    <span className={`read-status ${msg.isRead ? 'read' : ''}`}>
                                                        <CheckCheck size={14} />
                                                    </span>
                                                )}
                                            </div>
                                            {msg.senderRole === 'user' && (
                                                <div className="message-actions">
                                                    <button onClick={() => handleStartEdit(msg)}><Edit3 size={12} /></button>
                                                    <button onClick={() => handleDeleteMessage(msg._id)}><Trash2 size={12} /></button>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>

                    <form className="chat-input-area" onSubmit={handleSendMessage}>
                        <input 
                            type="file" 
                            hidden 
                            ref={fileInputRef} 
                            onChange={handleFileUpload}
                            accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
                        />
                        <button 
                            type="button" 
                            className="attach-btn" 
                            onClick={() => fileInputRef.current.click()}
                            disabled={isUploading}
                        >
                            <Paperclip size={18} className={isUploading ? 'uploading-spin' : ''} />
                        </button>
                        <input
                            type="text"
                            placeholder={isUploading ? "Uploading..." : "Type a message..."}
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            disabled={isUploading}
                        />
                        <button type="submit" className="send-btn" disabled={isUploading || (!message.trim() && !isUploading)}>
                            <Send size={18} />
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default LiveChat;
