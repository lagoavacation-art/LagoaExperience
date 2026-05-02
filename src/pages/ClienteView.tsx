import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { supabase } from "../lib/supabaseClient";
import { Star, Send, Sparkles, CheckCircle2, Clock, MapPin, Calendar } from "lucide-react";

export default function ClienteView() {
  const { token_cliente } = useParams();
  const [cliente, setCliente] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [nota, setNota] = useState(0);
  const [comentario, setComentario] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [avaliado, setAvaliado] = useState(false);
  const [realtimeStatus, setRealtimeStatus] = useState<string>("connecting");

  const buscarCliente = async () => {
    if (!token_cliente) return;
    
    const { data, error } = await supabase
      .from('cliente_apresentacao_publica')
      .select('*')
      .eq('token_cliente', token_cliente)
      .single();

    if (error) {
      console.error("Erro ao carregar dados:", error);
      setCliente(null);
    } else {
      setCliente(data);
      if (data.avaliacao_nota) setAvaliado(true);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!token_cliente) return;

    buscarCliente();

    // Inscrição para atualizações em tempo real (status pode mudar enquanto o cliente está na página)
    const channel = supabase
      .channel(`realtime-cliente-${token_cliente}`)
      .on(
        'postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'clientes_apresentacao', 
          filter: `token_cliente=eq.${token_cliente}` 
        }, 
        (payload) => {
          console.log('Evento Realtime recebido no cliente:', payload);
          buscarCliente();
        }
      )
      .subscribe((status) => {
        console.log('Status Realtime Cliente:', status);
        setRealtimeStatus(status);
      });

    return () => { 
      supabase.removeChannel(channel); 
    };
  }, [token_cliente]);

  const handleAvaliar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (nota === 0) return alert("Por favor, selecione uma nota.");
    
    setSubmitting(true);
    try {
      const { data, error } = await supabase.rpc('registrar_avaliacao_cliente', {
        p_token_cliente: token_cliente,
        p_nota: nota,
        p_comentario: comentario
      });

      if (error) throw error;
      if (data.success) {
        setAvaliado(true);
      } else {
        alert(data.message);
      }
    } catch (error) {
       console.error("Erro ao enviar avaliação:", error);
       alert("Erro ao enviar avaliação. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">Carregando experiência...</div>;
  if (!cliente) return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white text-center p-8">Link inválido ou expirado.</div>;

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Background Decor */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-full">
         <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-600/10 blur-[120px] rounded-full" />
         <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/10 blur-[120px] rounded-full" />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-xl bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl relative z-10"
      >
        <div className="p-8 md:p-12">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-600 rounded-[1.25rem] mb-6 shadow-lg shadow-emerald-900/20">
               <Sparkles className="text-white" size={32} />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight mb-2">Olá, {cliente.nome_casal}</h1>
            <p className="text-slate-400 font-medium">Bem-vindo ao Lagoa Experience</p>
          </div>

          <AnimatePresence mode="wait">
            {cliente.status_apresentacao === 'finalizado' ? (
               avaliado ? (
                  <motion.div 
                    key="avaliado"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center py-10"
                  >
                     <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 className="text-emerald-500" size={48} />
                     </div>
                     <h2 className="text-2xl font-bold text-white mb-4">Obrigado pela sua avaliação!</h2>
                     <p className="text-slate-400 leading-relaxed mb-8">
                        Sua opinião foi registrada com sucesso e nos ajuda a melhorar cada vez mais a experiência Lagoa Experience.
                     </p>
                     <div className="pt-6 border-t border-white/5">
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-2">Precisa de ajuda?</p>
                        <p className="text-slate-400 text-xs">
                          Caso deseje falar com nossa equipe, entre em contato com a Central de Relacionamento pelo número:
                        </p>
                        <a href="tel:08009605040" className="text-lg font-black text-emerald-400 hover:text-emerald-300 block mt-2">0800 960 5040</a>
                     </div>
                  </motion.div>
               ) : (
                  <motion.form 
                    key="form-avaliacao"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    onSubmit={handleAvaliar} 
                    className="space-y-8"
                  >
                     <div className="text-center">
                        <h2 className="text-xl font-bold text-white mb-2">Como foi sua experiência?</h2>
                        <p className="text-slate-400 text-sm">Sua opinião é muito importante para continuarmos melhorando o atendimento Lagoa Experience.</p>
                     </div>

                     <div className="flex justify-center gap-3">
                        {[1, 2, 3, 4, 5].map((star) => (
                           <button
                             key={star}
                             type="button"
                             onClick={() => setNota(star)}
                             className="group transition-transform active:scale-90"
                           >
                              <Star 
                                size={44} 
                                className={`transition-all ${star <= nota ? "text-amber-500 fill-amber-500 scale-110" : "text-white/10 hover:text-white/20"}`} 
                              />
                           </button>
                        ))}
                     </div>

                     <div className="space-y-4">
                        <textarea 
                           placeholder="Conte como foi sua experiência..."
                           className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-white placeholder:text-slate-600 outline-none focus:border-emerald-500/50 transition-all min-h-[140px] resize-none"
                           value={comentario}
                           onChange={e => setComentario(e.target.value)}
                        />
                        <button 
                           type="submit"
                           disabled={submitting || nota === 0}
                           className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-30 disabled:hover:bg-emerald-600 text-white font-bold rounded-2xl transition-all shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-3"
                        >
                           {submitting ? "Enviando..." : <><Send size={18} /> Enviar avaliação</>}
                        </button>
                     </div>
                  </motion.form>
               )
            ) : (
               <motion.div 
                 key="status-info"
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 className="space-y-8"
               >
                  <div className="bg-white/5 border border-white/10 rounded-[2rem] p-8 space-y-6">
                     <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-400">
                           <Calendar size={20} />
                        </div>
                        <div>
                           <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none mb-1">Data da Visita</p>
                           <p className="text-white font-bold">{cliente.data_apresentacao}</p>
                        </div>
                     </div>
                     <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-400">
                           <MapPin size={20} />
                        </div>
                        <div>
                           <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none mb-1">Localização</p>
                           <p className="text-white font-bold">{cliente.sala_apresentacao}</p>
                        </div>
                     </div>
                  </div>

                  <div className="text-center p-6 bg-emerald-500/5 rounded-[2rem] border border-emerald-500/10 border-dashed">
                     {cliente.status_apresentacao === 'aguardando_checkin' ? (
                        <>
                           <div className="inline-flex items-center gap-2 text-amber-500 font-bold mb-2">
                              <p className="text-sm">AGUARDANDO RECEPÇÃO</p>
                           </div>
                           <p className="text-slate-400 text-sm leading-relaxed px-4">
                              Sua apresentação está agendada para às <span className="text-white font-bold">{cliente.hora_apresentacao}h</span>. 
                              Aguardando confirmação de presença pela recepção.
                           </p>
                        </>
                     ) : (
                        <>
                           <div className="inline-flex items-center gap-2 text-emerald-500 font-bold mb-2">
                              <CheckCircle2 size={16} />
                              <p className="text-sm uppercase tracking-wider font-black">Presente</p>
                           </div>
                           <p className="text-slate-400 text-sm leading-relaxed px-4">
                              Check-in efetuado com sucesso. Sua presença foi registrada pela recepção às <span className="text-white font-bold">{new Date(cliente.horario_checkin_apresentacao).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}h</span>.
                           </p>
                        </>
                     )}
                  </div>
               </motion.div>
            )}
          </AnimatePresence>
        </div>

        {realtimeStatus === 'SUBSCRIBED' && (
          <div className="px-8 py-3 bg-white/[0.02] border-t border-white/5 flex items-center justify-center gap-2">
             <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
             <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Atualização automática ativa</span>
          </div>
        )}
      </motion.div>

      <div className="mt-12 text-center relative z-10">
         <p className="text-[10px] text-slate-700 font-black uppercase tracking-[0.4em]">
            &copy; {new Date().getFullYear()} Lagoa Experience Group
         </p>
      </div>
    </div>
  );
}
