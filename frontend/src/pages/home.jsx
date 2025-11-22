import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from "../components/navbar";
import Footer from "../components/footer";

function Home() {
  const pages = [
    { path: '/login', name: 'Login' },
    { path: '/cadastro', name: 'Cadastro' },
    { path: '/perfil', name: 'Perfil' },
    { path: '/calculadora', name: 'Calculadora' },
    { path: '/orcamentos', name: 'Orçamentos' },
    { path: '/historico', name: 'Histórico' },
    { path: '/mapa', name: 'Mapa' },
    { path: '/configuracoes', name: 'Configurações' },
    { path: '/faq', name: 'FAQ' },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow">
        <section>
          <h1>Página Home</h1>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default Home;
