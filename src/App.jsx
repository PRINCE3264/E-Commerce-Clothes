import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header/Header';
import Sidebar from './components/Sidebar/Sidebar';
import Footer from './components/Footer/Footer';
import Home from './pages/Home/Home';
import About from './pages/About/About';
import Products from './pages/Products/Products';
import Blog from './pages/Blog/Blog';
import Contact from './pages/Contact/Contact';
import Login from './pages/Login/Login';
import Cart from './pages/Cart/Cart';
import Profile from './pages/Profile/Profile';
import Wishlist from './pages/Wishlist/Wishlist';
import Register from './pages/Register/Register';
import ForgotPassword from './pages/ForgotPassword/ForgotPassword';
import { X, CheckCircle, ShoppingBag, AlertCircle } from 'lucide-react';
import './pages/Home/Home_CartModal.css';
import './components/Modals/WishlistModal.css';
import './index.css';

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('khushi_cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });
  const [wishlist, setWishlist] = useState(() => {
    const savedWishlist = localStorage.getItem('khushi_wishlist');
    return savedWishlist ? JSON.parse(savedWishlist) : [];
  });

  useEffect(() => {
    localStorage.setItem('khushi_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('khushi_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const [lastAdded, setLastAdded] = useState(null);
  const [showCartModal, setShowCartModal] = useState(false);
  const [wishlistConfirm, setWishlistConfirm] = useState({ show: false, product: null });

  const addToCart = (product) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id);
      if (existingItem) {
        return prevCart.map((item) =>
          item.id === product.id ? { ...item, quantity: (item.quantity || 1) + 1 } : item
        );
      }
      return [...prevCart, { ...product, quantity: 1, cartId: Date.now() }];
    });
    setLastAdded(product);
    setWishlistConfirm({ show: false, product: null }); // Close wishlist modal if open
    setShowCartModal(true);
  };

  const toggleWishlist = (product) => {
    setWishlist((prevWish) => {
      const exists = prevWish.find(item => item.id === product.id);
      if (exists) {
        setShowCartModal(false); // Close cart modal if open
        setWishlistConfirm({ show: true, product });
        return prevWish; // Don't remove yet, wait for confirmation
      }
      return [...prevWish, product];
    });
  };

  const removeFromWishlist = (product) => {
    // Direct removal without confirmation - used for "Add to Cart" or direct delete in Wishlist page
    setWishlist((prevWish) => prevWish.filter(item => item.id !== product.id));
  };

  const confirmWishlistRemoval = () => {
    if (wishlistConfirm.product) {
      setWishlist((prevWish) => prevWish.filter(item => item.id !== wishlistConfirm.product.id));
      setWishlistConfirm({ show: false, product: null });
    }
  };

  const removeCartItem = (cartId) => {
    setCart((prevCart) => prevCart.filter((item) => item.cartId !== cartId));
  };

  const updateCartQuantity = (cartId, delta) => {
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.cartId === cartId ? { ...item, quantity: Math.max(1, (item.quantity || 1) + delta) } : item
      )
    );
  };

  return (
    <Router>
      <div className="app">
        <Header
          toggleSidebar={toggleSidebar}
          cartCount={cart.length}
          wishlistCount={wishlist.length}
          cart={cart}
          lastAdded={lastAdded}
        />
        <Sidebar
          isOpen={isSidebarOpen}
          toggleSidebar={toggleSidebar}
          wishlistItems={wishlist}
          onToggleWishlist={toggleWishlist}
        />

        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home onAddToCart={addToCart} onToggleWishlist={toggleWishlist} wishlist={wishlist} />} />
            <Route path="/about" element={<About />} />
            <Route path="/products" element={
              <Products
                onAddToCart={addToCart}
                onToggleWishlist={toggleWishlist}
                wishlist={wishlist}
              />
            } />
            <Route path="/blog" element={<Blog />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/cart" element={
              <Cart
                cartItems={cart}
                onRemoveItem={removeCartItem}
                onUpdateQuantity={updateCartQuantity}
              />
            } />
            <Route path="/wishlist" element={
              <Wishlist
                wishlistItems={wishlist}
                onRemoveFromWishlist={removeFromWishlist}
                onToggleWishlist={toggleWishlist}
                onAddToCart={addToCart}
              />
            } />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </main>

        <Footer />

        {/* Global Premium Centered Cart Modal */}
        {showCartModal && lastAdded && (
          <div className="luxury-popup-container-advance" onClick={() => setShowCartModal(false)}>
            <div className="advance-success-modal animate-wow" onClick={e => e.stopPropagation()}>
              <button className="advance-close" onClick={() => setShowCartModal(false)}>
                <X size={20} />
              </button>

              <div className="vibrant-success-zone">
                <div className="success-lottie-emulation">
                  <svg viewBox="0 0 52 52" className="checkmark-svg">
                    <circle className="checkmark-circle" cx="26" cy="26" r="25" fill="none" />
                    <path className="checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
                  </svg>
                </div>
                <h2 className="glam-title">Excellent Choice!</h2>
                <p className="glam-subtitle">Your selection has been moved to your shopping bag.</p>
              </div>

              <div className="added-item-display">
                <div className="item-image-premium">
                  <img src={lastAdded.image} alt={lastAdded.name || lastAdded.title} />
                </div>
                <div className="item-brief-info">
                  <span className="ib-category">{lastAdded.category || "Premium Collection"}</span>
                  <h4 className="ib-name">{lastAdded.name || lastAdded.title}</h4>
                  <p className="ib-price">₹{(lastAdded.price || 0).toFixed(2)}</p>
                </div>
              </div>

              <div className="advance-actions">
                <button
                  className="btn-checkout-luxury"
                  onClick={() => {
                    setShowCartModal(false);
                    window.location.href = '/cart'; // Force navigation or use navigate if available
                  }}
                >
                  CHECKOUT NOW
                </button>
                <button className="btn-continue-styling" onClick={() => setShowCartModal(false)}>
                  CONTINUE SHOPPING
                </button>
              </div>

              <div className="cart-progress-bar"></div>
            </div>
          </div>
        )}

        {/* Premium Wishlist Confirmation Modal */}
        {wishlistConfirm.show && (
          <div className="wishlist-confirm-overlay" onClick={() => setWishlistConfirm({ show: false, product: null })}>
            <div className="wishlist-confirm-modal animate-wow" onClick={e => e.stopPropagation()}>
              <div className="wishlist-modal-icon">
                <AlertCircle size={32} />
              </div>
              <h2>Remove from Wishlist?</h2>
              <p>Are you sure you want to remove from your favorites?</p>

              <div className="wishlist-modal-actions">
                <button
                  className="btn-modal-cancel"
                  onClick={() => setWishlistConfirm({ show: false, product: null })}
                >
                  CANCEL
                </button>
                <button
                  className="btn-modal-remove"
                  onClick={confirmWishlistRemoval}
                >
                  REMOVE ITEM
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Router>
  );
}

export default App;
