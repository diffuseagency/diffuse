import React from 'react';
import { FileText, Download, Clock, ExternalLink, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';

interface Asset {
  id: string;
  name: string;
  url: string;
  size: number;
  type: string;
  uploadedAt: string;
}

interface ProjectFileVaultProps {
  assets: Asset[];
}

export default function ProjectFileVault({ assets }: ProjectFileVaultProps) {
  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    if (type.includes('pdf')) return <FileText className="text-red-400" />;
    if (type.includes('image')) return <FileText className="text-blue-400" />;
    if (type.includes('zip') || type.includes('compressed')) return <FileText className="text-purple-400" />;
    return <FileText className="text-gray-400" />;
  };

  if (!assets || assets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white/[0.02] border border-dashed border-white/10 rounded-[32px] text-center">
        <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center text-gray-600 mb-4">
          <FileText size={24} />
        </div>
        <h4 className="text-white font-bold text-sm tracking-widest uppercase">Repositório Vazio</h4>
        <p className="text-gray-500 font-medium text-xs mt-2 max-w-xs leading-relaxed">
          Os arquivos do projeto estarão disponíveis aqui conforme o avanço das etapas de desenvolvimento.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {assets.map((asset, idx) => (
        <motion.div 
          key={asset.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.1 }}
          className="group relative p-6 bg-white/[0.03] border border-white/5 rounded-[24px] hover:border-blue-500/30 transition-all overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-all">
            <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-500">
              <Download size={16} />
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-xl shrink-0">
              {getFileIcon(asset.type)}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-white font-bold text-sm truncate mb-1 pr-8" title={asset.name}>
                {asset.name}
              </h4>
              <div className="flex items-center gap-3">
                <span className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">{formatSize(asset.size)}</span>
                <div className="w-1 h-1 bg-white/10 rounded-full" />
                <span className="text-[10px] text-gray-700 font-mono italic">{new Date(asset.uploadedAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
          
          <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2 text-[10px] text-green-500 uppercase font-bold tracking-widest opacity-60">
              <ShieldCheck size={12} />
              <span>Verificado</span>
            </div>
            <a 
              href={asset.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-[10px] font-bold text-white uppercase tracking-widest flex items-center gap-2 hover:text-blue-400 transition-colors"
            >
              Baixar Agora <ExternalLink size={12} />
            </a>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
