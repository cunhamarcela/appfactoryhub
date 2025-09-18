import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Termos de Uso - App Factory Hub",
  description: "Termos de uso e condições de serviço do App Factory Hub",
}

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Termos de Uso</h1>
      
      <div className="prose prose-gray max-w-none">
        <p className="text-sm text-gray-600 mb-6">
          Última atualização: {new Date().toLocaleDateString('pt-BR')}
        </p>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">1. Aceitação dos Termos</h2>
          <p className="mb-4">
            Ao acessar e usar o App Factory Hub, você concorda em cumprir estes termos de uso 
            e todas as leis e regulamentos aplicáveis.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">2. Descrição do Serviço</h2>
          <p className="mb-4">
            O App Factory Hub é uma plataforma para desenvolvimento e gerenciamento de 
            projetos de aplicativos móveis, oferecendo ferramentas de IA para auxiliar 
            no processo de desenvolvimento.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">3. Conta de Usuário</h2>
          <p className="mb-4">
            Para usar nossos serviços, você deve:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>Ter uma conta GitHub válida</li>
            <li>Fornecer informações precisas e atualizadas</li>
            <li>Manter a segurança de sua conta</li>
            <li>Ser responsável por todas as atividades em sua conta</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">4. Uso Aceitável</h2>
          <p className="mb-4">
            Você concorda em não usar nossos serviços para:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>Atividades ilegais ou não autorizadas</li>
            <li>Violar direitos de propriedade intelectual</li>
            <li>Distribuir malware ou conteúdo prejudicial</li>
            <li>Interferir no funcionamento da plataforma</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">5. Propriedade Intelectual</h2>
          <p className="mb-4">
            Você mantém todos os direitos sobre o conteúdo que cria usando nossa plataforma. 
            O App Factory Hub mantém os direitos sobre sua tecnologia e interface.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">6. Limitação de Responsabilidade</h2>
          <p className="mb-4">
            O App Factory Hub é fornecido &ldquo;como está&rdquo; sem garantias. Não nos responsabilizamos 
            por danos diretos, indiretos ou consequenciais decorrentes do uso da plataforma.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">7. Modificações</h2>
          <p className="mb-4">
            Reservamos o direito de modificar estes termos a qualquer momento. 
            As alterações entrarão em vigor imediatamente após a publicação.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">8. Contato</h2>
          <p className="mb-4">
            Para questões sobre estes termos, entre em contato através do GitHub.
          </p>
        </section>
      </div>
    </div>
  )
}
