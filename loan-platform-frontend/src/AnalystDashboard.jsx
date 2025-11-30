// src/AnalystDashboard.jsx
import React, { useState, useEffect } from 'react';
import { 
  getAllUsers,
  getLoans,
  getLoanApplications,
  getPayments,
  getLoanOffers,
  getPlatformAnalytics
} from './database';

const AnalystDashboard = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [platformData, setPlatformData] = useState({});
  const [users, setUsers] = useState([]);
  const [loans, setLoans] = useState([]);
  const [applications, setApplications] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loanOffers, setLoanOffers] = useState([]);

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
    const analytics = getPlatformAnalytics();

    setUsers(allUsers);
    setLoans(allLoans);
    setApplications(allApplications);
    setPayments(allPayments);
    setLoanOffers(allOffers);
    setPlatformData(analytics);
  };

  // Calculate advanced analytics
  const calculateAdvancedMetrics = () => {
    const totalLoans = loans.length;
    const totalLoanAmount = loans.reduce((sum, loan) => sum + loan.amount, 0);
    const activeLoans = loans.filter(loan => loan.status === 'active');
    const completedLoans = loans.filter(loan => loan.status === 'completed');
    const defaultedLoans = loans.filter(loan => loan.status === 'defaulted');
    
    // Risk metrics
    const defaultRate = totalLoans > 0 ? (defaultedLoans.length / totalLoans) * 100 : 0;
    
    // Revenue metrics
    const totalInterest = payments
      .filter(p => p.status === 'paid')
      .reduce((sum, p) => sum + p.interest, 0);
    
    const avgLoanSize = totalLoans > 0 ? totalLoanAmount / totalLoans : 0;
    const avgInterestRate = loans.length > 0 ? 
      loans.reduce((sum, loan) => sum + loan.interestRate, 0) / loans.length : 0;

    // Application metrics
    const approvedApplications = applications.filter(app => app.status === 'approved').length;
    const rejectedApplications = applications.filter(app => app.status === 'rejected').length;
    const approvalRate = applications.length > 0 ? 
      (approvedApplications / applications.length) * 100 : 0;

    return {
      totalLoans,
      totalLoanAmount,
      activeLoans: activeLoans.length,
      completedLoans: completedLoans.length,
      defaultedLoans: defaultedLoans.length,
      defaultRate,
      totalInterest,
      avgLoanSize,
      avgInterestRate,
      approvalRate,
      totalApplications: applications.length,
      approvedApplications,
      rejectedApplications
    };
  };

  const metrics = calculateAdvancedMetrics();

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      {/* Navigation Header */}
      <nav style={{ 
        backgroundColor: '#8e44ad', 
        color: 'white', 
        padding: '15px 20px', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ 
            backgroundColor: '#9b59b6', 
            padding: '10px', 
            borderRadius: '8px',
            fontSize: '20px'
          }}>
            📊
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '600' }}>Financial Analyst Dashboard</h1>
            <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.9 }}>
              {user.name} • Advanced Analytics & Reporting
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <span style={{ fontWeight: '500' }}>Platform Insights</span>
          <button 
            onClick={onLogout}
            style={{ 
              padding: '8px 16px', 
              backgroundColor: '#e74c3c', 
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

      {/* Tab Navigation */}
      <div style={{ 
        backgroundColor: '#2c3e50', 
        display: 'flex',
        padding: '0 20px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        {['overview', 'loans', 'risk', 'revenue', 'users', 'reports'].map(tab => (
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
            metrics={metrics}
            platformData={platformData}
            loans={loans}
            applications={applications}
          />
        )}

        {/* LOANS TAB */}
        {activeTab === 'loans' && (
          <LoansView 
            loans={loans}
            metrics={metrics}
          />
        )}

        {/* RISK TAB */}
        {activeTab === 'risk' && (
          <RiskView 
            metrics={metrics}
            loans={loans}
            applications={applications}
          />
        )}

        {/* REVENUE TAB */}
        {activeTab === 'revenue' && (
          <RevenueView 
            metrics={metrics}
            payments={payments}
            loans={loans}
          />
        )}

        {/* USERS TAB */}
        {activeTab === 'users' && (
          <UsersView 
            users={users}
            loans={loans}
          />
        )}

        {/* REPORTS TAB */}
        {activeTab === 'reports' && (
          <ReportsView 
            metrics={metrics}
            platformData={platformData}
          />
        )}
      </div>
    </div>
  );
};

