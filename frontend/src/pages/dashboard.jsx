import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import { Icon } from "leaflet";
import Navbar from "../components/navbar";
import Footer from "../components/footer";
import { createRecharge, getRecharges, getChargingPoints } from "../services/api";
import "leaflet/dist/leaflet.css";

delete Icon.Default.prototype._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
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

const createSelectedIcon = () => {
  const svg = `
    <svg width="32" height="40" viewBox="0 0 32 40" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="shadow-blue" x="-50%" y="-50%" width="200%" height="200%">
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
      </defs>
      <ellipse cx="16" cy="36" rx="8" ry="3" fill="#000" opacity="0.2"/>
      <path d="M16 2C10 2 4 8 4 14c0 8 12 20 12 20s12-12 12-20c0-6-6-12-12-12z" 
            fill="#3b82f6" 
            stroke="white" 
            stroke-width="2"
            filter="url(#shadow-blue)"/>
      <circle cx="16" cy="14" r="6" fill="white"/>
    </svg>
  `;
  
  return new Icon({
    iconUrl: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`,
    iconSize: [32, 40],
    iconAnchor: [16, 40],
    popupAnchor: [0, -40],
  });
};

function MapClickHandler({ onMapClick }) {
  useMapEvents({
    click: (e) => {
      onMapClick(e.latlng);
    },
  });
  return null;
}


export default function Dashboard() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState("7dias");
  const [showModal, setShowModal] = useState(false);
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 5;
  const [formData, setFormData] = useState({
    local: "",
    endereco: "",
    dataHora: "",
    duracao: "",
    energia: "",
    custo: ""
  });
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [mapCenter] = useState([-27.0953, -52.6167]); // Chapecó, SC
  const [loadingAddress, setLoadingAddress] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [pontosCarregamento, setPontosCarregamento] = useState([]);
  const [loadingPoints, setLoadingPoints] = useState(true);

  const filters = [
    { id: "7dias", label: "Últimos 7 dias" },
    { id: "30dias", label: "Últimos 30 dias" },
    { id: "6meses", label: "Últimos 6 meses" }
  ];

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    loadRecharges();
    loadChargingPoints();
  }, [navigate, activeFilter, currentPage]);

  const loadChargingPoints = async () => {
    try {
      setLoadingPoints(true);
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
    } catch (error) {
      console.error("Erro ao carregar pontos de recarga:", error);
    } finally {
      setLoadingPoints(false);
    }
  };

  const getStartDateForFilter = (filterId) => {
    const now = new Date();
    let startDate = null;

    switch (filterId) {
      case "7dias":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "30dias":
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case "6meses":
        startDate = new Date(now.getTime() - 6 * 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = null;
    }

    return startDate ? startDate.toISOString() : null;
  };

  const loadRecharges = async () => {
    try {
      setLoading(true);
      const offset = (currentPage - 1) * itemsPerPage;
      const startDate = getStartDateForFilter(activeFilter);
      const response = await getRecharges(itemsPerPage, offset, startDate);
      setHistoryData(response.recharges || []);
      setTotalItems(response.total || 0);
    } catch (error) {
      console.error("Erro ao carregar recargas:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setFormErrors(prev => ({ ...prev, [field]: undefined }));
  };

  const reverseGeocode = async (lat, lng) => {
    try {
      setLoadingAddress(true);
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        {
          headers: {
            "User-Agent": "EVChargeSC/1.0"
          }
        }
      );
      const data = await response.json();
      
      if (data && data.address) {
        const address = data.address;
        const addressParts = [];
        
        if (address.road) addressParts.push(address.road);
        if (address.house_number) addressParts.push(address.house_number);
        if (addressParts.length > 0) {
          addressParts.push("-");
        }
        if (address.city || address.town || address.village) {
          addressParts.push(address.city || address.town || address.village);
        }
        if (address.state) {
          addressParts.push(address.state);
        }
        
        const fullAddress = addressParts.join(" ");
        const placeName = address.amenity || address.shop || address.building || address.road || "Local selecionado";
        
        setFormData(prev => ({
          ...prev,
          local: placeName,
          endereco: fullAddress || `${lat.toFixed(6)}, ${lng.toFixed(6)}`
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          local: "Local selecionado",
          endereco: `${lat.toFixed(6)}, ${lng.toFixed(6)}`
        }));
      }
    } catch (error) {
      console.error("Erro ao obter endereço:", error);
      setFormData(prev => ({
        ...prev,
        local: "Local selecionado",
        endereco: `${lat.toFixed(6)}, ${lng.toFixed(6)}`
      }));
    } finally {
      setLoadingAddress(false);
    }
  };

  const handleMapClick = (latlng) => {
    setSelectedLocation([latlng.lat, latlng.lng]);
    setSelectedPoint(null);
    reverseGeocode(latlng.lat, latlng.lng);
  };

  const handlePointClick = (ponto) => {
    setSelectedPoint(ponto.id);
    setSelectedLocation([ponto.lat, ponto.lng]);
    setFormData(prev => ({
      ...prev,
      local: ponto.nome,
      endereco: ponto.endereco
    }));
  };

  const validateForm = () => {
    const errors = {};
    
    if (!selectedLocation && !selectedPoint) {
      errors.map = "Selecione um local no mapa clicando em um ponto de recarga ou em qualquer lugar do mapa.";
    }
    
    if (!formData.local.trim()) errors.local = "Informe o local da recarga.";
    if (!formData.endereco.trim()) errors.endereco = "Informe o endereço.";
    if (!formData.dataHora.trim()) errors.dataHora = "Informe a data e hora.";
    if (!formData.duracao.trim()) errors.duracao = "Informe a duração.";
    if (!formData.energia.trim()) errors.energia = "Informe a energia consumida.";
    if (!formData.custo.trim()) errors.custo = "Informe o custo.";

    if (formData.energia && isNaN(parseFloat(formData.energia))) {
      errors.energia = "Energia deve ser um número válido.";
    }

    if (formData.custo && isNaN(parseFloat(formData.custo))) {
      errors.custo = "Custo deve ser um número válido.";
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormErrors({});
    setSuccessMessage("");

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsSubmitting(true);
    try {
      await createRecharge({
        local: formData.local,
        endereco: formData.endereco,
        dataHora: formData.dataHora,
        duracao: formData.duracao,
        energia: parseFloat(formData.energia),
        custo: parseFloat(formData.custo)
      });

      setSuccessMessage("Recarga registrada com sucesso!");
      setFormData({
        local: "",
        endereco: "",
        dataHora: "",
        duracao: "",
        energia: "",
        custo: ""
      });
      setSelectedLocation(null);
      setSelectedPoint(null);
      
      setTimeout(() => {
        setShowModal(false);
        setSuccessMessage("");
        setCurrentPage(1);
        loadRecharges();
      }, 1500);
    } catch (error) {
      if (error.fieldErrors) {
        setFormErrors(error.fieldErrors);
      } else {
        setFormErrors({ submit: error.message || "Erro ao registrar recarga." });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return "";
    const date = new Date(dateTimeString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${day}/${month}/${year} às ${hours}:${minutes}`;
  };

  const formatCurrency = (value) => {
    if (!value) return "0,00";
    return parseFloat(value).toFixed(2).replace(".", ",");
  };

  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const shouldShowPagination = totalPages > 1;

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

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
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };


  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Navbar />
      
      <div className="flex-1 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-semibold text-gray-900">
              Meu histórico de recargas
            </h1>
            <button
              onClick={() => setShowModal(true)}
              className="px-6 py-2 rounded-lg bg-emerald-500 text-white font-semibold hover:bg-emerald-600 transition"
            >
              + Nova Recarga
            </button>
          </div>

          <div className="flex items-center gap-3 mb-6">
          {filters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => {
                setActiveFilter(filter.id);
                setCurrentPage(1);
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                activeFilter === filter.id
                  ? "bg-emerald-500 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              {filter.label}
            </button>
          ))}
            <button className="px-4 py-2 rounded-lg bg-white text-gray-600 hover:bg-gray-50 text-sm font-medium">
              ...
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="bg-gray-50 grid grid-cols-5 gap-4 px-6 py-4 border-b border-gray-200">
              <div className="font-medium text-gray-700">Local</div>
              <div className="font-medium text-gray-700">Data e hora</div>
              <div className="font-medium text-gray-700">Duração</div>
              <div className="font-medium text-gray-700">Energia (kwh)</div>
              <div className="font-medium text-gray-700">Custo (R$)</div>
            </div>

            {loading ? (
              <div className="px-6 py-8 text-center text-gray-500">
                Carregando...
              </div>
            ) : historyData.length === 0 ? (
              <div className="px-6 py-8 text-center text-gray-500">
                Nenhuma recarga registrada ainda.
              </div>
            ) : (
              historyData.map((item) => (
                <div
                  key={item.id}
                  className="grid grid-cols-5 gap-4 px-6 py-4 border-b border-gray-100 hover:bg-gray-50 transition"
                >
                  <div>
                    <div className="font-medium text-gray-900">{item.local}</div>
                    <div className="text-sm text-gray-500 mt-1">{item.endereco}</div>
                  </div>
                  <div className="text-gray-700">{formatDateTime(item.dataHora)}</div>
                  <div className="text-gray-700">{item.duracao}</div>
                  <div className="text-gray-700">{formatCurrency(item.energia)}</div>
                  <div className="text-gray-700">R$ {formatCurrency(item.custo)}</div>
                </div>
              ))
            )}
          </div>

          {shouldShowPagination && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-2 rounded-lg bg-white text-gray-600 hover:bg-gray-50 border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                &lt;
              </button>
              {getPageNumbers().map((page, index) => {
                if (page === '...') {
                  return (
                    <span key={`ellipsis-${index}`} className="px-2 text-gray-500">
                      ...
                    </span>
                  );
                }
                return (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-4 py-2 rounded-lg font-medium transition ${
                      currentPage === page
                        ? "bg-emerald-500 text-white"
                        : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-2 rounded-lg bg-white text-gray-600 hover:bg-gray-50 border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                &gt;
              </button>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-gray-900">Nova Recarga</h2>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setFormData({
                      local: "",
                      endereco: "",
                      dataHora: "",
                      duracao: "",
                      energia: "",
                      custo: ""
                    });
                    setSelectedLocation(null);
                    setSelectedPoint(null);
                    setFormErrors({});
                    setSuccessMessage("");
                  }}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              {successMessage && (
                <div className="mb-4 p-3 bg-emerald-50 text-emerald-700 rounded-lg">
                  {successMessage}
                </div>
              )}

              {formErrors.submit && (
                <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg">
                  {formErrors.submit}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Selecione o local no mapa *
                  </label>
                  <div className={`h-96 w-full rounded-lg overflow-hidden border ${
                    formErrors.map ? "border-red-300" : "border-gray-300"
                  }`}>
                    <MapContainer
                      center={mapCenter}
                      zoom={9}
                      style={{ height: "100%", width: "100%", zIndex: 0 }}
                      scrollWheelZoom={true}
                    >
                      <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                        subdomains="abcd"
                        maxZoom={19}
                      />
                      <MapClickHandler onMapClick={handleMapClick} />
                    
                      {pontosCarregamento.map((ponto) => (
                        <Marker
                          key={ponto.id}
                          position={[ponto.lat, ponto.lng]}
                          icon={createChargingIcon(ponto.disponivel)}
                          eventHandlers={{
                            click: () => handlePointClick(ponto)
                          }}
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
                                <button
                                  onClick={() => handlePointClick(ponto)}
                                  className="w-full mt-2 px-3 py-1 bg-emerald-500 text-white rounded text-xs hover:bg-emerald-600 transition"
                                >
                                  Usar este local
                                </button>
                              </div>
                            </div>
                          </Popup>
                        </Marker>
                      ))}
                    
                      {selectedLocation && !selectedPoint && (
                        <Marker position={selectedLocation} icon={createSelectedIcon()} />
                      )}
                    </MapContainer>
                  </div>
                  {formErrors.map && (
                    <p className="text-sm text-red-500 mt-1">{formErrors.map}</p>
                  )}
                  {loadingAddress && (
                    <p className="text-sm text-gray-500 mt-2">Carregando endereço...</p>
                  )}
                  <p className="text-xs text-gray-500 mt-2">
                    Clique em um ponto de recarga existente ou em qualquer lugar do mapa para selecionar a localização
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Local *
                  </label>
                  <input
                    type="text"
                    value={formData.local}
                    onChange={(e) => handleInputChange("local", e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="Ex: Supermercado central"
                  />
                  {formErrors.local && (
                    <p className="text-sm text-red-500 mt-1">{formErrors.local}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Endereço *
                  </label>
                  <input
                    type="text"
                    value={formData.endereco}
                    onChange={(e) => handleInputChange("endereco", e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="Ex: Rua das Flores, 123 - Chapecó, SC"
                  />
                  {formErrors.endereco && (
                    <p className="text-sm text-red-500 mt-1">{formErrors.endereco}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data e Hora *
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.dataHora}
                    onChange={(e) => handleInputChange("dataHora", e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                  {formErrors.dataHora && (
                    <p className="text-sm text-red-500 mt-1">{formErrors.dataHora}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Duração *
                    </label>
                    <input
                      type="text"
                      value={formData.duracao}
                      onChange={(e) => handleInputChange("duracao", e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="Ex: 02:15min"
                    />
                    {formErrors.duracao && (
                      <p className="text-sm text-red-500 mt-1">{formErrors.duracao}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Energia (kwh) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.energia}
                      onChange={(e) => handleInputChange("energia", e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="Ex: 22.15"
                    />
                    {formErrors.energia && (
                      <p className="text-sm text-red-500 mt-1">{formErrors.energia}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Custo (R$) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.custo}
                    onChange={(e) => handleInputChange("custo", e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="Ex: 40.50"
                  />
                  {formErrors.custo && (
                    <p className="text-sm text-red-500 mt-1">{formErrors.custo}</p>
                  )}
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setFormData({
                        local: "",
                        endereco: "",
                        dataHora: "",
                        duracao: "",
                        energia: "",
                        custo: ""
                      });
                      setSelectedLocation(null);
                      setSelectedPoint(null);
                      setFormErrors({});
                      setSuccessMessage("");
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition disabled:bg-emerald-300 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? "Salvando..." : "Salvar Recarga"}
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
