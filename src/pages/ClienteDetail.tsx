import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { supabase } from "../lib/supabaseClient";
import { 
  ArrowLeft, Calendar, Clock, MapPin, Building, CreditCard, 
  Heart, Car, Phone, Mail, Hash, User, Star, MessageSquare, Download, Home, Timer, ShieldAlert, Save, X
} from "lucide-react";

export default function ClienteDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [cliente, setCliente] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [evaluating, setEvaluating] = useState(false);
  const [evalNota, setEvalNota] = useState(5);
  const [evalComentario, setEvalComentario] = useState("");

  const handleSaveEvaluation = async () => {
    setSaving(true);
    try {
      const { data, error } = await supabase.rpc('registrar_avaliacao_cliente', {
        p_token_cliente: cliente.token_cliente,
        p_nota: evalNota,
        p_comentario: evalComentario
      });

      if (error) throw error;
      if (data.success) {
        alert("Avaliação registrada!");
        setEvaluating(false);
        // Refresh data
        const { data: updated } = await supabase.from('clientes_apresentacao').select('*').eq('id', id).single();
        setCliente(updated);
      } else {
        alert(data.message);
      }
    } catch (error: any) {
      alert("Erro ao registrar avaliação: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    async function fetchCliente() {
      const { data, error } = await supabase
        .from('clientes_apresentacao')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error("Erro:", error);
        navigate("/recepcao/dashboard");
      } else {
        setCliente(data);
        setFormData(data);
      }
      setLoading(false);
    }
    fetchCliente();
  }, [id, navigate]);

  const handleSave = async () => {
    setSaving(true);
    setErrorMessage(null);
    
    // Mapeamento explícito para garantir integridade no Supabase
    const payload = {
      nome_casal: formData.nome_casal,
      telefone: formData.telefone,
      cidade_estado: formData.cidade_estado,
      profissao: formData.profissao,
      possui_casa_propria: formData.possui_casa_propria,
      renda: formData.renda,
      carro: formData.carro,
      status_civil: formData.status_civil,
      email: formData.email,
      valor_pago: formData.valor_pago,
      tipo_pensao: formData.tipo_pensao,
      data_checkin_hotel: formData.data_checkin_hotel,
      data_checkout_hotel: formData.data_checkout_hotel,
      numero_reserva: formData.numero_reserva,
      hotel_hospedagem: formData.hotel_hospedagem,
      sala_apresentacao: formData.sala_apresentacao,
      data_apresentacao: formData.data_apresentacao,
      hora_apresentacao: formData.hora_apresentacao,
      atualizado_em: new Date().toISOString()
    };

    setDebugInfo({ last_attempt: new Date().toISOString(), payload });

    try {
      const { data, error } = await supabase
        .from('clientes_apresentacao')
        .update(payload)
        .eq('id', id)
        .select();

      console.log('Resposta Supabase (Update):', { data, error });

      if (error) {
        setDebugInfo({ 
          error: {
            code: error.code,
            message: error.message,
            details: error.details,
            hint: error.hint
          }, 
          payload, 
          time: new Date().toISOString() 
        });
        throw error;
      }

      if (data && data.length > 0) {
        setCliente(data[0]);
        setIsEditing(false);
        alert("Cadastro atualizado com sucesso!");
      }
    } catch (error: any) {
      console.error("Erro ao salvar:", error);
      setErrorMessage(`Erro ao atualizar no Supabase: [${error.code || 'CODE_ERR'}] ${error.message} - ${error.details || ''}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center">Carregando...</div>;
  if (!cliente) return null;

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-5xl mx-auto text-slate-900">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <button 
            onClick={() => navigate("/recepcao/dashboard")}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold transition-colors"
          >
            <ArrowLeft size={18} /> Voltar ao Painel
          </button>

          <div className="flex items-center gap-3">
             {isEditing ? (
               <>
                 <button 
                  onClick={() => setIsEditing(false)}
                  className="flex items-center gap-2 px-6 py-2.5 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-all shadow-sm"
                 >
                    <X size={18} /> Cancelar
                 </button>
                 <button 
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-100 disabled:opacity-50"
                 >
                    <Save size={18} /> {saving ? "Salvando..." : "Salvar Alterações"}
                 </button>
               </>
             ) : (
               <>
                 <button className="hidden md:flex items-center gap-2 px-6 py-2.5 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-all shadow-sm">
                    <Download size={18} /> Exportar PDF
                 </button>
                 <button 
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
                 >
                    Editar Dados
                 </button>
               </>
             )}
          </div>
        </div>

        {errorMessage && (
          <div className="mb-8 p-6 bg-red-50 border border-red-100 rounded-2xl">
            <p className="text-red-700 font-bold flex items-center gap-2 mb-2">
              <ShieldAlert size={20} /> Erro ao Salvar Edição
            </p>
            <p className="text-red-600 text-sm font-medium mb-4">{errorMessage}</p>
          </div>
        )}

        {debugInfo && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mb-8 p-6 bg-slate-900 rounded-2xl text-slate-300 font-mono text-[10px] border border-slate-800 shadow-xl overflow-hidden"
          >
            <p className="text-white font-bold mb-4 flex items-center gap-2 uppercase tracking-widest"><ShieldAlert size={14} className="text-red-400"/> Depuração Supabase (Edição)</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div>
                  <p className="text-slate-500 mb-1">Payload enviado:</p>
                  <pre className="bg-black/20 p-3 rounded-lg overflow-x-auto max-h-40">{JSON.stringify(debugInfo.payload || {}, null, 2)}</pre>
               </div>
               <div>
                  <p className="text-slate-500 mb-1">Última Resposta / Erro:</p>
                  <pre className="bg-black/20 p-3 rounded-lg overflow-x-auto max-h-40">{JSON.stringify(debugInfo.error || debugInfo.data || debugInfo, null, 2)}</pre>
               </div>
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Coluna 1: Principal */}
          <div className="lg:col-span-2 space-y-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden"
            >
              <div className="bg-slate-900 p-8 text-white relative">
                 <div className="absolute top-0 right-0 p-8 opacity-10">
                    <User size={80} />
                 </div>
                 {isEditing ? (
                   <div className="space-y-4 max-w-lg">
                      <input 
                        className="text-4xl font-black bg-white/10 border border-white/20 rounded-xl px-4 py-2 w-full outline-none focus:border-emerald-500"
                        value={formData.nome_casal}
                        onChange={e => setFormData({...formData, nome_casal: e.target.value})}
                      />
                      <input 
                        className="bg-white/10 border border-white/20 rounded-xl px-4 py-2 w-full outline-none text-slate-300"
                        value={formData.numero_reserva}
                        placeholder="Nº Reserva"
                        onChange={e => setFormData({...formData, numero_reserva: e.target.value})}
                      />
                   </div>
                 ) : (
                   <>
                    <h1 className="text-4xl font-black tracking-tight mb-2 uppercase">{cliente.nome_casal}</h1>
                    <div className="flex flex-wrap gap-4 items-center mt-4">
                        <span className="px-4 py-1.5 bg-emerald-500 text-white text-xs font-black rounded-full uppercase tracking-widest">{cliente.status_apresentacao.replace('_', ' ')}</span>
                        <span className="flex items-center gap-2 text-slate-400 text-sm font-bold"><Hash size={14}/> Reserva: {cliente.numero_reserva}</span>
                    </div>
                   </>
                 )}
              </div>

              <div className="p-8 md:p-10">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <section>
                       <h2 className="text-xs font-black text-slate-300 uppercase tracking-[0.2em] mb-6">Informações Pessoais</h2>
                       <div className="space-y-6">
                           {isEditing ? (
                             <>
                                <EditField label="Telefone" value={formData.telefone} onChange={v => setFormData({...formData, telefone: v})} />
                                <EditField label="E-mail" value={formData.email} onChange={v => setFormData({...formData, email: v})} />
                                <EditField label="Cidade/Estado" value={formData.cidade_estado} onChange={v => setFormData({...formData, cidade_estado: v})} />
                                <EditField label="Status Civil" value={formData.status_civil} onChange={v => setFormData({...formData, status_civil: v})} />
                             </>
                           ) : (
                             <>
                                <DataRow icon={<Phone size={16}/>} label="Telefone" value={cliente.telefone} />
                                <DataRow icon={<Mail size={16}/>} label="E-mail" value={cliente.email} />
                                <DataRow icon={<MapPin size={16}/>} label="Cidade / Estado" value={cliente.cidade_estado} />
                                <DataRow icon={<Heart size={16}/>} label="Status Civil" value={cliente.status_civil} />
                             </>
                           )}
                       </div>
                    </section>

                    <section>
                       <h2 className="text-xs font-black text-slate-300 uppercase tracking-[0.2em] mb-6">Perfil Socioeconômico</h2>
                       <div className="space-y-6">
                           {isEditing ? (
                             <>
                                <EditField label="Profissão" value={formData.profissao} onChange={v => setFormData({...formData, profissao: v})} />
                                <EditField label="Renda Mensal" value={formData.renda} onChange={v => setFormData({...formData, renda: v})} />
                                <EditField label="Veículo" value={formData.carro} onChange={v => setFormData({...formData, carro: v})} />
                                <EditField label="Casa Própria" value={formData.possui_casa_propria} onChange={v => setFormData({...formData, possui_casa_propria: v})} />
                             </>
                           ) : (
                             <>
                                <DataRow icon={<Building size={16}/>} label="Profissão" value={cliente.profissao} />
                                <DataRow icon={<CreditCard size={16}/>} label="Renda Mensal" value={cliente.renda} />
                                <DataRow icon={<Car size={16}/>} label="Veículo" value={cliente.carro} />
                                <DataRow icon={<Home size={16}/>} label="Casa Própria" value={cliente.possui_casa_propria} />
                             </>
                           )}
                       </div>
                    </section>
                 </div>

                 <hr className="my-10 border-slate-100" />

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <section>
                       <h2 className="text-xs font-black text-slate-300 uppercase tracking-[0.2em] mb-6">Hospedagem</h2>
                       <div className="space-y-6">
                           {isEditing ? (
                             <>
                                <EditField label="Hotel" value={formData.hotel_hospedagem} onChange={v => setFormData({...formData, hotel_hospedagem: v})} />
                                <EditField label="Tipo de Pensão" value={formData.tipo_pensao} onChange={v => setFormData({...formData, tipo_pensao: v})} />
                                <EditField label="Valor Pago" value={formData.valor_pago} onChange={v => setFormData({...formData, valor_pago: v})} />
                             </>
                           ) : (
                             <>
                                <DataRow icon={<Building size={16}/>} label="Hotel" value={cliente.hotel_hospedagem} />
                                <DataRow icon={<CreditCard size={16}/>} label="Tipo de Pensão" value={cliente.tipo_pensao} />
                                <DataRow icon={<Calendar size={16}/>} label="Check-in/Out Hotel" value={`${cliente.data_checkin_hotel} a ${cliente.data_checkout_hotel}`} />
                                <DataRow icon={<CreditCard size={16}/>} label="Valor Pago" value={cliente.valor_pago} />
                             </>
                           )}
                       </div>
                    </section>

                    <section>
                       <h2 className="text-xs font-black text-slate-300 uppercase tracking-[0.2em] mb-6">Apresentação</h2>
                       <div className="space-y-6">
                           {isEditing ? (
                             <>
                                <EditField label="Sala" value={formData.sala_apresentacao} onChange={v => setFormData({...formData, sala_apresentacao: v})} />
                                <EditField label="Data" value={formData.data_apresentacao} onChange={v => setFormData({...formData, data_apresentacao: v})} />
                                <EditField label="Horário Programado" value={formData.hora_apresentacao} onChange={v => setFormData({...formData, hora_apresentacao: v})} />
                             </>
                           ) : (
                             <>
                                <DataRow icon={<MapPin size={16}/>} label="Sala" value={cliente.sala_apresentacao} />
                                <DataRow icon={<Calendar size={16}/>} label="Data" value={cliente.data_apresentacao} />
                                <DataRow icon={<Clock size={16}/>} label="Horário Programado" value={cliente.hora_apresentacao} />
                                <DataRow icon={<Timer size={16}/>} label="Duração Total" value={cliente.duracao_total_minutos ? `${cliente.duracao_total_minutos} min` : "Pendente"} />
                             </>
                           )}
                       </div>
                    </section>
                 </div>
              </div>
            </motion.div>
          </div>

          {/* Coluna 2: Avaliação e Comentários */}
          <div className="space-y-8">
             <motion.div 
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100"
             >
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-6 uppercase tracking-wider">
                   <Star className="text-amber-500" size={18} /> Avaliação da Experiência
                </h3>
                
                {cliente.avaliacao_nota ? (
                   <div className="space-y-6">
                      <div className="flex items-center gap-1">
                         {[1,2,3,4,5].map(star => (
                            <Star key={star} size={24} className={star <= cliente.avaliacao_nota ? "text-amber-500 fill-amber-500" : "text-slate-200"} />
                         ))}
                         <span className="ml-3 text-2xl font-black text-slate-900">{cliente.avaliacao_nota}</span>
                      </div>
                      <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                         <p className="text-xs font-bold text-slate-400 uppercase mb-2">Comentário do Cliente:</p>
                         <p className="text-slate-700 font-medium leading-relaxed italic">
                            "{cliente.avaliacao_comentario || "Nenhum comentário enviado."}"
                         </p>
                      </div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Enviada em: {new Date(cliente.avaliacao_criada_em).toLocaleString('pt-BR')}</p>
                   </div>
                ) : (
                   <div className="space-y-6">
                      {evaluating ? (
                        <div className="space-y-4">
                           <div className="flex justify-center gap-2">
                              {[1,2,3,4,5].map(star => (
                                <button key={star} onClick={() => setEvalNota(star)}>
                                  <Star size={32} className={star <= evalNota ? "text-amber-500 fill-amber-500" : "text-slate-200"} />
                                </button>
                              ))}
                           </div>
                           <textarea 
                             className="w-full bg-slate-50 border border-slate-100 rounded-xl p-4 text-sm outline-none focus:border-emerald-500 h-24 resize-none"
                             placeholder="Observações da experiência..."
                             value={evalComentario}
                             onChange={e => setEvalComentario(e.target.value)}
                           />
                           <div className="flex gap-2">
                              <button onClick={() => setEvaluating(false)} className="flex-1 py-2 text-xs font-bold text-slate-400 hover:text-slate-600 transition-all">Cancelar</button>
                              <button 
                                onClick={handleSaveEvaluation}
                                className="flex-1 py-2 bg-emerald-600 text-white text-xs font-bold rounded-lg shadow-lg shadow-emerald-100"
                              >
                                {saving ? "Salvando..." : "Salvar Avaliação"}
                              </button>
                           </div>
                        </div>
                      ) : (
                        <div className="py-12 text-center">
                           <MessageSquare size={40} className="mx-auto text-slate-200 mb-4" />
                           <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mb-4">Aguardando Avaliação</p>
                           {cliente.status_apresentacao === 'finalizado' && (
                             <button 
                               onClick={() => setEvaluating(true)}
                               className="px-6 py-2 bg-emerald-50 text-emerald-600 border border-emerald-100 text-xs font-bold rounded-full hover:bg-emerald-100 transition-all"
                             >
                               Avaliar Manualmente
                             </button>
                           )}
                        </div>
                      )}
                   </div>
                )}
             </motion.div>

             <motion.div 
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               transition={{ delay: 0.1 }}
               className="bg-slate-900 p-8 rounded-3xl shadow-2xl shadow-slate-300 border border-slate-800"
             >
                <h3 className="text-xs font-bold text-slate-400 mb-4 uppercase tracking-widest">Histórico de Eventos</h3>
                <div className="space-y-4">
                  <EventItem label="Check-in efetuado" time={cliente.horario_checkin_apresentacao} />
                  <EventItem label="Finalização efetuada" time={cliente.horario_checkout_apresentacao} />
                  <EventItem label="Cadastro criado" time={cliente.criado_em} />
                </div>
             </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

function EditField({ label, value, onChange }: { label: string, value: string, onChange: (v: string) => void }) {
  return (
    <div>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      <input 
        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium outline-none focus:border-emerald-500"
        value={value || ""}
        onChange={e => onChange(e.target.value)}
      />
    </div>
  );
}

function EventItem({ label, time }: { label: string, time: string }) {
   if (!time) return null;
   return (
      <div className="flex items-center justify-between gap-4 py-2 border-b border-white/5 last:border-0">
         <span className="text-[11px] font-bold text-slate-100 uppercase tracking-wider">{label}</span>
         <span className="text-[10px] text-slate-500 font-mono italic">{new Date(time).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
      </div>
   );
}

function DataRow({ icon, label, value }: { icon: any, label: string, value: string }) {
   return (
      <div className="flex gap-4">
         <div className="mt-1 text-slate-300">{icon}</div>
         <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">{label}</p>
            <p className="text-sm font-bold text-slate-700 tracking-tight">{value || "---"}</p>
         </div>
      </div>
   );
}
