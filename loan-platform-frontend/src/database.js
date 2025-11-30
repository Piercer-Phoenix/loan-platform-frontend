// src/database.js

// Initialize the entire database structure
export const initializeDatabase = () => {
  if (!localStorage.getItem('loanPlatformDB')) {
    const database = {
      // Users table
      users: [
        { 
          id: 1, 
          email: 'borrower@test.com', 
          password: '123', 
          role: 'borrower', 
          name: 'John Borrower',
          createdAt: new Date().toISOString(),
          status: 'active'
        },
        { 
          id: 2, 
          email: 'lender@test.com', 
          password: '123', 
          role: 'lender', 
          name: 'Jane Lender',
          company: 'Quick Loans Inc.',
          createdAt: new Date().toISOString(),
          status: 'active'
        },
        { 
          id: 3, 
          email: 'admin@test.com', 
          password: '123', 
          role: 'admin', 
          name: 'System Admin',
          createdAt: new Date().toISOString(),
          status: 'active'
        },
        { 
          id: 4, 
          email: 'analyst@test.com', 
          password: '123', 
          role: 'analyst', 
          name: 'Financial Analyst',
          createdAt: new Date().toISOString(),
          status: 'active'
        }
      ],
      
      // Loan offers table (created by lenders)
      loanOffers: [
        {
          id: 1,
          lenderId: 2,
          title: 'Personal Loan',
          description: 'Quick personal loans for immediate needs',
          maxAmount: 10000,
          minAmount: 1000,
          interestRate: 12.5,
          term: 24, // months
          status: 'active',
          createdAt: new Date().toISOString()
        },
        {
          id: 2,
          lenderId: 2,
          title: 'Business Loan',
          description: 'For small business expansion',
          maxAmount: 50000,
          minAmount: 5000,
          interestRate: 8.5,
          term: 60,
          status: 'active',
          createdAt: new Date().toISOString()
        }
      ],
      
      // Loan applications table (borrowers apply to loan offers)
      loanApplications: [
        {
          id: 1,
          borrowerId: 1,
          loanOfferId: 1,
          amount: 5000,
          purpose: 'Home renovation',
          status: 'pending', // pending, approved, rejected, withdrawn
          appliedAt: new Date().toISOString(),
          creditScore: 720,
          income: 50000
        }
      ],
      
      // Approved loans table
      approvedLoans: [
        {
          id: 1,
          applicationId: 1,
          borrowerId: 1,
          lenderId: 2,
          loanOfferId: 1,
          amount: 5000,
          interestRate: 12.5,
          term: 24,
          monthlyPayment: 236.72,
          totalRepayment: 5681.28,
          startDate: new Date().toISOString(),
          status: 'active', // active, completed, defaulted
          remainingBalance: 5200.00
        }
      ],
      
      // Payments table
      payments: [
        {
          id: 1,
          loanId: 1,
          amount: 236.72,
          dueDate: '2024-02-01',
          status: 'pending', // pending, paid, late
          paidAt: null,
          principal: 183.39,
          interest: 53.33
        },
        {
          id: 2,
          loanId: 1,
          amount: 236.72,
          dueDate: '2024-03-01',
          status: 'pending',
          paidAt: null,
          principal: 185.41,
          interest: 51.31
        }
      ],
      
      // Transactions table (payment history)
      transactions: [
        {
          id: 1,
          loanId: 1,
          userId: 1,
          type: 'disbursement', // disbursement, payment, fee
          amount: 5000,
          description: 'Loan amount disbursed',
          timestamp: new Date().toISOString()
        }
      ]
    };
    
    localStorage.setItem('loanPlatformDB', JSON.stringify(database));
  }
};

// Generic database operations
const getDatabase = () => {
  return JSON.parse(localStorage.getItem('loanPlatformDB') || '{}');
};

const saveDatabase = (db) => {
  localStorage.setItem('loanPlatformDB', JSON.stringify(db));
};

// USER OPERATIONS
export const getUserByEmail = (email) => {
  const db = getDatabase();
  return db.users?.find(user => user.email === email) || null;
};

export const createUser = (userData) => {
  const db = getDatabase();
  const newUser = {
    id: Date.now(),
    ...userData,
    createdAt: new Date().toISOString(),
    status: 'active'
  };
  
  db.users.push(newUser);
  saveDatabase(db);
  return newUser;
};

export const getAllUsers = () => {
  const db = getDatabase();
  return db.users || [];
};

// LOAN OFFER OPERATIONS
export const getLoanOffers = (lenderId = null) => {
  const db = getDatabase();
  let offers = db.loanOffers || [];
  if (lenderId) {
    offers = offers.filter(offer => offer.lenderId === lenderId);
  }
  return offers.filter(offer => offer.status === 'active');
};

