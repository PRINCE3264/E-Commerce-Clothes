import React, { useState, useEffect } from 'react';
import { 
    MailOpen, 
    Trash2, 
    Eye, 
    Search,
    CheckCircle,
    Clock,
    User,
    Mail,
    Phone,
    CornerDownRight
} from 'lucide-react';
import API from '../../utils/api';
import Swal from 'sweetalert2';
import './AdminContact.css';

const AdminContact = () => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchMessages = async () => {
        try {
            const res = await API.get('/contact');
            setMessages(res.data.data);
            setLoading(false);
        } catch (err) {
            console.error("Error fetching messages", err);
            setLoading(false);
        }
    };

    useEffect(() => {
        let isMounted = true;
        const loadMsgs = async () => {
             const res = await API.get('/contact');
             if(isMounted) {
                 setMessages(res.data.data);
                 setLoading(false);
             }
        }
        loadMsgs().catch(() => { if(isMounted) setLoading(false); });
        return () => { isMounted = false; };
    }, []);

    const markAsResolved = async (id) => {
        try {
            await API.put(`/contact/${id}`, { status: 'Resolved' });
            fetchMessages(); // refresh list
            Swal.fire({
                icon: 'success',
                title: 'Message marked as Resolved',
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000
            });
        } catch {
            Swal.fire('Error', 'Could not update status', 'error');
        }
    };

    const deleteMessage = async (id) => {
        Swal.fire({
            title: 'Delete Communication?',
            text: "This action cannot be undone and will permanently remove this inquiry.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#f1f5f9',
            confirmButtonText: 'Permanently Delete',
            cancelButtonText: 'Cancel',
            customClass: {
                popup: 'luxury-admin-swal',
                confirmButton: 'b-swal-confirm-btn-blue',
                cancelButton: 'b-swal-cancel-btn-blue'
            }
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await API.delete(`/contact/${id}`);
                    fetchMessages();
                    Swal.fire({
                        title: 'Deleted!', 
                        text: 'Message has been purged from the system.', 
                        icon: 'success',
                        customClass: {
                            popup: 'luxury-admin-swal',
                            confirmButton: 'b-swal-confirm-btn-blue'
                        }
                    });
                } catch {
                    Swal.fire('Error', 'Could not delete message', 'error');
                }
            }
        });
    };

    const viewMessage = (msg) => {
        const isResolved = msg.status === 'Resolved';
        Swal.fire({
            html: `
                <div class="swal-contact-view">
                    <div class="scv-header">
                        <div class="scv-icon-wrap">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-mail"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                        </div>
                        <div class="scv-header-text">
                            <h3>Customer Support Ticket</h3>
                            <p>Ref: #${msg._id.substring(msg._id.length - 8).toUpperCase()}</p>
                        </div>
                        <div class="scv-status-badge ${isResolved ? 'resolved' : 'pending'}">
                            ${isResolved ? '<span class="status-dot green"></span> Resolved' : '<span class="status-dot amber"></span> Pending Review'}
                        </div>
                    </div>

                    <div class="scv-meta-grid">
                        <div class="scv-meta-item">
                            <span class="scv-label">Sender Identity</span>
                            <span class="scv-value">${msg.name}</span>
                        </div>
                        <div class="scv-meta-item">
                            <span class="scv-label">Direct Channel</span>
                            <a href="mailto:${msg.email}" class="scv-link">${msg.email}</a>
                        </div>
                        <div class="scv-meta-item">
                            <span class="scv-label">Phone Registry</span>
                            <span class="scv-value">${msg.phone || '<i style="color:#94a3b8">Undisclosed</i>'}</span>
                        </div>
                        <div class="scv-meta-item full-width">
                            <span class="scv-label">Context Thread</span>
                            <span class="scv-value tag-style">${msg.subject}</span>
                        </div>
                    </div>

                    <div class="scv-content-block">
                        <div class="scv-cb-header">
                            <h4 class="scv-label" style="margin:0;">Transmitted Content</h4>
                            <span class="scv-timestamp">${new Date(msg.createdAt).toLocaleString()}</span>
                        </div>
                        <div class="scv-message-body">
                            ${msg.message}
                        </div>
                    </div>
                </div>
            `,
            showCloseButton: true,
            showConfirmButton: !isResolved,
            showCancelButton: true,
            confirmButtonText: 'Mark As Resolved',
            cancelButtonText: 'Close Window',
            width: '550px',
            customClass: {
                popup: 'luxury-admin-swal no-padding-swal',
                confirmButton: 'b-swal-confirm-btn-blue',
                cancelButton: 'b-swal-cancel-btn-blue'
            }
        }).then((result) => {
            if (result.isConfirmed && !isResolved) {
                markAsResolved(msg._id);
            }
        });
    };

    const filteredMessages = messages.filter(m => 
        (m.name && m.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (m.email && m.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (m.subject && m.subject.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (loading) return (
        <div className="admin-loading">
            <MailOpen size={32} className="pf-spin" />
            <p>Syncing communication channels...</p>
        </div>
    );

    return (
        <div className="admin-contact-page animate-fade-in">
            <div className="ac-header-premium">
                <div className="ach-left">
                    <div className="ach-icon-container">
                        <MailOpen size={28} />
                    </div>
                    <div>
                        <h2>Support Communications</h2>
                        <p>Manage, review, and resolve direct customer inquiries and support tickets.</p>
                    </div>
                </div>
                <div className="ach-right">
                    <div className="ac-search-box">
                        <Search size={18} className="search-icon" />
                        <input 
                            type="text" 
                            placeholder="Scan by name, email, or subject..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="ac-grid-layout">
                {filteredMessages.length === 0 ? (
                    <div className="empty-contact-state glass-panel">
                        <Mail size={64} opacity={0.3} color="#94a3b8" />
                        <h3>Inbox Zero Maintained</h3>
                        <p>There are currently no matching support communications in the queue.</p>
                    </div>
                ) : (
                    filteredMessages.map(msg => (
                        <div key={msg._id} className={`contact-card-premium glass-panel ${msg.status === 'Resolved' ? 'is-resolved' : 'is-pending'}`}>
                            <div className="cc-top">
                                <div className="cc-user-info">
                                    <div className="cc-avatar">
                                        {(msg.name || 'User').charAt(0).toUpperCase()}
                                    </div>
                                    <div className="cc-user-meta">
                                        <h4>{msg.name}</h4>
                                        <a href={`mailto:${msg.email}`}><Mail size={12}/> {msg.email}</a>
                                    </div>
                                </div>
                                <div className="cc-status-container">
                                    {msg.status === 'Resolved' ? (
                                        <span className="cc-pill resolved"><CheckCircle size={12}/> Resolved</span>
                                    ) : (
                                        <span className="cc-pill pending"><Clock size={12}/> Pending Rev.</span>
                                    )}
                                </div>
                            </div>
                            
                            <div className="cc-body">
                                <span className="cc-subject-tag">{msg.subject}</span>
                                <p className="cc-excerpt">
                                    <CornerDownRight size={14} className="excerpt-icon"/>
                                    {msg.message.length > 80 ? msg.message.substring(0, 80) + '...' : msg.message}
                                </p>
                            </div>

                            <div className="cc-footer">
                                <div className="cc-date">
                                    {new Date(msg.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                </div>
                                <div className="cc-actions">
                                    <button 
                                        className="btn-cc-view" 
                                        onClick={() => viewMessage(msg)}
                                        title="Inspect Document"
                                    >
                                        <Eye size={16}/> View
                                    </button>
                                    <button 
                                        className="btn-cc-delete" 
                                        onClick={() => deleteMessage(msg._id)}
                                        title="Purge Document"
                                    >
                                        <Trash2 size={16}/>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default AdminContact;
