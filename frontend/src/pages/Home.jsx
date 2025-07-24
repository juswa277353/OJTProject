import React, { useState, useEffect } from 'react';
import api, { ACCESS_TOKEN } from '../api.js'; // Import the axios instance and ACCESS_TOKEN

// Main App Component
function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null); // 'admin' or 'user'
  const [userEmail, setUserEmail] = useState(null);
  const [currentView, setCurrentView] = useState('home'); // 'home', 'signIn', 'signUp', 'dashboard'

  // Check for existing tokens on component mount
  useEffect(() => {
    const accessToken = localStorage.getItem(ACCESS_TOKEN);
    const refreshToken = localStorage.getItem('refreshToken'); // Assuming refresh token key is 'refreshToken'
    const role = localStorage.getItem('userRole');
    const email = localStorage.getItem('userEmail');

    if (accessToken && refreshToken && role && email) {
      // In a real app, you'd verify the access token with your backend
      // or try to refresh it if expired. For this example, we'll assume it's valid.
      setIsLoggedIn(true);
      setUserRole(role);
      setUserEmail(email);
      setCurrentView('dashboard'); // Go to dashboard if already logged in
    }
  }, []);

  // Handle successful login/signup
  const handleAuthSuccess = (userData, tokens) => {
    setIsLoggedIn(true);
    setUserRole(userData.role);
    setUserEmail(userData.email);
    localStorage.setItem(ACCESS_TOKEN, tokens.access);
    localStorage.setItem('refreshToken', tokens.refresh);
    localStorage.setItem('userRole', userData.role);
    localStorage.setItem('userEmail', userData.email);
    setCurrentView('dashboard'); // Navigate to dashboard after successful auth
  };

  // Handle user logout
  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserRole(null);
    setUserEmail(null);
    localStorage.removeItem(ACCESS_TOKEN);
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userEmail');
    setCurrentView('home'); // Navigate to home after logout
  };

  // Render different views based on currentView state
  const renderView = () => {
    if (isLoggedIn && currentView === 'dashboard') {
      return <Dashboard userRole={userRole} userEmail={userEmail} onLogout={handleLogout} />;
    }

    switch (currentView) {
      case 'home':
        return <HomePage setCurrentView={setCurrentView} isLoggedIn={isLoggedIn} />;
      case 'signIn':
        return <SignInForm onAuthSuccess={handleAuthSuccess} setCurrentView={setCurrentView} />;
      case 'signUp':
        return <SignUpForm onAuthSuccess={handleAuthSuccess} setCurrentView={setCurrentView} />;
      default:
        // Fallback to home if an invalid view is set
        return <HomePage setCurrentView={setCurrentView} isLoggedIn={isLoggedIn} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4 font-sans">
      {/* Navigation Bar */}
      <nav className="w-full max-w-md bg-white p-4 rounded-lg shadow-xl mb-4 flex justify-around items-center">
        <button
          onClick={() => setCurrentView('home')}
          className="text-blue-600 hover:underline font-medium focus:outline-none px-3 py-1 rounded-md transition duration-200"
        >
          Home
        </button>
        {!isLoggedIn ? (
          <>
            <button
              onClick={() => setCurrentView('signIn')}
              className="text-blue-600 hover:underline font-medium focus:outline-none px-3 py-1 rounded-md transition duration-200"
            >
              Sign In
            </button>
            <button
              onClick={() => setCurrentView('signUp')}
              className="text-blue-600 hover:underline font-medium focus:outline-none px-3 py-1 rounded-md transition duration-200"
            >
              Sign Up
            </button>
          </>
        ) : (
          <button
            onClick={() => setCurrentView('dashboard')}
            className="text-blue-600 hover:underline font-medium focus:outline-none px-3 py-1 rounded-md transition duration-200"
          >
            Dashboard
          </button>
        )}
      </nav>

      {/* Main Content Area */}
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
        {renderView()}
      </div>
    </div>
  );
}

// Home Page Component
function HomePage({ setCurrentView, isLoggedIn }) {
  return (
    <div className="text-center space-y-6">
      <h2 className="text-4xl font-extrabold text-gray-900 leading-tight">
        Welcome to Event Manager!
      </h2>
      <p className="text-lg text-gray-700">
        Your ultimate solution for seamless event planning and management.
      </p>
      <div className="flex flex-col space-y-4 pt-4">
        {!isLoggedIn ? (
          <>
            <button
              onClick={() => setCurrentView('signIn')}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg text-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-300 shadow-md"
            >
              Sign In
            </button>
            <button
              onClick={() => setCurrentView('signUp')}
              className="w-full bg-green-600 text-white py-3 px-6 rounded-lg text-lg font-semibold hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition duration-300 shadow-md"
            >
              Sign Up
            </button>
          </>
        ) : (
          <button
            onClick={() => setCurrentView('dashboard')}
            className="w-full bg-purple-600 text-white py-3 px-6 rounded-lg text-lg font-semibold hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition duration-300 shadow-md"
          >
            Go to Dashboard
          </button>
        )}
      </div>
    </div>
  );
}


