import React, { useState } from 'react';
import Navbar from "../components/navbar";
import Footer from "../components/footer";
import estacionamento from "../imagens/estacionamento.jpg";

function Orcamentos() {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    empresa: '',
    telefone: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Formulário enviado:', formData);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow">
        <section className="relative h-[600px] w-full overflow-hidden">
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url(${estacionamento})`,
            }}
          >
            <div className="absolute inset-0 bg-black/50"></div>
          </div>
          
          <div className="relative h-full flex items-center">
            <div className="container mx-auto px-10">
              
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                  Solução de recarga inteligente para seu Negócio
                </h1>
                <p className="text-lg text-white mb-8 leading-relaxed">
                  Ajudamos negócios de Santa Catarina a se destacarem com a mobilidade elétrica, oferecendo estações de recarga eficientes e modernas.
                </p>
                <a
                  href="#formulario"
                  className="inline-block px-8 py-3 bg-emerald-400 text-white font-semibold rounded-lg hover:bg-emerald-500 transition-colors"
                >
                  Solicite uma consulta
                </a>

            </div>
          </div>
        </section>

        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-10">
            <h2 className="text-4xl font-bold text-gray-800 mb-6 text-center">
              Transforme seu negócio com a mobilidade elétrica.
            </h2>
            <p className="text-lg text-gray-600 max-w-4xl leading-relaxed text-center mx-auto">
              Oferecer pontos de recarga não é apenas uma comodidade, é um investimento estratégico que posiciona sua empresa na vanguarda da inovação e sustentabilidade.
            </p>
          </div>
        </section>

        <section id="formulario" className="py-20 bg-gray-50">
          <div className="container mx-auto px-10">
            <div className="bg-gray-100 rounded-xl shadow-lg p-12 max-w-4xl mx-auto">
              <h2 className="text-4xl font-bold text-gray-800 mb-4 text-center">
                Fale com um Especialista
              </h2>
              <p className="text-lg text-gray-600 mb-8 text-center max-w-2xl mx-auto">
                Preencha o formulário abaixo para solicitar uma consulta sem compromisso. Nossa equipe entrará em contato para entender suas necessidades e propor a melhor solução.
              </p>

              <form onSubmit={handleSubmit} className="mt-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-2">
                      Seu nome
                    </label>
                    <input
                      type="text"
                      id="nome"
                      name="nome"
                      value={formData.nome}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white"
                      placeholder="Insira seu nome"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      E-mail
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white"
                      placeholder="exemplo@empresa.com"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="empresa" className="block text-sm font-medium text-gray-700 mb-2">
                      Empresa
                    </label>
                    <input
                      type="text"
                      id="empresa"
                      name="empresa"
                      value={formData.empresa}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white"
                      placeholder="Nome da sua empresa"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="telefone" className="block text-sm font-medium text-gray-700 mb-2">
                      Telefone
                    </label>
                    <input
                      type="tel"
                      id="telefone"
                      name="telefone"
                      value={formData.telefone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white"
                      placeholder="(49) 90000-0000"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full px-8 py-4 bg-emerald-400 text-white font-semibold rounded-lg hover:bg-emerald-500 transition-colors"
                >
                  Enviar Solicitação
                </button>
              </form>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default Orcamentos;
