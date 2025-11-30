// src/auth.js
import { getUserByEmail, createUser } from './database';

export const loginUser = (email, password) => {
  const user = getUserByEmail(email);
  
  if (user && user.password === password) {
    // Store current user in session
    localStorage.setItem('currentUser', JSON.stringify(user));
    return user;
  }
  return null;
};

export const registerUser = (userData) => {
  // Check if user already exists
  if (getUserByEmail(userData.email)) {
    throw new Error('User with this email already exists');
  }
  
  const newUser = createUser(userData);
  localStorage.setItem('currentUser', JSON.stringify(newUser));
  return newUser;
};

export const getCurrentUser = () => {
  const user = localStorage.getItem('currentUser');
  return user ? JSON.parse(user) : null;
};

export const logoutUser = () => {
  localStorage.removeItem('currentUser');
};

export const isAuthenticated = () => {
  return getCurrentUser() !== null;
};

// Add this function to check if email exists
export const checkEmailExists = (email) => {
  return getUserByEmail(email) !== null;
};