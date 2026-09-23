
let page=1, music=document.getElementById('music');
let timers=[];
music.addEventListener('ended',()=>{music.currentTime=0;music.play().catch(()=>{});});

function clearTimers(){timers.forEach(clearTimeout);timers=[]}
function go(n){
  n=Math.max(1,Math.min(21,n)); page=n; clearTimers();
  document.querySelectorAll('.page').forEach(x=>x.classList.remove('active'));
  const el=document.getElementById('p'+n); if(el) el.classList.add('active');
  if(n===1){}
  if(n===2) timers.push(setTimeout(()=>go(3),7000));
  if(n===4) drawFlowerAnimated();
  if(n===6) runAge();
  if(n===8) timers.push(setTimeout(()=>go(9),8000));
  if(n===9) timers.push(setTimeout(()=>go(10),8000));
  if(n===10) timers.push(setTimeout(()=>go(11),8000));
  if(n===11) timers.push(setTimeout(()=>go(12),7000));
  if(n===12) timers.push(setTimeout(()=>go(13),7000));
  if(n===13) timers.push(setTimeout(()=>go(14),8000));
  if(n===14) runCountdown();
  if(n===15) runParty();
  if(n===16){runFireworks();timers.push(setTimeout(()=>go(17),10000));}
  if(n===17) runStars();
  if(n===18){runFlowerShower();timers.push(setTimeout(()=>go(19),15000));}
  if(n===19) timers.push(setTimeout(()=>go(20),8000));
  if(n===20) timers.push(setTimeout(()=>go(21),8000));
}
function start(yes){
  if(!yes)document.getElementById('nope').style.display='block';
  music.play().catch(()=>{});
  timers.push(setTimeout(()=>go(2),yes?500:3000));
}
const hold=document.getElementById('hold'); let holding=false, holdTimer, holdStart=0;
if(hold){
 hold.addEventListener('pointerdown',(e)=>{e.preventDefault(); holding=true; holdStart=Date.now(); document.getElementById('holdmsg').style.display='block'; clearTimeout(holdTimer); holdTimer=setTimeout(()=>{if(holding)go(4)},1200);});
 hold.addEventListener('pointerup',(e)=>{e.preventDefault(); if(!holding)return; holding=false; clearTimeout(holdTimer); if(Date.now()-holdStart<1100) go(4);});
 hold.addEventListener('pointercancel',()=>{holding=false;clearTimeout(holdTimer)});
}
const bt=document.getElementById('birthTime');
if(bt) bt.addEventListener('change',()=>{
 const v=bt.value;if(!v)return;
 document.getElementById('gvalue').value=v;
 document.getElementById('gform').submit();
 document.getElementById('saved').textContent='Unlocked ❤️';
 timers.push(setTimeout(()=>go(6),800));
});

