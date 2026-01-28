
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const success = await login(email, password);
      if (success) {
        // Redirect everyone to dashboard
        navigate('/dashboard');
      } else {
        setError('Invalid credentials. Try student@dhriti.com, teacher@dhriti.com or admin@dhriti.com');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-ocean-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="bg-ocean-600 px-8 py-10 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-32 h-32 bg-white opacity-10 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-24 h-24 bg-white opacity-10 rounded-full translate-x-1/2 translate-y-1/2"></div>
          
          <h2 className="text-3xl font-extrabold text-white mb-2">Welcome Back</h2>
          <p className="text-ocean-100 font-medium">Login to access your dashboard</p>
        </div>

        {/* Form */}
        <div className="p-8 md:p-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-3 rounded-lg flex items-center">
                <AlertCircle className="w-4 h-4 mr-2" /> {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 bg-white text-slate-900 focus:ring-2 focus:ring-ocean-500 focus:border-transparent outline-none transition-all font-medium placeholder:text-gray-400"
                  placeholder="student@dhriti.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 bg-white text-slate-900 focus:ring-2 focus:ring-ocean-500 focus:border-transparent outline-none transition-all font-medium placeholder:text-gray-400"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full py-4 text-lg shadow-lg shadow-ocean-200 hover:shadow-xl mt-4"
              disabled={loading}
            >
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Sign In'}
            </Button>

            <div className="text-center text-sm text-gray-500 mt-6">
              Forgot password? <a href="#" className="text-ocean-600 font-bold hover:underline">Contact Admin</a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
