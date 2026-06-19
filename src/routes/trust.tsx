import { createFileRoute, Link } from "@tanstack/react-router";
import { Shield, Lock, Database, Cookie, FileText, Mail, AlertTriangle, Users } from "lucide-react";

export const Route = createFileRoute("/trust")({
  head: () => ({
    meta: [
      { title: "Trust & Security — Hostlyb" },
      {
        name: "description",
        content:
          "How Hostlyb handles security, privacy and data for short-term rental managers. App-owned, editable content — not an independent certification.",
      },
      { property: "og:title", content: "Trust & Security — Hostlyb" },
      {
        property: "og:description",
        content:
          "Security, privacy and data handling practices for Hostlyb. App-owned, editable content.",
      },
    ],
  }),
  component: TrustPage,
});

function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border bg-card p-6 sm:p-8">
      <div className="mb-4 flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </span>
        <h2 className="text-xl font-semibold tracking-tight text-foreground">{title}</h2>
      </div>
      <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">{children}</div>
    </section>
  );
}

function TrustPage() {
  const updated = new Date().toLocaleDateString("pt-BR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-5 sm:px-6">
          <Link to="/" className="text-base font-bold tracking-tight text-foreground">
            Hostlyb
          </Link>
          <Link
            to="/login"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Entrar
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="mb-10 max-w-3xl">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
            <Shield className="h-3.5 w-3.5" />
            Última atualização: {updated}
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Confiança, segurança e privacidade
          </h1>
          <p className="mt-4 text-base text-muted-foreground">
            Esta página é mantida pela Hostlyb para responder às dúvidas mais comuns sobre como o
            produto trata segurança, privacidade e dados dos seus clientes. É um conteúdo
            editável da própria aplicação — não é uma certificação independente nem foi verificado
            por terceiros.
          </p>
          <p className="mt-3 text-sm text-muted-foreground">
            A Hostlyb é executada sobre serviços de infraestrutura geridos. A responsabilidade é
            partilhada: a plataforma de infraestrutura fornece controlos técnicos, a Hostlyb
            configura e opera a aplicação, e o utilizador final é responsável pelas suas
            credenciais e pelos dados que insere no sistema.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <Section icon={Lock} title="Acesso e autenticação">
            <p>
              O acesso à aplicação requer uma conta de utilizador. Suportamos autenticação por
              e-mail e palavra-passe, link mágico por e-mail e Google sign-in.
            </p>
            <p>
              As palavras-passe são geridas pelo nosso provedor de autenticação e nunca são
              guardadas em texto simples na base de dados da aplicação.
            </p>
            <p>
              As faxineiras recebem um link único por WhatsApp e precisam de criar uma conta
              (nome, e-mail e telefone) antes de aceder ao checklist da limpeza.
            </p>
          </Section>

          <Section icon={Database} title="Dados e isolamento">
            <p>
              Cada conta vê apenas os seus próprios imóveis, hóspedes, limpezas e finanças.
              Aplicamos políticas de segurança ao nível de linha (RLS) na base de dados para
              impedir que um utilizador leia ou altere dados de outra organização.
            </p>
            <p>
              As fotografias de limpeza e os objetos esquecidos são guardados em buckets de
              armazenamento privados; o acesso aos ficheiros exige um utilizador autenticado e a
              correspondência com o trabalho de limpeza.
            </p>
          </Section>

          <Section icon={Shield} title="Plataforma e alojamento">
            <p>
              A aplicação é executada sobre infraestrutura serverless gerida e usa um fornecedor
              de base de dados Postgres gerido para os dados, autenticação e armazenamento de
              ficheiros. O tráfego entre o navegador e os nossos serviços é feito sobre HTTPS.
            </p>
            <p>
              A descrição exata dos certificados, regiões e níveis de redundância da
              infraestrutura subjacente deve ser confirmada com o operador da Hostlyb antes de
              ser utilizada num contexto contratual.
            </p>
          </Section>

          <Section icon={Cookie} title="Cookies e analytics">
            <p>
              Usamos cookies estritamente necessários para manter a sessão iniciada e o estado
              da aplicação. A primeira visita apresenta um aviso de consentimento de cookies.
            </p>
            <p>
              Podemos recolher métricas agregadas de utilização (páginas visitadas, erros) para
              melhorar o produto. Estas métricas não são vendidas a terceiros.
            </p>
          </Section>

          <Section icon={Users} title="Subprocessadores e integrações">
            <p>
              Para fornecer o serviço, partilhamos dados estritamente necessários com os
              fornecedores de: alojamento e base de dados, envio de e-mails transacionais,
              processamento de pagamentos de subscrições e modelos de IA opcionais para
              funcionalidades automatizadas.
            </p>
            <p>
              Para receber a lista completa e atualizada de subprocessadores, contacte-nos pelo
              e-mail abaixo.
            </p>
          </Section>

          <Section icon={FileText} title="Retenção e eliminação">
            <p>
              Mantemos os dados da sua conta enquanto a subscrição estiver ativa. Pode pedir a
              eliminação da sua conta e dos dados associados a qualquer momento por e-mail.
            </p>
            <p>
              Algumas informações podem ser retidas por períodos curtos em backups operacionais
              ou para cumprimento de obrigações legais (por exemplo, faturação).
            </p>
          </Section>

          <Section icon={AlertTriangle} title="Resposta a incidentes">
            <p>
              Se identificarmos um incidente de segurança que afete os seus dados,
              comprometemo-nos a investigar e a contactar as contas afetadas por e-mail com a
              informação relevante e os passos recomendados.
            </p>
            <p>
              Detetou uma vulnerabilidade? Envie-nos um relatório responsável para o e-mail
              abaixo, com passos para reproduzir. Agradecemos a divulgação responsável.
            </p>
          </Section>

          <Section icon={Mail} title="Contacto">
            <p>
              Para pedidos de privacidade, eliminação de dados, lista de subprocessadores ou
              relatórios de segurança, escreva para:
            </p>
            <p className="font-medium text-foreground">support@hostlyb.com</p>
          </Section>
        </div>

        <div className="mt-10 rounded-2xl border border-dashed border-border bg-muted/30 p-6 text-xs leading-relaxed text-muted-foreground">
          Este conteúdo é editável pela Hostlyb e descreve práticas atuais da aplicação. Não
          constitui um certificado de conformidade com SOC 2, ISO 27001, GDPR, HIPAA, PCI DSS ou
          qualquer outra norma. Se necessitar de um DPA assinado, uma carta de conformidade ou
          atestados específicos, contacte-nos.
        </div>
      </main>
    </div>
  );
}
