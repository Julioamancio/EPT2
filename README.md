# English Proficiency Certificates - Guia de Testes

Esta plataforma permite a certificação de proficiência em inglês (B2 e C1) com correção automática e gestão administrativa.

## 🚀 Credenciais de Acesso

### 1. Painel Administrativo
Para gerenciar questões, níveis e seções do exame:
- **URL:** `/admin/login`
- **Usuário:** `admin`
- **Senha:** `admin123*`

> **Nota de Segurança:** O painel possui um timeout de inatividade de 15 minutos. Após este período, você será deslogado automaticamente.

### 2. Candidato (Fluxo de Teste)
Como o sistema utiliza `localStorage` para persistência, os usuários são criados dinamicamente durante o fluxo de compra.

**Para testar sem precisar "comprar":**
1. Acesse a página **Preços** (`/comprar`).
2. Insira qualquer e-mail (ex: `candidato@teste.com`).
3. Selecione o nível (B2 ou C1).
4. Na tela de sucesso, **copie a senha temporária** gerada pelo sistema.
5. Use essas credenciais na tela de **Login Candidato** (`/login`).

---

## 🛠️ Funcionalidades Implementadas

### Candidato
- **Compra Simulada:** Registro de interesse e geração de credenciais.
- **Exame Dinâmico:** Cronômetro de 60 minutos, navegação entre questões e salvamento de progresso local.
- **Resultado Instantâneo:** Cálculo de nota imediato (aprovação >= 60%).
- **Certificação:** Geração de código hash único e visualização de certificado para aprovados.
- **Validação Pública:** Qualquer pessoa pode validar um certificado usando o código hash em `/verificar`.

### Administrador
- **Dashboard Executivo:** Visão geral da base de questões.
- **CRUD de Questões:** Criar, editar e excluir questões para os níveis B2 e C1.
- **Filtros Avançados:** Busca por texto, nível ou seção (Reading, Grammar, etc).
- **Segurança:** Monitoramento de inatividade e proteção de rotas.

## 💻 Tecnologias
- **Frontend:** React 19 + TypeScript.
- **Estilização:** Tailwind CSS (Estética Oxford Executive).
- **Ícones:** Lucide React.
- **Roteamento:** React Router Dom 7.
- **Persistência:** LocalStorage (Simulando banco de dados para demo).

---
*Desenvolvido para excelência acadêmica e integridade em certificações.*