export const createLoanOffer = (offerData) => {
  const db = getDatabase();
  const newOffer = {
    id: Date.now(),
    ...offerData,
    createdAt: new Date().toISOString(),
    status: 'active'
  };
  
  db.loanOffers.push(newOffer);
  saveDatabase(db);
  return newOffer;
};

// LOAN APPLICATION OPERATIONS
export const createLoanApplication = (applicationData) => {
  const db = getDatabase();
  const newApplication = {
    id: Date.now(),
    ...applicationData,
    status: 'pending',
    appliedAt: new Date().toISOString()
  };
  
  db.loanApplications.push(newApplication);
  saveDatabase(db);
  return newApplication;
};

export const getLoanApplications = (filters = {}) => {
  const db = getDatabase();
  let applications = db.loanApplications || [];
  
  if (filters.borrowerId) {
    applications = applications.filter(app => app.borrowerId === filters.borrowerId);
  }
  if (filters.lenderId) {
    // Get applications for loan offers created by this lender
    const lenderOffers = db.loanOffers?.filter(offer => offer.lenderId === filters.lenderId) || [];
    const lenderOfferIds = lenderOffers.map(offer => offer.id);
    applications = applications.filter(app => lenderOfferIds.includes(app.loanOfferId));
  }
  if (filters.status) {
    applications = applications.filter(app => app.status === filters.status);
  }
  
  return applications;
};

export const updateApplicationStatus = (applicationId, status) => {
  const db = getDatabase();
  const application = db.loanApplications?.find(app => app.id === applicationId);
  if (application) {
    application.status = status;
    saveDatabase(db);
    return application;
  }
  return null;
};

// APPROVED LOANS OPERATIONS
export const createApprovedLoan = (loanData) => {
  const db = getDatabase();
  
  // Calculate payment schedule
  const monthlyPayment = calculateMonthlyPayment(loanData.amount, loanData.interestRate, loanData.term);
  const totalRepayment = monthlyPayment * loanData.term;
  
  const newLoan = {
    id: Date.now(),
    ...loanData,
    monthlyPayment,
    totalRepayment,
    remainingBalance: loanData.amount,
    status: 'active',
    startDate: new Date().toISOString()
  };
  
  db.approvedLoans.push(newLoan);
  
  // Create payment schedule
  createPaymentSchedule(newLoan.id, loanData.amount, loanData.interestRate, loanData.term);
  
  saveDatabase(db);
  return newLoan;
};

export const getLoans = (filters = {}) => {
  const db = getDatabase();
  let loans = db.approvedLoans || [];
  
  if (filters.borrowerId) {
    loans = loans.filter(loan => loan.borrowerId === filters.borrowerId);
  }
  if (filters.lenderId) {
    loans = loans.filter(loan => loan.lenderId === filters.lenderId);
  }
  if (filters.status) {
    loans = loans.filter(loan => loan.status === filters.status);
  }
  
  return loans;
};

// PAYMENT OPERATIONS
const calculateMonthlyPayment = (principal, annualRate, termMonths) => {
  const monthlyRate = annualRate / 100 / 12;
  return principal * monthlyRate * Math.pow(1 + monthlyRate, termMonths) / (Math.pow(1 + monthlyRate, termMonths) - 1);
};

