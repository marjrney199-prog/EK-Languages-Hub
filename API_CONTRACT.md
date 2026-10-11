# Contrato inicial de API (proposto, não implementado)

Prefixo `/v1`; JSON UTF-8; autenticação por sessão/token de curta duração; cada escrita recebe `Idempotency-Key`; respostas privadas contêm `requestId`. Nenhum endpoint abaixo está activo no protótipo.

| Método | Rota | Finalidade |
|---|---|---|
| `POST` | `/auth/signup` | Criar conta, verificar consentimento e idioma |
| `POST` | `/auth/login` | Iniciar sessão protegida |
| `POST` | `/auth/password/forgot` | Pedir recuperação; resposta não revela se o e-mail existe |
| `POST` | `/auth/password/reset` | Definir nova credencial com token de uso único |
| `DELETE` | `/me` | Pedir eliminação de conta/dados com confirmação |
| `GET/PATCH` | `/me` | Ler/actualizar perfil e consentimentos |
| `GET` | `/catalog/languages` | Idiomas, variantes e estado editorial |
| `GET` | `/catalog/courses/{language}/{level}` | Unidades publicadas e versões offline |
| `POST` | `/progress/events` | Sincronizar eventos idempotentes de estudo |
| `POST` | `/translate` | Tradução contextual, quota e política de retenção |
| `POST` | `/ai/chat` | Tutor/corrector/gerador com limite de tokens e contexto mínimo |
| `POST` | `/media/ocr-jobs` | Criar job OCR/parsing; retorno de `jobId` |
| `GET` | `/media/ocr-jobs/{jobId}` | Estado/resultado com expiração e controlo de acesso |
| `POST` | `/payments/intents` | Criar intenção/checkout para método permitido no canal/país |
| `POST` | `/payments/webhooks/{provider}` | Validar assinatura e idempotência de eventos do PSP |
| `GET` | `/subscriptions/me` | Estado reconciliado de subscrição e cancelamento |
| `GET/POST` | `/admin/content` | Conteúdo editorial, RBAC e auditoria |
| `GET` | `/admin/reports` | Métricas agregadas com minimização/anonimização |

## Regras para respostas e chamadas

- Erro uniforme: `{ "error": { "code": "...", "message": "...", "requestId": "..." } }`; não expor stack trace nem segredo.
- `429` com `Retry-After` para quotas; `413` para ficheiro excedido; `422` para schema inválido.
- Idempotência obrigatória em escrita de progresso, pagamento e jobs. Verificar autorização em cada recurso (não confiar num ID vindo do cliente).
- Uploads via URL assinada de curta duração; remover EXIF quando possível; limpar ficheiros temporários depois do prazo definido.
- Webhook validado com assinatura HMAC/secret do fornecedor, janela anti-replay, deduplicação e reconciliação diária.
- Tradução/IA não deve registar conteúdo sensível por defeito; permitir apagar histórico e indicar quando conteúdo é enviado a um fornecedor.
