import React, { useEffect, useState } from 'react';
import {
    Users,
    Target,
    Award,
    Globe,
    Star,
    TrendingUp,
    ShieldCheck,
    Heart,
    Linkedin,
    Instagram,
    Twitter,
    ArrowRight,
    ChevronDown,
    Loader2
} from 'lucide-react';
import './About.css';
import API from '../../utils/api';

const About = () => {
    const [counts, setCounts] = useState({ customers: 0, designs: 0, satisfaction: 0 });
    const [team, setTeam] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simple counter animation
        const targets = { customers: 50000, designs: 1200, satisfaction: 98 };
        const duration = 2000;
        const steps = 50;
        const interval = duration / steps;

        let currentStep = 0;

        const timer = setInterval(() => {
            currentStep++;
            if (currentStep >= steps) {
                setCounts(targets);
                clearInterval(timer);
            } else {
                setCounts({
                    customers: Math.floor((targets.customers / steps) * currentStep),
                    designs: Math.floor((targets.designs / steps) * currentStep),
                    satisfaction: Math.floor((targets.satisfaction / steps) * currentStep),
                });
            }
        }, interval);

        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const fetchTeam = async () => {
            try {
                const { data } = await API.get('/team');
                if (data.success) {
                    setTeam(data.data);
                }
            } catch (err) {
                console.error("Error fetching team", err);
            } finally {
                setLoading(false);
            }
        };
        fetchTeam();
    }, []);

    const values = [
        {
            icon: <Star size={40} />,
            title: "Premium Quality",
            desc: "Every piece is crafted with attention to detail, using durable fabrics that stand the test of time."
        },
        {
            icon: <Award size={40} />,
            title: "Affordable Prices",
            desc: "We believe great fashion should be accessible to everyone without compromising on quality."
        },
        {
            icon: <Globe size={40} />,
            title: "Fast Delivery",
            desc: "Get your fashion fix quickly with our reliable and speedy shipping across the globe."
        },
        {
            icon: <Heart size={40} />,
            title: "24/7 Support",
            desc: "Our dedicated customer service team is always ready to assist you with any questions."
        }
    ];


    return (
        <div className="about-page">
            {/* Hero Section */}
            <section className="about-hero">
                <div className="hero-overlay"></div>
                <div className="container">
                    <div className="hero-content">
                        <span className="hero-badge">Our Story</span>
                        <h1 className="about-title">Pandit Fashion, <span className="txt-accent">Affordably</span></h1>
                        <p className="hero-subtitle">Where style meets quality, and every garment is designed for real life.</p>
                        <a href="#our-story" className="btn-discover">
                            Discover Our Journey <ChevronDown size={20} className="bounce-icon" />
                        </a>
                    </div>
                </div>
            </section>

            {/* Our Story Section */}
            <section id="our-story" className="our-story section-padding">
                <div className="container">
                    <div className="story-layout">
                        <div className="story-image-wrapper">
                            <div className="image-frame">
                                <img src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Workshop" className="story-img" />
                                <div className="experience-badge">
                                    <span className="years">10+</span>
                                    <span className="label">Years of Excellence</span>
                                </div>
                            </div>
                        </div>
                        <div className="story-content">
                            <h2 className="section-title">Our Story</h2>
                            <p className="lead-text">Founded in 2014, Pandit Fashion began as a small online boutique with big dreams.</p>
                            <p className="description">Our founders noticed a gap in the market: boutique-quality clothing that didn't break the bank. What started as a small collection of 50 essential pieces has grown into an international style destination trusted by over 50,000 customers.</p>
                            <p className="description">Today, we serve fashion lovers across 45+ countries, but our core promise remains the same: <strong>style, quality, and value.</strong></p>

                            <div className="stats-grid">
                                <div className="stat-item">
                                    <h3 className="stat-number">{counts.customers.toLocaleString()}+</h3>
                                    <p className="stat-label">Happy Customers</p>
                                </div>
                                <div className="stat-item">
                                    <h3 className="stat-number">{counts.designs.toLocaleString()}+</h3>
                                    <p className="stat-label">Unique Designs</p>
                                </div>
                                <div className="stat-item">
                                    <h3 className="stat-number">{counts.satisfaction}%</h3>
                                    <p className="stat-label">Satisfaction Rate</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Mission & Values */}
            <section className="about-values section-padding bg-light">
                <div className="container">
                    <div className="section-header centered">
                        <h2 className="section-title">Our Mission & Values</h2>
                        <p className="section-subtitle">We're committed to transforming your wardrobe through these core principles:</p>
                    </div>
                    <div className="values-grid">
                        {values.map((v, i) => (
                            <div className={`value-card v-anim-${i + 1}`} key={i}>
                                <div className="value-icon-box">{v.icon}</div>
                                <h3>{v.title}</h3>
                                <p>{v.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Meet the Team */}
            <section className="about-team section-padding">
                <div className="container">
                    <div className="section-header centered">
                        <h2 className="section-title">Meet Our Team</h2>
                        <p className="section-subtitle">The passionate minds behind Pandit Fashion</p>
                    </div>
                    <div className="team-grid">
                        {loading ? (
                            <div className="loader-container">
                                <Loader2 className="animate-spin" size={48} />
                            </div>
                        ) : (
                            team.map((member, i) => (
                                <div className={`team-card t-anim-${i + 1}`} key={member._id || i}>
                                    <div className="team-img-box">
                                        <img src={member.image || member.img} alt={member.name} />
                                        <div className="team-overlay">
                                            <div className="social-box">
                                                <a href={member.socials?.linkedin || "#"}><Linkedin size={20} /></a>
                                                <a href={member.socials?.instagram || "#"}><Instagram size={20} /></a>
                                                <a href={member.socials?.twitter || "#"}><Twitter size={20} /></a>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="team-info">
                                        <h4>{member.name}</h4>
                                        <span className="role">{member.role}</span>
                                        <p>{member.description || member.desc}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </section>

            {/* CTA Section */}


        </div>
    );
};

export default About;
