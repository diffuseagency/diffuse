import { useEffect, useRef, useState } from 'react';
import { collection, query, orderBy, limit, onSnapshot, where, Timestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Bell, BellRing, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function LeadNotifier() {
  const [newLead, setNewLead] = useState<any>(null);
  const lastLeadId = useRef<string | null>(null);

  useEffect(() => {
    // We only want to notify about leads arrived AFTER the page load to avoid spam
    const now = Timestamp.now();
    
    const q = query(
      collection(db, 'messages'),
      where('createdAt', '>', now),
      orderBy('createdAt', 'desc'),
      limit(1)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const lead = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
        if (lead.id !== lastLeadId.current) {
          lastLeadId.current = lead.id;
          handleNewLead(lead);
        }
      }
    }, (error) => {
        console.error("Error watching leads:", error);
    });

    return () => unsubscribe();
  }, []);

  const handleNewLead = (lead: any) => {
    setNewLead(lead);
  };

  return (
    <>
      <AnimatePresence>
        {newLead && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed bottom-8 right-8 z-[200] max-w-sm w-full"
          >
            <div className="glass-card p-6 border-blue-500/50 bg-blue-500/10 shadow-[0_0_50px_rgba(59,130,246,0.3)] relative overflow-hidden">
               {/* Pulsing background */}
               <div className="absolute inset-0 bg-blue-500/5 animate-pulse" />
               
               <div className="flex items-start gap-4 relative z-10">
                  <div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-blue-500/40">
                     <BellRing className="animate-bounce" size={24} />
                  </div>
                  <div className="flex-1 min-w-0">
                     <div className="flex justify-between items-start">
                        <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-1">Novo Lead Recebido</span>
                        <button onClick={() => setNewLead(null)} className="text-white/20 hover:text-white transition-colors">
                           <X size={16} />
                        </button>
                     </div>
                     <h4 className="text-white font-bold truncate">{newLead.name}</h4>
                     <p className="text-white/40 text-xs mt-1 truncate">{newLead.subject || 'Interesse em Projeto'}</p>
                     
                     <div className="mt-4 flex items-center gap-2">
                        <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
                           <motion.div 
                              initial={{ width: "100%" }}
                              animate={{ width: "0%" }}
                              transition={{ duration: 10, ease: "linear" }}
                              onAnimationComplete={() => setNewLead(null)}
                              className="h-full bg-blue-500"
                           />
                        </div>
                     </div>
                  </div>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
