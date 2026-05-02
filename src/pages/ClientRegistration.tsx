import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { supabase } from "../lib/supabaseClient";
import { ArrowLeft, Save, UserPlus, Calendar, Clock, MapPin, Building, CreditCard, Heart, Car, Home, Phone, Mail, Hash, ShieldAlert } from "lucide-react";

export default function ClientRegistration() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nome_casal: "",
    telefone: "",
    cidade_estado: "",
    profissao: "",
    possui_casa_propria: "",
    renda: "",
    carro: "",
    status_civil: "",
    email: "",
    valor_pago: "",
    tipo_pensao: "",
    data_checkin_hotel: "",
    data_checkout_hotel: "",
    numero_reserva: "",
    hotel_hospedagem: "",
    sala_apresentacao: "Sala Lagoa Eco Towers",
    data_apresentacao: new Date().toISOString().split('T')[0],
    hora_apresentacao: "12:00"
  });

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);
    setDebugInfo(null);
    
    // Gerar token cliente
    const token = Math.random().toString(36).substring(2, 8) + Date.now().toString().slice(-4);
    
    const payload = {
      ...formData,
      token_cliente: token,
      status_apresentacao: 'aguardando_checkin'
    };

    console.log('Payload enviado ao Supabase:', payload);
    setDebugInfo({ last_attempt: new Date().toISOString(), payload });

    try {
      const { data, error } = await supabase
        .from('clientes_apresentacao')
        .insert([payload])
        .select();

      console.log('Resposta Supabase:', { data, error });

      if (error) {
        setDebugInfo({ error, payload, time: new Date().toISOString() });
        throw error;
      }

      alert("Cliente cadastrado com sucesso! Token: " + token);
      navigate("/recepcao/dashboard");
    } catch (error: any) {
      console.error("Erro ao salvar:", error);
      setErrorMessage(`Erro ao cadastrar no Supabase: [${error.code || 'CODE_ERR'}] ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all placeholder:text-slate-300 text-slate-700";
  const labelClass = "block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1";

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <button 
            onClick={() => navigate("/recepcao/dashboard")}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold transition-colors"
          >
            <ArrowLeft size={18} /> Voltar ao Dashboard
          </button>
          
          <button 
            onClick={() => setDebugInfo(debugInfo ? null : { status: 'Aguardando ação' })}
            className="text-xs font-bold text-slate-400 hover:text-slate-900 flex items-center gap-1"
          >
            <ShieldAlert size={14} /> {debugInfo ? "Esconder Depuração" : "Ver Depuração"}
          </button>
        </div>

        {errorMessage && (
          <div className="mb-8 p-6 bg-red-50 border border-red-100 rounded-2xl">
            <p className="text-red-700 font-bold flex items-center gap-2 mb-2">
              <ShieldAlert size={20} /> Erro do Banco de Dados
            </p>
            <p className="text-red-600 text-sm font-medium mb-4">{errorMessage}</p>
          </div>
        )}

        {debugInfo && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-8 p-6 bg-slate-900 rounded-2xl text-slate-300 font-mono text-[10px] border border-slate-800 shadow-xl"
          >
            <p className="text-white font-bold mb-4 flex items-center gap-2 uppercase tracking-widest text-[10px]"><ShieldAlert size={14} className="text-red-400"/> Depuração Supabase (Cadastro)</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div>
                  <p className="text-slate-500 mb-1">Último Payload:</p>
                  <pre className="bg-black/20 p-3 rounded-lg overflow-x-auto max-h-40">{JSON.stringify(debugInfo.payload || {}, null, 2)}</pre>
               </div>
               <div>
                  <p className="text-slate-500 mb-1">Última Resposta / Erro:</p>
                  <pre className="bg-black/20 p-3 rounded-lg overflow-x-auto max-h-40">{JSON.stringify(debugInfo.error || debugInfo.data || debugInfo, null, 2)}</pre>
               </div>
            </div>
          </motion.div>
        )}

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden"
        >
          <div className="bg-slate-900 p-8 text-white">
            <div className="flex items-center gap-4 mb-2">
              <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center">
                <UserPlus size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Novo Cadastro</h1>
                <p className="text-slate-400 text-sm">Preencha todos os campos da ficha de apresentação</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-8 md:p-12 space-y-10">
            {/* Seção 1: Identificação */}
            <div>
              <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                <span className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-900 text-sm font-bold">1</span>
                Dados Básicos do Casal
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={labelClass}>Nome do Casal</label>
                  <div className="relative">
                    <Heart className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input type="text" required placeholder="Ex: João e Maria Silva" className={inputClass} value={formData.nome_casal} onChange={e => setFormData({...formData, nome_casal: e.target.value})} />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Telefone / WhatsApp</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input type="text" placeholder="(DD) 99999-9999" className={inputClass} value={formData.telefone} onChange={e => setFormData({...formData, telefone: e.target.value})} />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Cidade / Estado</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input type="text" placeholder="Ex: Goiânia / GO" className={inputClass} value={formData.cidade_estado} onChange={e => setFormData({...formData, cidade_estado: e.target.value})} />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>E-mail</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input type="email" placeholder="email@exemplo.com" className={inputClass} value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                  </div>
                </div>
              </div>
            </div>

            {/* Seção 2: Perfil Socioeconômico */}
            <div>
              <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                <span className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-900 text-sm font-bold">2</span>
                Perfil e Patrimônio
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className={labelClass}>Profissão</label>
                  <input type="text" placeholder="Digite a profissão" className={inputClass} value={formData.profissao} onChange={e => setFormData({...formData, profissao: e.target.value})} />
                </div>
                <div>
                  <label className={labelClass}>Status Civil</label>
                  <input type="text" placeholder="Ex: Casados" className={inputClass} value={formData.status_civil} onChange={e => setFormData({...formData, status_civil: e.target.value})} />
                </div>
                <div>
                  <label className={labelClass}>Possui Casa Própria?</label>
                  <input type="text" placeholder="Sim / Não" className={inputClass} value={formData.possui_casa_propria} onChange={e => setFormData({...formData, possui_casa_propria: e.target.value})} />
                </div>
                <div>
                  <label className={labelClass}>Renda Mensal</label>
                  <div className="relative">
                    <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input type="text" placeholder="Ex: R$ 15.000" className={inputClass} value={formData.renda} onChange={e => setFormData({...formData, renda: e.target.value})} />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Modelo do Carro</label>
                  <div className="relative">
                    <Car className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input type="text" placeholder="Ex: Toyota Corolla 2024" className={inputClass} value={formData.carro} onChange={e => setFormData({...formData, carro: e.target.value})} />
                  </div>
                </div>
                 <div>
                  <label className={labelClass}>Tipo de Pensão</label>
                  <input type="text" placeholder="Ex: Meia Pensão" className={inputClass} value={formData.tipo_pensao} onChange={e => setFormData({...formData, tipo_pensao: e.target.value})} />
                </div>
              </div>
            </div>

            {/* Seção 3: Hospedagem */}
            <div>
              <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                <span className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-900 text-sm font-bold">3</span>
                Hospedagem e Reserva
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={labelClass}>Hotel de Hospedagem</label>
                  <div className="relative">
                    <Building className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input type="text" placeholder="Nome do Resort/Hotel" className={inputClass} value={formData.hotel_hospedagem} onChange={e => setFormData({...formData, hotel_hospedagem: e.target.value})} />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Número da Reserva</label>
                  <div className="relative">
                    <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input type="text" placeholder="Código da Reserva" className={inputClass} value={formData.numero_reserva} onChange={e => setFormData({...formData, numero_reserva: e.target.value})} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Check-in Hotel</label>
                    <input type="date" className={inputClass} value={formData.data_checkin_hotel} onChange={e => setFormData({...formData, data_checkin_hotel: e.target.value})} />
                  </div>
                  <div>
                    <label className={labelClass}>Check-out Hotel</label>
                    <input type="date" className={inputClass} value={formData.data_checkout_hotel} onChange={e => setFormData({...formData, data_checkout_hotel: e.target.value})} />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Valor Pago (Pacote)</label>
                  <input type="text" placeholder="Ex: R$ 2.500,00" className={inputClass} value={formData.valor_pago} onChange={e => setFormData({...formData, valor_pago: e.target.value})} />
                </div>
              </div>
            </div>

            {/* Seção 4: Detalhes da Apresentação */}
            <div className="bg-emerald-50/50 p-8 rounded-3xl border border-emerald-100">
              <h2 className="text-lg font-bold text-emerald-900 mb-6 flex items-center gap-2">
                <span className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white text-sm font-bold">4</span>
                Agendamento da Apresentação
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1">
                  <label className={labelClass}>Sala de Apresentação</label>
                  <input type="text" placeholder="Digite o nome da sala" className={inputClass} value={formData.sala_apresentacao} onChange={e => setFormData({...formData, sala_apresentacao: e.target.value})} />
                </div>
                <div>
                  <label className={labelClass}>Data</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input type="date" required className={inputClass} value={formData.data_apresentacao} onChange={e => setFormData({...formData, data_apresentacao: e.target.value})} />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Hora</label>
                  <div className="relative">
                    <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input type="time" required className={inputClass} value={formData.hora_apresentacao} onChange={e => setFormData({...formData, hora_apresentacao: e.target.value})} />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6">
              <button 
                type="submit" 
                disabled={loading}
                className="w-full py-5 bg-slate-900 hover:bg-emerald-600 text-white font-bold rounded-2xl shadow-xl transition-all flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {loading ? "Salvando..." : <><Save size={22} /> Cadastrar e Gerar Link</>}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
