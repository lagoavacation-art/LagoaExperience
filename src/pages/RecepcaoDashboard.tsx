import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Plus, 
  Users, 
  Clock, 
  LogOut, 
  Search, 
  MoreVertical,
  CheckCircle2,
  XCircle,
  Copy,
  ExternalLink,
  Timer
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { supabase } from "../lib/supabaseClient";

interface Cliente {
  id: string;
  nome_casal: string;
  sala_apresentacao: string;
  token_cliente: string;
  status_apresentacao: string;
  horario_checkin_apresentacao: string | null;
  horario_checkout_apresentacao: string | null;
  duracao_total_minutos: number | null;
  data_apresentacao: string;
  hora_apresentacao: string;
}

export default function RecepcaoDashboard() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchClientes();
    
    // Realtime subscription
    const subscription = supabase
      .channel('public:clientes_apresentacao')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'clientes_apresentacao' }, () => {
        fetchClientes();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const fetchClientes = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('clientes_apresentacao')
      .select('*')
      .order('criado_em', { ascending: false });

    if (error) console.error("Erro ao buscar clientes:", error);
    else setClientes(data || []);
    setLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("lagoa_auth");
    window.location.reload();
  };

  const performCheckin = async (id: string) => {
    const { error } = await supabase
      .from('clientes_apresentacao')
      .update({
        status_apresentacao: 'em_apresentacao',
        horario_checkin_apresentacao: new Date().toISOString()
      })
      .eq('id', id);

    if (error) alert("Erro ao fazer check-in");
  };

  const performCheckout = async (id: string, checkinTime: string | null) => {
    const checkoutTime = new Date();
    let duration = null;
    
    if (checkinTime) {
      const start = new Date(checkinTime);
      duration = Math.floor((checkoutTime.getTime() - start.getTime()) / 60000);
    }

    const { error } = await supabase
      .from('clientes_apresentacao')
      .update({
        status_apresentacao: 'finalizado',
        horario_checkout_apresentacao: checkoutTime.toISOString(),
        duracao_total_minutos: duration
      })
      .eq('id', id);

    if (error) alert("Erro ao finalizar apresentação");
  };

  const copyLink = (token: string) => {
    const url = `${window.location.origin}/#/cliente/${token}`;
    
    navigator.clipboard.writeText(url);
    alert("Link copiado para o cliente!\n" + url);
  };

  const openLink = (token: string) => {
    const url = `${window.location.origin}/#/cliente/${token}`;
    window.open(url, '_blank');
  };

  const filteredClientes = clientes.filter(c => 
    c.nome_casal.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: clientes.length,
    emApresentacao: clientes.filter(c => c.status_apresentacao === 'em_apresentacao').length,
    finalizados: clientes.filter(c => c.status_apresentacao === 'finalizado').length,
    aguardando: clientes.filter(c => c.status_apresentacao === 'aguardando_checkin').length
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gold rounded-xl flex items-center justify-center text-white font-bold">L</div>
            <h1 className="text-xl font-bold tracking-tight">Lagoa Experience</h1>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 text-slate-500 hover:text-red-500 transition-colors"
          >
            <LogOut size={18} />
            <span className="font-medium">Sair</span>
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[
            { label: 'Total Hoje', value: stats.total, icon: Users, color: 'text-blue-600' },
            { label: 'Aguardando', value: stats.aguardando, icon: Clock, color: 'text-amber-600' },
            { label: 'Em Apresentação', value: stats.emApresentacao, icon: Timer, color: 'text-emerald-600' },
            { label: 'Finalizadas', value: stats.finalizados, icon: CheckCircle2, color: 'text-slate-600' }
          ].map((stat, idx) => (
            <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <div className="flex justify-between items-start mb-4">
                <div className={`p-2 rounded-lg bg-slate-50 ${stat.color}`}>
                  <stat.icon size={24} />
                </div>
              </div>
              <p className="text-sm font-medium text-slate-500">{stat.label}</p>
              <p className="text-3xl font-bold">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-8">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text"
              placeholder="Buscar casal..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-gold outline-none"
            />
          </div>
          <button 
            onClick={() => navigate("/recepcao/cadastro")}
            className="w-full md:w-auto px-6 py-3 bg-slate-900 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-all"
          >
            <Plus size={20} />
            Novo Cadastro
          </button>
        </div>

        {/* List */}
        <div className="grid grid-cols-1 gap-4">
          {loading ? (
            <p className="text-center py-10 text-slate-400">Carregando...</p>
          ) : filteredClientes.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
              <Users className="mx-auto text-slate-300 mb-4" size={48} />
              <p className="text-slate-500 font-medium">Nenhum cliente encontrado</p>
            </div>
          ) : (
            filteredClientes.map(cliente => (
              <ClientCard 
                key={cliente.id} 
                cliente={cliente} 
                onCheckin={() => performCheckin(cliente.id)}
                onCheckout={() => performCheckout(cliente.id, cliente.horario_checkin_apresentacao)}
                onCopy={() => copyLink(cliente.token_cliente)}
                onOpen={() => openLink(cliente.token_cliente)}
              />
            ))
          )}
        </div>
      </main>
    </div>
  );
}

