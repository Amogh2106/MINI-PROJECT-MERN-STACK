import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import Input from '../components/ui/Input.jsx';
import Button from '../components/ui/Button.jsx';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [serverError, setServerError] = useState('');
  const sessionNotice = location.state?.message;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data) => {
    try {
      setServerError('');
      await login(data);
      navigate('/dashboard');
    } catch (err) {
      setServerError(err.message || 'Failed to login');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-sm bg-white border border-gray-200 rounded p-6 shadow-sm">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center text-white font-bold text-xs">
              C
            </div>
            <h1 className="text-lg font-bold text-gray-900 tracking-tight">CRM MVP</h1>
          </div>
          <p className="text-xs text-gray-500">Sign in to your sales workspace</p>
        </div>

        {sessionNotice && !serverError && (
          <div className="mb-4 p-2.5 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded">
            {sessionNotice}
          </div>
        )}

        {serverError && (
          <div className="mb-4 p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            id="email"
            type="email"
            label="Email"
            placeholder="name@company.com"
            error={errors.email?.message}
            {...register('email')}
          />

          <Input
            id="password"
            type="password"
            label="Password"
            placeholder="••••••••"
            error={errors.password?.message}
            {...register('password')}
          />

          <Button type="submit" variant="primary" fullWidth disabled={isSubmitting}>
            {isSubmitting ? 'Signing in...' : 'Sign in'}
          </Button>
        </form>

        <div className="mt-6 pt-4 border-t border-gray-200 text-center text-xs text-gray-500">
          Don't have an account?{' '}
          <Link to="/register" className="text-blue-600 font-semibold hover:underline">
            Register here
          </Link>
          <div className="mt-3 p-2 bg-gray-50 rounded border border-gray-200 text-[11px] text-gray-500 text-left">
            <span className="font-semibold text-gray-700 block mb-1">Demo Accounts:</span>
            <div>Admin: <code className="text-blue-600">admin@crm.local</code> / <code className="text-gray-700">password123</code></div>
            <div>Sales: <code className="text-blue-600">sales@crm.local</code> / <code className="text-gray-700">password123</code></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
