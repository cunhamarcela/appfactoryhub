import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Política de Privacidade - App Factory Hub",
  description: "Política de privacidade e proteção de dados do App Factory Hub",
}

export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Política de Privacidade</h1>
      
      <div className="prose prose-gray max-w-none">
        <p className="text-sm text-gray-600 mb-6">
          Última atualização: {new Date().toLocaleDateString('pt-BR')}
        </p>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">1. Informações que Coletamos</h2>
          <p className="mb-4">
            O App Factory Hub coleta apenas as informações necessárias para fornecer nossos serviços:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>Informações de conta (nome, email) através do GitHub OAuth</li>
            <li>Dados de projetos e tarefas que você cria</li>
            <li>Informações de uso para melhorar nossa plataforma</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">2. Como Usamos suas Informações</h2>
          <p className="mb-4">
            Utilizamos suas informações para:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>Fornecer e manter nossos serviços</li>
            <li>Personalizar sua experiência</li>
            <li>Comunicar atualizações importantes</li>
            <li>Melhorar nossa plataforma</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">3. Compartilhamento de Dados</h2>
          <p className="mb-4">
            Não vendemos, alugamos ou compartilhamos suas informações pessoais com terceiros, 
            exceto quando necessário para fornecer nossos serviços ou quando exigido por lei.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">4. Segurança</h2>
          <p className="mb-4">
            Implementamos medidas de segurança técnicas e organizacionais apropriadas para 
            proteger suas informações contra acesso não autorizado, alteração, divulgação ou destruição.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">5. Seus Direitos</h2>
          <p className="mb-4">
            Você tem o direito de:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>Acessar suas informações pessoais</li>
            <li>Corrigir dados incorretos</li>
            <li>Solicitar a exclusão de seus dados</li>
            <li>Exportar seus dados</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">6. Contato</h2>
          <p className="mb-4">
            Para questões sobre esta política de privacidade, entre em contato através do GitHub.
          </p>
        </section>
      </div>
    </div>
  )
}
