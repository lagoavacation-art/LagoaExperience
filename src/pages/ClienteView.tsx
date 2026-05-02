import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { 
  Calendar, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  Loader2, 
  PartyPopper,
  Info
} from "lucide-react";
import { supabase } from "../lib/supabaseClient";

interface ClientePublico {
  token_cliente: string;
  nome_casal: string;
  sala_apresentacao: string;
  data_apresentacao: string;
  hora_apresentacao: string;
  status_apresentacao: string;
  horario_checkin_apresentacao: string | null;
}

export default function ClienteView() {
  const { token_cliente } = useParams();
  const [cliente, setCliente] = useState<ClientePublico | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (token_cliente) {
      fetchCliente();
      
      // Subscribe to changes for this specific client
      const subscription = supabase
        .channel(`client_${token_cliente}`)
        .on('postgres_changes', { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'clientes_apresentacao',
          filter: `token_cliente=eq.${token_cliente}`
        }, (payload) => {
          // Update local state when backend changes
          setCliente(prev => prev ? { ...prev, ...payload.new } : null);
        })
        .subscribe();

      return () => {
        supabase.removeChannel(subscription);
      };
    }
  }, [token_cliente]);

  const fetchCliente = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('cliente_apresentacao_publica')
      .select('*')
      .eq('token_cliente', token_cliente)
      .maybeSingle();

    if (error || !data) {
      console.error("Erro ou cliente não encontrado:", error);
      setError(true);
    } else {
      setCliente(data);
    }
    setLoading(false);
  };

  const formatDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  };

  const formatTime = (timeStr: string | null) => {
    if (!timeStr) return null;
    if (timeStr.includes('T')) {
      return new Date(timeStr).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    }
    return timeStr.slice(0, 5);
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
      <Loader2 className="text-gold animate-spin mb-4" size={48} />
      <p className="text-slate-400 font-medium">Carregando sua experiência...</p>
    </div>
  );

  if (error || !cliente) return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
      <div className="w-20 h-20 bg-red-500/10 text-red-500 rounded-3xl flex items-center justify-center mb-6">
        <Info size={40} />
      </div>
      <h1 className="text-2xl font-bold text-white mb-2">Acesso não encontrado</h1>
      <p className="text-slate-400 max-w-xs mb-6">O link acessado é inválido ou a apresentação expirou.</p>
      
      {token_cliente && (
        <div className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-lg">
          <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Token Solicitado</p>
          <code className="text-gold font-mono text-xs">{token_cliente}</code>
        </div>
      )}
      
      <button 
        onClick={() => window.location.reload()}
        className="mt-8 text-gold hover:underline text-sm font-medium"
      >
        Tentar novamente
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 font-sans selection:bg-gold selection:text-slate-950">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-gold/10 blur-[120px] rounded-full" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gold/5 blur-[160px] rounded-full" />
      </div>

      <main className="relative z-10 max-w-md mx-auto p-6 flex flex-col min-h-screen">
        <header className="py-12 text-center">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-flex w-14 h-14 bg-gradient-to-br from-gold to-orange-400 text-slate-950 font-black rounded-2xl items-center justify-center text-2xl shadow-lg shadow-gold/20 mb-4"
          >
            L
          </motion.div>
          <h2 className="text-slate-500 uppercase tracking-[0.25em] text-[10px] font-bold">Lagoa Experience</h2>
        </header>

        <div className="flex-1">
          <AnimatePresence mode="wait">
            {cliente.status_apresentacao === 'finalizado' ? (
              <motion.div 
                key="finalizado"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-slate-900 border border-slate-800 rounded-[32px] p-8 text-center"
              >
                <div className="w-20 h-20 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <PartyPopper size={40} />
                </div>
                <h1 className="text-2xl font-bold text-white mb-4">Apresentação finalizada</h1>
                <p className="text-slate-400 leading-relaxed">
                  Agradecemos imensamente a sua presença no Lagoa Quente. Esperamos que sua experiência tenha sido incrível!
                </p>
              </motion.div>
            ) : (
              <motion.div 
                key="ativo"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Main Card */}
                <div className="bg-slate-900 border border-gold/20 rounded-[32px] p-8 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                    <CheckCircle2 size={120} />
                  </div>

                  <h1 className="text-3xl font-bold text-white leading-tight mb-8">
                    Olá,<br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold to-orange-300">
                      {cliente.nome_casal}
                    </span>
                  </h1>

                  <div className="space-y-6">
                    <div className="flex gap-4">
                      <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-gold shrink-0">
                        <MapPin size={22} />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Localização</p>
                        <p className="text-lg font-bold text-slate-200">{cliente.sala_apresentacao}</p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-gold shrink-0">
                        <Calendar size={22} />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Data e Horário</p>
                        <p className="text-lg font-bold text-slate-200">
                          {formatDate(cliente.data_apresentacao)} às {cliente.hora_apresentacao.slice(0, 5)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Status Card */}
                <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-[32px] p-8">
                  {cliente.status_apresentacao === 'em_apresentacao' ? (
                    <div className="flex flex-col items-center text-center">
                      <div className="w-16 h-16 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mb-6 relative">
                         <CheckCircle2 size={32} />
                         <span className="absolute inset-0 rounded-full border-2 border-emerald-400 animate-ping opacity-20" />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">Check-in Realizado</h3>
                      <p className="text-sm text-slate-400 mb-4 font-medium uppercase tracking-widest">
                        Registrado às {formatTime(cliente.horario_checkin_apresentacao)}
                      </p>
                      <p className="text-slate-500 text-sm">
                        Sua presença foi registrada com sucesso. Aproveite a apresentação!
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center text-center">
                      <div className="w-16 h-16 bg-gold/10 text-gold rounded-full flex items-center justify-center mb-6 animate-pulse">
                         <Clock size={32} />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">Aguardando Recepção</h3>
                      <p className="text-slate-400 text-sm max-w-[200px] mx-auto">
                        Aguardando confirmação de presença pela recepção da sala.
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <footer className="py-12 text-center">
          <p className="text-[10px] text-slate-600 font-bold uppercase tracking-[0.3em]">
            &copy; {new Date().getFullYear()} Lagoa Quente Group
          </p>
        </footer>
      </main>
    </div>
  );
}
