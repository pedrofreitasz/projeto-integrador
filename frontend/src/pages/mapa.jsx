import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Icon } from 'leaflet';
import Navbar from '../components/navbar';
import Footer from '../components/footer';
import { getChargingPoints } from '../services/api';
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

function Mapa() {
  const [searchTerm, setSearchTerm] = useState('');
  const [tipoConector, setTipoConector] = useState('Todos');
  const [velocidadeConector, setVelocidadeConector] = useState('Todos');
  const [disponivel, setDisponivel] = useState(false);
  const [pontosCarregamento, setPontosCarregamento] = useState([]);
  const [pontosFiltrados, setPontosFiltrados] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChargingPoints();
  }, []);

  const loadChargingPoints = async () => {
    try {
      setLoading(true);
      const response = await getChargingPoints();
      const pontos = response.pontos.map(ponto => ({
        id: ponto.id,
        nome: ponto.nome,
        endereco: ponto.endereco,
        cidade: ponto.cidade,
        lat: parseFloat(ponto.latitude),
        lng: parseFloat(ponto.longitude),
        tipoConector: ponto.tipoConector,
        velocidade: ponto.velocidade,
        disponivel: ponto.disponivel,
        potencia: ponto.potencia
      }));
      setPontosCarregamento(pontos);
      setPontosFiltrados(pontos);
    } catch (error) {
      console.error("Erro ao carregar pontos de recarga:", error);
    } finally {
      setLoading(false);
    }
  };

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
  }, [searchTerm, tipoConector, velocidadeConector, disponivel, pontosCarregamento]);

  const handleBuscar = () => {};

  const center = [-27.0953, -52.6167];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* layout responsivo: coluna no mobile, linha no desktop */}
      <main className="flex-grow flex flex-col md:flex-row h-[calc(100dvh-140px)]">
        
        {/* sidebar: full width no mobile */}
        <div className="w-full md:w-96 bg-white p-6 shadow-lg overflow-y-auto">
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
              {loading ? 'Carregando...' : `${pontosFiltrados.length} ponto(s) encontrado(s)`}
            </p>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {loading ? (
                <p className="text-center text-gray-500 py-4">Carregando pontos...</p>
              ) : (
                pontosFiltrados.map((ponto) => (
                  <div
                    key={ponto.id}
                    className="p-3 border border-gray-200 rounded-lg hover:border-emerald-500 hover:bg-emerald-50 transition cursor-pointer"
                  >
                    <h3 className="font-semibold text-sm text-gray-800">{ponto.nome}</h3>
                    <p className="text-xs text-gray-600 mt-1">{ponto.cidade}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          ponto.disponivel
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {ponto.disponivel ? 'Disponível' : 'Indisponível'}
                      </span>
                      <span className="text-xs text-gray-500">{ponto.velocidade}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* mapa: altura fixa no mobile, flex-1 no desktop */}
        <div className="flex-1 relative h-80 md:h-auto">
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
            {!loading &&
              pontosFiltrados.map((ponto) => (
                <Marker
                  key={ponto.id}
                  position={[ponto.lat, ponto.lng]}
                  icon={createChargingIcon(ponto.disponivel)}
                >
                  <Popup className="custom-popup">
                    <div className="p-3 min-w-[200px]">
                      <div className="flex items-start gap-3 mb-2">
                        <div
                          className={`flex-shrink-0 w-3 h-3 rounded-full mt-1 ${
                            ponto.disponivel ? 'bg-green-500' : 'bg-red-500'
                          }`}
                        ></div>
                        <div className="flex-1">
                          <h3 className="font-bold text-base text-gray-800 mb-1">
                            {ponto.nome}
                          </h3>
                          <p className="text-sm text-gray-600 mb-3">{ponto.endereco}</p>
                        </div>
                      </div>
                      <div className="space-y-2 text-sm border-t pt-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Tipo:</span>
                          <span className="font-semibold text-gray-800">
                            {ponto.tipoConector}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Velocidade:</span>
                          <span className="font-semibold text-gray-800">
                            {ponto.velocidade}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Potência:</span>
                          <span className="font-semibold text-gray-800">
                            {ponto.potencia}
                          </span>
                        </div>
                        <div
                          className={`mt-3 pt-2 border-t text-center font-semibold ${
                            ponto.disponivel ? 'text-green-600' : 'text-red-600'
                          }`}
                        >
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

