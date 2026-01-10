
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Eye, EyeOff, GraduationCap, Github, Mail, Lock, 
  ChevronRight, ArrowRight 
} from 'lucide-react';
import { Button, cn } from './ui/Buttons';

interface LoginPageProps {
  onLogin: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate auth delay
    setTimeout(() => {
      onLogin();
      setIsLoading(false);
      navigate('/');
    }, 1000);
  };

  return (
    <div className="min-h-screen flex bg-[#FDF8F3] overflow-hidden">
      {/* Left Side: Aesthetic Brand Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#8A2B0E] relative items-center justify-center p-12 overflow-hidden">
        {/* Abstract Background Elements */}
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-[#E35336] opacity-20 blur-3xl animate-pulse"></div>
        <div className="absolute bottom-[-5%] right-[-5%] w-[40%] h-[40%] rounded-full bg-[#9988A1] opacity-10 blur-3xl"></div>
        
        {/* Decorative Grid Pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>

        <div className="relative z-10 max-w-lg text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-3xl shadow-2xl mb-8 transform -rotate-6 transition-transform hover:rotate-0 duration-500">
            <GraduationCap size={44} className="text-[#E35336]" />
          </div>
          <h1 className="text-5xl font-extrabold text-white mb-6 leading-tight">
            T.A.<span className="text-[#E35336]">I</span>
          </h1>
          <p className="text-xl text-[#FDF8F3]/70 font-medium leading-relaxed mb-12">
            Teacher Assisted Intelligence. <br />
            Empowering educators with high-performance multi-agent grading.
          </p>
          
          <div className="grid grid-cols-2 gap-4 text-left">
            <div className="p-4 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm">
              <div className="text-[#E35336] font-black text-2xl mb-1">98%</div>
              <div className="text-[#FDF8F3]/50 text-[10px] uppercase font-bold tracking-widest">OCR Accuracy</div>
            </div>
            <div className="p-4 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm">
              <div className="text-[#E35336] font-black text-2xl mb-1">10x</div>
              <div className="text-[#FDF8F3]/50 text-[10px] uppercase font-bold tracking-widest">Grading Speed</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side: Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 md:p-16">
        <div className="max-w-md w-full space-y-10 animate-in fade-in slide-in-from-right-8 duration-700">
          <div className="text-center lg:text-left">
            <div className="lg:hidden inline-flex items-center justify-center w-12 h-12 bg-[#E35336] rounded-xl mb-6 shadow-lg shadow-[#E35336]/20">
              <GraduationCap size={24} className="text-white" />
            </div>
            <h2 className="text-3xl font-extrabold text-[#4A3731] tracking-tight">Welcome back, Educator</h2>
            <p className="mt-3 text-[#9988A1] font-medium">Please enter your credentials to access the grading hub.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="relative group">
                <label className="text-[10px] font-black text-[#9988A1] uppercase tracking-widest ml-1 mb-1.5 block">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9988A1]/40 group-focus-within:text-[#E35336] transition-colors" size={18} />
                  <input
                    required
                    type="email"
                    className="w-full bg-white border border-[#9988A1]/20 rounded-xl py-3.5 pl-12 pr-4 text-sm text-[#4A3731] placeholder:text-[#9988A1]/30 focus:border-[#E35336]/30 focus:ring-4 focus:ring-[#E35336]/5 outline-none transition-all shadow-sm"
                    placeholder="name@institution.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="relative group">
                <div className="flex justify-between items-center ml-1 mb-1.5">
                  <label className="text-[10px] font-black text-[#9988A1] uppercase tracking-widest">Password</label>
                  <a href="#" className="text-[10px] font-bold text-[#E35336] hover:underline uppercase tracking-widest">Forgot?</a>
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9988A1]/40 group-focus-within:text-[#E35336] transition-colors" size={18} />
                  <input
                    required
                    type={showPassword ? "text" : "password"}
                    className="w-full bg-white border border-[#9988A1]/20 rounded-xl py-3.5 pl-12 pr-12 text-sm text-[#4A3731] placeholder:text-[#9988A1]/30 focus:border-[#E35336]/30 focus:ring-4 focus:ring-[#E35336]/5 outline-none transition-all shadow-sm"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9988A1]/40 hover:text-[#4A3731] transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 ml-1">
              <input 
                type="checkbox" 
                id="remember" 
                className="w-4 h-4 rounded border-[#9988A1]/20 text-[#E35336] focus:ring-[#E35336]/20 transition-all cursor-pointer"
              />
              <label htmlFor="remember" className="text-xs font-bold text-[#9988A1] uppercase tracking-widest cursor-pointer select-none">Keep me signed in</label>
            </div>

            <Button 
              type="submit" 
              className="w-full py-4 text-sm font-black uppercase tracking-widest shadow-xl shadow-[#E35336]/20 hover:shadow-2xl hover:shadow-[#E35336]/30 transition-all"
              isLoading={isLoading}
            >
              Log In to Dashboard
              {!isLoading && <ArrowRight size={18} className="ml-2" />}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#9988A1]/10"></div>
            </div>
            <div className="relative flex justify-center text-[10px] uppercase font-black tracking-[0.2em]">
              <span className="bg-[#FDF8F3] px-4 text-[#9988A1]/60">Or continue with</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button className="flex items-center justify-center gap-3 px-4 py-3 bg-white border border-[#9988A1]/20 rounded-xl hover:bg-slate-50 transition-all shadow-sm text-sm font-bold text-[#4A3731]">
              <img src="https://www.svgrepo.com/show/355037/google.svg" className="w-4 h-4" alt="Google" />
              Google
            </button>
            <button className="flex items-center justify-center gap-3 px-4 py-3 bg-white border border-[#9988A1]/20 rounded-xl hover:bg-slate-50 transition-all shadow-sm text-sm font-bold text-[#4A3731]">
              <Github size={18} />
              GitHub
            </button>
          </div>

          <p className="text-center text-xs font-medium text-[#9988A1]">
            Don't have an institutional account?{' '}
            <a href="#" className="text-[#E35336] font-bold hover:underline">Contact Administrator</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
