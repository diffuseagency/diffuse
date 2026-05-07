import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { LayoutGrid, Users, Briefcase, CreditCard, Menu, X, ArrowRight, Music, Shield, Cpu, Mic2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Pages - We'll create these next
import Home from './pages/Home';
import About from './pages/About';
import Services from './pages/Services';
import Contact from './pages/Contact';
import Portfolio from './pages/Portfolio';
import Admin from './pages/Admin';
import Login from './pages/Login';
import Profile from './pages/Profile';
import ProjectDetails from './pages/ProjectDetails';
import AdminGuard from './components/AdminGuard';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';

import { HelmetProvider, Helmet } from 'react-helmet-async';
import { SiteSettingsProvider, useSiteSettings } from './lib/useSiteSettings';
import { auth, db } from './lib/firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, collection, onSnapshot } from 'firebase/firestore';

function SEO() {
  const { settings } = useSiteSettings();
  const defaultTitle = "Diffuse Agency | Elite Web Engineering";
  const defaultDesc = "Transformando visão em realidade digital através de engenharia sênior e design de alta fidelidade.";
  
  return (
    <Helmet>
      <title>{settings.seo_title || defaultTitle}</title>
      <meta name="description" content={settings.seo_description || defaultDesc} />
      <meta property="og:title" content={settings.seo_title || defaultTitle} />
      <meta property="og:description" content={settings.seo_description || defaultDesc} />
      {settings.analytics_id && (
        <script async src={`https://www.googletagmanager.com/gtag/js?id=${settings.analytics_id}`}></script>
      )}
    </Helmet>
  );
}

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [isUserAdmin, setIsUserAdmin] = useState(false);
  const [navLinks, setNavLinks] = useState<any[]>([]);
  const location = useLocation();
  const isAdminPage = location.pathname.startsWith('/admin');

  useEffect(() => {
    // Basic real-time sync for nav
    const unsubscribeNav = onSnapshot(collection(db, 'navigation'), (snap) => {
      const links = snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .filter((l: any) => l.isActive !== false && l.type === 'header')
        .sort((a: any, b: any) => (a.order || 0) - (b.order || 0));
      
      if (links.length > 0) {
        setNavLinks(links);
      } else {
        // Fallback static links if none in DB
        setNavLinks([
          { label: 'Home', path: '/' },
          { label: 'Sobre', path: '/sobre' },
          { label: 'Serviços', path: '/servicos' },
          { label: 'Portfólio', path: '/portfolio' },
          { label: 'Contato', path: '/contato' },
        ]);
      }
    });

    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const adminDoc = await getDoc(doc(db, 'admins', currentUser.uid));
          setIsUserAdmin(adminDoc.exists());
        } catch (error) {
          console.error("Error checking admin status:", error);
          setIsUserAdmin(false);
        }
      } else {
        setIsUserAdmin(false);
      }
    });
    return () => {
      unsubscribeNav();
      unsubscribeAuth();
    };
  }, []);

  if (isAdminPage) return null;

  return (
    <nav className="fixed w-full z-50 bg-white/5 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="w-8 h-8 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-lg flex items-center justify-center font-bold italic tracking-tighter transition-transform group-hover:scale-110">
              <span className="text-white">D</span>
            </div>
            <span className="text-xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 group-hover:from-blue-400 group-hover:to-purple-400 transition-all uppercase">Diffuse</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex gap-8 items-center text-sm font-medium tracking-wide">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.id || link.label}
                  to={link.path}
                  className={cn(
                    "hover:text-white transition-colors uppercase",
                    isActive ? "text-white border-b border-blue-500 pb-1" : "text-gray-400"
                  )}
                >
                  {link.label || link.name}
                </Link>
              );
            })}
            
            {user && (
              <div className="flex gap-8 items-center">
                {isUserAdmin && (
                  <Link
                    to="/admin"
                    className={cn(
                      "hover:text-blue-400 transition-colors uppercase font-bold text-blue-500",
                      location.pathname.startsWith('/admin') ? "text-blue-400" : ""
                    )}
                  >
                    Dashboard
                  </Link>
                )}
                <Link
                  to="/profile"
                  className={cn(
                    "hover:text-white transition-colors uppercase",
                    location.pathname === '/profile' ? "text-white border-b border-blue-500 pb-1" : "text-gray-400"
                  )}
                >
                  Perfil
                </Link>
              </div>
            )}
            
            {!user && (
              <Link
                to="/login"
                className="button-glass"
              >
                CLIENT LOGIN
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="text-white">
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-black border-b border-white/10 overflow-hidden"
          >
            <div className="px-4 pt-2 pb-6 space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.id || link.label}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className="block text-white/80 hover:text-white text-lg font-light tracking-wide py-2"
                >
                  {link.label || link.name}
                </Link>
              ))}
              {user ? (
                <>
                  {isUserAdmin && (
                    <Link
                      to="/admin"
                      onClick={() => setIsOpen(false)}
                      className="block text-blue-400 hover:text-blue-300 text-lg font-bold tracking-wide py-2 uppercase"
                    >
                      Dashboard Master
                    </Link>
                  )}
                  <Link
                    to="/profile"
                    onClick={() => setIsOpen(false)}
                    className="block text-white/80 hover:text-white text-lg font-light tracking-wide py-2"
                  >
                    Perfil
                  </Link>
                </>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="block text-center bg-white text-black py-3 rounded-md font-bold uppercase tracking-widest"
                >
                  Login
                </Link>
              )}
              <Link
                to="/admin"
                onClick={() => setIsOpen(false)}
                className="block text-center text-white/40 hover:text-white py-2 text-xs font-bold uppercase tracking-widest"
              >
                Admin Area
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default function App() {
  return (
    <HelmetProvider>
      <SiteSettingsProvider>
        <Router>
          <SEO />
          <AppContent />
        </Router>
      </SiteSettingsProvider>
    </HelmetProvider>
  );
}

function AppContent() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  return (
    <div className="min-h-screen bg-brand-bg text-gray-300 selection:bg-white selection:text-black relative overflow-x-hidden">
      <ScrollToTop />
      {/* Background Blobs */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[10%] right-[-5%] w-[50%] h-[50%] bg-purple-600/10 rounded-full blur-[150px]"></div>
        <div className="absolute top-[40%] left-[30%] w-[30%] h-[30%] bg-teal-500/5 rounded-full blur-[100px]"></div>
      </div>

      <div className="relative z-10">
        {!isAdmin && <Navbar />}
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/sobre" element={<About />} />
            <Route path="/servicos" element={<Services />} />
            <Route path="/portfolio" element={<Portfolio />} />
            <Route path="/contato" element={<Contact />} />
            <Route path="/login" element={<Login />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/project/:id" element={<ProjectDetails />} />
            <Route path="/admin/*" element={
              <AdminGuard>
                <Admin />
              </AdminGuard>
            } />
          </Routes>
        </main>
        {!isAdmin && <Footer />}
      </div>
    </div>
  );
}
