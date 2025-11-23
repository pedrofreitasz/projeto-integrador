import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from "../components/navbar";
import Footer from "../components/footer";

function Calculadora() {
  const [step, setStep] = useState(1);
  const [residenceType, setResidenceType] = useState('casa');
  const [distance, setDistance] = useState(15);
  const [chargerType, setChargerType] = useState('wallbox');

  const calculateCosts = () => {
    let materialCost = 0;
    let laborCost = 0;

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
                <p className="text-sm text-gray-600 mb-2">Passo {step} de 3</p>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(step / 3) * 100}%` }}
                  ></div>
                </div>
              </div>

              {step === 1 && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-semibold text-gray-800 mb-6">
                    Passo 1: Sobre sua residência
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

              {step === 2 && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-semibold text-gray-800 mb-6">
                    Passo 2: Detalhes da Instalação
                  </h2>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Distância do quadro de luz até a vaga (em metros)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={distance}
                        onChange={(e) => setDistance(Number(e.target.value))}
                        min="1"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-lg"
                      />
                      <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                        <svg
                          className="w-5 h-5 text-gray-400"
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
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-semibold text-gray-800 mb-6">
                    Passo 3: Escolha seu Carregador
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
                            <div className="w-5 h-5 rounded-full bg-gray-300 flex items-center justify-center">
                              <span className="text-xs text-gray-600">i</span>
                            </div>
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
                            <div className="w-5 h-5 rounded-full bg-gray-300 flex items-center justify-center">
                              <span className="text-xs text-gray-600">i</span>
                            </div>
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
                <button
                  onClick={() => setStep(Math.min(3, step + 1))}
                  disabled={step === 3}
                  className={`px-6 py-3 rounded-lg font-medium transition ${
                    step === 3
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-emerald-500 text-white hover:bg-emerald-600'
                  }`}
                >
                  Próximo
                </button>
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
                  Este é um valor aproximado. Solicite um orçamento para obter o preço final.
                </p>

                <Link
                  to="/orcamentos"
                  className="block w-full bg-emerald-500 text-white py-3 rounded-lg font-semibold hover:bg-emerald-600 transition-colors text-center"
                >
                  Solicitar Orçamento Detalhado
                </Link>
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
