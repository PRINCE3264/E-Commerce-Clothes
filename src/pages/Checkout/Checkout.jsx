import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
    ShoppingBag, 
    Truck, 
    CreditCard, 
    CheckCircle, 
    ChevronRight, 
    ArrowLeft, 
    MapPin, 
    Phone, 
    Package,
    ShieldCheck
} from 'lucide-react';
import API from '../../utils/api';
import './Checkout.css';

const Checkout = ({ cartItems, onOrderComplete }) => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [userData] = useState(() => {
        const stored = localStorage.getItem('user_data');
        return stored ? JSON.parse(stored) : null;
    });

    const [shippingData, setShippingData] = useState({
        address: '',
        city: '',
        postalCode: '',
        country: 'India',
        phone: '',
        aadharNumber: '',
        panNumber: ''
    });

    const [deliverySpeed, setDeliverySpeed] = useState('standard'); // 'standard' or 'express'
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [lastOrderId, setLastOrderId] = useState('');

    const [paymentMethod, setPaymentMethod] = useState('COD');
    const [upiData, setUpiData] = useState(null);
    const [showUpiModal, setShowUpiModal] = useState(false);

    useEffect(() => {
        if (!userData) {
            // If not logged in, redirect to login with redirect param
            navigate('/login?redirect=/checkout');
        }
    }, [navigate, userData]);

    if (cartItems.length === 0) {
        return (
            <div className="checkout-page empty-checkout" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="container" style={{ textAlign: 'center', padding: '100px 20px', background: 'rgba(255,255,255,0.7)', borderRadius: '24px', border: '1px dashed #cbd5e1' }}>
                    <ShoppingBag size={80} color="#cbd5e1" style={{ marginBottom: '20px' }} />
                    <h2 style={{ fontSize: '2.5rem', color: '#1e293b', marginBottom: '15px' }}>Your Cart is Empty</h2>
                    <p style={{ color: '#64748b', fontSize: '1.1rem', marginBottom: '35px' }}>You need to add some premium items to your collection before proceeding to checkout.</p>
                    <Link to="/products" style={{ background: '#2b5a91', color: 'white', padding: '15px 35px', borderRadius: '12px', fontWeight: '800', transition: 'all 0.3s', display: 'inline-block' }}>Explore Collection</Link>
                </div>
            </div>
        );
    }

    const handleInputChange = (e) => {
        setShippingData({ ...shippingData, [e.target.name]: e.target.value });
    };

    const itemsPrice = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const baseShipping = itemsPrice > 5000 ? 0 : 150;
    const deliveryExtra = deliverySpeed === 'express' ? 250 : 0;
    const shippingPrice = baseShipping + deliveryExtra;
    const taxPrice = Math.round(itemsPrice * 0.12); // 12% Tax
    const totalPrice = itemsPrice + shippingPrice + taxPrice;

    const initRazorpay = (orderData, razorpayOrder) => {
        const options = {
            key: "rzp_test_RGlPdevCgkpRiA", // Use the key provided by user
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency,
            name: "PANDIT FASHION",
            description: "Premium Clothing Purchase",
            image: "https://ui-avatars.com/api/?name=PF&background=2b5a91&color=fff",
            order_id: razorpayOrder.id,
            handler: async (response) => {
                try {
                    const verifyPayload = {
                        razorpay_order_id: response.razorpay_order_id,
                        razorpay_payment_id: response.razorpay_payment_id,
                        razorpay_signature: response.razorpay_signature,
                        order_id: orderData._id
                    };
                    const res = await API.post('/payments/verify-razorpay', verifyPayload);
                    if (res.data.success) {
                        if (onOrderComplete) onOrderComplete();
                        navigate(`/payment?orderId=${orderData._id}&paymentId=${response.razorpay_payment_id}`);
                    }
                } catch (err) {
                    console.error("Payment verification failed", err);
                    alert("Payment verification failed. Please contact support.");
                }
            },
            prefill: {
                name: userData?.name,
                email: userData?.email,
                contact: shippingData.phone
            },
            notes: {
                address: shippingData.address
            },
            theme: {
                color: "#2b5a91"
            },
            modal: {
                ondismiss: function() {
                    setLoading(false);
                }
            }
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
    };

    const placeOrder = async () => {
        setLoading(true);
        try {
            const orderPayload = {
                orderItems: cartItems.map(item => ({
                    product: item._id,
                    name: item.name,
                    image: item.image,
                    price: item.price,
                    quantity: item.quantity,
                    size: item.size,
                    color: item.color
                })),
                shippingAddress: shippingData,
                paymentMethod: paymentMethod,
                deliverySpeed,
                itemsPrice,
                shippingPrice,
                taxPrice,
                totalPrice
            };

            const res = await API.post('/orders', orderPayload);
            if (res.data.success) {
                if (paymentMethod === 'ONLINE' && res.data.razorpayOrder) {
                    initRazorpay(res.data.data, res.data.razorpayOrder);
                } else if (paymentMethod === 'STRIPE' && res.data.stripeUrl) {
                    // Redirect to Stripe Checkout Session
                    window.location.href = res.data.stripeUrl;
                } else if (paymentMethod === 'UPI') {
                    // Fetch UPI Details
                    const upiRes = await API.post('/payments/upi-intent', { amount: totalPrice, orderId: res.data.data._id });
                    if (upiRes.data.success) {
                        setUpiData(upiRes.data);
                        setLastOrderId(res.data.data._id);
                        setShowUpiModal(true);
                        setLoading(false);
                    }
                } else if (res.data.data?._id) {
                    if (onOrderComplete) onOrderComplete();
                    const orderId = res.data.data._id;
                    setLastOrderId(orderId);
                    localStorage.setItem('pf_last_order_id', orderId);
                    setShowSuccessModal(true);
                    setLoading(false);
                } else {
                    throw new Error("Order created but no ID returned from server.");
                }
            }
        } catch (err) {
            console.error("Order completion failed", err);
            alert("Something went wrong while placing your order. Please try again.");
            setLoading(false);
        }
    };

    return (
        <div className="checkout-page">
            <div className="container">
                {/* Progress Stepper */}
                <div className="checkout-stepper">
                    <div className={`step-item ${step >= 1 ? 'active' : ''}`}>
                        <div className="step-circle"><MapPin size={20}/></div>
                        <span>Shipping</span>
                    </div>
                    <div className="step-connector"></div>
                    <div className={`step-item ${step >= 2 ? 'active' : ''}`}>
                        <div className="step-circle"><CreditCard size={20}/></div>
                        <span>Review</span>
                    </div>
                    <div className="step-connector"></div>
                    <div className={`step-item ${step >= 3 ? 'active' : ''}`}>
                        <div className="step-circle"><CheckCircle size={20}/></div>
                        <span>Complete</span>
                    </div>
                </div>

                <div className="checkout-layout">
                    {/* Left Side: Form / Success */}
                    <div className="checkout-main-area">
                        {step === 1 && (
                            <div className="checkout-card glass-panel animate-slide-up">
                                <div className="card-header">
                                    <h3><Truck /> Shipping Essentials</h3>
                                    <p>Where should we deliver your premium collection?</p>
                                </div>
                                <form className="checkout-form" onSubmit={(e) => { e.preventDefault(); setStep(2); }}>
                                    <div className="form-row">
                                        <div className="input-group full">
                                            <label>Full Delivery Address</label>
                                            <textarea 
                                                name="address" 
                                                required 
                                                placeholder="Street, Landmark, Apartment"
                                                value={shippingData.address}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                    </div>
                                    <div className="form-row split">
                                        <div className="input-group">
                                            <label>City</label>
                                            <input 
                                                type="text" 
                                                name="city" 
                                                required 
                                                placeholder="e.g. Mumbai"
                                                value={shippingData.city}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                        <div className="input-group">
                                            <label>Postal Code</label>
                                            <input 
                                                type="text" 
                                                name="postalCode" 
                                                required 
                                                placeholder="000 000"
                                                value={shippingData.postalCode}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                    </div>
                                    <div className="form-row split">
                                        <div className="input-group">
                                            <label>Phone Number</label>
                                            <div className="phone-input-wrap">
                                                <span>+91</span>
                                                <input 
                                                    type="tel" 
                                                    name="phone" 
                                                    required 
                                                    placeholder="10-digit mobile"
                                                    value={shippingData.phone}
                                                    onChange={handleInputChange}
                                                />
                                            </div>
                                        </div>
                                        <div className="input-group">
                                            <label>Country</label>
                                            <input 
                                                type="text" 
                                                name="country" 
                                                disabled 
                                                value={shippingData.country}
                                            />
                                        </div>
                                    </div>

                                    {/* KYC Section Row */}
                                    <div className="form-row split">
                                        <div className="input-group">
                                            <label>Aadhar Number (Optional)</label>
                                            <input 
                                                type="text" 
                                                name="aadharNumber" 
                                                placeholder="xxxx xxxx xxxx"
                                                maxLength="14"
                                                value={shippingData.aadharNumber}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                        <div className="input-group">
                                            <label>PAN Number (Optional)</label>
                                            <input 
                                                type="text" 
                                                name="panNumber" 
                                                placeholder="ABCDE1234F"
                                                maxLength="10"
                                                style={{textTransform: 'uppercase'}}
                                                value={shippingData.panNumber}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                    </div>

                                    {/* Order Time / Delivery Speed Selection */}
                                    <div className="delivery-speed-section">
                                        <label className="section-small-label">SELECT DELIVERY SPEED</label>
                                        <div className="speed-options">
                                            <div 
                                                className={`speed-card ${deliverySpeed === 'standard' ? 'active' : ''}`}
                                                onClick={() => setDeliverySpeed('standard')}
                                            >
                                                <div className="speed-info">
                                                    <span className="speed-title">Standard Delivery</span>
                                                    <span className="speed-time">3-5 Business Days</span>
                                                </div>
                                                <div className="speed-price">
                                                    {baseShipping === 0 ? 'FREE' : `₹${baseShipping}`}
                                                </div>
                                            </div>
                                            <div 
                                                className={`speed-card ${deliverySpeed === 'express' ? 'active' : ''}`}
                                                onClick={() => setDeliverySpeed('express')}
                                            >
                                                <div className="speed-info">
                                                    <span className="speed-title">Express Delivery</span>
                                                    <span className="speed-time">1-2 Days Guaranteed</span>
                                                </div>
                                                <div className="speed-price">
                                                    ₹{baseShipping + 250}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="form-actions">
                                        <button type="button" className="btn-back" onClick={() => navigate('/cart')}>
                                            <ArrowLeft size={18}/> BACK TO CART
                                        </button>
                                        <button type="submit" className="btn-continue">
                                            SAVE & REVIEW <ChevronRight size={18}/>
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="checkout-card glass-panel animate-slide-up">
                                <div className="card-header">
                                    <h3><Package /> Order Verification</h3>
                                    <p>Please confirm your details before we finalize your order.</p>
                                </div>
                                
                                <div className="review-section">
                                    <div className="review-block">
                                        <div className="review-label"><MapPin size={16}/> SHIPPING DESTINATION</div>
                                        <div className="review-content">
                                            <p><strong>{userData?.name}</strong></p>
                                            <p>{shippingData.address}</p>
                                            <p>{shippingData.city}, {shippingData.postalCode}</p>
                                            <p>{shippingData.country}</p>
                                            <p><Phone size={14}/> +91 {shippingData.phone}</p>
                                        </div>
                                        <button className="edit-link" onClick={() => setStep(1)}>Modify Address</button>
                                    </div>

                                    <div className="review-block">
                                        <div className="review-label"><CreditCard size={16}/> PAYMENT APPROACH</div>
                                        <div className="payment-options">
                                            <label className={`payment-pill ${paymentMethod === 'COD' ? 'active' : ''}`}>
                                                <input 
                                                    type="radio" 
                                                    name="payment" 
                                                    checked={paymentMethod === 'COD'}
                                                    onChange={() => setPaymentMethod('COD')}
                                                />
                                                <div className="payment-pill-box">
                                                    <span className="dot"></span>
                                                    <span>Cash on Delivery</span>
                                                </div>
                                            </label>
                                            <label className={`payment-pill ${paymentMethod === 'ONLINE' ? 'active' : ''}`}>
                                                <input 
                                                    type="radio" 
                                                    name="payment" 
                                                    checked={paymentMethod === 'ONLINE'}
                                                    onChange={() => setPaymentMethod('ONLINE')}
                                                />
                                                <div className="payment-pill-box">
                                                    <span className="dot"></span>
                                                    <span>Online (Razorpay/UPI)</span>
                                                </div>
                                            </label>
                                            <label className={`payment-pill ${paymentMethod === 'STRIPE' ? 'active' : ''}`}>
                                                <input 
                                                    type="radio" 
                                                    name="payment" 
                                                    checked={paymentMethod === 'STRIPE'}
                                                    onChange={() => setPaymentMethod('STRIPE')}
                                                />
                                                <div className="payment-pill-box">
                                                    <span className="dot"></span>
                                                    <span>Stripe (Global Card/Pay)</span>
                                                </div>
                                            </label>
                                            <label className={`payment-pill ${paymentMethod === 'UPI' ? 'active' : ''}`}>
                                                <input 
                                                    type="radio" 
                                                    name="payment" 
                                                    checked={paymentMethod === 'UPI'}
                                                    onChange={() => setPaymentMethod('UPI')}
                                                />
                                                <div className="payment-pill-box">
                                                    <span className="dot"></span>
                                                    <span>Direct UPI (ID/QR)</span>
                                                </div>
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                <div className="form-actions">
                                    <button className="btn-back" onClick={() => setStep(1)}>
                                        <ArrowLeft size={18}/> BACK TO SHIPPING
                                    </button>
                                    <button className="btn-finalize" onClick={placeOrder} disabled={loading}>
                                        {loading ? 'PROCESSING...' : `PLACE ORDER • ₹${totalPrice.toLocaleString()}`}
                                    </button>
                                </div>
                            </div>
                        )}

                        {showSuccessModal && (
                            <div className="checkout-success-overlay">
                                <div className="success-modal-box glass-panel animate-pop-in">
                                    <div className="success-icon-wrap">
                                        <div className="success-pulse"></div>
                                        <CheckCircle size={80} color="#10b981" />
                                    </div>
                                    <h2>Order Placed!</h2>
                                    <p>Your premium collection is now on its way. We've sent a confirmation to your phone and email.</p>
                                    
                                    <div className="modal-stats-row">
                                        <div className="m-stat">
                                            <span>ORDER ID</span>
                                            <strong>#{lastOrderId.slice(-8).toUpperCase()}</strong>
                                        </div>
                                        <div className="m-stat">
                                            <span>EST. ARRIVAL</span>
                                            <strong>{deliverySpeed === 'express' ? '1-2 Days' : '3-5 Days'}</strong>
                                        </div>
                                    </div>

                                    <div className="success-actions">
                                        <button className="btn-track" onClick={() => navigate(`/payment?orderId=${lastOrderId}`)}>
                                            VIEW ORDER RECEIPT <ArrowLeft size={18} style={{ transform: 'rotate(180deg)', marginLeft: '8px' }}/>
                                        </button>
                                        <button className="btn-home" onClick={() => navigate('/')}>BACK TO SHOP</button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {showUpiModal && upiData && (
                            <div className="checkout-success-overlay">
                                <div className="upi-payment-modal glass-panel animate-pop-in" style={{ maxWidth: '450px', padding: '30px', textAlign: 'center', margin: '0 20px' }}>
                                    <div className="upi-header" style={{ marginBottom: '20px' }}>
                                        <div style={{ background: '#2563eb', color: 'white', display: 'inline-block', padding: '10px 20px', borderRadius: '12px', fontWeight: '900', fontSize: '1.2rem', marginBottom: '10px' }}>
                                            UPI PAYMENT
                                        </div>
                                        <p style={{ color: '#64748b' }}>Scan QR or pay to the UPI ID below</p>
                                    </div>
                                    
                                    <div className="qr-container" style={{ background: 'white', padding: '20px', borderRadius: '16px', display: 'inline-block', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
                                        <img 
                                            src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiData.upiLink)}`} 
                                            alt="UPI QR Code" 
                                            style={{ width: '200px', height: '200px' }}
                                        />
                                    </div>

                                    <div className="upi-id-box" style={{ background: '#f8fafc', padding: '15px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '25px' }}>
                                        <span style={{ fontSize: '0.8rem', color: '#64748b', display: 'block', marginBottom: '5px' }}>OFFICIAL UPI ID</span>
                                        <strong style={{ fontSize: '1.1rem', color: '#1e293b' }}>{upiData.upiId}</strong>
                                    </div>

                                    <div className="upi-actions" style={{ display: 'flex', gap: '15px' }}>
                                        <button 
                                            className="btn-done" 
                                            style={{ flex: 1, background: '#10b981', color: 'white', padding: '14px', borderRadius: '12px', fontWeight: '800', border: 'none', cursor: 'pointer' }}
                                            onClick={() => {
                                                setShowUpiModal(false);
                                                setShowSuccessModal(true);
                                                if (onOrderComplete) onOrderComplete();
                                            }}
                                        >
                                            I HAVE PAID
                                        </button>
                                        <button 
                                            className="btn-cancel" 
                                            style={{ flex: 1, background: '#f1f5f9', color: '#64748b', padding: '14px', borderRadius: '12px', fontWeight: '700', border: 'none', cursor: 'pointer' }}
                                            onClick={() => setShowUpiModal(false)}
                                        >
                                            CANCEL
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Side: Order Summary Sticky Card */}
                    <div className="checkout-summary-area">
                        <div className="summary-sticky glass-panel">
                            <h4>Order Summary</h4>
                            <div className="summary-items">
                                {cartItems.map((item, idx) => (
                                    <div className="summary-item" key={idx}>
                                        <div className="s-item-img">
                                            <img src={item.image} alt={item.name} />
                                            <span className="s-item-qty">{item.quantity}</span>
                                        </div>
                                        <div className="s-item-info">
                                            <h5>{item.name}</h5>
                                            <p>{item.size} • {item.color || 'Default'}</p>
                                            <span className="s-item-price">₹{(item.price * item.quantity).toLocaleString()}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            
                            <div className="summary-calculations">
                                <div className="calc-row">
                                    <span>Subtotal</span>
                                    <span>₹{itemsPrice.toLocaleString()}</span>
                                </div>
                                <div className="calc-row">
                                    <span>Shipping</span>
                                    <span style={{color: shippingPrice === 0 ? '#10b981' : ''}}>
                                        {shippingPrice === 0 ? 'FREE' : `₹${shippingPrice}`}
                                    </span>
                                </div>
                                <div className="calc-row">
                                    <span>GST (12%)</span>
                                    <span>₹{taxPrice.toLocaleString()}</span>
                                </div>
                                <div className="calc-divider"></div>
                                <div className="calc-row total">
                                    <span>Order Total</span>
                                    <span>₹{totalPrice.toLocaleString()}</span>
                                </div>
                            </div>

                            <div className="summary-trust">
                                <div className="trust-badge">
                                    <ShieldCheck size={18} />
                                    <span>Secure 256-bit Encrypted Checkout</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
