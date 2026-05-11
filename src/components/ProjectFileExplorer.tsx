import { FileText, Download, Clock, ExternalLink } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

export interface Deliverable {
  id: string;
  name: string;
  type: string;
  url: string;
  createdAt: any;
  is_deliverable?: boolean;
}

interface ProjectFileExplorerProps {
  files: Deliverable[];
}

export default function ProjectFileExplorer({ files }: ProjectFileExplorerProps) {
  const deliverableFiles = files.filter(f => f.is_deliverable);

  if (deliverableFiles.length === 0) {
    return (
      <div className="p-12 text-center border-2 border-dashed border-white/5 rounded-[40px] bg-white/[0.01]">
        <FileText size={40} className="mx-auto text-gray-700 mb-4" />
        <p className="text-[10px] uppercase font-bold text-gray-500 tracking-widest">Nenhum entregável disponível ainda.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {deliverableFiles.map((file, idx) => (
        <motion.div
          key={file.id || idx}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: idx * 0.1 }}
          className="p-5 bg-white/[0.02] border border-white/5 rounded-3xl group hover:bg-white/[0.05] hover:border-white/10 transition-all flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500">
              <FileText size={20} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white truncate max-w-[150px]">{file.name}</h4>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[8px] bg-blue-500/20 text-blue-500 px-1.5 py-0.5 rounded font-black uppercase tracking-widest">{file.type || 'DOC'}</span>
                <span className="text-[8px] text-gray-600 font-mono flex items-center gap-1">
                  <Clock size={8} /> {file.createdAt?.seconds ? new Date(file.createdAt.seconds * 1000).toLocaleDateString() : 'Set/2026'}
                </span>
              </div>
            </div>
          </div>
          
          <a 
            href={file.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-gray-500 hover:text-white hover:border-white transition-all"
          >
            <Download size={16} />
          </a>
        </motion.div>
      ))}
    </div>
  );
}
