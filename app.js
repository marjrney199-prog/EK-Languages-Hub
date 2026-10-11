import {LANGUAGES,FUTURE_LANGUAGES,LEVELS,PHRASES,COURSE_CATEGORIES,COMMON_WORD_RELATIONS} from './catalog.js';
import {store} from './store.js';
import {normalizeText,translateOffline,correctBasicEnglish,makeTutorReply,generateDraft,scoreLevelFromXP,getMedals} from './core.js';

const $=(selector,root=document)=>root.querySelector(selector);
const $$=(selector,root=document)=>Array.from(root.querySelectorAll(selector));
const main=$('#mainContent'),modalRoot=$('#modalRoot'),toastNode=$('#toast');
let state=store.state,courseData=null,quiz=null,toastTimer=null,recognition=null,ocrUrl=null;
let ui={route:'dashboard',dictQuery:'',dictPos:'all',dictPage:1,learnLevel:'A1',assistantMode:'tutor',mediaTab:'speak',translatorText:'',translationResult:null,creatorDraft:null,quizResult:null,ocrText:'',ocrMessage:'',selectedTense:null};

const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const btn=(label,action,attrs='',cls='button button-primary')=>`<button class="${cls}" data-action="${action}" ${attrs}>${label}</button>`;
const pageHead=(eyebrow,title,subtitle='',actions='')=>`<div class="page-header"><div><div class="eyebrow">${esc(eyebrow)}</div><h1>${esc(title)}</h1>${subtitle?`<p>${esc(subtitle)}</p>`:''}</div>${actions?`<div class="page-actions">${actions}</div>`:''}</div>`;
const langOf=id=>LANGUAGES.find(x=>x.id===id)||LANGUAGES[0];
const todayKey=()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;};
function currentLang(){return langOf(state.courseLang||'en');}
function sync(){state=store.state;updateTopbar();}
function showToast(message){toastNode.textContent=message;toastNode.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>toastNode.classList.remove('show'),2600);}
function saveSettings(patch){store.update(patch);sync();}
function updateTopbar(){
  if(!state)return;
  $('#xpBadge').textContent=`${state.xp||0} XP`;
  $('#avatarInitials').textContent=(state.name||'EK').trim().split(/\s+/).slice(0,2).map(x=>x[0]).join('').toUpperCase()||'EK';
  const online=navigator.onLine;
  $('#connectionLabel').textContent=online?'Ligação activa · dados locais':'Conteúdo disponível offline';
  $('.secure-dot').classList.toggle('offline',!online);
  $('#sidebarPlanName').textContent=state.plan==='premium'?'Premium':'Gratuito';
  $('#sidebarPlanText').textContent=state.plan==='premium'?'Acesso Premium activo.':'Aprende uma palavra nova hoje.';
  document.body.dataset.theme=state.theme||'light';
  const themeButton=$('#themeToggle');
  themeButton.textContent=state.theme==='dark'?'☼':'☾';
  themeButton.setAttribute('aria-label',state.theme==='dark'?'Activar modo claro':'Activar modo escuro');
}
function setActiveNav(){
  $$('.side-link,.dock-link').forEach(el=>el.classList.toggle('active',el.dataset.route===ui.route));
  $$('.sidebar').forEach(el=>el.classList.toggle('open',false));
  $('#sidebarBackdrop').classList.remove('visible');
  $('#mobileMenu').setAttribute('aria-expanded','false');
}
function navigate(route){
  ui.route=route;setActiveNav();closeModal();render();
  window.scrollTo({top:0,behavior:'smooth'});
  main.focus({preventScroll:true});
}
function formatNumber(n){return new Intl.NumberFormat('pt-MZ').format(n||0);}
function recentDays(){
  const active=new Set(state.activityDays||[]);
  return Array.from({length:7},(_,i)=>{const d=new Date();d.setDate(d.getDate()-(6-i));const k=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;return {d,k,done:active.has(k),today:i===6};});
}
function updateCompletion(key){
  const ok=store.completeLesson(key);sync();
  showToast(ok?'Lição concluída · +20 XP':'Esta lição já está concluída.');
  closeModal();render();
}
function applyTheme(){document.body.dataset.theme=state.theme||'light';}

function renderDashboard(){
  const lang=currentLang(),english=lang.id==='en';
  const total=english?courseData.tenses.length:7;
  const prefix=lang.id+'_';
  const completed=(state.completedLessons||[]).filter(x=>x.startsWith(prefix)).length;
  const pct=total?Math.round(Math.min(completed,total)/total*100):0;
  const level=scoreLevelFromXP(state.xp||0);
  const medals=getMedals({xp:state.xp,lessons:state.completedLessons?.length||0,englishLessons:state.completedLessons.filter(x=>x.startsWith('en_')).length,words:state.learnedWords?.length||0,streak:state.streak});
  const circumference=2*Math.PI*37,offset=circumference-(pct/100)*circumference;
  const days=recentDays();
  main.innerHTML=`<div class="page dashboard-page">
    <section class="welcome-hero">
      <div class="hero-copy"><div class="eyebrow light">EK LANGUAGE HUB <span class="hero-dot">•</span> ${esc(level.name.toUpperCase())}</div><h1>Aprenda. Traduza.<br><em>Comunique.</em></h1><p>O teu espaço para aprender idiomas e comunicar com mais confiança — um passo de cada vez.</p><div class="hero-buttons">${btn('Continuar a aprender <span>→</span>','navigate','data-route="learn"','button button-gold')}${btn('Traduzir agora','navigate','data-route="translator"','button button-light')}</div><div class="hero-meta"><span>✦ Curso actual: ${lang.flag} ${esc(lang.native)}</span><span>◉ Conteúdo de base disponível offline</span></div></div>
      <div class="hero-progress"><div class="hero-ring"><svg viewBox="0 0 88 88" aria-hidden="true"><circle class="ring-track" cx="44" cy="44" r="37"/><circle class="ring-value" cx="44" cy="44" r="37" stroke-dasharray="${circumference}" stroke-dashoffset="${offset}"/></svg><div><strong>${pct}%</strong><small>trilha</small></div></div><div><strong>${completed} / ${total}</strong><small>lições concluídas</small></div><span class="hero-spark">✦</span></div>
    </section>
    <section class="stat-grid">
      <article class="stat-card"><div class="stat-icon gold">✦</div><div><strong>${formatNumber(state.xp)}</strong><small>pontos de aprendizagem</small></div></article>
      <article class="stat-card"><div class="stat-icon fire">♨</div><div><strong>${state.streak||0}</strong><small>dias de sequência</small></div></article>
      <article class="stat-card"><div class="stat-icon blue">Aa</div><div><strong>${formatNumber(state.learnedWords?.length||0)}</strong><small>palavras aprendidas</small></div></article>
      <article class="stat-card"><div class="stat-icon green">✓</div><div><strong>${formatNumber(state.sessions||0)}</strong><small>sessões de estudo</small></div></article>
    </section>
    <div class="dashboard-columns">
      <section class="panel continue-panel"><div class="panel-heading"><div><span class="eyebrow">RETOMA ONDE FICASTE</span><h2>${english?'Inglês do básico ao profissional':`${esc(lang.native)} · primeiros passos`}</h2><p>${english?'12 lições estruturadas, com regras, exemplos e exercícios.':'Pratica frases úteis e pronúncia enquanto o curso completo é desenvolvido.'}</p></div><span class="soft-icon">${lang.flag}</span></div><div class="continue-row"><div class="lesson-index">${String(Math.min(completed+1,total)).padStart(2,'0')}</div><div class="continue-info"><strong>${english?esc(courseData.tenses[Math.min(completed,total-1)]?.name||'Rever a trilha'):'Saudações e apresentação'}</strong><small>${english?'Lição seguinte da trilha':'A1 · unidade inicial'}</small><div class="thin-progress"><i style="width:${pct}%"></i></div></div>${btn('Abrir','navigate','data-route="learn"','button button-outline button-small')}</div></section>
      <section class="panel rhythm-panel"><div class="panel-title"><div><h2>O teu ritmo</h2><p>Consistência cria fluência.</p></div><span class="streak-count">🔥 ${state.streak||0}</span></div><div class="week-strip">${days.map(x=>`<div class="week-day ${x.done?'done':''} ${x.today?'today':''}"><i>${x.done?'✓':['D','S','T','Q','Q','S','S'][x.d.getDay()]}</i><small>${['DOM','SEG','TER','QUA','QUI','SEX','SÁB'][x.d.getDay()]}</small></div>`).join('')}</div><div class="tip-line"><strong>Dica:</strong> pratica 10 minutos e termina com uma frase tua.</div></section>
    </div>
    <div class="section-heading"><div><span class="eyebrow">FERRAMENTAS DO HUB</span><h2>Comunica com confiança</h2></div><button class="link-button" data-route="learn">Ver cursos <span>→</span></button></div>
    <div class="tool-grid">
      <button class="tool-card" data-route="learn"><span class="tool-icon lilac">▤</span><strong>Aprender idiomas</strong><small>Trilhas, lições, exercícios e revisão.</small><span class="card-arrow">↗</span></button>
      <button class="tool-card" data-route="translator"><span class="tool-icon blue">⇄</span><strong>Tradutor inteligente</strong><small>Frases, palavras, voz e histórico.</small><span class="card-arrow">↗</span></button>
      <button class="tool-card" data-route="assistant"><span class="tool-icon gold">✧</span><strong>Tutor e corrector</strong><small>Aprende com explicações e exemplos.</small><span class="card-arrow">↗</span></button>
      <button class="tool-card" data-route="media"><span class="tool-icon green">◉</span><strong>Voz e imagens</strong><small>Ouvir, falar e experimentar leitura OCR.</small><span class="card-arrow">↗</span></button>
    </div>
    <div class="lower-grid">
      <section class="panel medals-panel"><div class="panel-title"><div><span class="eyebrow">CONQUISTAS</span><h2>Medalhas de aprendizagem</h2></div><button class="link-button" data-route="profile">Todas <span>→</span></button></div><div class="medal-row">${medals.slice(0,4).map(m=>`<div class="medal ${m.earned?'earned':'locked'}" title="${esc(m.detail)}"><i>${m.icon}</i><span>${esc(m.title)}</span></div>`).join('')}</div></section>
      <section class="panel tip-panel"><div class="tip-illustration">✦</div><div><span class="eyebrow">FILOSOFIA EK</span><p>“O relógio tem preço, mas só o tempo tem valor.”</p><small>Edmilson Arlindo · Escola do Conhecimento</small></div></section>
    </div>
    ${state.plan!=='premium'?`<section class="ad-preview"><span class="ad-label">ESPAÇO PUBLICITÁRIO</span><div><strong>Conteúdo patrocinado, com respeito ao teu estudo.</strong><small>Bloco de demonstração — o AdMob só deve ser ligado no aplicativo Android publicado e com consentimento adequado.</small></div><span class="ad-badge">ANÚNCIO</span></section>`:''}
    <div class="page-footer">EK Language Hub · Criado por Edmilson Arlindo · ${esc(lang.native)} ${state.plan==='premium'?'· Premium':'· Gratuito'}</div>
  </div>`;
}

