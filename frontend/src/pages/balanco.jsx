import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/navbar";
import Footer from "../components/footer";
import { getEmployeeProfile, getBalance } from "../services/api";

export default function Balanco() {
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("employeeToken");
    if (!token) {
      navigate("/login-funcionario");
      return;
    }
    loadData();
  }, [navigate]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [profileRes, balanceRes] = await Promise.all([
        getEmployeeProfile(),
        getBalance()
      ]);
      setEmployee(profileRes.employee);
      setBalance(balanceRes);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      if (error.message?.includes("403") || error.message?.includes("negado")) {
        alert("Acesso negado. Apenas CEO pode acessar esta página.");
        navigate("/dashboard-funcionario");
      } else {
        localStorage.removeItem("employeeToken");
        navigate("/login-funcionario");
      }
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-gray-600">Carregando...</div>
      </div>
    );
  }

  if (employee?.position !== "CEO") {
    return (
      <div className="min-h-screen flex flex-col bg-gray-100">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-sm p-6 max-w-md">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Acesso Negado
            </h2>
            <p className="text-gray-600 mb-4">
              Apenas CEO pode acessar esta página.
            </p>
            <button
              onClick={() => navigate("/dashboard-funcionario")}
              className="w-full px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600"
            >
              Voltar ao Dashboard
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Navbar />

      <div className="flex-1 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h1 className="text-3xl font-semibold text-gray-900 mb-6">
              Balanço Financeiro
            </h1>

            {balance && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-green-50 rounded-lg p-6">
                    <p className="text-sm text-green-600 font-medium mb-2">Total de Receitas</p>
                    <p className="text-3xl font-bold text-green-900">
                      {formatCurrency(balance.totalReceitas)}
                    </p>
                    <p className="text-xs text-green-600 mt-2">
                      Instalações concluídas
                    </p>
                  </div>

                  <div className="bg-red-50 rounded-lg p-6">
                    <p className="text-sm text-red-600 font-medium mb-2">Total de Custos</p>
                    <p className="text-3xl font-bold text-red-900">
                      {formatCurrency(balance.totalCustos)}
                    </p>
                    <p className="text-xs text-red-600 mt-2">
                      Custos das instalações
                    </p>
                  </div>

                  <div className={`rounded-lg p-6 ${balance.lucro >= 0 ? 'bg-emerald-50' : 'bg-orange-50'}`}>
                    <p className={`text-sm font-medium mb-2 ${balance.lucro >= 0 ? 'text-emerald-600' : 'text-orange-600'}`}>
                      Lucro Líquido
                    </p>
                    <p className={`text-3xl font-bold ${balance.lucro >= 0 ? 'text-emerald-900' : 'text-orange-900'}`}>
                      {formatCurrency(balance.lucro)}
                    </p>
                    <p className={`text-xs mt-2 ${balance.lucro >= 0 ? 'text-emerald-600' : 'text-orange-600'}`}>
                      Receitas - Custos
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-4 mb-8">
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <p className="text-sm text-gray-600 mb-1">Pendentes</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {balance.estatisticas?.pendentes || 0}
                    </p>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-4 text-center">
                    <p className="text-sm text-blue-600 mb-1">Em Andamento</p>
                    <p className="text-2xl font-bold text-blue-900">
                      {balance.estatisticas?.emAndamento || 0}
                    </p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4 text-center">
                    <p className="text-sm text-green-600 mb-1">Concluídas</p>
                    <p className="text-2xl font-bold text-green-900">
                      {balance.estatisticas?.concluidas || 0}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <p className="text-sm text-gray-600 mb-1">Total</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {balance.estatisticas?.total || 0}
                    </p>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    Detalhamento das Instalações
                  </h2>
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Endereço</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Preço</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Custo</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Lucro</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {balance.solicitacoes?.map((request) => {
                        const lucro = parseFloat(request.precoTotal || 0) - parseFloat(request.custoTotal || 0);
                        return (
                          <tr key={request.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              #{request.id}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {request.tipoInstalacao === "domestica" ? "Doméstica" : "Pública"}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500">
                              <div>{request.endereco}</div>
                              <div className="text-xs text-gray-400">{request.cidade}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                request.status === "pendente" ? "bg-yellow-100 text-yellow-800" :
                                request.status === "em_andamento" ? "bg-blue-100 text-blue-800" :
                                "bg-green-100 text-green-800"
                              }`}>
                                {request.status === "pendente" ? "Pendente" :
                                 request.status === "em_andamento" ? "Em Andamento" :
                                 "Concluída"}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                              {formatCurrency(request.precoTotal)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-red-600">
                              {request.custoTotal ? formatCurrency(request.custoTotal) : "-"}
                            </td>
                            <td className={`px-6 py-4 whitespace-nowrap text-right text-sm font-semibold ${
                              lucro >= 0 ? "text-green-600" : "text-red-600"
                            }`}>
                              {request.custoTotal ? formatCurrency(lucro) : "-"}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}


