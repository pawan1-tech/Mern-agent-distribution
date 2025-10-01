import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { UserPlus, Eye, EyeOff } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

const schema = yup.object({
  name: yup.string().required('Name is required').min(2, 'Name must be at least 2 characters'),
  email: yup.string().email('Invalid email').required('Email is required'),
  countryCode: yup.string().required('Country code is required').matches(/^\+[1-9]\d{1,3}$/, 'Invalid country code'),
  mobile: yup.string().required('Mobile number is required').matches(/^\d{7,15}$/, 'Mobile must be 7-15 digits'),
  password: yup.string().required('Password is required').min(6, 'Password must be at least 6 characters')
});

const AgentForm = ({ onCreated }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      countryCode: '+91'
    }
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const response = await api.post('/agents', data);
      toast.success('Agent created successfully!');
      reset();
      onCreated?.(response.data.data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create agent');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <div className="flex items-center mb-6">
        <UserPlus className="h-6 w-6 text-blue-600 mr-2" />
        <h3 className="text-lg font-semibold text-gray-900">Add New Agent</h3>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              className="input-field"
              placeholder="Enter agent name"
              {...register('name')}
            />
            {errors.name && <p className="error-message">{errors.name.message}</p>}
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="input-field"
              placeholder="Enter email address"
              {...register('email')}
            />
            {errors.email && <p className="error-message">{errors.email.message}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="form-group">
            <label className="form-label">Country Code</label>
            <input
              type="text"
              className="input-field"
              placeholder="+91"
              {...register('countryCode')}
            />
            {errors.countryCode && <p className="error-message">{errors.countryCode.message}</p>}
          </div>

          <div className="form-group">
            <label className="form-label">Mobile Number</label>
            <input
              type="text"
              className="input-field"
              placeholder="Enter mobile number"
              {...register('mobile')}
            />
            {errors.mobile && <p className="error-message">{errors.mobile.message}</p>}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Password</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              className="input-field pr-10"
              placeholder="Enter password"
              {...register('password')}
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5 text-gray-400" />
              ) : (
                <Eye className="h-5 w-5 text-gray-400" />
              )}
            </button>
          </div>
          {errors.password && <p className="error-message">{errors.password.message}</p>}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full flex items-center justify-center"
        >
          {loading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          ) : (
            <>
              <UserPlus className="h-5 w-5 mr-2" />
              Create Agent
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default AgentForm;
