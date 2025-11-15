import { useState } from "react";
import { Link, useNavigate } from 'react-router-dom';
import { register } from "../services/api";

export default function Register() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    
    try {
      await register({ nome, email, senha });
      setSuccess("Usuário registrado com sucesso! Redirecionando...");
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      setError(err.message || "Erro ao registrar usuário");
    }
  }

  return (
    <div>
      <h1>Cadastro</h1>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      {success && <div style={{ color: 'green' }}>{success}</div>}
      <form onSubmit={handleSubmit}>
        <input style={{ width: '300px', padding: '5px', border: '1px solid #ccc' }} placeholder="Nome" onChange={e => setNome(e.target.value)} />
        <input style={{ width: '300px', padding: '5px', border: '1px solid #ccc' }} placeholder="Email" onChange={e => setEmail(e.target.value)} />
        <input style={{ width: '300px', padding: '5px', border: '1px solid #ccc' }} type="password" placeholder="Senha" onChange={e => setSenha(e.target.value)} />
        <button>Cadastrar</button>
      </form>

      <div style={{ marginTop: "10px" }}>
        <Link to="/login">Login</Link> | <Link to="/">Home</Link>
      </div>
    </div>
  );
}


