import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/navbar";
import Footer from "../components/footer";
import AuthCard from "../components/auth/AuthCard";
import { FormAlert } from "../components/auth/FormAlert";
import { FormField } from "../components/auth/FormField";
import { getProfile, updateProfile } from "../services/api";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

export default function Perfil() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  const [formValues, setFormValues] = useState({
    name: "",
    email: "",
    password: "",
    passwordConfirm: ""
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    loadProfile(token);
  }, [navigate]);

  const loadProfile = async (token) => {
    try {
      const data = await getProfile(token);
      const userData = data.user || data;
      setUser(userData);
      setFormValues({
        name: userData.name || userData.nome || "",
        email: userData.email || "",
        password: "",
        passwordConfirm: ""
      });
      if (userData.imagemUrl) {
        setPreviewImage(`${API_URL}${userData.imagemUrl}`);
      }
      setLoading(false);
    } catch (err) {
      setError(err.message || "Erro ao carregar perfil");
      setLoading(false);
      if (err.message.includes("Token") || err.message.includes("401")) {
        localStorage.removeItem("token");
        navigate("/login");
      }
    }
  };

  const handleChange = (field, value) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
    setError("");
    setSuccess("");
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setError("Por favor, selecione uma imagem válida.");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError("A imagem deve ter no máximo 5MB.");
        return;
      }
      setSelectedImage(file);
      setPreviewImage(URL.createObjectURL(file));
      setError("");
    }
  };

  const validate = () => {
    const newErrors = {};
    const emailRegex =
      /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

    if (!formValues.name.trim()) {
      newErrors.name = "Digite seu nome completo.";
    }

    if (!formValues.email.trim() || !emailRegex.test(formValues.email)) {
      newErrors.email = "Digite um e-mail válido.";
    }

    if (formValues.password) {
      if (formValues.password.length < 6) {
        newErrors.password = "Sua senha precisa ter 6 caracteres.";
      }
      if (formValues.password !== formValues.passwordConfirm) {
        newErrors.passwordConfirm = "As senhas precisam ser iguais.";
      }
    }

    return newErrors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("name", formValues.name);
      formData.append("email", formValues.email);
      
      if (formValues.password) {
        formData.append("password", formValues.password);
        formData.append("passwordConfirm", formValues.passwordConfirm);
      }

      if (selectedImage) {
        formData.append("imagem", selectedImage);
      }

      const response = await updateProfile(formData);
      
      setSuccess(response.message || "Perfil atualizado com sucesso!");
      setUser(response.user);
      setSelectedImage(null);
      
      if (response.user.imagemUrl) {
        setPreviewImage(`${API_URL}${response.user.imagemUrl}`);
      }
      
      setFormValues((prev) => ({
        ...prev,
        password: "",
        passwordConfirm: ""
      }));

      window.dispatchEvent(new Event("profileUpdated"));
    } catch (err) {
      setError(err.message || "Erro ao atualizar perfil");
      if (err.fieldErrors) {
        setErrors((prev) => ({ ...prev, ...err.fieldErrors }));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <p className="text-slate-600">Carregando perfil...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-500">Nenhum dado encontrado</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow py-10 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-center">
            <div className="w-full max-w-[500px]">
              <AuthCard
                title="Meu Perfil"
                subtitle="Atualize suas informações pessoais."
              >
                {error && <FormAlert variant="error" message={error} />}
                {success && <FormAlert variant="success" message={success} />}

                <form className="space-y-4" onSubmit={handleSubmit} noValidate>
                  <div className="flex flex-col items-center gap-4">
                    <div className="relative">
                      {previewImage ? (
                        <img
                          src={previewImage}
                          alt="Foto de perfil"
                          className="h-32 w-32 rounded-full object-cover border-4 border-emerald-100"
                        />
                      ) : (
                        <div className="h-32 w-32 rounded-full bg-emerald-100 flex items-center justify-center border-4 border-emerald-200">
                          <span className="text-4xl font-semibold text-emerald-600">
                            {user.name?.charAt(0)?.toUpperCase() || user.nome?.charAt(0)?.toUpperCase() || "U"}
                          </span>
                        </div>
                      )}
                    </div>
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                      <span className="px-4 py-2 rounded-lg bg-emerald-500 text-white font-medium hover:bg-emerald-600 transition text-sm">
                        {previewImage ? "Alterar Foto" : "Adicionar Foto"}
                      </span>
                    </label>
                  </div>

                  <FormField
            label="Nome Completo"
            htmlFor="profile-name"
            type="text"
            placeholder="Seu nome completo"
            value={formValues.name}
            onChange={(event) => handleChange("name", event.target.value)}
            error={errors.name}
                  />

                  <FormField
            label="E-mail"
            htmlFor="profile-email"
            type="email"
            placeholder="nome@empresa.com"
            value={formValues.email}
            onChange={(event) => handleChange("email", event.target.value)}
            error={errors.email}
                  />

                  <div className="pt-4 border-t border-slate-200">
                    <p className="text-sm font-medium text-slate-600 mb-4">
                      Alterar Senha (deixe em branco para não alterar)
                    </p>

                    <FormField
              label="Nova Senha"
              htmlFor="profile-password"
              type={showPassword ? "text" : "password"}
              placeholder="Digite sua nova senha"
              value={formValues.password}
              onChange={(event) => handleChange("password", event.target.value)}
              error={errors.password}
              rightSlot={
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="text-sm font-semibold text-emerald-600"
                >
                  {showPassword ? "Ocultar" : "Mostrar"}
                </button>
              }
                    />

                    <FormField
              label="Confirmar Nova Senha"
              htmlFor="profile-password-confirm"
              type={showPasswordConfirm ? "text" : "password"}
              placeholder="Confirme sua nova senha"
              value={formValues.passwordConfirm}
              onChange={(event) =>
                handleChange("passwordConfirm", event.target.value)
              }
              error={errors.passwordConfirm}
              rightSlot={
                <button
                  type="button"
                  onClick={() => setShowPasswordConfirm((prev) => !prev)}
                  className="text-sm font-semibold text-emerald-600"
                >
                  {showPasswordConfirm ? "Ocultar" : "Mostrar"}
                </button>
              }
                    />
                  </div>

                  <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-emerald-500 px-6 py-3 text-base font-semibold text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:bg-emerald-300"
          >
            {isSubmitting ? "Salvando..." : "Salvar Alterações"}
                  </button>
                </form>
              </AuthCard>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
