import React, { useState } from 'react';
import { User, Mail, Lock, UserCheck, GraduationCap, Building2, AlertCircle, CheckCircle } from 'lucide-react';

interface RegisterFormData {
  firstname: string;
  middlename: string;
  lastname: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: string;
}

interface RegisterErrors {
  firstname?: string;
  middlename?: string;
  lastname?: string;
  username?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  role?: string;
  general?: string;
}

const Register: React.FC = () => {
  const [formData, setFormData] = useState<RegisterFormData>({
    firstname: '',
    middlename: '',
    lastname: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: ''
  });
  const [errors, setErrors] = useState<RegisterErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const roles = [
    { id: 'student', label: 'Student', icon: GraduationCap },
    { id: 'lecturer', label: 'University Lecturer', icon: UserCheck },
    { id: 'supervisor', label: 'Industry Supervisor', icon: Building2 }
  ];

  const validateForm = (): boolean => {
    const newErrors: RegisterErrors = {};

    // Required field validations
    if (!formData.firstname.trim()) {
      newErrors.firstname = 'First name is required';
    } else if (formData.firstname.trim().length < 2) {
      newErrors.firstname = 'First name must be at least 2 characters';
    }

    if (!formData.lastname.trim()) {
      newErrors.lastname = 'Last name is required';
    } else if (formData.lastname.trim().length < 2) {
      newErrors.lastname = 'Last name must be at least 2 characters';
    }

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.trim().length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username = 'Username can only contain letters, numbers, and underscores';
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Role validation
    if (!formData.role) {
      newErrors.role = 'Please select a role';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name as keyof RegisterErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const handleRoleSelect = (roleId: string) => {
    setFormData(prev => ({
      ...prev,
      role: roleId
    }));
    
    if (errors.role) {
      setErrors(prev => ({
        ...prev,
        role: undefined
      }));
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      // Prepare data for Django backend
      const submitData = {
        first_name: formData.firstname,
        middle_name: formData.middlename,
        last_name: formData.lastname,
        username: formData.username,
        email: formData.email,
        password: formData.password,
        role: formData.role
      };

      // API call to Django backend
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/users/register/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Important: Include cookies
        body: JSON.stringify(submitData)
      });

      const data = await response.json();

      if (response.ok) {
        // Handle successful registration
        console.log('Registration successful:', data);
        setIsSuccess(true);
        // Tokens are now stored in HTTP-only cookies automatically
        // Optionally redirect after success
        setTimeout(() => {
          window.location.href = '/auth/login';
        }, 2000);
      } else {
        // Handle registration errors
        if (data.detail) {
          setErrors({ general: data.detail });
        } else if (data.non_field_errors) {
          setErrors({ general: data.non_field_errors[0] });
        } else {
          // Map Django field errors to form errors
          const mappedErrors: RegisterErrors = {};
          if (data.first_name) mappedErrors.firstname = data.first_name[0];
          if (data.last_name) mappedErrors.lastname = data.last_name[0];
          if (data.username) mappedErrors.username = data.username[0];
          if (data.email) mappedErrors.email = data.email[0];
          if (data.password) mappedErrors.password = data.password[0];
          if (data.role) mappedErrors.role = data.role[0];
          setErrors(mappedErrors);
        }
      }
    } catch (error) {
      console.error('Registration error:', error);
      setErrors({ general: 'Network error. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-slate-800 rounded-2xl shadow-2xl p-8 border border-slate-700 text-center">
            <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Registration Successful!</h2>
            <p className="text-slate-400 mb-4">Your account has been created successfully.</p>
            <p className="text-sm text-slate-500">Redirecting to login page...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
          <p className="text-slate-400">Join our platform today</p>
        </div>

        {/* Register Card */}
        <div className="bg-slate-800 rounded-2xl shadow-2xl p-8 border border-slate-700">
          {/* General Error */}
          {errors.general && (
            <div className="mb-4 p-3 bg-red-900/50 border border-red-600 rounded-lg flex items-center">
              <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
              <span className="text-red-400 text-sm">{errors.general}</span>
            </div>
          )}

          {/* Role Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-300 mb-3">
              Select your role
            </label>
            <div className="grid grid-cols-1 gap-3">
              {roles.map((role) => {
                const IconComponent = role.icon;
                return (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => handleRoleSelect(role.id)}
                    disabled={isLoading}
                    className={`flex items-center p-3 rounded-lg border-2 transition-all duration-200 ${
                      formData.role === role.id
                        ? 'border-blue-600 bg-blue-600/10 text-blue-400'
                        : 'border-slate-600 hover:border-slate-500 text-slate-300 hover:text-slate-200'
                    } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <IconComponent className="w-5 h-5 mr-3" />
                    <span className="font-medium">{role.label}</span>
                  </button>
                );
              })}
            </div>
            {errors.role && (
              <p className="mt-1 text-sm text-red-400">{errors.role}</p>
            )}
          </div>

          {/* Form */}
          <div className="space-y-4">
            {/* First Name */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                First Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="text"
                  name="firstname"
                  value={formData.firstname}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-3 bg-slate-700 border rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all duration-200 ${
                    errors.firstname ? 'border-red-500' : 'border-slate-600'
                  }`}
                  placeholder="Enter your first name"
                  disabled={isLoading}
                />
              </div>
              {errors.firstname && (
                <p className="mt-1 text-sm text-red-400">{errors.firstname}</p>
              )}
            </div>

            {/* Middle Name */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Middle Name <span className="text-slate-500">(Optional)</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="text"
                  name="middlename"
                  value={formData.middlename}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all duration-200"
                  placeholder="Enter your middle name"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Last Name */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Last Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="text"
                  name="lastname"
                  value={formData.lastname}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-3 bg-slate-700 border rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all duration-200 ${
                    errors.lastname ? 'border-red-500' : 'border-slate-600'
                  }`}
                  placeholder="Enter your last name"
                  disabled={isLoading}
                />
              </div>
              {errors.lastname && (
                <p className="mt-1 text-sm text-red-400">{errors.lastname}</p>
              )}
            </div>

            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-3 bg-slate-700 border rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all duration-200 ${
                    errors.username ? 'border-red-500' : 'border-slate-600'
                  }`}
                  placeholder="Enter your username"
                  disabled={isLoading}
                />
              </div>
              {errors.username && (
                <p className="mt-1 text-sm text-red-400">{errors.username}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-3 bg-slate-700 border rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all duration-200 ${
                    errors.email ? 'border-red-500' : 'border-slate-600'
                  }`}
                  placeholder="Enter your email"
                  disabled={isLoading}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-400">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-3 bg-slate-700 border rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all duration-200 ${
                    errors.password ? 'border-red-500' : 'border-slate-600'
                  }`}
                  placeholder="Enter your password"
                  disabled={isLoading}
                />
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-400">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-3 bg-slate-700 border rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all duration-200 ${
                    errors.confirmPassword ? 'border-red-500' : 'border-slate-600'
                  }`}
                  placeholder="Confirm your password"
                  disabled={isLoading}
                />
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-400">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={isLoading || !formData.role}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-all duration-200 transform hover:scale-[1.02] disabled:hover:scale-100 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 focus:ring-offset-slate-800"
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </button>
          </div>

          {/* Navigation Links */}
          <div className="mt-6 text-center">
            <p className="text-slate-400">
              Already have an account?{' '}
              <a
                href="/auth/login"
                className="text-blue-400 hover:text-blue-300 font-medium transition-colors duration-200"
              >
                Sign In
              </a>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-slate-500 text-sm">
          <p>By continuing, you agree to our Terms of Service and Privacy Policy</p>
        </div>
      </div>
    </div>
  );
};

export default Register;