const createPaymentSchedule = (loanId, principal, annualRate, termMonths) => {
  const db = getDatabase();
  const monthlyRate = annualRate / 100 / 12;
  let remainingBalance = principal;
  const payments = [];
  
  for (let i = 1; i <= termMonths; i++) {
    const interest = remainingBalance * monthlyRate;
    const principalPayment = calculateMonthlyPayment(principal, annualRate, termMonths) - interest;
    
    payments.push({
      id: Date.now() + i,
      loanId,
      amount: parseFloat((principalPayment + interest).toFixed(2)),
      dueDate: new Date(Date.now() + i * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'pending',
      paidAt: null,
      principal: parseFloat(principalPayment.toFixed(2)),
      interest: parseFloat(interest.toFixed(2))
    });
    
    remainingBalance -= principalPayment;
  }
  
  db.payments = db.payments || [];
  db.payments.push(...payments);
};

export const getPayments = (loanId = null) => {
  const db = getDatabase();
  let payments = db.payments || [];
  
  if (loanId) {
    payments = payments.filter(payment => payment.loanId === loanId);
  }
  
  return payments;
};

export const makePayment = (paymentId) => {
  const db = getDatabase();
  const payment = db.payments?.find(p => p.id === paymentId);
  
  if (payment && payment.status === 'pending') {
    payment.status = 'paid';
    payment.paidAt = new Date().toISOString();
    
    // Update loan remaining balance
    const loan = db.approvedLoans?.find(l => l.id === payment.loanId);
    if (loan) {
      loan.remainingBalance -= payment.principal;
      if (loan.remainingBalance <= 0) {
        loan.status = 'completed';
      }
    }
    
    // Record transaction
    db.transactions = db.transactions || [];
    db.transactions.push({
      id: Date.now(),
      loanId: payment.loanId,
      userId: loan.borrowerId,
      type: 'payment',
      amount: payment.amount,
      description: `Monthly payment - Principal: $${payment.principal}, Interest: $${payment.interest}`,
      timestamp: new Date().toISOString()
    });
    
    saveDatabase(db);
    return payment;
  }
  return null;
};

// ANALYTICS OPERATIONS
export const getPlatformAnalytics = () => {
  const db = getDatabase();
  const loans = db.approvedLoans || [];
  const applications = db.loanApplications || [];
  const payments = db.payments || [];
  
  const totalLoans = loans.length;
  const totalLoanAmount = loans.reduce((sum, loan) => sum + loan.amount, 0);
  const activeLoans = loans.filter(loan => loan.status === 'active').length;
  const pendingApplications = applications.filter(app => app.status === 'pending').length;
  
  const totalRepayments = payments
    .filter(p => p.status === 'paid')
    .reduce((sum, p) => sum + p.amount, 0);
  
  const totalInterest = payments
    .filter(p => p.status === 'paid')
    .reduce((sum, p) => sum + p.interest, 0);
  
  return {
    totalLoans,
    totalLoanAmount,
    activeLoans,
    pendingApplications,
    totalRepayments,
    totalInterest
  };
};

// Check if email exists
export const checkEmailExists = (email) => {
  const db = getDatabase();
  return db.users?.some(user => user.email === email) || false;
};


// Add these functions to your existing database.js file

// USER MANAGEMENT OPERATIONS
export const deleteUser = (userId) => {
  const db = getDatabase();
  
  // Find user to delete
  const userIndex = db.users.findIndex(user => user.id === userId);
  if (userIndex === -1) {
    throw new Error('User not found');
  }

  const user = db.users[userIndex];
  
  // Check if user has active loans or applications
  if (user.role === 'borrower') {
    const userLoans = db.approvedLoans.filter(loan => loan.borrowerId === userId && loan.status === 'active');
    const userApplications = db.loanApplications.filter(app => app.borrowerId === userId && app.status === 'pending');
    
    if (userLoans.length > 0) {
      throw new Error('Cannot delete borrower with active loans');
    }
    if (userApplications.length > 0) {
      throw new Error('Cannot delete borrower with pending applications');
    }
  } else if (user.role === 'lender') {
    const lenderOffers = db.loanOffers.filter(offer => offer.lenderId === userId && offer.status === 'active');
    const lenderLoans = db.approvedLoans.filter(loan => loan.lenderId === userId && loan.status === 'active');
    
    if (lenderOffers.length > 0) {
      throw new Error('Cannot delete lender with active loan offers');
    }
    if (lenderLoans.length > 0) {
      throw new Error('Cannot delete lender with active loans');
    }
  }

  // Remove user from users array
  db.users.splice(userIndex, 1);
  
  // Clean up related data
  if (user.role === 'borrower') {
    // Remove borrower's applications
    db.loanApplications = db.loanApplications.filter(app => app.borrowerId !== userId);
    // Remove borrower's completed loans
    db.approvedLoans = db.approvedLoans.filter(loan => loan.borrowerId !== userId);
  } else if (user.role === 'lender') {
    // Remove lender's loan offers
    db.loanOffers = db.loanOffers.filter(offer => offer.lenderId !== userId);
  }

  saveDatabase(db);
  return true;
};

export const updateUserStatus = (userId, status) => {
  const db = getDatabase();
  const user = db.users.find(user => user.id === userId);
  
  if (user) {
    user.status = status;
    saveDatabase(db);
    return user;
  }
  return null;
};

// ADMIN ANALYTICS
export const getAdminAnalytics = () => {
  const db = getDatabase();
  const users = db.users || [];
  const loans = db.approvedLoans || [];
  const applications = db.loanApplications || [];
  const payments = db.payments || [];
  
  const totalUsers = users.length;
  const activeUsers = users.filter(user => user.status === 'active').length;
  const suspendedUsers = users.filter(user => user.status === 'suspended').length;
  
  const userDistribution = {
    borrowers: users.filter(user => user.role === 'borrower').length,
    lenders: users.filter(user => user.role === 'lender').length,
    analysts: users.filter(user => user.role === 'analyst').length,
    admins: users.filter(user => user.role === 'admin').length
  };

  const platformGrowth = {
    newUsersThisMonth: users.filter(user => {
      const created = new Date(user.createdAt);
      const now = new Date();
      return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
    }).length,
    newLoansThisMonth: loans.filter(loan => {
      const created = new Date(loan.startDate);
      const now = new Date();
      return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
    }).length
  };

  return {
    totalUsers,
    activeUsers,
    suspendedUsers,
    userDistribution,
    platformGrowth,
    totalLoans: loans.length,
    totalApplications: applications.length,
    totalRevenue: payments
      .filter(p => p.status === 'paid')
      .reduce((sum, p) => sum + p.interest, 0)
  };
};