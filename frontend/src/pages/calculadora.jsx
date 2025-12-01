import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { Icon } from 'leaflet';
import Navbar from "../components/navbar";
import Footer from "../components/footer";
import { createInstallationRequest } from "../services/api";
import "leaflet/dist/leaflet.css";

delete Icon.Default.prototype._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

function MapClickHandler({ onMapClick }) {
  useMapEvents({ click: (e) => onMapClick(e.latlng) });
  return null;
}

function Calculadora() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [tipoInstalacao, setTipoInstalacao] = useState(null);
  const [residenceType, setResidenceType] = useState('casa');
  const [distance, setDistance] = useState(15);
  const [chargerType, setChargerType] = useState('wallbox');
  const [endereco, setEndereco] = useState('');
  const [cidade, setCidade] = useState('');
  const [estado, setEstado] = useState('');
  const [cep, setCep] = useState('');
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const calculateCosts = () => {
    let materialCost = 0;
    let laborCost = 0;

    if (tipoInstalacao === 'domestica') {
      if (chargerType === 'portatil') {
        materialCost = 1500;
        laborCost = 800;
      } else if (chargerType === 'wallbox') {
        materialCost = 3000;
        laborCost = 1000;
      }

      if (distance > 10) {
        const extraMeters = distance - 10;
        materialCost += extraMeters * 50;
        laborCost += extraMeters * 30;
      }

      if (residenceType === 'apartamento') {
        materialCost += 300;
        laborCost += 200;
      }
    } else if (tipoInstalacao === 'publica') {
      materialCost = 8000;
      laborCost = 2500;
      
      if (distance > 10) {
        const extraMeters = distance - 10;
        materialCost += extraMeters * 100;
        laborCost += extraMeters * 50;
      }
    }

    return {
      material: materialCost,
      labor: laborCost,
      total: materialCost + laborCost
    };
  };

  const costs = calculateCosts();

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const handleSubmit = async () => {
    if (!endereco || !cidade) {
      setError('Por favor, preencha o endereço e a cidade.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await createInstallationRequest({
        tipoInstalacao,
        endereco,
        cidade,
        estado: estado || null,
        cep: cep || null,
        distanciaQuadro: tipoInstalacao === 'domestica' ? distance : null,
        tipoResidencia: tipoInstalacao === 'domestica' ? residenceType : null,
        tipoCarregador: tipoInstalacao === 'domestica' ? chargerType : null,
        precoTotal: costs.total,
        latitude: selectedLocation ? selectedLocation[0] : null,
        longitude: selectedLocation ? selectedLocation[1] : null
      });

      alert('Solicitação de instalação enviada com sucesso! Um responsável entrará em contato em breve.');
      navigate('/');
    } catch (error) {
      setError(error.message || 'Erro ao enviar solicitação. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalSteps = tipoInstalacao === 'domestica' ? 5 : 4;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow bg-gray-50 py-12">
        <div className="container mx-auto px-10">
          <h1 className="text-4xl font-bold text-gray-800 text-center mb-12">
            Calcule o Custo da sua Instalação em Minutos
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="mb-8">
                <p className="text-sm text-gray-600 mb-2">Passo {step} de {totalSteps}</p>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(step / totalSteps) * 100}%` }}
                  ></div>
                </div>
              </div>

              {step === 1 && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-semibold text-gray-800 mb-6">
                    Passo 1: Tipo de Instalação
                  </h2>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => {
                        setTipoInstalacao('domestica');
                        setStep(2);
                      }}
                      className="p-8 rounded-xl border-2 bg-white border-gray-200 hover:border-emerald-300 transition-all"
                    >
                      <div className="flex flex-col items-center gap-4">
                        <svg
                          className="w-16 h-16 text-emerald-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                          />
                        </svg>
                        <span className="text-lg font-semibold text-gray-800">Instalação Doméstica</span>
                        <p className="text-sm text-gray-600 text-center">Para residências particulares</p>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        setTipoInstalacao('publica');
                        setStep(2);
                      }}
                      className="p-8 rounded-xl border-2 bg-white border-gray-200 hover:border-emerald-300 transition-all"
                    >
                      <div className="flex flex-col items-center gap-4">
                        <svg
                          className="w-16 h-16 text-emerald-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                          />
                        </svg>
                        <span className="text-lg font-semibold text-gray-800">Estabelecimento Público</span>
                        <p className="text-sm text-gray-600 text-center">Para empresas e locais comerciais</p>
                      </div>
                    </button>
                  </div>
                </div>
              )}

              {step === 2 && tipoInstalacao === 'domestica' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-semibold text-gray-800 mb-6">
                    Passo 2: Sobre sua residência
                  </h2>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => setResidenceType('casa')}
                      className={`p-8 rounded-xl border-2 transition-all ${
                        residenceType === 'casa'
                          ? 'bg-emerald-100 border-emerald-500'
                          : 'bg-white border-gray-200 hover:border-emerald-300'
                      }`}
                    >
                      <div className="flex flex-col items-center gap-4">
                        <svg
                          className="w-16 h-16 text-emerald-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                          />
                        </svg>
                        <span className="text-lg font-semibold text-gray-800">Casa</span>
                      </div>
                    </button>

                    <button
                      onClick={() => setResidenceType('apartamento')}
                      className={`p-8 rounded-xl border-2 transition-all ${
                        residenceType === 'apartamento'
                          ? 'bg-emerald-100 border-emerald-500'
                          : 'bg-white border-gray-200 hover:border-emerald-300'
                      }`}
                    >
                      <div className="flex flex-col items-center gap-4">
                        <svg
                          className="w-16 h-16 text-emerald-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                          />
                        </svg>
                        <span className="text-lg font-semibold text-gray-800">Apartamento</span>
                      </div>
                    </button>
                  </div>
                </div>
              )}

              {step === 2 && tipoInstalacao === 'publica' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-semibold text-gray-800 mb-6">
                    Passo 2: Detalhes da Instalação
                  </h2>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Distância do quadro de luz até a vaga (em metros)
                    </label>
                    <input
                      type="number"
                      value={distance}
                      onChange={(e) => setDistance(Number(e.target.value))}
                      min="1"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-lg"
                    />
                  </div>
                </div>
              )}

              {step === 3 && tipoInstalacao === 'domestica' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-semibold text-gray-800 mb-6">
                    Passo 3: Detalhes da Instalação
                  </h2>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Distância do quadro de luz até a vaga (em metros)
                    </label>
                    <input
                      type="number"
                      value={distance}
                      onChange={(e) => setDistance(Number(e.target.value))}
                      min="1"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-lg"
                    />
                  </div>
                </div>
              )}

              {step === 3 && tipoInstalacao === 'publica' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-semibold text-gray-800 mb-6">
                    Passo 3: Localização
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Endereço completo *
                      </label>
                      <input
                        type="text"
                        value={endereco}
                        onChange={(e) => setEndereco(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                        placeholder="Ex: Rua das Flores, 123"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Cidade *
                        </label>
                        <input
                          type="text"
                          value={cidade}
                          onChange={(e) => setCidade(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Estado
                        </label>
                        <input
                          type="text"
                          value={estado}
                          onChange={(e) => setEstado(e.target.value)}
                          maxLength={2}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                          placeholder="SC"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        CEP
                      </label>
                      <input
                        type="text"
                        value={cep}
                        onChange={(e) => setCep(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                        placeholder="00000-000"
                      />
                    </div>
                    <div className="h-64 border border-gray-300 rounded-lg overflow-hidden">
                      <MapContainer
                        center={selectedLocation || [-27.0953, -52.6167]}
                        zoom={selectedLocation ? 15 : 9}
                        style={{ height: "100%", width: "100%", zIndex: 0 }}
                      >
                        <TileLayer
                          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <MapClickHandler onMapClick={(latlng) => setSelectedLocation([latlng.lat, latlng.lng])} />
                        {selectedLocation && (
                          <Marker position={selectedLocation} />
                        )}
                      </MapContainer>
                    </div>
                    <p className="text-xs text-gray-500">
                      Clique no mapa para definir a localização (opcional)
                    </p>
                  </div>
                </div>
              )}

              {step === 4 && tipoInstalacao === 'domestica' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-semibold text-gray-800 mb-6">
                    Passo 4: Escolha seu Carregador
                  </h2>
                  <div className="space-y-4">
                    <button
                      onClick={() => setChargerType('portatil')}
                      className={`w-full p-6 rounded-xl border-2 text-left transition-all ${
                        chargerType === 'portatil'
                          ? 'bg-emerald-100 border-emerald-500'
                          : 'bg-white border-gray-200 hover:border-emerald-300'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-semibold text-gray-800">Portátil</h3>
                          </div>
                          <p className="text-sm text-gray-600">
                            Recarga mais lenta, ideal para uso noturno. Conecta em tomadas comuns.
                          </p>
                        </div>
                      </div>
                    </button>

                    <button
                      onClick={() => setChargerType('wallbox')}
                      className={`w-full p-6 rounded-xl border-2 text-left transition-all ${
                        chargerType === 'wallbox'
                          ? 'bg-emerald-100 border-emerald-500'
                          : 'bg-white border-gray-200 hover:border-emerald-300'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-semibold text-gray-800">Wallbox</h3>
                          </div>
                          <p className="text-sm text-gray-600">
                            Recarga rápida e segura. A opção mais recomendada para residências.
                          </p>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
              )}

              {((step === 4 && tipoInstalacao === 'domestica') || (step === 3 && tipoInstalacao === 'publica')) && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-semibold text-gray-800 mb-6">
                    {tipoInstalacao === 'domestica' ? 'Passo 5' : 'Passo 4'}: Localização
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Endereço completo *
                      </label>
                      <input
                        type="text"
                        value={endereco}
                        onChange={(e) => setEndereco(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                        placeholder="Ex: Rua das Flores, 123"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Cidade *
                        </label>
                        <input
                          type="text"
                          value={cidade}
                          onChange={(e) => setCidade(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Estado
                        </label>
                        <input
                          type="text"
                          value={estado}
                          onChange={(e) => setEstado(e.target.value)}
                          maxLength={2}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                          placeholder="SC"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        CEP
                      </label>
                      <input
                        type="text"
                        value={cep}
                        onChange={(e) => setCep(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                        placeholder="00000-000"
                      />
                    </div>
                    <div className="h-64 border border-gray-300 rounded-lg overflow-hidden">
                      <MapContainer
                        center={selectedLocation || [-27.0953, -52.6167]}
                        zoom={selectedLocation ? 15 : 9}
                        style={{ height: "100%", width: "100%", zIndex: 0 }}
                      >
                        <TileLayer
                          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <MapClickHandler onMapClick={(latlng) => setSelectedLocation([latlng.lat, latlng.lng])} />
                        {selectedLocation && (
                          <Marker position={selectedLocation} />
                        )}
                      </MapContainer>
                    </div>
                    <p className="text-xs text-gray-500">
                      Clique no mapa para definir a localização (opcional)
                    </p>
                  </div>
                </div>
              )}

              {error && (
                <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg">
                  {error}
                </div>
              )}

              <div className="flex justify-between mt-8">
                <button
                  onClick={() => setStep(Math.max(1, step - 1))}
                  disabled={step === 1}
                  className={`px-6 py-3 rounded-lg font-medium transition ${
                    step === 1
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Anterior
                </button>
                {step < totalSteps ? (
                  <button
                    onClick={() => setStep(Math.min(totalSteps, step + 1))}
                    className="px-6 py-3 rounded-lg font-medium transition bg-emerald-500 text-white hover:bg-emerald-600"
                  >
                    Próximo
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting || !endereco || !cidade}
                    className={`px-6 py-3 rounded-lg font-medium transition ${
                      isSubmitting || !endereco || !cidade
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-emerald-500 text-white hover:bg-emerald-600'
                    }`}
                  >
                    {isSubmitting ? 'Enviando...' : 'Enviar Solicitação'}
                  </button>
                )}
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-lg p-6 sticky top-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-6">
                  Sua Estimativa de Custo
                </h2>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Materiais e Equipamentos</span>
                    <span className="font-semibold text-gray-800">
                      {formatCurrency(costs.material)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Mão de obra e Instalação</span>
                    <span className="font-semibold text-gray-800">
                      {formatCurrency(costs.labor)}
                    </span>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4 mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Valor Total Estimado</span>
                  </div>
                  <div className="text-3xl font-bold text-emerald-600">
                    {formatCurrency(costs.total)}
                  </div>
                </div>

                <p className="text-xs text-gray-500 mb-6">
                  Este é um valor aproximado. Um responsável entrará em contato para confirmar os detalhes.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default Calculadora;
