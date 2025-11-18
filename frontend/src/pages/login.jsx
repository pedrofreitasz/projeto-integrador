import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthCard from "../components/auth/AuthCard";
import AuthLayout from "../components/auth/AuthLayout";
import { FormAlert } from "../components/auth/FormAlert";
import { FormField } from "../components/auth/FormField";
import { login } from "../services/api";

export default function Login() {
  const navigate = useNavigate();
  const [formValues, setFormValues] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const isFormValid = useMemo(
    () => formValues.email && formValues.password.length >= 6,
    [formValues]
  );

  const handleChange = (field, value) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validate = () => {
    const newErrors = {};
    const emailRegex =
      /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

    if (!formValues.email.trim() || !emailRegex.test(formValues.email)) {
      newErrors.email = "Digite um e-mail válido.";
    }

    if (formValues.password.length < 6) {
      newErrors.password = "Sua senha precisa ter 6 caracteres.";
    }

    return newErrors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setServerError("");

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await login({
        email: formValues.email,
        password: formValues.password
      });
      localStorage.setItem("token", response.token);
      navigate("/dashboard");
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
        title="Bem-vindo de volta"
        subtitle="Acesse sua conta para continuar."
        footer={
          <p className="text-center text-sm text-slate-500">
            Não tem uma conta?{" "}
            <Link to="/cadastro" className="font-semibold text-emerald-600">
              Cadastre-se
            </Link>
          </p>
        }
      >
        {serverError && <FormAlert variant="error" message={serverError} />}

        <form className="space-y-4" onSubmit={handleSubmit} noValidate>
          <FormField
            label="E-mail"
            htmlFor="login-email"
            type="email"
            placeholder="nome@empresa.com"
            value={formValues.email}
            onChange={(event) => handleChange("email", event.target.value)}
            error={errors.email}
          />

          <FormField
            label="Senha"
            htmlFor="login-password"
            type={showPassword ? "text" : "password"}
            placeholder="Digite sua senha"
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

          <div className="flex items-center justify-between text-sm">
            <Link
              to="/recuperar-senha"
              className="font-semibold text-emerald-600"
            >
              Esqueceu sua senha?
            </Link>
            <Link to="/" className="text-slate-400 hover:text-slate-600">
              Página inicial
            </Link>
          </div>

          <button
            type="submit"
            disabled={!isFormValid || isSubmitting}
            className="w-full rounded-xl bg-emerald-500 px-6 py-3 text-base font-semibold text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:bg-emerald-300"
          >
            {isSubmitting ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </AuthCard>
    </AuthLayout>
  );
}