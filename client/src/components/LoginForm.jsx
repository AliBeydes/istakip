'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { useSimpleTranslation } from '@/hooks/useSimpleTranslation';
import SimpleLanguageToggle from '@/components/SimpleLanguageToggle';

export default function LoginForm() {
  const canvasRef = useRef(null);
  const [isClient, setIsClient] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });

  // Neural Network Canvas Animation
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);
    
    // Particles
    const particles = [];
    const particleCount = 80;
    const connectionDistance = 150;
    
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        radius: Math.random() * 1.5 + 0.5,
        color: Math.random() > 0.5 ? 'rgba(100, 80, 200, 0.6)' : 'rgba(80, 120, 200, 0.6)'
      });
    }
    
    let animationId;
    const animate = () => {
      ctx.fillStyle = 'rgba(10, 10, 15, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Update and draw particles
      particles.forEach((p, i) => {
        p.x += p.vx;
        p.y += p.vy;
        
        // Wrap around
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
        
        // Draw particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
        
        // Draw connections
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          if (dist < connectionDistance) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(100, 100, 180, ${0.15 * (1 - dist / connectionDistance)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      });
      
      animationId = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationId);
    };
  }, []);
  const [errors, setErrors] = useState({});
  const [rememberMe, setRememberMe] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [logoUrl, setLogoUrl] = useState(null);
  
  const { login, isLoading, error } = useAuthStore();
  const router = useRouter();
  const { t } = useSimpleTranslation();

  // Load saved credentials and logo
  useEffect(() => {
    const savedEmail = localStorage.getItem('rememberedEmail');
    const savedPassword = localStorage.getItem('rememberedPassword');
    const savedRememberMe = localStorage.getItem('rememberMe') === 'true';
    
    if (savedRememberMe && savedEmail) {
      setFormData({ email: savedEmail, password: savedPassword ? atob(savedPassword) : '' });
      setRememberMe(true);
    }

    // Load logo from localStorage
    const savedSettings = localStorage.getItem('admin-settings');
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);
      setLogoUrl(parsed.logoUrl || null);
    }
  }, []);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.password) newErrors.password = 'Password is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const result = await login(formData.email, formData.password);
    
    if (result.success) {
      if (rememberMe) {
        localStorage.setItem('rememberedEmail', formData.email);
        localStorage.setItem('rememberedPassword', btoa(formData.password));
        localStorage.setItem('rememberMe', 'true');
      } else {
        localStorage.removeItem('rememberedEmail');
        localStorage.removeItem('rememberedPassword');
        localStorage.removeItem('rememberMe');
      }
      router.push('/dashboard');
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden">
      {/* Agudo.net Style Neural Network Background */}
      <canvas 
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ 
          background: 'linear-gradient(135deg, #050508 0%, #0a0a12 50%, #080810 100%)',
        }}
      />

      {/* Ultra Luxury Login Card */}
      <div className="relative z-10 w-full max-w-5xl mx-4 lg:mx-auto">
        <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden">
          <div className="flex flex-col lg:flex-row">
            {/* Left Side - Branding */}
            <div className="w-full lg:w-1/2 p-12 lg:p-16 bg-gradient-to-br from-purple-600/20 to-blue-600/20 relative">
              {/* Logo */}
              <div className="mb-8">
                {logoUrl ? (
                  <img src={logoUrl} alt="Logo" className="w-24 h-24 object-contain drop-shadow-2xl" />
                ) : (
                  <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-2xl border border-white/20">
                    <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Welcome Text */}
              <div className="space-y-6">
                <h1 className="text-5xl lg:text-6xl font-black text-white leading-tight">
                  {t('app.name')}
                </h1>
                <p className="text-xl text-white/80 leading-relaxed font-light">
                  {t('login.heroDescription')}
                </p>
              </div>

              {/* Features */}
              <div className="mt-12 space-y-4">
                {[
                  { icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', text: t('premium.features') },
                  { icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z', text: t('premium.secure') },
                  { icon: 'M13 10V3L4 14h7v7l9-11h-7z', text: t('premium.fast') }
                ].map((item, index) => (
                  <div key={index} className="flex items-center space-x-4 text-white/90">
                    <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center backdrop-blur-sm">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                      </svg>
                    </div>
                    <span className="font-medium">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="w-full lg:w-1/2 p-12 lg:p-16 bg-slate-900/50 backdrop-blur-3xl">
              {/* Language Toggle */}
              <div className="flex justify-end mb-8">
                <SimpleLanguageToggle />
              </div>

              {/* Welcome Section */}
              <div className="mb-12">
                <h2 className="text-4xl font-black text-white mb-3">{t('login.welcome')}</h2>
                <p className="text-gray-400 text-lg">{t('login.subtitle')}</p>
              </div>

              {/* Premium Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email Field */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Email</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                      </svg>
                    </div>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      onFocus={() => setFocusedField('email')}
                      onBlur={() => setFocusedField(null)}
                      className={`w-full pl-12 pr-4 py-4 bg-white/5 border ${focusedField === 'email' ? 'border-purple-500 bg-white/10' : 'border-white/10'} rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all duration-300 backdrop-blur-sm`}
                      placeholder="Enter your email"
                    />
                  </div>
                  {errors.email && <p className="text-red-400 text-sm">{errors.email}</p>}
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <input
                      type={isPasswordVisible ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      onFocus={() => setFocusedField('password')}
                      onBlur={() => setFocusedField(null)}
                      className={`w-full pl-12 pr-12 py-4 bg-white/5 border ${focusedField === 'password' ? 'border-purple-500 bg-white/10' : 'border-white/10'} rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all duration-300 backdrop-blur-sm`}
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center"
                    >
                      <svg className="w-5 h-5 text-gray-400 hover:text-gray-300 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        {isPasswordVisible ? (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        ) : (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        )}
                      </svg>
                    </button>
                  </div>
                  {errors.password && <p className="text-red-400 text-sm">{errors.password}</p>}
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 bg-white/10 border-white/20 rounded text-purple-500 focus:ring-purple-500/20 focus:ring-2"
                    />
                    <span className="text-sm text-gray-300">{t('login.rememberMe')}</span>
                  </label>
                  
                  <a href="/forgot-password" className="text-sm text-purple-400 hover:text-purple-300 transition-colors">
                    {t('login.forgotPassword')}
                  </a>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                    <p className="text-red-400 text-sm">{error}</p>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-4 px-6 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl shadow-purple-500/25"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>{t('login.loggingIn')}...</span>
                    </div>
                  ) : (
                    t('auth.signin')
                  )}
                </button>
              </form>

              {/* Sign Up Link */}
              <div className="mt-8 text-center">
                <p className="text-gray-400">
                  {t('login.noAccount')}{' '}
                  <a href="/register" className="text-purple-400 hover:text-purple-300 font-semibold transition-colors">
                    {t('login.signUp')}
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
