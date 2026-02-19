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
    setTimeout(() => setLastAdded(null), 3000);
  };

  const toggleWishlist = (product) => {
    setWishlist((prevWish) => {
      const exists = prevWish.find(item => item.id === product.id);
      if (exists) {
        return prevWish.filter(item => item.id !== product.id);
      }
      return [...prevWish, product];
    });
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
                onRemoveFromWishlist={toggleWishlist}
                onAddToCart={addToCart}
              />
            } />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </Router>
  );
}

export default App;
