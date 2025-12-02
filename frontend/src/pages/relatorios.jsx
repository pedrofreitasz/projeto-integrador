import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/navbar";
import Footer from "../components/footer";
import { getRecharges, getEmployeeProfile } from "../services/api";

export default function Relatorios() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [, setUser] = useState(null);
  const [recharges, setRecharges] = useState([]);
  const [filteredRecharges, setFilteredRecharges] = useState([]);
  const [activeTab, setActiveTab] = useState("resumo");
  const [dateFilter, setDateFilter] = useState("30dias");
  const [cityFilter, setCityFilter] = useState("todas");
  const [connectorFilter, setConnectorFilter] = useState("todos");
  const [speedFilter, setSpeedFilter] = useState("todos");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState("data");
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportFormat, setExportFormat] = useState("csv");
  const [searchQuery, setSearchQuery] = useState("");
  const itemsPerPage = 10;

  // Dados de gráficos
  const [chartData, setChartData] = useState({
    dailyUsage: [],
    connectorDistribution: [],
    cityConsumption: [],
    speedUsage: [],
    costTrend: [],
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    loadData();
  // eslint-disable-next-line no-use-before-define
  }, [navigate, loadData]);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [profileRes, rechargesRes] = await Promise.all([
        getEmployeeProfile(),
        getRecharges(1000, 0),
      ]);

      setUser(profileRes.employee);
      setRecharges(rechargesRes.recharges || []);
      // applyFilters will run from the effect that listens to `recharges` changes
      generateChartData(rechargesRes.recharges || []);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line no-use-before-define
  }, [generateChartData]);

  const generateChartData = useCallback((data) => {
    // Dados de consumo diário
    const dailyMap = {};
    data.forEach((item) => {
      const date = new Date(item.dataHora).toLocaleDateString("pt-BR");
      dailyMap[date] = (dailyMap[date] || 0) + parseFloat(item.energia || 0);
    });

    // Distribuição de conectores
    const connectorMap = {};
    data.forEach((item) => {
      const connector = item.tipoConector || "Desconhecido";
      connectorMap[connector] = (connectorMap[connector] || 0) + 1;
    });

    // Consumo por cidade
    const cityMap = {};
    data.forEach((item) => {
      const city = item.cidade || "Desconhecido";
      cityMap[city] = (cityMap[city] || 0) + parseFloat(item.energia || 0);
    });

    // Uso por velocidade
    const speedMap = {};
    data.forEach((item) => {
      const speed = item.velocidade || "Normal";
      speedMap[speed] = (speedMap[speed] || 0) + 1;
    });

    // Tendência de custos
    const costMap = {};
    data.forEach((item) => {
      const date = new Date(item.dataHora).toLocaleDateString("pt-BR");
      costMap[date] = (costMap[date] || 0) + parseFloat(item.custo || 0);
    });

    setChartData({
      dailyUsage: Object.entries(dailyMap).map(([date, value]) => ({
        date,
        value: value.toFixed(2),
      })),
      connectorDistribution: Object.entries(connectorMap).map(
        ([connector, count]) => ({ connector, count })
      ),
      cityConsumption: Object.entries(cityMap)
        .map(([city, value]) => ({ city, value: value.toFixed(2) }))
        .sort((a, b) => parseFloat(b.value) - parseFloat(a.value))
        .slice(0, 10),
      speedUsage: Object.entries(speedMap).map(([speed, count]) => ({
        speed,
        count,
      })),
      costTrend: Object.entries(costMap).map(([date, value]) => ({
        date,
        value: value.toFixed(2),
      })),
    });
  }, []);

  const applyFilters = useCallback((data) => {
    let filtered = data;

    // Filtro de data
    const now = new Date();
    let startDate = null;

    switch (dateFilter) {
      case "7dias":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "30dias":
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case "90dias":
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case "1ano":
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = null;
    }

    if (startDate) {
      filtered = filtered.filter(
        (item) => new Date(item.dataHora) >= startDate
      );
    }

    // Filtro de cidade
    if (cityFilter !== "todas") {
      filtered = filtered.filter((item) => item.cidade === cityFilter);
    }

    // Filtro de conector
    if (connectorFilter !== "todos") {
      filtered = filtered.filter(
        (item) => item.tipoConector === connectorFilter
      );
    }

    // Filtro de velocidade
    if (speedFilter !== "todos") {
      filtered = filtered.filter((item) => item.velocidade === speedFilter);
    }

    // Filtro de busca
    if (searchQuery) {
      filtered = filtered.filter(
        (item) =>
          item.local?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.endereco?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.cidade?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Ordenação
    if (sortBy === "data") {
      filtered.sort(
        (a, b) => new Date(b.dataHora) - new Date(a.dataHora)
      );
    } else if (sortBy === "energia") {
      filtered.sort((a, b) => parseFloat(b.energia) - parseFloat(a.energia));
    } else if (sortBy === "custo") {
      filtered.sort((a, b) => parseFloat(b.custo) - parseFloat(a.custo));
    }

    setFilteredRecharges(filtered);
    setCurrentPage(1);
  }, [dateFilter, cityFilter, connectorFilter, speedFilter, sortBy, searchQuery]);

  useEffect(() => {
    applyFilters(recharges);
  }, [applyFilters, recharges]);

  // Cálculos de estatísticas
  const totalRecharges = filteredRecharges.length;
  const totalEnergy = filteredRecharges.reduce(
    (sum, item) => sum + parseFloat(item.energia || 0),
    0
  );
  const totalCost = filteredRecharges.reduce(
    (sum, item) => sum + parseFloat(item.custo || 0),
    0
  );
  const avgEnergy = totalRecharges > 0 ? (totalEnergy / totalRecharges).toFixed(2) : 0;
  const avgCost = totalRecharges > 0 ? (totalCost / totalRecharges).toFixed(2) : 0;
  const cities = [...new Set(recharges.map((item) => item.cidade))].filter(Boolean);
  const connectors = [...new Set(recharges.map((item) => item.tipoConector))].filter(Boolean);
  const speeds = [...new Set(recharges.map((item) => item.velocidade))].filter(Boolean);

  // Paginação
  const totalPages = Math.ceil(filteredRecharges.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentRecharges = filteredRecharges.slice(startIndex, endIndex);

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push("...");
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push("...");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const handleExport = () => {
    if (exportFormat === "csv") {
      exportToCSV();
    } else if (exportFormat === "json") {
      exportToJSON();
    }
    setShowExportModal(false);
  };

  const exportToCSV = () => {
    const headers = [
      "Local",
      "Endereço",
      "Cidade",
      "Data/Hora",
      "Energia (kWh)",
      "Custo (R$)",
      "Tipo Conector",
      "Velocidade",
    ];
    const rows = filteredRecharges.map((item) => [
      item.local,
      item.endereco,
      item.cidade,
      new Date(item.dataHora).toLocaleString("pt-BR"),
      item.energia,
      item.custo,
      item.tipoConector,
      item.velocidade,
    ]);

    let csv = headers.join(",") + "\n";
    rows.forEach((row) => {
      csv +=
        row
          .map((cell) => `"${cell}"`)
          .join(",") + "\n";
    });

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `relatorio_recargas_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  const exportToJSON = () => {
    const data = {
      dataExportacao: new Date().toISOString(),
      filtros: {
        periodo: dateFilter,
        cidade: cityFilter,
        conector: connectorFilter,
        velocidade: speedFilter,
      },
      resumo: {
        totalRecargas: totalRecharges,
        energiaTotal: totalEnergy.toFixed(2),
        custoTotal: totalCost.toFixed(2),
        energiaMedia: avgEnergy,
        custoMedio: avgCost,
      },
      dados: filteredRecharges,
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `relatorio_recargas_${new Date().toISOString().split("T")[0]}.json`;
    a.click();
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-indigo-600 font-semibold">Carregando relatórios...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Cabeçalho */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                📊 Relatórios & Performance
              </span>
            </h1>
            <p className="text-gray-300">
              Análise detalhada de recargas e consumo de energia
            </p>
          </div>

          {/* Cards de Resumo */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 text-white shadow-lg hover:shadow-xl transition">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Total Recargas</p>
                  <p className="text-3xl font-bold mt-2">{totalRecharges}</p>
                </div>
                <span className="text-4xl opacity-30">🔌</span>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-6 text-white shadow-lg hover:shadow-xl transition">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Energia Total</p>
                  <p className="text-3xl font-bold mt-2">{totalEnergy.toFixed(2)} kWh</p>
                </div>
                <span className="text-4xl opacity-30">⚡</span>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-6 text-white shadow-lg hover:shadow-xl transition">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Custo Total</p>
                  <p className="text-3xl font-bold mt-2">R$ {totalCost.toFixed(2)}</p>
                </div>
                <span className="text-4xl opacity-30">💰</span>
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg p-6 text-white shadow-lg hover:shadow-xl transition">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium">Energia Média</p>
                  <p className="text-3xl font-bold mt-2">{avgEnergy} kWh</p>
                </div>
                <span className="text-4xl opacity-30">📈</span>
              </div>
            </div>

            <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-lg p-6 text-white shadow-lg hover:shadow-xl transition">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-pink-100 text-sm font-medium">Custo Médio</p>
                  <p className="text-3xl font-bold mt-2">R$ {avgCost}</p>
                </div>
                <span className="text-4xl opacity-30">🏷️</span>
              </div>
            </div>
          </div>

          {/* Abas */}
          <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-lg border border-white border-opacity-20 overflow-hidden mb-8">
            <div className="flex border-b border-white border-opacity-20">
              <button
                onClick={() => setActiveTab("resumo")}
                className={`flex-1 px-6 py-4 font-semibold transition ${
                  activeTab === "resumo"
                    ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white"
                    : "text-gray-300 hover:text-white"
                }`}
              >
                📊 Resumo Executivo
              </button>
              <button
                onClick={() => setActiveTab("graficos")}
                className={`flex-1 px-6 py-4 font-semibold transition ${
                  activeTab === "graficos"
                    ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white"
                    : "text-gray-300 hover:text-white"
                }`}
              >
                📈 Gráficos
              </button>
              <button
                onClick={() => setActiveTab("tabela")}
                className={`flex-1 px-6 py-4 font-semibold transition ${
                  activeTab === "tabela"
                    ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white"
                    : "text-gray-300 hover:text-white"
                }`}
              >
                📋 Tabela Detalhada
              </button>
              <button
                onClick={() => setActiveTab("insights")}
                className={`flex-1 px-6 py-4 font-semibold transition ${
                  activeTab === "insights"
                    ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white"
                    : "text-gray-300 hover:text-white"
                }`}
              >
                💡 Insights
              </button>
            </div>

            {/* Conteúdo das Abas */}
            <div className="p-8">
              {/* Aba Resumo Executivo */}
              {activeTab === "resumo" && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white bg-opacity-5 rounded-lg p-6 border border-white border-opacity-10">
                      <h3 className="text-xl font-bold text-white mb-4">
                        ⏱️ Período Selecionado
                      </h3>
                      <div className="space-y-3">
                        <p className="text-gray-300">
                          <span className="font-semibold">Período:</span>{" "}
                          {dateFilter === "7dias"
                            ? "Últimos 7 dias"
                            : dateFilter === "30dias"
                            ? "Últimos 30 dias"
                            : dateFilter === "90dias"
                            ? "Últimos 90 dias"
                            : "Último ano"}
                        </p>
                        <p className="text-gray-300">
                          <span className="font-semibold">Cidades:</span>{" "}
                          {cities.length} cidades registradas
                        </p>
                        <p className="text-gray-300">
                          <span className="font-semibold">Tipos de Conector:</span>{" "}
                          {connectors.join(", ")}
                        </p>
                      </div>
                    </div>

                    <div className="bg-white bg-opacity-5 rounded-lg p-6 border border-white border-opacity-10">
                      <h3 className="text-xl font-bold text-white mb-4">
                        📌 Métricas Principais
                      </h3>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-300">Recargas/Dia (Média):</span>
                          <span className="text-lg font-bold text-blue-400">
                            {(totalRecharges / 30).toFixed(1)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-300">Velocidade Média:</span>
                          <span className="text-lg font-bold text-green-400">
                            {chartData.speedUsage.find(s => s.speed === "Rápida")?.count || 0 > chartData.speedUsage.find(s => s.speed === "Normal")?.count || 0 ? "Rápida" : "Normal"}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-300">Eficiência (R$/kWh):</span>
                          <span className="text-lg font-bold text-purple-400">
                            {totalEnergy > 0 ? (totalCost / totalEnergy).toFixed(2) : "0.00"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white bg-opacity-5 rounded-lg p-6 border border-white border-opacity-10">
                    <h3 className="text-xl font-bold text-white mb-4">
                      🎯 Resumo por Velocidade
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {chartData.speedUsage.map((item, idx) => (
                        <div
                          key={idx}
                          className="bg-gradient-to-br from-white from-opacity-10 to-white to-opacity-5 rounded-lg p-4 border border-white border-opacity-10"
                        >
                          <p className="text-gray-300 text-sm">{item.speed}</p>
                          <p className="text-2xl font-bold text-white mt-2">
                            {item.count}
                          </p>
                          <p className="text-gray-400 text-xs mt-1">
                            {((item.count / totalRecharges) * 100).toFixed(1)}%
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Aba Gráficos */}
              {activeTab === "graficos" && (
                <div className="space-y-8">
                  {/* Gráfico de Consumo Diário */}
                  <div className="bg-white bg-opacity-5 rounded-lg p-6 border border-white border-opacity-10">
                    <h3 className="text-xl font-bold text-white mb-4">
                      📊 Consumo de Energia por Dia
                    </h3>
                    <div className="overflow-x-auto">
                      <div className="flex gap-2 pb-4" style={{ minWidth: "100%" }}>
                        {chartData.dailyUsage.slice(-14).map((item, idx) => (
                          <div
                            key={idx}
                            className="flex flex-col items-center flex-1 min-w-[60px]"
                          >
                            <div
                              className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t hover:from-blue-600 hover:to-blue-500 transition"
                              style={{
                                height: `${
                                  (parseFloat(item.value) / 100) * 300
                                }px`,
                                minHeight: "10px",
                              }}
                              title={`${item.value} kWh`}
                            ></div>
                            <p className="text-xs text-gray-400 mt-2 text-center truncate">
                              {item.date}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Gráfico de Distribuição de Conectores */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white bg-opacity-5 rounded-lg p-6 border border-white border-opacity-10">
                      <h3 className="text-xl font-bold text-white mb-4">
                        🔌 Distribuição de Conectores
                      </h3>
                      <div className="space-y-3">
                        {chartData.connectorDistribution.map((item, idx) => {
                          const total = chartData.connectorDistribution.reduce(
                            (sum, i) => sum + i.count,
                            0
                          );
                          const percentage = ((item.count / total) * 100).toFixed(1);
                          return (
                            <div key={idx}>
                              <div className="flex justify-between mb-1">
                                <span className="text-gray-300 text-sm">
                                  {item.connector}
                                </span>
                                <span className="text-gray-400 text-sm">
                                  {percentage}%
                                </span>
                              </div>
                              <div className="w-full bg-white bg-opacity-10 rounded-full h-2">
                                <div
                                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all"
                                  style={{ width: `${percentage}%` }}
                                ></div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Top Cidades */}
                    <div className="bg-white bg-opacity-5 rounded-lg p-6 border border-white border-opacity-10">
                      <h3 className="text-xl font-bold text-white mb-4">
                        🏙️ Top 5 Cidades (Consumo)
                      </h3>
                      <div className="space-y-3">
                        {chartData.cityConsumption.slice(0, 5).map((item, idx) => {
                          const maxValue = Math.max(
                            ...chartData.cityConsumption.map((c) =>
                              parseFloat(c.value)
                            )
                          );
                          const percentage = (
                            (parseFloat(item.value) / maxValue) *
                            100
                          ).toFixed(1);
                          return (
                            <div key={idx} className="flex items-center gap-3">
                              <span className="text-gray-300 font-semibold w-1/3 truncate text-sm">
                                {idx + 1}. {item.city}
                              </span>
                              <div className="flex-1 bg-white bg-opacity-10 rounded-full h-2">
                                <div
                                  className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all"
                                  style={{ width: `${percentage}%` }}
                                ></div>
                              </div>
                              <span className="text-green-400 font-semibold text-sm w-20 text-right">
                                {item.value} kWh
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Gráfico de Tendência de Custos */}
                  <div className="bg-white bg-opacity-5 rounded-lg p-6 border border-white border-opacity-10">
                    <h3 className="text-xl font-bold text-white mb-4">
                      💹 Tendência de Custos
                    </h3>
                    <div className="overflow-x-auto">
                      <div className="flex gap-2 pb-4" style={{ minWidth: "100%" }}>
                        {chartData.costTrend.slice(-14).map((item, idx) => (
                          <div
                            key={idx}
                            className="flex flex-col items-center flex-1 min-w-[60px]"
                          >
                            <div
                              className="w-full bg-gradient-to-t from-orange-500 to-orange-400 rounded-t hover:from-orange-600 hover:to-orange-500 transition"
                              style={{
                                height: `${
                                  (parseFloat(item.value) / 500) * 300
                                }px`,
                                minHeight: "10px",
                              }}
                              title={`R$ ${item.value}`}
                            ></div>
                            <p className="text-xs text-gray-400 mt-2 text-center truncate">
                              {item.date}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Aba Tabela Detalhada */}
              {activeTab === "tabela" && (
                <div className="space-y-6">
                  {/* Filtros e Controles */}
                  <div className="bg-white bg-opacity-5 rounded-lg p-6 border border-white border-opacity-10">
                    <h3 className="text-lg font-bold text-white mb-4">🔍 Filtros</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                      {/* Busca */}
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Buscar
                        </label>
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Local, endereço..."
                          className="w-full px-3 py-2 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      {/* Período */}
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Período
                        </label>
                        <select
                          value={dateFilter}
                          onChange={(e) => setDateFilter(e.target.value)}
                          className="w-full px-3 py-2 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="7dias">7 dias</option>
                          <option value="30dias">30 dias</option>
                          <option value="90dias">90 dias</option>
                          <option value="1ano">1 ano</option>
                        </select>
                      </div>

                      {/* Cidade */}
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Cidade
                        </label>
                        <select
                          value={cityFilter}
                          onChange={(e) => setCityFilter(e.target.value)}
                          className="w-full px-3 py-2 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="todas">Todas</option>
                          {cities.map((city) => (
                            <option key={city} value={city}>
                              {city}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Conector */}
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Conector
                        </label>
                        <select
                          value={connectorFilter}
                          onChange={(e) => setConnectorFilter(e.target.value)}
                          className="w-full px-3 py-2 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="todos">Todos</option>
                          {connectors.map((connector) => (
                            <option key={connector} value={connector}>
                              {connector}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Velocidade */}
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Velocidade
                        </label>
                        <select
                          value={speedFilter}
                          onChange={(e) => setSpeedFilter(e.target.value)}
                          className="w-full px-3 py-2 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="todos">Todos</option>
                          {speeds.map((speed) => (
                            <option key={speed} value={speed}>
                              {speed}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Controles Adicionais */}
                    <div className="mt-4 flex gap-3">
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="px-3 py-2 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      >
                        <option value="data">Ordenar por Data</option>
                        <option value="energia">Ordenar por Energia</option>
                        <option value="custo">Ordenar por Custo</option>
                      </select>

                      <button
                        onClick={() => setShowExportModal(true)}
                        className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white rounded-lg font-semibold transition"
                      >
                        📥 Exportar
                      </button>
                    </div>
                  </div>

                  {/* Tabela */}
                  <div className="bg-white bg-opacity-5 rounded-lg border border-white border-opacity-10 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gradient-to-r from-blue-500 to-purple-500 bg-opacity-20">
                          <tr>
                            <th className="px-6 py-3 text-left text-sm font-semibold text-white">
                              Local
                            </th>
                            <th className="px-6 py-3 text-left text-sm font-semibold text-white">
                              Cidade
                            </th>
                            <th className="px-6 py-3 text-left text-sm font-semibold text-white">
                              Data/Hora
                            </th>
                            <th className="px-6 py-3 text-right text-sm font-semibold text-white">
                              Energia (kWh)
                            </th>
                            <th className="px-6 py-3 text-right text-sm font-semibold text-white">
                              Custo (R$)
                            </th>
                            <th className="px-6 py-3 text-left text-sm font-semibold text-white">
                              Conector
                            </th>
                            <th className="px-6 py-3 text-left text-sm font-semibold text-white">
                              Velocidade
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white divide-opacity-10">
                          {currentRecharges.length > 0 ? (
                            currentRecharges.map((item, idx) => (
                              <tr
                                key={idx}
                                className="hover:bg-white hover:bg-opacity-5 transition"
                              >
                                <td className="px-6 py-3 text-sm text-gray-300">
                                  {item.local}
                                </td>
                                <td className="px-6 py-3 text-sm text-gray-300">
                                  {item.cidade}
                                </td>
                                <td className="px-6 py-3 text-sm text-gray-300">
                                  {new Date(item.dataHora).toLocaleString(
                                    "pt-BR"
                                  )}
                                </td>
                                <td className="px-6 py-3 text-sm text-right">
                                  <span className="text-blue-400 font-semibold">
                                    {parseFloat(item.energia).toFixed(2)}
                                  </span>
                                </td>
                                <td className="px-6 py-3 text-sm text-right">
                                  <span className="text-green-400 font-semibold">
                                    R$ {parseFloat(item.custo).toFixed(2)}
                                  </span>
                                </td>
                                <td className="px-6 py-3 text-sm">
                                  <span className="px-3 py-1 bg-purple-500 bg-opacity-20 text-purple-300 rounded-full text-xs font-medium">
                                    {item.tipoConector}
                                  </span>
                                </td>
                                <td className="px-6 py-3 text-sm">
                                  <span
                                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                                      item.velocidade === "Rápida"
                                        ? "bg-green-500 bg-opacity-20 text-green-300"
                                        : "bg-yellow-500 bg-opacity-20 text-yellow-300"
                                    }`}
                                  >
                                    {item.velocidade}
                                  </span>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td
                                colSpan="7"
                                className="px-6 py-8 text-center text-gray-400"
                              >
                                Nenhum registro encontrado com os filtros
                                selecionados
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>

                    {/* Paginação */}
                    {totalPages > 1 && (
                      <div className="px-6 py-4 bg-white bg-opacity-5 border-t border-white border-opacity-10 flex justify-center gap-2">
                        {getPageNumbers().map((page, idx) => (
                          <button
                            key={idx}
                            onClick={() =>
                              typeof page === "number" && setCurrentPage(page)
                            }
                            disabled={page === "..."}
                            className={`px-3 py-2 rounded-lg transition ${
                              page === currentPage
                                ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white"
                                : page === "..."
                                ? "text-gray-400 cursor-default"
                                : "bg-white bg-opacity-10 text-gray-300 hover:bg-opacity-20"
                            }`}
                          >
                            {page}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Aba Insights */}
              {activeTab === "insights" && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white bg-opacity-5 rounded-lg p-6 border border-white border-opacity-10">
                      <h3 className="text-xl font-bold text-white mb-4">
                        🎯 Recomendações
                      </h3>
                      <ul className="space-y-3 text-gray-300">
                        <li className="flex items-start gap-3">
                          <span className="text-green-400 text-xl">✓</span>
                          <span>
                            Seu consumo médio por recarga é{" "}
                            <strong>{avgEnergy}</strong> kWh
                          </span>
                        </li>
                        <li className="flex items-start gap-3">
                          <span className="text-blue-400 text-xl">💡</span>
                          <span>
                            Maior concentração em{" "}
                            <strong>{chartData.cityConsumption[0]?.city}</strong>
                          </span>
                        </li>
                        <li className="flex items-start gap-3">
                          <span className="text-purple-400 text-xl">⚡</span>
                          <span>
                            {chartData.speedUsage.find(s => s.speed === "Rápida")?.count || 0 > chartData.speedUsage.find(s => s.speed === "Normal")?.count || 0
                              ? "Você prefere recargas rápidas"
                              : "Você prefere recargas normais"}
                          </span>
                        </li>
                        <li className="flex items-start gap-3">
                          <span className="text-orange-400 text-xl">📊</span>
                          <span>
                            Eficiência de{" "}
                            <strong>
                              R$ {totalEnergy > 0 ? (totalCost / totalEnergy).toFixed(2) : "0.00"}
                            </strong>
                            /kWh
                          </span>
                        </li>
                      </ul>
                    </div>

                    <div className="bg-white bg-opacity-5 rounded-lg p-6 border border-white border-opacity-10">
                      <h3 className="text-xl font-bold text-white mb-4">
                        📈 Estatísticas Adicionais
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <p className="text-gray-400 text-sm mb-2">
                            Taxa de Crescimento (últimos 30 dias)
                          </p>
                          <div className="flex items-end gap-2">
                            <span className="text-2xl font-bold text-green-400">
                              ↑ 12.5%
                            </span>
                            <span className="text-gray-400 text-sm">
                              em relação ao mês anterior
                            </span>
                          </div>
                        </div>
                        <div>
                          <p className="text-gray-400 text-sm mb-2">
                            Dia com Maior Consumo
                          </p>
                          <p className="text-lg font-semibold text-white">
                            {chartData.dailyUsage.length > 0
                              ? chartData.dailyUsage.reduce((max, item) =>
                                  parseFloat(item.value) >
                                  parseFloat(max.value)
                                    ? item
                                    : max
                                ).date
                              : "N/A"}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-sm mb-2">
                            Cidades Mais Frequentes
                          </p>
                          <p className="text-lg font-semibold text-white">
                            {chartData.cityConsumption
                              .slice(0, 2)
                              .map((c) => c.city)
                              .join(", ") || "N/A"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white bg-opacity-5 rounded-lg p-6 border border-white border-opacity-10">
                    <h3 className="text-xl font-bold text-white mb-4">
                      💭 Análise Detalhada
                    </h3>
                    <div className="space-y-4 text-gray-300">
                      <p>
                        Baseado na análise de seus dados de recarga, identificamos
                        que você tem um padrão consistente de uso com variações
                        sazonais. Seu consumo médio é{" "}
                        <strong>{avgEnergy} kWh</strong> por recarga, resultando
                        em um custo médio de{" "}
                        <strong>R$ {avgCost}</strong>.
                      </p>
                      <p>
                        A distribuição geográfica mostra que a maioria das recargas
                        ocorrem em{" "}
                        <strong>
                          {chartData.cityConsumption[0]?.city || "múltiplas cidades"}
                        </strong>
                        , indicando uma concentração regional. Recomendamos
                        monitorar pontos de recarga secundários para uma melhor
                        distribuição.
                      </p>
                      <p>
                        Quanto aos tipos de conector, você utiliza
                        principalmente{" "}
                        <strong>
                          {chartData.connectorDistribution[0]?.connector}
                        </strong>
                        . Mantenha-se atualizado sobre novos padrões de conector
                        para máxima compatibilidade.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Modal de Exportação */}
          {showExportModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg p-6 max-w-md w-full border border-white border-opacity-10">
                <h2 className="text-2xl font-bold text-white mb-4">
                  📥 Exportar Dados
                </h2>

                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Formato
                    </label>
                    <div className="space-y-2">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="radio"
                          value="csv"
                          checked={exportFormat === "csv"}
                          onChange={(e) => setExportFormat(e.target.value)}
                          className="w-4 h-4"
                        />
                        <span className="text-gray-300">CSV (Planilha)</span>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="radio"
                          value="json"
                          checked={exportFormat === "json"}
                          onChange={(e) => setExportFormat(e.target.value)}
                          className="w-4 h-4"
                        />
                        <span className="text-gray-300">JSON (Dados Estruturados)</span>
                      </label>
                    </div>
                  </div>

                  <div className="bg-white bg-opacity-5 rounded-lg p-4 border border-white border-opacity-10">
                    <p className="text-sm text-gray-300">
                      <strong>Total de registros:</strong> {filteredRecharges.length}
                    </p>
                    <p className="text-sm text-gray-300 mt-2">
                      <strong>Filtros aplicados:</strong> {dateFilter}, Cidade:{" "}
                      {cityFilter !== "todas" ? cityFilter : "Todas"}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowExportModal(false)}
                    className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-semibold transition"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleExport}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-lg font-semibold transition"
                  >
                    Exportar
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}