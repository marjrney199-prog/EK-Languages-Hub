import {PHRASES} from './catalog.js';

export function normalizeText(value=''){
  return String(value).toLocaleLowerCase().normalize('NFD').replace(/[\u0300-\u036f\u0591-\u05c7]/g,'').replace(/[^\p{L}\p{N}]+/gu,' ').replace(/\s+/g,' ').trim();
}

export function translateOffline(text,from,to,dictionary=[]){
  const input=String(text||'').trim();
  if(!input)return {text:'',mode:'empty',coverage:0,pronunciation:'',notice:'Escreve uma palavra ou frase para começar.'};
  if(from===to)return {text:input,mode:'same-language',coverage:1,pronunciation:'',notice:'Os idiomas de origem e destino são iguais.'};
  const normalized=normalizeText(input);
  const exact=PHRASES.find(row=>normalizeText(row[from]||'')===normalized&&row[to]);
  if(exact)return {text:exact[to],mode:'phrasebook',coverage:1,pronunciation:exact.pron?.[to]||'',notice:'Correspondência exacta no livro de frases offline.'};
  if((from==='en'&&to==='pt')||(from==='pt'&&to==='en')){
    const map=new Map();
    for(const item of dictionary){
      const key=from==='en'?normalizeText(item.word):'';
      const raw=String(item.translation||'');
      if(from==='en'&&key&&!map.has(key))map.set(key,raw.split(/[;,]/)[0].trim());
      if(from==='pt'){
        const choices=raw.split(/[;,]/).flatMap(x=>x.split('/')).map(x=>x.trim()).filter(Boolean);
        for(const choice of choices){
          const ptKey=normalizeText(choice);
          if(ptKey&&!map.has(ptKey))map.set(ptKey,item.word);
        }
      }
    }
    const pieces=input.match(/[\p{L}\p{M}\p{N}]+(?:['’][\p{L}\p{M}]+)?|\s+|[^\s\p{L}\p{M}\p{N}]+/gu)||[input];
    let known=0,total=0;
    const output=pieces.map(part=>{
      if(!/[\p{L}\p{N}]/u.test(part))return part;
      total++;
      const key=normalizeText(part.replace(/['’]/g,''));
      const result=map.get(key);
      if(!result)return part;
      known++;
      return preserveCase(part,result);
    }).join('');
    if(known){
      const coverage=total?known/total:0;
      return {text:output,mode:'dictionary-draft',coverage,pronunciation:'',notice:`Rascunho offline palavra a palavra (${Math.round(coverage*100)}% das palavras encontradas). A ordem e o contexto podem precisar de revisão.`};
    }
  }
  return {text:'',mode:'unavailable',coverage:0,pronunciation:'',notice:'Esta frase não está no pacote offline. Para tradução contextual completa, ligue um fornecedor de tradução seguro no servidor.'};
}
function preserveCase(source,target){
  if(source===source.toUpperCase())return target.toLocaleUpperCase();
  if(source[0]===source[0]?.toUpperCase())return target.charAt(0).toLocaleUpperCase()+target.slice(1);
  return target;
}

export function correctBasicEnglish(source=''){
  let text=String(source||'');
  const changes=[];
  const apply=(regex,replacement,explanation)=>{
    const before=text;
    text=text.replace(regex,replacement);
    if(text!==before)changes.push({before,after:text,explanation});
  };
  apply(/\bI\s+has\b/gi,'I have','Com o pronome I, usa-se have, não has.');
  apply(/\b(he|she|it)\s+don't\b/gi,"$1 doesn't",'Na terceira pessoa, a negativa usa does not/doesn’t; o verbo seguinte fica na forma base.');
  apply(/\b(he|she|it)\s+doesn't\s+([a-z]+)s\b/gi,"$1 doesn't $2",'Depois de doesn’t, retira-se o -s do verbo principal.');
  apply(/\bI\s+am\s+agree\b/gi,'I agree','Agree é verbo; não se usa am antes dele neste sentido.');
  apply(/\bmore\s+better\b/gi,'better','Better já é o comparativo de good; evita more better.');
  apply(/\bthere\s+is\s+(many|several|a lot of)\b/gi,'there are $1','Com um substantivo plural, usa-se there are.');
  apply(/\s{2,}/g,' ','Remove espaços repetidos.');
  const start=text.match(/^\s*[a-zá-ú]/u);
  if(start){const before=text;text=text.replace(/^\s*([a-zá-ú])/u,(_,c)=>c.toLocaleUpperCase());if(text!==before)changes.push({before,after:text,explanation:'Começa a frase com letra maiúscula.'});}
  apply(/\bi\b/g,'I','O pronome I escreve-se sempre com maiúscula.');
  if(text&&!/[.!?…]$/.test(text.trim())){const before=text;text=text.trim()+'.';changes.push({before,after:text,explanation:'Acrescenta pontuação final para completar a frase.'});}
  return {original:String(source||''),corrected:text,changes,mode:'offline-rules'};
}

export function makeTutorReply(question='',level='A1'){
  const q=String(question||'').trim();
  const n=normalizeText(q);
  if(!q)return 'Escreve uma dúvida ou escolhe uma situação de conversação para começarmos.';
  if(n.includes('present simple')||n.includes('presente simples'))return 'Present Simple usa-se para rotinas, factos e situações estáveis. Forma: sujeito + verbo base; com he, she ou it, normalmente acrescenta-se -s.\n\nI study English every day. — Estudo inglês todos os dias.\nShe works in Maputo. — Ela trabalha em Maputo.\n\nPergunta: Do you study at night? Negativa: She does not work on Sundays. Depois de does/doesn’t, o verbo principal fica na forma base.\n\nTenta criar uma frase sobre a tua rotina. Nível seleccionado: '+level+'.';
  if(n.includes('past simple')||n.includes('passado simples'))return 'Past Simple descreve uma acção terminada num momento passado. Regular: verbo + -ed (work → worked); irregular: forma própria (go → went).\n\nI visited my friend yesterday. — Visitei o meu amigo ontem.\nDid you see the teacher? — Viste o professor?\n\nEm perguntas e negativas, did/ didn’t é seguido da forma base: Did she go? She didn’t go.';
  if(n.includes('entrevista')||n.includes('interview'))return 'Vamos simular uma entrevista. Responde em inglês, em 2–4 frases.\n\nInterviewer: “Tell me about yourself and the experience you would bring to this role.”\n\nPodes começar assim: “I am a [profession] with experience in… I am particularly good at… I would like to contribute by…” Depois posso ajudar a rever a tua resposta.';
  if(n.includes('exercise')||n.includes('exercicio')||n.includes('quiz'))return 'Mini-exercício de nível '+level+': completa a frase — “She ___ (study) English every evening.”\n\nEscreve a tua resposta antes de veres a explicação. Dica: no Present Simple, he/she/it recebe normalmente -s.';
  if(n.includes('hello')||n.includes('conversation')||n.includes('conversacao')||n.includes('conversa'))return 'Let’s practise a short conversation.\n\nTutor: “Hello! What language are you learning, and what would you like to be able to do in that language?”\n\nResponde em inglês ou português. Eu posso sugerir uma versão mais natural. Esta demonstração funciona localmente; um modelo de IA real ainda precisa de ser ligado no servidor.';
  return `Entendi a tua pergunta: “${q}”.\n\nDica de estudo: escreve uma frase curta com a palavra ou estrutura que estás a aprender, lê-a em voz alta e depois tenta reconstruí-la sem olhar.\n\nSou o tutor de demonstração offline do EK Language Hub. As explicações específicas do curso funcionam localmente; as respostas generativas avançadas precisam de uma ligação segura a um modelo de IA no servidor. Nível: ${level}.`;
}

export function generateDraft({type='email',topic='',name='[O teu nome]',recipient='[Nome do destinatário]',role='[cargo]',language='en'}={}){
  const subject=String(topic||'um assunto importante').trim();
  const who=String(name||'[O teu nome]').trim();
  const to=String(recipient||'[Nome do destinatário]').trim();
  const job=String(role||'[cargo]').trim();
  const templates={
    en:{
      email:`Subject: ${subject}\n\nDear ${to},\n\nI hope you are well. I am writing regarding ${subject}. I would appreciate the opportunity to discuss this further. Please let me know a convenient time.\n\nThank you for your time and consideration.\n\nKind regards,\n${who}`,
      letter:`${who}\n[Address]\n[Date]\n\nDear ${to},\n\nI am writing to share some thoughts about ${subject}. I value clear communication, practical solutions and respectful collaboration. I would be grateful for your response at your convenience.\n\nYours sincerely,\n${who}`,
      cv:`${who}\n${job} | Maputo, Mozambique\n\nPROFESSIONAL PROFILE\nMotivated ${job.toLowerCase()} with a strong commitment to learning, teamwork and reliable service.\n\nKEY SKILLS\n• Communication and collaboration\n• Organisation and problem-solving\n• Digital literacy and continuous learning\n\nEXPERIENCE\n[Job title] — [Organisation] | [Dates]\n• Describe a result using an action verb and a measurable outcome.\n\nEDUCATION\n[Qualification] — [Institution] | [Year]\n\nLANGUAGES\n[Add languages and honest proficiency levels]`,
      essay:`Title: ${subject}\n\nIntroduction\n${subject} is an important topic that affects individuals and communities. This short essay considers its main value and one practical challenge.\n\nMain argument\nFirst, it is useful to examine the evidence and the people affected. For example, a clear plan, access to information and cooperation can help communities make progress. However, solutions should be realistic and inclusive.\n\nConclusion\nIn conclusion, ${subject} deserves thoughtful attention. Small, well-planned actions can create lasting improvement when people measure results and learn from experience.`,
      speech:`Good morning, everyone.\n\nThank you for joining me. Today I would like to speak about ${subject}. This matters because our choices influence how we learn, work and support one another.\n\nI invite you to consider one practical action: share what works, listen to different experiences and review our progress together.\n\nThank you for your attention. I welcome your questions.`,
      presentation:`PRESENTATION: ${subject}\n\nSlide 1 — Purpose\nWhat we want the audience to understand.\n\nSlide 2 — Context\nThe current situation and why it matters.\n\nSlide 3 — Key points\n• Main idea one\n• Main idea two\n• Evidence or example\n\nSlide 4 — Recommendation\nA practical next step, responsible person and timeline.\n\nSlide 5 — Questions\nThank you. What would you like to discuss?`
    },
    pt:{
      email:`Assunto: ${subject}\n\nCaro/a ${to},\n\nEspero que esteja bem. Escrevo a propósito de ${subject}. Gostaria de ter a oportunidade de conversar melhor sobre este assunto. Por favor, indique-me um horário conveniente.\n\nAgradeço o seu tempo e atenção.\n\nCom os melhores cumprimentos,\n${who}`,
      letter:`${who}\n[Morada]\n[Data]\n\nCaro/a ${to},\n\nEscrevo para partilhar algumas ideias sobre ${subject}. Valorizo uma comunicação clara, soluções práticas e colaboração respeitosa. Agradecia a sua resposta quando lhe for conveniente.\n\nCom os melhores cumprimentos,\n${who}`,
      cv:`${who}\n${job} | Maputo, Moçambique\n\nPERFIL PROFISSIONAL\nProfissional motivado/a, com compromisso com a aprendizagem, o trabalho em equipa e um serviço de qualidade.\n\nCOMPETÊNCIAS\n• Comunicação e colaboração\n• Organização e resolução de problemas\n• Literacia digital e aprendizagem contínua\n\nEXPERIÊNCIA\n[Cargo] — [Organização] | [Datas]\n• Descreva um resultado com uma acção e um indicador concreto.\n\nFORMAÇÃO\n[Qualificação] — [Instituição] | [Ano]\n\nIDIOMAS\n[Indique os idiomas e níveis de forma verdadeira]`,
      essay:`Título: ${subject}\n\nIntrodução\n${subject} é um tema importante para as pessoas e para as comunidades. Este texto apresenta o seu valor e um desafio prático.\n\nDesenvolvimento\nEm primeiro lugar, é útil observar as evidências e as pessoas afectadas. Por exemplo, um plano claro, acesso à informação e cooperação podem ajudar uma comunidade a progredir. As soluções devem ser realistas e inclusivas.\n\nConclusão\nEm conclusão, ${subject} merece atenção cuidadosa. Acções pequenas e bem planeadas podem produzir melhorias duradouras quando avaliamos os resultados e aprendemos com a experiência.`,
      speech:`Bom dia a todos.\n\nAgradeço a vossa presença. Hoje gostaria de falar sobre ${subject}. Este tema é importante porque as nossas escolhas influenciam a forma como aprendemos, trabalhamos e apoiamos uns aos outros.\n\nConvido-vos a considerar uma acção prática: partilhar o que funciona, ouvir experiências diferentes e rever o progresso em conjunto.\n\nObrigado/a pela atenção. Estou disponível para perguntas.`,
      presentation:`APRESENTAÇÃO: ${subject}\n\nSlide 1 — Objectivo\nO que queremos que o público compreenda.\n\nSlide 2 — Contexto\nSituação actual e por que é importante.\n\nSlide 3 — Pontos principais\n• Ideia principal um\n• Ideia principal dois\n• Evidência ou exemplo\n\nSlide 4 — Recomendação\nPróximo passo, responsável e prazo.\n\nSlide 5 — Perguntas\nObrigado/a. O que gostariam de discutir?`
    }
  };
  const lang=language==='pt'?'pt':'en';
  const draft=templates[lang][type]||templates[lang].email;
  return {text:draft,language:lang,notice:language==='pt'||language==='en'?'Rascunho editável gerado por modelo local.':'Gerador local disponível em português e inglês; ligue um serviço de tradução para outros idiomas.'};
}

export function scoreLevelFromXP(xp=0){
  const points=Number(xp)||0;
  if(points<100)return {name:'Explorador',next:100,progress:Math.round(points/100*100)};
  if(points<350)return {name:'Aprendiz',next:350,progress:Math.round((points-100)/250*100)};
  if(points<800)return {name:'Comunicador',next:800,progress:Math.round((points-350)/450*100)};
  return {name:'Poliglota em construção',next:null,progress:100};
}
export function getMedals({xp=0,lessons=0,words=0,streak=0,englishLessons=lessons}={}){
  return [
    {id:'first-lesson',title:'Primeiro passo',icon:'✦',earned:lessons>=1,detail:'Conclui a tua primeira lição.'},
    {id:'word-10',title:'Coleccionador de palavras',icon:'Aa',earned:words>=10,detail:'Marca 10 palavras como aprendidas.'},
    {id:'streak-3',title:'Ritmo constante',icon:'🔥',earned:streak>=3,detail:'Estuda em 3 dias consecutivos.'},
    {id:'xp-500',title:'500 XP',icon:'◆',earned:xp>=500,detail:'Acumula 500 pontos de experiência.'},
    {id:'course-12',title:'Ciclo completo',icon:'🏅',earned:englishLessons>=12,detail:'Conclui as 12 lições da trilha inglesa.'}
  ];
}
