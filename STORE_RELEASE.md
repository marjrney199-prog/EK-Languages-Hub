# Preparação para lojas e distribuição

## Web/PWA

- Publicar todos os ficheiros versionados por HTTPS; confirmar manifest, ícones, `scope`, política de cache e fallback offline em iOS Safari e Chrome Android.
- Não prometer tradução/IA/OCR offline onde só existe um placeholder ou uma API não configurada.
- Testar leitor de ecrã, teclado, contraste, ampliação, orientação, modo escuro, ligação lenta, reinstalação e limpeza de cache.

## Apple App Store / TestFlight

- O PWA actual instala-se pelo Safari/ecrã inicial; não é um pacote iOS para TestFlight.
- Para TestFlight é necessário build iOS assinado e enviado ao App Store Connect, metadados beta, versão, build e testers. Confirmar conta, acordos, privacidade, criptografia, screenshots e política de retenção.
- A Apple espera valor e experiência além de um site reempacotado. Uma shell de WebView sem capacidades úteis adicionais pode falhar a revisão. Desenhar uma experiência iOS real e testar acessibilidade/funcionalidade.
- Subscrição de recursos digitais pode estar sujeita a In-App Purchase, entitlements e regras por storefront. Não assumir que M-Pesa/e-Mola pode desbloquear Premium dentro de qualquer build iOS; rever a regra vigente e obter aconselhamento para o storefront de Moçambique.

## Google Play

- Preparar APK/AAB assinado, target SDK, Play App Signing, Data safety, política de privacidade, classificação etária, listagem, screenshots e testes fechados.
- Benefícios digitais/subscrições em app distribuída pelo Play normalmente seguem Play Billing, excepto quando um programa/região elegível e respectivos requisitos permitem alternativa. Antes de apresentar M-Pesa/e-Mola no app, confirmar elegibilidade para Moçambique, inscrição, APIs de reporting/fees e regras vigentes.
- AdMob só entra na compilação Android adequada; pedir consentimento e configurar frequência, inventário, política infantil/idade e verificação dos anúncios. O slot de demonstração na PWA não é publicidade real.

## Checklist comum antes de release

- Política de privacidade, termos, preço, ciclo semanal, renovação, cancelamento, reembolso e suporte transparentes.
- Verificação de pagamentos independente, demonstração do fluxo de apagar conta, backups e suporte.
- Conteúdo dos nove idiomas revisto por linguistas/falantes; confirmar direitos de distribuição do e-book e de todos os conteúdos/imagens/áudios; certificados descritos sem alegar acreditação inexistente.
- Testes funcionais, unitários, integração, segurança, carga, localização, acessibilidade e recuperação de falha; monitorização e plano de rollback.

## Referências oficiais a revalidar antes de submeter

- [Apple App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/) — regras de desenho, funcionalidade e pagamentos.
- [Apple TestFlight overview](https://developer.apple.com/help/app-store-connect/test-a-beta-version/testflight-overview/) — builds, informação beta e testers.
- [Google Play Payments policy](https://support.google.com/googleplay/android-developer/answer/9858738?hl=en) — cobrança por funcionalidades/conteúdo digital e programas alternativos.
- [Google Play User Data policy](https://support.google.com/googleplay/android-developer/answer/10144311?hl=en) — segurança, privacidade e declarações.
- [Google Play Data safety](https://support.google.com/googleplay/android-developer/answer/10787469?hl=en) — preenchimento conforme a recolha e uso reais.