function languageCards(){
  return `<div class="language-grid">${LANGUAGES.map(l=>`<button class="language-card ${state.courseLang===l.id?'selected':''}" data-action="choose-course" data-lang="${l.id}"><span class="language-flag">${l.flag}</span><span><strong>${esc(l.native)}</strong><small>${l.availability==='full'?'Curso completo disponível':'Pacote inicial de frases'}</small></span><span class="language-arrow">${state.courseLang===l.id?'✓':'→'}</span></button>`).join('')}</div>`;
}
function renderLearn(){
  const lang=currentLang(),english=lang.id==='en';
  const categories=COURSE_CATEGORIES.map(c=>{const count=PHRASES.filter(p=>p.category===c.id).length;return {...c,count};}).filter(x=>x.count);
  const completed=state.completedLessons||[];
  main.innerHTML=`<div class="page learn-page">${pageHead('APRENDIZAGEM PERSONALIZADA','Aprender idiomas','Escolhe o idioma e avança com uma trilha ajustada ao teu nível.',btn('Praticar agora','start-course-quiz','','button button-gold'))}
    <section class="panel language-panel"><div class="panel-title"><div><span class="eyebrow">ESCOLHE A TUA TRILHA</span><h2>Idiomas disponíveis</h2><p>O inglês tem o curso-base completo. Os outros idiomas incluem um pacote inicial de frases, pronto para crescer por níveis.</p></div><span class="soft-icon">🌍</span></div>${languageCards()}<div class="future-languages"><span class="eyebrow">PRÓXIMAS LÍNGUAS · ARQUITECTURA PREPARADA</span><div>${FUTURE_LANGUAGES.map(x=>`<span class="future-chip">${esc(x)} · em preparação</span>`).join('')}</div></div></section>
    <div class="course-heading"><div><span class="eyebrow">${lang.flag} ${esc(lang.native.toUpperCase())} · TRILHA ${state.courseLevel}</span><h2>${english?'English for real life':'Primeiros passos em '+esc(lang.native)}</h2><p>${english?'Curso-base com gramática, vocabulário, pronúncia, conversação e 598 questões.':'Frases úteis com áudio do dispositivo. Os níveis superiores ficam por produzir com revisão linguística nativa.'}</p></div><select id="courseLevel" class="select-control" aria-label="Nível do curso">${LEVELS.map(level=>`<option value="${level.id}" ${state.courseLevel===level.id?'selected':''} ${!english&&level.id!=='A1'?'disabled':''}>${level.id} · ${esc(level.name)}${!english&&level.id!=='A1'?' · em preparação':''}</option>`).join('')}</select></div>
    ${english?`<div class="course-stats"><span><b>${courseData.tenses.length}</b> lições de gramática</span><span><b>${courseData.vocabulary.length.toLocaleString('pt-MZ')}</b> entradas bilingues</span><span><b>${courseData.quizzes.reduce((a,q)=>a+q.items.length,0)}</b> exercícios com gabarito</span><a href="./data/Learning_English_Edmilson_Arlindo.pdf" download>↓ E-book PDF</a></div><div class="lesson-grid">${courseData.tenses.map((t,i)=>{const id=`en_${t.key}`,done=completed.includes(id);return `<button class="lesson-tile" data-action="open-tense" data-key="${esc(t.key)}"><div class="lesson-tile-top"><span class="lesson-index">${String(i+1).padStart(2,'0')}</span><span class="lesson-status ${done?'complete':''}">${done?'✓ concluída':`LIÇÃO ${String(i+1).padStart(2,'0')}`}</span></div><h3>${esc(t.name)}</h3><p>${esc(t.explain.slice(0,123))}${t.explain.length>123?'…':''}</p><span class="tile-foot">Explicação · exemplos · exercício <b>→</b></span></button>`;}).join('')}</div><section class="panel quiz-library"><div class="panel-title"><div><span class="eyebrow">598 QUESTÕES · 23 CONJUNTOS</span><h2>Testes e exercícios</h2><p>Faz uma sessão curta ou percorre o banco completo por tema.</p></div><span class="soft-icon">✓</span></div><div class="quiz-bank-grid">${courseData.quizzes.map(q=>`<article class="quiz-bank-card"><div><h3>${esc(q.title)}</h3><small>${esc(q.category)} · ${q.items.length} perguntas</small></div><div class="bank-actions">${btn('10 perguntas','start-bank',`data-id="${esc(q.id)}" data-size="10"`,'button button-gold button-small')}${btn('Conjunto completo','start-bank',`data-id="${esc(q.id)}" data-size="all"`,'button button-outline button-small')}</div></article>`).join('')}</div></section>`:`<section class="starter-pack"><div class="starter-copy"><span class="eyebrow">PACOTE INICIAL · ${lang.flag} ${esc(lang.native)}</span><h3>Frases para comunicar desde o primeiro dia</h3><p>Pratica situações reais. Toca no áudio para ouvir a voz disponível no teu dispositivo e marca as unidades que concluíres.</p><div class="notice-inline">Conteúdo inicial de demonstração. Para publicar cursos completos por idioma, é necessária expansão editorial e revisão por falantes nativos.</div></div><div class="phrase-category-grid">${categories.map(c=>`<button class="phrase-category" data-action="open-category" data-category="${c.id}"><span>${c.icon}</span><strong>${esc(c.title)}</strong><small>${c.count} frases bilingues · áudio</small><b>${completed.includes(`${lang.id}_cat_${c.id}`)?'✓ Concluída':'Abrir unidade →'}</b></button>`).join('')}</div></section>`}
    <section class="study-method"><div class="method-icon">✦</div><div><strong>Estuda em ciclos curtos</strong><p>Revê hoje, amanhã e ao fim de 3, 7 e 14 dias. Tenta recordar a resposta antes de a consultar.</p></div>${btn('Abrir exercícios','navigate','data-route="assistant"','button button-outline button-small')}</section>
  </div>`;
}

function openTense(key){
  const t=courseData.tenses.find(x=>x.key===key);if(!t)return;
  ui.selectedTense=key;
  const done=state.completedLessons.includes(`en_${key}`);
  modalRoot.innerHTML=`<section class="modal lesson-modal" role="dialog" aria-modal="true" aria-labelledby="modalTitle"><div class="modal-top"><span class="eyebrow">GRAMÁTICA · CURSO DE INGLÊS</span><button class="close-modal" data-action="close-modal" aria-label="Fechar">×</button></div><h2 id="modalTitle">${esc(t.name)}</h2><p class="modal-intro">${esc(t.explain)}</p><div class="formula-panel"><small>FÓRMULA</small><strong>${esc(t.formula)}</strong></div><h3>Quando usar</h3><ul class="use-list">${t.uses.map(u=>`<li>${esc(u)}</li>`).join('')}</ul><div class="marker-callout"><strong>Marcadores comuns:</strong> ${esc(t.markers)}</div><h3>Exemplos</h3><div class="lesson-examples">${t.examples.map(ex=>`<div class="lesson-example"><div><strong>${esc(ex[0])}</strong><small>${esc(ex[1])}</small><span>${esc(ex[2])}</span></div><button class="icon-control" data-action="speak" data-text="${esc(ex[0])}" data-lang="en" aria-label="Ouvir exemplo">▶</button></div>`).join('')}</div><div class="callout-error"><b>Erro comum:</b> ${esc(t.error)}</div><div class="modal-actions">${btn(done?'Concluída ✓':'Marcar concluída · +20 XP','complete-lesson',`data-n_${esc(t.key)}"`,'button button-gold')}${btn('Testar este tempo','start-tense-quiz',`data-key="${esc(t.key)}"`,'button button-outline')}</div></section>`;
  modalRoot.classList.add('open');modalRoot.setAttribute('aria-hidden','false');
}
function openPhraseCategory(id){
  const category=COURSE_CATEGORIES.find(c=>c.id===id);if(!category)return;
  const phrases=PHRASES.filter(p=>p.category===id),lang=currentLang();
  const done=state.completedLessons.includes(`${lang.id}_cat_${id}`);
  modalRoot.innerHTML=`<section class="modal" role="dialog" aria-modal="true" aria-labelledby="modalTitle"><div class="modal-top"><span class="eyebrow">${lang.flag} ${esc(lang.native)} · A1</span><button class="close-modal" data-action="close-modal" aria-label="Fechar">×</button></div><h2 id="modalTitle">${esc(category.title)}</h2><p class="modal-intro">Lê, ouve e repete. Depois tenta reconstruir a frase sem olhar para a tradução.</p><div class="phrase-rows">${phrases.map(p=>`<div class="phrase-row"><div><strong lang="${esc(lang.voice)}" dir="auto">${esc(p[lang.id]||p.en)}</strong><small dir="auto">${esc(p[lang.id==='en'?'pt':'en'])}</small><em>${esc(p.pron?.[lang.id]||'')}</em></div><button class="icon-control" data-action="speak" data-text="${esc(p[lang.id]||p.en)}" data-lang="${lang.id}" aria-label="Ouvir frase">▶</button></div>`).join('')}</div><div class="modal-actions">${btn(done?'Unidade concluída ✓':'Concluir unidade · +20 XP','complete-lesson',`data-id="${lang.id}_cat_${id}"`,'button button-gold')}${btn('Praticar frases','start-course-quiz','','button button-outline')}</div></section>`;
  modalRoot.classList.add('open');modalRoot.setAttribute('aria-hidden','false');
}
function closeModal(){modalRoot.classList.remove('open');modalRoot.setAttribute('aria-hidden','true');modalRoot.innerHTML='';}

