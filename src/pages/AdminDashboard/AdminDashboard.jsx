import React, { useState } from 'react';
import { NavLink, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { 
    LayoutDashboard, 
    Package, 
    Users, 
    ShoppingCart, 
    Settings, 
    LogOut, 
    TrendingUp,
    DollarSign,
    Activity,
    Plus,
    FileText,
    Tags,
    UserCircle,
    MessageSquare,
    CreditCard,
    Layers,
    Menu,
    X,
    Search,
    ChevronRight
} from 'lucide-react';
import { 
    LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend
} from 'recharts';
import AdminOverview from '../../components/AdminOverview/AdminOverview';
import AdminProducts from '../../components/AdminProducts/AdminProducts';
import AdminOrders from '../../components/AdminOrders/AdminOrders';
import AdminCustomers from '../../components/AdminCustomers/AdminCustomers';
import AdminSettings from '../../components/AdminSettings/AdminSettings';
import AdminBlog from '../../components/AdminBlog/AdminBlog';
import AdminCategories from '../../components/AdminCategories/AdminCategories';
import AdminVariants from '../../components/AdminVariants/AdminVariants';
import AdminPayments from '../../components/AdminPayments/AdminPayments';
import AdminContact from '../../components/AdminContact/AdminContact';
import AdminProfile from '../../components/AdminProfile/AdminProfile';
import AdminReviews from '../../components/AdminReviews/AdminReviews';
import './AdminDashboard.css';





const DEFAULT_ADMIN_AVATAR = 'https://ui-avatars.com/api/?background=1e3a5f&color=fff&size=100&bold=true&name=';

const AdminDashboard = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 992);
    const location = useLocation();
    const navigate = useNavigate();

    // Check authentication
    const adminAuth = localStorage.getItem('admin_auth') === 'true';
    if (!adminAuth) {
        return <Navigate to="/login" />;
    }

    const adminUser = (() => {
        try { return JSON.parse(localStorage.getItem('admin_user')) || {}; }
        catch { return {}; }
    })();

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const handleLogout = () => {
        // Clear all admin session data
        localStorage.removeItem('admin_auth');
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_user');
        // Redirect to login portal
        window.location.href = '/login';
    };

    const getPageTitle = () => {
        const path = location.pathname.replace('/admin/', '').replace('/admin', '');
        if (!path) return 'Overview';
        return path.charAt(0).toUpperCase() + path.slice(1);
    };

    const getAdminAvatar = () => {
        if (adminUser?.avatar) return adminUser.avatar;
        return `${DEFAULT_ADMIN_AVATAR}${encodeURIComponent(adminUser?.name || 'Admin')}`;
    };

    return (
        <div className="admin-layout">
            {/* Sidebar Overlay (only visible on mobile) */}
            <div className={`admin-sidebar-overlay ${isSidebarOpen ? 'active' : ''}`} onClick={toggleSidebar}></div>

            {/* Sidebar */}
            <aside className={`admin-sidebar ${isSidebarOpen ? 'open' : ''}`}>
                <div className="admin-brand">
                    <h2 onClick={() => navigate('/admin')} style={{cursor: 'pointer'}}>ECC <span>ADMIN</span></h2>
                    <button className="admin-sidebar-close mobile-only" onClick={toggleSidebar}>
                        <X size={24} />
                    </button>
                </div>

                <div className="admin-user-profile-box">
                    <div className="admin-avatar">
                        <img src={getAdminAvatar()} alt={adminUser.name} />
                    </div>
                    <div className="admin-user-details">
                        <h4>{adminUser.name || 'Admin User'}</h4>
                        <p>{adminUser.email || 'admin@ecc.com'}</p>
                        <div className="admin-role-badge">SYSTEM OPERATOR</div>
                    </div>
                </div>
                
                <div className="admin-nav-scroll">
                    <div className="admin-nav-section">
                        <h4 className="admin-section-label">CORE MANAGEMENT</h4>
                        <nav className="admin-nav-grid">
                            <NavLink to="/admin" end className={({isActive}) => `admin-nav-item ${isActive ? 'active' : ''}`} onClick={() => window.innerWidth <= 992 && toggleSidebar()}>
                                <div className="admin-icon-bg"><LayoutDashboard size={18} /></div>
                                <span>Overview</span>
                                <ChevronRight size={14} className="admin-chevron" />
                            </NavLink>
                            <NavLink to="/admin/products" className={({isActive}) => `admin-nav-item ${isActive ? 'active' : ''}`} onClick={() => window.innerWidth <= 992 && toggleSidebar()}>
                                <div className="admin-icon-bg"><Package size={18} /></div>
                                <span>Products</span>
                                <ChevronRight size={14} className="admin-chevron" />
                            </NavLink>
                            <NavLink to="/admin/orders" className={({isActive}) => `admin-nav-item ${isActive ? 'active' : ''}`} onClick={() => window.innerWidth <= 992 && toggleSidebar()}>
                                <div className="admin-icon-bg"><ShoppingCart size={18} /></div>
                                <span>Orders</span>
                                <ChevronRight size={14} className="admin-chevron" />
                            </NavLink>
                            <NavLink to="/admin/customers" className={({isActive}) => `admin-nav-item ${isActive ? 'active' : ''}`} onClick={() => window.innerWidth <= 992 && toggleSidebar()}>
                                <div className="admin-icon-bg"><Users size={18} /></div>
                                <span>Members</span>
                                <ChevronRight size={14} className="admin-chevron" />
                            </NavLink>
                        </nav>
                    </div>

                    <div className="admin-nav-section">
                        <h4 className="admin-section-label">SETUP & CONTENT</h4>
                        <nav className="admin-nav-grid">
                            <NavLink to="/admin/blog" className={({isActive}) => `admin-nav-item ${isActive ? 'active' : ''}`} onClick={() => window.innerWidth <= 992 && toggleSidebar()}>
                                <div className="admin-icon-bg"><FileText size={18} /></div>
                                <span>Blog Posts</span>
                                <ChevronRight size={14} className="admin-chevron" />
                            </NavLink>
                            <NavLink to="/admin/categories" className={({isActive}) => `admin-nav-item ${isActive ? 'active' : ''}`} onClick={() => window.innerWidth <= 992 && toggleSidebar()}>
                                <div className="admin-icon-bg"><Tags size={18} /></div>
                                <span>Categories</span>
                                <ChevronRight size={14} className="admin-chevron" />
                            </NavLink>
                            <NavLink to="/admin/variants" className={({isActive}) => `admin-nav-item ${isActive ? 'active' : ''}`} onClick={() => window.innerWidth <= 992 && toggleSidebar()}>
                                <div className="admin-icon-bg"><Layers size={18} /></div>
                                <span>Variants</span>
                                <ChevronRight size={14} className="admin-chevron" />
                            </NavLink>
                            <NavLink to="/admin/settings" className={({isActive}) => `admin-nav-item ${isActive ? 'active' : ''}`} onClick={() => window.innerWidth <= 992 && toggleSidebar()}>
                                <div className="admin-icon-bg"><Settings size={18} /></div>
                                <span>System Config</span>
                                <ChevronRight size={14} className="admin-chevron" />
                            </NavLink>
                        </nav>
                    </div>

                    <div className="admin-nav-section">
                        <h4 className="admin-section-label">FEEDBACK & FINANCE</h4>
                        <nav className="admin-nav-grid">
                            <NavLink to="/admin/reviews" className={({isActive}) => `admin-nav-item ${isActive ? 'active' : ''}`} onClick={() => window.innerWidth <= 992 && toggleSidebar()}>
                                <div className="admin-icon-bg"><MessageSquare size={18} /></div>
                                <span>Reviews</span>
                                <ChevronRight size={14} className="admin-chevron" />
                            </NavLink>
                            <NavLink to="/admin/payments" className={({isActive}) => `admin-nav-item ${isActive ? 'active' : ''}`} onClick={() => window.innerWidth <= 992 && toggleSidebar()}>
                                <div className="admin-icon-bg"><CreditCard size={18} /></div>
                                <span>Payments</span>
                                <ChevronRight size={14} className="admin-chevron" />
                            </NavLink>
                            <NavLink to="/admin/contact" className={({isActive}) => `admin-nav-item ${isActive ? 'active' : ''}`} onClick={() => window.innerWidth <= 992 && toggleSidebar()}>
                                <div className="admin-icon-bg"><Activity size={18} /></div>
                                <span>Leads / Help</span>
                                <ChevronRight size={14} className="admin-chevron" />
                            </NavLink>
                            <NavLink to="/admin/profile" className={({isActive}) => `admin-nav-item ${isActive ? 'active' : ''}`} onClick={() => window.innerWidth <= 992 && toggleSidebar()}>
                                <div className="admin-icon-bg"><UserCircle size={18} /></div>
                                <span>My Profile</span>
                                <ChevronRight size={14} className="admin-chevron" />
                            </NavLink>
                            <a href="/payment?orderId=69ac07c5cbf16865b7e979a5" className="admin-nav-item" target="_blank" rel="noopener noreferrer">
                                <div className="admin-icon-bg"><CreditCard size={18} /></div>
                                <span>Quick Payment Link</span>
                                <ChevronRight size={14} className="admin-chevron" />
                            </a>
                        </nav>
                    </div>
                </div>

                <div className="admin-sidebar-footer">
                    <button className="admin-logout-btn" onClick={handleLogout}>
                        <LogOut size={18} />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className={`admin-main ${isSidebarOpen ? 'sidebar-open' : ''}`}>
                <header className="admin-header">
                    <div className="header-search">
                        <button className="admin-menu-btn" onClick={toggleSidebar}>
                            <Menu size={24} />
                        </button>
                        {/* Header details and search */}
                        <h3 className="admin-page-title">Dashboard {getPageTitle()}</h3>
                        <div className="admin-search-box desktop-only">
                            <Search size={18} className="search-icon" />
                            <input type="text" placeholder="Search anything..." />
                        </div>
                    </div>
                    <div className="header-profile">
                        <div className="header-avatar">{(adminUser.name || 'A').charAt(0).toUpperCase()}</div>
                        <div className="header-user-info">
                            <span className="user-name">{adminUser.name || 'Admin User'}</span>
                            <span className="user-role">Super Admin</span>
                        </div>
                    </div>
                </header>

                <div className="admin-content fade-in">
                    <Routes>
                        <Route path="/" element={<AdminOverview />} />
                        <Route path="/products" element={<AdminProducts />} />
                        <Route path="/customers" element={<AdminCustomers />} />
                        <Route path="/orders" element={<AdminOrders />} />
                        <Route path="/settings" element={<AdminSettings />} />
                        <Route path="/blog" element={<AdminBlog />} />
                        <Route path="/categories" element={<AdminCategories />} />
                        <Route path="/variants" element={<AdminVariants />} />
                        <Route path="/payments" element={<AdminPayments />} />
                        <Route path="/contact" element={<AdminContact />} />
                        <Route path="/profile" element={<AdminProfile />} />
                        <Route path="/reviews" element={<AdminReviews />} />
                        <Route path="/dashboard" element={<Navigate to="/admin" replace />} />
                        <Route path="*" element={<Navigate to="/admin" replace />} />
                    </Routes>
                </div>
            </main>
        </div>
    );
};


export default AdminDashboard;
