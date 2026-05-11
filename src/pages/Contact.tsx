import { motion } from 'motion/react';
import { Mail, Phone, MapPin, Send, Instagram, Linkedin, Github } from 'lucide-react';
import SEO from '../components/SEO';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useState } from 'react';
import { addFirestoreDoc } from '../lib/cmsHooks';
import { handleFirestoreError, OperationType } from '../lib/error-handler';
import { useSiteSettings } from '../lib/useSiteSettings';

const contactSchema = z.object({
  name: z.string().min(2, 'Nome muito curto'),
  email: z.string().email('E-mail inválido'),
  subject: z.string().min(5, 'Assunto muito curto'),
  message: z.string().min(10, 'Mensagem deve ter pelo menos 10 caracteres'),
  confirm_email: z.string().optional(), // Honeypot field
});

type ContactFormData = z.infer<typeof contactSchema>;

export default function Contact() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);
  const { settings } = useSiteSettings();
  
  const { register, handleSubmit, formState: { errors }, reset } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (data: ContactFormData) => {
    // Honeypot check
    if (data.confirm_email) {
      console.warn("Honeypot filled - Bot detected");
      setIsSuccess(true); // Pretend success to bot
      return;
    }

    setIsSubmitting(true);
    setErrorStatus(null);
    try {
      const payload = {
        ...data,
        read: false,
        source_url: window.location.href,
        referrer: document.referrer || 'direto',
        createdAt: new Date().toISOString()
      };
      await addFirestoreDoc('messages', payload);
      setIsSuccess(true);
      reset();
      setTimeout(() => setIsSuccess(false), 5000);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'messages');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pt-40 max-w-7xl mx-auto px-4 pb-20">
      <SEO title={`Contato | ${settings.agency_name || 'Diffuse'}`} />
      <div className="grid lg:grid-cols-2 gap-24">
        <div>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <span className="text-[10px] uppercase tracking-[0.4em] text-white/50 mb-4 block">Let's Connect</span>
            <h1 className="text-7xl md:text-8xl font-display font-light mb-12 tracking-tighter italic text-gradient">
              Contato
            </h1>
            <p className="text-xl text-white/60 font-light leading-relaxed mb-16 max-w-md">
              {settings.contact_tagline || 'Estamos prontos para ouvir sua ideia e transformá-la em algo extraordinário. Entre em contato para uma consultoria técnica sênior.'}
            </p>

            <div className="space-y-12">
              <div className="flex items-center space-x-6 group">
                <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all">
                  <Mail size={20} />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-white/40 mb-1 font-mono">E-mail</p>
                  <p className="text-lg font-light">{settings.contact_email || 'hello@diffuse.tech'}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-6 group">
                <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all">
                  <Phone size={20} />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-white/40 mb-1 font-mono">Telefone</p>
                  <p className="text-lg font-light">{settings.contact_phone || '+55 (11) 99999-0000'}</p>
                </div>
              </div>

              <div className="flex items-center space-x-6 group">
                <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all">
                  <MapPin size={20} />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-white/40 mb-1 font-mono">Endereço</p>
                  <p className="text-lg font-light">{settings.contact_address || 'Av. Paulista, 1000 - São Paulo, BR'}</p>
                </div>
              </div>
            </div>

            <div className="mt-20 flex space-x-6">
              {settings.footer_instagram && (
                <a href={settings.footer_instagram} target="_blank" rel="noopener noreferrer" className="text-white/20 hover:text-white transition-all">
                  <Instagram size={24} strokeWidth={1.5} />
                </a>
              )}
              {settings.footer_linkedin && (
                <a href={settings.footer_linkedin} target="_blank" rel="noopener noreferrer" className="text-white/20 hover:text-white transition-all">
                  <Linkedin size={24} strokeWidth={1.5} />
                </a>
              )}
              {settings.footer_github && (
                <a href={settings.footer_github} target="_blank" rel="noopener noreferrer" className="text-white/20 hover:text-white transition-all">
                  <Github size={24} strokeWidth={1.5} />
                </a>
              )}
            </div>
          </motion.div>
        </div>

        <motion.div
           initial={{ opacity: 0, x: 20 }}
           animate={{ opacity: 1, x: 0 }}
           className="glass-card p-12 lg:p-16"
        >
          {isSuccess ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
              <div className="w-20 h-20 bg-white text-black rounded-full flex items-center justify-center shadow-xl shadow-white/10">
                 <Send size={32} />
              </div>
              <h3 className="text-3xl font-display italic">Mensagem enviada!</h3>
              <p className="text-white/40 max-w-xs">Retornaremos seu contato o mais breve possível. Obrigado pelo interesse.</p>
              <button 
                onClick={() => setIsSuccess(false)}
                className="text-white underline underline-offset-8 text-sm uppercase tracking-widest font-bold pt-4"
              >
                Enviar outra
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
              <div className="space-y-4">
                <label className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-mono">Como podemos te chamar?</label>
                <input 
                  {...register('name')}
                  placeholder="Nome Completo"
                  className="w-full bg-transparent border-b border-white/10 py-4 focus:outline-none focus:border-white transition-all font-light text-xl"
                />
                {errors.name && <p className="text-red-500 text-[10px] uppercase tracking-tight">{errors.name.message}</p>}
              </div>

              <div className="space-y-4">
                <label className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-mono">E seu melhor e-mail?</label>
                <input 
                  {...register('email')}
                  placeholder="Seu E-mail Profissional"
                  className="w-full bg-transparent border-b border-white/10 py-4 focus:outline-none focus:border-white transition-all font-light text-xl"
                />
                {errors.email && <p className="text-red-500 text-[10px] uppercase tracking-tight">{errors.email.message}</p>}
              </div>

              <div className="space-y-4">
                <label className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-mono">Qual o assunto?</label>
                <input 
                  {...register('subject')}
                  placeholder="Projeto, Parceria, Dúvida..."
                  className="w-full bg-transparent border-b border-white/10 py-4 focus:outline-none focus:border-white transition-all font-light text-xl"
                />
                {errors.subject && <p className="text-red-500 text-[10px] uppercase tracking-tight">{errors.subject.message}</p>}
              </div>

              <div className="space-y-4">
                <label className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-mono">Conte-nos sobre sua visão</label>
                <textarea 
                  {...register('message')}
                  rows={4}
                  placeholder="Descrição do projeto ou mensagem..."
                  className="w-full bg-transparent border-b border-white/10 py-4 focus:outline-none focus:border-white transition-all font-light text-xl resize-none hover:bg-white/5"
                />
                {errors.message && <p className="text-red-500 text-[10px] uppercase tracking-tight">{errors.message.message}</p>}
              </div>

              {/* Honeypot field - Hidden from users */}
              <div className="hidden pointer-events-none opacity-0 h-0 w-0" aria-hidden="true">
                <input 
                   {...register('confirm_email')}
                   tabIndex={-1}
                   autoComplete="off"
                   placeholder="Não preencha este campo"
                />
              </div>

              {errorStatus && (
                <motion.p 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-500 text-xs font-bold uppercase tracking-widest text-center"
                >
                  {errorStatus}
                </motion.p>
              )}

              <button 
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-white text-black py-6 rounded-full font-bold uppercase tracking-widest text-sm hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center space-x-3"
              >
                {isSubmitting ? 'Enviando...' : <><Send size={18} /> <span>Enviar Mensagem</span></>}
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </div>
  );
}
