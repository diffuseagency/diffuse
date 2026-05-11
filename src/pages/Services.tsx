import { motion } from 'motion/react';
import { Layout, Smartphone, Globe, Code2, Rocket, Search, Database } from 'lucide-react';
import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { handleFirestoreError, OperationType } from '../lib/error-handler';
import { useSiteSettings } from '../lib/useSiteSettings';
import SEO from '../components/SEO';

const iconMap: any = { Globe, Smartphone, Search, Database, Code2, Rocket, Layout };

const ServiceItem = ({ icon: IconName, title, features, description }: { icon: string, title: string, features: string[], description: string, key?: any }) => {
  const Icon = iconMap[IconName] || Layout;
  return (
    <div className="py-20 border-t border-white/10 flex flex-col lg:flex-row gap-12 group">
      <div className="lg:w-1/3">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-white/5 rounded-full group-hover:bg-gradient-to-tr group-hover:from-blue-500 group-hover:to-purple-500 group-hover:text-white transition-all">
            <Icon size={32} strokeWidth={1} />
          </div>
          <h3 className="text-4xl font-light tracking-tight">{title}</h3>
        </div>
        <p className="text-gray-500 text-sm leading-relaxed max-w-sm">
          {description}
        </p>
      </div>
      <div className="flex-1 grid sm:grid-cols-2 gap-8">
        {features && features.map((f) => (
          <div key={f} className="flex items-start space-x-3">
            <div className="w-1.5 h-1.5 bg-white/40 rounded-full mt-1.5 shrink-0" />
            <span className="text-white/80 font-light tracking-wide">{f}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function Services() {
  const { settings } = useSiteSettings();
  const [services, setServices] = useState<any[]>([]);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const snap = await getDocs(collection(db, 'services'));
        setServices(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        handleFirestoreError(error, OperationType.LIST, 'services');
      }
    };
    fetchServices();
  }, []);

  return (
    <div className="pt-40 max-w-7xl mx-auto px-4">
      <SEO title={`Serviços | ${settings.agency_name || 'Diffuse'}`} />
      <div className="mb-32">
        <span className="text-[10px] uppercase tracking-[0.4em] text-white/50 mb-4 block">Capacidades</span>
        <h1 className="text-7xl md:text-9xl font-display font-light mb-12 tracking-tighter italic text-gradient">Serviços</h1>
        <p className="text-2xl text-white/40 max-w-2xl font-light">
          Nossa expertise abrange todo o ciclo de vida de produtos digitais premium, com foco em tecnologias emergentes e design de ponta.
        </p>
      </div>

      {services.map((service) => (
        <ServiceItem 
          key={service.id}
          icon={service.icon}
          title={service.title}
          description={service.description}
          features={service.features}
        />
      ))}
      
      <div className="py-40 text-center">
        <h2 className="text-4xl font-display font-light mb-8 italic">Pronto para elevar seu negócio?</h2>
        <button className="bg-white text-black px-12 py-6 rounded-full font-bold uppercase tracking-widest text-sm hover:scale-105 transition-all">
          Solicitar Orçamento
        </button>
      </div>
    </div>
  );
}
