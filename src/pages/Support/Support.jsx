import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageSquare, Headphones, ShieldCheck, Clock, Trash2, Edit3, Check, RotateCcw, X, CheckCheck, Paperclip, File as FileIcon, Download, Music, Image as ImageIcon } from 'lucide-react';
import { io } from 'socket.io-client';
import API from '../../utils/api';
import './Support.css';

const SOCKET_URL = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://127.0.0.1:8000';

const Support = () => {
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [socket, setSocket] = useState(null);
    const [editingMessage, setEditingMessage] = useState(null);
    const [editValue, setEditValue] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);
    
    const userData = React.useMemo(() => {
        try { return JSON.parse(localStorage.getItem('user_data')) || null; }
        catch { return null; }
    }, []);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        const userId = userData?.id || userData?._id;
        if (!userId) return;

        const newSocket = io(SOCKET_URL, {
            transports: ['websocket', 'polling']
        });
        setSocket(newSocket);
        newSocket.emit('join_room', userId);

        newSocket.on('receive_message', (msg) => {
            setMessages((prev) => [...prev, msg]);
        });

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

        return () => {
            newSocket.off('receive_message');
            newSocket.off('message_deleted');
            newSocket.off('message_updated');
            newSocket.off('chat_cleared');
            newSocket.off('messages_read_update');
            newSocket.close();
        };
    }, [userData?.id, userData?._id]);

    useEffect(() => {
        const userId = userData?.id || userData?._id;
        if (!userId) return;

        API.get(`/chat/history/${userId}`)
            .then(res => {
                if (res.data.success) {
                    setMessages(res.data.data);
                }
            })
            .catch(err => console.error('Error loading chat history:', err));
    }, [userData?.id, userData?._id]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!message.trim() || !socket || !userData) return;

        const userId = userData.id || userData._id;
        const messageData = {
            sender: userId,
            senderRole: 'user',
            receiver: null,
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

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

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
                    message: '',
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
                return <img src={fullUrl} alt="Attached" className="support-image-preview" onClick={() => window.open(fullUrl)} />;
            }
            
            if (msg.fileType === 'video') {
                return (
                    <div className="support-video-container">
                        <video src={fullUrl} controls className="support-video-preview" />
                    </div>
                );
            }

            if (msg.fileType === 'audio') {
                return <audio src={fullUrl} controls className="support-audio-player" />;
            }

            return (
                <div className="support-file-attachment">
                    <FileIcon size={24} />
                    <div className="support-file-info">
                        <span className="support-file-name">{msg.fileName}</span>
                        <a href={fullUrl} download={msg.fileName} target="_blank" rel="noreferrer" className="support-file-download-btn">
                            <Download size={14} /> Download
                        </a>
                    </div>
                </div>
            );
        }
        return <div className="msg-text-content">{msg.message}</div>;
    };

    if (!userData) {
        return (
            <div className="support-login-prompt">
                <MessageSquare size={64} color="#6e8efb" />
                <h2>Please Login</h2>
                <p>You need to be logged in to chat with our support team.</p>
                <a href="/login?redirect=/support" className="login-link-btn">Sign In Now</a>
            </div>
        );
    }

    return (
        <div className="support-page-container">
            <div className="support-layout">
                <aside className="support-info-sidebar">
                    <div className="support-brand">
                        <Headphones size={32} />
                        <h2>Help Center</h2>
                    </div>
                    
                    <div className="support-stats">
                        <div className="stat-item">
                            <Clock size={16} />
                            <span>Average response: 5 mins</span>
                        </div>
                        <div className="stat-item">
                            <ShieldCheck size={16} />
                            <span>Encrypted conversation</span>
                        </div>
                    </div>

                    <div className="support-faq">
                        <h3>Common Topics</h3>
                        <ul>
                            <li>How to track my order?</li>
                            <li>Return policy details</li>
                            <li>Payment failed issues</li>
                            <li>Size guide assistance</li>
                        </ul>
                    </div>
                </aside>

                <main className="support-chat-main">
                    <header className="support-chat-header">
                        <div className="active-agent">
                            <div className="agent-status online"></div>
                            <div>
                                <h3>Pandit Fashion</h3>
                                <p>Online & Ready to Help</p>
                            </div>
                        </div>
                        <button className="clear-support-chat" title="Clear Chat History" onClick={handleClearChat}>
                            <RotateCcw size={18} />
                            <span>Clear Chat</span>
                        </button>
                    </header>

                    <div className="support-messages-view">
                        {messages.length === 0 && (
                            <div className="welcome-chat-text">
                                <MessageSquare size={48} />
                                <h4>Hello {userData.name}!</h4>
                                <p>Send us a message and our team will get back to you immediately.</p>
                            </div>
                        )}
                        {messages.map((msg, index) => (
                            <div key={index} className={`support-msg ${msg.senderRole}`}>
                                <div className="msg-bubble">
                                    {editingMessage === msg._id ? (
                                        <form className="edit-msg-form" onSubmit={handleUpdateMessage}>
                                            <input 
                                                autoFocus
                                                value={editValue}
                                                onChange={(e) => setEditValue(e.target.value)}
                                            />
                                            <div className="edit-btn-actions">
                                                <button type="submit" title="Save"><Check size={16} /></button>
                                                <button type="button" title="Cancel" onClick={() => setEditingMessage(null)}><X size={16} /></button>
                                            </div>
                                        </form>
                                    ) : (
                                        <>
                                            {renderMessageContent(msg)}
                                            {msg.message && msg.fileUrl && <div className="msg-text-below">{msg.message}</div>}
                                            <div className="msg-info-footer">
                                                {msg.isEdited && <span className="msg-edited-tag">(edited)</span>}
                                                <span className="msg-time-text">
                                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                                {msg.senderRole === 'user' && (
                                                    <span className={`msg-read-status ${msg.isRead ? 'read' : ''}`}>
                                                        <CheckCheck size={14} />
                                                    </span>
                                                )}
                                            </div>
                                            {msg.senderRole === 'user' && (
                                                <div className="msg-hover-actions">
                                                    <button onClick={() => handleStartEdit(msg)} title="Edit"><Edit3 size={14} /></button>
                                                    <button onClick={() => handleDeleteMessage(msg._id)} title="Delete"><Trash2 size={14} /></button>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                                {/* Removed separate span for time as it's now inside the bubble */}
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>

                    <form className="support-input-form" onSubmit={handleSendMessage}>
                        <input 
                            type="file" 
                            hidden 
                            ref={fileInputRef} 
                            onChange={handleFileUpload}
                            accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
                        />
                        <button 
                            type="button" 
                            className="support-attach-btn" 
                            onClick={() => fileInputRef.current.click()}
                            disabled={isUploading}
                        >
                            <Paperclip size={22} className={isUploading ? 'uploading-spin' : ''} />
                        </button>
                        <input
                            type="text"
                            placeholder={isUploading ? "Uploading..." : "Describe your issue..."}
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            disabled={isUploading}
                        />
                        <button type="submit" className="support-send-btn" disabled={isUploading || (!message.trim() && !isUploading)}>
                            <Send size={20} />
                            <span>Send</span>
                        </button>
                    </form>
                </main>
            </div>
        </div>
    );
};

export default Support;
