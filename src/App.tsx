import { useState } from 'react';
import MBTITest from './components/MBTITest';
import MBTISelector from './components/MBTISelector';
import CelebrityMatch from './components/CelebrityMatch';
import ChatRoom from './components/ChatRoom';
import LoginPage from './components/LoginPage';
import { Celebrity, MBTIType, User } from './types';
import { BookOpen, Sparkles, UserSearch, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type View = 'welcome' | 'test' | 'selector' | 'match' | 'chat' | 'login';

function App() {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('chat_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [view, setView] = useState<View>('welcome');
  const [userMBTI, setUserMBTI] = useState<MBTIType | null>(() => {
    return localStorage.getItem('chat_user_mbti') as MBTIType | null;
  });
  const [selectedCelebrity, setSelectedCelebrity] = useState<Celebrity | null>(null);

  const handleTestComplete = (result: MBTIType) => {
    setUserMBTI(result);
    localStorage.setItem('chat_user_mbti', result);
    setView('match');
  };

  const handleSelectCelebrity = (celebrity: Celebrity) => {
    setSelectedCelebrity(celebrity);
    setView('chat');
  };

  const handleLogin = (userData: User) => {
    setUser(userData);
    localStorage.setItem('chat_user', JSON.stringify(userData));
    setView('welcome');
  };

  const handleLogout = () => {
    if (window.confirm('确定要退出登录吗？')) {
      setUser(null);
      localStorage.removeItem('chat_user');
      setView('welcome');
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#050505] transition-colors duration-500 selection:bg-blue-500/20">
      <header className="py-8 px-8 sticky top-0 z-50 glass border-b border-slate-200/50 dark:border-white/5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-4 group cursor-pointer"
            onClick={() => setView('welcome')}
          >
            <div className="p-3 bg-slate-900 dark:bg-white rounded-2xl shadow-xl shadow-black/10 transition-transform group-hover:scale-110">
              <BookOpen className="text-white dark:text-slate-900" size={24} />
            </div>
            <h1 className="text-2xl font-black tracking-tighter text-gradient">
              古今哲友录
            </h1>
          </motion.div>
          <div className="flex items-center gap-6">
            {user ? (
              <>
                <div className="hidden md:flex flex-col items-end">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Authenticated User</span>
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                    {user.username}
                  </span>
                </div>
                <button 
                  onClick={handleLogout}
                  className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-2xl transition-all"
                  title="退出登录"
                >
                  <LogOut size={22} />
                </button>
              </>
            ) : (
              <button 
                onClick={() => setView('login')}
                className="px-6 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold text-sm hover:scale-105 transition-all shadow-lg shadow-black/5"
              >
                登录 / 注册
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12">
        <AnimatePresence mode="wait">
          {view === 'login' && (
            <motion.div
              key="login"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <LoginPage onLogin={handleLogin} onBack={() => setView('welcome')} />
            </motion.div>
          )}

          {view === 'welcome' && (
            <motion.div
              key="welcome"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-4xl mx-auto text-center py-20 relative"
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[150%] h-full bg-blue-500/5 blur-[120px] -z-10 rounded-full" />
              
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 rounded-full shadow-sm border border-slate-100 dark:border-white/5 mb-8"
              >
                <Sparkles size={16} className="text-blue-500" />
                <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Next Generation AI Experience</span>
              </motion.div>

              <h2 className="text-6xl md:text-8xl font-black mb-8 text-gradient leading-[1.1] tracking-tighter">
                跨越时空，<br />与伟大的灵魂对话
              </h2>
              <p className="text-xl text-slate-500 dark:text-slate-400 mb-14 max-w-2xl mx-auto font-medium leading-relaxed">
                通过深度 MBTI 性格画像，开启一段跨越千年的思想共鸣。向孔子请教仁义，与尼采探讨意志，听苏格拉底的终极追问。
              </p>
              
              <div className="flex flex-col sm:flex-row gap-6 justify-center max-w-2xl mx-auto">
                <button
                  onClick={() => setView('test')}
                  className="flex-1 px-10 py-6 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-[2rem] font-black text-xl shadow-2xl shadow-black/20 hover:shadow-blue-500/20 hover:-translate-y-1 transition-all flex items-center justify-center gap-3 group"
                >
                  <Sparkles size={24} className="group-hover:animate-spin-slow" /> 开始性格测试
                </button>
                <button
                  onClick={() => setView('selector')}
                  className="flex-1 px-10 py-6 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-[2rem] font-black text-xl border-2 border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center justify-center gap-3"
                >
                  <UserSearch size={24} /> 手动选择 MBTI
                </button>
              </div>

              <div className="mt-24 pt-12 border-t border-slate-200/50 dark:border-white/5">
                <p className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] mb-10">Featured Personalities</p>
                <div className="flex justify-center gap-12 grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all duration-700">
                  {['孔子', '苏格拉底', '尼采', '武则天', '李白'].map(name => (
                    <div key={name} className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 rounded-[1.5rem] bg-slate-200 dark:bg-slate-800 shadow-inner"></div>
                      <span className="text-[10px] font-black tracking-widest uppercase">{name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {view === 'test' && (
            <motion.div
              key="test"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <MBTITest onComplete={handleTestComplete} onSwitchToManual={() => setView('selector')} />
            </motion.div>
          )}

          {view === 'selector' && (
            <motion.div
              key="selector"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <MBTISelector onSelect={handleTestComplete} onBack={() => setView('welcome')} />
            </motion.div>
          )}

          {view === 'match' && (
            <motion.div
              key="match"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <CelebrityMatch mbti={userMBTI || 'INTJ'} onSelect={handleSelectCelebrity} />
            </motion.div>
          )}

          {view === 'chat' && selectedCelebrity && (
            <motion.div
              key="chat"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <ChatRoom 
                celebrity={selectedCelebrity} 
                userMBTI={userMBTI || '探索者'} 
                onBack={() => setView('match')} 
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="py-8 text-center text-slate-400 text-sm">
        <p>© 2026 古今哲友录 · 让思想跨越千年</p>
      </footer>
    </div>
  );
}

export default App;
