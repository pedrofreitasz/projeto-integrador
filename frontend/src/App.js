import React, { useEffect, useState } from 'react';

function App() {
  const [dados, setDados] = useState([]);

  useEffect(() => {
    fetch('http://localhost:5000/data')
      .then((res) => res.json())
      .then((data) => setDados(data))
      .catch((err) => console.error('Erro ao buscar dados:', err));
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <h1 className="text-3xl font-bold mb-4 text-gray-800">📦 Dados do Banco</h1>
      <ul className="bg-white shadow-lg rounded-lg p-6 w-96">
        {dados.length > 0 ? (
          dados.map((item) => (
            <li key={item.id} className="border-b last:border-0 py-2 text-gray-700">
              {item.nome}
            </li>
          ))
        ) : (
          <li className="text-gray-500 text-center">Carregando...</li>
        )}
      </ul>
    </div>
  );
}

export default App;