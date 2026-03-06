import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Popup from '../components/Popup';
import ConfirmModal from '../components/ConfirmModal';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('users');
    const [users, setUsers] = useState([]);
    const [routes, setRoutes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [popup, setPopup] = useState({ message: '', type: '' });

    // Confirm Modal State
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => { },
        isDanger: false
    });

    // New Route Form State
    const [newRoute, setNewRoute] = useState({
        fromLocation: { name: '' },
        toLocation: { name: '' },
        transportType: 'BUS',
        durationMinutes: '',
        cost: '',
        operator: '',
        date: ''
    });

    const navigate = useNavigate();

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const fetchData = async () => {
        setLoading(true);
        try {
            if (activeTab === 'users') {
                const res = await api.get('/admin/users');
                setUsers(res.data);
            } else {
                // Fetch routes. For "Routes Today", we could filter here or filtering on backend.
                // Assuming backend returns all, we can filter or just show all for now.
                const res = await api.get('/admin/routes');
                setRoutes(res.data);
            }
        } catch (err) {
            setPopup({ message: "Failed to fetch data", type: 'error' });
            if (err.response?.status === 403) {
                navigate('/admin/login');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteUser = (id) => {
        setConfirmModal({
            isOpen: true,
            title: 'Delete User',
            message: 'Are you sure you want to delete this user? This action cannot be undone.',
            isDanger: true,
            onConfirm: async () => {
                try {
                    await api.delete(`/admin/users/${id}`);
                    setUsers(users.filter(u => u.id !== id));
                    setPopup({ message: "User deleted", type: 'success' });
                } catch (err) {
                    setPopup({ message: "Failed to delete user", type: 'error' });
                }
                setConfirmModal(prev => ({ ...prev, isOpen: false }));
            }
        });
    };

    const handleDeleteRoute = (id) => {
        setConfirmModal({
            isOpen: true,
            title: 'Delete Route',
            message: 'Are you sure you want to delete this route? This action cannot be undone.',
            isDanger: true,
            onConfirm: async () => {
                try {
                    await api.delete(`/admin/routes/${id}`);
                    setRoutes(routes.filter(r => r.id !== id));
                    setPopup({ message: "Route deleted", type: 'success' });
                } catch (err) {
                    setPopup({ message: "Failed to delete route", type: 'error' });
                }
                setConfirmModal(prev => ({ ...prev, isOpen: false }));
            }
        });
    };


    const handleAddRoute = async () => {
        try {
            const routePayload = {
                ...newRoute,
                durationMinutes: parseInt(newRoute.durationMinutes),
                cost: parseFloat(newRoute.cost),
                date: newRoute.date || null
            };

            if (!routePayload.fromLocation.name || !routePayload.toLocation.name) {
                setPopup({ message: "Location Names are required", type: 'error' });
                return;
            }

            await api.post('/admin/routes', routePayload);

            await fetchData();

            setPopup({ message: "Route added successfully", type: 'success' });

            setNewRoute({
                fromLocation: { name: '' },
                toLocation: { name: '' },
                transportType: 'BUS',
                durationMinutes: '',
                cost: '',
                operator: '',
                date: ''
            });
        } catch (err) {
            setPopup({ message: "Failed to add route", type: 'error' });
        }
    };


    const handleAssignOperator = async (id) => {
        const operator = prompt("Enter new operator name:");
        if (!operator) return;
        try {
            await api.put(`/admin/routes/${id}/operator`, { operator });
            fetchData(); // Refresh
            setPopup({ message: "Operator assigned", type: 'success' });
        } catch (err) {
            setPopup({ message: "Failed to assign operator", type: 'error' });
        }
    };



    return (
        <div className="dashboard-container">
            <Popup
                message={popup.message}
                type={popup.type}
                onClose={() => setPopup({ message: '', type: '' })}
            />

            <ConfirmModal
                isOpen={confirmModal.isOpen}
                title={confirmModal.title}
                message={confirmModal.message}
                onConfirm={confirmModal.onConfirm}
                onCancel={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                isDanger={confirmModal.isDanger}
                confirmText={confirmModal.isDanger ? 'Delete' : 'Confirm'}
            />

            <div className="search-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <h2 style={{ margin: 0, background: 'linear-gradient(to right, #818cf8, #c084fc, #f472b6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        Admin Dashboard
                    </h2>
                </div>

                <div className="admin-tabs" style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid var(--border-color)' }}>
                    <button
                        className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
                        onClick={() => setActiveTab('users')}
                        style={{
                            background: 'none',
                            border: 'none',
                            borderBottom: activeTab === 'users' ? '2px solid var(--primary-color)' : '2px solid transparent',
                            color: activeTab === 'users' ? 'var(--primary-color)' : 'var(--text-muted)',
                            padding: '1rem',
                            cursor: 'pointer',
                            fontSize: '1.1rem',
                            fontWeight: '500'
                        }}
                    >
                        All Users
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'routes' ? 'active' : ''}`}
                        onClick={() => setActiveTab('routes')}
                        style={{
                            background: 'none',
                            border: 'none',
                            borderBottom: activeTab === 'routes' ? '2px solid var(--primary-color)' : '2px solid transparent',
                            color: activeTab === 'routes' ? 'var(--primary-color)' : 'var(--text-muted)',
                            padding: '1rem',
                            cursor: 'pointer',
                            fontSize: '1.1rem',
                            fontWeight: '500'
                        }}
                    >
                        Routes Management
                    </button>
                </div>

                <div className="admin-content">
                    {loading && <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</p>}

                    {!loading && activeTab === 'users' && (
                        <div className="users-list" style={{ overflowX: 'auto' }}>
                            <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                                        <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--text-muted)' }}>ID</th>
                                        <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--text-muted)' }}>Username</th>
                                        <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--text-muted)' }}>Email</th>
                                        <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--text-muted)' }}>Mobile</th>
                                        <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--text-muted)' }}>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map(user => (
                                        <tr key={user.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                            <td style={{ padding: '1rem' }}>{user.id}</td>
                                            <td style={{ padding: '1rem' }}>{user.username}</td>
                                            <td style={{ padding: '1rem' }}>{user.email}</td>
                                            <td style={{ padding: '1rem' }}>{user.mobileNumber}</td>
                                            <td style={{ padding: '1rem' }}>
                                                <button
                                                    onClick={() => handleDeleteUser(user.id)}
                                                    style={{
                                                        background: 'rgba(239, 68, 68, 0.2)',
                                                        color: '#fca5a5',
                                                        border: 'none',
                                                        padding: '0.4rem 0.8rem',
                                                        borderRadius: '6px',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {!loading && activeTab === 'routes' && (
                        <div className="routes-list">
                            <div className="add-route-section" style={{ marginBottom: '2rem', padding: '1.5rem', background: 'var(--input-bg)', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
                                <h3 style={{ color: 'var(--primary-color)', marginTop: 0, marginBottom: '1.5rem' }}>Add New Route</h3>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
                                    <input placeholder="From Location Name" value={newRoute.fromLocation.name} onChange={e => setNewRoute({ ...newRoute, fromLocation: { name: e.target.value } })} className="form-input" />
                                    <input placeholder="To Location Name" value={newRoute.toLocation.name} onChange={e => setNewRoute({ ...newRoute, toLocation: { name: e.target.value } })} className="form-input" />
                                    <select value={newRoute.transportType} onChange={e => setNewRoute({ ...newRoute, transportType: e.target.value })} className="form-select">
                                        <option value="BUS">Bus</option>
                                        <option value="TRAIN">Train</option>
                                        <option value="FLIGHT">Flight</option>
                                        <option value="CAB">Cab</option>
                                    </select>
                                    <input placeholder="Duration (min)" type="number" value={newRoute.durationMinutes} onChange={e => setNewRoute({ ...newRoute, durationMinutes: e.target.value })} className="form-input" />
                                    <input placeholder="Cost" type="number" value={newRoute.cost} onChange={e => setNewRoute({ ...newRoute, cost: e.target.value })} className="form-input" />
                                    <input placeholder="Operator" value={newRoute.operator} onChange={e => setNewRoute({ ...newRoute, operator: e.target.value })} className="form-input" />
                                    <input type="date" value={newRoute.date} onChange={e => setNewRoute({ ...newRoute, date: e.target.value })} className="form-input" style={{ colorScheme: 'dark' }} />
                                    <button className="btn-primary" onClick={handleAddRoute} style={{ marginTop: 0 }}>Add Route</button>
                                </div>
                            </div>

                            <div style={{ overflowX: 'auto' }}>
                                <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                                            <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--text-muted)' }}>From</th>
                                            <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--text-muted)' }}>To</th>
                                            <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--text-muted)' }}>Type</th>
                                            <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--text-muted)' }}>Operator</th>
                                            <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--text-muted)' }}>Date</th>
                                            <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--text-muted)' }}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {routes.map(route => (
                                            <tr key={route.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                <td style={{ padding: '1rem' }}>{route.fromLocation?.name || 'N/A'}</td>
                                                <td style={{ padding: '1rem' }}>{route.toLocation?.name || 'N/A'}</td>
                                                <td style={{ padding: '1rem' }}>
                                                    <span style={{
                                                        padding: '0.3rem 0.8rem',
                                                        borderRadius: '20px',
                                                        fontSize: '0.85rem',
                                                        background: 'rgba(255, 255, 255, 0.1)',
                                                        color: 'var(--text-main)'
                                                    }}>
                                                        {route.transportType}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '1rem' }}>
                                                    {route.operator || <span style={{ fontStyle: 'italic', color: 'var(--text-muted)' }}>Unassigned</span>}
                                                    <button onClick={() => handleAssignOperator(route.id)} style={{ background: 'none', border: 'none', color: 'var(--primary-color)', cursor: 'pointer', marginLeft: '0.5rem', textDecoration: 'underline' }}>Edit</button>
                                                </td>
                                                <td style={{ padding: '1rem' }}>{route.date || 'N/A'}</td>
                                                <td style={{ padding: '1rem' }}>
                                                    <button
                                                        onClick={() => handleDeleteRoute(route.id)}
                                                        style={{
                                                            background: 'rgba(239, 68, 68, 0.2)',
                                                            color: '#fca5a5',
                                                            border: 'none',
                                                            padding: '0.4rem 0.8rem',
                                                            borderRadius: '6px',
                                                            cursor: 'pointer'
                                                        }}
                                                    >
                                                        Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
