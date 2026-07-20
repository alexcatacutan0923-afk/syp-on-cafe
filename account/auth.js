const API = "/api/v3";
const tokenKey = "sypAccountToken";

async function api(payload){
  const res = await fetch(API,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(payload)});
  let data; try{data=await res.json();}catch{throw new Error("Invalid server response.")}
  return data;
}
function msg(text,type="error"){const box=document.getElementById("message");box.textContent=text;box.className=`msg show ${type}`;}
function clearMsg(){document.getElementById("message").className="msg";}
function setBusy(btn,busy,label){btn.disabled=busy;btn.textContent=busy?"Please wait…":label;}
function showView(id){document.querySelectorAll(".view").forEach(v=>v.classList.remove("active"));document.querySelectorAll(".tab").forEach(v=>v.classList.remove("active"));document.getElementById(id).classList.add("active");document.querySelector(`[data-view='${id}']`)?.classList.add("active");clearMsg();}
function saveToken(token){localStorage.setItem(tokenKey,token)}
function getToken(){return localStorage.getItem(tokenKey)||""}
function clearToken(){localStorage.removeItem(tokenKey)}
function initials(name){return String(name||"S").split(/\s+/).slice(0,2).map(x=>x[0]).join("").toUpperCase()}
function renderAccount(c){document.getElementById("authPanel").style.display="none";const d=document.getElementById("dashboard");d.classList.add("show");document.getElementById("avatar").textContent=initials(c.name);document.getElementById("memberName").textContent=c.name;document.getElementById("memberId").textContent=c.id;document.getElementById("memberMobile").textContent=c.mobileMasked||"";document.getElementById("stampCount").textContent=c.stamps;document.getElementById("remaining").textContent=c.rewardReady?"Ready!":c.remaining;document.getElementById("totalStamps").textContent=c.totalStamps||c.stamps;document.getElementById("referrals").textContent=c.referrals||0;const wrap=document.getElementById("stamps");wrap.innerHTML="";for(let i=0;i<10;i++){const s=document.createElement("div");s.className="stamp"+(i<Math.min(Number(c.stamps)||0,10)?" filled":"");s.textContent=i<Math.min(Number(c.stamps)||0,10)?"☕":"";wrap.appendChild(s)}document.getElementById("rewardText").textContent=c.rewardReady?"🎉 FREE DRINK READY":"Keep sipping — "+c.remaining+" stamp(s) to go!";}
async function loadAccount(){const token=getToken();if(!token)return;try{const r=await api({action:"getAccount",token});if(r.success)renderAccount(r.customer);else clearToken();}catch{}}

document.querySelectorAll(".tab").forEach(b=>b.addEventListener("click",()=>showView(b.dataset.view)));
document.querySelectorAll(".show-pass").forEach(b=>b.addEventListener("click",()=>{const input=b.parentElement.querySelector("input");input.type=input.type==="password"?"text":"password";b.textContent=input.type==="password"?"Show":"Hide";}));

document.getElementById("loginBtn").addEventListener("click",async()=>{clearMsg();const btn=loginBtn;setBusy(btn,true,"Log In");try{const r=await api({action:"loginAccount",mobile:loginMobile.value,password:loginPassword.value});if(!r.success)throw new Error(r.message);saveToken(r.token);renderAccount(r.customer);}catch(e){msg(e.message)}finally{setBusy(btn,false,"Log In")}});
document.getElementById("registerBtn").addEventListener("click",async()=>{clearMsg();if(regPassword.value!==regConfirm.value){msg("Passwords do not match.");return}const btn=registerBtn;setBusy(btn,true,"Create Account");try{const r=await api({action:"registerAccount",name:regName.value,mobile:regMobile.value,birthday:regBirthday.value,password:regPassword.value,referrer:new URLSearchParams(location.search).get("ref")||""});if(!r.success){if(r.code==="EXISTING_MEMBER"){activateId.value=r.customerId||"";activateMobile.value=regMobile.value;showView("activateView");msg(r.message+" Found: "+(r.maskedName||""));return}throw new Error(r.message)}saveToken(r.token);renderAccount(r.customer);}catch(e){msg(e.message)}finally{setBusy(btn,false,"Create Account")}});
document.getElementById("activateBtn").addEventListener("click",async()=>{clearMsg();if(activatePassword.value!==activateConfirm.value){msg("Passwords do not match.");return}const btn=activateBtn;setBusy(btn,true,"Activate Membership");try{const r=await api({action:"activateAccount",customerId:activateId.value,mobile:activateMobile.value,birthday:activateBirthday.value,password:activatePassword.value});if(!r.success)throw new Error(r.message);saveToken(r.token);renderAccount(r.customer);}catch(e){msg(e.message)}finally{setBusy(btn,false,"Activate Membership")}});
document.getElementById("logoutBtn").addEventListener("click",async()=>{const token=getToken();clearToken();try{await api({action:"logoutAccount",token})}catch{}location.reload()});
loadAccount();