const ClientCard: React.FC<{
  cliente: Cliente;
  onCheckin: () => void;
  onCheckout: () => void;
  onCopy: () => void;
  onOpen: () => void;
}> = ({ cliente, onCheckin, onCheckout, onCopy, onOpen }) => {
  const [elapsed, setElapsed] = useState<number>(0);

  useEffect(() => {
    let interval: any;
    if (cliente.status_apresentacao === 'em_apresentacao' && cliente.horario_checkin_apresentacao) {
      interval = setInterval(() => {
        const start = new Date(cliente.horario_checkin_apresentacao!).getTime();
        const now = new Date().getTime();
        setElapsed(Math.floor((now - start) / 60000));
      }, 10000);
      
      // Update immediately
      const start = new Date(cliente.horario_checkin_apresentacao!).getTime();
      const now = new Date().getTime();
      setElapsed(Math.floor((now - start) / 60000));
    }
    return () => clearInterval(interval);
  }, [cliente.status_apresentacao, cliente.horario_checkin_apresentacao]);

  const getTimerColor = () => {
    if (elapsed >= 90) return "text-red-500 font-black animate-pulse";
    if (elapsed >= 60) return "text-amber-500 font-bold";
    return "text-emerald-500 font-medium";
  };

  return (
    <motion.div 
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
    >
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-1">
          <h3 className="text-lg font-bold">{cliente.nome_casal}</h3>
          <StatusBadge status={cliente.status_apresentacao} />
        </div>
        <div className="flex flex-wrap gap-4 text-sm text-slate-500">
          <span className="flex items-center gap-1"><ExternalLink size={14} /> {cliente.sala_apresentacao}</span>
          <span className="flex items-center gap-1"><Clock size={14} /> {cliente.hora_apresentacao.slice(0, 5)}</span>
          {cliente.status_apresentacao === 'em_apresentacao' && (
            <span className={`flex items-center gap-1 ${getTimerColor()}`}>
              <Timer size={14} /> {elapsed} min decorridos
            </span>
          )}
          {cliente.status_apresentacao === 'finalizado' && (
            <span className="text-slate-400">Duração: {cliente.duracao_total_minutos} min</span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button 
          onClick={onOpen}
          className="p-3 text-gold hover:bg-gold/10 rounded-xl transition-colors"
          title="Ver Link Público"
        >
          <ExternalLink size={20} />
        </button>
        <button 
          onClick={onCopy}
          className="p-3 text-slate-500 hover:bg-slate-100 rounded-xl transition-colors"
          title="Copiar Link"
        >
          <Copy size={20} />
        </button>
        
        {cliente.status_apresentacao === 'aguardando_checkin' && (
          <button 
            onClick={onCheckin}
            className="flex-1 md:flex-none px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all flex items-center justify-center gap-2"
          >
            Realizar Check-in
          </button>
        )}

        {cliente.status_apresentacao === 'em_apresentacao' && (
          <button 
            onClick={onCheckout}
            className="flex-1 md:flex-none px-6 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-all flex items-center justify-center gap-2"
          >
            Finalizar
          </button>
        )}

        <button className="p-3 text-slate-400">
          <MoreVertical size={20} />
        </button>
      </div>
    </motion.div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config: any = {
    'aguardando_checkin': { label: 'Aguardando', class: 'bg-amber-100 text-amber-700 border-amber-200' },
    'em_apresentacao': { label: 'Em Curso', class: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
    'finalizado': { label: 'Finalizado', class: 'bg-slate-100 text-slate-600 border-slate-200' }
  };
  const { label, class: className } = config[status] || config['aguardando_checkin'];
  return (
    <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full border ${className}`}>
      {label}
    </span>
  );
}
