import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import RecepcaoLogin from "./pages/RecepcaoLogin";
import RecepcaoDashboard from "./pages/RecepcaoDashboard";
import ClienteView from "./pages/ClienteView";
import ClientRegistration from "./pages/ClientRegistration";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const auth = localStorage.getItem("lagoa_auth");
    if (auth === "true") {
      setIsAuthenticated(true);
    }
  }, []);

  return (
    <HashRouter>
      <Routes>
        {/* Redirecionamento Inicial */}
        <Route path="/" element={<Navigate to="/recepcao/login" replace />} />

        {/* Rotas de Recepção */}
        <Route 
          path="/recepcao/login" 
          element={<RecepcaoLogin setIsAuthenticated={setIsAuthenticated} />} 
        />
        <Route 
          path="/recepcao/dashboard" 
          element={isAuthenticated ? <RecepcaoDashboard /> : <Navigate to="/recepcao/login" replace />} 
        />
        <Route 
          path="/recepcao/cadastro" 
          element={isAuthenticated ? <ClientRegistration /> : <Navigate to="/recepcao/login" replace />} 
        />

        {/* Rota do Cliente (Pública) */}
        <Route path="/cliente/:token_cliente" element={<ClienteView />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
}

export default App;
