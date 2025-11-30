// src/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import { 
  getAllUsers,
  getLoans,
  getLoanApplications,
  getPayments,
  getLoanOffers,
  getAdminAnalytics,
  deleteUser,
  updateUserStatus
} from './database';

const AdminDashboard = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [users, setUsers] = useState([]);
  const [loans, setLoans] = useState([]);
  const [applications, setApplications] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loanOffers, setLoanOffers] = useState([]);
  const [analytics, setAnalytics] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [notification, setNotification] = useState({ message: '', type: '' });

  // Load data when component mounts or tab changes
  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = () => {
    const allUsers = getAllUsers();
    const allLoans = getLoans();
    const allApplications = getLoanApplications();
    const allPayments = getPayments();
    const allOffers = getLoanOffers();
    const adminAnalytics = getAdminAnalytics();

    setUsers(allUsers);
    setLoans(allLoans);
    setApplications(allApplications);
    setPayments(allPayments);
    setLoanOffers(allOffers);
    setAnalytics(adminAnalytics);
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification({ message: '', type: '' }), 3000);
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`Are you sure you want to delete user "${userName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const success = deleteUser(userId);
      if (success) {
        showNotification(`User "${userName}" has been deleted successfully`, 'success');
        loadData();
      }
    } catch (error) {
      showNotification(error.message, 'error');
    }
  };

  const handleUpdateUserStatus = (userId, userName, newStatus) => {
    const result = updateUserStatus(userId, newStatus);
    if (result) {
      showNotification(`User "${userName}" status updated to ${newStatus}`, 'success');
      loadData();
    } else {
      showNotification('Failed to update user status', 'error');
    }
  };

  // Filter users based on search and role
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === 'all' || user.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      {/* Navigation Header */}
      <nav style={{ 
        backgroundColor: '#e74c3c', 
        color: 'white', 
        padding: '15px 20px', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ 
            backgroundColor: '#c0392b', 
            padding: '10px', 
            borderRadius: '8px',
            fontSize: '20px'
          }}>
            ⚙️
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '600' }}>Admin Dashboard</h1>
            <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.9 }}>
              {user.name} • System Administration
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <span style={{ fontWeight: '500' }}>System Control</span>
          <button 
            onClick={onLogout}
            style={{ 
              padding: '8px 16px', 
              backgroundColor: '#2c3e50', 
              color: 'white', 
              border: 'none', 
              borderRadius: '6px', 
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Notification */}
      {notification.message && (
        <div style={{ 
          padding: '12px 20px', 
          backgroundColor: notification.type === 'error' ? '#f8d7da' : '#d4edda',
          color: notification.type === 'error' ? '#721c24' : '#155724',
          border: `1px solid ${notification.type === 'error' ? '#f5c6cb' : '#c3e6cb'}`,
          borderRadius: '5px',
          margin: '10px 20px',
          fontWeight: '500'
        }}>
          {notification.message}
        </div>
      )}

      {/* Tab Navigation */}
      <div style={{ 
        backgroundColor: '#2c3e50', 
        display: 'flex',
        padding: '0 20px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        {['overview', 'users', 'loans', 'applications', 'system'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '15px 20px',
              border: 'none',
              backgroundColor: activeTab === tab ? '#3498db' : 'transparent',
              color: 'white',
              cursor: 'pointer',
              borderBottom: activeTab === tab ? '3px solid #2980b9' : '3px solid transparent',
              textTransform: 'capitalize',
              fontWeight: '500',
              fontSize: '14px'
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Main Content */}
      <div style={{ padding: '30px', maxWidth: '1400px', margin: '0 auto' }}>
        
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <OverviewView 
            analytics={analytics}
            loans={loans}
            applications={applications}
            users={users}
          />
        )}

        {/* USERS TAB */}
        {activeTab === 'users' && (
          <UsersView 
            users={filteredUsers}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            selectedRole={selectedRole}
            setSelectedRole={setSelectedRole}
            onDeleteUser={handleDeleteUser}
            onUpdateUserStatus={handleUpdateUserStatus}
          />
        )}

        {/* LOANS TAB */}
        {activeTab === 'loans' && (
          <LoansView 
            loans={loans}
            users={users}
          />
        )}

        {/* APPLICATIONS TAB */}
        {activeTab === 'applications' && (
          <ApplicationsView 
            applications={applications}
            users={users}
            loanOffers={loanOffers}
          />
        )}

        {/* SYSTEM TAB */}
        {activeTab === 'system' && (
          <SystemView 
            analytics={analytics}
            onRefresh={loadData}
          />
        )}
      </div>
    </div>
  );
};

// Overview View Component
const OverviewView = ({ analytics, loans, applications, users }) => (
  <div>
    <div style={{ 
      backgroundColor: 'white', 
      padding: '25px', 
      borderRadius: '10px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
      marginBottom: '25px'
    }}>
      <h2 style={{ 
        margin: '0 0 20px 0', 
        color: '#2c3e50',
        fontSize: '1.8rem',
        fontWeight: '600'
      }}>
        System Overview
      </h2>
      
      {/* Key Metrics */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
        gap: '20px', 
        marginBottom: '30px' 
      }}>
        <AdminMetricCard 
          title="Total Users"
          value={analytics.totalUsers}
          change={`+${analytics.platformGrowth?.newUsersThisMonth || 0} this month`}
          color="#3498db"
          icon="👥"
        />
        <AdminMetricCard 
          title="Platform Revenue"
          value={`$${(analytics.totalRevenue || 0).toFixed(2)}`}
          change="+15.3%"
          color="#27ae60"
          icon="💰"
        />
        <AdminMetricCard 
          title="Active Loans"
          value={analytics.totalLoans}
          change={`+${analytics.platformGrowth?.newLoansThisMonth || 0} this month`}
          color="#8e44ad"
          icon="📊"
        />
        <AdminMetricCard 
          title="Pending Applications"
          value={analytics.totalApplications}
          change="+8.2%"
          color="#e67e22"
          icon="📝"
        />
      </div>

      {/* User Distribution */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '15px' 
      }}>
        <DistributionCard 
          title="Borrowers"
          value={analytics.userDistribution?.borrowers}
          total={analytics.totalUsers}
          color="#3498db"
        />
        <DistributionCard 
          title="Lenders"
          value={analytics.userDistribution?.lenders}
          total={analytics.totalUsers}
          color="#27ae60"
        />
        <DistributionCard 
          title="Analysts"
          value={analytics.userDistribution?.analysts}
          total={analytics.totalUsers}
          color="#8e44ad"
        />
        <DistributionCard 
          title="Admins"
          value={analytics.userDistribution?.admins}
          total={analytics.totalUsers}
          color="#e67e22"
        />
      </div>
    </div>

    {/* Recent Activity */}
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: '1fr 1fr', 
      gap: '25px' 
    }}>
      {/* Recent Users */}
      <div style={{ 
        backgroundColor: 'white', 
        padding: '25px', 
        borderRadius: '10px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.08)'
      }}>
        <h3 style={{ margin: '0 0 20px 0', color: '#2c3e50' }}>Recently Registered Users</h3>
        {users.slice(0, 5).map(user => (
          <div key={user.id} style={{ 
            padding: '12px', 
            borderBottom: '1px solid #ecf0f1', 
            display: 'flex', 
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <strong style={{ color: '#2c3e50' }}>{user.name}</strong>
              <span style={{ color: '#7f8c8d', margin: '0 8px' }}>•</span>
              <span style={{ color: '#34495e', textTransform: 'capitalize' }}>{user.role}</span>
            </div>
            <span style={{ 
              padding: '3px 8px', 
              backgroundColor: user.status === 'active' ? '#d4edda' : '#f8d7da',
              color: user.status === 'active' ? '#155724' : '#721c24',
              borderRadius: '12px',
              fontSize: '11px',
              fontWeight: '500'
            }}>
              {user.status}
            </span>
          </div>
        ))}
      </div>

      {/* System Health */}
      <div style={{ 
        backgroundColor: 'white', 
        padding: '25px', 
        borderRadius: '10px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.08)'
      }}>
        <h3 style={{ margin: '0 0 20px 0', color: '#2c3e50' }}>System Health</h3>
        <div style={{ display: 'grid', gap: '15px' }}>
          <HealthMetric 
            title="User Activity"
            value="98%"
            status="healthy"
            description="Active users in last 30 days"
          />
          <HealthMetric 
            title="Loan Performance"
            value="95%"
            status="healthy"
            description="On-time payment rate"
          />
          <HealthMetric 
            title="System Uptime"
            value="99.9%"
            status="healthy"
            description="Platform availability"
          />
          <HealthMetric 
            title="Data Integrity"
            value="100%"
            status="healthy"
            description="No data corruption detected"
          />
        </div>
      </div>
    </div>
  </div>
);

// Users View Component
const UsersView = ({ 
  users, 
  searchTerm, 
  setSearchTerm, 
  selectedRole, 
  setSelectedRole, 
  onDeleteUser, 
  onUpdateUserStatus 
}) => (
  <div>
    <div style={{ 
      backgroundColor: 'white', 
      padding: '25px', 
      borderRadius: '10px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
      marginBottom: '25px'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2 style={{ margin: '0 0 5px 0', color: '#2c3e50' }}>User Management</h2>
          <p style={{ color: '#7f8c8d', margin: '0' }}>Manage all platform users and their permissions.</p>
        </div>
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ 
              padding: '8px 12px', 
              border: '1px solid #ddd', 
              borderRadius: '5px',
              minWidth: '200px'
            }}
          />
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            style={{ 
              padding: '8px 12px', 
              border: '1px solid #ddd', 
              borderRadius: '5px'
            }}
          >
            <option value="all">All Roles</option>
            <option value="borrower">Borrowers</option>
            <option value="lender">Lenders</option>
            <option value="analyst">Analysts</option>
            <option value="admin">Admins</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8f9fa' }}>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #dee2e6', color: '#2c3e50' }}>User</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #dee2e6', color: '#2c3e50' }}>Role</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #dee2e6', color: '#2c3e50' }}>Status</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #dee2e6', color: '#2c3e50' }}>Joined</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #dee2e6', color: '#2c3e50' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id} style={{ borderBottom: '1px solid #ecf0f1' }}>
                <td style={{ padding: '12px' }}>
                  <div>
                    <div style={{ fontWeight: '500', color: '#2c3e50' }}>{user.name}</div>
                    <div style={{ color: '#7f8c8d', fontSize: '0.9rem' }}>{user.email}</div>
                  </div>
                </td>
                <td style={{ padding: '12px' }}>
                  <span style={{ 
                    padding: '4px 8px', 
                    backgroundColor: getRoleColor(user.role),
                    color: 'white',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: '500',
                    textTransform: 'capitalize'
                  }}>
                    {user.role}
                  </span>
                </td>
                <td style={{ padding: '12px' }}>
                  <span style={{ 
                    padding: '4px 8px', 
                    backgroundColor: user.status === 'active' ? '#d4edda' : '#f8d7da',
                    color: user.status === 'active' ? '#155724' : '#721c24',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: '500'
                  }}>
                    {user.status}
                  </span>
                </td>
                <td style={{ padding: '12px', color: '#7f8c8d' }}>
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td style={{ padding: '12px' }}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                      onClick={() => onUpdateUserStatus(
                        user.id, 
                        user.name, 
                        user.status === 'active' ? 'suspended' : 'active'
                      )}
                      style={{ 
                        padding: '6px 12px', 
                        backgroundColor: user.status === 'active' ? '#e67e22' : '#27ae60',
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '4px', 
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: '500'
                      }}
                    >
                      {user.status === 'active' ? 'Suspend' : 'Activate'}
                    </button>
                    <button 
                      onClick={() => onDeleteUser(user.id, user.name)}
                      style={{ 
                        padding: '6px 12px', 
                        backgroundColor: '#e74c3c', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '4px', 
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: '500'
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && (
          <div style={{ padding: '40px', textAlign: 'center', color: '#7f8c8d' }}>
            <p>No users found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  </div>
);

// Loans View Component
const LoansView = ({ loans, users }) => (
  <div>
    <div style={{ 
      backgroundColor: 'white', 
      padding: '25px', 
      borderRadius: '10px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
      marginBottom: '25px'
    }}>
      <h2 style={{ margin: '0 0 10px 0', color: '#2c3e50' }}>Loan Management</h2>
      <p style={{ color: '#7f8c8d', margin: '0' }}>Monitor and manage all loans in the system.</p>
    </div>

    {/* Loans Table */}
    <div style={{ 
      backgroundColor: 'white', 
      padding: '25px', 
      borderRadius: '10px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.08)'
    }}>
      <h3 style={{ margin: '0 0 20px 0', color: '#2c3e50' }}>All Loans</h3>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8f9fa' }}>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #dee2e6', color: '#2c3e50' }}>Loan ID</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #dee2e6', color: '#2c3e50' }}>Borrower</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #dee2e6', color: '#2c3e50' }}>Lender</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #dee2e6', color: '#2c3e50' }}>Amount</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #dee2e6', color: '#2c3e50' }}>Status</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #dee2e6', color: '#2c3e50' }}>Remaining</th>
            </tr>
          </thead>
          <tbody>
            {loans.map(loan => {
              const borrower = users.find(u => u.id === loan.borrowerId);
              const lender = users.find(u => u.id === loan.lenderId);
              
              return (
                <tr key={loan.id} style={{ borderBottom: '1px solid #ecf0f1' }}>
                  <td style={{ padding: '12px', color: '#2c3e50', fontWeight: '500' }}>#{loan.id}</td>
                  <td style={{ padding: '12px', color: '#2c3e50' }}>
                    {borrower ? borrower.name : 'Unknown User'}
                  </td>
                  <td style={{ padding: '12px', color: '#2c3e50' }}>
                    {lender ? lender.name : 'Unknown User'}
                  </td>
                  <td style={{ padding: '12px', color: '#2c3e50', fontWeight: '500' }}>${loan.amount}</td>
                  <td style={{ padding: '12px' }}>
                    <span style={{ 
                      padding: '4px 8px', 
                      backgroundColor: loan.status === 'active' ? '#d4edda' : 
                                     loan.status === 'completed' ? '#cce7ff' : '#f8d7da',
                      color: loan.status === 'active' ? '#155724' : 
                            loan.status === 'completed' ? '#004085' : '#721c24',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '500'
                    }}>
                      {loan.status}
                    </span>
                  </td>
                  <td style={{ padding: '12px', color: '#2c3e50', fontWeight: '500' }}>
                    ${loan.remainingBalance}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

// Applications View Component
const ApplicationsView = ({ applications, users, loanOffers }) => (
  <div>
    <div style={{ 
      backgroundColor: 'white', 
      padding: '25px', 
      borderRadius: '10px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
      marginBottom: '25px'
    }}>
      <h2 style={{ margin: '0 0 10px 0', color: '#2c3e50' }}>Application Monitoring</h2>
      <p style={{ color: '#7f8c8d', margin: '0' }}>Review all loan applications in the system.</p>
    </div>

    {/* Applications Table */}
    <div style={{ 
      backgroundColor: 'white', 
      padding: '25px', 
      borderRadius: '10px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.08)'
    }}>
      <h3 style={{ margin: '0 0 20px 0', color: '#2c3e50' }}>All Applications</h3>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8f9fa' }}>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #dee2e6', color: '#2c3e50' }}>App ID</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #dee2e6', color: '#2c3e50' }}>Borrower</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #dee2e6', color: '#2c3e50' }}>Amount</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #dee2e6', color: '#2c3e50' }}>Purpose</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #dee2e6', color: '#2c3e50' }}>Status</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #dee2e6', color: '#2c3e50' }}>Applied</th>
            </tr>
          </thead>
          <tbody>
            {applications.map(app => {
              const borrower = users.find(u => u.id === app.borrowerId);
              const offer = loanOffers.find(o => o.id === app.loanOfferId);
              
              return (
                <tr key={app.id} style={{ borderBottom: '1px solid #ecf0f1' }}>
                  <td style={{ padding: '12px', color: '#2c3e50', fontWeight: '500' }}>#{app.id}</td>
                  <td style={{ padding: '12px', color: '#2c3e50' }}>
                    {borrower ? borrower.name : 'Unknown User'}
                  </td>
                  <td style={{ padding: '12px', color: '#2c3e50', fontWeight: '500' }}>${app.amount}</td>
                  <td style={{ padding: '12px', color: '#2c3e50' }}>{app.purpose}</td>
                  <td style={{ padding: '12px' }}>
                    <span style={{ 
                      padding: '4px 8px', 
                      backgroundColor: app.status === 'pending' ? '#fff3cd' : 
                                     app.status === 'approved' ? '#d4edda' : '#f8d7da',
                      color: app.status === 'pending' ? '#856404' : 
                            app.status === 'approved' ? '#155724' : '#721c24',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '500'
                    }}>
                      {app.status}
                    </span>
                  </td>
                  <td style={{ padding: '12px', color: '#7f8c8d' }}>
                    {new Date(app.appliedAt).toLocaleDateString()}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

// System View Component
const SystemView = ({ analytics, onRefresh }) => (
  <div>
    <div style={{ 
      backgroundColor: 'white', 
      padding: '25px', 
      borderRadius: '10px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
      marginBottom: '25px'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2 style={{ margin: '0 0 5px 0', color: '#2c3e50' }}>System Administration</h2>
          <p style={{ color: '#7f8c8d', margin: '0' }}>Platform configuration and maintenance tools.</p>
        </div>
        <button 
          onClick={onRefresh}
          style={{ 
            padding: '8px 16px', 
            backgroundColor: '#3498db', 
            color: 'white', 
            border: 'none', 
            borderRadius: '5px', 
            cursor: 'pointer',
            fontWeight: '500'
          }}
        >
          Refresh Data
        </button>
      </div>

      {/* System Metrics */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
        gap: '20px', 
        marginBottom: '25px' 
      }}>
        <SystemMetricCard 
          title="Database Size"
          value="2.4 MB"
          status="optimal"
          icon="💾"
        />
        <SystemMetricCard 
          title="Active Sessions"
          value={analytics.activeUsers}
          status="normal"
          icon="🔐"
        />
        <SystemMetricCard 
          title="Pending Tasks"
          value="3"
          status="warning"
          icon="⚡"
        />
        <SystemMetricCard 
          title="System Load"
          value="24%"
          status="optimal"
          icon="📊"
        />
      </div>

      {/* Maintenance Actions */}
      <div style={{ 
        backgroundColor: '#f8f9fa', 
        padding: '20px', 
        borderRadius: '8px',
        border: '1px solid #e9ecef'
      }}>
        <h4 style={{ margin: '0 0 15px 0', color: '#2c3e50' }}>Maintenance Actions</h4>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button style={{ 
            padding: '8px 16px', 
            backgroundColor: '#17a2b8', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px', 
            cursor: 'pointer',
            fontWeight: '500'
          }}>
            Backup Database
          </button>
          <button style={{ 
            padding: '8px 16px', 
            backgroundColor: '#6c757d', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px', 
            cursor: 'pointer',
            fontWeight: '500'
          }}>
            Clear Cache
          </button>
          <button style={{ 
            padding: '8px 16px', 
            backgroundColor: '#dc3545', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px', 
            cursor: 'pointer',
            fontWeight: '500'
          }}>
            Emergency Stop
          </button>
        </div>
      </div>
    </div>
  </div>
);

// Reusable Components
const AdminMetricCard = ({ title, value, change, color, icon }) => (
  <div style={{ 
    padding: '20px', 
    backgroundColor: color, 
    color: 'white', 
    borderRadius: '10px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
  }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div>
        <h3 style={{ margin: '0 0 10px 0', fontSize: '1rem', opacity: 0.9 }}>{title}</h3>
        <p style={{ fontSize: '1.8rem', margin: '0', fontWeight: 'bold' }}>{value}</p>
        <p style={{ margin: '8px 0 0 0', fontSize: '0.9rem', opacity: 0.9 }}>{change}</p>
      </div>
      <span style={{ fontSize: '2rem' }}>{icon}</span>
    </div>
  </div>
);

const DistributionCard = ({ title, value, total, color }) => (
  <div style={{ 
    padding: '15px', 
    backgroundColor: 'white', 
    border: `2px solid ${color}`,
    borderRadius: '8px',
    textAlign: 'center'
  }}>
    <div style={{ fontSize: '1rem', color: '#2c3e50', fontWeight: '500', marginBottom: '8px' }}>
      {title}
    </div>
    <div style={{ fontSize: '1.5rem', color: color, fontWeight: 'bold', marginBottom: '5px' }}>
      {value}
    </div>
    <div style={{ fontSize: '0.9rem', color: '#7f8c8d' }}>
      {total ? `${((value / total) * 100).toFixed(1)}% of total` : '0%'}
    </div>
  </div>
);

const HealthMetric = ({ title, value, status, description }) => {
  const statusColors = {
    healthy: '#27ae60',
    warning: '#e67e22',
    critical: '#e74c3c'
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0' }}>
    <div>
      <div style={{ color: '#2c3e50', fontWeight: '500' }}>{title}</div>
      <div style={{ color: '#7f8c8d', fontSize: '0.9rem' }}>{description}</div>
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <span style={{ color: statusColors[status], fontWeight: 'bold', fontSize: '1.1rem' }}>
        {value}
      </span>
      <div style={{ 
        width: '12px',
        height: '12px',
        backgroundColor: statusColors[status],
        borderRadius: '50%'
      }} />
    </div>
  </div>
  );
};

const SystemMetricCard = ({ title, value, status, icon }) => {
  const statusColors = {
    optimal: '#27ae60',
    normal: '#3498db',
    warning: '#e67e22',
    critical: '#e74c3c'
  };

  return (
    <div style={{ 
      padding: '20px', 
      backgroundColor: 'white', 
      borderRadius: '10px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
      borderLeft: `4px solid ${statusColors[status]}`
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h4 style={{ margin: '0 0 8px 0', color: '#2c3e50' }}>{title}</h4>
          <p style={{ fontSize: '1.5rem', margin: '0', color: statusColors[status], fontWeight: 'bold' }}>
            {value}
          </p>
        </div>
        <span style={{ fontSize: '2rem' }}>{icon}</span>
      </div>
    </div>
  );
};

// Helper function for role colors
const getRoleColor = (role) => {
  const colors = {
    borrower: '#3498db',
    lender: '#27ae60',
    analyst: '#8e44ad',
    admin: '#e67e22'
  };
  return colors[role] || '#95a5a6';
};

export default AdminDashboard;