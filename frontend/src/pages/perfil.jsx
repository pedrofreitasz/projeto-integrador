import { useEffect, useState } from "react";
import { Link, useNavigate } from 'react-router-dom';
import { getProfile } from "../services/api";

export default function Perfil() {
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    getProfile(token)
      .then(data => {
        setUser(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message || "Erro ao carregar perfil");
        setLoading(false);
        if (err.message.includes("Token") || err.message.includes("401")) {
          localStorage.removeItem("token");
          navigate("/login");
        }
      });
  }, [navigate]);

  if (loading) return <p>Carregando...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (!user) return <p>Nenhum dado encontrado</p>;
  
  return (
    <div style={{ padding: '20px' }}>
      <h1>Perfil</h1>
      <div>
        <p>ID: {user.id}</p>
        <p>Nome: {user.nome}</p>
        <p>Email: {user.email}</p>
        <p>Cadastrado em: {user.created_at}</p>
      </div>
      <div>
        <Link to="/"><b>Home</b></Link>
      </div>
    </div>
  );
}
