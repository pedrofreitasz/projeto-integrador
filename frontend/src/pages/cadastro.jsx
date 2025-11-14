import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Cadastro() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/cadastro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, email, senha }),
      });
      const data = await response.json();
      if (!response.ok) {
        alert(data.error || 'Erro ao cadastrar');
        return;
      }
      alert('Cadastro realizado!');
      navigate('/login');
    } catch (err) {
      alert('Erro ao cadastrar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Cadastro</h1>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '10px' }}>
          <label>Nome</label><br />
          <input
            type="text"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            style={{ width: '300px', padding: '5px', border: '1px solid #ccc' }}
            required
          />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label>Email</label><br />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: '300px', padding: '5px', border: '1px solid #ccc' }}
            required
          />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label>Senha</label><br />
          <input
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            style={{ width: '300px', padding: '5px', border: '1px solid #ccc' }}
            required
          />
        </div>
        <button type="submit" disabled={loading} style={{ padding: '5px 15px' }}>
          {loading ? 'Cadastrando...' : 'Cadastrar'}
        </button>
      </form>
      <div style={{ marginTop: '10px' }}>
        <Link to="/login">Login</Link> | <Link to="/">Home</Link>
      </div>
    </div>
  );
}

export default Cadastro;
