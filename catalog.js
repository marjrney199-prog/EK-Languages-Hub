export const LANGUAGES=[
  {id:'en',name:'English',native:'English',flag:'🇬🇧',voice:'en-GB',availability:'full'},
  {id:'pt',name:'Portuguese',native:'Português',flag:'🇲🇿',voice:'pt-MZ',availability:'starter'},
  {id:'fr',name:'French',native:'Français',flag:'🇫🇷',voice:'fr-FR',availability:'starter'},
  {id:'es',name:'Spanish',native:'Español',flag:'🇪🇸',voice:'es-ES',availability:'starter'},
  {id:'de',name:'German',native:'Deutsch',flag:'🇩🇪',voice:'de-DE',availability:'starter'},
  {id:'it',name:'Italian',native:'Italiano',flag:'🇮🇹',voice:'it-IT',availability:'starter'},
  {id:'ar',name:'Arabic',native:'العربية',flag:'🇸🇦',voice:'ar-SA',availability:'starter',dir:'rtl'},
  {id:'zh',name:'Chinese',native:'中文 · 普通话',flag:'🇨🇳',voice:'zh-CN',availability:'starter'},
  {id:'sw',name:'Swahili',native:'Kiswahili',flag:'🇹🇿',voice:'sw-TZ',availability:'starter'}
];
export const FUTURE_LANGUAGES=['Changana','Ronga','Macua','Sena','Ndau','Tsonga','Zulu','Outras línguas africanas'];
export const LEVELS=[
  {id:'A1',name:'Iniciante',detail:'Saudações, frases essenciais e primeiros passos.'},
  {id:'A2',name:'Elementar',detail:'Rotinas, viagens e interacções do dia-a-dia.'},
  {id:'B1',name:'Intermédio',detail:'Comunicação autónoma e situações reais.'},
  {id:'B2',name:'Intermédio superior',detail:'Argumentação, estudo e comunicação profissional.'},
  {id:'C1',name:'Avançado',detail:'Fluência, precisão e registos especializados.'},
  {id:'C2',name:'Proficiência',detail:'Domínio flexível e nuances da língua.'}
];
export const PHRASES=[
  {id:'hello',category:'greetings',en:'Hello!',pt:'Olá!',fr:'Bonjour !',es:'¡Hola!',de:'Hallo!',it:'Ciao!',ar:'مرحباً!',zh:'你好！',sw:'Habari!',pron:{en:'heh-LOH',fr:'bohn-ZHOOR',es:'OH-la',de:'ha-LOH',it:'CHOW',ar:'mar-ha-ban',zh:'nǐ hǎo',sw:'ha-BA-ri'}},
  {id:'morning',category:'greetings',en:'Good morning.',pt:'Bom dia.',fr:'Bonjour.',es:'Buenos días.',de:'Guten Morgen.',it:'Buongiorno.',ar:'صباح الخير.',zh:'早上好。',sw:'Habari za asubuhi.',pron:{en:'gud MOR-ning',fr:'bohn-ZHOOR',es:'BWE-nos DEE-as',de:'GOO-ten MOR-gen',it:'bwon-JOR-no',ar:'sa-ba-h al-khayr',zh:'zǎo shang hǎo',sw:'ha-BA-ri za a-su-BU-hi'}},
  {id:'evening',category:'greetings',en:'Good evening.',pt:'Boa noite. (ao cumprimentar)',fr:'Bonsoir.',es:'Buenas noches.',de:'Guten Abend.',it:'Buonasera.',ar:'مساء الخير.',zh:'晚上好。',sw:'Habari za jioni.',pron:{en:'gud EEV-ning',fr:'bohn-SWAHR',es:'BWE-nas NO-ches',de:'GOO-ten AH-bent',it:'bwo-na-SE-ra',ar:'ma-saa al-khayr',zh:'wǎn shàng hǎo',sw:'ha-BA-ri za ji-O-ni'}},
  {id:'how-are-you',category:'greetings',en:'How are you?',pt:'Como estás?',fr:'Comment allez-vous ?',es:'¿Cómo estás?',de:'Wie geht es dir?',it:'Come stai?',ar:'كيف حالك؟',zh:'你好吗？',sw:'Habari yako?',pron:{en:'hau ar yoo',fr:'ko-mon-ta-ley voo',es:'KO-mo es-TAS',de:'vee gayt es deer',it:'KO-meh stai',ar:'kay-fa haa-luk',zh:'nǐ hǎo ma',sw:'ha-BA-ri YA-ko'}},
  {id:'fine-thanks',category:'greetings',en:'I am fine, thank you.',pt:'Estou bem, obrigado/a.',fr:'Je vais bien, merci.',es:'Estoy bien, gracias.',de:'Mir geht es gut, danke.',it:'Sto bene, grazie.',ar:'أنا بخير، شكراً.',zh:'我很好，谢谢。',sw:'Sijambo, asante.',pron:{en:'ai am fain, thank yoo',fr:'zhuh vay byan mehr-SEE',es:'es-TOY byen GRA-syas',de:'meer gayt es goot DAN-keh',it:'sto BEH-neh GRA-tsyeh',ar:'a-na bikhayr shukran',zh:'wǒ hěn hǎo, xièxie',sw:'si-JAM-bo a-SAN-te'}},
  {id:'nice-meet',category:'greetings',en:'Nice to meet you.',pt:'Prazer em conhecer-te.',fr:'Ravi(e) de vous rencontrer.',es:'Mucho gusto.',de:'Freut mich, dich kennenzulernen.',it:'Piacere di conoscerti.',ar:'سعيد بلقائك.',zh:'很高兴认识你。',sw:'Nimefurahi kukutana nawe.',pron:{en:'nais tuh meet yoo',fr:'ra-vee duh voo ron-kon-tray',es:'MU-cho GUS-to',de:'froyt mikh dikh ken-en-tsu-ler-nen',it:'pya-CHE-re di ko-NO-sher-ti',ar:'sa-eed bi-li-qa-ik',zh:'hěn gāoxìng rènshi nǐ',sw:'ni-me-fu-RA-hi ku-ku-TA-na na-we'}},
  {id:'please',category:'politeness',en:'Please.',pt:'Por favor.',fr:'S’il vous plaît.',es:'Por favor.',de:'Bitte.',it:'Per favore.',ar:'من فضلك.',zh:'请。',sw:'Tafadhali.',pron:{en:'pleez',fr:'seel voo pleh',es:'por fa-VOR',de:'BIT-teh',it:'per fa-VO-re',ar:'min fad-lik',zh:'qǐng',sw:'ta-fa-DHA-li'}},
  {id:'thank-you',category:'politeness',en:'Thank you.',pt:'Obrigado/a.',fr:'Merci.',es:'Gracias.',de:'Danke.',it:'Grazie.',ar:'شكراً.',zh:'谢谢。',sw:'Asante.',pron:{en:'thank yoo',fr:'mehr-SEE',es:'GRA-syas',de:'DAN-keh',it:'GRA-tsyeh',ar:'shukran',zh:'xièxie',sw:'a-SAN-te'}},
  {id:'welcome',category:'politeness',en:'You are welcome.',pt:'De nada.',fr:'Je vous en prie.',es:'De nada.',de:'Gern geschehen.',it:'Prego.',ar:'على الرحب والسعة.',zh:'不客气。',sw:'Karibu.',pron:{en:'yoo ar WEL-kum',fr:'zhuh voo zon pree',es:'de NA-da',de:'gern ge-SHEH-en',it:'PRE-go',ar:'a-la ar-rahb wa-s-sa-a',zh:'bú kèqi',sw:'ka-RI-bu'}},
  {id:'yes',category:'essentials',en:'Yes.',pt:'Sim.',fr:'Oui.',es:'Sí.',de:'Ja.',it:'Sì.',ar:'نعم.',zh:'是。',sw:'Ndiyo.',pron:{en:'yes',fr:'wee',es:'see',de:'yah',it:'see',ar:'na-am',zh:'shì',sw:'n-DEE-yo'}},
  {id:'no',category:'essentials',en:'No.',pt:'Não.',fr:'Non.',es:'No.',de:'Nein.',it:'No.',ar:'لا.',zh:'不是。',sw:'Hapana.',pron:{en:'noh',fr:'non',es:'no',de:'nine',it:'no',ar:'laa',zh:'bú shì',sw:'ha-PA-na'}},
  {id:'excuse-me',category:'essentials',en:'Excuse me.',pt:'Com licença.',fr:'Excusez-moi.',es:'Perdone.',de:'Entschuldigung.',it:'Mi scusi.',ar:'عذراً.',zh:'不好意思。',sw:'Samahani.',pron:{en:'ik-SKYOOZ mee',fr:'ex-kew-zay mwa',es:'per-DO-ne',de:'ent-SHOOL-di-gung',it:'mee SKOO-zee',ar:'uth-ran',zh:'bù hǎoyìsi',sw:'sa-ma-HA-ni'}},
  {id:'dont-understand',category:'conversation',en:'I do not understand.',pt:'Não compreendo.',fr:'Je ne comprends pas.',es:'No entiendo.',de:'Ich verstehe nicht.',it:'Non capisco.',ar:'لا أفهم.',zh:'我不明白。',sw:'Sielewi.',pron:{en:'ai doo not un-der-STAND',fr:'zhuh nuh kom-pron pah',es:'no en-TYEN-do',de:'ikh fer-SHTAY-eh nikht',it:'non ka-PEES-ko',ar:'laa af-ham',zh:'wǒ bù míngbai',sw:'si-e-LE-wi'}},
  {id:'slowly',category:'conversation',en:'Could you speak slowly, please?',pt:'Pode falar devagar, por favor?',fr:'Pourriez-vous parler lentement, s’il vous plaît ?',es:'¿Podría hablar despacio, por favor?',de:'Könnten Sie bitte langsam sprechen?',it:'Potrebbe parlare lentamente, per favore?',ar:'هل يمكنك التحدث ببطء، من فضلك؟',zh:'请您说慢一点，好吗？',sw:'Unaweza kuzungumza polepole, tafadhali?',pron:{en:'kud yoo speek SLOH-lee pleez',fr:'poo-ree-ay voo par-lay lont-mon',es:'po-DREE-a a-BLAR des-PA-syo',de:'KERN-ten zee BIT-te LANG-zam SHPRE-khen',it:'po-TREB-be par-LA-re len-ta-MEN-te',ar:'hal yum-ki-nuk at-ta-had-duth bi-but',zh:'qǐng màn yìdiǎn shuō',sw:'u-na-we-ZA ku-zu-NGUM-za po-le-PO-le'}},
  {id:'my-name',category:'introductions',en:'My name is…',pt:'O meu nome é…',fr:'Je m’appelle…',es:'Me llamo…',de:'Ich heiße…',it:'Mi chiamo…',ar:'اسمي…',zh:'我叫……',sw:'Jina langu ni…',pron:{en:'mai naym iz',fr:'zhuh ma-pel',es:'me YA-mo',de:'ikh HAI-se',it:'mee KYA-mo',ar:'is-mee',zh:'wǒ jiào',sw:'JI-na LA-ngu ni'}},
  {id:'need-help',category:'travel',en:'I need help.',pt:'Preciso de ajuda.',fr:'J’ai besoin d’aide.',es:'Necesito ayuda.',de:'Ich brauche Hilfe.',it:'Ho bisogno di aiuto.',ar:'أحتاج إلى مساعدة.',zh:'我需要帮助。',sw:'Ninahitaji msaada.',pron:{en:'ai need help',fr:'zhay buh-zwan ded',es:'ne-se-SEE-to a-YU-da',de:'ikh BROW-khe HIL-fe',it:'o bi-ZO-nyo di a-YU-to',ar:'ahtaaju ilaa musaa-ada',zh:'wǒ xūyào bāngzhù',sw:'ni-na-hi-TA-ji msa-A-da'}},
  {id:'bathroom',category:'travel',en:'Where is the bathroom?',pt:'Onde fica a casa de banho?',fr:'Où sont les toilettes ?',es:'¿Dónde está el baño?',de:'Wo ist die Toilette?',it:'Dov’è il bagno?',ar:'أين الحمام؟',zh:'洗手间在哪里？',sw:'Choo kiko wapi?',pron:{en:'wair iz thuh BATH-room',fr:'oo son lay twa-let',es:'DON-de es-TA el BA-nyo',de:'vo ist dee toa-LET-te',it:'do-VE il BA-nyo',ar:'ay-na al-ham-maam',zh:'xǐshǒujiān zài nǎlǐ',sw:'choo KI-ko WA-pi'}},
  {id:'cost',category:'travel',en:'How much does this cost?',pt:'Quanto custa isto?',fr:'Combien ça coûte ?',es:'¿Cuánto cuesta esto?',de:'Wie viel kostet das?',it:'Quanto costa?',ar:'كم ثمن هذا؟',zh:'这个多少钱？',sw:'Hii ni bei gani?',pron:{en:'hau much duz this kost',fr:'kom-byan sa koot',es:'KWAN-to KWES-ta ES-to',de:'vee feel KOS-tet das',it:'KWAN-to KOS-ta',ar:'kam tha-ma-nu ha-tha',zh:'zhège duōshǎo qián',sw:'hii ni bei GA-ni'}},
  {id:'water',category:'daily-life',en:'I would like some water, please.',pt:'Queria água, por favor.',fr:'Je voudrais de l’eau, s’il vous plaît.',es:'Quisiera agua, por favor.',de:'Ich hätte gern Wasser, bitte.',it:'Vorrei dell’acqua, per favore.',ar:'أريد بعض الماء، من فضلك.',zh:'请给我一些水。',sw:'Ningependa maji, tafadhali.',pron:{en:'ai wood laik sum WAW-ter pleez',fr:'zhuh voo-dray duh loh',es:'ki-SYE-ra A-gwa',de:'ikh HET-te gern VAS-ser',it:'vor-RAY del-AK-kwa',ar:'u-ree-du bad al-maa',zh:'qǐng gěi wǒ yìxiē shuǐ',sw:'ni-nge-PEN-da MA-ji ta-fa-DHA-li'}},
  {id:'goodbye',category:'greetings',en:'See you soon.',pt:'Até breve.',fr:'À bientôt.',es:'Hasta pronto.',de:'Bis bald.',it:'A presto.',ar:'أراك قريباً.',zh:'回头见。',sw:'Tutaonana hivi karibuni.',pron:{en:'see yoo soon',fr:'ah byan-toh',es:'AS-ta PRON-to',de:'bis balt',it:'a PRES-to',ar:'a-raak qa-ree-ban',zh:'huítóu jiàn',sw:'tu-ta-o-NA-na hi-vi ka-ri-BU-ni'}}
];
export const COURSE_CATEGORIES=[
  {id:'greetings',title:'Saudações e apresentação',icon:'✦'},
  {id:'politeness',title:'Cortesia e boas maneiras',icon:'◇'},
  {id:'essentials',title:'Palavras essenciais',icon:'◈'},
  {id:'introductions',title:'Apresentações',icon:'◎'},
  {id:'conversation',title:'Conversação',icon:'↗'},
  {id:'travel',title:'Viagens e orientação',icon:'⌁'},
  {id:'daily-life',title:'Vida quotidiana',icon:'⌂'}
];
export const COMMON_WORD_RELATIONS={
  good:{synonyms:['fine','well','excellent'],antonyms:['bad','poor']},
  big:{synonyms:['large','huge','great'],antonyms:['small','tiny']},
  small:{synonyms:['little','tiny','compact'],antonyms:['big','large']},
  happy:{synonyms:['glad','pleased','joyful'],antonyms:['sad','unhappy']},
  sad:{synonyms:['unhappy','down','upset'],antonyms:['happy','cheerful']},
  fast:{synonyms:['quick','rapid','swift'],antonyms:['slow']},
  slow:{synonyms:['unhurried','gradual'],antonyms:['fast','quick']},
  easy:{synonyms:['simple','straightforward'],antonyms:['difficult','hard']},
  difficult:{synonyms:['hard','challenging'],antonyms:['easy','simple']},
  beautiful:{synonyms:['lovely','attractive','pretty'],antonyms:['ugly']},
  begin:{synonyms:['start','commence'],antonyms:['finish','end']},
  start:{synonyms:['begin','commence'],antonyms:['finish','stop']},
  finish:{synonyms:['end','complete'],antonyms:['begin','start']},
  love:{synonyms:['adore','care for'],antonyms:['hate']},
  hate:{synonyms:['detest','dislike'],antonyms:['love','like']},
  old:{synonyms:['aged','elderly'],antonyms:['new','young']},
  young:{synonyms:['youthful','junior'],antonyms:['old','elderly']},
  rich:{synonyms:['wealthy','affluent'],antonyms:['poor']},
  poor:{synonyms:['needy','impoverished'],antonyms:['rich','wealthy']},
  clean:{synonyms:['tidy','spotless'],antonyms:['dirty']},
  dirty:{synonyms:['unclean','messy'],antonyms:['clean']},
  strong:{synonyms:['powerful','robust'],antonyms:['weak']},
  weak:{synonyms:['frail','feeble'],antonyms:['strong']},
  important:{synonyms:['significant','essential'],antonyms:['unimportant','trivial']},
  friend:{synonyms:['companion','mate'],antonyms:['enemy']},
  brave:{synonyms:['courageous','bold'],antonyms:['afraid','cowardly']},
  quiet:{synonyms:['silent','peaceful'],antonyms:['loud','noisy']},
  noisy:{synonyms:['loud','boisterous'],antonyms:['quiet','silent']}
};
