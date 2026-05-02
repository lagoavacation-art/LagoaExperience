import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, User } from "lucide-react";
import { motion } from "motion/react";

interface Props {
  setIsAuthenticated: (val: boolean) => void;
}

export default function RecepcaoLogin({ setIsAuthenticated }: Props) {
  const [user, setUser] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (user === "recepcao" && pin === "1234") {
      localStorage.setItem("lagoa_auth", "true");
      setIsAuthenticated(true);
      navigate("/recepcao/dashboard");
    } else {
      setError("Usuário ou PIN incorretos");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gold/10 text-gold mb-4">
            <Lock size={32} />
          </div>
          <h1 className="text-2xl font-bold text-white">Lagoa Experience</h1>
          <p className="text-slate-400">Acesso Restrito - Recepção</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Usuário</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input 
                type="text"
                value={user}
                onChange={(e) => setUser(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-gold focus:border-transparent outline-none transition-all"
                placeholder="Ex: recepcao"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">PIN de Acesso</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input 
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-gold focus:border-transparent outline-none transition-all"
                placeholder="••••"
                required
              />
            </div>
          </div>

          {error && (
            <p className="text-red-500 text-sm text-center">{error}</p>
          )}

          <button 
            type="submit"
            className="w-full py-4 bg-gradient-to-r from-gold to-orange-400 text-slate-950 font-bold rounded-xl hover:shadow-[0_0_20px_rgba(251,191,36,0.4)] transition-all active:scale-[0.98]"
          >
            ENTRAR
          </button>
        </form>
      </motion.div>
    </div>
  );
}
