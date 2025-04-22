import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import config from '../../config';

interface UserData {
  username: string;
  email: string;
  user_type: string;
  status: number;
  first_name: string;
  last_name: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

const SignUp = () => {
  const [user, setUser] = useState<UserData>({
    username: '',
    email: '',
    user_type: 'USER',
    status: 1,
    first_name: '',
    last_name: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);

  useEffect(() => {
    const authToken = localStorage.getItem('token');
    if (authToken) {
      fetch(`${config.API_URL}/auth/verify`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'token': authToken || ''
        }
      }).then((response) => response.json())
        .then((data) => {
        if (data.user_type === 'USER') {
            navigate('/member');
        } else if (data.user_type === 'ADMIN') {
            navigate('/admin');
        } 
      })
      .catch((error) => {
        console.error('Error fetching user type:', error);
      });
    }
  }, [navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUser({
      ...user,
      [name]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const usernameRegex = /^[a-zA-Z0-9]+$/;

    if (!user.username) {
      toast.error('Username is required');
      setLoading(false);
      return;
    } else if (user.username.length < 5 || user.username.length > 50) {
      toast.error('Username must be 5-50 characters');
      setLoading(false);
      return;
    } else if (!usernameRegex.test(user.username)) {
      toast.error('Username can only contain letters (a-z, A-Z) and numbers (0-9)');
      setLoading(false);
      return;
    }

    if (!user.email) {
      toast.error('Email is required');
      setLoading(false);
      return;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email)) {
      toast.error('Invalid email format');
      setLoading(false);
      return;
    }

    const phoneRegex = /^\+?[0-9]{3,}$/;

    if (!user.phone) {
      toast.error('Phone number is required');
      setLoading(false);
      return;
    } else if (!phoneRegex.test(user.phone)) {
      toast.error('Invalid phone number format');
      setLoading(false);
      return;
    }

    if (!user.first_name) {
      toast.error('First name is required');
      setLoading(false);
      return;
    } else if (user.first_name.length < 2 || user.first_name.length > 100) {
      toast.error('First name must be 2-100 characters');
      setLoading(false);
      return;
    }

    if (!user.last_name) {
      toast.error('Last name is required');
      setLoading(false);
      return;
    } else if (user.last_name.length < 2 || user.last_name.length > 100) {
      toast.error('Last name must be 2-100 characters');
      setLoading(false);
      return;
    }

    if (!user.password) {
      toast.error('Password is required');
      setLoading(false);
      return;
    }
    else if (user.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    if (user.password !== user.confirmPassword) {
      toast.error('Passwords do not match');
      setLoading(false);
      return;
    }

    const userData = {
      username: user.username,
      email: user.email,
      password: user.password,
      user_type: user.user_type,
      first_name: user.first_name,
      last_name: user.last_name,
      phone: user.phone,
    };

    try {
      const response = await fetch(`${config.API_URL}/users/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Account created successfully');
        navigate('/auth/signin');
      } else {
        if (data.error === 'email_error') {
          toast.error('Email already exists');
        } else if (data.error === 'username_error') {
          toast.error('Username already exists');
        } else {
          toast.error(data.error || 'Something went wrong!');
        }
      }
      
    } catch (err) {
      toast.error('An error occurred. Please try again.');
    }

    setLoading(false);
  };

  const togglePasswordView = () => setShowPassword(!showPassword);
  const toggleConfirmPasswordView = () => setShowConfirmPassword(!showConfirmPassword);
  
  const inputClass = "w-full text-white bg-gray-800 border border-gray-700 px-3 py-3 rounded-md focus:outline-none focus:ring-0 focus:ring-white focus:border-white transition duration-150";

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-gray-900">
      <div className="flex-1 flex flex-col justify-center p-6 sm:p-12 lg:px-16">
        <div className="max-w-lg w-full mx-auto py-10">

          <Link to="/">
            <div className="font-mono tracking-tight flex items-center mb-12">
              <span className="flex items-center gap-2 font-extrabold text-white text-4xl">AI<span className="text-gray-400"> | </span>CR</span>
              <ShieldCheck strokeWidth={3} size={34} className="text-white mb-0.5 ml-0.5"/>
              <span className="font-extrabold text-white text-4xl">M</span>
            </div>
          </Link>

          <div className="text-start mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">Create Account</h2>
            <p className="text-gray-400">Join AI-CRAM today</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-5">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300" htmlFor="username">
                  Username
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  placeholder="johndoe"
                  className={`${inputClass}`}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300" htmlFor="email">
                  Email
                </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    placeholder="name@example.com"
                    className={`${inputClass}`}
                    onChange={handleChange}
                  />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-5">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300" htmlFor="first_name">
                  First Name
                </label>
                <input
                  id="first_name"
                  name="first_name"
                  type="text"
                  required
                  placeholder="John"
                  className={`${inputClass}`}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300" htmlFor="last_name">
                  Last Name
                </label>
                <input
                  id="last_name"
                  name="last_name"
                  type="text"
                  required
                  placeholder="Doe"
                  className={`${inputClass}`}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300" htmlFor="phone">
                Phone Number
              </label>
              <input
                id="phone"
                name="phone"
                type="text"
                required
                placeholder="+66xxxxxxxxx"
                className={`${inputClass}`}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  className={`${inputClass}`}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  onClick={togglePasswordView}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                      <line x1="1" y1="1" x2="23" y2="23"></line>
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300" htmlFor="confirmPassword">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  className={`${inputClass}`}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  onClick={toggleConfirmPasswordView}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showConfirmPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                      <line x1="1" y1="1" x2="23" y2="23"></line>
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="py-2">
              <p className="text-sm text-gray-400">
                By creating an account you agree with our{' '}
                <a href="/terms" target="_blank" className="text-white hover:text-gray-300">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="/privacy" target="_blank" className="text-white hover:text-gray-300">
                  Privacy Policy
                </a>
                .
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-white hover:bg-gray-200 text-gray-900 font-medium py-3 px-4 rounded-md shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
            >
              {loading ? 'Creating Account...' : (
                <>
                  Create Account <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>

            <div className="text-center">
              <p className="text-sm text-gray-400">
                Already have an account?{' '}
                <Link to="/auth/signin" className="font-medium text-white hover:text-gray-300">
                  Sign In
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignUp;