import React from 'react';
import { Link } from 'react-router-dom';
import {
    Facebook,
    Twitter,
    Instagram,
    Youtube,
    ChevronRight,
    Shirt
} from 'lucide-react';
import './Footer.css';

const Footer = () => {
    return (
        <footer className="site-footer">
            <div className="container">
                <div className="footer-main-grid">
                    {/* Brand Column */}
                    <div className="footer-column brand-info">
                        <div className="footer-logo-container">
                            <Shirt className="logo-icon" size={24} />
                            <h2 className="footer-logo-text">
                                Pandit<span>Fashion</span>
                            </h2>
                        </div>
                        <p className="footer-tagline">
                            Your one-stop destination for premium fashion. Quality meets style in every stitch.
                        </p>
                        <div className="footer-socials">
                            <a href="#" className="social-circle"><Facebook size={16} /></a>
                            <a href="#" className="social-circle"><Twitter size={16} /></a>
                            <a href="#" className="social-circle"><Instagram size={16} /></a>
                            <a href="#" className="social-circle"><span className="p-icon">P</span></a>
                            <a href="#" className="social-circle"><Youtube size={16} /></a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="footer-column">
                        <h3>Quick Links</h3>
                        <ul className="footer-links-list">
                            <li><Link to="/"><ChevronRight size={14} /> Home</Link></li>
                            <li><Link to="/about"><ChevronRight size={14} /> About Us</Link></li>
                            <li><Link to="/products"><ChevronRight size={14} /> Shop</Link></li>
                            <li><Link to="/products"><ChevronRight size={14} /> New Arrivals</Link></li>
                            <li><Link to="/products"><ChevronRight size={14} /> Best Sellers</Link></li>
                        </ul>
                    </div>

                    {/* Customer Service */}
                    <div className="footer-column">
                        <h3>Customer Service</h3>
                        <ul className="footer-links-list">
                            <li><Link to="/contact"><ChevronRight size={14} /> Contact Us</Link></li>
                            <li><Link to="/faq"><ChevronRight size={14} /> FAQ</Link></li>
                            <li><Link to="/shipping"><ChevronRight size={14} /> Shipping Policy</Link></li>
                            <li><Link to="/returns"><ChevronRight size={14} /> Return & Exchange</Link></li>
                            <li><Link to="/privacy"><ChevronRight size={14} /> Privacy Policy</Link></li>
                        </ul>
                    </div>

                    {/* Newsletter */}
                    <div className="footer-column newsletter-col">
                        <h3>Newsletter</h3>
                        <p className="news-desc">Subscribe to get updates on new arrivals and special offers.</p>
                        <div className="news-form">
                            <input type="email" placeholder="Enter your email" className="news-input" />
                            <button className="news-btn">Subscribe</button>
                        </div>
                        <div className="payment-badges">
                            <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" />
                            <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" />
                            <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" />
                            <img src="https://upload.wikimedia.org/wikipedia/commons/4/46/Bitcoin.svg" alt="Bitcoin" />
                            <img src="https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg" className="apple-pay" alt="Apple Pay" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="footer-bottom-bar">
                <div className="container">
                    <p>
                        © 2026 Pandit Fashion. All rights reserved. | Designed By PRINCE VIDYARTHI <span className="heart">❤️</span>
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
