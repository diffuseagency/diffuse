import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { motion } from 'motion/react';

interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <motion.nav 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center space-x-2 text-[10px] font-bold uppercase tracking-widest text-white/40 mb-8"
      aria-label="Breadcrumb"
    >
      <Link to="/" className="hover:text-white transition-colors flex items-center">
        <Home size={12} className="mr-2" /> 
        Home
      </Link>
      
      {items.map((item, index) => (
        <React.Fragment key={index}>
          <ChevronRight size={10} className="text-white/10" />
          {item.path ? (
            <Link to={item.path} className="hover:text-white transition-colors">
              {item.label}
            </Link>
          ) : (
            <span className="text-white/60 truncate max-w-[200px]">{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </motion.nav>
  );
}
