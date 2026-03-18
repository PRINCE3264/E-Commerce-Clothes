import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, ShoppingCart, Users, Activity, Package } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import API from '../../utils/api';

const salesData = [
  { name: 'Jan', sales: 4000 },
  { name: 'Feb', sales: 3000 },
  { name: 'Mar', sales: 5000 },
  { name: 'Apr', sales: 3500 },
  { name: 'May', sales: 6000 },
  { name: 'Jun', sales: 8000 },
  { name: 'Jul', sales: 7000 },
  { name: 'Aug', sales: 9000 },
  { name: 'Sep', sales: 11000 },
  { name: 'Oct', sales: 10000 },
  { name: 'Nov', sales: 13000 },
  { name: 'Dec', sales: 15000 },
];

const AdminOverview = () => {
    const [stats, setStats] = useState({
        usersCount: 0,
        ordersCount: 0,
        totalRevenue: 0,
        productsCount: 0,
        recentOrders: []
    });

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const token = localStorage.getItem('admin_token');
                const config = { headers: { Authorization: `Bearer ${token}` } };

                const [usersRes, ordersRes, productsRes] = await Promise.all([
                    API.get('/admin/users', config).catch(() => ({ data: { data: [] } })),
                    API.get('/orders', config).catch(() => ({ data: { data: [] } })),
                    API.get('/products').catch(() => ({ data: { data: [] } }))
                ]);

                const users = usersRes.data?.data || [];
                const orders = ordersRes.data?.data || [];
                const products = productsRes.data?.data?.products || productsRes.data?.data || [];

                const totalRev = orders.reduce((acc, order) => acc + (order.isPaid ? order.totalPrice : 0), 0);
                const recent = [...orders].sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);

                setStats({
                    usersCount: users.length,
                    ordersCount: orders.length,
                    totalRevenue: totalRev,
                    productsCount: products.length,
                    recentOrders: recent
                });
            } catch (err) {
                console.error("Dashboard data fetch failed", err);
            }
        };
        fetchDashboardData();
    }, []);

    return (
        <div className="admin-overview-modern">
            {/* Top 5 Stats Cards */}
            <div className="overview-stats-row">
                <div className="stat-card-modern">
                    <div className="s-icon blue"><TrendingUp size={24}/></div>
                    <div className="s-content">
                        <span className="s-label">Total Sales</span>
                        <span className="s-sub">+56% Incomes</span>
                        <h3 className="s-value">₹{(stats.totalRevenue/1000).toFixed(1)}k</h3>
                    </div>
                </div>
                <div className="stat-card-modern">
                    <div className="s-icon cyan"><Activity size={24}/></div>
                    <div className="s-content">
                        <span className="s-label">Daily Sales</span>
                        <span className="s-sub">-12% Sales</span>
                        <h3 className="s-value">₹12.4k</h3>
                    </div>
                </div>
                <div className="stat-card-modern">
                    <div className="s-icon green"><Users size={24}/></div>
                    <div className="s-content">
                        <span className="s-label">Daily User</span>
                        <span className="s-sub">+48% New User</span>
                        <h3 className="s-value">{stats.usersCount}</h3>
                    </div>
                </div>
                <div className="stat-card-modern">
                    <div className="s-icon purple"><ShoppingCart size={24}/></div>
                    <div className="s-content">
                        <span className="s-label">Products</span>
                        <span className="s-sub">+25% New Items</span>
                        <h3 className="s-value">{stats.productsCount}</h3>
                    </div>
                </div>
                <div className="stat-card-modern">
                    <div className="s-icon orange"><Package size={24}/></div>
                    <div className="s-content">
                        <span className="s-label">Orders</span>
                        <span className="s-sub">Target Active</span>
                        <h3 className="s-value">{stats.ordersCount}</h3>
                    </div>
                </div>
            </div>

            <div className="overview-main-grid">
                {/* Main Chart Section */}
                <div className="grid-left">
                    <div className="admin-panel chart-panel">
                        <div className="panel-header">
                            <div className="h-info">
                                <h3>Summary Sales</h3>
                            </div>
                            <div className="h-actions">
                                <select className="mini-select">
                                    <option>Month</option>
                                    <option>Year</option>
                                </select>
                            </div>
                        </div>
                        <div className="chart-wrapper">
                            <ResponsiveContainer width="100%" height={320}>
                                <AreaChart data={salesData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#ff7c7c" stopOpacity={0.2}/>
                                            <stop offset="95%" stopColor="#ff7c7c" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 13}} />
                                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 13}} />
                                    <Tooltip 
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
                                        labelStyle={{ fontWeight: 800, color: '#1e293b' }}
                                    />
                                    <Area type="monotone" dataKey="sales" stroke="#ff7c7c" strokeWidth={4} fillOpacity={1} fill="url(#colorSales)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="admin-panel table-panel">
                        <div className="panel-header">
                            <div className="h-info">
                                <h3>Last Order 🔍</h3>
                            </div>
                            <button className="btn-filter">Filter</button>
                        </div>
                        <div className="table-responsive">
                            <table className="modern-table">
                                <thead>
                                    <tr>
                                        <th>Customer</th>
                                        <th>Date</th>
                                        <th>Price</th>
                                        <th>Product</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {stats.recentOrders.map((order, idx) => (
                                        <tr key={idx}>
                                            <td>
                                                <div className="user-cell">
                                                    <img src={`https://ui-avatars.com/api/?name=${order.user?.name || 'G'}&background=3b82f6&color=fff`} alt="" />
                                                    <span>{order.user?.name || 'Guest User'}</span>
                                                </div>
                                            </td>
                                            <td className="date-cell">{new Date(order.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}</td>
                                            <td className="price-cell">₹{order.totalPrice.toLocaleString()}</td>
                                            <td>
                                                <div className="prod-cell">
                                                    <div className="prod-img-box"><Package size={14}/></div>
                                                    <span>{order.orderItems[0]?.name || 'Premium Item'}</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Right Sidebar Section */}
                <div className="grid-right">
                    <div className="balance-card">
                        <div className="b-header">
                            <h2>₹{stats.totalRevenue.toLocaleString()}</h2>
                            <p>Active Balance</p>
                        </div>
                        <div className="b-items">
                            <div className="b-item">
                                <div className="b-icon up"><TrendingUp size={14}/></div>
                                <span>Incomes</span>
                                <strong className="val">₹{(stats.totalRevenue * 0.8).toLocaleString()}</strong>
                            </div>
                            <div className="b-item">
                                <div className="b-icon down"><TrendingUp size={14} style={{transform: 'rotate(180deg)'}}/></div>
                                <span>Expenses</span>
                                <strong className="val">-₹{(stats.totalRevenue * 0.1).toLocaleString()}</strong>
                            </div>
                            <div className="b-item">
                                <div className="b-icon tax"><Activity size={14}/></div>
                                <span>Taxes</span>
                                <strong className="val">-₹{(stats.totalRevenue * 0.05).toLocaleString()}</strong>
                            </div>
                        </div>
                        <button className="btn-virtual">Add Virtual Card <span>▶</span></button>
                    </div>

                    <div className="admin-panel payments-panel">
                        <div className="panel-header">
                            <h3>Upcoming Payments</h3>
                        </div>
                        <div className="payment-list">
                            <div className="payment-item">
                                <div className="p-dot green"></div>
                                <span className="p-name">Direct UPI Pay</span>
                                <span className="p-badge grey">₹45,258.23</span>
                            </div>
                            <div className="payment-item">
                                <div className="p-dot yellow"></div>
                                <span className="p-name">Razorpay Settlement</span>
                                <span className="p-badge pink">₹12,486.69</span>
                            </div>
                            <div className="payment-item">
                                <div className="p-dot red"></div>
                                <span className="p-name">Stripe Global</span>
                                <span className="p-badge orange">₹4,210.38</span>
                            </div>
                            <a href="#" className="see-more">More</a>
                        </div>
                    </div>

                    <div className="admin-panel mini-chart-panel">
                        <div className="panel-header">
                            <h3>Expenses Status</h3>
                            <span className="status-on">On Track</span>
                        </div>
                        <div className="mini-chart">
                            {/* Simple line placeholder for effect */}
                            <ResponsiveContainer width="100%" height={80}>
                                <AreaChart data={salesData.slice(0, 8)}>
                                    <Area type="monotone" dataKey="sales" stroke="#ff7c7c" strokeWidth={3} fill="transparent" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .admin-overview-modern { padding: 0; }
                
                /* Stats Row */
                .overview-stats-row { 
                    display: grid; 
                    grid-template-columns: repeat(5, 1fr); 
                    gap: 20px; 
                    margin-bottom: 30px; 
                }
                .stat-card-modern {
                    background: white; border-radius: 20px; padding: 25px;
                    display: flex; flex-direction: column; align-items: center; text-align: center;
                    box-shadow: 0 10px 40px rgba(0,0,0,0.03); transition: 0.3s;
                }
                .stat-card-modern:hover { transform: translateY(-5px); box-shadow: 0 15px 50px rgba(0,0,0,0.06); }
                .s-icon { 
                    width: 60px; height: 60px; border-radius: 50%; display: flex; align-items: center; justify-content: center;
                    margin-bottom: 15px; background: #fff; box-shadow: 0 10px 20px rgba(0,0,0,0.05);
                }
                .s-icon.blue { color: #3b82f6; background: #eff6ff; }
                .s-icon.cyan { color: #06b6d4; background: #ecfeff; }
                .s-icon.green { color: #10b981; background: #f0fdf4; }
                .s-icon.purple { color: #8b5cf6; background: #f5f3ff; }
                .s-icon.orange { color: #f59e0b; background: #fffbeb; }

                .s-label { font-size: 0.95rem; font-weight: 700; color: #1e293b; display: block; }
                .s-sub { font-size: 0.75rem; color: #94a3b8; font-weight: 600; margin: 4px 0 12px; display: block; }
                .s-value { font-size: 1.8rem; font-weight: 900; color: #1e293b; margin: 0; }

                /* Main Grid */
                .overview-main-grid { display: grid; grid-template-columns: 1fr 320px; gap: 30px; }
                
                .admin-panel { background: white; border-radius: 24px; padding: 25px; box-shadow: 0 10px 40px rgba(0,0,0,0.02); margin-bottom: 30px; border: 1px solid #f8fafc; }
                .panel-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; }
                .panel-header h3 { font-size: 1.2rem; font-weight: 800; color: #1e293b; margin: 0; }
                
                .mini-select { border: 1px solid #e2e8f0; padding: 6px 15px; border-radius: 10px; font-size: 0.85rem; font-weight: 700; color: #64748b; outline: none; }
                
                /* Table Panel */
                .modern-table { width: 100%; border-collapse: separate; border-spacing: 0; }
                .modern-table thead tr { background: #3b4b6b; }
                .modern-table th { padding: 15px 20px; color: white; font-size: 0.8rem; font-weight: 600; text-align: left; text-transform: uppercase; letter-spacing: 0.5px; }
                .modern-table th:first-child { border-top-left-radius: 12px; }
                .modern-table th:last-child { border-top-right-radius: 12px; }
                .modern-table td { padding: 16px 20px; border-bottom: 1px solid #f1f5f9; vertical-align: middle; }
                .user-cell { display: flex; align-items: center; gap: 12px; }
                .user-cell img { width: 36px; height: 36px; border-radius: 50%; object-fit: cover; }
                .user-cell span { font-weight: 700; color: #334155; font-size: 0.9rem; }
                .date-cell { color: #64748b; font-size: 0.85rem; font-weight: 600; }
                .price-cell { font-weight: 800; color: #ff7c7c; }
                .prod-cell { display: flex; align-items: center; gap: 10px; }
                .prod-img-box { width: 32px; height: 32px; background: #f1f5f9; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #94a3b8; }
                .prod-cell span { font-size: 0.85rem; color: #64748b; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 150px; }
                .btn-filter { background: #f1f5f9; border: none; padding: 8px 16px; border-radius: 10px; font-weight: 700; color: #64748b; cursor: pointer; transition: 0.3s; }
                .btn-filter:hover { background: #e2e8f0; }

                /* Balance Card */
                .balance-card { background: #ff7c7c; border-radius: 30px; padding: 30px; color: white; box-shadow: 0 20px 40px rgba(255, 124, 124, 0.3); margin-bottom: 30px; }
                .b-header h2 { font-size: 2.2rem; font-weight: 900; margin: 0; }
                .b-header p { font-size: 0.95rem; opacity: 0.9; margin: 5px 0 30px; font-weight: 600; }
                .b-items { display: flex; flex-direction: column; gap: 18px; margin-bottom: 35px; }
                .b-item { display: flex; align-items: center; gap: 15px; }
                .b-icon { width: 28px; height: 28px; border-radius: 8px; background: rgba(255,255,255,0.2); display: flex; align-items: center; justify-content: center; }
                .b-item span { flex: 1; font-size: 0.9rem; font-weight: 600; opacity: 0.9; }
                .val { font-size: 0.95rem; font-weight: 800; }
                .btn-virtual { width: 100%; background: white; color: #ff7c7c; border: none; padding: 15px; border-radius: 16px; font-weight: 900; display: flex; align-items: center; justify-content: center; gap: 10px; cursor: pointer; transition: 0.3s; }
                .btn-virtual:hover { transform: scale(1.02); box-shadow: 0 10px 20px rgba(0,0,0,0.1); }
                .btn-virtual span { font-size: 0.7rem; }

                /* Payments Panel */
                .payment-list { display: flex; flex-direction: column; gap: 20px; }
                .payment-item { display: flex; align-items: center; gap: 12px; }
                .p-dot { width: 10px; height: 10px; border-radius: 50%; }
                .p-dot.green { background: #10b981; }
                .p-dot.yellow { background: #f59e0b; }
                .p-dot.red { background: #ef4444; }
                .p-name { flex: 1; font-size: 0.9rem; font-weight: 700; color: #475569; }
                .p-badge { padding: 4px 10px; border-radius: 8px; font-size: 0.75rem; font-weight: 800; }
                .p-badge.grey { background: #f1f5f9; color: #64748b; }
                .p-badge.pink { background: #fff1f2; color: #fb7185; }
                .p-badge.orange { background: #fff7ed; color: #f59e0b; }
                .see-more { font-size: 0.85rem; font-weight: 800; color: #94a3b8; text-decoration: none; margin-top: 10px; display: inline-block; }
                
                .mini-chart-panel .status-on { font-size: 0.75rem; font-weight: 800; background: #dcfce7; color: #15803d; padding: 4px 10px; border-radius: 50px; }

                @media (max-width: 1200px) {
                    .overview-stats-row { grid-template-columns: repeat(3, 1fr); }
                    .overview-main-grid { grid-template-columns: 1fr; }
                    .grid-right { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; }
                }
                @media (max-width: 768px) {
                    .overview-stats-row { grid-template-columns: repeat(2, 1fr); }
                    .grid-right { grid-template-columns: 1fr; }
                    .s-value { font-size: 1.5rem; }
                    .stat-card-modern { padding: 15px; }
                    .b-header h2 { font-size: 1.8rem; }
                    .balance-card { padding: 20px; }
                }
                @media (max-width: 480px) {
                    .overview-stats-row { grid-template-columns: 1fr; }
                    .modern-table th, .modern-table td { padding: 10px; font-size: 0.75rem; }
                    .user-cell img { width: 28px; height: 28px; }
                    .prod-cell span { max-width: 100px; }
                    .admin-panel { padding: 15px; border-radius: 16px; }
                    .s-value { font-size: 1.6rem; }
                }
            `}</style>
        </div>
    );
};

export default AdminOverview;
