import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/navbar';
import Footer from '../components/footer';

function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleAccordion = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const faqData = {
    instalacao: [
      {
        question: "Quanto tempo leva para a instalação do carregador?",
        answer: "A instalação geralmente leva entre 2 a 4 horas, dependendo da complexidade da instalação elétrica do local."
      },
      {
        question: "Quais os pré-requisitos técnicos antes da instalação",
        answer: "É necessário ter um quadro elétrico com espaço disponível para disjuntor dedicado, fiação adequada para a corrente necessária e um local apropriado para fixação do equipamento."
      },
      {
        question: "Vocês instalam em condomínio?",
        answer: "Sim, realizamos instalações em condomínios. É importante verificar as normas internas do condomínio e obter aprovação prévia da administração."
      }
    ],
    uso: [
      {
        question: "Os carregadores são compatíveis com todos os modelos?",
        answer: "Nossos carregadores são compatíveis com a maioria dos veículos elétricos que seguem o padrão de conector utilizado no Brasil (Tipo 2 ou CCS2)."
      },
      {
        question: "Posso monitorar o carregamento remotamente",
        answer: "Sim, através do nosso aplicativo você pode monitorar o status do carregamento, verificar o consumo de energia e programar horários de recarga."
      }
    ],
    custos: [
      {
        question: "Como funciona o orçamento",
        answer: "Você pode solicitar um orçamento através do nosso site ou aplicativo. Nossa equipe fará uma visita técnica gratuita para avaliar o local e fornecer um orçamento detalhado."
      },
      {
        question: "Quais as formas e meios de pagamento",
        answer: "Aceitamos diversas formas de pagamento: cartão de crédito (parcelado em até 12x), débito, PIX, boleto bancário e financiamento para projetos maiores."
      }
    ]
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-grow">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">PERGUNTAS FREQUENTES</h1>
          <p className="text-gray-600 mb-8">Encontre respostas sobre as dúvidas mais frequentes sobre o nosso serviço</p>
        </div>

        <section className="mb-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Sobre a instalação</h2>
          <div className="space-y-3">
            {faqData.instalacao.map((item, index) => (
              <div key={index} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <button
                  onClick={() => toggleAccordion(`instalacao-${index}`)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                >
                  <span className="font-medium text-gray-900">{item.question}</span>
                  <span className="text-2xl text-gray-500">
                    {openIndex === `instalacao-${index}` ? '−' : '+'}
                  </span>
                </button>
                {openIndex === `instalacao-${index}` && (
                  <div className="px-6 pb-4 text-gray-600 border-t border-gray-200 pt-4">
                    {item.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Uso dos carregadores</h2>
          <div className="space-y-3">
            {faqData.uso.map((item, index) => (
              <div key={index} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <button
                  onClick={() => toggleAccordion(`uso-${index}`)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                >
                  <span className="font-medium text-gray-900">{item.question}</span>
                  <span className="text-2xl text-gray-500">
                    {openIndex === `uso-${index}` ? '−' : '+'}
                  </span>
                </button>
                {openIndex === `uso-${index}` && (
                  <div className="px-6 pb-4 text-gray-600 border-t border-gray-200 pt-4">
                    {item.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Custos e pagamento</h2>
          <div className="space-y-3">
            {faqData.custos.map((item, index) => (
              <div key={index} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <button
                  onClick={() => toggleAccordion(`custos-${index}`)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                >
                  <span className="font-medium text-gray-900">{item.question}</span>
                  <span className="text-2xl text-gray-500">
                    {openIndex === `custos-${index}` ? '−' : '+'}
                  </span>
                </button>
                {openIndex === `custos-${index}` && (
                  <div className="px-6 pb-4 text-gray-600 border-t border-gray-200 pt-4">
                    {item.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default FAQ;
