import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthCard from "../components/auth/AuthCard";
import AuthLayout from "../components/auth/AuthLayout";
import { FormAlert } from "../components/auth/FormAlert";
import { FormField } from "../components/auth/FormField";
import { registerEmployee } from "../services/api";
import { formatCpf, cleanCpf, isValidCpfFormat } from "../utils/cpf";

const initialValues = {
  name: "",
  cpf: "",
  email: "",
  password: "",
  passwordConfirm: "",
  position: ""
};

const CARGO_OPTIONS = [
  { value: "pedreiro", label: "Pedreiro" },
  { value: "eletrecista", label: "Eletrecista" },
  { value: "responsável por instalação", label: "Responsável por Instalação" },
  { value: "CEO", label: "CEO" }
];

export default function CadastroFuncionario() {
  const navigate = useNavigate();
  const [formValues, setFormValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isFormValid = useMemo(
    () =>
      formValues.name &&
      isValidCpfFormat(formValues.cpf) &&
      formValues.email &&
      formValues.position &&
      formValues.password.length >= 6 &&
      formValues.password === formValues.passwordConfirm,
    [formValues]
  );

  const handleChange = (field, value) => {
    if (field === "cpf") {
      const formatted = formatCpf(value);
      setFormValues((prev) => ({ ...prev, [field]: formatted }));
    } else {
      setFormValues((prev) => ({ ...prev, [field]: value }));
    }
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validate = () => {
    const newErrors = {};

    if (!formValues.name.trim()) newErrors.name = "Informe seu nome completo.";

    if (!isValidCpfFormat(formValues.cpf)) {
      newErrors.cpf = "Informe um CPF válido.";
    }

    const emailRegex =
      /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
    if (!formValues.email.trim() || !emailRegex.test(formValues.email)) {
      newErrors.email = "Digite um e-mail válido.";
    }

    if (!formValues.position) {
      newErrors.position = "Selecione um cargo.";
    }

    if (formValues.password.length < 6) {
      newErrors.password = "Use pelo menos 6 caracteres.";
    }

    if (formValues.password !== formValues.passwordConfirm) {
      newErrors.passwordConfirm = "As senhas precisam ser iguais.";
    }

    return newErrors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setServerError("");
    setSuccessMessage("");

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      await registerEmployee({
        name: formValues.name,
        cpf: cleanCpf(formValues.cpf),
        email: formValues.email,
        password: formValues.password,
        passwordConfirm: formValues.passwordConfirm,
        position: formValues.position
      });
      setSuccessMessage("Funcionário cadastrado com sucesso! Redirecionando...");
      setTimeout(() => navigate("/login-funcionario"), 1800);
    } catch (error) {
      setServerError(error.message);
      if (error.fieldErrors) {
        setErrors((prev) => ({ ...prev, ...error.fieldErrors }));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout>
      <AuthCard
        title="Cadastro de Funcionário"
        subtitle="Crie sua conta como funcionário da empresa."
        footer={
          <p className="text-center text-sm text-slate-500">
            Já tem uma conta?{" "}
            <Link to="/login-funcionario" className="font-semibold text-emerald-600">
              Faça login
            </Link>
          </p>
        }
      >
        {serverError && <FormAlert variant="error" message={serverError} />}
        {successMessage && (
          <FormAlert variant="success" message={successMessage} />
        )}

        <form className="space-y-4" onSubmit={handleSubmit} noValidate>
          <FormField
            label="Nome completo"
            htmlFor="name"
            placeholder="Ex: João Silva"
            value={formValues.name}
            onChange={(event) => handleChange("name", event.target.value)}
            error={errors.name}
          />

          <div>
            <label htmlFor="cpf" className="block text-sm font-medium text-slate-700 mb-1">
              CPF *
            </label>
            <input
              type="text"
              id="cpf"
              placeholder="000.000.000-00"
              value={formValues.cpf}
              onChange={(event) => handleChange("cpf", event.target.value)}
              maxLength={14}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                errors.cpf ? "border-red-300" : "border-slate-300"
              }`}
            />
            {errors.cpf && (
              <p className="text-xs text-red-500 mt-1">{errors.cpf}</p>
            )}
          </div>

          <FormField
            label="E-mail"
            htmlFor="email"
            type="email"
            placeholder="nome@empresa.com"
            value={formValues.email}
            onChange={(event) => handleChange("email", event.target.value)}
            error={errors.email}
          />

          <div>
            <label htmlFor="position" className="block text-sm font-medium text-slate-700 mb-1">
              Cargo *
            </label>
            <select
              id="position"
              value={formValues.position}
              onChange={(event) => handleChange("position", event.target.value)}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                errors.position ? "border-red-300" : "border-slate-300"
              }`}
            >
              <option value="">Selecione um cargo</option>
              {CARGO_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {errors.position && (
              <p className="text-xs text-red-500 mt-1">{errors.position}</p>
            )}
          </div>

          <FormField
            label="Senha"
            htmlFor="password"
            type="password"
            placeholder="Mínimo 6 caracteres"
            value={formValues.password}
            onChange={(event) => handleChange("password", event.target.value)}
            error={errors.password}
          />

          <FormField
            label="Confirmar senha"
            htmlFor="passwordConfirm"
            type="password"
            placeholder="Repita a senha"
            value={formValues.passwordConfirm}
            onChange={(event) =>
              handleChange("passwordConfirm", event.target.value)
            }
            error={errors.passwordConfirm}
          />

          <button
            type="submit"
            disabled={!isFormValid || isSubmitting}
            className="w-full rounded-xl bg-emerald-500 px-6 py-3 text-base font-semibold text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:bg-emerald-300"
          >
            {isSubmitting ? "Cadastrando..." : "Cadastrar"}
          </button>
        </form>
      </AuthCard>
    </AuthLayout>
  );
}

