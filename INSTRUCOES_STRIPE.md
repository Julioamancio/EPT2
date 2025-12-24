# CONFIGURAÇÃO OBRIGATÓRIA NO STRIPE DASHBOARD

Para que o cliente seja redirecionado de volta para o site após o pagamento, você precisa configurar o "Link de Pagamento" dentro do painel do Stripe. O código não consegue forçar isso sozinho por segurança do Stripe.

## Passo a Passo:

1. Acesse seu Dashboard do Stripe: https://dashboard.stripe.com/payment-links
2. Encontre o link que você criou e está usando (`https://buy.stripe.com/3cIdR95LRfmVaHEbpD4Ja01`).
3. Clique em **Editar** (ícone de lápis).
4. Na barra lateral esquerda, clique na seção **"Após o pagamento"** (After payment).
5. Selecione a opção **"Não mostrar página de confirmação"** (Don't show confirmation page).
6. Aparecerá um campo para inserir a URL.
7. Digite o endereço da sua página de sucesso:
   
   **Para Teste Local:**
   `http://localhost:4173/#/sucesso`

   **Para Produção (quando publicar o site):**
   `https://SEU-SITE.com/#/sucesso`

8. Clique em **Salvar Alterações** (Save changes).

---

## Por que isso é necessário?
Como seu aplicativo não tem um servidor backend (Node/PHP/Python) para processar "Webhooks", a única maneira de saber que o cliente pagou é quando o Stripe o envia de volta para a página de `/sucesso`.

Ao fazer essa configuração, assim que o pagamento for aprovado (tela do check verde), o Stripe redirecionará o cliente automaticamente para o seu site, onde o código que já implementamos irá:
1. Detectar o pagamento recente.
2. Gerar o usuário e senha.
3. Exibir as credenciais para o aluno.
