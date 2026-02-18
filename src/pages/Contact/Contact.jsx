import React, { useState } from 'react';
import {
    MapPin,
    Phone,
    Mail,
    Clock,
    Facebook,
    Instagram,
    Twitter,
    Linkedin,
    Youtube,
    Send,
    User,
    MessageSquare,
    PhoneCall,
    Tag,
    ShieldCheck,
    HelpCircle,
    Headset,
    Truck,
    UserCircle,
    ArrowRight,
    MapPinned
} from 'lucide-react';
import './Contact.css';

const Contact = () => {
    const [showSuccess, setShowSuccess] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
        preferredMethod: 'Email',
        subscribe: true
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 4000);
        // Clear form
        e.target.reset();
    };

    return (
        <div className="contact-page">
            <section className="contact-hero">
                <div className="hero-overlay"></div>
                <div className="container">
                    <div className="hero-content centered">
                        <h1 className="contact-title">Contact <span className="txt-accent">Us</span></h1>
                        <p className="contact-intro">
                            Have questions, feedback, or need assistance? We're here to help!
                            Reach out to our friendly support team.
                        </p>
                    </div>
                </div>
            </section>

            <section className="contact-container section-padding">
                <div className="container">
                    <div className="contact-grid">
                        {/* Left: Info Sidebar */}
                        <div className="contact-sidebar">
                            <div className="sidebar-section">
                                <h2 className="section-subtitle">Get in Touch</h2>
                                <div className="contact-methods">
                                    <div className="method-card">
                                        <div className="method-icon"><MapPin size={24} /></div>
                                        <div className="method-info">
                                            <h3>Visit Our Store</h3>
                                            <p>Palanpur Jakat Naka Bus Stop, Ugat Road</p>
                                            <p>Sima Nagar, Surat, Gujarat 395005</p>
                                            <a href="https://www.google.com/maps" target="_blank" className="method-link">Get Directions <ArrowRight size={16} /></a>
                                        </div>
                                    </div>

                                    <div className="method-card">
                                        <div className="method-icon"><Phone size={24} /></div>
                                        <div className="method-info">
                                            <h3>Call Us</h3>
                                            <p>+91 9508604799</p>
                                            <p>Mon - Sat, 10AM - 8PM</p>
                                            <a href="tel:+919508604799" className="method-link">Talk to Support <ArrowRight size={16} /></a>
                                        </div>
                                    </div>

                                    <div className="method-card">
                                        <div className="method-icon"><Mail size={24} /></div>
                                        <div className="method-info">
                                            <h3>Email Us</h3>
                                            <p>vidyarthiprince@gmail.com</p>
                                            <p>princekumarvidyarthi4@gmail.com</p>
                                            <a href="mailto:vidyarthiprince@gmail.com" className="method-link">Send Email <ArrowRight size={16} /></a>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="sidebar-section">
                                <h3 className="sub-header"><Clock size={20} /> Business Hours</h3>
                                <div className="hours-box">
                                    <div className="hour-row">
                                        <span>Monday - Saturday</span>
                                        <span>10:00 AM - 8:00 PM</span>
                                    </div>
                                    <div className="hour-row closed">
                                        <span>Sunday</span>
                                        <span>Closed (Online Only)</span>
                                    </div>
                                </div>
                            </div>

                            <div className="sidebar-section">
                                <h3 className="sub-header"><MapPinned size={20} /> Our Location</h3>
                                <div className="map-wrapper">
                                    <iframe
                                        src="https://www.google.com/maps?q=Palanpur+Jakat+Naka+Bus+Stop,Surat,Gujarat&output=embed"
                                        width="100%"
                                        height="250"
                                        style={{ border: 0, borderRadius: '15px' }}
                                        allowFullScreen=""
                                        loading="lazy"
                                    ></iframe>
                                </div>
                            </div>

                            <div className="sidebar-section">
                                <h3 className="sub-header">Follow Us</h3>
                                <div className="contact-socials">
                                    <a href="#" className="social-btn fb"><Facebook size={20} /></a>
                                    <a href="#" className="social-btn ig"><Instagram size={20} /></a>
                                    <a href="#" className="social-btn tw"><Twitter size={20} /></a>
                                    <a href="#" className="social-btn li"><Linkedin size={20} /></a>
                                    <a href="#" className="social-btn yt"><Youtube size={20} /></a>
                                </div>
                            </div>
                        </div>

                        {/* Right: Contact Form */}
                        <div className="contact-form-wrapper">
                            <div className="form-header">
                                <h2>Send Us a Message</h2>
                                <p>Fill out the form below and we'll get back to you as soon as possible.</p>
                            </div>

                            <form className="luxury-form" onSubmit={handleSubmit}>
                                <div className="form-row anim-row-1">
                                    <div className="form-group">
                                        <label><User size={16} /> Full Name *</label>
                                        <input type="text" placeholder="Enter your full name" required />
                                    </div>
                                    <div className="form-group">
                                        <label><Mail size={16} /> Email Address *</label>
                                        <input type="email" placeholder="Enter your email address" required />
                                    </div>
                                </div>

                                <div className="form-row anim-row-2">
                                    <div className="form-group">
                                        <label><PhoneCall size={16} /> Phone Number</label>
                                        <input type="tel" placeholder="Enter your phone number" />
                                    </div>
                                    <div className="form-group">
                                        <label><Tag size={16} /> Subject *</label>
                                        <select required>
                                            <option value="">Select a subject</option>
                                            <option value="General Inquiry">General Inquiry</option>
                                            <option value="Order Support">Order Support</option>
                                            <option value="Returns & Exchanges">Returns & Exchanges</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="form-group anim-row-3">
                                    <label><MessageSquare size={16} /> Your Message *</label>
                                    <textarea rows="6" placeholder="Please describe your inquiry in detail..." required></textarea>
                                </div>

                                <div className="form-footer anim-row-4">
                                    <div className="checkbox-group">
                                        <input type="checkbox" id="privacy" required />
                                        <label htmlFor="privacy">I agree to the <a href="#">Privacy Policy</a></label>
                                    </div>
                                    <button type="submit" className="btn-submit">
                                        Send Message <Send size={18} />
                                    </button>
                                </div>
                                <p className="security-note anim-row-4">
                                    <ShieldCheck size={14} /> Your information is secure and will not be shared.
                                </p>
                            </form>
                        </div>
                    </div>

                    {/* Success Popup */}
                    {showSuccess && (
                        <div className="contact-success-overlay">
                            <div className="contact-success-modal">
                                <div className="success-lottie-circle">
                                    <ShieldCheck size={48} />
                                </div>
                                <h2>Message Sent!</h2>
                                <p>Thank you for reaching out. Our support team will respond to your inquiry within 24 hours.</p>
                                <button className="btn-close-success" onClick={() => setShowSuccess(false)}>Great, Thanks!</button>
                            </div>
                        </div>
                    )}

                    {/* Quick Help Section */}
                    <div className="quick-help section-padding">
                        <h2 className="centered mb-5">Need Quick Help?</h2>
                        <div className="help-grid">
                            <div className="help-card">
                                <div className="help-icon"><HelpCircle size={32} /></div>
                                <h3>FAQ</h3>
                                <p>Find answers to common questions</p>
                            </div>
                            <div className="help-card active">
                                <div className="help-icon"><Headset size={32} /></div>
                                <h3>Live Chat</h3>
                                <p>Chat with our support team now</p>
                            </div>
                            <div className="help-card">
                                <div className="help-icon"><Truck size={32} /></div>
                                <h3>Track Order</h3>
                                <p>Check your order status</p>
                            </div>
                            <div className="help-card">
                                <div className="help-icon"><UserCircle size={32} /></div>
                                <h3>My Account</h3>
                                <p>Manage your orders & profile</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Contact;
