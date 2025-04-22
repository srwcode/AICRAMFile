import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Mail, Lock, ArrowRight, ShieldCheck } from 'lucide-react';
import config from '../../config';

interface FormData {
  email: string;
  password: string;
}

const SignIn = () => {
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState<boolean>(false);

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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${config.API_URL}/users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (response.ok) {
        if (data.token) {
          localStorage.setItem('token', data.token);

          const responseType = await fetch(`${config.API_URL}/auth/verify`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'token': data.token || ''
            }
          });

          const dataType = await responseType.json();
    
          if (responseType.ok) {
            if (dataType.user_type === 'USER') {
              navigate('/member');
            } else if (dataType.user_type === 'ADMIN') {
              navigate('/admin');
            }
          }
        } else {
          toast.error('Invalid email or password.');
        }
      } else {
        toast.error('Invalid email or password.');
      }
    } catch (err) {
      toast.error('An error occurred during login');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const togglePasswordView = () => setShowPassword(!showPassword);

  const inputClass = "w-full text-white bg-gray-800 border border-gray-700 px-3 py-3 rounded-md focus:outline-none focus:ring-0 focus:ring-white focus:border-white transition duration-150";

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-gray-900">
      <div className="flex-1 flex flex-col justify-center p-6 sm:p-12 lg:px-16">
        <div className="max-w-lg w-full mx-auto">

          <Link to="/">
            <div className="font-mono tracking-tight flex items-center mb-12">
              <span className="flex items-center gap-2 font-extrabold text-white text-4xl">AI<span className="text-gray-400"> | </span>CR</span>
              <ShieldCheck strokeWidth={3} size={34} className="text-white mb-0.5 ml-0.5"/>
              <span className="font-extrabold text-white text-4xl">M</span>
            </div>
          </Link>

          <div className="text-start mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">Welcome Back</h2>
            <p className="text-gray-400">Sign in to your AI-CRAM account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300" htmlFor="email">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="name@example.com"
                  className={`${inputClass} pl-10`}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="space-y-2 pb-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-300" htmlFor="password">
                  Password
                </label>
                <Link to="/auth/forgot-password" className="text-sm font-medium text-gray-400 hover:text-gray-500">
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  className={`${inputClass} pl-10`}
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

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-white hover:bg-gray-200 text-gray-900 font-medium py-3 px-4 rounded-md shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing In...' : (
                <>
                  Sign In <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>

            <div className="text-center">
              <p className="text-sm text-gray-400">
                Don't have an account?{' '}
                <Link to="/auth/signup" className="font-medium text-white hover:text-gray-300">
                  Sign Up
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignIn;