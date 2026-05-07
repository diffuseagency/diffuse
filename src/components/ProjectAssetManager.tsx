import React, { useState } from 'react';
import { storage, db } from '../lib/firebase';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { Upload, File, Trash2, X, Loader2, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Asset {
  id: string;
  name: string;
  url: string;
  size: number;
  type: string;
  uploadedAt: string;
}

interface ProjectAssetManagerProps {
  project: any;
  onClose: () => void;
  onUpdate: () => void;
}

export default function ProjectAssetManager({ project, onClose, onUpdate }: ProjectAssetManagerProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setStatus('uploading');
    setProgress(0);

    const assetId = Math.random().toString(36).substring(7);
    const storageRef = ref(storage, `projects/${project.id}/${assetId}_${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on('state_changed', 
      (snapshot) => {
        const p = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setProgress(p);
      }, 
      (error) => {
        console.error("Upload error:", error);
        setStatus('error');
        setUploading(false);
      }, 
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        const newAsset: Asset = {
          id: assetId,
          name: file.name,
          url: downloadURL,
          size: file.size,
          type: file.type,
          uploadedAt: new Date().toISOString()
        };

        try {
          const projectRef = doc(db, 'projects', project.id);
          await updateDoc(projectRef, {
            assets: arrayUnion(newAsset)
          });
          setStatus('success');
          setTimeout(() => {
            setStatus('idle');
            setUploading(false);
            onUpdate();
          }, 2000);
        } catch (error) {
          console.error("Firestore update error:", error);
          setStatus('error');
          setUploading(false);
        }
      }
    );
  };

  const handleDelete = async (asset: Asset) => {
    if (!confirm(`Deseja excluir o arquivo ${asset.name}?`)) return;

    try {
      // 1. Delete from Storage
      // We need to parse the path from URL or somehow store the path. 
      // For simplicity here, we assume the path structure.
      const storageRef = ref(storage, `projects/${project.id}/${asset.id}_${asset.name}`);
      await deleteObject(storageRef);

      // 2. Remove from Firestore
      const projectRef = doc(db, 'projects', project.id);
      await updateDoc(projectRef, {
        assets: arrayRemove(asset)
      });
      
      onUpdate();
    } catch (error) {
      console.error("Error deleting asset:", error);
      alert("Erro ao excluir arquivo.");
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card p-8 w-full max-w-2xl border-white/10 shadow-2xl relative"
      >
        <div className="flex justify-between items-center mb-8 border-b border-white/5 pb-6">
          <div>
            <h3 className="text-xl font-bold text-white uppercase tracking-[0.2em]">Gestão de Arquivos</h3>
            <p className="text-gray-500 text-[10px] uppercase tracking-widest mt-1 font-bold">Projeto: {project.title}</p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Upload Area */}
        <div className="mb-10">
          <label className={`
            flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-[32px] cursor-pointer transition-all
            ${status === 'uploading' ? 'border-blue-500/50 bg-blue-500/5' : 'border-white/10 hover:border-white/20 bg-white/[0.02]'}
          `}>
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              {status === 'idle' && (
                <>
                  <Upload className="w-8 h-8 mb-3 text-gray-500" />
                  <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">Clique para selecionar ou arraste arquivos</p>
                </>
              )}
              {status === 'uploading' && (
                <div className="w-full px-12 text-center">
                  <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden mb-4">
                    <motion.div 
                      className="h-full bg-blue-500" 
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-blue-500 uppercase tracking-widest font-bold">Enviando... {Math.round(progress)}%</p>
                </div>
              )}
              {status === 'success' && (
                <div className="flex flex-col items-center text-green-500">
                  <CheckCircle2 className="w-8 h-8 mb-2" />
                  <p className="text-[10px] uppercase tracking-widest font-bold">Upload Concluído!</p>
                </div>
              )}
              {status === 'error' && (
                <div className="flex flex-col items-center text-red-500">
                  <X className="w-8 h-8 mb-2" />
                  <p className="text-[10px] uppercase tracking-widest font-bold">Erro no Upload</p>
                </div>
              )}
            </div>
            <input type="file" className="hidden" onChange={handleFileUpload} disabled={uploading} />
          </label>
        </div>

        {/* Assets List */}
        <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-2 scrollbar-hide">
          <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4">Arquivos Enviados ({project.assets?.length || 0})</h4>
          
          <AnimatePresence mode="popLayout">
            {project.assets && project.assets.length > 0 ? (
              project.assets.map((asset: Asset) => (
                <motion.div 
                  key={asset.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="flex items-center justify-between p-4 bg-white/[0.03] border border-white/5 rounded-2xl group hover:border-white/10 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-gray-500">
                      <File size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white truncate max-w-[200px]">{asset.name}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-[10px] text-gray-500 uppercase font-mono">{formatSize(asset.size)}</span>
                        <span className="text-[10px] text-gray-700 font-mono italic">{new Date(asset.uploadedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <a 
                      href={asset.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-[10px] font-bold text-blue-500 uppercase tracking-widest px-3 py-1 hover:bg-blue-500/10 rounded transition-all"
                    >
                      Ver
                    </a>
                    <button 
                      onClick={() => handleDelete(asset)}
                      className="p-2 text-gray-600 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-12 border border-dashed border-white/5 rounded-[32px]">
                <p className="text-[10px] text-gray-600 uppercase tracking-widest font-bold">Nenhum arquivo anexado a este projeto.</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
