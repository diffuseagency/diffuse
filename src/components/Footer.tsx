import { Link } from 'react-router-dom';
import { Mail, Github, Linkedin, Instagram } from 'lucide-react';
import { useEffect, useState } from 'react';
import { collection, onSnapshot, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';

export default function Footer() {
  const [settings, setSettings] = useState<any>({});
  const [navLinks, setNavLinks] = useState<any[]>([]);
  const [legalLinks, setLegalLinks] = useState<any[]>([]);
  
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'settings'));
        const sData: any = {};
        querySnapshot.docs.forEach(d => sData[d.data().key] = d.data().value);
        setSettings(sData);
      } catch (err) {
        console.error('Error loading footer settings:', err);
      }
    };
    fetchSettings();

    const unsubNav = onSnapshot(collection(db, 'navigation'), (snap) => {
      const items = snap.docs.map(d => ({ id: d.id, ...d.data() } as any));
      setNavLinks(items.filter(i => i.type === 'footer' && i.isActive !== false).sort((a, b) => a.order - b.order));
      setLegalLinks(items.filter(i => i.type === 'legal' && i.isActive !== false).sort((a, b) => a.order - b.order));
    });

    return () => unsubNav();
  }, []);

  return (
    <footer className="bg-black pt-40 pb-20 border-t border-white/5 selection:bg-white selection:text-black">
      <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between gap-20">
        <div className="max-w-md">
          <Link to="/" className="flex items-center space-x-2 mb-8">
            <div className="w-8 h-8 bg-white flex items-center justify-center rounded-sm rotate-45">
              <span className="text-black font-bold text-lg -rotate-45">D</span>
            </div>
            <span className="text-white font-display text-xl tracking-tighter uppercase font-light">Diffuse</span>
          </Link>
          <p className="text-4xl font-display font-light mb-12 tracking-tight leading-tight text-white/90">
            {settings?.footer_text || 'Arquitetamos experiências digitais que definem a excelência.'}
          </p>
          <div className="flex space-x-6">
            <a href={`mailto:${settings?.footer_email || '#'}`} className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:border-white transition-all">
              <Mail size={18} />
            </a>
            <a href={settings?.footer_linkedin || '#'} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:border-white transition-all">
              <Linkedin size={18} />
            </a>
            <a href={settings?.footer_instagram || '#'} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:border-white transition-all">
              <Instagram size={18} />
            </a>
            <a href={settings?.footer_github || '#'} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:border-white transition-all">
              <Github size={18} />
            </a>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-16">
          <div className="space-y-6">
            <p className="text-[10px] uppercase tracking-widest text-white/40 font-mono">Navegação</p>
            <ul className="space-y-4 text-sm font-light">
              {navLinks.length > 0 ? navLinks.map(link => (
                <li key={link.id}><Link to={link.path} className="hover:text-white text-white/60 transition-colors">{link.label}</Link></li>
              )) : (
                <>
                  <li><Link to="/" className="hover:text-white text-white/60 transition-colors">Home</Link></li>
                  <li><Link to="/sobre" className="hover:text-white text-white/60 transition-colors">Sobre</Link></li>
                  <li><Link to="/servicos" className="hover:text-white text-white/60 transition-colors">Serviços</Link></li>
                  <li><Link to="/portfolio" className="hover:text-white text-white/60 transition-colors">Portfólio</Link></li>
                </>
              )}
            </ul>
          </div>
          <div className="space-y-6">
            <p className="text-[10px] uppercase tracking-widest text-white/40 font-mono">Contato</p>
            <ul className="space-y-4 text-sm font-light">
              <li className="text-white/60">{settings?.footer_address || 'São Paulo, BR'}</li>
              <li className="text-white/60">{settings?.footer_phone || '+55 11 99999-0000'}</li>
              <li className="text-white/60">{settings?.footer_email || 'hello@diffuse.tech'}</li>
            </ul>
          </div>
          <div className="space-y-6 hidden lg:block">
            <p className="text-[10px] uppercase tracking-widest text-white/40 font-mono">Legal</p>
            <ul className="space-y-4 text-sm font-light">
              {legalLinks.length > 0 ? legalLinks.map(link => (
                link.path.startsWith('http') ? (
                  <li key={link.id}><a href={link.path} target="_blank" rel="noopener noreferrer" className="hover:text-white text-white/60 transition-colors">{link.label}</a></li>
                ) : (
                  <li key={link.id}><Link to={link.path} className="hover:text-white text-white/60 transition-colors">{link.label}</Link></li>
                )
              )) : (
                <>
                  <li><a href="#" className="hover:text-white text-white/60 transition-colors">Privacidade</a></li>
                  <li><a href="#" className="hover:text-white text-white/60 transition-colors">Termos</a></li>
                  <li><a href="#" className="hover:text-white text-white/60 transition-colors">Cookies</a></li>
                </>
              )}
            </ul>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 mt-40 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-white/20 text-[10px] uppercase tracking-[0.2em] font-mono">
        <span>© 2026 DIFFUSE TECHNOLOGY ARCHITECTURE</span>
        <span>Coded with precision by Senior Engineering</span>
      </div>
    </footer>
  );
}
