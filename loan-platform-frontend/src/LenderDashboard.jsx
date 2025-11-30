// src/LenderDashboard.jsx
import React, { useState, useEffect } from 'react';
import { 
  getLoanOffers, 
  createLoanOffer, 
  getLoanApplications, 
  updateApplicationStatus, 
  createApprovedLoan,
  getLoans,
  getPayments 
} from './database';

const LenderDashboard = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loanOffers, setLoanOffers] = useState([]);
  const [pendingApplications, setPendingApplications] = useState([]);
  const [approvedLoans, setApprovedLoans] = useState([]);
  const [newOfferForm, setNewOfferForm] = useState({
    title: '',
    description: '',
    minAmount: 1000,
    maxAmount: 10000,
    interestRate: 10,
    term: 12
  });

  // Load data when component mounts or tab changes
  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = () => {
    // Get lender's loan offers
    const offers = getLoanOffers(user.id);
    setLoanOffers(offers);

    // Get pending applications for lender's offers
    const applications = getLoanApplications({ lenderId: user.id, status: 'pending' });
    setPendingApplications(applications);

    // Get lender's approved loans
    const loans = getLoans({ lenderId: user.id });
    setApprovedLoans(loans);
  };

  const handleCreateOffer = (e) => {
    e.preventDefault();
    
    const offerData = {
      ...newOfferForm,
      lenderId: user.id
    };

    createLoanOffer(offerData);
    alert('Loan offer created successfully!');
    setNewOfferForm({
      title: '',
      description: '',
      minAmount: 1000,
      maxAmount: 10000,
      interestRate: 10,
      term: 12
    });
    loadData();
    setActiveTab('dashboard'); // Go back to dashboard after creation
  };

  const handleApproveApplication = (application) => {
    // Get the loan offer details
    const offer = getLoanOffers().find(o => o.id === application.loanOfferId);
    
    const loanData = {
      applicationId: application.id,
      borrowerId: application.borrowerId,
      lenderId: user.id,
      loanOfferId: application.loanOfferId,
      amount: application.amount,
      interestRate: offer?.interestRate || 12,
      term: offer?.term || 12
    };

    createApprovedLoan(loanData);
    updateApplicationStatus(application.id, 'approved');
    alert('Loan approved and disbursed!');
    loadData();
  };

  const handleRejectApplication = (applicationId) => {
    updateApplicationStatus(applicationId, 'rejected');
    alert('Application rejected');
    loadData();
  };

  // Dashboard Stats
  const activeLoansCount = approvedLoans.filter(loan => loan.status === 'active').length;
  const totalAmountLent = approvedLoans.reduce((sum, loan) => sum + loan.amount, 0);
  const pendingAppsCount = pendingApplications.length;
  
  const totalInterestEarned = approvedLoans.reduce((sum, loan) => {
    const loanPayments = getPayments(loan.id).filter(p => p.status === 'paid');
    return sum + loanPayments.reduce((interestSum, payment) => interestSum + payment.interest, 0);
  }, 0);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      {/* Navigation Header */}
      <nav style={{ 
        backgroundColor: '#1a5276', 
        color: 'white', 
        padding: '15px 20px', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ 
            backgroundColor: '#3498db', 
            padding: '10px', 
            borderRadius: '8px',
            fontSize: '20px'
          }}>
            🏦
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '600' }}>Lender Dashboard</h1>
            <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.9 }}>
              {user.name} {user.company && `• ${user.company}`}
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <span style={{ fontWeight: '500' }}>Welcome back!</span>
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
        {['dashboard', 'createOffer', 'applications', 'myLoans', 'earnings'].map(tab => (
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
            {tab === 'createOffer' ? 'Create Offer' : 
             tab === 'myLoans' ? 'My Loans' : tab}
          </button>
        ))}
      </div>

      {/* Main Content */}
      <div style={{ padding: '30px', maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* DASHBOARD TAB */}
        {activeTab === 'dashboard' && (
          <DashboardView 
            activeLoansCount={activeLoansCount}
            totalAmountLent={totalAmountLent}
            pendingAppsCount={pendingAppsCount}
            totalInterestEarned={totalInterestEarned}
            pendingApplications={pendingApplications}
            setActiveTab={setActiveTab}
          />
        )}

        {/* CREATE OFFER TAB */}
        {activeTab === 'createOffer' && (
          <CreateOfferView 
            newOfferForm={newOfferForm}
            setNewOfferForm={setNewOfferForm}
            handleCreateOffer={handleCreateOffer}
            loanOffers={loanOffers}
            setActiveTab={setActiveTab}
          />
        )}

        {/* APPLICATIONS TAB */}
        {activeTab === 'applications' && (
          <ApplicationsView 
            pendingApplications={pendingApplications}
            handleApproveApplication={handleApproveApplication}
            handleRejectApplication={handleRejectApplication}
          />
        )}

        {/* MY LOANS TAB */}
        {activeTab === 'myLoans' && (
          <MyLoansView 
            approvedLoans={approvedLoans}
            setActiveTab={setActiveTab}
          />
        )}

        {/* EARNINGS TAB */}
        {activeTab === 'earnings' && (
          <EarningsView 
            totalInterestEarned={totalInterestEarned}
            approvedLoans={approvedLoans}
            activeLoansCount={activeLoansCount}
          />
        )}
      </div>
    </div>
  );
};

