import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthCard from "../components/auth/AuthCard";
import AuthLayout from "../components/auth/AuthLayout";
import { FormAlert } from "../components/auth/FormAlert";
import { FormField } from "../components/auth/FormField";
import { register } from "../services/api";

const initialValues = {
  name: "",
  email: "",
  password: "",
  passwordConfirm: "",
  acceptTerms: false
};

export default function Register() {
  const navigate = useNavigate();
  const [formValues, setFormValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isFormValid = useMemo(
    () =>
      formValues.name &&
      formValues.email &&
      formValues.password.length >= 6 &&
      formValues.password === formValues.passwordConfirm &&
      formValues.acceptTerms,
    [formValues]
  );

  const handleChange = (field, value) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validate = () => {
    const newErrors = {};

    if (!formValues.name.trim()) newErrors.name = "Informe seu nome completo.";

    const emailRegex =
      /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
    if (!formValues.email.trim() || !emailRegex.test(formValues.email)) {
      newErrors.email = "Digite um e-mail válido.";
    }

    if (formValues.password.length < 6) {
      newErrors.password = "Use pelo menos 6 caracteres.";
    }

    if (formValues.password !== formValues.passwordConfirm) {
      newErrors.passwordConfirm = "As senhas precisam ser iguais.";
    }

    if (!formValues.acceptTerms) {
      newErrors.acceptTerms =
        "É necessário aceitar os Termos de Serviço e Política de Privacidade.";
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
      await register({
        name: formValues.name,
        email: formValues.email,
        password: formValues.password,
        passwordConfirm: formValues.passwordConfirm
      });
      setSuccessMessage("Conta criada com sucesso! Redirecionando...");
      setTimeout(() => navigate("/login"), 1800);
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
        title="Crie sua Conta"
        subtitle="Rápido e fácil. Comece a gerenciar seus pontos de recarga."
        footer={
          <p className="text-center text-sm text-slate-500">
            Já tem uma conta?{" "}
            <Link to="/login" className="font-semibold text-emerald-600">
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
            placeholder="Ex: Maria Silva"
            value={formValues.name}
            onChange={(event) => handleChange("name", event.target.value)}
            error={errors.name}
          />

          <FormField
            label="E-mail"
            htmlFor="email"
            type="email"
            placeholder="nome@empresa.com"
            value={formValues.email}
            onChange={(event) => handleChange("email", event.target.value)}
            error={errors.email}
          />

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

          <div className="space-y-2">
            <label className="flex items-start gap-3 text-sm text-slate-600">
              <input
                type="checkbox"
                className="mt-1 h-5 w-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                checked={formValues.acceptTerms}
                onChange={(event) =>
                  handleChange("acceptTerms", event.target.checked)
                }
              />
              <span>
                Li e aceito os{" "}
                <a
                  className="font-semibold text-emerald-600"
                  href="#term"
                  onClick={(e) => e.preventDefault()}
                >
                  Termos de Serviço
                </a>{" "}
                e a{" "}
                <a
                  className="font-semibold text-emerald-600"
                  href="#privacy"
                  onClick={(e) => e.preventDefault()}
                >
                  Política de Privacidade
                </a>
                .
              </span>
            </label>
            {errors.acceptTerms && (
              <p className="text-xs text-red-500">{errors.acceptTerms}</p>
            )}
          </div>

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