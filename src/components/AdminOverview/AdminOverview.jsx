import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, ShoppingCart, Users, Activity, Package } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import API from '../../utils/api';

const salesData = [
  { name: 'Jan', sales: 4000, profit: 2400 },
  { name: 'Feb', sales: 3000, profit: 1398 },
  { name: 'Mar', sales: 2000, profit: 9800 },
  { name: 'Apr', sales: 2780, profit: 3908 },
  { name: 'May', sales: 1890, profit: 4800 },
  { name: 'Jun', sales: 2390, profit: 3800 },
  { name: 'Jul', sales: 3490, profit: 4300 },
];

const performanceData = [
  { name: '01:00', load: 45, users: 120 },
  { name: '04:00', load: 30, users: 80 },
  { name: '08:00', load: 65, users: 450 },
  { name: '12:00', load: 85, users: 1100 },
  { name: '16:00', load: 75, users: 950 },
  { name: '20:00', load: 90, users: 1300 },
  { name: '00:00', load: 55, users: 400 },
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
        <div className="v-overview-container">
            {/* Header Intelligence Strip */}
            <div className="v-intelligence-header">
                <div className="v-pulse-indicator">
                    <div className="pulse-dot"></div>
                    <span>System Live: Global Retail Network Operational</span>
                </div>
                <div className="v-date-badge">Strategic Analysis: {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</div>
            </div>

            <div className="stats-grid v-advanced-stats">
                <div className="stat-card v-pro-card">
                    <div className="v-card-inner">
                        <div className="v-icon-box blue"><DollarSign size={22} /></div>
                        <div className="v-data-wrap">
                            <span className="v-label">Net Liquidity</span>
                            <h3 className="v-value">₹{stats.totalRevenue.toLocaleString()}</h3>
                            <div className="v-trend positive">Live <TrendingUp size={12}/></div>
                        </div>
                    </div>
                </div>

                <div className="stat-card v-pro-card">
                    <div className="v-card-inner">
                        <div className="v-icon-box cyan"><ShoppingCart size={22} /></div>
                        <div className="v-data-wrap">
                            <span className="v-label">Total Orders</span>
                            <h3 className="v-value">{stats.ordersCount}</h3>
                            <div className="v-trend positive">Live <TrendingUp size={12}/></div>
                        </div>
                    </div>
                </div>

                <div className="stat-card v-pro-card">
                    <div className="v-card-inner">
                        <div className="v-icon-box indigo"><Users size={22} /></div>
                        <div className="v-data-wrap">
                            <span className="v-label">Global Users</span>
                            <h3 className="v-value">{stats.usersCount}</h3>
                            <div className="v-trend positive">Live <TrendingUp size={12}/></div>
                        </div>
                    </div>
                </div>

                <div className="stat-card v-pro-card">
                    <div className="v-card-inner">
                        <div className="v-icon-box slate"><Package size={22} /></div>
                        <div className="v-data-wrap">
                            <span className="v-label">Active Products</span>
                            <h3 className="v-value">{stats.productsCount}</h3>
                            <div className="v-trend neutral">Live <Activity size={12}/></div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="charts-grid v-dashboard-matrix mt-30">
                <div className="admin-panel v-matrix-panel">
                    <div className="panel-header glass-header">
                        <div className="h-left">
                            <h3>Market Trajectory</h3>
                            <p>Real-time revenue vs projected scalability</p>
                        </div>
                        <div className="h-actions">
                            <button className="v-period-btn active">24H</button>
                            <button className="v-period-btn">7D</button>
                        </div>
                    </div>
                    <div className="chart-container" style={{ height: '320px', width: '100%', padding: '20px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={salesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="vBlueGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                                <Tooltip 
                                    contentStyle={{ background: 'rgba(255, 255, 255, 0.95)', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}
                                    itemStyle={{ fontSize: '12px', fontWeight: 600 }}
                                />
                                <Area type="monotone" dataKey="sales" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#vBlueGradient)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="admin-panel v-matrix-panel">
                    <div className="panel-header glass-header">
                        <div className="h-left">
                            <h3>Compute Architecture</h3>
                            <p>Resource utilization by active segments</p>
                        </div>
                    </div>
                    <div className="chart-container" style={{ height: '320px', width: '100%', padding: '20px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={performanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11}} />
                                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11}} />
                                <Tooltip 
                                    cursor={{fill: '#f8fafc'}}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 20px rgba(0,0,0,0.05)' }}
                                />
                                <Bar dataKey="load" fill="#60a5fa" radius={[6, 6, 0, 0]} barSize={25} />
                                <Bar dataKey="users" fill="#bfdbfe" radius={[6, 6, 0, 0]} barSize={25} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="admin-panel v-premium-table-panel mt-30">
                <div className="panel-header between">
                    <div className="h-left">
                        <h3>Strategic Fulfillment</h3>
                        <p>Critical order processing & logistics tracking</p>
                    </div>
                    <button className="v-export-btn"><TrendingUp size={16}/> Intelligence Report</button>
                </div>
                <div className="table-responsive">
                    <table className="admin-table v-modern-grid">
                        <thead>
                            <tr>
                                <th>Tracking Node</th>
                                <th>Lead Identity</th>
                                <th>Timestamp</th>
                                <th>Deployment Status</th>
                                <th>Valuation</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stats.recentOrders.length === 0 ? (
                                <tr><td colSpan="5" style={{textAlign: 'center', padding: '20px'}}>No live orders deployed yet.</td></tr>
                            ) : stats.recentOrders.map(order => (
                                <tr key={order._id} className="v-row-interactive">
                                    <td className="v-node-cell">
                                        <span className="v-id-tag">#{order._id.substring(order._id.length - 6).toUpperCase()}</span>
                                    </td>
                                    <td>
                                        <div className="v-user-chip">
                                            <img src={`https://ui-avatars.com/api/?name=${order.user?.name || 'G'}&background=3b82f6&color=fff`} alt="" className="v-avatar-mini" />
                                            <span>{order.user?.name || 'Guest User'}</span>
                                        </div>
                                    </td>
                                    <td className="v-time-cell">{new Date(order.createdAt).toLocaleDateString()}</td>
                                    <td>
                                        <div className={`v-status-pill ${order.isDelivered ? 'optimal' : order.isPaid ? 'processing' : 'pending'}`}>
                                            <div className="s-dot"></div>
                                            {order.isDelivered ? 'Delivered' : order.isPaid ? 'Processing' : 'Pending'}
                                        </div>
                                    </td>
                                    <td className="v-val-cell">₹{order.totalPrice?.toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <style>{`
                .v-overview-container { padding: 5px; }
                .v-intelligence-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; }
                .v-pulse-indicator { display: flex; align-items: center; gap: 10px; color: #64748b; font-size: 0.85rem; font-weight: 600; }
                .pulse-dot { width: 8px; height: 8px; background: #22c55e; border-radius: 50%; box-shadow: 0 0 0 rgba(34, 197, 94, 0.4); animation: pulse 2s infinite; }
                @keyframes pulse { 0% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7); } 70% { box-shadow: 0 0 0 10px rgba(34, 197, 94, 0); } 100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); } }
                .v-date-badge { background: #eff6ff; color: #3b82f6; padding: 6px 15px; border-radius: 8px; font-size: 0.8rem; font-weight: 700; border: 1px solid #dbeafe; }

                /* Premium Cards */
                .v-advanced-stats { grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); }
                .v-pro-card { background: white; border-radius: 20px; padding: 22px; border: 1px solid #f1f5f9; transition: transform 0.3s, box-shadow 0.3s; position: relative; overflow: hidden; }
                .v-pro-card:hover { transform: translateY(-5px); box-shadow: 0 20px 25px -5px rgba(0,0,0,0.05); }
                .v-card-inner { display: flex; align-items: flex-start; gap: 18px; }
                .v-icon-box { width: 48px; height: 48px; border-radius: 14px; display: flex; align-items: center; justify-content: center; color: white; }
                .v-icon-box.blue { background: linear-gradient(135deg, #3b82f6, #2563eb); }
                .v-icon-box.cyan { background: linear-gradient(135deg, #06b6d4, #0891b2); }
                .v-icon-box.indigo { background: linear-gradient(135deg, #6366f1, #4f46e5); }
                .v-icon-box.slate { background: linear-gradient(135deg, #475569, #334155); }
                
                .v-data-wrap { flex: 1; text-align: left; }
                .v-label { font-size: 0.75rem; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; }
                .v-value { font-size: 1.6rem; font-weight: 800; color: #1e293b; margin: 4px 0; }
                .v-trend { font-size: 0.75rem; font-weight: 700; display: flex; align-items: center; gap: 4px; }
                .v-trend.positive { color: #10b981; }
                .v-trend.neutral { color: #64748b; }

                .v-mini-progress { margin-top: 20px; height: 4px; background: #f1f5f9; border-radius: 2px; overflow: hidden; }
                .progress-fill { height: 100%; transition: width 1.5s ease; }
                .progress-fill.blue { background: #3b82f6; }
                .progress-fill.cyan { background: #06b6d4; }
                .progress-fill.indigo { background: #6366f1; }
                .progress-fill.slate { background: #475569; }

                /* Matrix Panels */
                .v-matrix-panel { border-radius: 20px; border: 1px solid #f1f5f9; overflow: hidden; }
                .glass-header { padding: 25px 30px !important; background: #fafcfe !important; border-bottom: 1px solid #eff6ff !important; display: flex; justify-content: space-between; align-items: center; }
                .h-left h3 { font-size: 1.1rem; font-weight: 800; color: #1e293b; margin: 0; }
                .h-left p { font-size: 0.8rem; color: #94a3b8; margin: 5px 0 0 0; font-weight: 500; }
                .v-period-btn { padding: 6px 14px; border-radius: 8px; border: 1px solid #e2e8f0; background: white; font-size: 0.75rem; font-weight: 700; color: #64748b; cursor: pointer; }
                .v-period-btn.active { background: #3b82f6; color: white; border-color: #3b82f6; }

                /* Premium Table */
                .v-premium-table-panel { border-radius: 24px; border: 1px solid #f1f5f9; background: white; margin-bottom: 40px; }
                .panel-header.between { display: flex; justify-content: space-between; align-items: center; padding: 25px 30px !important; border-bottom: 1px solid #f8fafc !important; }
                .v-export-btn { background: #f1f5f9; border: none; padding: 10px 18px; border-radius: 10px; font-weight: 700; font-size: 0.8rem; color: #1e293b; display: flex; align-items: center; gap: 8px; cursor: pointer; transition: 0.2s; }
                .v-export-btn:hover { background: #e2e8f0; }

                .v-modern-grid { width: 100%; border-collapse: separate; border-spacing: 0; }
                .v-modern-grid th { padding: 18px 30px; background: #fafcfe; color: #64748b; font-size: 0.75rem; font-weight: 800; text-transform: uppercase; border-bottom: 1px solid #f1f5f9; text-align: left; }
                .v-modern-grid td { padding: 18px 30px; border-bottom: 1px solid #f8fafc; vertical-align: middle; transition: background 0.2s; }
                .v-row-interactive:hover td { background: #fdfefe; }

                .v-id-tag { font-family: 'JetBrains Mono', monospace; font-size: 0.8rem; font-weight: 800; color: #3b82f6; background: #eff6ff; padding: 4px 10px; border-radius: 6px; }
                .v-user-chip { display: flex; align-items: center; gap: 12px; font-weight: 700; color: #334155; font-size: 0.9rem; }
                .v-avatar-mini { width: 34px; height: 34px; border-radius: 50%; border: 2px solid #eff6ff; }
                .v-time-cell { color: #94a3b8; font-size: 0.85rem; font-weight: 500; }
                
                .v-status-pill { display: flex; align-items: center; gap: 8px; padding: 6px 14px; border-radius: 50px; font-size: 0.75rem; font-weight: 800; width: fit-content; }
                .v-status-pill .s-dot { width: 6px; height: 6px; border-radius: 50%; }
                .v-status-pill.optimal { background: #dcfce7; color: #15803d; }
                .v-status-pill.optimal .s-dot { background: #15803d; }
                .v-status-pill.processing { background: #eff6ff; color: #1d4ed8; }
                .v-status-pill.processing .s-dot { background: #1d4ed8; }
                .v-status-pill.pending { background: #fff7ed; color: #c2410c; }
                .v-status-pill.pending .s-dot { background: #c2410c; }

                .v-val-cell { font-weight: 800; color: #1e293b; font-size: 0.95rem; text-align: right; }
            `}</style>
        </div>
    );
};

export default AdminOverview;