// Dashboard View Component
const DashboardView = ({ 
  activeLoansCount, 
  totalAmountLent, 
  pendingAppsCount, 
  totalInterestEarned, 
  pendingApplications, 
  setActiveTab 
}) => (
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
        Lender Overview
      </h2>
      
      {/* Quick Stats */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
        gap: '20px', 
        marginBottom: '10px' 
      }}>
        <StatCard 
          title="Active Loans" 
          value={activeLoansCount} 
          color="#27ae60" 
          icon="📊"
        />
        <StatCard 
          title="Total Lent" 
          value={`$${totalAmountLent.toLocaleString()}`} 
          color="#3498db" 
          icon="💰"
        />
        <StatCard 
          title="Pending Applications" 
          value={pendingAppsCount} 
          color="#e67e22" 
          icon="📝"
        />
        <StatCard 
          title="Interest Earned" 
          value={`$${totalInterestEarned.toFixed(2)}`} 
          color="#8e44ad" 
          icon="💸"
        />
      </div>
    </div>

    {/* Quick Actions */}
    <div style={{ 
      backgroundColor: 'white', 
      padding: '25px', 
      borderRadius: '10px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
      marginBottom: '25px'
    }}>
      <h3 style={{ margin: '0 0 20px 0', color: '#2c3e50' }}>Quick Actions</h3>
      <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
        <ActionButton 
          onClick={() => setActiveTab('createOffer')}
          text="Create New Offer"
          color="#27ae60"
          icon="➕"
        />
        <ActionButton 
          onClick={() => setActiveTab('applications')}
          text="Review Applications"
          color="#3498db"
          icon="📋"
        />
        <ActionButton 
          onClick={() => setActiveTab('myLoans')}
          text="View Loan Portfolio"
          color="#8e44ad"
          icon="📑"
        />
        <ActionButton 
          onClick={() => setActiveTab('earnings')}
          text="View Earnings"
          color="#e67e22"
          icon="💵"
        />
      </div>
    </div>

    {/* Recent Activity */}
    <div style={{ 
      backgroundColor: 'white', 
      padding: '25px', 
      borderRadius: '10px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.08)'
    }}>
      <h3 style={{ margin: '0 0 20px 0', color: '#2c3e50' }}>Recent Applications</h3>
      {pendingApplications.slice(0, 5).map(app => (
        <div key={app.id} style={{ 
          padding: '15px', 
          borderBottom: '1px solid #ecf0f1', 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <strong style={{ color: '#2c3e50' }}>Application #{app.id}</strong> 
            <span style={{ color: '#7f8c8d', margin: '0 10px' }}>•</span>
            <span style={{ color: '#34495e' }}>${app.amount} for {app.purpose}</span>
          </div>
          <button 
            onClick={() => setActiveTab('applications')}
            style={{ 
              padding: '6px 12px', 
              backgroundColor: '#3498db', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px', 
              cursor: 'pointer', 
              fontSize: '12px',
              fontWeight: '500'
            }}
          >
            Review
          </button>
        </div>
      ))}
      {pendingApplications.length === 0 && (
        <div style={{ padding: '20px', textAlign: 'center', color: '#7f8c8d' }}>
          <p>No pending applications at the moment</p>
        </div>
      )}
    </div>
  </div>
);

// Create Offer View Component
const CreateOfferView = ({ newOfferForm, setNewOfferForm, handleCreateOffer, loanOffers, setActiveTab }) => (
  <div>
    <div style={{ 
      backgroundColor: 'white', 
      padding: '25px', 
      borderRadius: '10px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
      marginBottom: '25px'
    }}>
      <h2 style={{ margin: '0 0 20px 0', color: '#2c3e50' }}>Create New Loan Offer</h2>
      <form onSubmit={handleCreateOffer}>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#2c3e50' }}>Offer Title *</label>
          <input
            type="text"
            value={newOfferForm.title}
            onChange={(e) => setNewOfferForm({...newOfferForm, title: e.target.value})}
            placeholder="e.g., Personal Loan, Business Loan"
            required
            style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#2c3e50' }}>Description</label>
          <textarea
            value={newOfferForm.description}
            onChange={(e) => setNewOfferForm({...newOfferForm, description: e.target.value})}
            placeholder="Describe the loan offer terms and conditions"
            rows="3"
            style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px', resize: 'vertical' }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#2c3e50' }}>Minimum Amount ($) *</label>
            <input
              type="number"
              value={newOfferForm.minAmount}
              onChange={(e) => setNewOfferForm({...newOfferForm, minAmount: parseInt(e.target.value)})}
              min="100"
              required
              style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#2c3e50' }}>Maximum Amount ($) *</label>
            <input
              type="number"
              value={newOfferForm.maxAmount}
              onChange={(e) => setNewOfferForm({...newOfferForm, maxAmount: parseInt(e.target.value)})}
              min={newOfferForm.minAmount}
              required
              style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#2c3e50' }}>Interest Rate (%) *</label>
            <input
              type="number"
              value={newOfferForm.interestRate}
              onChange={(e) => setNewOfferForm({...newOfferForm, interestRate: parseFloat(e.target.value)})}
              min="1"
              max="50"
              step="0.1"
              required
              style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#2c3e50' }}>Term (Months) *</label>
            <input
              type="number"
              value={newOfferForm.term}
              onChange={(e) => setNewOfferForm({...newOfferForm, term: parseInt(e.target.value)})}
              min="1"
              max="120"
              required
              style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}
            />
          </div>
        </div>

        <button 
          type="submit"
          style={{ 
            padding: '12px 30px', 
            backgroundColor: '#27ae60', 
            color: 'white', 
            border: 'none', 
            borderRadius: '5px', 
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: '500'
          }}
        >
          Create Loan Offer
        </button>
      </form>
    </div>

    {/* Existing Offers */}
    <div style={{ 
      backgroundColor: 'white', 
      padding: '25px', 
      borderRadius: '10px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.08)'
    }}>
      <h3 style={{ margin: '0 0 20px 0', color: '#2c3e50' }}>Your Current Loan Offers</h3>
      <div style={{ display: 'grid', gap: '15px' }}>
        {loanOffers.map(offer => (
          <div key={offer.id} style={{ 
            padding: '15px', 
            backgroundColor: 'white', 
            border: '1px solid #ddd',
            borderRadius: '5px'
          }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#2c3e50' }}>{offer.title}</h4>
            <p style={{ margin: '5px 0', color: '#666' }}>{offer.description}</p>
            <div style={{ display: 'flex', gap: '15px', fontSize: '14px', color: '#666' }}>
              <span>Amount: ${offer.minAmount.toLocaleString()} - ${offer.maxAmount.toLocaleString()}</span>
              <span>Rate: {offer.interestRate}%</span>
              <span>Term: {offer.term} months</span>
            </div>
          </div>
        ))}
        {loanOffers.length === 0 && (
          <div style={{ padding: '20px', textAlign: 'center', color: '#7f8c8d' }}>
            <p>You haven't created any loan offers yet.</p>
          </div>
        )}
      </div>
    </div>
  </div>
);

