import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate, Navigate } from 'react-router-dom';
import Header from './components/Header/Header';
import Sidebar from './components/Sidebar/Sidebar';
import Footer from './components/Footer/Footer';
import Home from './pages/Home/Home';
import About from './pages/About/About';
import Products from './pages/Products/Products';
import Blog from './pages/Blog/Blog';
import BlogDetails from './pages/Blog/BlogDetails';
import Contact from './pages/Contact/Contact';
import Login from './pages/Login/Login';
import Cart from './pages/Cart/Cart';
import Register from './pages/Register/Register';
import Checkout from './pages/Checkout/Checkout';
import OrderDetails from './pages/OrderDetails/OrderDetails';
import ProductDetails from './pages/ProductDetails/ProductDetails';
import ForgotPassword from './pages/ForgotPassword/ForgotPassword';
import ResetPassword from './pages/ResetPassword/ResetPassword';
import AdminDashboard from './pages/AdminDashboard/AdminDashboard';
import Payment from './pages/Payment/Payment';
import VerifyOTP from './pages/VerifyOTP/VerifyOTP';
import Arrivals from './pages/Arrivals/Arrivals';
import BestProducts from './pages/BestProducts/BestProducts';
import Support from './pages/Support/Support';
import MyAccount from './pages/MyAccount/MyAccount';
import MyOrders from './pages/MyOrders/MyOrders';
import MyPayments from './pages/MyPayments/MyPayments';
import Profile from './pages/Profile/Profile';
import Returns from './pages/Returns/Returns';
import Wishlist from './pages/Wishlist/Wishlist';
import LiveChat from './components/Chat/LiveChat';
import { X, CheckCircle, ShoppingBag, AlertCircle } from 'lucide-react';
import API from './utils/api';
import './pages/Home/Home_CartModal.css';
import './components/Modals/WishlistModal.css';
import './index.css';



