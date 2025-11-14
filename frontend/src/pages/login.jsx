import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha }),
      });
      const data = await response.json();
      if (!response.ok) {
        alert(data.error || 'Erro ao fazer login');
        return;
      }
      localStorage.setItem('usuario', JSON.stringify(data.usuario));
      navigate('/perfil');
    } catch (err) {
      alert('Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Login</h1>
      <form onSubmit={handleSubmit}>
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
          {loading ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
      <div style={{ marginTop: '10px' }}>
        <Link to="/cadastro">Cadastro</Link> | <Link to="/">Home</Link>
      </div>
    </div>
  );
}

export default Login;
