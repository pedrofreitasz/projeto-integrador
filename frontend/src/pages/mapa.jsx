import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Icon } from 'leaflet';
import Navbar from '../components/navbar';
import Footer from '../components/footer';
import 'leaflet/dist/leaflet.css';

delete Icon.Default.prototype._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const createChargingIcon = (isAvailable = true) => {
  const color = isAvailable ? '#10b981' : '#ef4444';
  const borderColor = isAvailable ? '#059669' : '#dc2626';
  const svg = `
    <svg width="48" height="56" viewBox="0 0 48 56" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="shadow-${isAvailable ? 'green' : 'red'}" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="3"/>
          <feOffset dx="0" dy="3" result="offsetblur"/>
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.4"/>
          </feComponentTransfer>
          <feMerge>
            <feMergeNode/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
        <linearGradient id="grad-${isAvailable ? 'green' : 'red'}" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:${color};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${borderColor};stop-opacity:1" />
        </linearGradient>
      </defs>
      <ellipse cx="24" cy="52" rx="12" ry="4" fill="#000" opacity="0.2"/>
      <path d="M24 4C14 4 6 12 6 22c0 12 18 28 18 28s18-16 18-28c0-10-8-18-18-18z" 
            fill="url(#grad-${isAvailable ? 'green' : 'red'})" 
            stroke="white" 
            stroke-width="2.5"
            filter="url(#shadow-${isAvailable ? 'green' : 'red'})"/>
      <g transform="translate(24, 22)">
        <path d="M-6 -8 L-2 -2 L2 -2 L-2 2 L0 8 L-4 4 L-6 -2 Z" 
              fill="white" 
              stroke="${borderColor}" 
              stroke-width="0.5"/>
        <circle cx="0" cy="0" r="10" fill="none" stroke="white" stroke-width="1.5" opacity="0.3"/>
      </g>
    </svg>
  `;
  
  return new Icon({
    iconUrl: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`,
    iconSize: [48, 56],
    iconAnchor: [24, 56],
    popupAnchor: [0, -56],
  });
};

const pontosCarregamento = [
  {
    id: 1,
    nome: 'Posto de Recarga Chapecó Centro',
    endereco: 'Rua Nereu Ramos, 1000 - Centro, Chapecó',
    cidade: 'Chapecó',
    lat: -27.0953,
    lng: -52.6167,
    tipoConector: 'Tipo 2',
    velocidade: 'Rápida',
    disponivel: true,
    potencia: '22kW'
  },
  {
    id: 2,
    nome: 'Estação EV Charge Concórdia',
    endereco: 'Rodovia SC 283, km 17 - Concórdia',
    cidade: 'Concórdia',
    lat: -27.2333,
    lng: -52.0278,
    tipoConector: 'CCS',
    velocidade: 'Rápida',
    disponivel: true,
    potencia: '50kW'
  },
  {
    id: 3,
    nome: 'Shopping Center Xanxerê',
    endereco: 'Av. Nereu Ramos, 1500 - Centro, Xanxerê',
    cidade: 'Xanxerê',
    lat: -26.8833,
    lng: -52.4000,
    tipoConector: 'Tipo 2',
    velocidade: 'Normal',
    disponivel: true,
    potencia: '7.4kW'
  },
  {
    id: 4,
    nome: 'Posto BR Maravilha',
    endereco: 'BR-282, km 45 - Maravilha',
    cidade: 'Maravilha',
    lat: -26.7667,
    lng: -53.1833,
    tipoConector: 'CCS',
    velocidade: 'Rápida',
    disponivel: false,
    potencia: '50kW'
  },
  {
    id: 5,
    nome: 'Hotel e Restaurante São Miguel',
    endereco: 'Av. Getúlio Vargas, 500 - São Miguel do Oeste',
    cidade: 'São Miguel do Oeste',
    lat: -26.7167,
    lng: -53.5167,
    tipoConector: 'Tipo 2',
    velocidade: 'Normal',
    disponivel: true,
    potencia: '11kW'
  },
  {
    id: 6,
    nome: 'Centro de Eventos Pinhalzinho',
    endereco: 'Rua Principal, 200 - Pinhalzinho',
    cidade: 'Pinhalzinho',
    lat: -26.8500,
    lng: -52.9833,
    tipoConector: 'Tipo 2',
    velocidade: 'Normal',
    disponivel: true,
    potencia: '7.4kW'
  },
  {
    id: 7,
    nome: 'Supermercado Itá',
    endereco: 'Av. Central, 300 - Itá',
    cidade: 'Itá',
    lat: -27.2833,
    lng: -52.3333,
    tipoConector: 'Tipo 2',
    velocidade: 'Normal',
    disponivel: true,
    potencia: '7.4kW'
  },
  {
    id: 8,
    nome: 'Posto Ipiranga Seara',
    endereco: 'BR-282, km 120 - Seara',
    cidade: 'Seara',
    lat: -27.1500,
    lng: -52.3167,
    tipoConector: 'CCS',
    velocidade: 'Rápida',
    disponivel: true,
    potencia: '50kW'
  },
  {
    id: 9,
    nome: 'Shopping Chapecó',
    endereco: 'Av. Getúlio Vargas, 2000 - Centro, Chapecó',
    cidade: 'Chapecó',
    lat: -27.1000,
    lng: -52.6200,
    tipoConector: 'CCS',
    velocidade: 'Rápida',
    disponivel: true,
    potencia: '50kW'
  },
  {
    id: 10,
    nome: 'Posto Shell Formosa',
    endereco: 'BR-282, km 85 - Formosa do Sul',
    cidade: 'Formosa do Sul',
    lat: -26.6500,
    lng: -52.8000,
    tipoConector: 'Tipo 2',
    velocidade: 'Normal',
    disponivel: true,
    potencia: '11kW'
  },
  {
    id: 11,
    nome: 'Hotel Plaza Quilombo',
    endereco: 'Rua 15 de Novembro, 500 - Quilombo',
    cidade: 'Quilombo',
    lat: -26.7333,
    lng: -52.7167,
    tipoConector: 'Tipo 2',
    velocidade: 'Normal',
    disponivel: true,
    potencia: '7.4kW'
  },
  {
    id: 12,
    nome: 'Estação Recarga União do Oeste',
    endereco: 'Av. Principal, 300 - União do Oeste',
    cidade: 'União do Oeste',
    lat: -26.7667,
    lng: -52.8500,
    tipoConector: 'CCS',
    velocidade: 'Rápida',
    disponivel: true,
    potencia: '50kW'
  },
  {
    id: 13,
    nome: 'Supermercado Modelo Coronel Freitas',
    endereco: 'Rua da República, 200 - Coronel Freitas',
    cidade: 'Coronel Freitas',
    lat: -26.9000,
    lng: -52.7000,
    tipoConector: 'Tipo 2',
    velocidade: 'Normal',
    disponivel: true,
    potencia: '7.4kW'
  },
  {
    id: 14,
    nome: 'Posto Petrobras Águas de Chapecó',
    endereco: 'SC-283, km 25 - Águas de Chapecó',
    cidade: 'Águas de Chapecó',
    lat: -27.0667,
    lng: -52.9833,
    tipoConector: 'CCS',
    velocidade: 'Rápida',
    disponivel: false,
    potencia: '50kW'
  },
  {
    id: 15,
    nome: 'Centro Comercial Nova Erechim',
    endereco: 'Av. 7 de Setembro, 800 - Nova Erechim',
    cidade: 'Nova Erechim',
    lat: -26.9000,
    lng: -52.9000,
    tipoConector: 'Tipo 2',
    velocidade: 'Normal',
    disponivel: true,
    potencia: '11kW'
  },
  {
    id: 16,
    nome: 'Estação EV Charge São Lourenço do Oeste',
    endereco: 'Rua XV de Novembro, 400 - São Lourenço do Oeste',
    cidade: 'São Lourenço do Oeste',
    lat: -26.3500,
    lng: -52.8500,
    tipoConector: 'CCS',
    velocidade: 'Rápida',
    disponivel: true,
    potencia: '50kW'
  },
  {
    id: 17,
    nome: 'Hotel e Pousada Guaraciaba',
    endereco: 'Rua Principal, 150 - Guaraciaba',
    cidade: 'Guaraciaba',
    lat: -26.6000,
    lng: -53.5167,
    tipoConector: 'Tipo 2',
    velocidade: 'Normal',
    disponivel: true,
    potencia: '7.4kW'
  },
  {
    id: 18,
    nome: 'Posto Shell Descanso',
    endereco: 'BR-163, km 45 - Descanso',
    cidade: 'Descanso',
    lat: -26.8167,
    lng: -53.5000,
    tipoConector: 'CCS',
    velocidade: 'Rápida',
    disponivel: true,
    potencia: '50kW'
  },
  {
    id: 19,
    nome: 'Shopping Center Chapecó Norte',
    endereco: 'Av. Nereu Ramos, 3000 - Bairro Efapi, Chapecó',
    cidade: 'Chapecó',
    lat: -27.0800,
    lng: -52.6000,
    tipoConector: 'Tipo 2',
    velocidade: 'Rápida',
    disponivel: true,
    potencia: '22kW'
  },
  {
    id: 20,
    nome: 'Estação Recarga Águas Frias',
    endereco: 'Rua Central, 100 - Águas Frias',
    cidade: 'Águas Frias',
    lat: -26.8667,
    lng: -52.8500,
    tipoConector: 'Tipo 2',
    velocidade: 'Normal',
    disponivel: true,
    potencia: '7.4kW'
  },
  {
    id: 21,
    nome: 'Posto BR Ponte Serrada',
    endereco: 'SC-283, km 180 - Ponte Serrada',
    cidade: 'Ponte Serrada',
    lat: -26.7333,
    lng: -52.0167,
    tipoConector: 'CCS',
    velocidade: 'Rápida',
    disponivel: true,
    potencia: '50kW'
  },
  {
    id: 22,
    nome: 'Centro de Convenções Xaxim',
    endereco: 'Av. Getúlio Vargas, 600 - Xaxim',
    cidade: 'Xaxim',
    lat: -26.9667,
    lng: -52.5333,
    tipoConector: 'Tipo 2',
    velocidade: 'Normal',
    disponivel: true,
    potencia: '11kW'
  },
  {
    id: 23,
    nome: 'Hotel Fazenda Entre Rios',
    endereco: 'Rodovia SC-283, km 200 - Entre Rios',
    cidade: 'Entre Rios',
    lat: -26.7167,
    lng: -52.0667,
    tipoConector: 'Tipo 2',
    velocidade: 'Normal',
    disponivel: true,
    potencia: '7.4kW'
  },
  {
    id: 24,
    nome: 'Estação EV Charge Galvão',
    endereco: 'Rua Principal, 250 - Galvão',
    cidade: 'Galvão',
    lat: -26.4500,
    lng: -52.6833,
    tipoConector: 'CCS',
    velocidade: 'Rápida',
    disponivel: true,
    potencia: '50kW'
  },
  {
    id: 25,
    nome: 'Posto Ipiranga Cordilheira Alta',
    endereco: 'SC-283, km 150 - Cordilheira Alta',
    cidade: 'Cordilheira Alta',
    lat: -26.9833,
    lng: -52.6000,
    tipoConector: 'Tipo 2',
    velocidade: 'Normal',
    disponivel: true,
    potencia: '11kW'
  },
  {
    id: 26,
    nome: 'Shopping Center Concórdia Sul',
    endereco: 'Av. Getúlio Vargas, 2500 - Concórdia',
    cidade: 'Concórdia',
    lat: -27.2500,
    lng: -52.0500,
    tipoConector: 'CCS',
    velocidade: 'Rápida',
    disponivel: true,
    potencia: '50kW'
  },
  {
    id: 27,
    nome: 'Hotel e Restaurante Peritiba',
    endereco: 'Rua da Paz, 300 - Peritiba',
    cidade: 'Peritiba',
    lat: -27.3833,
    lng: -51.9000,
    tipoConector: 'Tipo 2',
    velocidade: 'Normal',
    disponivel: true,
    potencia: '7.4kW'
  },
  {
    id: 28,
    nome: 'Estação Recarga Alto Bela Vista',
    endereco: 'Av. Central, 150 - Alto Bela Vista',
    cidade: 'Alto Bela Vista',
    lat: -27.4333,
    lng: -51.9000,
    tipoConector: 'Tipo 2',
    velocidade: 'Normal',
    disponivel: true,
    potencia: '7.4kW'
  },
  {
    id: 29,
    nome: 'Posto Shell Ipumirim',
    endereco: 'BR-282, km 200 - Ipumirim',
    cidade: 'Ipumirim',
    lat: -27.0833,
    lng: -52.1333,
    tipoConector: 'CCS',
    velocidade: 'Rápida',
    disponivel: false,
    potencia: '50kW'
  },
  {
    id: 30,
    nome: 'Centro Comercial Lindóia do Sul',
    endereco: 'Rua Principal, 200 - Lindóia do Sul',
    cidade: 'Lindóia do Sul',
    lat: -27.0500,
    lng: -52.0833,
    tipoConector: 'Tipo 2',
    velocidade: 'Normal',
    disponivel: true,
    potencia: '11kW'
  }
];

function Mapa() {
  const [searchTerm, setSearchTerm] = useState('');
  const [tipoConector, setTipoConector] = useState('Todos');
  const [velocidadeConector, setVelocidadeConector] = useState('Todos');
  const [disponivel, setDisponivel] = useState(false);
  const [pontosFiltrados, setPontosFiltrados] = useState(pontosCarregamento);

  useEffect(() => {
    let filtrados = pontosCarregamento;

    if (searchTerm) {
      filtrados = filtrados.filter(
        ponto =>
          ponto.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
          ponto.cidade.toLowerCase().includes(searchTerm.toLowerCase()) ||
          ponto.endereco.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (tipoConector !== 'Todos') {
      filtrados = filtrados.filter(ponto => ponto.tipoConector === tipoConector);
    }

    if (velocidadeConector !== 'Todos') {
      filtrados = filtrados.filter(ponto => ponto.velocidade === velocidadeConector);
    }

    if (disponivel) {
      filtrados = filtrados.filter(ponto => ponto.disponivel);
    }

    setPontosFiltrados(filtrados);
  }, [searchTerm, tipoConector, velocidadeConector, disponivel]);

  const handleBuscar = () => {
  };

  const center = [-27.0953, -52.6167];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow flex" style={{ height: 'calc(100vh - 140px)' }}>
        <div className="w-96 bg-white p-6 shadow-lg overflow-y-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              Encontre um ponto de recarga
            </h1>
            <p className="text-sm text-gray-600">
              Filtre para achar o melhor local
            </p>
          </div>
          <div className="mb-6">
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por endereço ou cidade"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white"
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Conector
            </label>
            <div className="relative">
              <select
                value={tipoConector}
                onChange={(e) => setTipoConector(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white appearance-none cursor-pointer"
              >
                <option value="Todos">Todos</option>
                <option value="Tipo 2">Tipo 2</option>
                <option value="CCS">CCS</option>
                <option value="CHAdeMO">CHAdeMO</option>
              </select>
              <svg
                className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Velocidade de Conector
            </label>
            <div className="relative">
              <select
                value={velocidadeConector}
                onChange={(e) => setVelocidadeConector(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white appearance-none cursor-pointer"
              >
                <option value="Todos">Todos</option>
                <option value="Rápida">Rápida</option>
                <option value="Normal">Normal</option>
                <option value="Lenta">Lenta</option>
              </select>
              <svg
                className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>

          <div className="mb-6">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-700">
                Disponível
              </label>
              <button
                type="button"
                onClick={() => setDisponivel(!disponivel)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  disponivel ? 'bg-emerald-500' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    disponivel ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          <button
            onClick={handleBuscar}
            className="w-full bg-emerald-500 text-white py-3 rounded-lg font-semibold hover:bg-emerald-600 transition-colors"
          >
            Buscar
          </button>

          <div className="mt-6">
            <p className="text-sm text-gray-600 mb-3">
              {pontosFiltrados.length} ponto(s) encontrado(s)
            </p>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {pontosFiltrados.map((ponto) => (
                <div
                  key={ponto.id}
                  className="p-3 border border-gray-200 rounded-lg hover:border-emerald-500 hover:bg-emerald-50 transition cursor-pointer"
                >
                  <h3 className="font-semibold text-sm text-gray-800">{ponto.nome}</h3>
                  <p className="text-xs text-gray-600 mt-1">{ponto.cidade}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`text-xs px-2 py-1 rounded ${
                      ponto.disponivel 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {ponto.disponivel ? 'Disponível' : 'Indisponível'}
                    </span>
                    <span className="text-xs text-gray-500">{ponto.velocidade}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex-1 relative">
          <MapContainer
            center={center}
            zoom={9}
            style={{ height: '100%', width: '100%', zIndex: 0 }}
            scrollWheelZoom={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
              url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
              subdomains="abcd"
              maxZoom={19}
            />
            {pontosFiltrados.map((ponto) => (
              <Marker
                key={ponto.id}
                position={[ponto.lat, ponto.lng]}
                icon={createChargingIcon(ponto.disponivel)}
              >
                <Popup className="custom-popup">
                  <div className="p-3 min-w-[200px]">
                    <div className="flex items-start gap-3 mb-2">
                      <div className={`flex-shrink-0 w-3 h-3 rounded-full mt-1 ${
                        ponto.disponivel ? 'bg-green-500' : 'bg-red-500'
                      }`}></div>
                      <div className="flex-1">
                        <h3 className="font-bold text-base text-gray-800 mb-1">{ponto.nome}</h3>
                        <p className="text-sm text-gray-600 mb-3">{ponto.endereco}</p>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm border-t pt-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tipo:</span>
                        <span className="font-semibold text-gray-800">{ponto.tipoConector}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Velocidade:</span>
                        <span className="font-semibold text-gray-800">{ponto.velocidade}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Potência:</span>
                        <span className="font-semibold text-gray-800">{ponto.potencia}</span>
                      </div>
                      <div className={`mt-3 pt-2 border-t text-center font-semibold ${
                        ponto.disponivel ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {ponto.disponivel ? '✓ Disponível Agora' : '✗ Indisponível'}
                        </div>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default Mapa;
