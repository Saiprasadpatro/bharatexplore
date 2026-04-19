import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, useLocation, useParams, BrowserRouter } from 'react-router-dom';
import { Search, MapPin, Heart, User, LogOut, Menu, X, ChevronRight, Star, Calendar, Info, Mail, Linkedin, MessageCircle, Plus, Trash2, Edit, Save, PlusCircle, LayoutDashboard, Settings, FileText, Image as ImageIcon, Users, BarChart3, Globe, PenTool } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import axios from 'axios';
import { useAuthStore } from './store/authStore';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { GoogleGenAI } from "@google/genai";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Components ---

const DestinationSlider = () => {
  const destinations = [
    { name: 'Havelock Island', state: 'Andaman', image: 'https://images.unsplash.com/photo-1589909202802-8f4aadce1849?q=80&w=1935&auto=format&fit=crop', desc: 'Pristine white sands and turquoise waters.' },
    { name: 'Leh Ladakh', state: 'Ladakh', image: 'https://images.unsplash.com/photo-1581791534721-e599df4417f7?q=80&w=2070&auto=format&fit=crop', desc: 'The land of high passes and ancient monasteries.' },
    { name: 'Munnar', state: 'Kerala', image: 'https://images.unsplash.com/photo-1523712999610-f77fbcfc3843?q=80&w=2070&auto=format&fit=crop', desc: 'Sprawling tea estates and misty mountains.' },
    { name: 'Jaipur', state: 'Rajasthan', image: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?q=80&w=2070&auto=format&fit=crop', desc: 'The historic Pink City of royal heritage.' },
    { name: 'Agatti', state: 'Lakshadweep', image: 'https://images.unsplash.com/photo-1544550581-5f7ceaf7f992?q=80&w=2000&auto=format&fit=crop', desc: 'Exotic coral reefs and crystal lagoons.' },
    { name: 'Rishikesh', state: 'Uttarakhand', image: 'https://images.unsplash.com/photo-1584126307049-701544997405?q=80&w=2070&auto=format&fit=crop', desc: 'The yoga capital on the banks of Ganges.' },
    { name: 'Tawang', state: 'Arunachal', image: 'https://images.unsplash.com/photo-1570654639102-bdd95eeece7a?q=80&w=2070&auto=format&fit=crop', desc: 'Majestic monasteries in the rising sun.' },
    { name: 'Varanasi', state: 'Uttar Pradesh', image: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?q=80&w=2076&auto=format&fit=crop', desc: 'The spiritual heart of ancient India.' },
    { name: 'Shillong', state: 'Meghalaya', image: 'https://images.unsplash.com/photo-1505144808419-1957a94ca61e?q=80&w=1970&auto=format&fit=crop', desc: 'The Scotland of the East with rolling hills.' },
    { name: 'Puri', state: 'Odisha', image: 'https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?q=80&w=1974&auto=format&fit=crop', desc: 'Sacred temples and golden beaches.' },
  ];

  // Duplicate for infinite scroll effect
  const extendedDestinations = [...destinations, ...destinations];

  return (
    <div className="py-20 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight">Popular Destinations</h2>
        <p className="text-gray-500 mt-4 text-lg">Explore the diverse landscapes from the Himalayas to the Indian Islands.</p>
      </div>
      
      <div className="relative flex overflow-hidden">
        <motion.div 
          animate={{ x: ["0%", "-50%"] }}
          transition={{ 
            duration: 40, 
            ease: "linear", 
            repeat: Infinity 
          }}
          className="flex space-x-8 whitespace-nowrap"
        >
          {extendedDestinations.map((dest, i) => (
            <div 
              key={i} 
              className="w-[350px] flex-shrink-0 group cursor-pointer"
            >
              <div className="relative h-[450px] rounded-[2.5rem] overflow-hidden mb-6 shadow-lg">
                <img 
                  src={dest.image} 
                  alt={dest.name} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80" />
                <div className="absolute bottom-8 left-8 right-8">
                  <span className="text-emerald-400 text-xs font-bold uppercase tracking-widest mb-2 block">{dest.state}</span>
                  <h3 className="text-2xl font-bold text-white mb-2">{dest.name}</h3>
                  <p className="text-gray-300 text-sm whitespace-normal leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {dest.desc}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!user) {
        navigate('/login');
      }
      setIsLoading(false);
    }, 200);

    return () => clearTimeout(timer);
  }, [user, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen pt-32 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;
  return <>{children}</>;
};

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || user.is_admin !== 1) {
      navigate('/');
    }
  }, [user, navigate]);

  if (!user || user.is_admin !== 1) return null;
  return <>{children}</>;
};