function runAge(){
 const bt=document.getElementById('birthTime');
 if(!bt || !bt.value)return;
 const [bh,bm]=bt.value.split(':').map(Number);

 // Birth time is entered in India Standard Time (Asia/Kolkata).
 // The entire age breakdown is recalculated from the exact birth timestamp
 // every second, including the year/month/day boundaries.
 const fmt=new Intl.DateTimeFormat('en-CA',{
   timeZone:'Asia/Kolkata',year:'numeric',month:'2-digit',day:'2-digit',
   hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'
 });
 function nowParts(){
   const o={};
   for(const p of fmt.formatToParts(new Date())){
     if(p.type!=='literal') o[p.type]=Number(p.value);
   }
   return o;
 }
 function daysInMonth(y,m){ return new Date(Date.UTC(y,m,0)).getUTCDate(); }
 function istToMs(y,m,d,h=0,mi=0,s=0){
   return Date.UTC(y,m-1,d,h,mi,s)-330*60*1000;
 }
 function addMonthsWall(y,m,d,months){
   const total=(y*12+(m-1))+months;
   const ny=Math.floor(total/12), nm=(total%12)+1;
   return {y:ny,m:nm,d:Math.min(d,daysInMonth(ny,nm))};
 }
 function exactAge(n){
   const nowMs=istToMs(n.year,n.month,n.day,n.hour,n.minute,n.second);
   const birthMs=istToMs(2005,6,6,bh,bm,0);
   if(nowMs<birthMs) return {years:0,months:0,days:0,hours:0,minutes:0,seconds:0,totalSec:0};

   // Find the largest whole number of calendar years that has actually elapsed.
   let years=n.year-2005;
   let anchor=addMonthsWall(2005,6,6,years*12);
   let anchorMs=istToMs(anchor.y,anchor.m,anchor.d,bh,bm,0);
   if(anchorMs>nowMs){ years--; anchor=addMonthsWall(2005,6,6,years*12); anchorMs=istToMs(anchor.y,anchor.m,anchor.d,bh,bm,0); }

   // Then find the whole calendar months since that anniversary.
   let months=(n.year-anchor.y)*12+(n.month-anchor.m);
   let monthAnchor=addMonthsWall(anchor.y,anchor.m,anchor.d,months);
   let monthMs=istToMs(monthAnchor.y,monthAnchor.m,monthAnchor.d,bh,bm,0);
   if(monthMs>nowMs){ months--; monthAnchor=addMonthsWall(anchor.y,anchor.m,anchor.d,months); monthMs=istToMs(monthAnchor.y,monthAnchor.m,monthAnchor.d,bh,bm,0); }

   const remainingSec=Math.max(0,Math.floor((nowMs-monthMs)/1000));
   const days=Math.floor(remainingSec/86400);
   const hours=Math.floor((remainingSec%86400)/3600);
   const minutes=Math.floor((remainingSec%3600)/60);
   const seconds=remainingSec%60;
   const totalSec=Math.max(0,Math.floor((nowMs-birthMs)/1000));
   return {years,months,days,hours,minutes,seconds,totalSec};
 }
 function update(){
   const n=nowParts();
   const a=exactAge(n);
   const totalDays=Math.floor(a.totalSec/86400);
   const totalWeeks=Math.floor(totalDays/7);
   const weekDays=totalDays%7;

   document.getElementById('ageYears').textContent=a.years;
   document.getElementById('ageMonths').textContent=a.months;
   document.getElementById('ageDays').textContent=a.days;
   document.getElementById('ageWeeks').textContent=totalWeeks.toLocaleString();
   document.getElementById('ageWeekDays').textContent=weekDays;
   document.getElementById('ageHours').textContent=String(a.hours).padStart(2,'0');
   document.getElementById('ageMinutes').textContent=String(a.minutes).padStart(2,'0');
   document.getElementById('ageSeconds').textContent=String(a.seconds).padStart(2,'0');
   const live=document.getElementById('ageLiveLine');
   if(live) live.textContent=`${a.years} years, ${a.months} months, ${a.days} days, ${String(a.hours).padStart(2,'0')} hours, ${String(a.minutes).padStart(2,'0')} minutes, ${String(a.seconds).padStart(2,'0')} seconds — live ❤️`;
 }
 update();
 const iv=setInterval(()=>{if(page!==6){clearInterval(iv);return;}update()},1000);
 timers.push(iv);
 timers.push(setTimeout(()=>go(8),15000));
}
/* Flower: progressive drawing inspired by the supplied Turtle program.
   Petals appear ring-by-ring with a smooth scale/fade transition. */
