const KEY='ek-language-hub-state-v1';
const DEFAULTS={
  name:'Estudante EK',theme:'light',courseLang:'en',nativeLang:'pt',courseLevel:'A1',
  xp:0,streak:0,lastStudy:'',activityDays:[],completedLessons:[],learnedWords:[],everLearnedWords:[],bookmarks:[],
  history:[],chat:[],plan:'free',paymentPhones:{mpesa:'866309994',emola:'843933721'},
  premiumRequest:null,sessions:0,quizScores:{},createdDocuments:[],noticeDismissed:false
};
const copy=value=>JSON.parse(JSON.stringify(value));
function getToday(){const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;}
function daysBetween(a,b){return Math.round((new Date(`${b}T00:00:00`)-new Date(`${a}T00:00:00`))/86400000);}

export function createStore(storage=globalThis.localStorage){
  let data=copy(DEFAULTS);
  try{
    const raw=storage?.getItem(KEY);
    if(raw){
      const saved=JSON.parse(raw);
      data={...data,...saved,paymentPhones:{...DEFAULTS.paymentPhones,...(saved.paymentPhones||{})}};
    }
  }catch(e){/* continue with safe in-memory defaults */}
  for(const key of ['activityDays','completedLessons','learnedWords','bookmarks','history','chat','createdDocuments'])if(!Array.isArray(data[key]))data[key]=[];
  if(!Array.isArray(data.everLearnedWords))data.everLearnedWords=[...data.learnedWords];
  if(!data.quizScores||typeof data.quizScores!=='object')data.quizScores={};
  const persist=()=>{try{storage?.setItem(KEY,JSON.stringify(data));}catch(e){/* private mode/storage limits: continue in memory */}};
  return {
    get state(){return data;},
    save:persist,
    update(patch){data={...data,...patch};persist();return data;},
    addActivity(points=0){
      const today=getToday();
      if(data.lastStudy!==today){
        data.streak=data.lastStudy&&daysBetween(data.lastStudy,today)===1?(data.streak||0)+1:1;
        data.lastStudy=today;
      }
      data.activityDays=[...new Set([...(data.activityDays||[]),today])].slice(-90);
      data.xp=(data.xp||0)+points;data.sessions=(data.sessions||0)+1;persist();
      return data;
    },
    completeLesson(id){
      if(!data.completedLessons.includes(id)){
        data.completedLessons.push(id);this.addActivity(20);return true;
      }
      return false;
    },
    toggleWord(id){
      const index=data.learnedWords.indexOf(id);
      if(index>=0){data.learnedWords.splice(index,1);persist();return {added:false,awarded:false};}
      data.learnedWords.push(id);
      const awarded=!data.everLearnedWords.includes(id);
      if(awarded){data.everLearnedWords.push(id);this.addActivity(2);}else persist();
      return {added:true,awarded};
    },
    toggleBookmark(id){
      const index=data.bookmarks.indexOf(id);
      if(index>=0)data.bookmarks.splice(index,1);else data.bookmarks.push(id);
      persist();return index<0;
    },
    addHistory(entry){data.history=[entry,...data.history].slice(0,40);persist();},
    addChatMessage(message){data.chat=[...data.chat,message].slice(-40);persist();},
    reset(){data=copy(DEFAULTS);persist();return data;}
  };
}
export const store=createStore();