function renderQuiz(){
  if(!quiz||!quiz.items?.length){navigate('learn');return;}
  if(quiz.index>=quiz.items.length){finishQuiz();return;}
  const item=quiz.items[quiz.index],pct=Math.round(quiz.index/quiz.items.length*100);
  main.innerHTML=`<div class="page quiz-page"><button class="back-link" data-action="quiz-exit">← Voltar à aprendizagem</button><div class="quiz-progress-header"><div class="thin-progress"><i style="width:${pct}%"></i></div><span>${quiz.index+1} / ${quiz.items.length}</span></div><div class="quiz-label">${esc(quiz.title||'Prática guiada')}</div><section class="panel quiz-card"><span class="eyebrow">PERGUNTA ${String(quiz.index+1).padStart(2,'0')}</span><h1>${esc(item.question)}</h1>${item.prompt?`<p>${esc(item.prompt)}</p>`:''}<label class="input-label" for="quizAnswer">A tua resposta</label><input id="quizAnswer" class="text-input answer-input" value="${esc(quiz.typed||'')}" placeholder="Escreve aqui…" ${quiz.answered?'disabled':''} autocomplete="off">${quiz.answered?`<div class="quiz-feedback ${quiz.correct?'correct':'incorrect'}"><strong>${quiz.correct?'Correcto — muito bem!':'Resposta de referência: '+esc(item.answer)}</strong><p>${esc(item.explanation||'Revê o exemplo e tenta novamente mais tarde.')}</p></div>`:''}<div class="quiz-actions"><button class="button button-outline button-small" data-action="quiz-skip">Saltar</button>${quiz.answered?btn(quiz.index+1===quiz.items.length?'Ver resultado':'Seguinte →','quiz-next','','button button-gold'):btn('Verificar resposta','quiz-check','','button button-gold')}</div></section><p class="quiz-hint">Dica: pensa na regra e não tenhas receio de errar. O feedback faz parte da aprendizagem.</p></div>`;
  if(!quiz.answered){const input=$('#quizAnswer');input?.focus();input?.addEventListener('keydown',e=>{if(e.key==='Enter')checkQuiz();});}
}
function startQuiz(bankId='starter',size=10){
  const lang=currentLang();let bank=courseData.quizzes.find(q=>q.id===bankId);let items,title;
  if(bank){items=[...bank.items].sort(()=>Math.random()-.5).slice(0,Math.min(size==='all'?bank.items.length:Number(size)||10,bank.items.length));title=bank.title;}
  else if(bankId.startsWith('tense_')){bank=courseData.quizzes.find(q=>q.id===bankId);items=bank?[...bank.items].sort(()=>Math.random()-.5).slice(0,10):[];title=bank?.title||'Prática de gramática';}
  else{
    const phrases=PHRASES.filter(p=>p[lang.id]&&p.pt).slice(0,12);
    items=phrases.map(p=>({question:lang.id==='en'?`Como se diz “${p.pt}” em inglês?`:lang.id==='pt'?`Como traduzes “${p.en}” para português?`:`Como se diz “${p.pt}” em ${lang.native}?`,answer:p[lang.id],explanation:`Frase de referência: ${p.en} · ${p.pt} · ${p[lang.id]}`})).slice(0,size);
    title=`Prática A1 · ${lang.native}`;
  }
  if(!items?.length){showToast('Este exercício ainda não está disponível offline.');return;}
  quiz={id:bankId,title,items,index:0,score:0,answered:false,correct:false,typed:'',saved:false};
  ui.route='quiz';setActiveNav();renderQuiz();window.scrollTo({top:0,behavior:'smooth'});
}
function checkQuiz(){
  if(!quiz||quiz.answered)return;
  const input=$('#quizAnswer'),typed=input?.value?.trim()||'';
  if(!typed){showToast('Escreve uma resposta para continuar.');input?.focus();return;}
  const item=quiz.items[quiz.index];quiz.typed=typed;
  quiz.correct=normalizeText(typed)===normalizeText(item.answer)||String(item.answer||'').split(/\s*\/\s*/).some(x=>normalizeText(typed)===normalizeText(x));
  quiz.answered=true;if(quiz.correct)quiz.score++;
  renderQuiz();
}
function advanceQuiz(skip=false){
  if(!quiz)return;
  if(skip&&!quiz.answered){quiz.answered=true;quiz.correct=false;quiz.typed='';renderQuiz();return;}
  if(quiz.index<quiz.items.length-1){quiz.index++;quiz.answered=false;quiz.correct=false;quiz.typed='';renderQuiz();}
  else finishQuiz();
}
function finishQuiz(){
  if(!quiz.saved){
    const scores={...(state.quizScores||{})};const old=scores[quiz.id]||{attempts:0,best:0};const ratio=quiz.score/quiz.items.length;
    scores[quiz.id]={attempts:old.attempts+1,best:Math.max(old.best,ratio),last:ratio};store.update({quizScores:scores});store.addActivity(8+quiz.score*2);sync();quiz.saved=true;
  }
  const ratio=quiz.score/quiz.items.length;
  ui.quizResult={title:quiz.title,score:quiz.score,total:quiz.items.length,ratio};quiz=null;ui.route='quiz-result';setActiveNav();render();
}
function renderQuizResult(){
  const r=ui.quizResult||{score:0,total:0,ratio:0,title:'Prática'};
  main.innerHTML=`<div class="page quiz-result-page"><section class="panel result-panel"><div class="result-medal">${r.ratio>=.8?'✦':'◎'}</div><span class="eyebrow">SESSÃO CONCLUÍDA</span><h1>${r.ratio>=.8?'Excelente progresso!':r.ratio>=.5?'Bom trabalho — continua.':'A prática de hoje já conta.'}</h1><div class="result-score">${r.score}<small> / ${r.total}</small></div><p>${Math.round(r.ratio*100)}% de respostas correctas · ${esc(r.title)}</p><div class="modal-actions">${btn('Voltar à aprendizagem','navigate','data-route="learn"','button button-gold')}${btn('Tentar outro conjunto','navigate','data-route="assistant"','button button-outline')}</div></section></div>`;
}

function renderTranslator(){
  const from=state.nativeLang||'pt',to=state.courseLang||'en';
  const result=ui.translationResult;
  main.innerHTML=`<div class="page">${pageHead('TRADUÇÃO E COMUNICAÇÃO','Tradutor inteligente','Traduz frases do livro de frases offline e consulta o dicionário bilingue. A tradução contextual online requer um fornecedor ligado ao servidor.',btn('Voz e imagem','navigate','data-route="media"','button button-outline'))}
    <section class="translator-shell panel"><div class="language-switch-row"><label class="sr-only" for="sourceLang">Idioma de origem</label><select id="sourceLang" class="language-select">${LANGUAGES.map(l=>`<option value="${l.id}" ${from===l.id?'selected':''}>${l.flag} ${esc(l.native)}</option>`).join('')}</select><button class="swap-button" data-action="swap-languages" aria-label="Trocar idiomas">⇄</button><label class="sr-only" for="targetLang">Idioma de destino</label><select id="targetLang" class="language-select">${LANGUAGES.map(l=>`<option value="${l.id}" ${to===l.id?'selected':''}>${l.flag} ${esc(l.native)}</option>`).join('')}</select></div>
    <div class="translation-columns"><div class="translation-box"><div class="box-label"><span>Texto original</span><button class="text-button" data-action="listen-translator" title="Ditado por voz">🎙 Ditar</button></div><textarea id="translationInput" dir="auto" lang="${esc(langOf(from).voice)}" maxlength="5000" placeholder="Escreve ou cola o texto que queres traduzir…">${esc(ui.translatorText)}</textarea><div class="box-bottom"><small>${ui.translatorText.length} / 5.000</small><div><button class="text-button" data-action="clear-translation">Limpar</button><label class="file-button">Anexar .txt<input id="textFile" type="file" accept=".txt,.md,text/plain" hidden></label></div></div></div><div class="translation-box output-box"><div class="box-label"><span>Tradução</span>${result?.pronunciation?`<button class="text-button" data-action="speak" data-lang="${to}" data-text="${esc(result.pronunciation)}">🔊 Pronúncia</button>`:''}</div><div class="translation-output ${result?.text?'':'placeholder'}" dir="auto" lang="${esc(langOf(to).voice)}">${result?.text?esc(result.text):'A tradução aparece aqui.'}</div><div class="box-bottom"><small>${result?.mode==='phrasebook'?'Livro de frases':result?.mode==='dictionary-draft'?'Rascunho literal':'Tradução contextual'}</small><div><button class="text-button" data-action="speak" data-lang="${to}" data-text="${esc(result?.text||'')}">🔊 Ouvir</button></div></div></div></div>
    <div class="translate-controls">${btn('Traduzir <span>→</span>','translate','','button button-gold translate-primary')}${result?.text?`<div class="result-tools">${btn('Copiar','copy-translation','','button button-outline button-small')}${btn('Guardar','save-translation','','button button-outline button-small')}${btn('Partilhar','share-translation','','button button-outline button-small')}${btn('Descarregar .txt','download-translation','','button button-outline button-small')}</div>`:''}</div>
    ${result?.notice?`<div class="translation-notice ${result.mode==='unavailable'?'warning':''}"><span>${result.mode==='phrasebook'?'✓':'ℹ'}</span><div>${esc(result.notice)}${result.coverage>0&&result.mode==='dictionary-draft'?` <b>Cobertura lexical: ${Math.round(result.coverage*100)}%.</b>`:''}</div></div>`:''}
    <div class="translation-features"><div><span>◎</span><b>Contexto</b><small>Frases comuns com tradução revista.</small></div><div><span>◈</span><b>Histórico</b><small>Guarda e consulta as traduções.</small></div><div><span>⌁</span><b>Áudio</b><small>Usa a voz disponível no dispositivo.</small></div></div>
    </section><div class="service-disclaimer">Este protótipo não envia o teu texto para terceiros. Traduções gerais, documentos PDF/DOCX e serviços de IA precisam de um backend com fornecedor configurado.</div>
  </div>`;
}
function runTranslation(){
  ui.translatorText=$('#translationInput')?.value||ui.translatorText;
  const from=$('#sourceLang')?.value||state.nativeLang||'pt',to=$('#targetLang')?.value||state.courseLang||'en';
  ui.translationResult=translateOffline(ui.translatorText,from,to,courseData.vocabulary);
  saveSettings({nativeLang:from,courseLang:to});
  renderTranslator();
}

