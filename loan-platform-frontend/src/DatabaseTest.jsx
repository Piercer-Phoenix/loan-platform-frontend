// src/DatabaseTest.jsx
import React, { useEffect } from 'react';
import { initializeDatabase, getLoanOffers, getLoanApplications, getLoans, getPlatformAnalytics } from './database';

const DatabaseTest = () => {
  useEffect(() => {
    // Initialize and test database
    initializeDatabase();
    
    console.log('Loan Offers:', getLoanOffers());
    console.log('Loan Applications:', getLoanApplications());
    console.log('Approved Loans:', getLoans());
    console.log('Platform Analytics:', getPlatformAnalytics());
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <h2>Database Test</h2>
      <p>Check browser console for database output</p>
      <p>Database initialized with:</p>
      <ul>
        <li>4 Users (Borrower, Lender, Admin, Analyst)</li>
        <li>2 Loan Offers</li>
        <li>1 Loan Application</li>
        <li>1 Approved Loan</li>
        <li>Payment Schedule</li>
      </ul>
    </div>
  );
};

export default DatabaseTest;