import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import { Icon } from "leaflet";
import Navbar from "../components/navbar";
import Footer from "../components/footer";
import { 
  getEmployeeProfile,
  getChargingPoints,
  createChargingPoint,
  updateChargingPoint,
  deleteChargingPoint,
  getAllEmployees,
  deleteEmployee,
  getAllUsers,
  deleteUser
} from "../services/api";
import { formatCpf } from "../utils/cpf";
import "leaflet/dist/leaflet.css";

delete Icon.Default.prototype._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const createChargingIcon = (isAvailable = true) => {
  const color = isAvailable ? '#10b981' : '#ef4444';
  const svg = `
    <svg width="48" height="56" viewBox="0 0 48 56" xmlns="http://www.w3.org/2000/svg">
      <path d="M24 4C14 4 6 12 6 22c0 12 18 28 18 28s18-16 18-28c0-10-8-18-18-18z" 
            fill="${color}" 
            stroke="white" 
            stroke-width="2.5"/>
    </svg>
  `;
  return new Icon({
    iconUrl: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`,
    iconSize: [48, 56],
    iconAnchor: [24, 56],
  });
};

function MapClickHandler({ onMapClick }) {
  useMapEvents({ click: (e) => onMapClick(e.latlng) });
  return null;
}

export default function DashboardFuncionario() {
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("profile");
  const [chargingPoints, setChargingPoints] = useState([]);
  const [showPointModal, setShowPointModal] = useState(false);
  const [editingPoint, setEditingPoint] = useState(null);
  const [pointForm, setPointForm] = useState({
    nome: "",
    endereco: "",
    cidade: "",
    latitude: "",
    longitude: "",
    tipoConector: "Tipo 2",
    velocidade: "Normal",
    potencia: "",
    disponivel: true
  });
  const [selectedLocation, setSelectedLocation] = useState(null);
  
  const [employees, setEmployees] = useState([]);
  const [users, setUsers] = useState([]);

  const isCEO = employee?.position === "CEO";
  const canManagePoints = isCEO || employee?.position === "responsável por instalação";

  useEffect(() => {
    const token = localStorage.getItem("employeeToken");
    if (!token) {
      navigate("/login-funcionario");
      return;
    }
    loadProfile();
  }, [navigate]);

  useEffect(() => {
    if (employee) {
      if (canManagePoints) {
        loadChargingPoints();
      }
      if (isCEO) {
        loadEmployees();
        loadUsers();
      }
    }
  }, [employee]);

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

  const loadChargingPoints = async () => {
    try {
      const response = await getChargingPoints();
      setChargingPoints(response.pontos || []);
    } catch (error) {
      console.error("Erro ao carregar pontos:", error);
    }
  };

  const loadEmployees = async () => {
    try {
      const response = await getAllEmployees();
      setEmployees(response.employees || []);
    } catch (error) {
      console.error("Erro ao carregar funcionários:", error);
    }
  };

  const loadUsers = async () => {
    try {
      const response = await getAllUsers();
      setUsers(response.users || []);
    } catch (error) {
      console.error("Erro ao carregar usuários:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("employeeToken");
    localStorage.removeItem("employeeData");
    navigate("/login-funcionario");
  };

  const handleMapClick = (latlng) => {
    setSelectedLocation([latlng.lat, latlng.lng]);
    setPointForm(prev => ({
      ...prev,
      latitude: latlng.lat.toString(),
      longitude: latlng.lng.toString()
    }));
  };

  const handlePointSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingPoint) {
        await updateChargingPoint(editingPoint.id, pointForm);
      } else {
        await createChargingPoint(pointForm);
      }
      await loadChargingPoints();
      setShowPointModal(false);
      setEditingPoint(null);
      setPointForm({
        nome: "",
        endereco: "",
        cidade: "",
        latitude: "",
        longitude: "",
        tipoConector: "Tipo 2",
        velocidade: "Normal",
        potencia: "",
        disponivel: true
      });
      setSelectedLocation(null);
    } catch (error) {
      console.error("Erro ao salvar ponto:", error);
      alert(error.message || "Erro ao salvar ponto de recarga");
    }
  };

  const handleEditPoint = (ponto) => {
    setEditingPoint(ponto);
    setPointForm({
      nome: ponto.nome,
      endereco: ponto.endereco,
      cidade: ponto.cidade,
      latitude: ponto.latitude.toString(),
      longitude: ponto.longitude.toString(),
      tipoConector: ponto.tipoConector,
      velocidade: ponto.velocidade,
      potencia: ponto.potencia,
      disponivel: ponto.disponivel
    });
    setSelectedLocation([parseFloat(ponto.latitude), parseFloat(ponto.longitude)]);
    setShowPointModal(true);
  };

  const handleDeletePoint = async (id) => {
    if (!window.confirm("Tem certeza que deseja remover este ponto de recarga?")) return;
    try {
      await deleteChargingPoint(id);
      await loadChargingPoints();
    } catch (error) {
      console.error("Erro ao deletar ponto:", error);
      alert(error.message || "Erro ao remover ponto");
    }
  };

  const handleDeleteEmployee = async (id) => {
    if (!window.confirm("Tem certeza que deseja remover este funcionário?")) return;
    try {
      await deleteEmployee(id);
      await loadEmployees();
    } catch (error) {
      console.error("Erro ao deletar funcionário:", error);
      alert(error.message || "Erro ao remover funcionário");
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm("Tem certeza que deseja remover este cliente?")) return;
    try {
      await deleteUser(id);
      await loadUsers();
    } catch (error) {
      console.error("Erro ao deletar cliente:", error);
      alert(error.message || "Erro ao remover cliente");
    }
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
        <div className="max-w-7xl mx-auto">
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

            <div className="border-b border-gray-200 mb-6">
              <nav className="flex space-x-8">
                <button
                  onClick={() => setActiveTab("profile")}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === "profile"
                      ? "border-emerald-500 text-emerald-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  Perfil
                </button>
                {canManagePoints && (
                  <button
                    onClick={() => setActiveTab("points")}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === "points"
                        ? "border-emerald-500 text-emerald-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    Pontos de Recarga
                  </button>
                )}
                {isCEO && (
                  <>
                    <button
                      onClick={() => setActiveTab("employees")}
                      className={`py-4 px-1 border-b-2 font-medium text-sm ${
                        activeTab === "employees"
                          ? "border-emerald-500 text-emerald-600"
                          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                      }`}
                    >
                      Funcionários
                    </button>
                    <button
                      onClick={() => setActiveTab("users")}
                      className={`py-4 px-1 border-b-2 font-medium text-sm ${
                        activeTab === "users"
                          ? "border-emerald-500 text-emerald-600"
                          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                      }`}
                    >
                      Clientes
                    </button>
                  </>
                )}
              </nav>
            </div>

            {activeTab === "profile" && (
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
            )}

            {activeTab === "points" && canManagePoints && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Gerenciar Pontos de Recarga
                  </h2>
                  <button
                    onClick={() => {
                      setEditingPoint(null);
                      setPointForm({
                        nome: "",
                        endereco: "",
                        cidade: "",
                        latitude: "",
                        longitude: "",
                        tipoConector: "Tipo 2",
                        velocidade: "Normal",
                        potencia: "",
                        disponivel: true
                      });
                      setSelectedLocation(null);
                      setShowPointModal(true);
                    }}
                    className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition"
                  >
                    + Novo Ponto
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Nome
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Cidade
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Tipo
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Ações
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {chargingPoints.map((ponto) => (
                        <tr key={ponto.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {ponto.nome}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {ponto.cidade}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {ponto.tipoConector}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                ponto.disponivel
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {ponto.disponivel ? "Disponível" : "Indisponível"}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() => handleEditPoint(ponto)}
                              className="text-emerald-600 hover:text-emerald-900 mr-4"
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => handleDeletePoint(ponto.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Remover
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === "employees" && isCEO && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Gerenciar Funcionários
                </h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Nome
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          CPF
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Cargo
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Ações
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {employees.map((emp) => (
                        <tr key={emp.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {emp.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {emp.cpf ? formatCpf(emp.cpf) : "-"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {emp.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {emp.position}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            {emp.id !== employee.id && (
                              <button
                                onClick={() => handleDeleteEmployee(emp.id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                Remover
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === "users" && isCEO && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Gerenciar Clientes
                </h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Nome
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Cadastrado em
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Ações
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {users.map((user) => (
                        <tr key={user.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {user.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {user.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {user.createdAt
                              ? new Date(user.createdAt).toLocaleDateString("pt-BR")
                              : "-"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() => handleDeleteUser(user.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Remover
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {showPointModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-gray-900">
                  {editingPoint ? "Editar Ponto de Recarga" : "Novo Ponto de Recarga"}
                </h2>
                <button
                  onClick={() => setShowPointModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handlePointSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nome *
                    </label>
                    <input
                      type="text"
                      value={pointForm.nome}
                      onChange={(e) => setPointForm({ ...pointForm, nome: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cidade *
                    </label>
                    <input
                      type="text"
                      value={pointForm.cidade}
                      onChange={(e) => setPointForm({ ...pointForm, cidade: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Endereço *
                  </label>
                  <input
                    type="text"
                    value={pointForm.endereco}
                    onChange={(e) => setPointForm({ ...pointForm, endereco: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                    required
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
                    <MapClickHandler onMapClick={handleMapClick} />
                    {selectedLocation && (
                      <Marker position={selectedLocation} />
                    )}
                  </MapContainer>
                </div>
                <p className="text-xs text-gray-500">
                  Clique no mapa para definir a localização
                </p>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tipo Conector *
                    </label>
                    <select
                      value={pointForm.tipoConector}
                      onChange={(e) => setPointForm({ ...pointForm, tipoConector: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                      required
                    >
                      <option value="Tipo 2">Tipo 2</option>
                      <option value="CCS">CCS</option>
                      <option value="CHAdeMO">CHAdeMO</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Velocidade *
                    </label>
                    <select
                      value={pointForm.velocidade}
                      onChange={(e) => setPointForm({ ...pointForm, velocidade: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                      required
                    >
                      <option value="Normal">Normal</option>
                      <option value="Rápida">Rápida</option>
                      <option value="Lenta">Lenta</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Potência *
                    </label>
                    <input
                      type="text"
                      value={pointForm.potencia}
                      onChange={(e) => setPointForm({ ...pointForm, potencia: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                      placeholder="Ex: 22kW"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={pointForm.disponivel}
                      onChange={(e) => setPointForm({ ...pointForm, disponivel: e.target.checked })}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">Disponível</span>
                  </label>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowPointModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600"
                  >
                    {editingPoint ? "Atualizar" : "Salvar"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
