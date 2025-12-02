import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import { Icon } from "leaflet";
import Navbar from "../components/navbar";
import Footer from "../components/footer";
import {
  getEmployeeProfile,
  getAllInstallationRequests,
  getInstallationRequestById,
  assignProfessionals,
  completeInstallation,
  getEmployeesByPosition
} from "../services/api";
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

export default function Instalacao() {
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [pedreiros, setPedreiros] = useState([]);
  const [eletrecistas, setEletrecistas] = useState([]);
  const [responsaveis, setResponsaveis] = useState([]);
  const [selectedProfessionals, setSelectedProfessionals] = useState({
    pedreiro: null,
    eletrecista: null,
    responsavel: null
  });
  const [completeForm, setCompleteForm] = useState({
    nome: "",
    tipoConector: "Tipo 2",
    velocidade: "Normal",
    potencia: "",
    disponivel: true,
    latitude: "",
    longitude: ""
  });
  const [selectedLocation, setSelectedLocation] = useState(null);

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
      const [profileRes, requestsRes] = await Promise.all([
        getEmployeeProfile(),
        getAllInstallationRequests()
      ]);
      setEmployee(profileRes.employee);
      setRequests(requestsRes.requests || []);

      // Carregar funcionários por cargo
      const [pedreirosRes, eletrecistasRes, responsaveisRes] = await Promise.all([
        getEmployeesByPosition("pedreiro"),
        getEmployeesByPosition("eletrecista"),
        getEmployeesByPosition("responsável por instalação")
      ]);
      setPedreiros(pedreirosRes.employees || []);
      setEletrecistas(eletrecistasRes.employees || []);
      setResponsaveis(responsaveisRes.employees || []);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      localStorage.removeItem("employeeToken");
      navigate("/login-funcionario");
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedProfessionals.pedreiro || !selectedProfessionals.eletrecista || !selectedProfessionals.responsavel) {
      alert("Selecione pelo menos 1 pedreiro, 1 eletrecista e 1 responsável por instalação.");
      return;
    }

    try {
      await assignProfessionals(selectedRequest.id, {
        profissionais: [
          { funcionarioId: selectedProfessionals.pedreiro, cargo: "pedreiro" },
          { funcionarioId: selectedProfessionals.eletrecista, cargo: "eletrecista" },
          { funcionarioId: selectedProfessionals.responsavel, cargo: "responsável por instalação" }
        ]
      });
      await loadData();
      setShowAssignModal(false);
      setSelectedRequest(null);
      setSelectedProfessionals({ pedreiro: null, eletrecista: null, responsavel: null });
    } catch (error) {
      alert(error.message || "Erro ao atribuir profissionais");
    }
  };

  const handleComplete = async () => {
    if (!completeForm.nome || !completeForm.potencia) {
      alert("Preencha todos os campos obrigatórios.");
      return;
    }

    try {
      await completeInstallation(selectedRequest.id, {
        nome: completeForm.nome,
        tipoConector: completeForm.tipoConector,
        velocidade: completeForm.velocidade,
        potencia: completeForm.potencia,
        disponivel: completeForm.disponivel,
        latitude: selectedLocation ? selectedLocation[0] : selectedRequest.latitude,
        longitude: selectedLocation ? selectedLocation[1] : selectedRequest.longitude
      });
      await loadData();
      setShowCompleteModal(false);
      setSelectedRequest(null);
      setCompleteForm({
        nome: "",
        tipoConector: "Tipo 2",
        velocidade: "Normal",
        potencia: "",
        disponivel: true,
        latitude: "",
        longitude: ""
      });
      setSelectedLocation(null);
      alert("Instalação concluída e ponto de recarga criado com sucesso!");
    } catch (error) {
      alert(error.message || "Erro ao concluir instalação");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pendente":
        return "bg-yellow-100 text-yellow-800";
      case "em_andamento":
        return "bg-blue-100 text-blue-800";
      case "concluida":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "pendente":
        return "Pendente";
      case "em_andamento":
        return "Em Andamento";
      case "concluida":
        return "Concluída";
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-gray-600">Carregando...</div>
      </div>
    );
  }

  const canManage = employee?.position === "responsável por instalação" || employee?.position === "CEO";
  const pendentes = requests.filter(r => r.status === "pendente");
  const emAndamento = requests.filter(r => r.status === "em_andamento");

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Navbar />

      <div className="flex-1 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h1 className="text-3xl font-semibold text-gray-900 mb-6">
              Gerenciar Instalações
            </h1>

            {!canManage && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-yellow-800">
                  Você não tem permissão para gerenciar instalações. Apenas Responsável por Instalação e CEO podem acessar esta página.
                </p>
              </div>
            )}

            {canManage && (
              <>
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-yellow-50 rounded-lg p-4">
                    <p className="text-sm text-yellow-600 font-medium">Pendentes</p>
                    <p className="text-2xl font-bold text-yellow-900">{pendentes.length}</p>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-4">
                    <p className="text-sm text-blue-600 font-medium">Em Andamento</p>
                    <p className="text-2xl font-bold text-blue-900">{emAndamento.length}</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4">
                    <p className="text-sm text-green-600 font-medium">Concluídas</p>
                    <p className="text-2xl font-bold text-green-900">
                      {requests.filter(r => r.status === "concluida").length}
                    </p>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Endereço</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Valor</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {requests.map((request) => (
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
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            R$ {parseFloat(request.precoTotal || 0).toFixed(2).replace(".", ",")}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(request.status)}`}>
                              {getStatusLabel(request.status)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            {request.status === "pendente" && (
                              <button
                                onClick={() => {
                                  setSelectedRequest(request);
                                  setShowAssignModal(true);
                                }}
                                className="text-emerald-600 hover:text-emerald-900 mr-4"
                              >
                                Atribuir Profissionais
                              </button>
                            )}
                            {request.status === "em_andamento" && (
                              <button
                                onClick={() => {
                                  setSelectedRequest(request);
                                  setCompleteForm({
                                    nome: `Ponto de Recarga - ${request.endereco}`,
                                    tipoConector: "Tipo 2",
                                    velocidade: "Normal",
                                    potencia: request.tipoCarregador === "wallbox" ? "7.4kW" : "3.7kW",
                                    disponivel: true,
                                    latitude: request.latitude?.toString() || "",
                                    longitude: request.longitude?.toString() || ""
                                  });
                                  if (request.latitude && request.longitude) {
                                    setSelectedLocation([parseFloat(request.latitude), parseFloat(request.longitude)]);
                                  }
                                  setShowCompleteModal(true);
                                }}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                Concluir
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {showAssignModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-gray-900">
                  Atribuir Profissionais
                </h2>
                <button
                  onClick={() => setShowAssignModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pedreiro *
                  </label>
                  <select
                    value={selectedProfessionals.pedreiro || ""}
                    onChange={(e) => setSelectedProfessionals({ ...selectedProfessionals, pedreiro: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">Selecione um pedreiro</option>
                    {pedreiros.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Eletrecista *
                  </label>
                  <select
                    value={selectedProfessionals.eletrecista || ""}
                    onChange={(e) => setSelectedProfessionals({ ...selectedProfessionals, eletrecista: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">Selecione um eletrecista</option>
                    {eletrecistas.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Responsável por Instalação *
                  </label>
                  <select
                    value={selectedProfessionals.responsavel || ""}
                    onChange={(e) => setSelectedProfessionals({ ...selectedProfessionals, responsavel: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">Selecione um responsável</option>
                    {responsaveis.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowAssignModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleAssign}
                    className="flex-1 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600"
                  >
                    Atribuir
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showCompleteModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-gray-900">
                  Concluir Instalação
                </h2>
                <button
                  onClick={() => setShowCompleteModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome do Ponto *
                  </label>
                  <input
                    type="text"
                    value={completeForm.nome}
                    onChange={(e) => setCompleteForm({ ...completeForm, nome: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tipo Conector *
                    </label>
                    <select
                      value={completeForm.tipoConector}
                      onChange={(e) => setCompleteForm({ ...completeForm, tipoConector: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
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
                      value={completeForm.velocidade}
                      onChange={(e) => setCompleteForm({ ...completeForm, velocidade: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
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
                      value={completeForm.potencia}
                      onChange={(e) => setCompleteForm({ ...completeForm, potencia: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                      placeholder="Ex: 7.4kW"
                      required
                    />
                  </div>
                </div>

                <div className="h-64 border border-gray-300 rounded-lg overflow-hidden">
                  <MapContainer
                    center={selectedLocation || [parseFloat(selectedRequest.latitude) || -27.0953, parseFloat(selectedRequest.longitude) || -52.6167]}
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

                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={completeForm.disponivel}
                      onChange={(e) => setCompleteForm({ ...completeForm, disponivel: e.target.checked })}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">Disponível</span>
                  </label>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCompleteModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleComplete}
                    className="flex-1 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600"
                  >
                    Concluir e Adicionar ao Mapa
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


