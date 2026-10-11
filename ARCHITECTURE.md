# Arquitectura proposta — EK Language Hub

## Estado actual

A pasta contém um protótipo PWA sem dependências de runtime: HTML/CSS/ES Modules, Indexed/local storage e cache service worker. A edição offline é intencionalmente local. Não existe API, autenticação, base de dados cloud, modelo de IA, OCR server-side, pagamentos, anúncios nem sincronização. O protótipo não deve receber credenciais, documentos sensíveis ou pagamentos reais.

## Evolução recomendada

```text
PWA / Web ───────────────┐
Android (native wrapper) ├── CDN + WAF ── API Gateway / BFF (TypeScript)
iOS (native client) ─────┘                    │
                                              ├─ Auth / user & consent service
                                              ├─ Course / vocabulary / search service
                                              ├─ Translation / AI / OCR provider adapters
                                              ├─ Speech / pronunciation service
                                              ├─ Billing / payment reconciliation
                                              └─ Admin / reporting / audit service
                                                │
                              PostgreSQL + Redis + object storage + job queue
```

### Clientes

- **PWA/web:** manter cache versionado de shell, catálogo e pacotes de lições. Cachear respostas privadas somente depois de definir encriptação, expiração, logout e eliminação. Usar sincronização idempotente com versões para resolver conflitos offline.
- **Android/iOS:** partilhar componentes e contratos, mas acrescentar funcionalidades nativas reais quando necessário. Não tratar um WebView vazio como equivalente a uma app nativa.
- **i18n:** guardar o idioma por BCP 47 (ex. `pt-MZ`, `en-GB`, `ar-SA`, `zh-Hans`), sentido RTL, pluralização, variantes regionais, qualidade editorial e autoria do conteúdo. Changana, Ronga, Macua, Sena, Ndau, Tsonga, Zulu e outras línguas devem ter revisão de falantes e acordo de grafia antes de lançamento.

### Backend/cloud de referência

- BFF/API modular em TypeScript (por exemplo NestJS), contratos OpenAPI, validação de entrada e versionamento.
- PostgreSQL para identidades, cursos, progresso, assinaturas e pagamentos; Redis para sessões, rate limit e cache efémero; object storage cifrado para anexos/documentos; fila de jobs para OCR, parsing, áudio e exportação.
- CDN para conteúdo público versionado; WAF, rate limiting, logs com redacção de PII, métricas e alertas.
- Adaptadores substituíveis para tradução, LLM, OCR e voz; as chaves só existem no servidor/secret manager. Não enviar documentos a um fornecedor sem consentimento, retenção e região de processamento definidos.
- Backups cifrados com política de retenção, teste periódico de restauro e plano de recuperação.

### Domínio de dados inicial

`User`, `Consent`, `Language`, `Course`, `Level`, `Lesson`, `Exercise`, `VocabularyEntry`, `ProgressEvent`, `TranslationRecord`, `GeneratedDocument`, `Subscription`, `PaymentIntent`, `PaymentEvent`, `AdConsent`, `Certificate`, `AdminRole`, `AuditEvent`. Registar idioma, variante, autoria, licença, revisão e versão em cada recurso editorial.

## Decisões de produto

- Curso de inglês é o único pacote editorial completo incluído nesta entrega. As oito restantes línguas têm frases iniciais de demonstração; não as apresentar como cursos completos.
- Tradutor offline usa correspondências de frases e, EN↔PT, rascunho lexical marcado como literal. Produção requer tradução contextual e revisão de qualidade.
- Tutor offline dá exemplos fixos. Tutor IA real é chamado exclusivamente pelo servidor, com limites, filtros, consentimento e gestão de dados.
- OCR `TextDetector`, Speech Recognition e Speech Synthesis dependem da plataforma e não são universais. Produção precisa de testes por browser/dispositivo e alternativas acessíveis.
- Certificado local é certificado de conclusão da plataforma, não qualificação oficial nem acreditação.

## Escala e objectivos

Definir SLO depois de medir em dispositivos-alvo: arranque p75, navegação p95, taxa de erro, tempo de tradução, falha de jobs, custo por chamada e custo por utilizador activo. Separar conteúdo estático/áudio de serviços transaccionais; limitar uploads/tamanho, colocar jobs pesados em filas, usar quotas por plano e impedir retry storm. A meta de “menos de 2 s” deve ser medida em rede móvel lenta e equipamento de baixa potência, não presumida.
