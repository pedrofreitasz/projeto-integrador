import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/home';
import Login from './pages/login';
import Cadastro from './pages/cadastro';
import Perfil from './pages/perfil';
import Calculadora from './pages/calculadora';
import Orcamentos from './pages/orçamentos';
import Mapa from './pages/mapa';
import Configuracoes from './pages/configuracoes';
import FAQ from './pages/FAQ';
import Dashboard from './pages/dashboard';
import LoginFuncionario from './pages/login-funcionario';
import CadastroFuncionario from './pages/cadastro-funcionario';
import DashboardFuncionario from './pages/dashboard-funcionario';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/perfil" element={<Perfil />} />
        <Route path="/calculadora" element={<Calculadora />} />
        <Route path="/orcamentos" element={<Orcamentos />} />
        <Route path="/historico" element={<Dashboard />} />
        <Route path="/mapa" element={<Mapa />} />
        <Route path="/configuracoes" element={<Configuracoes />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/login-funcionario" element={<LoginFuncionario />} />
        <Route path="/cadastro-funcionario" element={<CadastroFuncionario />} />
        <Route path="/dashboard-funcionario" element={<DashboardFuncionario />} />
      </Routes>
    </Router>
  );
}

export default App;