const Navbar = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [siteName, setSiteName] = useState('BharatExplore');

  useEffect(() => {
    axios.get('/api/settings').then(res => {
      if (res.data.site_name) setSiteName(res.data.site_name);
    });
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
              <MapPin className="text-white w-5 h-5" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              {siteName}
            </span>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-600 hover:text-emerald-600 font-medium transition-colors">Home</Link>
            {user ? (
              <>
                <Link to="/explore" className="text-gray-600 hover:text-emerald-600 font-medium transition-colors">Explore</Link>
                <Link to="/states" className="text-gray-600 hover:text-emerald-600 font-medium transition-colors">States</Link>
                <Link to="/dashboard" className="text-gray-600 hover:text-emerald-600 font-medium transition-colors">Dashboard</Link>
                {user.is_admin === 1 && (
                  <Link to="/admin" className="text-emerald-600 hover:text-emerald-700 font-bold flex items-center space-x-1">
                    <Settings className="w-4 h-4" />
                    <span>Admin</span>
                  </Link>
                )}
                <div className="flex items-center space-x-4 pl-4 border-l border-gray-200">
                  <span className="text-sm text-gray-500">Hi, {user.name}</span>
                  <button onClick={logout} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/login" className="text-gray-600 hover:text-emerald-600 font-medium">Login</Link>
                <Link to="/register" className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-emerald-700 transition-colors shadow-sm">
                  Register
                </Link>
              </div>
            )}
          </div>

          <button className="md:hidden p-2" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden bg-white border-b border-gray-100 px-4 py-6 space-y-4"
          >
            <Link to="/" className="block text-gray-600 font-medium" onClick={() => setIsMenuOpen(false)}>Home</Link>
            {user ? (
              <>
                <Link to="/explore" className="block text-gray-600 font-medium" onClick={() => setIsMenuOpen(false)}>Explore</Link>
                <Link to="/states" className="block text-gray-600 font-medium" onClick={() => setIsMenuOpen(false)}>States</Link>
                <Link to="/dashboard" className="block text-gray-600 font-medium" onClick={() => setIsMenuOpen(false)}>Dashboard</Link>
                {user.is_admin === 1 && (
                  <Link to="/admin" className="block text-emerald-600 font-bold" onClick={() => setIsMenuOpen(false)}>Admin Panel</Link>
                )}
                <button onClick={() => { logout(); setIsMenuOpen(false); }} className="block text-red-500 font-medium">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" className="block text-gray-600 font-medium" onClick={() => setIsMenuOpen(false)}>Login</Link>
                <Link to="/register" className="block text-emerald-600 font-medium" onClick={() => setIsMenuOpen(false)}>Register</Link>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const Footer = () => (
  <footer className="bg-gray-50 border-t border-gray-100 py-12">
    <div className="max-w-7xl mx-auto px-4 text-center">
      <div className="flex items-center justify-center space-x-2 mb-4">
        <MapPin className="text-emerald-600 w-6 h-6" />
        <span className="text-xl font-bold text-gray-900">BharatExplore</span>
      </div>
      <p className="text-gray-500 max-w-md mx-auto mb-6">
        Discover the hidden gems and vibrant culture of India. Your ultimate companion for exploring the soul of incredible India.
      </p>
      
      <div className="flex flex-col items-center space-y-3 mb-8">
        <div className="text-sm font-semibold text-gray-600 uppercase tracking-wider">Developer Contact</div>
        <div className="flex items-center space-x-6">
          <a 
            href="mailto:saiprasadpatro389@gmail.com" 
            className="flex items-center space-x-2 text-gray-500 hover:text-emerald-600 transition-colors"
            title="Email Developer"
          >
            <Mail className="w-4 h-4" />
            <span className="text-sm">saiprasadpatro389@gmail.com</span>
          </a>
          <a 
            href="https://www.linkedin.com/in/sai-prasad-patro-5654c83/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center space-x-2 text-gray-500 hover:text-emerald-600 transition-colors"
            title="LinkedIn Profile"
          >
            <Linkedin className="w-4 h-4" />
            <span className="text-sm">LinkedIn</span>
          </a>
          <a 
            href="https://wa.me/918018308687" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center space-x-2 text-gray-500 hover:text-emerald-600 transition-colors"
            title="WhatsApp Developer"
          >
            <MessageCircle className="w-4 h-4" />
            <span className="text-sm">WhatsApp</span>
          </a>
        </div>
      </div>

      <div className="text-sm text-gray-400">
        © 2026 BharatExplore. All rights reserved.
      </div>
    </div>
  </footer>
);

const SearchBar = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchResults = async () => {
      if (query.length < 2) {
        setResults([]);
        return;
      }
      try {
        const res = await axios.get(`/api/search?q=${query}`);
        setResults(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    const timer = setTimeout(fetchResults, 300);
    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-600 transition-colors" />
        <input
          type="text"
          placeholder="Search for states or places (e.g. Rajasthan, Jaipur)"
          className="w-full pl-12 pr-4 py-4 bg-white rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-sm"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      
      <AnimatePresence>
        {results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl border border-gray-100 shadow-xl z-40 overflow-hidden"
          >
            {results.map((item) => (
              <button
                key={`${item.type}-${item.id}`}
                onClick={() => {
                  navigate(item.type === 'state' ? `/state/${item.id}` : `/place/${item.id}`);
                  setQuery('');
                }}
                className="w-full flex items-center p-4 hover:bg-gray-50 transition-colors text-left border-b border-gray-50 last:border-0"
              >
                <div className="w-10 h-10 rounded-lg overflow-hidden mr-4 flex-shrink-0">
                  <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">{item.name}</div>
                  <div className="text-xs text-gray-500 uppercase tracking-wider">{item.type}</div>
                </div>
                <ChevronRight className="ml-auto w-4 h-4 text-gray-300" />
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- Pages ---

const LandingPage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [settings, setSettings] = useState<any>({
    hero_title: 'INCREDIBLE India',
    hero_subtitle: 'Beyond the destinations, it\'s a feeling. A journey through ancient wisdom, vibrant colors, and the timeless spirit of a nation.',
    hero_image: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?q=80&w=2071&auto=format&fit=crop'
  });

  useEffect(() => {
    axios.get('/api/settings').then(res => {
      setSettings((prev: any) => ({...prev, ...res.data}));
    });
  }, []);

  const handleExploreClick = () => {
    if (user) {
      navigate('/explore');
    } else {
      navigate('/register');
    }
  };

  return (
    <div className="bg-white selection:bg-emerald-100 selection:text-emerald-900">
      {/* Hero Section - Editorial / Immersive */}
      <section className="relative min-h-screen flex items-center overflow-hidden bg-[#050505]">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 z-0">
          <motion.div 
            initial={{ scale: 1.1, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.6 }}
            transition={{ duration: 2, ease: "easeOut" }}
            className="w-full h-full"
          >
            <img 
              src={settings.hero_image} 
              alt="Hero Background" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </motion.div>
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/20 to-black" />
          
          {/* Atmospheric Blurs */}
          <div className="absolute top-1/4 -left-20 w-96 h-96 bg-emerald-600/20 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-teal-600/20 rounded-full blur-[120px] animate-pulse delay-1000" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
          <div className="max-w-5xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="flex items-center space-x-3 mb-8">
                <span className="h-px w-12 bg-emerald-500/50" />
                <span className="text-emerald-400 text-xs font-bold uppercase tracking-[0.3em]">
                  The Soul of the Subcontinent
                </span>
              </div>
              
              <h1 className="text-7xl md:text-9xl lg:text-[10rem] font-bold text-white leading-[0.85] tracking-tighter mb-10">
                {settings.hero_title.split(' ')[0]} <br />
                <span className="font-serif italic font-normal text-emerald-400">
                  {settings.hero_title.split(' ').slice(1).join(' ')}
                </span>
              </h1>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-end">
                <p className="text-xl md:text-2xl text-gray-300 font-light leading-relaxed">
                  {settings.hero_subtitle}
                </p>
                
                <div className="flex flex-col sm:flex-row gap-6">
                  <button 
                    onClick={handleExploreClick}
                    className="px-10 py-5 bg-emerald-600 text-white rounded-full font-bold text-lg hover:bg-emerald-500 transition-all shadow-2xl shadow-emerald-900/40 flex items-center justify-center group relative overflow-hidden"
                  >
                    <span className="relative z-10 flex items-center">
                      {user ? 'Go to Explore' : 'Start Your Journey'}
                      <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-teal-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                  
                  {!user && (
                    <button 
                      onClick={() => navigate('/register')}
                      className="px-10 py-5 bg-white/5 backdrop-blur-xl text-white border border-white/10 rounded-full font-bold text-lg hover:bg-white/10 transition-all flex items-center justify-center"
                    >
                      Join the Community
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center space-y-2"
        >
          <span className="text-[10px] uppercase tracking-[0.4em] text-gray-500 font-bold">Scroll</span>
          <div className="w-px h-12 bg-gradient-to-b from-emerald-500 to-transparent" />
        </motion.div>
      </section>

      {/* Cultural Mosaic - Bento Grid Style */}
      <section className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 auto-rows-[300px]">
            <div className="lg:col-span-8 lg:row-span-2 relative rounded-[3rem] overflow-hidden group">
              <img 
                src="https://images.unsplash.com/photo-1514222134-b57cbb8ce073?q=80&w=1936&auto=format&fit=crop" 
                alt="Varanasi" 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              <div className="absolute bottom-10 left-10 right-10">
                <span className="text-emerald-400 text-xs font-bold uppercase tracking-widest mb-2 block">Spiritual Heritage</span>
                <h3 className="text-4xl font-bold text-white mb-4">The Eternal Ghats of Varanasi</h3>
                <p className="text-gray-300 max-w-lg">Experience the spiritual pulse of India where ancient rituals meet the timeless flow of the Ganges.</p>
              </div>
            </div>

            <div className="lg:col-span-4 relative rounded-[3rem] overflow-hidden group">
              <img 
                src="https://images.unsplash.com/photo-1598891001556-3732a3659945?q=80&w=2070&auto=format&fit=crop" 
                alt="Rajasthan" 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
              <div className="absolute inset-0 flex items-center justify-center">
                <h3 className="text-2xl font-bold text-white tracking-widest uppercase">Royal Rajasthan</h3>
              </div>
            </div>

            <div className="lg:col-span-4 relative rounded-[3rem] overflow-hidden group">
              <img 
                src="https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?q=80&w=1932&auto=format&fit=crop" 
                alt="Kerala" 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
              <div className="absolute inset-0 flex items-center justify-center">
                <h3 className="text-2xl font-bold text-white tracking-widest uppercase">Serene Kerala</h3>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Destinations Slider */}
      <DestinationSlider />

      {/* Features - Technical / Hardware Style accents */}
      <section className="py-32 bg-[#0a0a0a] text-white overflow-hidden relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
            <div>
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-widest mb-8">
                <div className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
                <span>System Capabilities</span>
              </div>
              <h2 className="text-5xl md:text-7xl font-bold mb-12 leading-[0.9] tracking-tighter">
                MODERN TOOLS <br />
                <span className="text-gray-500">FOR ANCIENT</span> <br />
                WONDERS
              </h2>
              
              <div className="space-y-12">
                {[
                  {
                    icon: <Search className="w-6 h-6" />,
                    title: "Intelligent Discovery",
                    desc: "Our proprietary search engine indexes thousands of locations with real-time cultural context."
                  },
                  {
                    icon: <Star className="w-6 h-6" />,
                    title: "Gemini AI Core",
                    desc: "Personalized recommendations that learn your travel style and suggest the perfect stay."
                  },
                  {
                    icon: <MapPin className="w-6 h-6" />,
                    title: "Precision Mapping",
                    desc: "Detailed coordinates and historical overlays for every major landmark in the subcontinent."
                  }
                ].map((feature, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-start space-x-6 group"
                  >
                    <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-emerald-600 group-hover:border-emerald-500 transition-all duration-500">
                      <div className="text-emerald-400 group-hover:text-white transition-colors">
                        {feature.icon}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-2 tracking-tight">{feature.title}</h3>
                      <p className="text-gray-500 leading-relaxed max-w-md">{feature.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="aspect-square rounded-[4rem] bg-gradient-to-br from-emerald-600/20 to-teal-600/20 border border-white/5 p-8 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
                <div className="w-full h-full rounded-[3rem] overflow-hidden border border-white/10 shadow-2xl">
                  <img 
                    src="https://images.unsplash.com/photo-1548013146-72479768bada?q=80&w=2076&auto=format&fit=crop" 
                    alt="India Architecture" 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                
                {/* Decorative UI Elements */}
                <div className="absolute top-12 right-12 p-4 backdrop-blur-md bg-black/40 border border-white/10 rounded-2xl">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                    <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest">Live Analysis</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - Luxury / Atmospheric */}
      <section className="py-32 px-4 bg-white overflow-hidden relative">
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div 
            whileHover={{ scale: 1.005 }}
            className="bg-[#050505] rounded-[5rem] p-16 md:p-32 text-center text-white relative overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)]"
          >
            {/* Background Atmosphere */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-600/10 rounded-full blur-[150px] -mr-64 -mt-64" />
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-teal-600/10 rounded-full blur-[150px] -ml-64 -mb-64" />
            
            <div className="relative z-10">
              <div className="font-serif italic text-emerald-400 text-2xl mb-8">Your Indian Odyssey Awaits</div>
              <h2 className="text-6xl md:text-8xl font-bold mb-12 leading-[0.85] tracking-tighter">
                THE JOURNEY <br />
                <span className="text-gray-500">BEGINS WITH</span> <br />
                A SINGLE STEP
              </h2>
              
              <div className="flex flex-col sm:flex-row justify-center gap-8">
                <button 
                  onClick={() => navigate('/register')}
                  className="px-14 py-6 bg-white text-black rounded-full font-bold text-xl hover:bg-emerald-400 transition-all shadow-2xl shadow-white/5"
                >
                  Create Account
                </button>
                <button 
                  onClick={() => navigate('/login')}
                  className="px-14 py-6 bg-transparent text-white border border-white/20 rounded-full font-bold text-xl hover:bg-white/5 transition-all"
                >
                  Sign In
                </button>
              </div>
              
              <div className="mt-16 pt-16 border-t border-white/5 flex flex-wrap justify-center gap-12 opacity-40 grayscale">
                <span className="text-xs font-bold uppercase tracking-[0.4em]">Heritage</span>
                <span className="text-xs font-bold uppercase tracking-[0.4em]">Culture</span>
                <span className="text-xs font-bold uppercase tracking-[0.4em]">Adventure</span>
                <span className="text-xs font-bold uppercase tracking-[0.4em]">Spirit</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

const ExplorePage = () => {
  const [states, setStates] = useState<any[]>([]);

  useEffect(() => {
    axios.get('/api/states').then(res => setStates(res.data));
  }, []);

  return (
    <div className="pt-16">
      {/* Hero Section */}
      <section className="relative h-[80vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1524492412937-b28074a5d7da?q=80&w=2071&auto=format&fit=crop" 
            alt="India" 
            className="w-full h-full object-cover brightness-50"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="relative z-10 text-center px-4 max-w-4xl">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight"
          >
            Explore the Heart of <span className="text-emerald-400">India</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-200 mb-12 max-w-2xl mx-auto"
          >
            From the majestic Himalayas to the serene backwaters of Kerala, discover the diverse beauty of the Indian subcontinent.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <SearchBar />
          </motion.div>
        </div>
      </section>

      {/* Featured States */}
      <section className="py-24 max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Popular States</h2>
            <p className="text-gray-500">Discover the unique culture and heritage of Indian states.</p>
          </div>
          <Link to="/states" className="text-emerald-600 font-semibold flex items-center hover:underline">
            View All <ChevronRight className="w-4 h-4 ml-1" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {states.map((state) => (
            <motion.div
              key={state.id}
              whileHover={{ y: -10 }}
              className="group relative h-96 rounded-3xl overflow-hidden cursor-pointer shadow-lg"
              onClick={() => window.location.href = `/state/${state.id}`}
            >
              <img src={state.image_url} alt={state.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 p-8">
                <h3 className="text-2xl font-bold text-white mb-2">{state.name}</h3>
                <p className="text-gray-300 text-sm line-clamp-2 mb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  {state.description}
                </p>
                <div className="flex items-center text-emerald-400 font-medium">
                  Explore Now <ChevronRight className="w-4 h-4 ml-1" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
};

const StatePage = () => {
  const { id } = useParams() as any;
  const [state, setState] = useState<any>(null);

  useEffect(() => {
    axios.get(`/api/states/${id}`).then(res => setState(res.data));
  }, [id]);

  if (!state) return <div className="pt-32 text-center">Loading...</div>;

  return (
    <div className="pt-16">
      <div className="relative h-[50vh]">
        <img src={state.image_url} alt={state.name} className="w-full h-full object-cover brightness-75" />
        <div className="absolute inset-0 flex items-center justify-center">
          <h1 className="text-6xl font-bold text-white">{state.name}</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-16 grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2">
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6">About {state.name}</h2>
            <p className="text-gray-600 text-lg leading-relaxed">{state.description}</p>
          </section>

          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-8">Top Destinations</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {state.places.map((place: any) => (
                <Link 
                  key={place.id} 
                  to={`/place/${place.id}`}
                  className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow group"
                >
                  <div className="h-48 overflow-hidden">
                    <img src={place.image_url} alt={place.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-2">{place.name}</h3>
                    <p className="text-gray-500 text-sm line-clamp-2">{place.description}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </div>

        <div className="space-y-8">
          <div className="bg-emerald-50 p-8 rounded-3xl border border-emerald-100">
            <h3 className="text-xl font-bold text-emerald-900 mb-4 flex items-center">
              <Star className="w-5 h-5 mr-2" /> Culture & Heritage
            </h3>
            <p className="text-emerald-800/80 leading-relaxed">{state.culture}</p>
          </div>
          <div className="bg-orange-50 p-8 rounded-3xl border border-orange-100">
            <h3 className="text-xl font-bold text-orange-900 mb-4 flex items-center">
              <Info className="w-5 h-5 mr-2" /> Famous Cuisine
            </h3>
            <p className="text-orange-800/80 leading-relaxed">{state.cuisine}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const PlacePage = () => {
  const { id } = useParams() as any;
  const [place, setPlace] = useState<any>(null);
  const [hotels, setHotels] = useState<any[]>([]);
  const [loadingHotels, setLoadingHotels] = useState(false);
  const { user, token } = useAuthStore();
  const [isFavorite, setIsFavorite] = useState(false);
  const [viewMode, setViewMode] = useState<'info' | 'map'>('info');

  useEffect(() => {
    axios.get(`/api/places/${id}`).then(res => {
      setPlace(res.data);
      fetchHotels(res.data.name, res.data.latitude, res.data.longitude);
    });
    if (user && token) {
      axios.get('/api/favorites', { headers: { Authorization: `Bearer ${token}` } })
        .then(res => {
          setIsFavorite(res.data.some((f: any) => f.id === parseInt(id)));
        });
    }
  }, [id, user, token]);

  const fetchHotels = async (placeName: string, lat: number, lng: number) => {
    setLoadingHotels(true);
    try {
      // @ts-ignore - process.env might be injected by platform
      const apiKey = (window as any).process?.env?.GEMINI_API_KEY || (import.meta as any).env?.VITE_GEMINI_API_KEY || "";
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `List 5 highly-rated hotels near ${placeName} (Latitude: ${lat}, Longitude: ${lng}) in India. For each hotel, provide the name, a brief 1-sentence description, and an approximate price range in INR. Return the data as a JSON array of objects with keys: name, description, priceRange.`,
        config: {
          tools: [{ googleSearch: {} }],
          responseMimeType: "application/json"
        },
      });

      const hotelsData = JSON.parse(response.text || "[]");
      setHotels(hotelsData);
    } catch (err) {
      console.error("Gemini Hotel Fetch Error:", err);
      // Fallback
      setHotels([
        { name: "Luxury Heritage Hotel", description: "A beautiful heritage property with modern amenities.", priceRange: "₹8,000 - ₹15,000" },
        { name: "The Grand Residency", description: "Centrally located with stunning city views.", priceRange: "₹5,000 - ₹9,000" },
        { name: "Comfort Inn", description: "Affordable and clean rooms for budget travelers.", priceRange: "₹2,500 - ₹4,000" }
      ]);
    } finally {
      setLoadingHotels(false);
    }
  };

  const toggleFavorite = async () => {
    if (!user) {
      alert("Please login to save favorites");
      return;
    }
    try {
      if (isFavorite) {
        await axios.delete(`/api/favorites/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      } else {
        await axios.post('/api/favorites', { placeId: id }, { headers: { Authorization: `Bearer ${token}` } });
      }
      setIsFavorite(!isFavorite);
    } catch (err) {
      console.error(err);
    }
  };

  if (!place) return <div className="pt-32 text-center">Loading...</div>;

  return (
    <div className="pt-16">
      <div className="relative h-[60vh]">
        <img src={place.image_url} alt={place.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/30" />
        <div className="absolute bottom-0 left-0 right-0 p-12 text-white">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div>
              <div className="text-emerald-400 font-semibold mb-2 uppercase tracking-widest text-sm">{place.state_name}</div>
              <h1 className="text-5xl font-bold">{place.name}</h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-white/10 backdrop-blur-md p-1 rounded-2xl border border-white/20">
                <button 
                  onClick={() => setViewMode('info')}
                  className={cn(
                    "px-6 py-2 rounded-xl font-semibold transition-all",
                    viewMode === 'info' ? "bg-white text-emerald-600 shadow-sm" : "text-white hover:bg-white/10"
                  )}
                >
                  Details
                </button>
                <button 
                  onClick={() => setViewMode('map')}
                  className={cn(
                    "px-6 py-2 rounded-xl font-semibold transition-all",
                    viewMode === 'map' ? "bg-white text-emerald-600 shadow-sm" : "text-white hover:bg-white/10"
                  )}
                >
                  Map View
                </button>
              </div>
              <button 
                onClick={toggleFavorite}
                className={cn(
                  "p-4 rounded-2xl transition-all shadow-lg flex items-center space-x-2",
                  isFavorite ? "bg-rose-500 text-white" : "bg-white text-gray-900 hover:bg-gray-50"
                )}
              >
                <Heart className={cn("w-6 h-6", isFavorite && "fill-current")} />
                <span className="hidden sm:inline font-semibold">{isFavorite ? "Saved" : "Save"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-16">
        <AnimatePresence mode="wait">
          {viewMode === 'info' ? (
            <motion.div 
              key="info"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-12"
            >
              <div className="lg:col-span-2 space-y-12">
                <section>
                  <h2 className="text-3xl font-bold mb-6">Overview</h2>
                  <p className="text-gray-600 text-lg leading-relaxed">{place.description}</p>
                </section>

                <section>
                  <h2 className="text-3xl font-bold mb-6">History</h2>
                  <p className="text-gray-600 text-lg leading-relaxed">{place.history}</p>
                </section>

                {place.attractions.length > 0 && (
                  <section>
                    <h2 className="text-3xl font-bold mb-8">Key Attractions</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {place.attractions.map((attr: any) => (
                        <div key={attr.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                          <h3 className="text-xl font-bold mb-2">{attr.name}</h3>
                          <p className="text-gray-500 text-sm">{attr.description}</p>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* Nearby Hotels Section */}
                <section>
                  <div className="flex justify-between items-center mb-8">
                    <h2 className="text-3xl font-bold">Nearby Hotels</h2>
                    <div className="text-xs text-gray-400 uppercase tracking-widest">Powered by Gemini AI</div>
                  </div>
                  {loadingHotels ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-32 bg-gray-100 rounded-2xl animate-pulse" />
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {hotels.map((hotel, idx) => (
                        <div key={idx} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="text-lg font-bold text-gray-900">{hotel.name}</h3>
                            <span className="text-emerald-600 font-bold text-sm bg-emerald-50 px-3 py-1 rounded-full">
                              {hotel.priceRange}
                            </span>
                          </div>
                          <p className="text-gray-500 text-sm leading-relaxed">{hotel.description}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              </div>

              <div className="space-y-8">
                <div className="bg-gray-50 p-8 rounded-3xl border border-gray-100">
                  <h3 className="text-xl font-bold mb-6 flex items-center">
                    <Calendar className="w-5 h-5 mr-2 text-emerald-600" /> Best Time to Visit
                  </h3>
                  <p className="text-gray-600 text-lg">{place.best_time}</p>
                </div>

                <div className="bg-gray-50 p-8 rounded-3xl border border-gray-100">
                  <h3 className="text-xl font-bold mb-6 flex items-center">
                    <MapPin className="w-5 h-5 mr-2 text-emerald-600" /> Location
                  </h3>
                  <div className="aspect-video bg-gray-200 rounded-xl overflow-hidden relative group cursor-pointer" onClick={() => setViewMode('map')}>
                    <img 
                      src={`https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?q=80&w=2066&auto=format&fit=crop`} 
                      alt="Map Placeholder"
                      className="w-full h-full object-cover opacity-50 grayscale"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors">
                      <span className="bg-white text-gray-900 px-4 py-2 rounded-lg font-bold shadow-lg">Open Map View</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="map"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full h-[70vh] rounded-[2.5rem] overflow-hidden border-8 border-white shadow-2xl relative"
            >
              <iframe
                width="100%"
                height="100%"
                frameBorder="0"
                style={{ border: 0 }}
                src={`https://www.google.com/maps/embed/v1/place?key=YOUR_API_KEY&q=${place.latitude},${place.longitude}&zoom=14`}
                allowFullScreen
                onError={(e) => {
                  // Fallback to a simple search link if embed fails (e.g. no key)
                  console.log("Map embed failed, likely missing API key");
                }}
              ></iframe>
              {/* Fallback Overlay for Demo (since we don't have a real Google Maps API Key) */}
              <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-transparent to-black/20" />
              <div className="absolute top-6 left-6 bg-white/90 backdrop-blur-md px-6 py-4 rounded-2xl shadow-xl border border-white/50">
                <h3 className="font-bold text-gray-900">{place.name}</h3>
                <p className="text-sm text-gray-500">{place.latitude.toFixed(4)}, {place.longitude.toFixed(4)}</p>
                <a 
                  href={`https://www.google.com/maps/search/?api=1&query=${place.latitude},${place.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-block text-emerald-600 font-bold text-sm hover:underline pointer-events-auto"
                >
                  View on Google Maps ↗
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const { user, token, logout } = useAuthStore();
  const [favorites, setFavorites] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    axios.get('/api/favorites', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setFavorites(res.data))
      .catch(err => {
        console.error("Dashboard fetch error:", err);
        if (err.response?.status === 401 || err.response?.status === 403) {
          logout();
          navigate('/login');
        }
      });
  }, [user, token, navigate]);

  const removeFavorite = async (id: number) => {
    try {
      await axios.delete(`/api/favorites/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      setFavorites(favorites.filter(f => f.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="pt-32 pb-24 max-w-7xl mx-auto px-4">
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Welcome back, {user?.name}</h1>
        <p className="text-gray-500">Manage your saved destinations and plan your next adventure.</p>
      </div>

      <section>
        <h2 className="text-2xl font-bold mb-8 flex items-center">
          <Heart className="w-6 h-6 mr-2 text-rose-500 fill-current" /> My Favorites
        </h2>
        {favorites.length === 0 ? (
          <div className="bg-gray-50 rounded-3xl p-12 text-center border-2 border-dashed border-gray-200">
            <Heart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg mb-6">You haven't saved any places yet.</p>
            <Link to="/" className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-emerald-700 transition-colors">
              Start Exploring
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {favorites.map((place) => (
              <div key={place.id} className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm group">
                <div className="relative h-56">
                  <img src={place.image_url} alt={place.name} className="w-full h-full object-cover" />
                  <button 
                    onClick={() => removeFavorite(place.id)}
                    className="absolute top-4 right-4 p-2 bg-white/90 backdrop-blur rounded-full text-rose-500 hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="p-6">
                  <div className="text-emerald-600 text-xs font-bold uppercase tracking-wider mb-1">{place.state_name}</div>
                  <h3 className="text-xl font-bold mb-4">{place.name}</h3>
                  <Link 
                    to={`/place/${place.id}`}
                    className="w-full block text-center py-3 bg-gray-50 rounded-xl font-semibold text-gray-700 hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

const AuthPage = ({ type }: { type: 'login' | 'register' }) => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const payload = {
      ...formData,
      email: formData.email.trim().toLowerCase(),
      password: formData.password.trim()
    };

    try {
      const endpoint = type === 'login' ? '/api/auth/login' : '/api/auth/register';
      console.log(`Attempting ${type} at ${endpoint}...`);
      const res = await axios.post(endpoint, payload);
      console.log(`${type} successful:`, res.data);
      
      if (res.data && res.data.user && res.data.token) {
        setAuth(res.data.user, res.data.token);
        navigate('/dashboard');
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (err: any) {
      console.error(`${type} error:`, err);
      setError(err.response?.data?.error || err.message || 'Something went wrong');
    }
  };

  return (
    <div className="min-h-screen pt-32 pb-24 flex items-center justify-center px-4 bg-gray-50">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white p-8 md:p-12 rounded-[2rem] shadow-xl w-full max-w-md border border-gray-100"
      >
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-200">
            <User className="text-white w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">{type === 'login' ? 'Welcome Back' : 'Create Account'}</h1>
          <p className="text-gray-500 mt-2">{type === 'login' ? 'Enter your details to sign in' : 'Join our community of explorers'}</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm font-medium border border-red-100">
            {error}
            {error.includes('not found') && (
              <div className="mt-2">
                <Link to="/register" className="text-red-700 underline hover:text-red-800">
                  Register a new account instead?
                </Link>
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {type === 'register' && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
              <input
                type="text"
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                placeholder="John Doe"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
            <input
              type="email"
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
              placeholder="john@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
            <input
              type="password"
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>
          <button
            type="submit"
            className="w-full py-4 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 active:scale-[0.98]"
          >
            {type === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div className="mt-8 text-center text-gray-500">
          {type === 'login' ? (
            <p>Don't have an account? <Link to="/register" className="text-emerald-600 font-bold hover:underline">Register</Link></p>
          ) : (
            <p>Already have an account? <Link to="/login" className="text-emerald-600 font-bold hover:underline">Login</Link></p>
          )}
        </div>
      </motion.div>
    </div>
  );
};

const StatesPage = () => {
  const [states, setStates] = useState<any[]>([]);

  useEffect(() => {
    axios.get('/api/states').then(res => setStates(res.data));
  }, []);

  return (
    <div className="pt-32 pb-24 max-w-7xl mx-auto px-4">
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Explore All States</h1>
        <p className="text-gray-500">Discover the diverse culture and beauty across the Indian subcontinent.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {states.map((state) => (
          <motion.div
            key={state.id}
            whileHover={{ y: -5 }}
            className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all group cursor-pointer"
            onClick={() => window.location.href = `/state/${state.id}`}
          >
            <div className="h-64 overflow-hidden">
              <img src={state.image_url} alt={state.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            </div>
            <div className="p-8">
              <h3 className="text-2xl font-bold mb-3">{state.name}</h3>
              <p className="text-gray-500 text-sm line-clamp-3 mb-6">{state.description}</p>
              <div className="flex items-center text-emerald-600 font-semibold">
                Explore State <ChevronRight className="w-4 h-4 ml-1" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState<'stats' | 'states' | 'places' | 'blogs' | 'settings'>('stats');
  const [states, setStates] = useState<any[]>([]);
  const [places, setPlaces] = useState<any[]>([]);
  const [blogs, setBlogs] = useState<any[]>([]);
  const [settings, setSettings] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<any>(null);
  const [editForm, setEditForm] = useState<any>({});
  const { token } = useAuthStore();

  const fetchData = async () => {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [statesRes, placesRes, blogsRes, settingsRes, statsRes] = await Promise.all([
        axios.get('/api/states'),
        axios.get('/api/admin/all-places', { headers }),
        axios.get('/api/blogs'),
        axios.get('/api/admin/settings', { headers }),
        axios.get('/api/admin/stats', { headers })
      ]);
      setStates(statesRes.data);
      setPlaces(placesRes.data);
      setBlogs(blogsRes.data);
      setSettings(settingsRes.data);
      setStats(statsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleEdit = (item: any) => {
    setEditingId(item.id || item.key);
    setEditForm(item);
  };

  const handleAction = async (method: 'post' | 'put' | 'delete', endpoint: string, data?: any) => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      if (method === 'delete') {
        await axios.delete(endpoint, { headers });
      } else if (method === 'put') {
        await axios.put(endpoint, data, { headers });
      } else {
        await axios.post(endpoint, data, { headers });
      }
      setEditingId(null);
      fetchData();
    } catch (err) {
      alert("Error performing action");
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 border-l border-white/5">
      <div className="flex flex-col items-center space-y-4">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-400 font-medium animate-pulse">Initializing Control Center...</p>
      </div>
    </div>
  );

  const Sidebar = () => (
    <div className="w-64 bg-gray-900 h-screen fixed left-0 top-0 border-r border-white/5 flex flex-col p-6 z-[60]">
      <div className="flex items-center space-x-3 mb-12">
        <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-900/40">
          <Settings className="text-white w-6 h-6" />
        </div>
        <span className="text-xl font-black text-white tracking-tighter">ADMIN CORE</span>
      </div>

      <nav className="flex-1 space-y-2">
        <button onClick={() => setActiveTab('stats')} className={cn("w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all", activeTab === 'stats' ? "bg-emerald-600 text-white shadow-lg shadow-emerald-900/20" : "text-gray-400 hover:bg-white/5 hover:text-white")}>
          <BarChart3 className="w-5 h-5" />
          <span className="font-semibold">Dashboard</span>
        </button>
        <button onClick={() => setActiveTab('states')} className={cn("w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all", activeTab === 'states' ? "bg-emerald-600 text-white shadow-lg shadow-emerald-900/20" : "text-gray-400 hover:bg-white/5 hover:text-white")}>
          <Globe className="w-5 h-5" />
          <span className="font-semibold">States</span>
        </button>
        <button onClick={() => setActiveTab('places')} className={cn("w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all", activeTab === 'places' ? "bg-emerald-600 text-white shadow-lg shadow-emerald-900/20" : "text-gray-400 hover:bg-white/5 hover:text-white")}>
          <MapPin className="w-5 h-5" />
          <span className="font-semibold">Places</span>
        </button>
        <button onClick={() => setActiveTab('blogs')} className={cn("w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all", activeTab === 'blogs' ? "bg-emerald-600 text-white shadow-lg shadow-emerald-900/20" : "text-gray-400 hover:bg-white/5 hover:text-white")}>
          <PenTool className="w-5 h-5" />
          <span className="font-semibold">Blogs</span>
        </button>
        <button onClick={() => setActiveTab('settings')} className={cn("w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all", activeTab === 'settings' ? "bg-emerald-600 text-white shadow-lg shadow-emerald-900/20" : "text-gray-400 hover:bg-white/5 hover:text-white")}>
          <Settings className="w-5 h-5" />
          <span className="font-semibold">Settings</span>
        </button>
      </nav>

      <div className="pt-6 border-t border-white/5">
        <Link to="/" className="flex items-center space-x-3 px-4 py-3 text-gray-400 hover:text-white transition-colors">
          <ChevronRight className="w-5 h-5 rotate-180" />
          <span className="text-sm font-medium">Back to Site</span>
        </Link>
      </div>
    </div>
  );

  return (
    <div className="bg-gray-950 min-h-screen text-gray-100 flex">
      <Sidebar />
      <div className="flex-1 ml-64 p-10">
        <header className="mb-12">
          <h2 className="text-xs font-bold text-emerald-500 uppercase tracking-[0.4em] mb-3">System Control</h2>
          <h1 className="text-4xl font-black tracking-tight flex items-center space-x-4">
            <span>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</span>
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          </h1>
        </header>

        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {activeTab === 'stats' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: 'States', count: stats.states, icon: Globe, color: 'text-blue-400' },
                { label: 'Places', count: stats.places, icon: MapPin, color: 'text-emerald-400' },
                { label: 'Blogs', count: stats.blogs, icon: PenTool, color: 'text-amber-400' },
                { label: 'Users', count: stats.users, icon: Users, color: 'text-purple-400' },
              ].map((item, i) => (
                <div key={i} className="bg-white/5 border border-white/10 p-8 rounded-[2rem] hover:bg-white/[0.07] transition-all group">
                  <div className="flex justify-between items-start mb-6">
                    <div className={cn("p-4 rounded-2xl bg-white/5", item.color)}>
                      <item.icon className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-bold text-emerald-500 uppercase tracking-widest">Active</span>
                  </div>
                  <div className="text-4xl font-black mb-1 tracking-tighter">{item.count}</div>
                  <div className="text-gray-500 font-medium">{item.label}</div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'states' && (
            <div className="bg-white/5 border border-white/10 rounded-[2.5rem] overflow-hidden">
              <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                <h3 className="text-xl font-bold">State Inventory</h3>
                <button onClick={() => { setEditingId(-1); setEditForm({ name: '', description: '', culture: '', cuisine: '', image_url: '' }); }} className="bg-emerald-600 hover:bg-emerald-500 px-6 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-emerald-900/40 flex items-center space-x-2 text-sm">
                  <Plus className="w-4 h-4" />
                  <span>Create State</span>
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-[10px] uppercase tracking-[0.2em] font-black text-gray-500 border-b border-white/5">
                      <th className="px-8 py-4">Identity</th>
                      <th className="px-8 py-4">Visual</th>
                      <th className="px-8 py-4">Details</th>
                      <th className="px-8 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {editingId === -1 && (
                      <tr className="bg-emerald-500/5">
                        <td className="px-8 py-6"><input className="bg-white/5 border border-white/10 rounded-lg p-2 w-full text-sm focus:outline-emerald-500" placeholder="State Name" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} /></td>
                        <td className="px-8 py-6"><input className="bg-white/5 border border-white/10 rounded-lg p-2 w-full text-sm focus:outline-emerald-500" placeholder="Image URL" value={editForm.image_url} onChange={e => setEditForm({...editForm, image_url: e.target.value})} /></td>
                        <td className="px-8 py-6"><textarea className="bg-white/5 border border-white/10 rounded-lg p-2 w-full text-sm focus:outline-emerald-500" placeholder="Description" value={editForm.description} onChange={e => setEditForm({...editForm, description: e.target.value})} /></td>
                        <td className="px-8 py-6 text-right space-x-2">
                          <button onClick={() => handleAction('post', '/api/admin/states', editForm)} className="p-2 text-emerald-500 hover:bg-emerald-500/20 rounded-lg transition-all"><Save className="w-5 h-5" /></button>
                          <button onClick={() => setEditingId(null)} className="p-2 text-red-400 hover:bg-red-400/20 rounded-lg transition-all"><X className="w-5 h-5" /></button>
                        </td>
                      </tr>
                    )}
                    {states.map(state => (
                      <tr key={state.id} className="hover:bg-white/[0.02] transition-colors group">
                        <td className="px-8 py-6">
                          {editingId === state.id ? (
                            <input className="bg-white/5 border border-white/10 rounded-lg p-2 w-full text-sm font-semibold" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} />
                          ) : (
                            <div className="font-bold text-lg">{state.name}</div>
                          )}
                        </td>
                        <td className="px-8 py-6">
                          {editingId === state.id ? (
                            <input className="bg-white/5 border border-white/10 rounded-lg p-2 w-full text-sm" value={editForm.image_url} onChange={e => setEditForm({...editForm, image_url: e.target.value})} />
                          ) : (
                            <img src={state.image_url} className="w-16 h-10 object-cover rounded-lg border border-white/10 shadow-sm" alt="" referrerPolicy="no-referrer" />
                          )}
                        </td>
                        <td className="px-8 py-6">
                           {editingId === state.id ? (
                            <textarea className="bg-white/5 border border-white/10 rounded-lg p-2 w-full text-sm" value={editForm.description} onChange={e => setEditForm({...editForm, description: e.target.value})} />
                          ) : (
                            <div className="text-gray-500 text-sm line-clamp-1 max-w-sm">{state.description}</div>
                          )}
                        </td>
                        <td className="px-8 py-6 text-right space-x-1 opacity-20 group-hover:opacity-100 transition-opacity">
                          {editingId === state.id ? (
                            <>
                              <button onClick={() => handleAction('put', `/api/admin/states/${state.id}`, editForm)} className="p-2 text-emerald-500 hover:bg-emerald-500/20 rounded-lg transition-all"><Save className="w-5 h-5" /></button>
                              <button onClick={() => setEditingId(null)} className="p-2 text-red-400 hover:bg-red-400/20 rounded-lg transition-all"><X className="w-5 h-5" /></button>
                            </>
                          ) : (
                            <>
                              <button onClick={() => handleEdit(state)} className="p-2 text-emerald-400 hover:bg-emerald-400/10 rounded-lg transition-all"><Edit className="w-4 h-4" /></button>
                              <button onClick={() => handleAction('delete', `/api/admin/states/${state.id}`)} className="p-2 text-rose-400 hover:bg-rose-400/10 rounded-lg transition-all"><Trash2 className="w-4 h-4" /></button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'blogs' && (
            <div className="bg-white/5 border border-white/10 rounded-[2.5rem] overflow-hidden">
              <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                <h3 className="text-xl font-bold">Article Management</h3>
                <button onClick={() => { setEditingId(-2); setEditForm({ title: '', content: '', image_url: '', category: 'Adventure', tags: '' }); }} className="bg-emerald-600 hover:bg-emerald-500 px-6 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-emerald-900/40 flex items-center space-x-2 text-sm">
                  <Plus className="w-4 h-4" />
                  <span>New Post</span>
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 p-8 gap-6">
                {(editingId === -2 || (typeof editingId === 'number' && blogs.find(b => b.id === editingId))) && (
                   <div className="col-span-full bg-white/5 p-8 rounded-3xl border border-white/10 mb-8">
                     <div className="grid grid-cols-2 gap-6 mb-6">
                        <div className="space-y-2">
                           <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Post Title</label>
                           <input className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-emerald-500 transition-all" value={editForm.title} onChange={e => setEditForm({...editForm, title: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                           <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Banner Image URL</label>
                           <input className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-emerald-500 transition-all" value={editForm.image_url} onChange={e => setEditForm({...editForm, image_url: e.target.value})} />
                        </div>
                     </div>
                     <div className="space-y-2 mb-6">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Article Content</label>
                        <textarea rows={6} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-emerald-500 transition-all" value={editForm.content} onChange={e => setEditForm({...editForm, content: e.target.value})} />
                     </div>
                     <div className="flex justify-end space-x-3">
                        <button onClick={() => setEditingId(null)} className="px-6 py-2.5 font-bold text-gray-400 hover:text-white transition-colors">Discard</button>
                        <button onClick={() => handleAction(editingId === -2 ? 'post' : 'put', editingId === -2 ? '/api/admin/blogs' : `/api/admin/blogs/${editingId}`, editForm)} className="bg-emerald-600 hover:bg-emerald-500 px-8 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-emerald-900/40">Publish Article</button>
                     </div>
                   </div>
                )}
                
                {blogs.map(blog => (
                  <div key={blog.id} className="bg-white/5 border border-white/10 rounded-3xl p-6 flex space-x-6 hover:bg-white/[0.07] transition-all group relative">
                    <img src={blog.image_url} className="w-32 h-32 object-cover rounded-2xl border border-white/10" alt="" referrerPolicy="no-referrer" />
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <span className="text-emerald-500 text-[10px] font-black uppercase tracking-widest mb-2">{blog.category}</span>
                        <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                           <button onClick={() => handleEdit(blog)} className="p-2 hover:text-emerald-400 transition-colors"><Edit className="w-4 h-4" /></button>
                           <button onClick={() => handleAction('delete', `/api/admin/blogs/${blog.id}`)} className="p-2 hover:text-rose-400 transition-colors"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </div>
                      <h4 className="font-bold text-lg mb-2 line-clamp-1">{blog.title}</h4>
                      <p className="text-gray-500 text-sm line-clamp-2 italic mb-4">"{blog.content.substring(0, 80)}..."</p>
                      <div className="flex items-center text-xs text-gray-600 space-x-3 italic">
                        <span>by {blog.author_name}</span>
                        <span>•</span>
                        <span>{new Date(blog.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="bg-white/5 border border-white/10 rounded-[2.5rem] overflow-hidden p-8">
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                  <div className="space-y-8">
                     <h3 className="text-xl font-black tracking-tight flex items-center space-x-3 mb-8">
                        <Globe className="w-6 h-6 text-emerald-500" />
                        <span>Visual Configuration</span>
                     </h3>
                     {settings.filter(s => s.type !== 'textarea').map(setting => (
                       <div key={setting.key} className="space-y-2">
                          <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">{setting.label}</label>
                          <div className="flex space-x-3">
                             <input className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-emerald-500 transition-all text-sm" value={setting.value} onChange={e => {
                               const updated = settings.map(s => s.key === setting.key ? {...s, value: e.target.value} : s);
                               setSettings(updated);
                             }} />
                             <button onClick={() => handleAction('put', '/api/admin/settings', { key: setting.key, value: setting.value })} className="p-3 bg-white/5 hover:bg-emerald-600 transition-all rounded-xl border border-white/10 hover:text-white"><Save className="w-5 h-5" /></button>
                          </div>
                       </div>
                     ))}
                  </div>
                  <div className="space-y-8">
                     <h3 className="text-xl font-black tracking-tight flex items-center space-x-3 mb-8">
                        <FileText className="w-6 h-6 text-emerald-500" />
                        <span>Content & Metadata</span>
                     </h3>
                     {settings.filter(s => s.type === 'textarea').map(setting => (
                       <div key={setting.key} className="space-y-2">
                          <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">{setting.label}</label>
                          <div className="relative group">
                             <textarea rows={3} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-emerald-500 transition-all text-sm" value={setting.value} onChange={e => {
                               const updated = settings.map(s => s.key === setting.key ? {...s, value: e.target.value} : s);
                               setSettings(updated);
                             }} />
                             <button onClick={() => handleAction('put', '/api/admin/settings', { key: setting.key, value: setting.value })} className="absolute top-2 right-2 p-2 bg-emerald-600/20 hover:bg-emerald-600 transition-all rounded-lg text-emerald-500 hover:text-white"><Save className="w-4 h-4" /></button>
                          </div>
                       </div>
                     ))}
                  </div>
               </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const isAdminPath = location.pathname.startsWith('/admin');

  if (isAdminPath) return <>{children}</>;

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900">
      <Navbar />
      <main>
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <MainLayout>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/explore" element={<ProtectedRoute><ExplorePage /></ProtectedRoute>} />
          <Route path="/login" element={<AuthPage type="login" />} />
          <Route path="/register" element={<AuthPage type="register" />} />
          <Route path="/state/:id" element={<ProtectedRoute><StatePage /></ProtectedRoute>} />
          <Route path="/place/:id" element={<ProtectedRoute><PlacePage /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/states" element={<ProtectedRoute><StatesPage /></ProtectedRoute>} />
          <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        </Routes>
      </MainLayout>
    </BrowserRouter>
  );
}