function renderAssistant(){
  const mode=ui.assistantMode;
  const tabs=[['tutor','Tutor IA','✧'],['corrector','Corrector','✓'],['practice','Exercícios','▤']];
  let content='';
  if(mode==='tutor'){
    const messages=state.chat||[];
    content=`<div class="chat-notice"><span>✧</span><div><b>Tutor de demonstração</b><small>Explicações e respostas de exemplo funcionam localmente. Não há um modelo de IA externo ligado nesta versão.</small></div><span class="offline-tag">OFFLINE</span></div><div class="chat-window" id="chatWindow">${messages.length?messages.map(m=>`<div class="chat-message ${m.role==='user'?'user-message':'assistant-message'}"><span class="chat-avatar">${m.role==='user'?'EA':'✧'}</span><div><small>${m.role==='user'?'Tu':'Tutor EK'}</small><p>${esc(m.text).replace(/\n/g,'<br>')}</p></div></div>`).join(''):`<div class="chat-empty"><span>✧</span><h3>Olá, ${esc(state.name||'estudante')}.</h3><p>Pergunta sobre gramática, pede um exemplo ou inicia uma conversa de prática.</p></div>`}</div><div class="suggestion-chips"><button data-action="suggest-tutor" data-text="Explica o Present Simple com exemplos">Present Simple</button><button data-action="suggest-tutor" data-text="Simula uma entrevista de emprego comigo">Simular entrevista</button><button data-action="suggest-tutor" data-text="Cria um exercício curto de inglês">Criar exercício</button></div><div class="chat-input-row"><textarea id="assistantInput" rows="2" maxlength="1000" placeholder="Escreve a tua pergunta…"></textarea><button class="send-button" data-action="send-tutor" aria-label="Enviar pergunta">↑</button></div><div class="chat-footnote">Revê as respostas importantes. O tutor local não substitui revisão profissional.</div>`;
  }else if(mode==='corrector'){
    content=`<section class="panel tool-panel"><div class="panel-title"><div><span class="eyebrow">REVISÃO DE TEXTO</span><h2>Corrector de inglês</h2><p>Detecta alguns padrões frequentes e explica as alterações. A revisão avançada de estilo requer IA no servidor.</p></div><span class="large-tool-icon blue">✓</span></div><label class="input-label" for="correctInput">O teu texto</label><textarea id="correctInput" class="large-textarea" placeholder="Escreve um texto em inglês para rever…">${esc(ui.correctText||'')}</textarea><div class="form-actions">${btn('Rever texto','correct-text','','button button-gold')}${btn('Limpar','clear-corrector','','button button-outline')}</div>${ui.correctResult?renderCorrection(ui.correctResult):''}</section>`;
  }else{
    content=`<section class="panel tool-panel"><div class="panel-title"><div><span class="eyebrow">PRÁTICA ADAPTÁVEL</span><h2>Exercícios personalizados</h2><p>Escolhe um foco e começa uma prática curta. O progresso é guardado neste dispositivo.</p></div><span class="large-tool-icon gold">▤</span></div><div class="focus-grid"><button data-action="start-course-quiz"><span>◉</span><b>Vocabulário</b><small>Frases úteis e recuperação activa</small></button><button data-action="start-grammar-quiz"><span>△</span><b>Gramática</b><small>Estruturas e tempos verbais</small></button><button data-action="start-conversation"><span>↗</span><b>Conversação</b><small>Responde a um tutor de prática</small></button></div><div class="practice-stats"><div><strong>${state.sessions||0}</strong><small>sessões</small></div><div><strong>${Object.values(state.quizScores||{}).reduce((a,x)=>a+(x.attempts||0),0)}</strong><small>testes concluídos</small></div><div><strong>${state.streak||0}</strong><small>dias de sequência</small></div></div><div class="service-disclaimer">O nível é configurável em Aprender. A personalização completa exige perfil de aprendizagem e serviço seguro no servidor.</div></section>`;
  }
  main.innerHTML=`<div class="page">${pageHead('AJUDA INTELIGENTE','Tutor, corrector e prática','Estuda com exemplos, melhora a escrita e treina uma conversa.') }<div class="assistant-tabs">${tabs.map(([id,name,icon])=>`<button class="assistant-tab ${mode===id?'active':''}" data-action="assistant-tab" data-mode="${id}"><span>${icon}</span>${name}</button>`).join('')}</div><div class="assistant-content">${content}</div></div>`;
  if(mode==='tutor'){const win=$('#chatWindow');if(win)win.scrollTop=win.scrollHeight;}
}
function renderCorrection(result){
  return `<div class="correction-result"><div class="result-heading"><span class="eyebrow">RESULTADO</span><span class="tag ${result.changes.length?'gold':'green'}">${result.changes.length?`${result.changes.length} sugestão(ões)`:'Sem alterações detectadas'}</span></div><div class="corrected-text"><small>TEXTO REVISTO</small><p>${esc(result.corrected)}</p></div>${result.changes.length?`<div class="correction-list">${result.changes.map(c=>`<div class="correction-item"><b>${esc(c.explanation)}</b><small>${esc(c.before)} → ${esc(c.after)}</small></div>`).join('')}</div>`:`<p class="muted-note">A revisão local verifica apenas regras simples; pode não detectar todos os erros.</p>`}<button class="text-button" data-action="copy-correction">Copiar versão revista</button></div>`;
}
function sendTutor(text){
  const prompt=String(text||'').trim();if(!prompt){showToast('Escreve uma pergunta unta primeiro.');return;}
  store.addChatMessage({role:'user',text:prompt,at:Date.now()});
  store.addChatMessage({role:'assistant',text:makeTutorReply(prompt,state.courseLevel||'A1'),at:Date.now()});
  store.addActivity(3);sync();renderAssistant();
}

function renderDictionary(){
  const query=ui.dictQuery.trim().toLowerCase(),items=courseData.vocabulary;
  const filtered=items.filter(w=>`${w.word} ${w.translation} ${w.pos} ${w.exampleEn} ${w.examplePt}`.toLowerCase().includes(query)&&(ui.dictPos==='all'||w.pos===ui.dictPos));
  const total=Math.max(1,Math.ceil(filtered.length/24));ui.dictPage=Math.min(ui.dictPage,total);
  const shown=filtered.slice((ui.dictPage-1)*24,ui.dictPage*24);
  const posList=[...new Set(items.map(w=>w.pos))].sort();
  main.innerHTML=`<div class="page">${pageHead('DICIONÁRIO PREMIUM','Palavras com contexto','Pesquisa bilingue com pronúncia aproximada, classe gramatical, exemplos e áudio do dispositivo.')}
    <div class="dictionary-toolbar"><label class="search-field"><span>⌕</span><input id="dictSearch" type="search" value="${esc(ui.dictQuery)}" placeholder="Procura em inglês, português ou exemplo…" autocomplete="off"></label><select id="dictPos" class="select-control"><option value="all">Todas as classes</option>${posList.map(p=>`<option value="${esc(p)}" ${ui.dictPos===p?'selected':''}>${esc(p)}</option>`).join('')}</select><span class="result-count">${filtered.length.toLocaleString('pt-MZ')} entradas offline</span></div>
    <div class="dictionary-grid">${shown.map(w=>{const relation=COMMON_WORD_RELATIONS[w.word.toLowerCase()];return `<article class="dictionary-card"><div class="dict-card-top"><div><h3>${esc(w.word)}</h3><small>${esc(w.pos)} · /${esc(w.pronunciation)}/</small></div><div class="dict-buttons"><button class="icon-control ${state.bookmarks.includes(w.id)?'bookmarked':''}" data-action="bookmark-word" data-id="${w.id}" aria-label="Guardar palavra">${state.bookmarks.includes(w.id)?'★':'☆'}</button><button class="icon-control" data-action="speak" data-text="${esc(w.word)}" data-lang="en" aria-label="Ouvir palavra">▶</button></div></div><div class="dict-meaning">${esc(w.translation)}</div><div class="dict-example"><strong>${esc(w.exampleEn)}</strong><small>${esc(w.examplePt)}</small></div><div class="dict-relations"><div><b>Sinónimos</b><span>${relation?relation.synonyms.map(esc).join(' · '):'—'}</span></div><div><b>Antónimos</b><span>${relation?relation.antonyms.map(esc).join(' · '):'—'}</span></div></div><button class="word-learn ${state.learnedWords.includes(w.id)?'learned':''}" data-action="learn-word" data-id="${w.id}">${state.learnedWords.includes(w.id)?'✓ Aprendida':'Marcar como aprendida · +2 XP'}</button></article>`;}).join('')||`<div class="empty-state"><b>Não encontrámos essa entrada.</b><span>Tenta outra palavra ou significado.</span></div>`}</div>
    ${total>1?`<div class="pagination"><button data-action="dict-page" data-page="${ui.dictPage-1}" ${ui.dictPage===1?'disabled':''}>← Anterior</button><span>Página ${ui.dictPage} de ${total}</span><button data-action="dict-page" data-page="${ui.dictPage+1}" ${ui.dictPage===total?'disabled':''}>Seguinte →</button></div>`:''}
    <div class="service-disclaimer">Dicionário offline importado do curso English–Português. Sinónimos/antónimos são mostrados onde há dados locais revistos; expansão multilingue requer conteúdo editorial/API.</div></div>`;
}