function drawFlowerAnimated(){
 const c=document.getElementById('flower'); if(!c)return;
 const W=window.innerWidth,H=window.innerHeight,D=Math.min(devicePixelRatio||1,2);
 c.width=W*D;c.height=H*D;c.style.width='100vw';c.style.height='100dvh';
 const ctx=c.getContext('2d');ctx.setTransform(D,0,0,D,0,0);
 const cx=W/2, baseY=H*.84;
 const S=Math.min(W/390,H/760);
 const greens=['#527d5b','#6f9b68','#86ae72','#6f8f59'];
 const palette=[
  {type:'rose',col:'#d9467c'}, {type:'rose',col:'#c83d78'},
  {type:'tulip',col:'#f08bb1'}, {type:'tulip',col:'#e95d91'},
  {type:'daisy',col:'#fff1df',center:'#e7b34a'}, {type:'daisy',col:'#ffd7e5',center:'#e5a83e'},
  {type:'small',col:'#f6b7cf',center:'#e4a63f'}, {type:'rose',col:'#ef7fa9'},
  {type:'tulip',col:'#f4a1bb'}, {type:'daisy',col:'#fff8ee',center:'#d99a3d'},
  {type:'rose',col:'#d84d85'}, {type:'small',col:'#f4d38b',center:'#d98c45'}
 ];
 // Each tap unlocks one more flower. The bouquet reaches 21 flowers for her 21st birthday.
 const slots=[
  [-170,-205,-.30,.82],[-130,-255,-.24,.88],[-92,-305,-.17,.92],[-48,-340,-.08,1.00],[-4,-365,0,1.05],[42,-350,.08,.98],[88,-315,.15,.94],[132,-270,.23,.88],[172,-215,.30,.80],
  [-145,-165,-.24,.72],[-108,-205,-.16,.68],[-70,-235,-.09,.72],[-28,-250,-.03,.76],[15,-245,.04,.74],[55,-230,.10,.70],[96,-198,.17,.70],[137,-158,.23,.68],
  [-95,-120,-.16,.58],[-45,-145,-.08,.62],[8,-150,.03,.64],[62,-125,.12,.60]
 ];
 let flowers=[];
 let finished=false, finishTimer=null;
 let raf=0;
 const started=performance.now();
 function ease(t){return t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2}
 function drawStem(s,p){
   if(p<=0)return;
   const sx=cx+s.x*S*.24, sy=baseY+4*S, ex=cx+s.x*S, ey=baseY+s.y*S;
   ctx.save();ctx.globalAlpha=p;ctx.strokeStyle=s.green;ctx.lineWidth=3.5*S;ctx.lineCap='round';
   ctx.beginPath();ctx.moveTo(sx,sy);ctx.bezierCurveTo(sx+s.x*.22*S,baseY-70*S,ex-s.x*.08*S,ey+60*S,ex,ey);ctx.stroke();ctx.restore();
 }
 function leaf(px,py,ang,sc,p){
   ctx.save();ctx.translate(px,py);ctx.rotate(ang);ctx.globalAlpha=p;ctx.fillStyle='#79a56e';
   ctx.beginPath();ctx.moveTo(0,0);ctx.bezierCurveTo(18*S*sc,-15*S*sc,35*S*sc,-8*S*sc,43*S*sc,0);ctx.bezierCurveTo(28*S*sc,10*S*sc,12*S*sc,9*S*sc,0,0);ctx.fill();ctx.restore();
 }
 function daisy(px,py,r,col,center,p,rot){
   ctx.save();ctx.translate(px,py);ctx.rotate(rot);ctx.globalAlpha=p;const n=10;
   for(let i=0;i<n;i++){const a=i*Math.PI*2/n;ctx.save();ctx.rotate(a);ctx.fillStyle=col;ctx.beginPath();ctx.ellipse(0,-r*.55,r*.28,r*.62,0,0,Math.PI*2);ctx.fill();ctx.restore()}
   ctx.fillStyle=center;ctx.beginPath();ctx.arc(0,0,r*.27,0,Math.PI*2);ctx.fill();ctx.restore();
 }
 function tulip(px,py,r,col,p,rot){
   ctx.save();ctx.translate(px,py);ctx.rotate(rot);ctx.globalAlpha=p;ctx.fillStyle=col;
   ctx.beginPath();ctx.moveTo(-r*.7,0);ctx.bezierCurveTo(-r*.75,-r*.55,-r*.45,-r*.95,-r*.15,-r*.45);ctx.bezierCurveTo(0,-r*.85,r*.15,-r*.85,r*.35,-r*.42);ctx.bezierCurveTo(r*.58,-r*.9,r*.82,-r*.52,r*.7,0);ctx.bezierCurveTo(r*.5,r*.45,-r*.45,r*.5,-r*.7,0);ctx.fill();ctx.restore();
 }
 function rose(px,py,r,col,p,rot){
   ctx.save();ctx.translate(px,py);ctx.rotate(rot);ctx.globalAlpha=p;
   for(let k=4;k>=1;k--){const rr=r*(k/4),n=8+k*2;for(let i=0;i<n;i++){const a=i*Math.PI*2/n+k*.34;ctx.save();ctx.rotate(a);ctx.fillStyle=k===1?'#ffd4e3':col;ctx.globalAlpha=p*(.72+.07*k);ctx.beginPath();ctx.ellipse(0,-rr*.38,rr*.28,rr*.55,0,0,Math.PI*2);ctx.fill();ctx.restore()}}
   ctx.fillStyle='#f7c45d';ctx.beginPath();ctx.arc(0,0,r*.18,0,Math.PI*2);ctx.fill();ctx.restore();
 }
 function small(px,py,r,col,center,p,rot){daisy(px,py,r*.72,col,center,p,rot)}
 function wrap(p){
   ctx.save();ctx.globalAlpha=p;ctx.fillStyle='rgba(249,196,214,.88)';
   ctx.beginPath();ctx.moveTo(cx-160*S,baseY+5*S);ctx.lineTo(cx-92*S,baseY-148*S);ctx.lineTo(cx,baseY-105*S);ctx.lineTo(cx+92*S,baseY-148*S);ctx.lineTo(cx+160*S,baseY+5*S);ctx.lineTo(cx+72*S,baseY+70*S);ctx.lineTo(cx,baseY+40*S);ctx.lineTo(cx-72*S,baseY+70*S);ctx.closePath();ctx.fill();ctx.restore();
 }
 function bow(p){
   ctx.save();ctx.globalAlpha=p;ctx.translate(cx,baseY+18*S);ctx.fillStyle='#c83d78';
   ctx.beginPath();ctx.moveTo(0,0);ctx.bezierCurveTo(-72*S,-58*S,-125*S,-28*S,-95*S,8*S);ctx.bezierCurveTo(-65*S,42*S,-25*S,18*S,0,0);ctx.fill();
   ctx.beginPath();ctx.moveTo(0,0);ctx.bezierCurveTo(72*S,-58*S,125*S,-28*S,95*S,8*S);ctx.bezierCurveTo(65*S,42*S,25*S,18*S,0,0);ctx.fill();
   ctx.beginPath();ctx.moveTo(-13*S,-2*S);ctx.lineTo(-32*S,105*S);ctx.lineTo(-4*S,82*S);ctx.lineTo(5*S,-2*S);ctx.fill();
   ctx.beginPath();ctx.moveTo(13*S,-2*S);ctx.lineTo(32*S,105*S);ctx.lineTo(4*S,82*S);ctx.lineTo(-5*S,-2*S);ctx.fill();
   ctx.fillStyle='#a92d62';ctx.beginPath();ctx.arc(0,0,16*S,0,Math.PI*2);ctx.fill();ctx.restore();
 }
 function addFlower(){
   if(finished || flowers.length>=slots.length)return;
   const i=flowers.length, cfg=palette[i%palette.length], sl=slots[i];
   flowers.push({x:sl[0],y:sl[1],rot:sl[2],scale:sl[3],type:cfg.type,col:cfg.col,center:cfg.center||'#e7b34a',green:greens[i%greens.length],born:performance.now(),index:i});
   if(flowers.length>=21){
     clearTimeout(finishTimer);
     finishTimer=setTimeout(()=>{finished=true; if(page===4)go(5)},3600);
   }
 }
 function onPointer(e){
   e.preventDefault();addFlower();
 }
 c.addEventListener('pointerdown',onPointer,{passive:false});
 function frame(now){
   ctx.clearRect(0,0,W,H);
   // faint bouquet glow behind the flowers
   const g=ctx.createRadialGradient(cx,baseY-180*S,20*S,cx,baseY-180*S,260*S);
   g.addColorStop(0,'rgba(255,220,232,.55)');g.addColorStop(1,'rgba(255,250,240,0)');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
   const wrapP=ease(Math.min(1,Math.max(0,(flowers.length-1)/9)));
   flowers.forEach((s,i)=>{
     const p=ease(Math.min(1,Math.max(0,(now-s.born)/1300)));
     drawStem(s,p);
     const px=cx+s.x*S,py=baseY+s.y*S;
     if(i%2===0)leaf(px-12*S,py+48*S,-.65,.8,p*.82);
     if(i%3===0)leaf(px+8*S,py+25*S,.45,.65,p*.76);
     const r=43*S*s.scale*p;
     if(s.type==='rose')rose(px,py,r,s.col,p,s.rot);
     else if(s.type==='tulip')tulip(px,py,r,s.col,p,s.rot);
     else if(s.type==='daisy')daisy(px,py,r,s.col,s.center,p,s.rot);
     else small(px,py,r,s.col,s.center,p,s.rot);
   });
   wrap(wrapP*.95);bow(ease(Math.min(1,Math.max(0,(flowers.length-3)/9))));
   if(!finished)raf=requestAnimationFrame(frame);
 }
 raf=requestAnimationFrame(frame);
 // Cleanup if the page changes by another control.
 timers.push(()=>{cancelAnimationFrame(raf);c.removeEventListener('pointerdown',onPointer);clearTimeout(finishTimer)});
}
let heartAnim=0, heartRunning=false, heartCanvas=document.getElementById('heartParticles'), heartCtx=heartCanvas.getContext('2d'), heartItems=[];
function startFloatingHearts(){
 heartRunning=true; heartCanvas.style.display='block';
 const resize=()=>{const d=Math.min(devicePixelRatio||1,2),w=innerWidth,h=innerHeight;heartCanvas.width=w*d;heartCanvas.height=h*d;heartCtx.setTransform(d,0,0,d,0,0)};
 resize(); heartItems=[];
 for(let i=0;i<65;i++) heartItems.push({x:Math.random()*innerWidth,y:innerHeight+Math.random()*innerHeight,size:7+Math.random()*15,speed:.25+Math.random()*.65,drift:(Math.random()-.5)*.35,rot:(Math.random()-.5)*.7,spin:(Math.random()-.5)*.012,alpha:.18+Math.random()*.52});
 cancelAnimationFrame(heartAnim);
 function drawHeart(x,y,s,rot,a){heartCtx.save();heartCtx.translate(x,y);heartCtx.rotate(rot);heartCtx.globalAlpha=a;heartCtx.fillStyle='#d95a8b';heartCtx.beginPath();heartCtx.moveTo(0,s*.32);heartCtx.bezierCurveTo(-s*1.05,-s*.28,-s*.62,-s*.9,0,-s*.42);heartCtx.bezierCurveTo(s*.62,-s*.9,s*1.05,-s*.28,0,s*.32);heartCtx.fill();heartCtx.restore()}
 function f(){if(!heartRunning){heartCtx.clearRect(0,0,innerWidth,innerHeight);return} heartCtx.clearRect(0,0,innerWidth,innerHeight); for(const q of heartItems){q.y-=q.speed;q.x+=Math.sin(q.y*.012)*q.drift;q.rot+=q.spin;if(q.y<-30){q.y=innerHeight+20+Math.random()*120;q.x=Math.random()*innerWidth}drawHeart(q.x,q.y,q.size,q.rot,q.alpha)} heartAnim=requestAnimationFrame(f)}
 addEventListener('resize',resize,{passive:true}); f();
}
function stopFloatingHearts(){heartRunning=false;cancelAnimationFrame(heartAnim);if(heartCtx)heartCtx.clearRect(0,0,innerWidth,innerHeight);heartCanvas.style.display='none'}
function runCountdown(){
 let e=document.getElementById('count'),n=3;
 e.textContent=n;
 timers.push(setTimeout(()=>e.textContent='2',2300));
 timers.push(setTimeout(()=>e.textContent='1',4600));
 timers.push(setTimeout(()=>go(15),7000));
}
function runFireworks(){
 const c=document.getElementById('fireworks'); if(!c)return;
 const d=c.getBoundingClientRect(),W=d.width,H=d.height,D=Math.min(devicePixelRatio||1,2);
 c.width=W*D;c.height=H*D;const x=c.getContext('2d');x.setTransform(D,0,0,D,0,0);
 const palette=['#ff4f81','#ff9f1c','#ffd166','#2ec4b6','#4dabf7','#9b5de5','#7bd389','#f15bb5','#ffffff'];
 let bursts=[],particles=[]; const started=performance.now(),duration=7000;
 function burst(){
   const bx=W*(.12+Math.random()*.76), by=H*(.12+Math.random()*.48), col=palette[Math.floor(Math.random()*palette.length)];
   const n=55+Math.floor(Math.random()*30);
   bursts.push({x:bx,y:by,color:col,age:0,max:42});
   for(let i=0;i<n;i++){const a=Math.random()*Math.PI*2,sp=1.5+Math.random()*4.8;particles.push({x:bx,y:by,dx:Math.cos(a)*sp,dy:Math.sin(a)*sp,life:35+Math.random()*30,max:65+Math.random()*15,size:1.2+Math.random()*2.2,color:col});}
 }
 for(let i=0;i<5;i++)setTimeout(burst,i*650+100);
 function f(now){
   x.fillStyle='rgba(255,250,240,.16)';x.fillRect(0,0,W,H);
   if(Math.random()<.045)burst();
   particles=particles.filter(q=>q.life>0);
   for(const q of particles){q.x+=q.dx;q.y+=q.dy;q.dy+=.045;q.dx*=.992;q.dy*=.992;q.life--;x.globalAlpha=Math.max(0,q.life/q.max);x.fillStyle=q.color;x.beginPath();x.arc(q.x,q.y,q.size,0,Math.PI*2);x.fill();}
   x.globalAlpha=1;
   if(now-started<duration)requestAnimationFrame(f); else x.clearRect(0,0,W,H);
 }
 requestAnimationFrame(f);
}
function runParty(){
 const c=document.getElementById('party'),d=c.getBoundingClientRect(),W=d.width,H=d.height,D=devicePixelRatio||1;
 c.width=W*D;c.height=H*D;const x=c.getContext('2d');x.setTransform(D,0,0,D,0,0);
 const palette=['#e85d9e','#5dade2','#f5c542','#7bd389','#b07de8','#ff8c69','#f6c4d8','#c83d78','#7fd6d0','#f29f67','#ffcfdf'];
 let b=[];
 for(let i=0;i<260;i++) b.push({x:Math.random()*W,y:Math.random()*H,s:10+Math.random()*25,v:2.8+Math.random()*5.2,c:palette[Math.floor(Math.random()*palette.length)],phase:Math.random()*6.28,tilt:Math.random()*6.28});
 let sparks=[];
 for(let i=0;i<12;i++){let sx=W*(.05+Math.random()*.9),sy=H*(.08+Math.random()*.45);for(let j=0;j<42;j++){let a=Math.random()*Math.PI*2,v=1+Math.random()*4;sparks.push({x:sx,y:sy,dx:Math.cos(a)*v,dy:Math.sin(a)*v,life:70})}}
 const st=performance.now();
 function f(now){
  x.clearRect(0,0,W,H);
  b.forEach(q=>{
   q.y-=q.v; q.x+=Math.sin(now*.003+q.phase)*.85; q.tilt+=.015;
   if(q.y<-70){q.y=H+50;q.x=Math.random()*W}
   x.save();x.translate(q.x,q.y);x.rotate(Math.sin(q.tilt)*.16);x.fillStyle=q.c;
   x.beginPath();x.ellipse(0,0,q.s,q.s*1.28,0,0,Math.PI*2);x.fill();
   x.strokeStyle='rgba(80,60,70,.35)';x.lineWidth=1;x.beginPath();x.moveTo(0,q.s*1.2);x.lineTo(Math.sin(q.tilt)*5,q.s*3.4);x.stroke();x.restore();
  });
  sparks.forEach(q=>{if(q.life>0){q.x+=q.dx;q.y+=q.dy;q.dy+=.025;q.life--;x.globalAlpha=q.life/70;x.fillStyle='#c83d78';x.fillRect(q.x,q.y,3,3)}});x.globalAlpha=1;
  if(now-st<9000) requestAnimationFrame(f); else go(16);
 }
 requestAnimationFrame(f);
}
function runFlowerShower(){
 const c=document.getElementById('flowerShower'); if(!c)return;
 const W=window.innerWidth,H=window.innerHeight,D=Math.min(window.devicePixelRatio||1,2);
 c.width=W*D;c.height=H*D;const x=c.getContext('2d');x.setTransform(D,0,0,D,0,0);
 const palette=['#d94e88','#f08bb5','#ffb6d5','#f2c14e','#f59e0b','#9b6dde','#6fbf73','#54b9c8','#ef6f6c','#b83f8d','#ffd166','#f4a261'];
 const types=['rose','daisy','tulip','sakura','petal'];
 const flowers=[];
 for(let i=0;i<240;i++) flowers.push({
   x:Math.random()*W,y:-30-Math.random()*H*.9,v:1.1+Math.random()*2.0,size:5+Math.random()*10,
   rot:Math.random()*6.28,spin:(Math.random()-.5)*.035,sway:Math.random()*6.28,drift:.25+Math.random()*.8,
   color:palette[Math.floor(Math.random()*palette.length)],type:types[Math.floor(Math.random()*types.length)],alpha:.82+Math.random()*.18
 });
 function petal(cx,cy,rx,ry,a,fill){x.save();x.translate(cx,cy);x.rotate(a);x.fillStyle=fill;x.beginPath();x.ellipse(0,0,rx,ry,0,0,Math.PI*2);x.fill();x.restore();}
 function draw(q){
  x.save();x.translate(q.x,q.y);x.rotate(q.rot);x.globalAlpha=q.alpha;const s=q.size;
  if(q.type==='rose'){
   for(let r=0;r<3;r++){const n=6+r;for(let i=0;i<n;i++){const a=i*Math.PI*2/n+r*.3;petal(Math.cos(a)*s*.38,Math.sin(a)*s*.38,s*.38,s*.65,a,q.color)}}
   x.fillStyle='#f6c453';x.beginPath();x.arc(0,0,s*.18,0,Math.PI*2);x.fill();
  } else if(q.type==='daisy'){
   for(let i=0;i<8;i++){const a=i*Math.PI*2/8;petal(Math.cos(a)*s*.52,Math.sin(a)*s*.52,s*.28,s*.58,a,q.color)}
   x.fillStyle='#f6c453';x.beginPath();x.arc(0,0,s*.25,0,Math.PI*2);x.fill();
  } else if(q.type==='tulip'){
   x.fillStyle=q.color;x.beginPath();x.moveTo(-s*.72,s*.22);x.quadraticCurveTo(-s*.85,-s*.55,-s*.25,-s*.5);x.quadraticCurveTo(0,-s*.95,s*.25,-s*.5);x.quadraticCurveTo(s*.85,-s*.55,s*.72,s*.22);x.quadraticCurveTo(0,s*.65,-s*.72,s*.22);x.fill();
  } else if(q.type==='sakura'){
   for(let i=0;i<5;i++){const a=i*Math.PI*2/5-Math.PI/2;petal(Math.cos(a)*s*.42,Math.sin(a)*s*.42,s*.32,s*.55,a,q.color)}
   x.fillStyle='#f6c453';x.beginPath();x.arc(0,0,s*.16,0,Math.PI*2);x.fill();
  } else {
   x.fillStyle=q.color;x.beginPath();x.ellipse(0,0,s*.95,s*.38,-.55,0,Math.PI*2);x.fill();
  }
  x.restore();
 }
 const st=performance.now();
 function f(now){
  x.clearRect(0,0,W,H);
  flowers.forEach(q=>{q.y+=q.v;q.x+=Math.sin(now*.0017+q.sway)*q.drift;q.rot+=q.spin;if(q.y>H+40){q.y=-30;q.x=Math.random()*W}if(q.x<-40)q.x=W+20;if(q.x>W+40)q.x=-20;draw(q)});
  if(now-st<12000) requestAnimationFrame(f); else x.clearRect(0,0,W,H);
 }
 requestAnimationFrame(f);
}
function openInstagramReply(){
  window.location.href='https://ig.me/m/_the_v.o.i.d_';
}
function replay(){
  clearTimers();
  document.getElementById('nope').style.display='none';
  music.currentTime=0;
  music.play().catch(()=>{});
  go(1);
}

