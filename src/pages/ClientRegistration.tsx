import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Users, MapPin, Calendar, Clock } from "lucide-react";
import { supabase } from "../lib/supabaseClient";

export default function ClientRegistration() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nome_casal: "",
    sala_apresentacao: "Sala Lagoa Eco Towers",
    data_apresentacao: new Date().toISOString().split('T')[0],
    hora_apresentacao: "12:00",
    token_cliente: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const token = formData.token_cliente || `TK-${Math.floor(Math.random() * 1000000)}`;

    const { error } = await supabase
      .from('clientes_apresentacao')
      .insert([{
        ...formData,
        token_cliente: token,
        status_apresentacao: 'aguardando_checkin'
      }]);

    if (error) {
      alert("Erro ao cadastrar: " + error.message);
    } else {
      alert("Cliente cadastrado com sucesso! Token: " + token);
      navigate("/recepcao/dashboard");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-500 mb-6 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Voltar</span>
        </button>

        <div className="bg-white rounded-[32px] shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-8 bg-slate-900 text-white">
            <h1 className="text-2xl font-bold">Novo Cadastro</h1>
            <p className="text-slate-400">Preencha os dados da apresentação</p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Nome do Casal</label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="text"
                    required
                    value={formData.nome_casal}
                    onChange={e => setFormData({...formData, nome_casal: e.target.value})}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-gold outline-none"
                    placeholder="Ex: João / Maria"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Sala de Apresentação</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <select 
                    value={formData.sala_apresentacao}
                    onChange={e => setFormData({...formData, sala_apresentacao: e.target.value})}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-gold outline-none appearance-none"
                  >
                    <option>Sala Lagoa Eco Towers</option>
                    <option>Sala Lagoa Quente - Parque</option>
                    <option>Sala Centro de Negócios</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Data</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      type="date"
                      required
                      value={formData.data_apresentacao}
                      onChange={e => setFormData({...formData, data_apresentacao: e.target.value})}
                      className="w-full pl-10 pr-3 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-gold outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Horário</label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      type="time"
                      required
                      value={formData.hora_apresentacao}
                      onChange={e => setFormData({...formData, hora_apresentacao: e.target.value})}
                      className="w-full pl-10 pr-3 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-gold outline-none"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Token Personalizado (Opcional)</label>
                <input 
                  type="text"
                  value={formData.token_cliente}
                  onChange={e => setFormData({...formData, token_cliente: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-gold outline-none"
                  placeholder="Ex: token-exemplo-406317"
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
            >
              <Save size={20} />
              {loading ? "SALVANDO..." : "SALVAR CADASTRO"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