function renderMedia(){
  const tabs=[['speak','Texto → voz','🔊'],['listen','Voz → texto','🎙'],['ocr','Imagem / documento','▧']];let content='';
  if(ui.mediaTab==='speak')content=`<section class="panel media-panel"><div class="panel-title"><div><span class="eyebrow">PRONÚNCIA ASSISTIDA</span><h2>Ouve a tua frase</h2><p>A voz é sintetizada pelo dispositivo. A pronúncia e as vozes variam consoante o sistema operativo e o idioma instalado.</p></div><span class="large-tool-icon blue">🔊</span></div><label class="input-label" for="ttsText">Texto para ler</label><textarea id="ttsText" class="large-textarea" placeholder="Escreve ou cola uma frase…">${esc(ui.ttsText||'')}</textarea><div class="voice-settings"><label>Idioma<select id="ttsLang" class="select-control">${LANGUAGES.map(l=>`<option value="${l.id}" ${l.id===(ui.ttsLang||state.courseLang)?'selected':''}>${l.flag} ${esc(l.native)}</option>`).join('')}</select></label><label>Voz disponível<select id="voiceStyle" class="select-control"><option value="system">Automática</option><option value="female">Feminina (se disponível)</option><option value="male">Masculina (se disponível)</option></select></label></div><div class="form-actions">${btn('▶ Ouvir devagar','speak-slow','','button button-gold')}${btn('▶ Ouvir normal','speak-normal','','button button-outline')}${btn('Parar','stop-speech','','button button-outline')}</div><p class="muted-note">Se não houver uma voz masculina/feminina nesse idioma, o navegador usará a voz padrão.</p></section>`;
  else if(ui.mediaTab==='listen')content=`<section class="panel media-panel"><div class="panel-title"><div><span class="eyebrow">RECONHECIMENTO DE VOZ</span><h2>Fala para escrever</h2><p>O ditado usa a API de reconhecimento de voz disponível no navegador, que pode exigir internet e permissão para usar o microfone.</p></div><span class="large-tool-icon gold">🎙</span></div><div class="voice-settings"><label>Idioma reconhecido<select id="recognitionLang" class="select-control">${LANGUAGES.map(l=>`<option value="${l.id}" ${l.id===(ui.recognitionLang||state.courseLang)?'selected':''}>${l.flag} ${esc(l.native)}</option>`).join('')}</select></label></div><div class="form-actions">${btn('Iniciar ditado','start-recognition','','button button-gold')}${btn('Parar gravação','stop-recognition','','button button-outline')}</div><label class="input-label" for="recognitionOutput">Texto reconhecido</label><textarea id="recognitionOutput" class="large-textarea" placeholder="O texto reconhecido aparecerá aqui…">${esc(ui.recognitionOutput||'')}</textarea><div class="form-actions">${btn('Enviar para traduzir','use-recognition','','button button-outline')}</div><div id="recognitionStatus" class="translation-notice">O microfone só é activado quando tocares em “Iniciar ditado”.</div></section>`;
  else content=`<section class="panel media-panel"><div class="panel-title"><div><span class="eyebrow">LEITURA DE IMAGEM · OCR</span><h2>Extrair texto de uma imagem</h2><p>Tira uma fotografia ou escolhe uma imagem. O OCR local depende do suporte do navegador; esta demonstração não envia imagens a um servidor.</p></div><span class="large-tool-icon green">▧</span></div><label class="upload-zone" for="ocrFile"><span>⇧</span><strong>Fotografar ou importar imagem</strong><small>JPG, PNG ou WEBP · máx. recomendado 8 MB</small><input id="ocrFile" type="file" accept="image/*" capture="environment" hidden></label><div id="ocrPreviewWrap" class="ocr-preview-wrap" ${ocrUrl?'':'hidden'}>${ocrUrl?`<img src="${ocrUrl}" alt="Pré-visualização da imagem seleccionada">`:''}</div><div class="form-actions">${btn('Detectar texto (OCR)','run-ocr','','button button-gold')}${btn('Escolher documento .txt','open-text-document','','button button-outline')}<input id="ocrTextFile" type="file" accept=".txt,.md,text/plain" hidden></div>${ui.ocrMessage?`<div class="translation-notice ${ui.ocrMessage.includes('não')?'warning':''}">${esc(ui.ocrMessage)}</div>`:''}<label class="input-label" for="ocrText">Texto extraído / editável</label><textarea id="ocrText" class="large-textarea" placeholder="O texto extraído aparece aqui…">${esc(ui.ocrText)}</textarea><div class="form-actions">${btn('Traduzir texto extraído','translate-ocr','','button button-outline')}${btn('Ouvir texto','speak-ocr','','button button-outline')}${btn('Descarregar .txt','download-ocr','','button button-outline')}</div><p class="muted-note">Leitura de PDF/DOCX e OCR avançado de imagens precisam de motores seguros/configurados para produção.</p></section>`;
  main.innerHTML=`<div class="page">${pageHead('VOZ, PRONÚNCIA E IMAGEM','Fala, ouve e lê','Ferramentas assistivas para aprender e comunicar.') }<div class="media-tabs">${tabs.map(([id,name,icon])=>`<button class="media-tab ${ui.mediaTab===id?'active':''}" data-action="media-tab" data-tab="${id}"><span>${icon}</span>${name}</button>`).join('')}</div>${content}</div>`;
  if(ui.mediaTab==='speak')populateVoiceChoices();
}
function populateVoiceChoices(){
  const select=$('#voiceStyle');if(!select||!('speechSynthesis' in window))return;
  const available=speechSynthesis.getVoices();if(!available.length)return;
  // Voice selection is approximate: operating systems do not expose gender consistently.
  const lang=langOf($('#ttsLang')?.value||state.courseLang).voice.split('-')[0];
  const matched=available.filter(v=>v.lang.toLowerCase().startsWith(lang.toLowerCase()));
  if(!matched.length)return;
  const selected=select.value;
  select.innerHTML=`<option value="system">Automática</option>${matched.map((v,i)=>`<option value="${esc(v.name)}">${esc(v.name)} · ${esc(v.lang)}</option>`).join('')}<option value="female">Feminina (se disponível)</option><option value="male">Masculina (se disponível)</option>`;
  select.value=matched.some(v=>v.name===selected)?selected:'system';
}
function speak(text,langId=state.courseLang,rate=0.92){
  const content=String(text||'').trim();if(!content){showToast('Escreve ou escolhe um texto primeiro.');return;}
  if(!('speechSynthesis' in window)){showToast('A leitura de voz não está disponível neste navegador.');return;}
  speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(content);u.lang=langOf(langId).voice;u.rate=rate;u.pitch=1;
  const chosen=$('#voiceStyle')?.value,voices=speechSynthesis.getVoices(),short=langOf(langId).voice.split('-')[0];
  if(chosen&&chosen!=='system'&&chosen!=='female'&&chosen!=='male'){u.voice=voices.find(v=>v.name===chosen)||null;}
  else{
    const matches=voices.filter(v=>v.lang.toLowerCase().startsWith(short.toLowerCase()));
    const pattern=chosen==='female'?/female|woman|susan|zira|samantha|victoria|karen|aria|serena/i:chosen==='male'?/male|man|david|daniel|alex|tom|guy|jorge/i:null;
    const voice=(pattern&&matches.find(v=>pattern.test(v.name)))||matches[0];if(voice)u.voice=voice;
    if(pattern&&!matches.some(v=>pattern.test(v.name)))showToast('Não encontrámos essa voz. O dispositivo usará a voz padrão.');
  }
  speechSynthesis.speak(u);
}
function startRecognition(outputSelector){
  const Rec=window.SpeechRecognition||window.webkitSpeechRecognition;
  if(!Rec){showToast('O reconhecimento de voz não está disponível neste navegador.');return;}
  recognition=new Rec();recognition.lang=langOf($('#recognitionLang')?.value||state.courseLang).voice;recognition.interimResults=true;recognition.continuous=false;
  const status=$('#recognitionStatus');if(status)status.textContent='A ouvir… fala agora. O navegador poderá pedir permissão para o microfone.';
  recognition.onresult=event=>{let text='';for(let i=event.resultIndex;i<event.results.length;i++)text+=event.results[i][0].transcript;ui.recognitionOutput=text;const output=$(outputSelector);if(output)output.value=text;};
  recognition.onerror=event=>{const s=$('#recognitionStatus');if(s)s.textContent=`Não foi possível reconhecer a voz (${event.error}). Verifica a permissão do microfone e tenta novamente.`;};
  recognition.onend=()=>{const s=$('#recognitionStatus');if(s)s.textContent=ui.recognitionOutput?'Ditado terminado. Revê o texto antes de o usar.':'O ditado terminou.';};
  try{recognition.start();}catch(e){showToast('O reconhecimento já está activo.');}
}
function stopRecognition(){try{recognition?.stop();}catch(e){};}
async function runOcr(){
  if(!ocrUrl){showToast('Escolhe ou fotografa uma imagem primeiro.');return;}
  if(!('TextDetector' in window)){ui.ocrMessage='O OCR nativo não está disponível neste navegador. A integração com um motor OCR avançado requer um serviço seguro no servidor.';renderMedia();return;}
  try{const bitmap=await createImageBitmap(await (await fetch(ocrUrl)).blob());const detector=new TextDetector();const results=await detector.detect(bitmap);ui.ocrText=results.map(x=>x.rawValue).join('\n');ui.ocrMessage=ui.ocrText?'Texto detectado localmente. Revê a extracção antes de traduzir.':'Não foi detectado texto legível. Tenta uma imagem mais nítida.';renderMedia();}
  catch(e){ui.ocrMessage='Não foi possível processar esta imagem neste dispositivo.';renderMedia();}
}

function renderCreator(){
  main.innerHTML=`<div class="page">${pageHead('CRIAÇÃO ASSISTIDA','Escreve com confiança','Gera um rascunho estruturado, personaliza-o e revê antes de enviar.')}
    <div class="creator-layout"><section class="panel creator-form"><span class="eyebrow">GERADOR DE CONTEÚDO</span><h2>O que precisas de criar?</h2><label class="input-label" for="creatorType">Tipo de conteúdo</label><select id="creatorType" class="select-control"><option value="email">E-mail profissional</option><option value="letter">Carta</option><option value="cv">CV / Curriculum Vitae</option><option value="essay">Redacção</option><option value="speech">Discurso</option><option value="presentation">Apresentação</option></select><label class="input-label" for="creatorTopic">Tema / objectivo</label><input id="creatorTopic" class="text-input" value="${esc(ui.creatorTopic||'')}" placeholder="Ex.: candidatura a uma vaga de emprego"><label class="input-label" for="creatorName">Nome</label><input id="creatorName" class="text-input" value="${esc(state.name||'')}" placeholder="O teu nome"><label class="input-label" for="creatorRecipient">Destinatário (quando aplicável)</label><input id="creatorRecipient" class="text-input" value="${esc(ui.creatorRecipient||'')}" placeholder="Ex.: responsável de Recursos Humanos"><label class="input-label" for="creatorRole">Profissão / cargo</label><input id="creatorRole" class="text-input" value="${esc(ui.creatorRole||'')}" placeholder="Ex.: assistente administrativo"><label class="input-label" for="creatorLanguage">Idioma do rascunho</label><select id="creatorLanguage" class="select-control"><option value="en">🇬🇧 Inglês</option><option value="pt">🇲🇿 Português</option></select>${btn('Gerar rascunho <span>✧</span>','generate-draft','','button button-gold full-width')}<p class="muted-note">Modelo local de demonstração. Não uses um rascunho sem conferir factos, nomes, datas e tom.</p></section>
    <section class="panel creator-output"><div class="panel-title"><div><span class="eyebrow">O TEU RASCUNHO</span><h2>Conteúdo editável</h2><p>Podes corrigir, copiar ou descarregar o texto.</p></div><span class="large-tool-icon gold">✎</span></div><textarea id="creatorOutput" class="creator-textarea" placeholder="O rascunho gerado aparecerá aqui…">${esc(ui.creatorDraft?.text||'')}</textarea>${ui.creatorDraft?.notice?`<div class="translation-notice">ℹ ${esc(ui.creatorDraft.notice)}</div>`:''}<div class="form-actions">${btn('Copiar texto','copy-draft','','button button-outline')}${btn('Descarregar .txt','download-draft','','button button-outline')}${btn('Traduzir rascunho','translate-draft','','button button-gold')}</div></section></div>
  </div>`;
}