function runStars(){
 const c=document.getElementById('stars'),d=c.getBoundingClientRect(),W=d.width,H=d.height,D=Math.min(devicePixelRatio||1,2);
 c.width=W*D;c.height=H*D;const x=c.getContext('2d');x.setTransform(D,0,0,D,0,0);
 const scale=Math.min(W*0.88/32, H*0.72/34);
 let pts=[];
 for(let i=0;i<2200;i++){
   const a=Math.random()*Math.PI*2,r=Math.pow(Math.random(),.42);
   const hx=16*Math.pow(Math.sin(a),3),hy=13*Math.cos(a)-5*Math.cos(2*a)-2*Math.cos(3*a)-Math.cos(4*a);
   pts.push({sx:Math.random()*W,sy:Math.random()*H,tx:W/2+hx*scale*r,ty:H/2-hy*scale*r,s:0.8+Math.random()*2.2,delay:Math.random()*.45});
 }
 let st=performance.now();
 function f(now){
  const p=Math.min(1,(now-st)/12000),e=Math.sin(p*Math.PI/2);x.clearRect(0,0,W,H);
  pts.forEach(q=>{const pe=Math.max(0,Math.min(1,(p-q.delay)/(1-q.delay)));const xx=q.sx+(q.tx-q.sx)*e*pe,yy=q.sy+(q.ty-q.sy)*e*pe;x.globalAlpha=.35+.65*pe;x.fillStyle=(Math.random()>.72?'#e78db0':'#b12b68');x.beginPath();x.arc(xx,yy,q.s,0,Math.PI*2);x.fill()});
  x.globalAlpha=1;
  if(p<1)requestAnimationFrame(f);else timers.push(setTimeout(()=>go(18),2200));
 }
 requestAnimationFrame(f);
}