// Applications View Component
const ApplicationsView = ({ pendingApplications, handleApproveApplication, handleRejectApplication }) => (
  <div>
    <div style={{ 
      backgroundColor: 'white', 
      padding: '25px', 
      borderRadius: '10px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
      marginBottom: '25px'
    }}>
      <h2 style={{ margin: '0 0 10px 0', color: '#2c3e50' }}>Loan Applications</h2>
      <p style={{ color: '#7f8c8d', margin: '0' }}>Review and process loan applications from borrowers.</p>
    </div>
    
    <div style={{ display: 'grid', gap: '20px' }}>
      {pendingApplications.map(application => (
        <ApplicationCard 
          key={application.id} 
          application={application}
          onApprove={handleApproveApplication}
          onReject={handleRejectApplication}
        />
      ))}
      {pendingApplications.length === 0 && (
        <div style={{ 
          backgroundColor: 'white', 
          padding: '40px', 
          textAlign: 'center', 
          borderRadius: '10px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
          color: '#7f8c8d'
        }}>
          <p>No pending applications at the moment.</p>
        </div>
      )}
    </div>
  </div>
);

// My Loans View Component
const MyLoansView = ({ approvedLoans, setActiveTab }) => (
  <div>
    <div style={{ 
      backgroundColor: 'white', 
      padding: '25px', 
      borderRadius: '10px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
      marginBottom: '25px'
    }}>
      <h2 style={{ margin: '0 0 10px 0', color: '#2c3e50' }}>My Loan Portfolio</h2>
      <p style={{ color: '#7f8c8d', margin: '0' }}>Track your active loans and their performance.</p>
    </div>

    <div style={{ display: 'grid', gap: '15px' }}>
      {approvedLoans.map(loan => (
        <LenderLoanCard key={loan.id} loan={loan} />
      ))}
      {approvedLoans.length === 0 && (
        <div style={{ 
          backgroundColor: 'white', 
          padding: '40px', 
          textAlign: 'center', 
          borderRadius: '10px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
          color: '#7f8c8d'
        }}>
          <p>You haven't approved any loans yet.</p>
          <button 
            onClick={() => setActiveTab('applications')}
            style={{ 
              marginTop: '15px', 
              padding: '10px 20px', 
              backgroundColor: '#3498db', 
              color: 'white', 
              border: 'none', 
              borderRadius: '6px', 
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            Review Applications
          </button>
        </div>
      )}
    </div>
  </div>
);

// Earnings View Component
const EarningsView = ({ totalInterestEarned, approvedLoans, activeLoansCount }) => (
  <div>
    <div style={{ 
      backgroundColor: 'white', 
      padding: '25px', 
      borderRadius: '10px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
      marginBottom: '25px'
    }}>
      <h2 style={{ margin: '0 0 10px 0', color: '#2c3e50' }}>Earnings & Analytics</h2>
      <p style={{ color: '#7f8c8d', margin: '0' }}>Monitor your lending performance and returns.</p>
    </div>

    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '25px' }}>
      <EarningCard 
        title="Total Interest Earned"
        value={`$${totalInterestEarned.toFixed(2)}`}
        color="#27ae60"
        icon="💸"
      />
      <EarningCard 
        title="Active Portfolio Value"
        value={`$${approvedLoans
          .filter(loan => loan.status === 'active')
          .reduce((sum, loan) => sum + loan.remainingBalance, 0)
          .toLocaleString()}`}
        color="#3498db"
        icon="📊"
      />
    </div>

    <div style={{ 
      backgroundColor: 'white', 
      padding: '25px', 
      borderRadius: '10px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.08)'
    }}>
      <h3 style={{ margin: '0 0 20px 0', color: '#2c3e50' }}>Loan Performance</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
        <PerformanceMetric 
          value={approvedLoans.length}
          label="Total Loans"
          color="#27ae60"
        />
        <PerformanceMetric 
          value={activeLoansCount}
          label="Active Loans"
          color="#3498db"
        />
        <PerformanceMetric 
          value={approvedLoans.filter(loan => loan.status === 'completed').length}
          label="Completed Loans"
          color="#e67e22"
        />
      </div>
    </div>
  </div>
);

