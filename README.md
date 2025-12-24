# English Proficiency Certificates (EPT)

Plataforma completa para certificação de proficiência em inglês (níveis CEFR A1 a C2), com correção automática, geração de certificados verificáveis e painel administrativo avançado com Inteligência Artificial e Banco de Dados Real.

## 🚀 Acesso Rápido

### 1. Painel Administrativo (Gestão)
Para criar provas, gerenciar alunos e finanças:


### 2. Candidato (Área do Aluno)
Para realizar exames e obter certificações:
- **URL:** `/login` ou `/comprar`
- **Fluxo de Teste:** Ao "comprar" um exame (modo teste), o sistema gera credenciais automáticas (E-mail/Senha) para acesso imediato.

---

## 🛠️ Funcionalidades Principais

### 🎓 Para o Candidato
*   **Exame Adaptativo:** Interface limpa e focada, com cronômetro de 60 minutos e salvamento automático de progresso.
*   **Correção Instantânea:** Algoritmo de avaliação imediata com cálculo de score baseado no CEFR.
*   **Certificado Digital:** Geração de certificado em alta resolução com **Código Hash Único** para validação antifraude.
*   **Histórico de Provas:** Visualização detalhada de tentativas anteriores e breakdown de notas por competência (Reading, Listening, Use of English).
*   **Validação Pública:** Qualquer recrutador pode validar a autenticidade do certificado em `/verificar` usando o código hash.

### 🏢 Painel Administrativo (Admin)
*   **Gestão de Questões (CRUD):** Crie, edite, duplique e exclua questões manualmente. Tudo salvo instantaneamente no **Supabase**.
*   **Geração via IA (Novo):** Crie provas inteiras automaticamente usando **Gemini** ou **OpenAI**.
    *   *Reading:* Gera textos acadêmicos/profissionais completos com perguntas contextuais.
    *   *Listening:* Cria transcrições de diálogos realistas.
    *   *Use of English:* Foca em gramática avançada e collocations.
*   **Importação Inteligente:** Cole qualquer texto bruto (artigo, notícia) e a IA extrai questões formatadas automaticamente.
*   **Gestão Financeira:** Dashboard com receita total, vendas por período e ticket médio.
*   **Controle de Alunos:** Visualize status de pagamento, notas, reprovações e desbloqueie novas tentativas para candidatos.
*   **Persistência Real:** Banco de dados PostgreSQL (Supabase) para segurança e escalabilidade.

---

## 💻 Tecnologias Utilizadas

*   **Frontend:** React 19 + TypeScript (Vite).
*   **Backend / DB:** Supabase (PostgreSQL + RLS).
*   **Estilização:** Tailwind CSS (Design System "Oxford Executive").
*   **IA & NLP:** Integração com Google Gemini e OpenAI para geração de conteúdo.
*   **Ícones:** Lucide React.
*   **Pagamentos:** Integração simulada com Stripe (Link de Pagamento).

---

## 📝 Guia de Desenvolvimento

### Instalação
1.  Clone o repositório.
2.  Crie um arquivo `.env.local` com suas chaves do Supabase e Gemini.
3.  Instale e rode:
```bash
npm install
npm run dev
```

### Banco de Dados
O projeto utiliza Supabase. As migrações estão na pasta `supabase/migrations`.

---
*Desenvolvido para excelência acadêmica e integridade em certificações.*