// Sign In Form Component
function SignInForm({ onAuthSuccess, setCurrentView }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Google OAuth setup
  useEffect(() => {
    // Load Google API script
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      // Initialize Google Sign-In
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: '1012610059915-plt61d82bht9hnk9j9p8ntnaf8ta4nu7.apps.googleusercontent.com', // <<-- REPLACE THIS WITH YOUR ACTUAL GOOGLE CLIENT ID
          callback: handleGoogleSignIn,
        });
        window.google.accounts.id.renderButton(
          document.getElementById('google-sign-in-button'),
          { theme: 'outline', size: 'large', text: 'signin_with', width: '360' } // Customize button
        );
      }
    };
    document.body.appendChild(script);

    return () => {
      // Clean up the script when component unmounts
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const handleGoogleSignIn = async (response) => {
    setIsLoading(true);
    setMessage('Signing in with Google...');
    try {
      // Use the imported 'api' instance for the request
      const backendResponse = await api.post('/auth/google/login/', { token: response.credential });

      // Axios automatically parses JSON, so data is directly available
      const data = backendResponse.data;

      setMessage('Google Sign-in successful!');
      onAuthSuccess(data.user, data.tokens);
    } catch (error) {
      console.error('Error during Google sign-in:', error);
      // Axios errors have a 'response' object with 'data' for server errors
      setMessage(error.response?.data?.detail || error.response?.data?.message || 'Google Sign-in failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('Signing in...');

    try {
      // Use the imported 'api' instance for the request
      const backendResponse = await api.post('/auth/login/', { email, password });

      // Axios automatically parses JSON, so data is directly available
      const data = backendResponse.data;

      setMessage('Sign-in successful!');
      onAuthSuccess(data.user, data.tokens);
    } catch (error) {
      console.error('Error during sign-in:', error);
      // Axios errors have a 'response' object with 'data' for server errors
      const data = error.response?.data;
      if (data) {
        if (data.email) setMessage(`Email: ${data.email[0]}`);
        else if (data.password) setMessage(`Password: ${data.password[0]}`);
        else if (data.non_field_errors) setMessage(data.non_field_errors[0]);
        else setMessage(data.detail || 'Sign-in failed. Please check your credentials.');
      } else {
        setMessage('An error occurred during sign-in.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-center text-gray-800">Sign In</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email"
            id="email"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
            placeholder="your@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading}
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input
            type="password"
            id="password"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
            placeholder="********"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isLoading}
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isLoading}
        >
          {isLoading ? 'Signing In...' : 'Sign In'}
        </button>
      </form>
      {message && <p className="text-center text-sm mt-4 text-gray-600">{message}</p>}

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-white px-2 text-gray-500">Or</span>
        </div>
      </div>

      <div id="google-sign-in-button" className="flex justify-center"></div>

      <p className="text-center text-sm text-gray-600 mt-4">
        Don't have an account?{' '}
        <button
          onClick={() => setCurrentView('signUp')}
          className="text-blue-600 hover:underline focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isLoading}
        >
          Sign Up
        </button>
      </p>
      <button
        onClick={() => setCurrentView('home')}
        className="text-gray-600 hover:underline text-sm mt-2 focus:outline-none"
        disabled={isLoading}
      >
        Back to Home
      </button>
    </div>
  );
}

// Sign Up Form Component
function SignUpForm({ onAuthSuccess, setCurrentView }) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('user'); // Default role
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Google OAuth setup (similar to Sign In, but for registration)
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: '1012610059915-plt61d82bht9hnk9j9p8ntnaf8ta4nu7.apps.googleusercontent.com', // <<-- REPLACE THIS WITH YOUR ACTUAL GOOGLE CLIENT ID
          callback: handleGoogleSignUp,
        });
        window.google.accounts.id.renderButton(
          document.getElementById('google-sign-up-button'),
          { theme: 'outline', size: 'large', text: 'signup_with', width: '360' } // Customize button
        );
      }
    };
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const handleGoogleSignUp = async (response) => {
    setIsLoading(true);
    setMessage('Signing up with Google...');
    try {
      // Use the imported 'api' instance for the request
      const backendResponse = await api.post('/auth/google/register/', { token: response.credential, role: 'user' });

      // Axios automatically parses JSON, so data is directly available
      const data = backendResponse.data;

      setMessage('Google Sign-up successful!');
      onAuthSuccess(data.user, data.tokens);
    } catch (error) {
      console.error('Error during Google sign-up:', error);
      // Axios errors have a 'response' object with 'data' for server errors
      setMessage(error.response?.data?.detail || error.response?.data?.message || 'Google Sign-up failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setMessage('Passwords do not match.');
      return;
    }
    setIsLoading(true);
    setMessage('Signing up...');

    try {
      // Use the imported 'api' instance for the request
      // Note: Axios will automatically set Content-Type to application/json
      const backendResponse = await api.post('/auth/register/', { firstName, lastName, email, password, role, confirm_password: confirmPassword });

      // Axios automatically parses JSON, so data is directly available
      const data = backendResponse.data;

      if (backendResponse.status === 201) { // Check for 201 Created status for successful registration
        setMessage('Sign-up successful! Redirecting to dashboard...');
        onAuthSuccess(data.user, data.tokens);
      } else {
        // This block might not be reached if Axios throws an error for non-2xx status
        setMessage(data.detail || 'Sign-up failed. Please try again.');
      }
    } catch (error) {
      console.error('Error during sign-up:', error);
      // Axios errors have a 'response' object with 'data' for server errors
      const data = error.response?.data;
      if (data) {
        if (data.email) setMessage(`Email: ${data.email[0]}`);
        else if (data.password) setMessage(`Password: ${data.password[0]}`);
        else if (data.confirm_password) setMessage(`Confirm Password: ${data.confirm_password[0]}`);
        else if (data.non_field_errors) setMessage(data.non_field_errors[0]);
        else setMessage(data.detail || 'Sign-up failed. Please try again.');
      } else {
        setMessage('An error occurred during sign-up.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-center text-gray-800">Sign Up</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
          <input
            type="text"
            id="firstName"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
            placeholder="John"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
            disabled={isLoading}
          />
        </div>
        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
          <input
            type="text"
            id="lastName"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
            placeholder="Doe"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
            disabled={isLoading}
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email"
            id="email"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
            placeholder="your@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading}
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input
            type="password"
            id="password"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
            placeholder="********"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isLoading}
          />
        </div>
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
          <input
            type="password"
            id="confirmPassword"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
            placeholder="********"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            disabled={isLoading}
          />
        </div>
        <div>
          <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">Role</label>
          <select
            id="role"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            disabled={isLoading}
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <button
          type="submit"
          className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition duration-200 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isLoading}
        >
          {isLoading ? 'Signing Up...' : 'Sign Up'}
        </button>
      </form>
      {message && <p className="text-center text-sm mt-4 text-gray-600">{message}</p>}

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-white px-2 text-gray-500">Or</span>
        </div>
      </div>

      <div id="google-sign-up-button" className="flex justify-center"></div>

      <p className="text-center text-sm text-gray-600 mt-4">
        Already have an account?{' '}
        <button
          onClick={() => setCurrentView('signIn')}
          className="text-blue-600 hover:underline focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isLoading}
        >
          Sign In
        </button>
      </p>
      <button
        onClick={() => setCurrentView('home')}
        className="text-gray-600 hover:underline text-sm mt-2 focus:outline-none"
        disabled={isLoading}
      >
        Back to Home
      </button>
    </div>
  );
}

// Dashboard Component (simple placeholder)
function Dashboard({ userRole, userEmail, onLogout }) {
  return (
    <div className="text-center space-y-4">
      <h2 className="text-3xl font-bold text-gray-800">Welcome!</h2>
      <p className="text-lg text-gray-700">You are logged in as <span className="font-semibold capitalize">{userRole}</span>.</p>
      <p className="text-md text-gray-600">Email: {userEmail}</p>
      <p className="text-md text-gray-600">Your role grants you access to specific features.</p>
      {userRole === 'admin' && (
        <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-blue-800 font-medium">Admin Dashboard Access</p>
          <p className="text-blue-700 text-sm">You can manage users, events, and settings.</p>
        </div>
      )}
      {userRole === 'user' && (
        <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
          <p className="text-green-800 font-medium">User Dashboard Access</p>
          <p className="text-green-700 text-sm">You can view and register for events.</p>
        </div>
      )}
      <button
        onClick={onLogout}
        className="mt-6 w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition duration-200 shadow-md"
      >
        Logout
      </button>
    </div>
  );
}

export default App;