function renderHistory(){
  const entries=state.history||[];
  const bookmarks=(state.bookmarks||[]).map(id=>courseData.vocabulary.find(w=>w.id===id)).filter(Boolean);
  main.innerHTML=`<div class="page">${pageHead('TEU ESPAÇO PESSOAL','Histórico e guardados','Traduções e palavras guardadas ficam neste dispositivo e não são enviadas para a nuvem.')}
    <div class="history-grid"><section class="panel history-panel"><div class="panel-title"><div><span class="eyebrow">TRADUÇÕES</span><h2>Histórico recente</h2><p>${entries.length} registo(s) guardados localmente.</p></div>${btn('Limpar histórico','clear-history','','button button-outline button-small')}</div>${entries.length?`<div class="history-list">${entries.map((x,i)=>`<article class="history-item"><div><small>${esc(x.date||'')}</small><p><b>${esc(x.fromLabel||x.from)} → ${esc(x.toLabel||x.to)}</b></p><p>${esc(x.source)}</p><strong>${esc(x.target)}</strong></div><button class="icon-control" data-action="reuse-history" data-index="${i}" aria-label="Reutilizar tradução">↗</button></article>`).join('')}</div>`:`<div class="empty-state"><span>◷</span><b>Ainda sem histórico</b><small>Guarda uma tradução para a consultar mais tarde.</small></div>`}</section>
    <section class="panel history-panel"><div class="panel-title"><div><span class="eyebrow">DICIONÁRIO</span><h2>Palavras guardadas</h2><p>${bookmarks.length} entrada(s) favoritas.</p></div>${btn('Abrir dicionário','navigate','data-route="dictionary"','button button-outline button-small')}</div>${bookmarks.length?`<div class="bookmark-list">${bookmarks.map(w=>`<div class="bookmark-item"><div><strong>${esc(w.word)}</strong><small>${esc(w.translation)}</small></div><button class="icon-control" data-action="speak" data-text="${esc(w.word)}" data-lang="en" aria-label="Ouvir">▶</button></div>`).join('')}</div>`:`<div class="empty-state"><span>☆</span><b>Guarda palavras úteis</b><small>Toca na estrela no dicionário para as encontrar aqui.</small></div>`}</section></div>
  </div>`;
}

function renderPremium(){
  const phones=state.paymentPhones||{mpesa:'866309994',emola:'843933721'};
  main.innerHTML=`<div class="page">${pageHead('APOIA O TEU PROGRESSO','EK Premium','Um plano simples para quem precisa de mais prática e ferramentas.')}
    <section class="premium-hero"><div><span class="premium-star">✦</span><span class="eyebrow light">EK LANGUAGE HUB · PREMIUM</span><h1>Aprende sem limites.</h1><p>Mais ferramentas, mais prática e estudo offline expandido — com pagamentos locais a configurar.</p><div class="price-line"><strong>400 <small>MZN</small></strong><span>por semana</span></div>${btn(state.plan==='premium'?'Plano Premium seleccionado ✓':'Explorar activação','premium-request','','button button-gold')}</div><div class="premium-orbit">EK<br><small>PLUS</small></div></section>
    <div class="premium-grid"><section class="panel plan-card"><div class="plan-card-head"><div><span class="eyebrow">GRATUITO</span><h2>Começar</h2></div><span class="tag">SEM CUSTO</span></div><ul class="benefit-list"><li>✓ Lições e exercícios de base</li><li>✓ Livro de frases offline</li><li>✓ Pronúncia básica do dispositivo</li><li>✓ Traduções offline seleccionadas</li><li>◷ Publicidade não intrusiva na versão publicada</li></ul><span class="plan-foot">Este protótipo não apresenta anúncios reais.</span></section><section class="panel plan-card premium-card"><div class="plan-card-head"><div><span class="eyebrow">RECOMENDADO</span><h2>Premium</h2></div><span class="tag gold">400 MZN / SEMANA</span></div><ul class="benefit-list"><li>✓ Sem anúncios</li><li>✓ Mais traduções e modelos avançados</li><li>✓ IA avançada (quando integrada)</li><li>✓ Pronúncia profissional e exercícios expandidos</li><li>✓ Certificado de conclusão não-acreditado</li><li>✓ Mais downloads e conteúdo offline</li></ul><span class="plan-foot">Benefícios sujeitos a disponibilidade e validação do serviço.</span></section></div>
    <section class="panel payment-panel"><div class="panel-title"><div><span class="eyebrow">MÉTODOS LOCAIS</span><h2>M-Pesa e e-Mola</h2><p>Os contactos iniciais são editáveis no Painel de gestão. Nenhum pagamento é processado por esta demonstração.</p></div><span class="soft-icon">MZN</span></div><div class="payment-numbers"><div><span class="payment-brand mpesa">M-Pesa</span><b>${esc(phones.mpesa)}</b><button data-action="copy-number" data-number="${esc(phones.mpesa)}">Copiar número</button></div><div><span class="payment-brand emola">e-Mola</span><b>${esc(phones.emola)}</b><button data-action="copy-number" data-number="${esc(phones.emola)}">Copiar número</button></div></div><div class="payment-warning"><b>Segurança:</b> confirma o nome do comerciante no serviço de pagamentos. Nunca partilhes PIN, OTP ou código secreto. A app não recebe nem valida transacções nesta fase.</div>${btn('Pedir validação de pagamento','premium-request','','button button-gold')}</section>
    <div class="service-disclaimer">Integração de pagamentos real requer conta comerciante, API oficial, verificação server-to-server, assinatura de webhooks e reconciliação. Nunca activar Premium com base apenas num botão do utilizador.</div>
  </div>`;
}

function renderProfile(){
  const level=scoreLevelFromXP(state.xp),medals=getMedals({xp:state.xp,lessons:state.completedLessons?.length||0,englishLessons:state.completedLessons.filter(x=>x.startsWith('en_')).length,words:state.learnedWords?.length||0,streak:state.streak});
  const englishLessons=courseData.tenses.map((t,i)=>({id:`en_${t.key}`,name:t.name,done:state.completedLessons.includes(`en_${t.key}`),number:i+1}));
  const done=englishLessons.filter(x=>x.done).length,pct=Math.round(done/englishLessons.length*100);
  main.innerHTML=`<div class="page">${pageHead('PERFIL E PROGRESSO','O teu percurso','Acompanha as tuas metas. Os dados desta versão ficam guardados apenas neste navegador.')}
    <section class="profile-hero panel"><div class="profile-avatar">${esc((state.name||'EK').split(/\s+/).map(x=>x[0]).slice(0,2).join('').toUpperCase())}</div><div class="profile-main"><span class="eyebrow">MEMBRO EK LANGUAGE HUB</span><h2>${esc(state.name||'Estudante EK')}</h2><p>${esc(level.name)} · ${state.plan==='premium'?'Plano Premium':'Plano Gratuito'}</p></div><button class="button button-outline button-small" data-action="edit-name">Editar nome</button></section>
    <div class="profile-stat-grid"><div class="stat-card"><strong>${formatNumber(state.xp)}</strong><small>XP acumulados</small></div><div class="stat-card"><strong>${state.streak||0}</strong><small>dias consecutivos</small></div><div class="stat-card"><strong>${state.completedLessons?.length||0}</strong><small>unidades concluídas</small></div><div class="stat-card"><strong>${state.learnedWords?.length||0}</strong><small>palavras aprendidas</small></div></div>
    <section class="panel profile-progress"><div class="panel-title"><div><span class="eyebrow">CURSO COMPLETO DISPONÍVEL</span><h2>Trilha de inglês</h2><p>${done} de ${englishLessons.length} lições · ${pct}% concluída</p></div><span class="tag gold">${pct}%</span></div><div class="thin-progress large"><i style="width:${pct}%"></i></div><div class="progress-lessons">${englishLessons.map(l=>`<div class="progress-lesson"><span class="status-dot ${l.done?'done':''}">${l.done?'✓':l.number}</span><span>${esc(l.name)}</span><small>${l.done?'Concluída':'Por estudar'}</small></div>`).join('')}</div><button class="button button-outline button-small" data-route="learn">Continuar trilha</button></section>
    <section class="panel badge-panel"><div class="panel-title"><div><span class="eyebrow">GAMIFICAÇÃO</span><h2>Medalhas</h2></div><span>${medals.filter(m=>m.earned).length}/${medals.length} desbloqueadas</span></div><div class="medal-row all-medals">${medals.map(m=>`<div class="medal ${m.earned?'earned':'locked'}"><i>${m.icon}</i><span>${esc(m.title)}</span><small>${esc(m.detail)}</small></div>`).join('')}</div><div class="ranking-note"><span>♛</span><div><b>Ranking comunitário</b><small>Requer contas e sincronização segura no servidor; não inventamos posições num modo local.</small></div></div></section>
    <div class="profile-actions-grid"><button class="panel action-panel" data-action="download-certificate"><span>🏅</span><b>Certificado de conclusão</b><small>Imprimível quando terminares a trilha. Certificado interno, não acreditado.</small></button><button class="panel action-panel" data-action="export-data"><span>⇩</span><b>Exportar os meus dados</b><small>Descarrega uma cópia local do teu progresso.</small></button><button class="panel action-panel" data-action="install-instructions"><span>⌂</span><b>Instalar no telemóvel</b><small>Adicionar o Hub ao ecrã inicial como PWA.</small></button><button class="panel action-panel" data-action="reset-data"><span>↺</span><b>Repor progresso</b><small>Apaga os dados guardados neste dispositivo.</small></button></div>
    <p class="privacy-note">Não guardes informação sensível neste protótipo. Contas, recuperação de palavra-passe, encriptação no servidor e backups ainda exigem um backend de produção.</p>
  </div>`;
}