const AppContent = ({ 
  cart, 
  wishlist, 
  lastAdded, 
  isSidebarOpen, 
  toggleSidebar, 
  addToCart, 
  toggleWishlist, 
  confirmWishlistRemoval, 
  removeCartItem, 
  updateCartQuantity, 
  showCartModal, 
  setShowCartModal, 
  wishlistConfirm, 
  setWishlistConfirm,
  setCart,
  userData,
  handleLogout
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isMinimalRoute = isAdminRoute;

  return (
    <div className="app">
      {!isMinimalRoute && (
        <>
          <Header
            toggleSidebar={toggleSidebar}
            cartCount={cart.length}
            wishlistCount={wishlist.length}
            cart={cart}
            lastAdded={lastAdded}
            userData={userData}
            handleLogout={handleLogout}
          />
          <Sidebar
            isOpen={isSidebarOpen}
            toggleSidebar={toggleSidebar}
            wishlistItems={wishlist}
            onToggleWishlist={toggleWishlist}
            userData={userData}
            handleLogout={handleLogout}
          />
        </>
      )}

      <main className="main-content" style={isMinimalRoute ? { margin: 0, padding: 0 } : {}}>
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
          <Route path="/blog/:id" element={<BlogDetails userData={userData} />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-otp" element={<VerifyOTP />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/cart" element={
            <Cart
              cartItems={cart}
              onRemoveItem={removeCartItem}
              onUpdateQuantity={updateCartQuantity}
            />
          } />
          <Route path="/account/profile" element={<MyAccount onAddToCart={addToCart} onToggleWishlist={toggleWishlist} wishlist={wishlist} />} />
          <Route path="/account" element={<Navigate to="/account/profile" replace />} />
          <Route path="/account/orders" element={<MyOrders />} />
          <Route path="/account/wishlist" element={
            <Wishlist 
              wishlistItems={wishlist} 
              onToggleWishlist={toggleWishlist} 
              onAddToCart={addToCart} 
            />
          } />
          <Route path="/account/address" element={<MyAccount onAddToCart={addToCart} onToggleWishlist={toggleWishlist} wishlist={wishlist} />} />
          <Route path="/account/payments" element={<MyPayments />} />
          <Route path="/account/tracking" element={<MyAccount onAddToCart={addToCart} onToggleWishlist={toggleWishlist} wishlist={wishlist} />} />
          <Route path="/account/coupons" element={<MyAccount onAddToCart={addToCart} onToggleWishlist={toggleWishlist} wishlist={wishlist} />} />
          <Route path="/account/returns" element={<MyAccount onAddToCart={addToCart} onToggleWishlist={toggleWishlist} wishlist={wishlist} />} />
          
          <Route path="/orders" element={<Navigate to="/account/orders" replace />} />
          <Route path="/wishlist" element={<Navigate to="/account/wishlist" replace />} />
          <Route path="/addresses" element={<Navigate to="/account/address" replace />} />
          <Route path="/tracking" element={<Navigate to="/account/tracking" replace />} />
          <Route path="/coupons" element={<Navigate to="/account/coupons" replace />} />
          <Route path="/returns" element={<Navigate to="/account/returns" replace />} />
          <Route path="/mypayments" element={<Navigate to="/account/payments" replace />} />
          <Route path="/product/:id" element={
            <ProductDetails
              onAddToCart={addToCart}
              onToggleWishlist={toggleWishlist}
              wishlist={wishlist}
            />
          } />
          <Route path="/checkout" element={
            <Checkout 
              cartItems={cart} 
              onOrderComplete={() => setCart([])} 
            />
          } />
          <Route path="/order/:id" element={<OrderDetails />} />
          <Route path="/payment" element={<Payment setCart={setCart} />} />
          <Route path="/arrivals" element={<Arrivals onAddToCart={addToCart} onToggleWishlist={toggleWishlist} wishlist={wishlist} />} />
          <Route path="/best-products" element={<BestProducts onAddToCart={addToCart} onToggleWishlist={toggleWishlist} wishlist={wishlist} />} />
          <Route path="/support" element={<Support />} />
          
          {/* Simplified unified account routing */}
          
          <Route path="/admin/*" element={<AdminDashboard />} />
        </Routes>
      </main>

      {!isAdminRoute && <Footer />}

      {!isAdminRoute && showCartModal && lastAdded && (
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
                <h4 className="ib-name">{lastAdded.name}</h4>
                <p className="ib-price">₹{(lastAdded.price || 0).toLocaleString()}</p>
              </div>
            </div>
            <div className="advance-actions">
              <button
                className="btn-view-product-luxury"
                onClick={() => {
                  setShowCartModal(false);
                  navigate(`/product/${lastAdded._id}`);
                }}
              >
                VIEW PRODUCT
              </button>
              <button
                className="btn-checkout-luxury"
                onClick={() => {
                  setShowCartModal(false);
                  navigate('/cart');
                }}
              >
                GO TO CART
              </button>
              <button className="btn-continue-styling" onClick={() => setShowCartModal(false)}>
                CONTINUE SHOPPING
              </button>
            </div>
            <div className="cart-progress-bar"></div>
          </div>
        </div>
      )}

      {!isAdminRoute && wishlistConfirm.show && (
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

      <LiveChat userData={userData} />
    </div>
  );
};

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('khushi_cart');
    const items = savedCart ? JSON.parse(savedCart) : [];
    // Patch old items missing cartId
    return items.map(item => item.cartId ? item : { ...item, cartId: Date.now() + Math.random() });
  });
  const [wishlist, setWishlist] = useState(() => {
    const savedWishlist = localStorage.getItem('khushi_wishlist');
    return savedWishlist ? JSON.parse(savedWishlist) : [];
  });
  const [userData, setUserData] = useState(() => {
    try {
        const stored = localStorage.getItem('user_data');
        return stored ? JSON.parse(stored) : null;
    } catch { return null; }
  });

  useEffect(() => {
    localStorage.setItem('khushi_cart', JSON.stringify(cart));
    // Sync with backend if logged in
    if (localStorage.getItem('auth_token')) {
      API.post('/cart', { cart }).catch(console.error);
    }
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('khushi_wishlist', JSON.stringify(wishlist));
    // Sync with backend if logged in
    if (localStorage.getItem('auth_token')) {
      API.post('/wishlist', { wishlist }).catch(console.error);
    }
  }, [wishlist]);

  // Load backend arrays on mount if logged in
  useEffect(() => {
    if (localStorage.getItem('auth_token')) {
       // Load Cart
       API.get('/cart')
          .then(res => {
              if (res.data?.success && res.data.data?.items) {
                  // Reconstruct front-end cart structure from populated backend cart
                  const dbCart = res.data.data.items.map(i => ({
                      ...i.product,
                      quantity: i.quantity,
                      size: i.size,
                      color: i.color,
                      cartId: i._id
                  }));
                  setCart(dbCart);
              }
          }).catch(console.error);

       // Load Wishlist
       API.get('/wishlist')
          .then(res => {
              if (res.data?.success && res.data.data?.products) {
                  // Reconstruct front-end wishlist structure from populated backend wishlist
                  const dbWishlist = res.data.data.products.map(i => ({
                      ...i.product
                  }));
                  setWishlist(dbWishlist);
              }
          }).catch(console.error);
    }
  }, []);

  // Update userData if localStorage changes (e.g., login in other window)
  useEffect(() => {
    const handler = () => {
        try {
            const stored = localStorage.getItem('user_data');
            const parsed = stored ? JSON.parse(stored) : null;
            if (JSON.stringify(parsed) !== JSON.stringify(userData)) {
                setUserData(parsed);
            }
        } catch { setUserData(null); }
    };
    window.addEventListener('storage', handler);
    window.addEventListener('user_data_updated', handler);
    return () => {
        window.removeEventListener('storage', handler);
        window.removeEventListener('user_data_updated', handler);
    };
  }, [userData]);

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    setUserData(null);
    window.location.href = '/login';
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const [lastAdded, setLastAdded] = useState(null);
  const [showCartModal, setShowCartModal] = useState(false);
  const [wishlistConfirm, setWishlistConfirm] = useState({ show: false, product: null });

  const addToCart = (product) => {
    if (!localStorage.getItem('auth_token')) {
      window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`;
      return;
    }
    const qtyToAdd = product.quantity || 1;
    setCart((prevCart) => {
      // Find item with same ID AND same size AND same color
      const existingItem = prevCart.find((item) => 
        item._id === product._id && 
        item.size === product.size && 
        item.color === product.color
      );
      
      if (existingItem) {
        return prevCart.map((item) =>
          (item._id === product._id && item.size === product.size && item.color === product.color)
            ? { ...item, quantity: (item.quantity || 0) + qtyToAdd } 
            : item
        );
      }
      return [...prevCart, { ...product, quantity: qtyToAdd, cartId: Date.now() }];
    });
    setLastAdded(product);
    setWishlistConfirm({ show: false, product: null });
    setShowCartModal(true);
  };

  const toggleWishlist = (product) => {
    if (!localStorage.getItem('auth_token')) {
      window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`;
      return;
    }
    setWishlist((prevWish) => {
      const exists = prevWish.find(item => item._id === product._id);
      if (exists) {
        setShowCartModal(false);
        setWishlistConfirm({ show: true, product });
        return prevWish;
      }
      return [...prevWish, product];
    });
  };

  const confirmWishlistRemoval = () => {
    if (wishlistConfirm.product) {
      setWishlist((prevWish) => prevWish.filter(item => item._id !== wishlistConfirm.product._id));
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
      <AppContent 
        cart={cart}
        wishlist={wishlist}
        lastAdded={lastAdded}
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        addToCart={addToCart}
        toggleWishlist={toggleWishlist}
        confirmWishlistRemoval={confirmWishlistRemoval}
        removeCartItem={removeCartItem}
        updateCartQuantity={updateCartQuantity}
        showCartModal={showCartModal}
        setShowCartModal={setShowCartModal}
        wishlistConfirm={wishlistConfirm}
        setWishlistConfirm={setWishlistConfirm}
        setCart={setCart}
        userData={userData}
        handleLogout={handleLogout}
      />
    </Router>
  );
}

export default App;
