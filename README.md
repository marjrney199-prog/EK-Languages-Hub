# EK Language Hub

**Aprenda. Traduza. Comunique.**

Protótipo funcional, responsivo e instalável (PWA) da plataforma linguística criada por **Edmilson Arlindo**. O curso de inglês inicial incorpora materiais atribuídos à Escola do Conhecimento; confirma os respectivos direitos de distribuição antes de qualquer lançamento comercial. A identidade visual usa azul-escuro, dourado e branco; a aplicação funciona sem dependências externas no cliente.

## Executar o protótipo

Na pasta do projecto, inicia um servidor HTTP local (não abras `index.html` como `file://`, pois o navegador pode bloquear os módulos e os dados):

```bash
python3 -m http.server 8000
```

Abre `http://localhost:8000`. Para instalação PWA fora de `localhost`, publica a pasta completa num domínio HTTPS. No iPhone/iPad, abre o endereço no Safari → **Partilhar** → **Adicionar ao ecrã principal**. Em Chrome/Android, usa **Instalar app** quando aparecer ou o menu do navegador.

## O que já funciona no protótipo

- Interface responsiva para computador, tablet e telemóvel, com modo claro/escuro e navegação acessível por teclado.
- PWA com manifesto, ícones, cache offline do shell, curso de inglês, livro de frases e e-book PDF.
- Trilha completa de inglês importada do material da Escola do Conhecimento: 12 tempos verbais, 236 verbos, 1.000 entradas bilingues, 598 exercícios em 23 conjuntos e 10 diálogos.
- Pacote inicial de frases traduzidas para inglês, português, francês, espanhol, alemão, italiano, árabe, chinês e suaíli. Changana, Ronga, Macua, Sena, Ndau, Tsonga e Zulu estão identificados como expansão editorial futura.
- Tradutor offline de frases seleccionadas e rascunho palavra a palavra EN↔PT, com copiar, partilhar, guardar no histórico e descarregar.
- Ditado por voz e leitura de texto usando as APIs/vozes disponíveis no navegador.
- OCR experimental via `TextDetector` quando o navegador o suporta; importação de ficheiros `.txt` para os fluxos de texto.
- Tutor local de demonstração, corrector de regras básicas e gerador de rascunhos em português/inglês.
- Dicionário offline, marcadores, XP, sequência diária, medalhas e certificado imprimível interno.
- Plano Premium de demonstração a 400 MZN/semana; M-Pesa `866309994` e e-Mola `843933721`, editáveis no painel local.

## Limites importantes — integrações de produção

Esta entrega é um **protótipo front-end**, não um serviço cloud publicado. Não inventa integrações: tradução contextual ilimitada, IA generativa, OCR avançado, parsing de PDF/DOCX, autenticação, recuperação de palavra-passe, sincronização, backups, ranking público, pagamentos M-Pesa/e-Mola, validação antifraude e AdMob **não estão ligados**. Os ecrãs demonstram os fluxos e indicam onde os serviços reais devem ser conectados. Nunca activar Premium apenas por um botão do utilizador.

O painel administrativo desta versão grava preferências de pagamento no `localStorage` do próprio navegador e **não é protegido**. Não usar com pagamentos nem dados reais. O curso completo actual é o de inglês; as outras oito línguas têm livro de frases inicial, não cursos editoriais completos. Sinónimos/antónimos offline existem apenas para um conjunto revisto de palavras. O certificado é de conclusão interna, não oficial/acreditado.

## Estrutura

- `index.html`, `styles.css` — shell, design system e layout responsivo.
- `src/app.js` — navegação e apresentação das ferramentas.
- `src/core.js` — funções locais puras (tradução de demonstração, correcção básica, tutoria e modelos).
- `src/catalog.js` — idiomas, livro de frases, níveis e relações lexicais de demonstração.
- `src/store.js` — estado local, progresso e histórico.
- `data/english-course.json` — conteúdo bilingue do curso de inglês.
- `data/Learning_English_Edmilson_Arlindo.pdf` — e-book incluído para leitura/download.
- `manifest.webmanifest`, `sw.js`, `assets/` — PWA, cache offline, logótipo e ícones.
- `docs/` — arquitectura, segurança, contrato inicial de API e preparação para lojas.
- `tests/` — testes unitários sem dependências de terceiros.

## Testes automatizados

Requer Node.js 20 ou superior; não instala pacotes externos:

```bash
npm test
```

## Próximo passo para uma versão de produção

Escolher fornecedores de IA/tradução/OCR/voz, agregador de pagamentos comerciante M-Pesa/e-Mola, alojamento e base de dados; implementar backend autenticado e auditoria; completar e rever editorialmente cada curso por falantes nativos; depois executar testes de segurança, privacidade, acessibilidade, desempenho, TestFlight e Play Console. Ver `docs/ARCHITECTURE.md`, `docs/SECURITY.md`, `docs/API_CONTRACT.md` e `docs/STORE_RELEASE.md`.

**Criado por Edmilson Arlindo**  
Contactos de demonstração: M-Pesa 866309994 · e-Mola 843933721  
“O relógio tem preço, mas só o tempo tem valor.”