function renderAdmin(){
  const p=state.paymentPhones||{};
  main.innerHTML=`<div class="page">${pageHead('FERRAMENTAS DO PROTÓTIPO','Painel de gestão','Configurações locais para demonstração. Este ecrã não é um painel administrativo seguro.')}
    <div class="admin-alert"><b>⚠ Ambiente de demonstração — não usar para gerir pagamentos ou dados reais.</b><span>Não existe autenticação de administrador nem servidor ligado. Os campos abaixo ficam apenas no teu navegador e podem ser alterados pelo próprio utilizador.</span></div>
    <div class="admin-grid"><section class="panel admin-card"><span class="eyebrow">PAGAMENTOS · CONTACTOS VISÍVEIS</span><h2>Números de cobrança</h2><label class="input-label" for="adminMpesa">M-Pesa</label><input id="adminMpesa" class="text-input" value="${esc(p.mpesa||'')}" inputmode="tel"><label class="input-label" for="adminEmola">e-Mola</label><input id="adminEmola" class="text-input" value="${esc(p.emola||'')}" inputmode="tel">${btn('Guardar contactos localmente','save-admin-phones','','button button-gold')}<p class="muted-note">A versão real deve validar alterações por função administrativa, auditar acções e guardar segredos no servidor — nunca no JavaScript público.</p></section>
    <section class="panel admin-card"><span class="eyebrow">ESTATÍSTICAS LOCAIS</span><h2>Este dispositivo</h2><div class="admin-metrics"><div><b>${state.sessions||0}</b><small>sessões</small></div><div><b>${state.history?.length||0}</b><small>traduções guardadas</small></div><div><b>${state.learnedWords?.length||0}</b><small>palavras aprendidas</small></div><div><b>${state.completedLessons?.length||0}</b><small>unidades concluídas</small></div></div><div class="translation-notice">Relatórios globais, gestão de utilizadores, moderação e backups precisam de API e base de dados.</div></section>
    <section class="panel admin-card"><span class="eyebrow">CONTEÚDO</span><h2>Gestão editorial</h2><p>Os dados do curso inglês estão em <code>data/english-course.json</code>; idiomas adicionais devem passar por tradução, revisão linguística e controlo de qualidade antes de publicação.</p>${btn('Abrir aprendizagem','navigate','data-route="learn"','button button-outline button-small')}</section>
    <section class="panel admin-card"><span class="eyebrow">ANÚNCIOS</span><h2>Política de publicidade</h2><p>O espaço no painel inicial é apenas uma maquete. AdMob deve ser ligado no cliente Android publicado, com consentimento, controlo de frequência e sem interromper a aprendizagem.</p>${btn('Ver plano Premium','navigate','data-route="premium"','button button-outline button-small')}</section></div>
  </div>`;
}

function render(){
  if(!courseData)return;
  sync();setActiveNav();
  const views={dashboard:renderDashboard,learn:renderLearn,translator:renderTranslator,assistant:renderAssistant,dictionary:renderDictionary,media:renderMedia,creator:renderCreator,history:renderHistory,premium:renderPremium,profile:renderProfile,admin:renderAdmin,quiz:renderQuiz,'quiz-result':renderQuizResult};
  (views[ui.route]||renderDashboard)();
}