// Reusable Components
const StatCard = ({ title, value, color, icon }) => (
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
        <p style={{ fontSize: '2rem', margin: '0', fontWeight: 'bold' }}>{value}</p>
      </div>
      <span style={{ fontSize: '2rem' }}>{icon}</span>
    </div>
  </div>
);

const ActionButton = ({ onClick, text, color, icon }) => (
  <button 
    onClick={onClick}
    style={{ 
      padding: '12px 20px', 
      backgroundColor: color, 
      color: 'white', 
      border: 'none', 
      borderRadius: '8px', 
      cursor: 'pointer',
      fontWeight: '500',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    }}
  >
    <span>{icon}</span>
    {text}
  </button>
);

const ApplicationCard = ({ application, onApprove, onReject }) => {
  const loanOffers = getLoanOffers();
  const offer = loanOffers.find(o => o.id === application.loanOfferId);

  return (
    <div style={{ 
      padding: '20px', 
      backgroundColor: 'white', 
      borderRadius: '10px',
      border: '1px solid #ddd',
      boxShadow: '0 2px 10px rgba(0,0,0,0.08)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
        <div style={{ flex: 1 }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#2c3e50' }}>Application #{application.id}</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
            <div>
              <strong style={{ color: '#2c3e50' }}>Loan Amount:</strong> ${application.amount}
            </div>
            <div>
              <strong style={{ color: '#2c3e50' }}>Purpose:</strong> {application.purpose}
            </div>
            <div>
              <strong style={{ color: '#2c3e50' }}>Credit Score:</strong> {application.creditScore}
            </div>
            <div>
              <strong style={{ color: '#2c3e50' }}>Income:</strong> ${application.income.toLocaleString()}/year
            </div>
          </div>
          {offer && (
            <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '5px' }}>
              <strong style={{ color: '#2c3e50' }}>Loan Offer:</strong> {offer.title} ({offer.interestRate}% for {offer.term} months)
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', borderTop: '1px solid #eee', paddingTop: '15px' }}>
        <button 
          onClick={() => onReject(application.id)}
          style={{ 
            padding: '10px 20px', 
            backgroundColor: '#e74c3c', 
            color: 'white', 
            border: 'none', 
            borderRadius: '5px', 
            cursor: 'pointer',
            fontWeight: '500'
          }}
        >
          Reject
        </button>
        <button 
          onClick={() => onApprove(application)}
          style={{ 
            padding: '10px 20px', 
            backgroundColor: '#27ae60', 
            color: 'white', 
            border: 'none', 
            borderRadius: '5px', 
            cursor: 'pointer',
            fontWeight: '500'
          }}
        >
          Approve & Disburse
        </button>
      </div>
    </div>
  );
};

const LenderLoanCard = ({ loan }) => {
  const payments = getPayments(loan.id);
  const paidPayments = payments.filter(p => p.status === 'paid');
  const totalPaid = paidPayments.reduce((sum, p) => sum + p.amount, 0);
  const interestEarned = paidPayments.reduce((sum, p) => sum + p.interest, 0);

  return (
    <div style={{ 
      padding: '15px', 
      backgroundColor: 'white', 
      border: '1px solid #ddd',
      borderRadius: '5px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.08)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <h4 style={{ margin: '0 0 5px 0', color: '#2c3e50' }}>Loan #{loan.id} - ${loan.amount}</h4>
          <p style={{ margin: '2px 0', color: '#666' }}>
            Interest: {loan.interestRate}% | Term: {loan.term} months | Monthly: ${loan.monthlyPayment}
          </p>
          <p style={{ margin: '2px 0', color: '#666' }}>
            Remaining Balance: ${loan.remainingBalance} | Total Repaid: ${totalPaid.toFixed(2)}
          </p>
          <p style={{ margin: '2px 0', color: '#666', fontSize: '14px' }}>
            Interest Earned: <strong style={{ color: '#27ae60' }}>${interestEarned.toFixed(2)}</strong>
          </p>
        </div>
        <span style={{ 
          padding: '5px 10px', 
          backgroundColor: loan.status === 'active' ? '#d4edda' : 
                         loan.status === 'completed' ? '#cce7ff' : '#f8d7da',
          color: loan.status === 'active' ? '#155724' : 
                loan.status === 'completed' ? '#004085' : '#721c24',
          borderRadius: '15px',
          fontSize: '12px',
          fontWeight: '500'
        }}>
          {loan.status}
        </span>
      </div>
    </div>
  );
};

const EarningCard = ({ title, value, color, icon }) => (
  <div style={{ 
    padding: '20px', 
    backgroundColor: 'white', 
    borderRadius: '10px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
    borderLeft: `4px solid ${color}`
  }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div>
        <h3 style={{ margin: '0 0 10px 0', color: '#2c3e50', fontSize: '1.1rem' }}>{title}</h3>
        <p style={{ fontSize: '1.8rem', margin: '0', fontWeight: 'bold', color: color }}>{value}</p>
      </div>
      <span style={{ fontSize: '2rem' }}>{icon}</span>
    </div>
  </div>
);

const PerformanceMetric = ({ value, label, color }) => (
  <div style={{ textAlign: 'center', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '5px' }}>
    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: color }}>
      {value}
    </div>
    <div style={{ color: '#2c3e50', fontWeight: '500' }}>{label}</div>
  </div>
);

export default LenderDashboard;