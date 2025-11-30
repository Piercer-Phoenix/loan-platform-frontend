// src/BorrowerDashboard.jsx
import React, { useState, useEffect } from 'react';
import { 
  getLoanOffers, 
  createLoanApplication, 
  getLoans, 
  getPayments, 
  makePayment, 
  getLoanApplications 
} from './database';

const BorrowerDashboard = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loanOffers, setLoanOffers] = useState([]);
  const [myLoans, setMyLoans] = useState([]);
  const [myApplications, setMyApplications] = useState([]);
  const [payments, setPayments] = useState([]);

  // Load data when component mounts or tab changes
  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = () => {
    // Get available loan offers
    const offers = getLoanOffers();
    setLoanOffers(offers);

    // Get borrower's loans
    const loans = getLoans({ borrowerId: user.id });
    setMyLoans(loans);

    // Get borrower's applications
    const applications = getLoanApplications({ borrowerId: user.id });
    setMyApplications(applications);

    // Get all payments for borrower's loans
    const allPayments = loans.flatMap(loan => getPayments(loan.id));
    setPayments(allPayments);
  };

  const handleApplyForLoan = (loanOfferId, amount, purpose) => {
    const application = {
      borrowerId: user.id,
      loanOfferId: loanOfferId,
      amount: parseFloat(amount),
      purpose: purpose,
      creditScore: Math.floor(Math.random() * 200) + 500,
      income: Math.floor(Math.random() * 50000) + 30000
    };

    createLoanApplication(application);
    alert('Loan application submitted successfully!');
    loadData();
    setActiveTab('myLoans');
  };

  const handleMakePayment = (paymentId) => {
    const result = makePayment(paymentId);
    if (result) {
      alert('Payment successful!');
      loadData();
    } else {
      alert('Payment failed!');
    }
  };

  // Dashboard Stats
  const activeLoans = myLoans.filter(loan => loan.status === 'active');
  const nextPayment = payments
    .filter(p => p.status === 'pending')
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))[0];

  const totalBorrowed = myLoans.reduce((sum, loan) => sum + loan.amount, 0);
  const pendingApplications = myApplications.filter(app => app.status === 'pending').length;
  const totalPaid = payments
    .filter(p => p.status === 'paid')
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      {/* Navigation Header */}
      <nav style={{ 
        backgroundColor: '#27ae60', 
        color: 'white', 
        padding: '15px 20px', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ 
            backgroundColor: '#2ecc71', 
            padding: '10px', 
            borderRadius: '8px',
            fontSize: '20px'
          }}>
            👤
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '600' }}>Borrower Dashboard</h1>
            <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.9 }}>
              {user.name}
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
        {['dashboard', 'apply', 'myLoans', 'payments', 'history'].map(tab => (
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
            {tab === 'myLoans' ? 'My Loans' : 
             tab === 'apply' ? 'Apply for Loan' : tab}
          </button>
        ))}
      </div>

      {/* Main Content */}
      <div style={{ padding: '30px', maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* DASHBOARD TAB */}
        {activeTab === 'dashboard' && (
          <DashboardView 
            activeLoans={activeLoans.length}
            nextPayment={nextPayment}
            totalBorrowed={totalBorrowed}
            pendingApplications={pendingApplications}
            totalPaid={totalPaid}
            myApplications={myApplications}
            setActiveTab={setActiveTab}
          />
        )}

        {/* APPLY FOR LOANS TAB */}
        {activeTab === 'apply' && (
          <ApplyView 
            loanOffers={loanOffers}
            handleApplyForLoan={handleApplyForLoan}
          />
        )}

        {/* MY LOANS TAB */}
        {activeTab === 'myLoans' && (
          <MyLoansView 
            myLoans={myLoans}
            myApplications={myApplications}
            setActiveTab={setActiveTab}
          />
        )}

        {/* PAYMENTS TAB */}
        {activeTab === 'payments' && (
          <PaymentsView 
            payments={payments}
            handleMakePayment={handleMakePayment}
          />
        )}

        {/* HISTORY TAB */}
        {activeTab === 'history' && (
          <HistoryView 
            myLoans={myLoans}
            payments={payments}
          />
        )}
      </div>
    </div>
  );
};