async function copyText(text){
  if(!text){showToast('Não há texto para copiar.');return;}
  try{await navigator.clipboard.writeText(text);showToast('Texto copiado.');}
  catch(e){const area=document.createElement('textarea');area.value=text;document.body.append(area);area.select();document.execCommand('copy');area.remove();showToast('Texto copiado.');}
}
function downloadText(filename,text,mime='text/plain;charset=utf-8'){
  const blob=new Blob([text],{type:mime}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=filename;a.click();URL.revokeObjectURL(url);
}
async function shareText(title,text){
  if(!text){showToast('Não há conteúdo para partilhar.');return;}
  if(navigator.share){try{await navigator.share({title,text});}catch(e){}}
  else copyText(text);
}
function storeCurrentTranslation(){
  const result=ui.translationResult,source=ui.translatorText;if(!result?.text){showToast('Traduz um texto antes de guardar.');return;}
  const from=$('#sourceLang')?.value||state.nativeLang,to=$('#targetLang')?.value||state.courseLang;
  store.addHistory({source,target:result.text,from,to,fromLabel:langOf(from).native,toLabel:langOf(to).native,date:new Date().toLocaleString('pt-MZ')});store.addActivity(1);sync();showToast('Tradução guardada no histórico.');
}

function openCertificate(){
  const total=courseData.tenses.length,done=state.completedLessons.filter(x=>x.startsWith('en_')).length;
  if(done<total){showToast(`Conclui as ${total} lições de inglês para gerar o certificado. Tens ${done}/${total}.`);return;}
  modalRoot.innerHTML=`<section class="modal certificate-modal" role="dialog" aria-modal="true"><div class="certificate-border"><div class="eyebrow">EK LANGUAGE HUB · ESCOLA DO CONHECIMENTO</div><div class="certificate-mark">EK</div><h2>Certificado de conclusão</h2><p>Certificamos que</p><h3>${esc(state.name||'Estudante EK')}</h3><p>concluiu a trilha de inglês de demonstração do EK Language Hub.</p><small>Emitido em ${new Date().toLocaleDateString('pt-MZ')} · Edmilson Arlindo</small><div class="certificate-actions"><button class="button button-gold" data-action="print-certificate">Imprimir / Guardar PDF</button><button class="button button-outline" data-action="close-modal">Fechar</button></div><small>Certificado interno de conclusão; não equivale a qualificação oficial/acreditada.</small></div></section>`;
  modalRoot.classList.add('open');modalRoot.setAttribute('aria-hidden','false');
}
function printCertificate(){
  const cert=$('.certificate-modal');if(!cert)return;const w=window.open('','_blank');
  if(!w){showToast('Permite a janela de impressão ou tenta novamente.');return;}
  w.opener=null;
  w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>Certificado EK</title><style>body{font-family:Georgia,serif;background:#f6f8fa;padding:5vw;color:#112e4a}.certificate-border{text-align:center;border:8px double #c99e52;background:#fff;padding:6vw;max-width:900px;margin:auto}.eyebrow{letter-spacing:.15em;color:#9b752f;font:700 12px Arial}.certificate-mark{font-size:34px;font-weight:bold;color:#c99e52;margin:30px}.certificate-border h2{font-size:38px;margin:20px}.certificate-border h3{font-size:30px;color:#173f5c}.certificate-border p{font-size:18px}.certificate-actions{display:none}.certificate-border small{display:block;margin-top:20px;color:#71818b}@media print{body{background:white}}</style></head><body>${$('.certificate-border').outerHTML}</body></html>`);w.document.close();w.print();
}

function onAction(action,el){
  switch(action){
    case 'toggle-menu':toggleSidebar();break;
    case 'toggle-theme':saveSettings({theme:state.theme==='dark'?'light':'dark'});render();break;
    case 'choose-course':saveSettings({courseLang:el.dataset.lang,courseLevel:'A1'});ui.learnLevel='A1';render();showToast(`Trilha seleccionada: ${langOf(el.dataset.lang).native}`);break;
    case 'open-tense':openTense(el.dataset.key);break;
    case 'open-category':openPhraseCategory(el.dataset.category);break;
    case 'close-modal':closeModal();break;
    case 'complete-lesson':updateCompletion(el.dataset.id);break;
    case 'start-tense-quiz':closeModal();startQuiz(`tense_${el.dataset.key}`);break;
    case 'start-course-quiz':closeModal();startQuiz(currentLang().id==='en'?'foundations':'starter',10);break;
    case 'start-bank':closeModal();startQuiz(el.dataset.id,el.dataset.size||10);break;
    case 'start-grammar-quiz':closeModal();startQuiz('foundations',10);break;
    case 'start-conversation':saveSettings({chat:[...(state.chat||[]),{role:'assistant',text:makeTutorReply('Simula uma conversa comigo',state.courseLevel),at:Date.now()}]});navigate('assistant');break;
    case 'quiz-check':checkQuiz();break;
    case 'quiz-next':advanceQuiz();break;
    case 'quiz-skip':advanceQuiz(true);break;
    case 'quiz-exit':quiz=null;navigate('learn');break;
    case 'assistant-tab':ui.assistantMode=el.dataset.mode;renderAssistant();break;
    case 'send-tutor':sendTutor($('#assistantInput')?.value||'');break;
    case 'suggest-tutor':sendTutor(el.dataset.text);break;
    case 'correct-text':{ui.correctText=$('#correctInput')?.value||'';ui.correctResult=correctBasicEnglish(ui.correctText);renderAssistant();break;}
    case 'clear-corrector':ui.correctText='';ui.correctResult=null;renderAssistant();break;
    case 'copy-correction':copyText(ui.correctResult?.corrected||'');break;
    case 'media-tab':ui.mediaTab=el.dataset.tab;renderMedia();break;
    case 'speak':speak(el.dataset.text,el.dataset.lang||state.courseLang,Number(el.dataset.rate)||.92);break;
    case 'speak-slow':speak($('#ttsText')?.value, $('#ttsLang')?.value, .68);break;
    case 'speak-normal':speak($('#ttsText')?.value, $('#ttsLang')?.value, .96);break;
    case 'stop-speech':window.speechSynthesis?.cancel();break;
    case 'start-recognition':startRecognition('#recognitionOutput');break;
    case 'listen-translator':startRecognition('#translationInput');break;
    case 'stop-recognition':stopRecognition();break;
    case 'use-recognition':{const from=langOf($('#recognitionLang')?.value||state.courseLang).id;ui.translatorText=ui.recognitionOutput||$('#recognitionOutput')?.value||'';saveSettings({nativeLang:from,courseLang:from==='en'?'pt':'en'});navigate('translator');break;}
    case 'run-ocr':runOcr();break;
    case 'translate-ocr':ui.translatorText=$('#ocrText')?.value||ui.ocrText;ui.translationResult=null;navigate('translator');break;
    case 'speak-ocr':speak($('#ocrText')?.value,'en',.9);break;
    case 'download-ocr':downloadText('ek-language-hub-extracted-text.txt',$('#ocrText')?.value||ui.ocrText);break;
    case 'open-text-document':$('#ocrTextFile')?.click();break;
    case 'translate':runTranslation();break;
    case 'clear-translation':ui.translatorText='';ui.translationResult=null;renderTranslator();break;
    case 'swap-languages':{const a=$('#sourceLang')?.value||state.nativeLang,b=$('#targetLang')?.value||state.courseLang;ui.translatorText=ui.translationResult?.text||ui.translatorText;saveSettings({nativeLang:b,courseLang:a});ui.translationResult=null;renderTranslator();break;}
    case 'copy-translation':copyText(ui.translationResult?.text||'');break;
    case 'save-translation':storeCurrentTranslation();break;
    case 'share-translation':shareText('EK Language Hub',ui.translationResult?.text||'');break;
    case 'download-translation':downloadText('ek-language-hub-translation.txt',ui.translationResult?.text||'');break;
    case 'bookmark-word':{const added=store.toggleBookmark(Number(el.dataset.id));sync();renderDictionary();showToast(added?'Palavra guardada.':'Palavra retirada dos guardados.');break;}
    case 'learn-word':{const result=store.toggleWord(Number(el.dataset.id));sync();renderDictionary();showToast(result.added?(result.awarded?'Palavra aprendida · +2 XP':'Palavra reaprendida.'):'Retirada das palavras aprendidas.');break;}
    case 'dict-page':ui.dictPage=Number(el.dataset.page);renderDictionary();break;
    case 'word-detail':openTense(el.dataset.key);break;
    case 'generate-draft':{ui.creatorTopic=$('#creatorTopic')?.value||'';ui.creatorRecipient=$('#creatorRecipient')?.value||'';ui.creatorRole=$('#creatorRole')?.value||'';ui.creatorDraft=generateDraft({type:$('#creatorType')?.value,topic:ui.creatorTopic,name:$('#creatorName')?.value||state.name,recipient:ui.creatorRecipient,role:ui.creatorRole,language:$('#creatorLanguage')?.value||'en'});renderCreator();break;}
    case 'copy-draft':copyText($('#creatorOutput')?.value||ui.creatorDraft?.text||'');break;
    case 'download-draft':downloadText('ek-language-hub-rascunho.txt',$('#creatorOutput')?.value||ui.creatorDraft?.text||'');break;
    case 'translate-draft':{const from=ui.creatorDraft?.language||$('#creatorLanguage')?.value||'en';ui.translatorText=$('#creatorOutput')?.value||ui.creatorDraft?.text||'';ui.translationResult=null;saveSettings({nativeLang:from,courseLang:from==='en'?'pt':'en'});navigate('translator');break;}
    case 'clear-history':if(confirm('Apagar o histórico de traduções deste dispositivo?')){saveSettings({history:[]});renderHistory();}break;
    case 'reuse-history':{const entry=state.history[Number(el.dataset.index)];if(entry){ui.translatorText=entry.source;ui.translationResult={text:entry.target,mode:'phrasebook',coverage:1,notice:'Tradução recuperada do histórico.'};navigate('translator');}break;}
    case 'premium-request':showPremiumRequest();break;
    case 'copy-number':copyText(el.dataset.number||'');break;
    case 'edit-name':editName();break;
    case 'download-certificate':openCertificate();break;
    case 'print-certificate':printCertificate();break;
    case 'export-data':downloadText('ek-language-hub-meus-dados.json',JSON.stringify({profile:{name:state.name,level:state.courseLevel},progress:{xp:state.xp,streak:state.streak,completedLessons:state.completedLessons,learnedWords:state.learnedWords,bookmarks:state.bookmarks},history:state.history},null,2),'application/json');break;
    case 'reset-data':if(confirm('Queres apagar todo o progresso guardado neste dispositivo?')){store.reset();sync();ui.chatDraft='';navigate('dashboard');showToast('Progresso reposto.');}break;
    case 'save-admin-phones':{const mpesa=$('#adminMpesa')?.value.trim(),emola=$('#adminEmola')?.value.trim();if(!/^\d{9,15}$/.test(mpesa)||!/^\d{9,15}$/.test(emola)){showToast('Indica números válidos com 9 a 15 dígitos.');return;}saveSettings({paymentPhones:{mpesa,emola}});renderAdmin();showToast('Contactos guardados neste dispositivo.');break;}
  }
}
function showInstallHelp(){
  modalRoot.innerHTML=`<section class="modal" role="dialog" aria-modal="true"><div class="modal-top"><span class="eyebrow">INSTALAR EK LANGUAGE HUB</span><button class="close-modal" data-action="close-modal" aria-label="Fechar">×</button></div><h2>Adicionar ao ecrã inicial</h2><p class="modal-intro">A app é uma PWA instalável. Não precisa de estar na App Store para ser testada no teu dispositivo.</p><div class="install-steps"><b>iPhone / iPad</b><span>Abre este endereço no Safari → Partilhar → Adicionar ao ecrã principal → Adicionar.</span><b>Android / Chrome</b><span>Toca em “Instalar app” no cabeçalho ou abre o menu ⋮ → Instalar app / Adicionar ao ecrã inicial.</span><b>Computador</b><span>Usa o ícone de instalação do Chrome/Edge quando aparecer na barra de endereço.</span></div><div class="translation-notice">Para instalação e modo offline, publica a pasta completa num endereço HTTPS estável e abre a app uma primeira vez com ligação.</div><div class="modal-actions">${btn('Fechar','close-modal','','button button-gold')}</div></section>`;
  modalRoot.classList.add('open');modalRoot.setAttribute('aria-hidden','false');
}
function showPremiumRequest(){
  const phones=state.paymentPhones||{};
  modalRoot.innerHTML=`<section class="modal" role="dialog" aria-modal="true"><div class="modal-top"><span class="eyebrow">ACTIVAÇÃO PREMIUM</span><button class="close-modal" data-action="close-modal">×</button></div><h2>Pedido de validação</h2><p class="modal-intro">O fluxo de pagamentos ainda não está ligado. Para demonstração, podes contactar a equipa pelos números definidos no painel:</p><div class="payment-numbers compact"><div><span class="payment-brand mpesa">M-Pesa</span><b>${esc(phones.mpesa)}</b></div><div><span class="payment-brand emola">e-Mola</span><b>${esc(phones.emola)}</b></div></div><div class="payment-warning">Não introduzas o PIN nem códigos secretos na app. Um pedido não activa Premium; a validação real tem de ser feita por integração segura.</div><div class="modal-actions">${btn('Copiar contactos','copy-payment-contacts','','button button-gold')}${btn('Fechar','close-modal','','button button-outline')}</div></section>`;
  modalRoot.classList.add('open');modalRoot.setAttribute('aria-hidden','false');
}
function editName(){
  modalRoot.innerHTML=`<section class="modal" role="dialog" aria-modal="true"><div class="modal-top"><span class="eyebrow">PERFIL LOCAL</span><button class="close-modal" data-action="close-modal">×</button></div><h2>Como te chamamos?</h2><label class="input-label" for="newName">Nome de apresentação</label><input id="newName" class="text-input" maxlength="48" value="${esc(state.name||'')}" placeholder="O teu nome"><div class="modal-actions">${btn('Guardar nome','save-name','','button button-gold')}${btn('Cancelar','close-modal','','button button-outline')}</div></section>`;
  modalRoot.classList.add('open');modalRoot.setAttribute('aria-hidden','false');$('#newName')?.focus();
}
function toggleSidebar(){
  const sidebar=$('#sidebar');const open=!sidebar.classList.contains('open');sidebar.classList.toggle('open',open);$('#sidebarBackdrop').classList.toggle('visible',open);$('#mobileMenu').setAttribute('aria-expanded',String(open));
}

function onClick(event){
  const el=event.target.closest('[data-route],[data-action]');if(!el)return;
  if(el.dataset.route){navigate(el.dataset.route);return;}
  const action=el.dataset.action;
  if(action==='copy-payment-contacts'){copyText(`M-Pesa: ${state.paymentPhones.mpesa}\ne-Mola: ${state.paymentPhones.emola}`);return;}
  if(action==='save-name'){const input=$('#newName');const name=input?.value.trim();if(name){saveSettings({name});closeModal();render();showToast('Perfil actualizado neste dispositivo.');}else showToast('Indica um nome.');return;}
  onAction(action,el);
}
function onInput(event){
  const el=event.target;
  if(el.id==='dictSearch'){ui.dictQuery=el.value;ui.dictPage=1;renderDictionary();const input=$('#dictSearch');input?.focus();input?.setSelectionRange(ui.dictQuery.length,ui.dictQuery.length);}
  if(el.id==='translationInput'){ui.translatorText=el.value;const counter=el.closest('.translation-box')?.querySelector('.box-bottom small');if(counter)counter.textContent=`${el.value.length} / 5.000`;}
  if(el.id==='creatorOutput'){ui.creatorDraft={...(ui.creatorDraft||{}),text:el.value,notice:ui.creatorDraft?.notice||''};}
}
async function onChange(event){
  const el=event.target;
  if(el.id==='courseLevel'){saveSettings({courseLevel:el.value});ui.learnLevel=el.value;}
  if(el.id==='dictPos'){ui.dictPos=el.value;ui.dictPage=1;renderDictionary();}
  if(el.id==='sourceLang'){saveSettings({nativeLang:el.value});}
  if(el.id==='targetLang'){saveSettings({courseLang:el.value});}
  if(el.id==='ttsLang'){ui.ttsLang=el.value;populateVoiceChoices();}
  if(el.id==='ocrFile'){
    const file=el.files?.[0];if(!file)return;
    if(ocrUrl)URL.revokeObjectURL(ocrUrl);ocrUrl=URL.createObjectURL(file);ui.ocrMessage=`Imagem seleccionada: ${file.name}`;renderMedia();
  }
  if(el.id==='ocrTextFile'){
    const file=el.files?.[0];if(!file)return;
    if(file.size>2*1024*1024){showToast('O ficheiro .txt deve ter menos de 2 MB.');return;}
    ui.ocrText=await file.text();ui.ocrMessage=`Texto importado: ${file.name}`;renderMedia();
  }
  if(el.id==='textFile'){
    const file=el.files?.[0];if(!file)return;
    if(file.size>2*1024*1024){showToast('O ficheiro .txt deve ter menos de 2 MB.');return;}
    ui.translatorText=await file.text();ui.translationResult=null;renderTranslator();
  }
  if(el.id==='voiceStyle')ui.voiceStyle=el.value;
}
function onSubmit(event){
  if(event.target.id==='translationForm'){event.preventDefault();runTranslation();}
}

// Global event delegation keeps the interface lightweight and keyboard accessible.
document.addEventListener('click',onClick);
document.addEventListener('input',onInput);
document.addEventListener('change',onChange);
document.addEventListener('submit',onSubmit);
$('#mobileMenu').addEventListener('click',toggleSidebar);
$('#sidebarBackdrop').addEventListener('click',toggleSidebar);
modalRoot.addEventListener('click',e=>{if(e.target===modalRoot)closeModal();});
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeModal();});
window.addEventListener('online',updateTopbar);window.addEventListener('offline',updateTopbar);
let deferredInstallEvent=null;
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredInstallEvent=e;$('#installButton').hidden=false;});
$('#installButton').addEventListener('click',async()=>{
  if(!deferredInstallEvent){showInstallHelp();return;}
  deferredInstallEvent.prompt();
  await deferredInstallEvent.userChoice;
  deferredInstallEvent=null;
  $('#installButton').hidden=true;
});
window.addEventListener('appinstalled',()=>showToast('EK Language Hub instalado.'));
window.addEventListener('voiceschanged',populateVoiceChoices);

async function init(){
  try{
    const response=await fetch('./data/english-course.json');
    if(!response.ok)throw new Error('Dados do curso indisponíveis.');
    courseData=await response.json();
    sync();
    if('serviceWorker' in navigator)navigator.serviceWorker.register('./sw.js').catch(()=>{});
    render();
  }catch(error){
    main.innerHTML=`<div class="fatal-error"><img src="./assets/ek-language-hub.svg" alt=""><h1>Não foi possível abrir o hub.</h1><p>Actualiza a página com internet ou verifica se o pacote completo está alojado no mesmo domínio.</p><small>${esc(error.message)}</small></div>`;
  }
}
init();
