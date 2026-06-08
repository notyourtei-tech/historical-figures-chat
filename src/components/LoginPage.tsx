import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User as UserIcon, ShieldCheck, Lock, ArrowRight, Loader2, CheckCircle2, ArrowLeft, UserPlus, Info } from 'lucide-react';
import { User } from '../types';

interface Props {
  onLogin: (user: User) => void;
  onBack: () => void;
}

type AuthMode = 'login' | 'register';

const LoginPage: React.FC<Props> = ({ onLogin, onBack }) => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 模拟“单系统注册限制”逻辑
  const isAlreadyRegistered = () => {
    return localStorage.getItem('app_fingerprint_registered') === 'true';
  };

  const handleAuth = () => {
    if (!username || !password) {
      setError('用户名和密码不能为空');
      return;
    }

    setLoading(true);
    setError('');

    setTimeout(() => {
      if (mode === 'register') {
        // 注册逻辑
        if (isAlreadyRegistered()) {
          setError('检测到该系统已注册过账号，请直接登录');
          setLoading(false);
          return;
        }

        const users = JSON.parse(localStorage.getItem('app_users_db') || '[]');
        if (users.find((u: any) => u.username === username)) {
          setError('该用户名已被占用');
          setLoading(false);
          return;
        }

        const newUser = { id: Date.now().toString(), username, password };
        users.push(newUser);
        localStorage.setItem('app_users_db', JSON.stringify(users));
        localStorage.setItem('app_fingerprint_registered', 'true'); // 标记该设备已注册
        
        onLogin(newUser);
      } else {
        // 登录逻辑
        const users = JSON.parse(localStorage.getItem('app_users_db') || '[]');
        const user = users.find((u: any) => u.username === username && u.password === password);
        
        if (user) {
          onLogin(user);
        } else {
          setError('用户名或密码错误');
          setLoading(false);
        }
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fafafa] dark:bg-[#050505] p-6 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[120px] rounded-full" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-[440px] w-full premium-card border border-white/40 dark:border-white/5 relative z-10"
      >
        <div className="p-10">
          <header className="flex items-center justify-between mb-8">
            <button 
              onClick={onBack}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-slate-500"
            >
              <ArrowLeft size={20} />
            </button>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Secure Access</span>
          </header>

          <div className="text-center mb-8">
            <motion.div 
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="w-16 h-16 bg-gradient-to-tr from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl"
            >
              {mode === 'login' ? <UserIcon className="text-white dark:text-slate-900" size={32} /> : <UserPlus className="text-white dark:text-slate-900" size={32} />}
            </motion.div>
            <h2 className="text-3xl font-black text-gradient tracking-tight">{mode === 'login' ? '欢迎回来' : '开启旅程'}</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm font-medium">与历史伟人建立深度灵魂链接</p>
          </div>

          <div className="space-y-6">
            {/* Username */}
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">用户名</label>
              <div className="relative group">
                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="请输入您的尊姓大名"
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-100/50 dark:bg-slate-800/50 border-2 border-transparent focus:border-blue-500/20 focus:bg-white dark:focus:bg-slate-800 rounded-2xl outline-none transition-all dark:text-white font-semibold text-base"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">密码</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="请输入密码"
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-100/50 dark:bg-slate-800/50 border-2 border-transparent focus:border-blue-500/20 focus:bg-white dark:focus:bg-slate-800 rounded-2xl outline-none transition-all dark:text-white font-semibold text-base"
                />
              </div>
            </div>

            {mode === 'register' && (
              <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 rounded-xl">
                <Info size={14} className="text-amber-500 mt-0.5 flex-shrink-0" />
                <p className="text-[10px] text-amber-700 dark:text-amber-400 font-medium leading-normal">
                  安全提示：本系统限制每台设备/系统仅能注册一个账号，请妥善保存您的信息。
                </p>
              </div>
            )}

            {error && <p className="text-red-500 text-xs font-bold text-center">{error}</p>}

            <button
              onClick={handleAuth}
              disabled={loading}
              className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-base flex items-center justify-center gap-3 transition-all shadow-lg hover:scale-[1.02] active:scale-95 disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : <>{mode === 'login' ? '立即登录' : '立即注册'} <ArrowRight size={20} strokeWidth={3} /></>}
            </button>

            <div className="text-center">
              <button 
                onClick={() => {
                  setMode(mode === 'login' ? 'register' : 'login');
                  setError('');
                }}
                className="text-xs font-bold text-slate-400 hover:text-blue-500 transition-colors"
              >
                {mode === 'login' ? '还没有账号？去注册一个' : '已有账号？直接登录'}
              </button>
            </div>
          </div>
        </div>

        <div className="p-6 bg-slate-50/50 dark:bg-slate-800/20 border-t border-slate-200/50 dark:border-white/5 text-center">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center justify-center gap-2">
            <CheckCircle2 size={12} className="text-blue-500" /> 登录后将自动同步并保存您的聊天记忆
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
