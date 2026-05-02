import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { supabase } from "../lib/supabaseClient";
import { 
  ArrowLeft, Calendar, Clock, MapPin, Building, CreditCard, 
  Heart, Car, Phone, Mail, Hash, User, Star, MessageSquare, Download
} from "lucide-react";

export default function ClienteDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [cliente, setCliente] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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
      }
      setLoading(false);
    }
    fetchCliente();
  }, [id, navigate]);

  if (loading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center">Carregando...</div>;
  if (!cliente) return null;

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <button 
            onClick={() => navigate("/recepcao/dashboard")}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold transition-colors"
          >
            <ArrowLeft size={18} /> Voltar ao Painel
          </button>

          <div className="flex items-center gap-3">
             <button className="flex items-center gap-2 px-6 py-2.5 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-all shadow-sm">
                <Download size={18} /> Exportar PDF
             </button>
             <button className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-200">
                Editar Dados
             </button>
          </div>
        </div>

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
                 <h1 className="text-4xl font-black tracking-tight mb-2 uppercase">{cliente.nome_casal}</h1>
                 <div className="flex flex-wrap gap-4 items-center mt-4">
                    <span className="px-4 py-1.5 bg-emerald-500 text-white text-xs font-black rounded-full uppercase tracking-widest">{cliente.status_apresentacao.replace('_', ' ')}</span>
                    <span className="flex items-center gap-2 text-slate-400 text-sm font-bold"><Hash size={14}/> Reserva: {cliente.numero_reserva}</span>
                 </div>
              </div>

              <div className="p-8 md:p-10">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <section>
                       <h2 className="text-xs font-black text-slate-300 uppercase tracking-[0.2em] mb-6">Informações Pessoais</h2>
                       <div className="space-y-6">
                          <DataRow icon={<Phone size={16}/>} label="Telefone" value={cliente.telefone} />
                          <DataRow icon={<Mail size={16}/>} label="E-mail" value={cliente.email} />
                          <DataRow icon={<MapPin size={16}/>} label="Cidade / Estado" value={cliente.cidade_estado} />
                          <DataRow icon={<Heart size={16}/>} label="Status Civil" value={cliente.status_civil} />
                       </div>
                    </section>

                    <section>
                       <h2 className="text-xs font-black text-slate-300 uppercase tracking-[0.2em] mb-6">Perfil Socioeconômico</h2>
                       <div className="space-y-6">
                          <DataRow icon={<Building size={16}/>} label="Profissão" value={cliente.profissao} />
                          <DataRow icon={<CreditCard size={16}/>} label="Renda Mensal" value={cliente.renda} />
                          <DataRow icon={<Car size={16}/>} label="Veículo" value={cliente.carro} />
                          <DataRow icon={<Home size={16}/>} label="Casa Própria" value={cliente.possui_casa_propria} />
                       </div>
                    </section>
                 </div>

                 <hr className="my-10 border-slate-100" />

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <section>
                       <h2 className="text-xs font-black text-slate-300 uppercase tracking-[0.2em] mb-6">Hospedagem</h2>
                       <div className="space-y-6">
                          <DataRow icon={<Building size={16}/>} label="Hotel" value={cliente.hotel_hospedagem} />
                          <DataRow icon={<CreditCard size={16}/>} label="Tipo de Pensão" value={cliente.tipo_pensao} />
                          <DataRow icon={<Calendar size={16}/>} label="Check-in/Out Hotel" value={`${cliente.data_checkin_hotel} a ${cliente.data_checkout_hotel}`} />
                          <DataRow icon={<CreditCard size={16}/>} label="Valor Pago" value={cliente.valor_pago} />
                       </div>
                    </section>

                    <section>
                       <h2 className="text-xs font-black text-slate-300 uppercase tracking-[0.2em] mb-6">Apresentação</h2>
                       <div className="space-y-6">
                          <DataRow icon={<MapPin size={16}/>} label="Sala" value={cliente.sala_apresentacao} />
                          <DataRow icon={<Calendar size={16}/>} label="Data" value={cliente.data_apresentacao} />
                          <DataRow icon={<Clock size={16}/>} label="Horário Programado" value={cliente.hora_apresentacao} />
                          <DataRow icon={<Timer size={16}/>} label="Duração Total" value={cliente.duracao_total_minutos ? `${cliente.duracao_total_minutos} min` : "Pendente"} />
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
                   <div className="py-12 text-center">
                      <MessageSquare size={40} className="mx-auto text-slate-200 mb-4" />
                      <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Aguardando Avaliação</p>
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

function EventItem({ label, time }: { label: string, time: string }) {
   if (!time) return null;
   return (
      <div className="flex items-center justify-between gap-4 py-2 border-b border-white/5 last:border-0">
         <span className="text-[11px] font-bold text-slate-100 uppercase tracking-wider">{label}</span>
         <span className="text-[10px] text-slate-500 font-mono italic">{new Date(time).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
      </div>
   );
}
