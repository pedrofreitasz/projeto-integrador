import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Perfil() {
  const [usuario, setUsuario] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const usuarioStorage = localStorage.getItem('usuario');
    if (usuarioStorage) {
      const usuarioData = JSON.parse(usuarioStorage);
      fetch(`http://localhost:5000/usuario/${usuarioData.id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.error) throw new Error(data.error);
          setUsuario(data);
        })
        .catch(() => {
          alert('Erro ao carregar perfil');
          navigate('/login');
        });
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('usuario');
    navigate('/login');
  };

  if (!usuario) return <div style={{ padding: '20px' }}>Carregando...</div>;

  return (
    <div style={{ padding: '20px' }}>
      <h1>Perfil</h1>
      <div style={{ marginBottom: '10px' }}>
        <p><strong>Nome:</strong> {usuario.nome}</p>
        <p><strong>Email:</strong> {usuario.email}</p>
      </div>
      <button onClick={handleLogout} style={{ padding: '5px 15px', marginBottom: '10px' }}>
        Sair
      </button>
      <div>
        <Link to="/">Home</Link>
      </div>
    </div>
  );
}

export default Perfil;
