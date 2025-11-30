import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/navbar";
import Footer from "../components/footer";
import { getEmployeeProfile } from "../services/api";
import { formatCpf } from "../utils/cpf";

export default function DashboardFuncionario() {
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("employeeToken");
    if (!token) {
      navigate("/login-funcionario");
      return;
    }
    loadProfile();
  }, [navigate]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const response = await getEmployeeProfile();
      setEmployee(response.employee);
    } catch (error) {
      console.error("Erro ao carregar perfil:", error);
      localStorage.removeItem("employeeToken");
      localStorage.removeItem("employeeData");
      navigate("/login-funcionario");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("employeeToken");
    localStorage.removeItem("employeeData");
    navigate("/login-funcionario");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-gray-600">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Navbar />
      
      <div className="flex-1 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl font-semibold text-gray-900">
                Dashboard do Funcionário
              </h1>
              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded-lg bg-red-500 text-white font-semibold hover:bg-red-600 transition"
              >
                Sair
              </button>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-700 mb-4">
                    Informações Pessoais
                  </h2>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm text-gray-500">Nome</label>
                      <p className="text-base font-medium text-gray-900">
                        {employee?.name || "Não informado"}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-500">E-mail</label>
                      <p className="text-base font-medium text-gray-900">
                        {employee?.email || "Não informado"}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-500">CPF</label>
                      <p className="text-base font-medium text-gray-900">
                        {employee?.cpf ? formatCpf(employee.cpf) : "Não informado"}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-500">Cargo</label>
                      <p className="text-base font-medium text-gray-900">
                        {employee?.position || "Não informado"}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h2 className="text-lg font-semibold text-gray-700 mb-4">
                    Estatísticas
                  </h2>
                  <div className="space-y-3">
                    <div className="bg-emerald-50 rounded-lg p-4">
                      <p className="text-sm text-emerald-600 font-medium">
                        Conta criada em
                      </p>
                      <p className="text-lg font-semibold text-emerald-900">
                        {employee?.createdAt
                          ? new Date(employee.createdAt).toLocaleDateString("pt-BR")
                          : "Não disponível"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Bem-vindo ao sistema de funcionários!
            </h2>
            <p className="text-gray-600 mb-4">
              Esta é sua área exclusiva como funcionário da empresa. Aqui você pode
              acessar informações e funcionalidades específicas do seu perfil.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="border border-gray-200 rounded-lg p-4 hover:border-emerald-500 transition">
                <h3 className="font-semibold text-gray-900 mb-2">Perfil</h3>
                <p className="text-sm text-gray-600">
                  Gerencie suas informações pessoais
                </p>
              </div>
              <div className="border border-gray-200 rounded-lg p-4 hover:border-emerald-500 transition">
                <h3 className="font-semibold text-gray-900 mb-2">Recursos</h3>
                <p className="text-sm text-gray-600">
                  Acesse ferramentas exclusivas
                </p>
              </div>
              <div className="border border-gray-200 rounded-lg p-4 hover:border-emerald-500 transition">
                <h3 className="font-semibold text-gray-900 mb-2">Suporte</h3>
                <p className="text-sm text-gray-600">
                  Entre em contato com a equipe
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

