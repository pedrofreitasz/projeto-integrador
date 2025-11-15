import { useState } from "react";
import { login } from "../services/api";
import { Link, useNavigate } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    
    try {
      const res = await login({ email, senha });

      if (res.token) {
        localStorage.setItem("token", res.token);
        navigate("/perfil");
      } else {
        setError("Erro ao fazer login");
      }
    } catch (err) {
      setError(err.message || "Erro ao fazer login");
    }
  }

  return (
    <div>
      <h1>Login</h1>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <form onSubmit={handleSubmit}>
        <input style={{ width: '300px', padding: '5px', border: '1px solid #ccc' }} placeholder="Email" onChange={e => setEmail(e.target.value)} />
        <input style={{ width: '300px', padding: '5px', border: '1px solid #ccc' }} type="password" placeholder="Senha" onChange={e => setSenha(e.target.value)} />
        <button>Entrar</button>
      </form>
      <div>
        <Link to="/cadastro">Cadastro</Link> | <Link to="/">Home</Link>
      </div>
    </div>
  );
}

