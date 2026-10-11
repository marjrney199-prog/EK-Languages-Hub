# Segurança, privacidade e limites do protótipo

## Estado actual

Este protótipo não implementa contas, palavra-passe, encriptação de base de dados, backend, pagamentos, backups cloud ou recuperação de conta. O progresso e contactos de pagamento de demonstração podem ficar no `localStorage` do browser e não são protegidos contra outro utilizador do mesmo dispositivo. O painel administrativo é apenas um ecrã local — não é controlo de acesso.

**Não guardar PINs, OTPs, documentos de identidade, dados financeiros ou documentos privados. Não usar estes números para receber pagamentos reais através deste protótipo.**

## Requisitos antes de produção

1. HTTPS obrigatório; cookies `Secure`, `HttpOnly`, `SameSite`; gestão de sessão, rotação e logout global.
2. Autenticação com fluxo de recuperação de conta, verificação de endereço e defesa contra credential stuffing. Se usar palavra-passe, armazenar apenas hash robusto (Argon2id/scrypt) com parâmetros validados.
3. RBAC de privilégio mínimo e MFA para administração; gestão de segredos num vault; nenhuma chave de API, PIN ou segredo no cliente.
4. TLS em trânsito, cifragem de dados e object storage em repouso, rotação de chaves, gestão de backups e testes de restauro.
5. Validação por schema, escaping, limites de taxa/tamanho, protecção CSRF/XSS/SSRF, allowlist de ficheiros, verificação de malware e URLs assinados de curta duração.
6. Webhooks de pagamentos com assinatura, idempotência, reconciliação independente e reversão; estado Premium nunca decidido pelo cliente. Nunca recolher PIN/OTP de M-Pesa/e-Mola.
7. Retenção mínima, finalidade clara, exportação e eliminação, consentimento para microfone/câmara/IA/analytics/anúncios e redacção de logs. Definir região de alojamento e acordos com processadores.
8. Threat modelling, SAST/dependency scan, DAST, testes de autorização, pentest e resposta a incidentes antes de produção.

## RGPD e lojas

A interface e estes apontamentos **não certificam conformidade**. É necessária avaliação jurídica/operacional para os países onde haverá utilizadores: controlador/processadores, bases legais, retenção, menores, transferências internacionais, encarregado/contacto de privacidade e exercício dos direitos. Publicar política de privacidade verdadeira e consistente com todos os SDKs, IA, OCR, analytics, AdMob e pagamentos.

Para Google Play, completar a Data safety form de acordo com o comportamento real e manter política de privacidade acessível; se houver criação de contas, planear pedido de eliminação na app e na web. Consultar a política oficial de User Data antes de cada submissão. Para Apple, rever App Review Guidelines, In-App Purchase e consentimentos actuais.

## Chaves e serviços futuros

Criar endpoints server-side, exemplo `POST /v1/translate`, `POST /v1/ai/chat`, `POST /v1/ocr/jobs`, `POST /v1/payments/webhooks/{provider}`. Aplicar quotas, validação, filtros de conteúdo, limites de custo, `requestId` e redacção. Guardar apenas resultado/histórico se o utilizador optar por isso.

## Incidentes e suporte

Antes de lançamento, definir contacto de privacidade e segurança, canal para incidentes, processo de suspensão de chave, revogação de sessão, comunicação aos titulares e reguladores quando aplicável.
