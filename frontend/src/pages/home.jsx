import React from 'react';
import { Link } from 'react-router-dom';

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
    <div style={{ padding: '20px' }}>
      <h1>Home</h1>
      <ul>
        {pages.map((page) => (
          <li key={page.path} style={{ marginBottom: '5px' }}>
            <Link to={page.path}>{page.name}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Home;