// Dashboard View Component
const DashboardView = ({ 
  activeLoans, 
  nextPayment, 
  totalBorrowed, 
  pendingApplications, 
  totalPaid,
  myApplications,
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
        Borrower Overview
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
          value={activeLoans} 
          color="#3498db" 
          icon="📊"
        />
        <StatCard 
          title="Total Borrowed" 
          value={`$${totalBorrowed.toLocaleString()}`} 
          color="#27ae60" 
          icon="💰"
        />
        <StatCard 
          title="Pending Applications" 
          value={pendingApplications} 
          color="#e67e22" 
          icon="📝"
        />
        <StatCard 
          title="Total Repaid" 
          value={`$${totalPaid.toFixed(2)}`} 
          color="#8e44ad" 
          icon="💸"
        />
      </div>
    </div>

    {/* Next Payment Alert */}
    {nextPayment && (
      <div style={{ 
        backgroundColor: '#fff3cd', 
        padding: '20px', 
        borderRadius: '10px',
        border: '1px solid #ffeaa7',
        marginBottom: '25px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <h3 style={{ margin: '0 0 5px 0', color: '#856404' }}>Next Payment Due</h3>
          <p style={{ margin: '0', color: '#856404' }}>
            <strong>${nextPayment.amount}</strong> due on {new Date(nextPayment.dueDate).toLocaleDateString()}
          </p>
        </div>
        <button 
          onClick={() => setActiveTab('payments')}
          style={{ 
            padding: '10px 20px', 
            backgroundColor: '#e67e22', 
            color: 'white', 
            border: 'none', 
            borderRadius: '5px', 
            cursor: 'pointer',
            fontWeight: '500'
          }}
        >
          Make Payment
        </button>
      </div>
    )}

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
          onClick={() => setActiveTab('apply')}
          text="Apply for Loan"
          color="#27ae60"
          icon="📋"
        />
        <ActionButton 
          onClick={() => setActiveTab('myLoans')}
          text="View My Loans"
          color="#3498db"
          icon="📑"
        />
        <ActionButton 
          onClick={() => setActiveTab('payments')}
          text="Make Payment"
          color="#8e44ad"
          icon="💳"
        />
        <ActionButton 
          onClick={() => setActiveTab('history')}
          text="Payment History"
          color="#e67e22"
          icon="📊"
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
      <h3 style={{ margin: '0 0 20px 0', color: '#2c3e50' }}>Recent Activity</h3>
      {myApplications.slice(0, 5).map(app => (
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
            <span style={{ 
              marginLeft: '10px', 
              padding: '2px 8px', 
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
          </div>
        </div>
      ))}
      {myApplications.length === 0 && (
        <div style={{ padding: '20px', textAlign: 'center', color: '#7f8c8d' }}>
          <p>No recent activity</p>
          <button 
            onClick={() => setActiveTab('apply')}
            style={{ 
              marginTop: '10px', 
              padding: '8px 16px', 
              backgroundColor: '#3498db', 
              color: 'white', 
              border: 'none', 
              borderRadius: '5px', 
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Apply for Your First Loan
          </button>
        </div>
      )}
    </div>
  </div>
);

// Apply View Component
const ApplyView = ({ loanOffers, handleApplyForLoan }) => (
  <div>
    <div style={{ 
      backgroundColor: 'white', 
      padding: '25px', 
      borderRadius: '10px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
      marginBottom: '25px'
    }}>
      <h2 style={{ margin: '0 0 10px 0', color: '#2c3e50' }}>Apply for a Loan</h2>
      <p style={{ color: '#7f8c8d', margin: '0' }}>Browse available loan offers and apply for the one that suits your needs.</p>
    </div>
    
    <div style={{ display: 'grid', gap: '20px' }}>
      {loanOffers.map(offer => (
        <LoanOfferCard 
          key={offer.id} 
          offer={offer} 
          onApply={handleApplyForLoan}
        />
      ))}
      {loanOffers.length === 0 && (
        <div style={{ 
          backgroundColor: 'white', 
          padding: '40px', 
          textAlign: 'center', 
          borderRadius: '10px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
          color: '#7f8c8d'
        }}>
          <p>No loan offers available at the moment.</p>
        </div>
      )}
    </div>
  </div>
);

// My Loans View Component
const MyLoansView = ({ myLoans, myApplications, setActiveTab }) => (
  <div>
    <div style={{ 
      backgroundColor: 'white', 
      padding: '25px', 
      borderRadius: '10px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
      marginBottom: '25px'
    }}>
      <h2 style={{ margin: '0 0 10px 0', color: '#2c3e50' }}>My Loans</h2>
      <p style={{ color: '#7f8c8d', margin: '0' }}>View your active loans and application status.</p>
    </div>

    {/* Approved Loans */}
    {myLoans.length > 0 && (
      <div style={{ marginBottom: '30px' }}>
        <h3 style={{ color: '#2c3e50', marginBottom: '15px' }}>Approved Loans</h3>
        <div style={{ display: 'grid', gap: '15px' }}>
          {myLoans.map(loan => (
            <LoanCard key={loan.id} loan={loan} />
          ))}
        </div>
      </div>
    )}

    {/* Pending Applications */}
    {myApplications.filter(app => app.status === 'pending').length > 0 && (
      <div style={{ marginBottom: '30px' }}>
        <h3 style={{ color: '#2c3e50', marginBottom: '15px' }}>Pending Applications</h3>
        <div style={{ display: 'grid', gap: '15px' }}>
          {myApplications.filter(app => app.status === 'pending').map(app => (
            <ApplicationCard key={app.id} application={app} />
          ))}
        </div>
      </div>
    )}

    {/* No Loans or Applications */}
    {myLoans.length === 0 && myApplications.filter(app => app.status === 'pending').length === 0 && (
      <div style={{ 
        backgroundColor: 'white', 
        padding: '40px', 
        textAlign: 'center', 
        borderRadius: '10px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
        color: '#7f8c8d'
      }}>
        <p>You don't have any loans or applications yet.</p>
        <button 
          onClick={() => setActiveTab('apply')}
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
          Apply for Your First Loan
        </button>
      </div>
    )}
  </div>
);

// Payments View Component
const PaymentsView = ({ payments, handleMakePayment }) => {
  const pendingPayments = payments.filter(p => p.status === 'pending')
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

  return (
    <div>
      <div style={{ 
        backgroundColor: 'white', 
        padding: '25px', 
        borderRadius: '10px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
        marginBottom: '25px'
      }}>
        <h2 style={{ margin: '0 0 10px 0', color: '#2c3e50' }}>Payment Management</h2>
        <p style={{ color: '#7f8c8d', margin: '0' }}>View and manage your upcoming loan payments.</p>
      </div>

      <div style={{ display: 'grid', gap: '15px' }}>
        {pendingPayments.map(payment => (
          <PaymentCard 
            key={payment.id} 
            payment={payment} 
            onPay={handleMakePayment}
          />
        ))}
        {pendingPayments.length === 0 && (
          <div style={{ 
            backgroundColor: 'white', 
            padding: '40px', 
            textAlign: 'center', 
            borderRadius: '10px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
            color: '#7f8c8d'
          }}>
            <p>No pending payments at the moment.</p>
          </div>
        )}
      </div>
    </div>
  );
};

// History View Component
const HistoryView = ({ myLoans, payments }) => {
  const paidPayments = payments.filter(p => p.status === 'paid')
    .sort((a, b) => new Date(b.paidAt) - new Date(a.paidAt));

  return (
    <div>
      <div style={{ 
        backgroundColor: 'white', 
        padding: '25px', 
        borderRadius: '10px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
        marginBottom: '25px'
      }}>
        <h2 style={{ margin: '0 0 10px 0', color: '#2c3e50' }}>Payment History</h2>
        <p style={{ color: '#7f8c8d', margin: '0' }}>View your completed loan payments and transaction history.</p>
      </div>

      <div style={{ display: 'grid', gap: '15px' }}>
        {paidPayments.map(payment => (
          <PaymentHistoryCard 
            key={payment.id} 
            payment={payment} 
            loan={myLoans.find(l => l.id === payment.loanId)}
          />
        ))}
        {paidPayments.length === 0 && (
          <div style={{ 
            backgroundColor: 'white', 
            padding: '40px', 
            textAlign: 'center', 
            borderRadius: '10px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
            color: '#7f8c8d'
          }}>
            <p>No payment history available.</p>
          </div>
        )}
      </div>
    </div>
  );
};

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

const LoanOfferCard = ({ offer, onApply }) => {
  const [showForm, setShowForm] = useState(false);
  const [amount, setAmount] = useState('');
  const [purpose, setPurpose] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (amount && purpose && amount >= offer.minAmount && amount <= offer.maxAmount) {
      onApply(offer.id, amount, purpose);
      setShowForm(false);
      setAmount('');
      setPurpose('');
    }
  };

  return (
    <div style={{ 
      padding: '20px', 
      backgroundColor: 'white', 
      borderRadius: '10px',
      border: '1px solid #ddd',
      boxShadow: '0 2px 10px rgba(0,0,0,0.08)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#2c3e50' }}>{offer.title}</h3>
          <p style={{ margin: '5px 0', color: '#666' }}>{offer.description}</p>
          <div style={{ display: 'flex', gap: '15px', marginTop: '10px', flexWrap: 'wrap' }}>
            <span style={{ color: '#2c3e50', fontWeight: '500' }}>
              Amount: ${offer.minAmount.toLocaleString()} - ${offer.maxAmount.toLocaleString()}
            </span>
            <span style={{ color: '#2c3e50', fontWeight: '500' }}>
              Interest: {offer.interestRate}%
            </span>
            <span style={{ color: '#2c3e50', fontWeight: '500' }}>
              Term: {offer.term} months
            </span>
          </div>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          style={{ 
            padding: '10px 20px', 
            backgroundColor: '#3498db', 
            color: 'white', 
            border: 'none', 
            borderRadius: '5px', 
            cursor: 'pointer',
            fontWeight: '500'
          }}
        >
          {showForm ? 'Cancel' : 'Apply Now'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px solid #eee' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#2c3e50' }}>
                Loan Amount ($)
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min={offer.minAmount}
                max={offer.maxAmount}
                required
                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
              />
              <small style={{ color: '#7f8c8d' }}>
                Between ${offer.minAmount} - ${offer.maxAmount}
              </small>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#2c3e50' }}>
                Purpose
              </label>
              <input
                type="text"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                placeholder="What do you need the loan for?"
                required
                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
              />
            </div>
          </div>
          <button 
            type="submit"
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
            Submit Application
          </button>
        </form>
      )}
    </div>
  );
};

const LoanCard = ({ loan }) => (
  <div style={{ 
    padding: '15px', 
    backgroundColor: 'white', 
    border: '1px solid #ddd',
    borderRadius: '5px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.08)'
  }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div style={{ flex: 1 }}>
        <h4 style={{ margin: '0 0 5px 0', color: '#2c3e50' }}>Loan #{loan.id}</h4>
        <p style={{ margin: '2px 0', color: '#666' }}>
          Amount: ${loan.amount} | Interest: {loan.interestRate}% | Term: {loan.term} months
        </p>
        <p style={{ margin: '2px 0', color: '#666' }}>
          Monthly Payment: ${loan.monthlyPayment} | Remaining: ${loan.remainingBalance}
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

const ApplicationCard = ({ application }) => (
  <div style={{ 
    padding: '15px', 
    backgroundColor: '#fff3cd', 
    border: '1px solid #ffeaa7',
    borderRadius: '5px'
  }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div>
        <h4 style={{ margin: '0 0 5px 0', color: '#856404' }}>Application #{application.id}</h4>
        <p style={{ margin: '2px 0', color: '#856404' }}>
          Amount: ${application.amount} | Purpose: {application.purpose}
        </p>
      </div>
      <span style={{ 
        padding: '5px 10px', 
        backgroundColor: '#fff3cd',
        color: '#856404',
        border: '1px solid #ffeaa7',
        borderRadius: '15px',
        fontSize: '12px',
        fontWeight: '500'
      }}>
        Under Review
      </span>
    </div>
  </div>
);

const PaymentCard = ({ payment, onPay }) => {
  const loan = getLoans().find(l => l.id === payment.loanId);
  
  return (
    <div style={{ 
      padding: '15px', 
      backgroundColor: 'white', 
      border: '1px solid #ddd',
      borderRadius: '5px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }}>
      <div style={{ flex: 1 }}>
        <h4 style={{ margin: '0 0 5px 0', color: '#2c3e50' }}>Payment for Loan #{payment.loanId}</h4>
        <p style={{ margin: '2px 0', color: '#666' }}>
          Due: {new Date(payment.dueDate).toLocaleDateString()} | Amount: ${payment.amount}
        </p>
        <p style={{ margin: '2px 0', color: '#666', fontSize: '12px' }}>
          Principal: ${payment.principal} | Interest: ${payment.interest}
        </p>
      </div>
      <button 
        onClick={() => onPay(payment.id)}
        style={{ 
          padding: '8px 15px', 
          backgroundColor: '#27ae60', 
          color: 'white', 
          border: 'none', 
          borderRadius: '5px', 
          cursor: 'pointer',
          fontWeight: '500'
        }}
      >
        Pay Now
      </button>
    </div>
  );
};

const PaymentHistoryCard = ({ payment, loan }) => (
  <div style={{ 
    padding: '15px', 
    backgroundColor: 'white', 
    border: '1px solid #ddd',
    borderRadius: '5px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.08)'
  }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div style={{ flex: 1 }}>
        <h4 style={{ margin: '0 0 5px 0', color: '#2c3e50' }}>Payment for Loan #{payment.loanId}</h4>
        <p style={{ margin: '2px 0', color: '#666' }}>
          Paid: {new Date(payment.paidAt).toLocaleDateString()} | Amount: ${payment.amount}
        </p>
        <p style={{ margin: '2px 0', color: '#666', fontSize: '12px' }}>
          Principal: ${payment.principal} | Interest: ${payment.interest}
        </p>
      </div>
      <span style={{ 
        padding: '5px 10px', 
        backgroundColor: '#d4edda',
        color: '#155724',
        borderRadius: '15px',
        fontSize: '12px',
        fontWeight: '500'
      }}>
        Paid
      </span>
    </div>
  </div>
);

export default BorrowerDashboard;