// Overview View Component
const OverviewView = ({ metrics, platformData, loans, applications }) => (
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
        Platform Overview
      </h2>
      
      {/* Key Metrics */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
        gap: '20px', 
        marginBottom: '30px' 
      }}>
        <MetricCard 
          title="Total Loan Portfolio"
          value={`$${metrics.totalLoanAmount.toLocaleString()}`}
          change="+12.5%"
          color="#3498db"
          icon="💰"
        />
        <MetricCard 
          title="Active Loans"
          value={metrics.activeLoans}
          change="+8.2%"
          color="#27ae60"
          icon="📈"
        />
        <MetricCard 
          title="Default Rate"
          value={`${metrics.defaultRate.toFixed(2)}%`}
          change="-2.1%"
          color={metrics.defaultRate > 5 ? '#e74c3c' : '#27ae60'}
          icon="⚠️"
        />
        <MetricCard 
          title="Total Interest Earned"
          value={`$${metrics.totalInterest.toFixed(2)}`}
          change="+15.3%"
          color="#8e44ad"
          icon="💸"
        />
      </div>

      {/* Secondary Metrics */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '15px' 
      }}>
        <SmallMetricCard 
          title="Avg Loan Size"
          value={`$${metrics.avgLoanSize.toFixed(2)}`}
          color="#3498db"
        />
        <SmallMetricCard 
          title="Avg Interest Rate"
          value={`${metrics.avgInterestRate.toFixed(2)}%`}
          color="#e67e22"
        />
        <SmallMetricCard 
          title="Approval Rate"
          value={`${metrics.approvalRate.toFixed(1)}%`}
          color="#27ae60"
        />
        <SmallMetricCard 
          title="Completion Rate"
          value={`${((metrics.completedLoans / metrics.totalLoans) * 100).toFixed(1)}%`}
          color="#8e44ad"
        />
      </div>
    </div>

    {/* Recent Activity */}
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: '1fr 1fr', 
      gap: '25px' 
    }}>
      {/* Recent Loans */}
      <div style={{ 
        backgroundColor: 'white', 
        padding: '25px', 
        borderRadius: '10px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.08)'
      }}>
        <h3 style={{ margin: '0 0 20px 0', color: '#2c3e50' }}>Recent Loan Activity</h3>
        {loans.slice(0, 5).map(loan => (
          <div key={loan.id} style={{ 
            padding: '12px', 
            borderBottom: '1px solid #ecf0f1', 
            display: 'flex', 
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <strong style={{ color: '#2c3e50' }}>Loan #{loan.id}</strong>
              <span style={{ color: '#7f8c8d', margin: '0 8px' }}>•</span>
              <span style={{ color: '#34495e' }}>${loan.amount}</span>
            </div>
            <span style={{ 
              padding: '3px 8px', 
              backgroundColor: loan.status === 'active' ? '#d4edda' : 
                             loan.status === 'completed' ? '#cce7ff' : '#f8d7da',
              color: loan.status === 'active' ? '#155724' : 
                    loan.status === 'completed' ? '#004085' : '#721c24',
              borderRadius: '12px',
              fontSize: '11px',
              fontWeight: '500'
            }}>
              {loan.status}
            </span>
          </div>
        ))}
      </div>

      {/* Application Stats */}
      <div style={{ 
        backgroundColor: 'white', 
        padding: '25px', 
        borderRadius: '10px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.08)'
      }}>
        <h3 style={{ margin: '0 0 20px 0', color: '#2c3e50' }}>Application Pipeline</h3>
        <div style={{ display: 'grid', gap: '15px' }}>
          <PipelineStage 
            stage="Pending Review"
            count={applications.filter(app => app.status === 'pending').length}
            color="#e67e22"
          />
          <PipelineStage 
            stage="Approved"
            count={applications.filter(app => app.status === 'approved').length}
            color="#27ae60"
          />
          <PipelineStage 
            stage="Rejected"
            count={applications.filter(app => app.status === 'rejected').length}
            color="#e74c3c"
          />
          <PipelineStage 
            stage="Total Applications"
            count={applications.length}
            color="#3498db"
          />
        </div>
      </div>
    </div>
  </div>
);

// Loans View Component
const LoansView = ({ loans, metrics }) => (
  <div>
    <div style={{ 
      backgroundColor: 'white', 
      padding: '25px', 
      borderRadius: '10px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
      marginBottom: '25px'
    }}>
      <h2 style={{ margin: '0 0 10px 0', color: '#2c3e50' }}>Loan Portfolio Analysis</h2>
      <p style={{ color: '#7f8c8d', margin: '0' }}>Detailed breakdown of all loans in the system.</p>
    </div>

    {/* Loan Distribution */}
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
      gap: '25px',
      marginBottom: '25px'
    }}>
      <LoanDistributionCard loans={loans} />
      <LoanStatusCard loans={loans} />
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
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #dee2e6', color: '#2c3e50' }}>Amount</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #dee2e6', color: '#2c3e50' }}>Interest Rate</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #dee2e6', color: '#2c3e50' }}>Term</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #dee2e6', color: '#2c3e50' }}>Status</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #dee2e6', color: '#2c3e50' }}>Remaining Balance</th>
            </tr>
          </thead>
          <tbody>
            {loans.map(loan => (
              <tr key={loan.id} style={{ borderBottom: '1px solid #ecf0f1' }}>
                <td style={{ padding: '12px', color: '#2c3e50' }}>#{loan.id}</td>
                <td style={{ padding: '12px', color: '#2c3e50', fontWeight: '500' }}>${loan.amount}</td>
                <td style={{ padding: '12px', color: '#2c3e50' }}>{loan.interestRate}%</td>
                <td style={{ padding: '12px', color: '#2c3e50' }}>{loan.term} months</td>
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
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

// Risk View Component
const RiskView = ({ metrics, loans, applications }) => {
  const riskLoans = loans.filter(loan => 
    loan.status === 'defaulted' || 
    (loan.status === 'active' && loan.remainingBalance > loan.amount * 0.8)
  );

  return (
    <div>
      <div style={{ 
        backgroundColor: 'white', 
        padding: '25px', 
        borderRadius: '10px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
        marginBottom: '25px'
      }}>
        <h2 style={{ margin: '0 0 10px 0', color: '#2c3e50' }}>Risk Assessment</h2>
        <p style={{ color: '#7f8c8d', margin: '0' }}>Monitor loan performance and identify potential risks.</p>
      </div>

      {/* Risk Metrics */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
        gap: '20px', 
        marginBottom: '25px' 
      }}>
        <RiskMetricCard 
          title="Current Default Rate"
          value={`${metrics.defaultRate.toFixed(2)}%`}
          level={metrics.defaultRate > 5 ? 'high' : metrics.defaultRate > 2 ? 'medium' : 'low'}
          description="Loans in default status"
        />
        <RiskMetricCard 
          title="At-Risk Loans"
          value={riskLoans.length}
          level={riskLoans.length > 10 ? 'high' : riskLoans.length > 5 ? 'medium' : 'low'}
          description="Active loans with high remaining balance"
        />
        <RiskMetricCard 
          title="Approval Rate"
          value={`${metrics.approvalRate.toFixed(1)}%`}
          level={metrics.approvalRate > 80 ? 'low' : metrics.approvalRate > 60 ? 'medium' : 'high'}
          description="Application approval percentage"
        />
      </div>

      {/* At-Risk Loans */}
      <div style={{ 
        backgroundColor: 'white', 
        padding: '25px', 
        borderRadius: '10px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.08)'
      }}>
        <h3 style={{ margin: '0 0 20px 0', color: '#2c3e50' }}>At-Risk Loans</h3>
        {riskLoans.length > 0 ? (
          <div style={{ display: 'grid', gap: '12px' }}>
            {riskLoans.map(loan => (
              <div key={loan.id} style={{ 
                padding: '15px', 
                backgroundColor: '#fff3cd',
                border: '1px solid #ffeaa7',
                borderRadius: '5px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <strong style={{ color: '#856404' }}>Loan #{loan.id}</strong>
                  <span style={{ color: '#856404', margin: '0 10px' }}>•</span>
                  <span style={{ color: '#856404' }}>Amount: ${loan.amount}</span>
                  <span style={{ color: '#856404', margin: '0 10px' }}>•</span>
                  <span style={{ color: '#856404' }}>Remaining: ${loan.remainingBalance}</span>
                </div>
                <span style={{ 
                  padding: '4px 8px', 
                  backgroundColor: '#fff3cd',
                  color: '#856404',
                  border: '1px solid #ffeaa7',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: '500'
                }}>
                  {loan.status === 'defaulted' ? 'Defaulted' : 'High Risk'}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ padding: '20px', textAlign: 'center', color: '#7f8c8d' }}>
            <p>No at-risk loans identified. Good job! 🎉</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Revenue View Component
const RevenueView = ({ metrics, payments, loans }) => {
  const monthlyRevenue = payments
    .filter(p => p.status === 'paid')
    .reduce((acc, payment) => {
      const month = new Date(payment.paidAt).toLocaleString('default', { month: 'short', year: 'numeric' });
      if (!acc[month]) acc[month] = 0;
      acc[month] += payment.interest;
      return acc;
    }, {});

  return (
    <div>
      <div style={{ 
        backgroundColor: 'white', 
        padding: '25px', 
        borderRadius: '10px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
        marginBottom: '25px'
      }}>
        <h2 style={{ margin: '0 0 10px 0', color: '#2c3e50' }}>Revenue Analytics</h2>
        <p style={{ color: '#7f8c8d', margin: '0' }}>Track interest earnings and revenue performance.</p>
      </div>

      {/* Revenue Metrics */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
        gap: '20px', 
        marginBottom: '25px' 
      }}>
        <RevenueMetricCard 
          title="Total Interest Revenue"
          value={`$${metrics.totalInterest.toFixed(2)}`}
          trend="up"
          change="+15.3%"
          color="#27ae60"
        />
        <RevenueMetricCard 
          title="Avg Monthly Revenue"
          value={`$${(metrics.totalInterest / 12).toFixed(2)}`}
          trend="up"
          change="+8.7%"
          color="#3498db"
        />
        <RevenueMetricCard 
          title="Revenue per Loan"
          value={`$${(metrics.totalInterest / metrics.totalLoans).toFixed(2)}`}
          trend="stable"
          change="+2.1%"
          color="#8e44ad"
        />
      </div>

      {/* Monthly Revenue */}
      <div style={{ 
        backgroundColor: 'white', 
        padding: '25px', 
        borderRadius: '10px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
        marginBottom: '25px'
      }}>
        <h3 style={{ margin: '0 0 20px 0', color: '#2c3e50' }}>Monthly Revenue Breakdown</h3>
        <div style={{ display: 'grid', gap: '12px' }}>
          {Object.entries(monthlyRevenue).map(([month, revenue]) => (
            <div key={month} style={{ 
              padding: '12px', 
              borderBottom: '1px solid #ecf0f1', 
              display: 'flex', 
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span style={{ color: '#2c3e50', fontWeight: '500' }}>{month}</span>
              <span style={{ color: '#27ae60', fontWeight: '600' }}>${revenue.toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Users View Component
const UsersView = ({ users, loans }) => {
  const borrowers = users.filter(u => u.role === 'borrower');
  const lenders = users.filter(u => u.role === 'lender');

  return (
    <div>
      <div style={{ 
        backgroundColor: 'white', 
        padding: '25px', 
        borderRadius: '10px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
        marginBottom: '25px'
      }}>
        <h2 style={{ margin: '0 0 10px 0', color: '#2c3e50' }}>User Analytics</h2>
        <p style={{ color: '#7f8c8d', margin: '0' }}>Platform user statistics and behavior analysis.</p>
      </div>

      {/* User Metrics */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
        gap: '20px', 
        marginBottom: '25px' 
      }}>
        <UserMetricCard 
          title="Total Users"
          value={users.length}
          change="+12.8%"
          color="#3498db"
          icon="👥"
        />
        <UserMetricCard 
          title="Active Borrowers"
          value={borrowers.length}
          change="+8.5%"
          color="#27ae60"
          icon="👤"
        />
        <UserMetricCard 
          title="Active Lenders"
          value={lenders.length}
          change="+15.2%"
          color="#8e44ad"
          icon="🏦"
        />
        <UserMetricCard 
          title="Avg Loans per User"
          value={(loans.length / users.length).toFixed(1)}
          change="+3.2%"
          color="#e67e22"
          icon="📊"
        />
      </div>

      {/* User Distribution */}
      <div style={{ 
        backgroundColor: 'white', 
        padding: '25px', 
        borderRadius: '10px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.08)'
      }}>
        <h3 style={{ margin: '0 0 20px 0', color: '#2c3e50' }}>User Distribution by Role</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
          <RoleDistributionCard 
            role="Borrowers"
            count={borrowers.length}
            percentage={(borrowers.length / users.length * 100).toFixed(1)}
            color="#27ae60"
          />
          <RoleDistributionCard 
            role="Lenders"
            count={lenders.length}
            percentage={(lenders.length / users.length * 100).toFixed(1)}
            color="#3498db"
          />
          <RoleDistributionCard 
            role="Analysts"
            count={users.filter(u => u.role === 'analyst').length}
            percentage={(users.filter(u => u.role === 'analyst').length / users.length * 100).toFixed(1)}
            color="#8e44ad"
          />
          <RoleDistributionCard 
            role="Admins"
            count={users.filter(u => u.role === 'admin').length}
            percentage={(users.filter(u => u.role === 'admin').length / users.length * 100).toFixed(1)}
            color="#e67e22"
          />
        </div>
      </div>
    </div>
  );
};

// Reports View Component
const ReportsView = ({ metrics, platformData }) => (
  <div>
    <div style={{ 
      backgroundColor: 'white', 
      padding: '25px', 
      borderRadius: '10px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
      marginBottom: '25px'
    }}>
      <h2 style={{ margin: '0 0 10px 0', color: '#2c3e50' }}>Financial Reports</h2>
      <p style={{ color: '#7f8c8d', margin: '0' }}>Generate and download comprehensive platform reports.</p>
    </div>

    {/* Report Cards */}
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
      gap: '25px' 
    }}>
      <ReportCard 
        title="Monthly Performance Report"
        description="Comprehensive overview of platform performance, revenue, and user growth."
        metrics={[
          `Total Revenue: $${metrics.totalInterest.toFixed(2)}`,
          `Active Loans: ${metrics.activeLoans}`,
          `New Users: ${Math.floor(metrics.totalLoans * 0.3)}`
        ]}
        action="Generate PDF"
        color="#3498db"
      />
      <ReportCard 
        title="Risk Assessment Report"
        description="Detailed analysis of loan portfolio risk and default rates."
        metrics={[
          `Default Rate: ${metrics.defaultRate.toFixed(2)}%`,
          `At-Risk Loans: ${Math.floor(metrics.totalLoans * 0.1)}`,
          `Approval Rate: ${metrics.approvalRate.toFixed(1)}%`
        ]}
        action="Generate PDF"
        color="#e74c3c"
      />
      <ReportCard 
        title="User Activity Report"
        description="Analysis of user behavior, application patterns, and engagement metrics."
        metrics={[
          `Total Applications: ${metrics.totalApplications}`,
          `Approval Rate: ${metrics.approvalRate.toFixed(1)}%`,
          `Avg Loan Size: $${metrics.avgLoanSize.toFixed(2)}`
        ]}
        action="Generate PDF"
        color="#27ae60"
      />
    </div>
  </div>
);

// Reusable Components
const MetricCard = ({ title, value, change, color, icon }) => (
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
        <p style={{ margin: '8px 0 0 0', fontSize: '0.9rem', opacity: 0.9 }}>{change} from last month</p>
      </div>
      <span style={{ fontSize: '2rem' }}>{icon}</span>
    </div>
  </div>
);

const SmallMetricCard = ({ title, value, color }) => (
  <div style={{ 
    padding: '15px', 
    backgroundColor: 'white', 
    border: `2px solid ${color}`,
    borderRadius: '8px',
    textAlign: 'center'
  }}>
    <div style={{ fontSize: '0.9rem', color: '#7f8c8d', marginBottom: '5px' }}>{title}</div>
    <div style={{ fontSize: '1.4rem', color: color, fontWeight: 'bold' }}>{value}</div>
  </div>
);

const PipelineStage = ({ stage, count, color }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0' }}>
    <span style={{ color: '#2c3e50', fontWeight: '500' }}>{stage}</span>
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <span style={{ 
        padding: '4px 8px', 
        backgroundColor: color, 
        color: 'white',
        borderRadius: '12px',
        fontSize: '12px',
        fontWeight: '500'
      }}>
        {count}
      </span>
    </div>
  </div>
);

const LoanDistributionCard = ({ loans }) => {
  const ranges = [
    { label: '$0-5,000', min: 0, max: 5000 },
    { label: '$5,001-10,000', min: 5001, max: 10000 },
    { label: '$10,001-20,000', min: 10001, max: 20000 },
    { label: '$20,001+', min: 20001, max: Infinity }
  ];

  const distribution = ranges.map(range => ({
    label: range.label,
    count: loans.filter(loan => loan.amount >= range.min && loan.amount <= range.max).length
  }));

  return (
    <div style={{ 
      backgroundColor: 'white', 
      padding: '20px', 
      borderRadius: '10px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.08)'
    }}>
      <h4 style={{ margin: '0 0 15px 0', color: '#2c3e50' }}>Loan Amount Distribution</h4>
      {distribution.map(item => (
        <div key={item.label} style={{ marginBottom: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
            <span style={{ color: '#2c3e50', fontSize: '14px' }}>{item.label}</span>
            <span style={{ color: '#7f8c8d', fontSize: '14px' }}>{item.count} loans</span>
          </div>
          <div style={{ 
            width: '100%', 
            backgroundColor: '#ecf0f1', 
            borderRadius: '5px',
            overflow: 'hidden'
          }}>
            <div 
              style={{ 
                width: `${(item.count / loans.length) * 100}%`, 
                backgroundColor: '#3498db',
                height: '8px',
                borderRadius: '5px'
              }} 
            />
          </div>
        </div>
      ))}
    </div>
  );
};

const LoanStatusCard = ({ loans }) => {
  const statusCounts = {
    active: loans.filter(l => l.status === 'active').length,
    completed: loans.filter(l => l.status === 'completed').length,
    defaulted: loans.filter(l => l.status === 'defaulted').length
  };

  return (
    <div style={{ 
      backgroundColor: 'white', 
      padding: '20px', 
      borderRadius: '10px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.08)'
    }}>
      <h4 style={{ margin: '0 0 15px 0', color: '#2c3e50' }}>Loan Status Distribution</h4>
      {Object.entries(statusCounts).map(([status, count]) => (
        <div key={status} style={{ marginBottom: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
            <span style={{ 
              color: '#2c3e50', 
              fontSize: '14px',
              textTransform: 'capitalize'
            }}>
              {status}
            </span>
            <span style={{ color: '#7f8c8d', fontSize: '14px' }}>{count} loans</span>
          </div>
          <div style={{ 
            width: '100%', 
            backgroundColor: '#ecf0f1', 
            borderRadius: '5px',
            overflow: 'hidden'
          }}>
            <div 
              style={{ 
                width: `${(count / loans.length) * 100}%`, 
                backgroundColor: status === 'active' ? '#27ae60' : status === 'completed' ? '#3498db' : '#e74c3c',
                height: '8px',
                borderRadius: '5px'
              }} 
            />
          </div>
        </div>
      ))}
    </div>
  );
};

const RiskMetricCard = ({ title, value, level, description }) => {
  const colors = {
    low: '#27ae60',
    medium: '#e67e22',
    high: '#e74c3c'
  };

  return (
    <div style={{ 
      padding: '20px', 
      backgroundColor: 'white', 
      borderRadius: '10px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
      borderLeft: `4px solid ${colors[level]}`
    }}>
      <h4 style={{ margin: '0 0 8px 0', color: '#2c3e50' }}>{title}</h4>
      <p style={{ fontSize: '1.5rem', margin: '0 0 8px 0', color: colors[level], fontWeight: 'bold' }}>
        {value}
      </p>
      <p style={{ margin: '0', color: '#7f8c8d', fontSize: '0.9rem' }}>{description}</p>
      <div style={{ 
        marginTop: '10px',
        padding: '4px 8px',
        backgroundColor: colors[level],
        color: 'white',
        borderRadius: '12px',
        fontSize: '12px',
        fontWeight: '500',
        display: 'inline-block',
        textTransform: 'uppercase'
      }}>
        {level} risk
      </div>
    </div>
  );
};

const RevenueMetricCard = ({ title, value, trend, change, color }) => (
  <div style={{ 
    padding: '20px', 
    backgroundColor: 'white', 
    borderRadius: '10px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.08)'
  }}>
    <h4 style={{ margin: '0 0 10px 0', color: '#2c3e50' }}>{title}</h4>
    <p style={{ fontSize: '1.5rem', margin: '0 0 5px 0', color: color, fontWeight: 'bold' }}>
      {value}
    </p>
    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
      <span style={{ color: trend === 'up' ? '#27ae60' : trend === 'down' ? '#e74c3c' : '#e67e22' }}>
        {trend === 'up' ? '↗' : trend === 'down' ? '↘' : '→'}
      </span>
      <span style={{ color: trend === 'up' ? '#27ae60' : trend === 'down' ? '#e74c3c' : '#e67e22', fontSize: '0.9rem' }}>
        {change}
      </span>
    </div>
  </div>
);

const UserMetricCard = ({ title, value, change, color, icon }) => (
  <div style={{ 
    padding: '20px', 
    backgroundColor: color, 
    color: 'white', 
    borderRadius: '10px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
  }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div>
        <h4 style={{ margin: '0 0 8px 0', fontSize: '1rem', opacity: 0.9 }}>{title}</h4>
        <p style={{ fontSize: '1.8rem', margin: '0', fontWeight: 'bold' }}>{value}</p>
        <p style={{ margin: '5px 0 0 0', fontSize: '0.9rem', opacity: 0.9 }}>{change}</p>
      </div>
      <span style={{ fontSize: '2rem' }}>{icon}</span>
    </div>
  </div>
);

const RoleDistributionCard = ({ role, count, percentage, color }) => (
  <div style={{ 
    padding: '15px', 
    backgroundColor: 'white', 
    border: `2px solid ${color}`,
    borderRadius: '8px',
    textAlign: 'center'
  }}>
    <div style={{ fontSize: '1rem', color: '#2c3e50', fontWeight: '500', marginBottom: '8px' }}>
      {role}
    </div>
    <div style={{ fontSize: '1.5rem', color: color, fontWeight: 'bold', marginBottom: '5px' }}>
      {count}
    </div>
    <div style={{ fontSize: '0.9rem', color: '#7f8c8d' }}>
      {percentage}%
    </div>
  </div>
);

const ReportCard = ({ title, description, metrics, action, color }) => (
  <div style={{ 
    padding: '20px', 
    backgroundColor: 'white', 
    borderRadius: '10px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
    borderTop: `4px solid ${color}`
  }}>
    <h4 style={{ margin: '0 0 10px 0', color: '#2c3e50' }}>{title}</h4>
    <p style={{ color: '#7f8c8d', margin: '0 0 15px 0', fontSize: '0.9rem' }}>
      {description}
    </p>
    <div style={{ marginBottom: '15px' }}>
      {metrics.map((metric, index) => (
        <div key={index} style={{ 
          padding: '5px 0', 
          borderBottom: '1px solid #ecf0f1',
          color: '#2c3e50',
          fontSize: '0.9rem'
        }}>
          {metric}
        </div>
      ))}
    </div>
    <button 
      style={{ 
        padding: '8px 16px', 
        backgroundColor: color, 
        color: 'white', 
        border: 'none', 
        borderRadius: '5px', 
        cursor: 'pointer',
        fontWeight: '500',
        width: '100%'
      }}
    >
      {action}
    </button>
  </div>
);

export default AnalystDashboard;