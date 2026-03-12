import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Send, User, MessageCircle, CheckCheck, Paperclip, File as FileIcon, Download, Image as ImageIcon, Video, Phone, MoreVertical, Plus, Users, X } from 'lucide-react';
import { io } from 'socket.io-client';
import API from '../../utils/api';
import './AdminChat.css';

const SOCKET_URL = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://127.0.0.1:8000';

const AdminChat = () => {
    const [chatUsers, setChatUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [chatGroups, setChatGroups] = useState([]);
    const [selectedTab, setSelectedTab] = useState('users'); // 'users' or 'groups'
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState('');
    const [socket, setSocket] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [isCalling, setIsCalling] = useState(null); // 'voice' or 'video'
    const [showGroupModal, setShowGroupModal] = useState(false);
    const [newGroupName, setNewGroupName] = useState('');
    const [selectedMembers, setSelectedMembers] = useState([]);
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);

    const adminUser = React.useMemo(() => {
        try { return JSON.parse(localStorage.getItem('admin_user')) || {}; }
        catch { return {}; }
    }, []);

    const selectedUserRef = useRef(selectedUser);
    useEffect(() => {
        selectedUserRef.current = selectedUser;
    }, [selectedUser]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const fetchChatUsers = async () => {
        try {
            const res = await API.get('/chat/users');
            if (res.data.success) {
                setChatUsers(res.data.data);
            }
        } catch (err) {
            console.error('Error fetching chat users:', err);
        }
    };

    const fetchChatGroups = async () => {
        try {
            const res = await API.get('/chat/groups');
            if (res.data.success) {
                setChatGroups(res.data.data);
            }
        } catch (err) {
            console.error('Error fetching groups:', err);
        }
    };

    const fetchChatHistory = useCallback(async (id, type = 'user') => {
        try {
            const endpoint = type === 'group' ? `/chat/group-history/${id}` : `/chat/history/${id}`;
            const res = await API.get(endpoint);
            if (res.data.success) {
                setMessages(res.data.data);
                if (type === 'user') {
                    await API.put(`/chat/read/${id}`);
                    if (socket) socket.emit('messages_read', { userId: id });
                }
            }
        } catch (err) {
            console.error('Error fetching history:', err);
        }
    }, [socket]);

    useEffect(() => {
        const newSocket = io(SOCKET_URL, {
            transports: ['websocket', 'polling']
        });
        setSocket(newSocket);

        newSocket.emit('join_admin_room');

        newSocket.on('receive_message', (msg) => {
            setMessages((prev) => {
                const currentSelected = selectedUserRef.current;
                const isRelevant = currentSelected && (
                    (msg.groupId && msg.groupId === currentSelected._id) ||
                    (!msg.groupId && (msg.sender === currentSelected._id || msg.receiver === currentSelected._id))
                );

                if (isRelevant) {
                    if (!msg.groupId && msg.senderRole === 'user') {
                        API.put(`/chat/read/${currentSelected._id}`);
                        newSocket.emit('messages_read', { userId: currentSelected._id });
                        msg.isRead = true;
                    }
                    return [...prev, msg];
                }
                return prev;
            });
            fetchChatUsers();
            fetchChatGroups();
        });

        newSocket.on('incoming_call', ({ from, type }) => {
            setIsCalling({ 
                type, 
                from, 
                direction: 'incoming',
                name: 'User' // Default name, fetch later if needed
            });
        });

        newSocket.on('call_ended', () => {
            setIsCalling(null);
        });

        return () => {
            newSocket.off('receive_message');
            newSocket.off('incoming_call');
            newSocket.off('call_ended');
            newSocket.close();
        };
    }, []); // Socket should be stable

    useEffect(() => {
        fetchChatUsers();
        fetchChatGroups();
    }, []);

    useEffect(() => {
        if (selectedUser) {
            fetchChatHistory(selectedUser._id, selectedUser.isGroup ? 'group' : 'user');
            if (selectedUser.isGroup && socket) {
                socket.emit('join_group', selectedUser._id);
            }
        }
    }, [selectedUser, socket, fetchChatHistory]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!message.trim() || !selectedUser || !socket) return;

        const adminId = adminUser.id || adminUser._id || 'admin-placeholder-id';
        const messageData = {
            sender: adminId, 
            senderRole: 'admin',
            receiver: selectedUser.isGroup ? null : selectedUser._id,
            groupId: selectedUser.isGroup ? selectedUser._id : null,
            message: message.trim()
        };

        socket.emit('send_message', messageData);
        setMessage('');
    };

    const handleCreateGroup = async () => {
        if (!newGroupName.trim() || selectedMembers.length === 0) return;
        try {
            const res = await API.post('/chat/groups', {
                name: newGroupName,
                members: selectedMembers
            });
            if (res.data.success) {
                setShowGroupModal(false);
                setNewGroupName('');
                setSelectedMembers([]);
                fetchChatGroups();
            }
        } catch (err) {
            console.error('Group creation error:', err);
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file || !selectedUser) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await API.post('/chat/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (res.data.success) {
                const adminId = adminUser.id || adminUser._id || 'admin-placeholder-id';
                const messageData = {
                    sender: adminId,
                    senderRole: 'admin',
                    receiver: selectedUser._id,
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

    const handleStartCall = (type) => {
        if (!socket || !selectedUser) return;
        const adminId = adminUser.id || adminUser._id || 'admin-id';
        setIsCalling({ type, direction: 'outgoing' });
        socket.emit('call_user', { 
            to: selectedUser._id, 
            from: adminId, 
            type 
        });
    };

    const handleEndCall = () => {
        if (!socket || !isCalling || !selectedUser) return;
        const target = isCalling.direction === 'outgoing' ? selectedUser._id : isCalling.from;
        socket.emit('end_call', { to: target });
        setIsCalling(null);
    };

    const renderMessageContent = (msg) => {
        if (msg.fileUrl) {
            const fullUrl = `${SOCKET_URL}${msg.fileUrl}`;
            
            if (msg.fileType === 'image') {
                return <img src={fullUrl} alt="Attached" className="admin-chat-image-preview" onClick={() => window.open(fullUrl)} />;
            }
            
            if (msg.fileType === 'video') {
                return (
                    <div className="admin-chat-video-container">
                        <video src={fullUrl} controls className="admin-chat-video-preview" />
                    </div>
                );
            }

            if (msg.fileType === 'audio') {
                return <audio src={fullUrl} controls className="admin-chat-audio-player" />;
            }

            return (
                <div className="admin-chat-file-attachment">
                    <FileIcon size={24} />
                    <div className="admin-file-info">
                        <span className="admin-file-name">{msg.fileName}</span>
                        <a href={fullUrl} download={msg.fileName} target="_blank" rel="noreferrer" className="admin-file-download-btn">
                            <Download size={14} /> Download
                        </a>
                    </div>
                </div>
            );
        }
        return <div className="admin-msg-content">{msg.message}</div>;
    };

    return (
        <div className="admin-chat-container">
            <aside className="chat-users-list">
                <div className="users-list-header">
                    <div className="admin-profile-section">
                        <div className="admin-avatar-mini"><CheckCheck size={20} /></div>
                        <div className="header-actions-mini">
                            <button onClick={() => setShowGroupModal(true)} title="Create Group"><Plus size={20} /></button>
                            <button title="Options"><MoreVertical size={20} /></button>
                        </div>
                    </div>
                    <div className="chat-tabs">
                        <button className={selectedTab === 'users' ? 'active' : ''} onClick={() => setSelectedTab('users')}>CHATS</button>
                        <button className={selectedTab === 'groups' ? 'active' : ''} onClick={() => setSelectedTab('groups')}>GROUPS</button>
                    </div>
                </div>

                <div className="users-scroll">
                    {selectedTab === 'users' ? (
                        chatUsers.map((user) => (
                            <div 
                                key={user._id} 
                                className={`user-item ${selectedUser?._id === user._id && !selectedUser.isGroup ? 'active' : ''}`}
                                onClick={() => setSelectedUser({ ...user, isGroup: false })}
                            >
                                <div className="user-avatar-container">
                                    {user.avatar ? <img src={user.avatar} alt="P" className="sidebar-avatar" /> : <div className="sidebar-avatar-placeholder">{user.name[0]}</div>}
                                </div>
                                <div className="user-info">
                                    <div className="user-info-top">
                                        <h4>{user.name}</h4>
                                        <span className="last-ts">{new Date(user.lastTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                    <p className="last-msg-snippet">{user.lastMessage}</p>
                                </div>
                            </div>
                        ))
                    ) : (
                        chatGroups.map((group) => (
                            <div 
                                key={group._id} 
                                className={`user-item ${selectedUser?._id === group._id && selectedUser.isGroup ? 'active' : ''}`}
                                onClick={() => setSelectedUser({ ...group, isGroup: true })}
                            >
                                <div className="user-avatar-container">
                                    <div className="sidebar-group-placeholder"><Users size={20} /></div>
                                </div>
                                <div className="user-info">
                                    <div className="user-info-top">
                                        <h4>{group.name}</h4>
                                        <span className="last-ts">{new Date(group.lastTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                    <p className="last-msg-snippet">{group.lastMessage || 'New Group Created'}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </aside>

            {showGroupModal && (
                <div className="modal-overlay">
                    <div className="group-modal">
                        <h3>Create New Group</h3>
                        <input 
                            type="text" 
                            placeholder="Group Name" 
                            value={newGroupName}
                            onChange={(e) => setNewGroupName(e.target.value)}
                        />
                        <div className="members-select">
                            <p>Select Members:</p>
                            {chatUsers.map(u => (
                                <label key={u._id} className="member-label">
                                    <input 
                                        type="checkbox" 
                                        checked={selectedMembers.includes(u._id)}
                                        onChange={(e) => {
                                            if (e.target.checked) setSelectedMembers([...selectedMembers, u._id]);
                                            else setSelectedMembers(selectedMembers.filter(id => id !== u._id));
                                        }}
                                    />
                                    {u.name}
                                </label>
                            ))}
                        </div>
                        <div className="modal-actions">
                            <button onClick={() => setShowGroupModal(false)}>Cancel</button>
                            <button className="create-btn" onClick={handleCreateGroup}>Create</button>
                        </div>
                    </div>
                </div>
            )}

            <main className="chat-detail-area">
                {selectedUser ? (
                    <>
                        <div className="chat-detail-header">
                            <div className="admin-header-left">
                                <div className="admin-icon-bg">
                                    {selectedUser.avatar ? <img src={selectedUser.avatar} className="header-avatar-img" /> : <User size={20} />}
                                </div>
                                <div className="header-text-info">
                                    <h3>{selectedUser.name}</h3>
                                    <p>{selectedUser.isGroup ? `${selectedUser.members?.length || 0} members` : 'online'}</p>
                                </div>
                            </div>
                            <div className="header-call-actions">
                                <button onClick={() => handleStartCall('video')} title="Video Call"><Video size={20} /></button>
                                <button onClick={() => handleStartCall('voice')} title="Voice Call"><Phone size={18} /></button>
                                <button title="Search"><MoreVertical size={20} /></button>
                            </div>
                        </div>

                        {isCalling && (
                            <div className="admin-calling-overlay">
                                <div className="admin-calling-content">
                                    <div className="admin-calling-avatar-box">
                                        {(isCalling.direction === 'incoming' ? isCalling.avatar : selectedUser.avatar) ? (
                                            <img src={isCalling.direction === 'incoming' ? isCalling.avatar : selectedUser.avatar} className="admin-calling-img" />
                                        ) : (
                                            <div className="admin-calling-initial">
                                                {(isCalling.direction === 'incoming' ? isCalling.name : selectedUser.name)[0]}
                                            </div>
                                        )}
                                    </div>
                                    <h3>{isCalling.direction === 'incoming' ? isCalling.name : selectedUser.name}</h3>
                                    <p>{isCalling.direction === 'incoming' ? 'Incoming' : 'Calling'} {isCalling.type} call...</p>
                                    <div className="admin-calling-actions">
                                        <button className="admin-end-call-btn" onClick={handleEndCall}>
                                            <X size={30} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="admin-messages">
                            {messages.map((msg, index) => (
                                <div key={index} className={`admin-message ${msg.senderRole}`}>
                                    <div className="admin-msg-bubble">
                                        {renderMessageContent(msg)}
                                        {msg.message && msg.fileUrl && <div className="admin-msg-text-below">{msg.message}</div>}
                                        <div className="admin-msg-footer">
                                            <span className="admin-msg-time">
                                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                            {msg.senderRole === 'admin' && (
                                                <span className={`admin-read-status ${msg.isRead ? 'read' : ''}`}>
                                                    <CheckCheck size={14} />
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>

                        <form className="admin-chat-input" onSubmit={handleSendMessage}>
                            <input 
                                type="file" 
                                hidden 
                                ref={fileInputRef} 
                                onChange={handleFileUpload}
                                accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
                            />
                            <button 
                                type="button" 
                                className="admin-attach-btn" 
                                onClick={() => fileInputRef.current.click()}
                                disabled={isUploading}
                            >
                                <Paperclip size={20} className={isUploading ? 'uploading-spin' : ''} />
                            </button>
                            <input
                                type="text"
                                placeholder={isUploading ? "Uploading..." : "Write a response..."}
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                disabled={isUploading}
                            />
                            <button type="submit" className="admin-send-btn" disabled={isUploading || (!message.trim() && !isUploading)}>
                                <Send size={20} />
                            </button>
                        </form>
                    </>
                ) : (
                    <div className="no-chat-selected">
                        <MessageCircle size={60} />
                        <p>Select a conversation to start chatting</p>
                    </div>
                )}
            </main>
        </div>
    );
};

export default AdminChat;
