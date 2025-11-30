import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthCard from "../components/auth/AuthCard";
import AuthLayout from "../components/auth/AuthLayout";
import { FormAlert } from "../components/auth/FormAlert";
import { FormField } from "../components/auth/FormField";
import { loginEmployee } from "../services/api";
import { formatCpf, cleanCpf, isValidCpfFormat } from "../utils/cpf";

export default function LoginFuncionario() {
  const navigate = useNavigate();
  const [formValues, setFormValues] = useState({ cpf: "", password: "" });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const isFormValid = useMemo(
    () => isValidCpfFormat(formValues.cpf) && formValues.password.length >= 6,
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

    if (!isValidCpfFormat(formValues.cpf)) {
      newErrors.cpf = "Digite um CPF válido.";
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
      const response = await loginEmployee({
        cpf: cleanCpf(formValues.cpf),
        password: formValues.password
      });
      localStorage.setItem("employeeToken", response.token);
      localStorage.setItem("employeeData", JSON.stringify(response.employee));
      navigate("/dashboard-funcionario");
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
        title="Login de Funcionário"
        subtitle="Acesse sua conta de funcionário."
        footer={
          <p className="text-center text-sm text-slate-500">
            Não tem uma conta?{" "}
            <Link to="/cadastro-funcionario" className="font-semibold text-emerald-600">
              Cadastre-se
            </Link>
          </p>
        }
      >
        {serverError && <FormAlert variant="error" message={serverError} />}

        <form className="space-y-4" onSubmit={handleSubmit} noValidate>
          <div>
            <label htmlFor="login-cpf" className="block text-sm font-medium text-slate-700 mb-1">
              CPF
            </label>
            <input
              type="text"
              id="login-cpf"
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

          <div className="flex items-center justify-end text-sm">
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

