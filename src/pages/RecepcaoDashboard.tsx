import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { supabase } from "../lib/supabaseClient";
import { 
  Users, UserCheck, Play, CheckCircle2, Star, Clock, Search, 
  Plus, LogOut, ExternalLink, Copy, Timer, ShieldAlert,
  ChevronRight, Filter, MoreVertical, SlidersHorizontal, MapPin
} from "lucide-react";

export default function RecepcaoDashboard() {
  const navigate = useNavigate();
  const [clientes, setClientes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("todos");
  const [ultimaAtualizacao, setUltimaAtualizacao] = useState<Date | null>(null);
  const [msgSucesso, setMsgSucesso] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [showDebug, setShowDebug] = useState(false);
  
  const [stats, setStats] = useState({
    total: 0,
    aguardando: 0,
    em_apresentacao: 0,
    finalizadas: 0,
    avaliacoes: 0,
    media: 0,
    atrasados: 0
  });

  const fetchClientes = useCallback(async (isSilent = false) => {
    if (!isSilent) setUpdating(true);
    try {
      const { data, error } = await supabase
        .from('clientes_apresentacao')
        .select('*')
        .order('criado_em', { ascending: false });

      if (error) {
        setDebugInfo({ type: 'fetch_error', error });
        throw error;
      }
      
      if (data) {
        setClientes(data);
        calculateStats(data);
        setUltimaAtualizacao(new Date());
        if (!isSilent && !loading) {
          setMsgSucesso("Dados atualizados com sucesso.");
          setTimeout(() => setMsgSucesso(null), 3000);
        }
      }
    } catch (error: any) {
      console.error("Erro ao buscar clientes:", error);
      setDebugInfo({ last_error: error.message, time: new Date().toISOString() });
    } finally {
      setLoading(false);
      setUpdating(false);
    }
  }, [loading]);

  const testarConexao = async () => {
    setUpdating(true);
    try {
      const { data, error } = await supabase
        .from('clientes_apresentacao')
        .select('id, nome_casal, criado_em')
        .limit(1);
      
      if (error) throw error;
      alert("Conexão com Supabase funcionando.");
      setDebugInfo({ last_test: 'success', data });
    } catch (error: any) {
      alert(`Erro na conexão: ${error.message}`);
      setDebugInfo({ last_test: 'failure', error });
    } finally {
      setUpdating(false);
    }
  };

  const testarSalvamento = async () => {
    setUpdating(true);
    const token = "teste-" + Date.now();
    const payload = {
      nome_casal: "TESTE SISTEMA",
      sala_apresentacao: "Sala Teste",
      data_apresentacao: new Date().toISOString().split('T')[0],
      hora_apresentacao: "12:00",
      status_apresentacao: "aguardando_checkin",
      token_cliente: token
    };

    try {
      const { data, error } = await supabase
        .from('clientes_apresentacao')
        .insert([payload])
        .select();

      if (error) throw error;
      alert("Salvamento de teste concluído com sucesso!");
      setDebugInfo({ last_save_test: 'success', data });
      fetchClientes(true);
    } catch (error: any) {
      alert(`Erro no salvamento de teste: ${error.message}`);
      setDebugInfo({ last_save_test: 'failure', error, payload });
    } finally {
      setUpdating(false);
    }
  };

  useEffect(() => {
    fetchClientes();
    const channel = supabase
      .channel('schema-db-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'clientes_apresentacao' }, () => {
        fetchClientes(true);
      })
      .subscribe();
    
    return () => { supabase.removeChannel(channel); };
  }, [fetchClientes]);

  const calculateStats = (data: any[]) => {
    const total = data.length;
    const aguardando = data.filter(c => c.status_apresentacao === 'aguardando_checkin').length;
    const em_apresentacao = data.filter(c => c.status_apresentacao === 'em_apresentacao').length;
    const finalizadas = data.filter(c => c.status_apresentacao === 'finalizado').length;
    const avaliacoesData = data.filter(c => c.avaliacao_nota > 0);
    const avaliacoes = avaliacoesData.length;
    const media = avaliacoes > 0 ? (avaliacoesData.reduce((acc, curr) => acc + curr.avaliacao_nota, 0) / avaliacoes) : 0;
    
    setStats({ total, aguardando, em_apresentacao, finalizadas, avaliacoes, media, atrasados: 0 });
  };

  const logout = () => {
    localStorage.removeItem("lagoa_auth");
    navigate("/recepcao/login");
  };

  const handleCheckIn = async (id: string) => {
    try {
      const { error } = await supabase
        .from('clientes_apresentacao')
        .update({ 
          status_apresentacao: 'em_apresentacao',
          horario_checkin_apresentacao: new Date().toISOString()
        })
        .eq('id', id);
      if (error) throw error;
    } catch (error) {
      alert("Erro no check-in");
    }
  };

  const handleCheckOut = async (id: string) => {
    try {
      const { data: client } = await supabase.from('clientes_apresentacao').select('*').eq('id', id).single();
      const checkin = new Date(client.horario_checkin_apresentacao);
      const checkout = new Date();
      const diffMs = checkout.getTime() - checkin.getTime();
      const diffMin = Math.round(diffMs / 60000);

      const { error } = await supabase
        .from('clientes_apresentacao')
        .update({ 
          status_apresentacao: 'finalizado',
          horario_checkout_apresentacao: checkout.toISOString(),
          duracao_total_minutos: diffMin
        })
        .eq('id', id);
      if (error) throw error;
    } catch (error) {
      alert("Erro no check-out");
    }
  };

  const filteredClientes = clientes.filter(c => {
    const matchesSearch = c.nome_casal?.toLowerCase().includes(search.toLowerCase()) || 
                          c.numero_reserva?.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filterStatus === "todos" || c.status_apresentacao === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'aguardando_checkin': return <span className="px-3 py-1 bg-amber-50 text-amber-600 border border-amber-100 rounded-full text-xs font-bold uppercase tracking-wider">Aguardando</span>;
      case 'em_apresentacao': return <span className="px-3 py-1 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1 w-fit animate-pulse"><Timer size={12}/> Em Andamento</span>;
      case 'finalizado': return <span className="px-3 py-1 bg-slate-50 text-slate-500 border border-slate-200 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1 w-fit"><CheckCircle2 size={12}/> Finalizado</span>;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Topbar */}
      <nav className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-100">
              <Users size={20} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight leading-none mb-1">Lagoa Experience</h1>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Dashboard Operacional</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => fetchClientes()}
              disabled={updating}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 font-bold rounded-xl hover:bg-emerald-100 transition-all disabled:opacity-50"
            >
              <Timer size={18} className={updating ? "animate-spin" : ""} />
              {updating ? "Atualizando..." : "Atualizar"}
            </button>
            
            <button 
              onClick={() => setShowDebug(!showDebug)}
              className={`p-2.5 rounded-xl transition-all border ${showDebug ? 'bg-slate-900 text-white' : 'text-slate-400 hover:text-slate-900 border-transparent hover:border-slate-200'}`}
              title="Área de Depuração"
            >
              <ShieldAlert size={20} />
            </button>

            <button 
              onClick={() => navigate("/recepcao/cadastro")}
              className="hidden md:flex items-center gap-2 px-6 py-2.5 bg-slate-900 hover:bg-emerald-600 text-white font-bold rounded-xl transition-all shadow-lg shadow-slate-200"
            >
              <Plus size={18} /> Novo Cliente
            </button>
            <div className="h-8 w-px bg-slate-200 mx-2" />
            <button onClick={logout} className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all border border-transparent hover:border-red-100">
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </nav>

      <main className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full space-y-10">
        {/* Alerts & Messages */}
        <AnimatePresence>
          {msgSucesso && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-emerald-500 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-emerald-200/50 flex items-center justify-between"
            >
              <span className="flex items-center gap-2"><CheckCircle2 size={18} /> {msgSucesso}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Debug Area */}
        <AnimatePresence>
          {showDebug && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mb-10"
            >
              <div className="bg-slate-900 rounded-3xl p-8 text-slate-300 border border-slate-800 shadow-2xl">
                 <div className="flex items-center justify-between mb-8">
                    <h3 className="text-white font-bold flex items-center gap-2"><ShieldAlert size={20} className="text-red-400"/> Depuração Supabase</h3>
                    <div className="flex gap-3">
                       <button onClick={testarConexao} className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-bold transition-all">Testar Conexão</button>
                       <button onClick={testarSalvamento} className="px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 rounded-lg text-xs font-bold transition-all">Testar Salvamento</button>
                    </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8 font-mono text-xs">
                    <div className="space-y-4">
                       <p><span className="text-slate-500">URL:</span> {import.meta.env.VITE_SUPABASE_URL}</p>
                       <p><span className="text-slate-500">Tabela:</span> clientes_apresentacao</p>
                       <p><span className="text-slate-500">Auth Status:</span> {localStorage.getItem("lagoa_auth") === "true" ? "LOGADO (LOCAL)" : "DESLOGADO"}</p>
                       <p><span className="text-slate-500">Conexão:</span> <span className={debugInfo?.last_test === 'failure' ? "text-red-400" : "text-emerald-400"}>{debugInfo?.last_test || 'não testada'}</span></p>
                    </div>
                    <div className="bg-black/20 p-4 rounded-xl border border-white/5 max-h-40 overflow-y-auto">
                       <p className="text-slate-500 mb-2 uppercase text-[10px] font-bold">Última Resposta / Erro:</p>
                       <pre className="text-[10px]">{JSON.stringify(debugInfo, null, 2)}</pre>
                    </div>
                 </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center justify-between">
           <div>
              <h2 className="text-2xl font-bold text-slate-900">Visão Geral</h2>
              {ultimaAtualizacao && (
                <p className="text-xs text-slate-400 font-medium">Última atualização: {ultimaAtualizacao.toLocaleString('pt-BR')}</p>
              )}
           </div>
        </div>

        {/* Stats Cards */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <StatCard icon={<Users size={24} />} label="Total" value={stats.total} color="bg-blue-500" />
          <StatCard icon={<UserCheck size={24} />} label="Aguardando" value={stats.aguardando} color="bg-amber-500" />
          <StatCard icon={<Play size={24} />} label="Em Curso" value={stats.em_apresentacao} color="bg-emerald-500" />
          <StatCard icon={<Star size={24} />} label="Média Aval." value={stats.media.toFixed(1)} color="bg-indigo-500" />
        </section>

        {/* Toolbar */}
        <div className="bg-white p-4 md:p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar por nome ou reserva..."
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/20 focus:bg-white transition-all text-sm font-medium"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
            {[
              { id: 'todos', label: 'Todos' },
              { id: 'aguardando_checkin', label: 'Aguardando' },
              { id: 'em_apresentacao', label: 'Em Curso' },
              { id: 'finalizado', label: 'Concluído' }
            ].map(f => (
              <button 
                key={f.id}
                onClick={() => setFilterStatus(f.id)}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                  filterStatus === f.id 
                    ? 'bg-slate-900 border-slate-900 text-white' 
                    : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Table/List */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Informações do Casal</th>
                  <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest hidden md:table-cell">Hospedagem / Sala</th>
                  <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Status / Horário</th>
                  <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                <AnimatePresence mode="popLayout">
                  {filteredClientes.map(cliente => (
                    <motion.tr 
                      key={cliente.id}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="group hover:bg-slate-50/50 transition-all cursor-pointer"
                      onClick={() => navigate(`/recepcao/cliente/${cliente.id}`)}
                    >
                      <td className="px-6 py-6">
                        <div className="flex flex-col gap-1">
                          <span className="font-bold text-slate-900 tracking-tight">{cliente.nome_casal}</span>
                          <span className="text-xs text-slate-400 font-medium">Reserva: {cliente.numero_reserva || 'N/A'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-6 hidden md:table-cell">
                        <div className="flex flex-col gap-1">
                          <span className="text-sm font-semibold text-slate-700">{cliente.hotel_hospedagem || 'Hotel não definido'}</span>
                          <span className="text-xs text-slate-400 flex items-center gap-1 font-medium italic"><MapPin size={10}/> {cliente.sala_apresentacao}</span>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="flex flex-col gap-2">
                          {getStatusBadge(cliente.status_apresentacao)}
                          <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">
                            {cliente.data_apresentacao} às {cliente.hora_apresentacao}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-6" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-2">
                          {cliente.status_apresentacao === 'aguardando_checkin' && (
                            <button 
                              onClick={() => handleCheckIn(cliente.id)}
                              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-all flex items-center gap-2 shadow-md shadow-emerald-50"
                            >
                              <Play size={14} fill="currentColor"/> Check-in
                            </button>
                          )}
                          {cliente.status_apresentacao === 'em_apresentacao' && (
                            <button 
                              onClick={() => handleCheckOut(cliente.id)}
                              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition-all flex items-center gap-2 shadow-md shadow-slate-100"
                            >
                              <CheckCircle2 size={14}/> Check-out
                            </button>
                          )}
                          <button 
                             onClick={() => {
                               const url = `${window.location.origin}/#/cliente/${cliente.token_cliente}`;
                               navigator.clipboard.writeText(url);
                               alert("Link copiado para o cliente!");
                             }}
                             className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-white border hover:border-emerald-100 rounded-lg transition-all shadow-sm"
                             title="Copiar Link Cliente"
                          >
                            <Copy size={16}/>
                          </button>
                          <button className="p-2 text-slate-400 hover:text-slate-900 rounded-lg transition-all">
                            <ChevronRight size={20}/>
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
                {!loading && filteredClientes.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center gap-4 text-slate-300">
                        <Users size={48} strokeWidth={1} />
                        <p className="font-bold text-slate-400 tracking-wide uppercase text-xs">Nenhum cliente cadastrado</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
      
      {/* Botão flutuante mobile */}
      <button 
        onClick={() => navigate("/recepcao/cadastro")}
        className="md:hidden fixed bottom-6 right-6 w-14 h-14 bg-slate-900 text-white rounded-full shadow-2xl flex items-center justify-center z-40 active:scale-95 transition-all"
      >
        <Plus size={28} />
      </button>
    </div>
  );
}

function StatCard({ icon, label, value, color }: { icon: any, label: string, value: any, color: string }) {
  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden group hover:border-emerald-200 transition-all">
      <div className={`absolute top-0 right-0 w-24 h-24 ${color} opacity-[0.03] rounded-bl-full`} />
      <div className={`p-2.5 w-fit rounded-xl ${color} text-white mb-4 shadow-sm`}>
        {icon}
      </div>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-1">{label}</p>
      <p className="text-3xl font-black text-slate-900 tracking-tight">{value}</p>
    </div>
  );
}
