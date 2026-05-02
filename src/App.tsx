import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import RecepcaoDashboard from "./pages/RecepcaoDashboard";
import ClientRegistration from "./pages/ClientRegistration";
import ClienteDetail from "./pages/ClienteDetail";
import ClienteView from "./pages/ClienteView";

function App() {
  return (
    <HashRouter>
      <Routes>
        {/* Rotas de Recepção */}
        <Route path="/recepcao/login" element={<Login />} />
        <Route path="/recepcao/dashboard" element={<RecepcaoDashboard />} />
        <Route path="/recepcao/cadastro" element={<ClientRegistration />} />
        <Route path="/recepcao/cliente/:id" element={<ClienteDetail />} />
        
        {/* Rota do Cliente */}
        <Route path="/cliente/:token_cliente" element={<ClienteView />} />

        {/* Redirecionamento Padrão */}
        <Route path="/" element={<Navigate to="/recepcao/login" replace />} />
        <Route path="*" element={<Navigate to="/recepcao/login" replace />} />
      </Routes>
    </HashRouter>
  );
}

export default App;
