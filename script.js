/* ========== THREE.JS BACKGROUND SCENE ========== */
(function(){
  const canvas=document.getElementById('bg-canvas');
  if(!canvas||typeof THREE==='undefined')return;
  const prefersReduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const scene=new THREE.Scene();
  const camera=new THREE.PerspectiveCamera(50,canvas.clientWidth/canvas.clientHeight,0.1,100);
  camera.position.set(0,0.5,8);
  const renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true});
  renderer.setSize(canvas.clientWidth,canvas.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));

  scene.add(new THREE.AmbientLight(0xffffff,0.35));
  const dirLight=new THREE.DirectionalLight(0xffffff,0.5);
  dirLight.position.set(5,8,5);
  scene.add(dirLight);

  function makeLabel(text,color){
    const c=document.createElement('canvas');
    c.width=256;c.height=64;
    const ctx=c.getContext('2d');
    ctx.font='bold 28px JetBrains Mono, monospace';
    ctx.fillStyle=color;
    ctx.globalAlpha=0.7;
    ctx.textAlign='center';
    ctx.textBaseline='middle';
    ctx.fillText(text,128,32);
    const tex=new THREE.CanvasTexture(c);
    const mat=new THREE.SpriteMaterial({map:tex,transparent:true,opacity:0.6});
    const sprite=new THREE.Sprite(mat);
    sprite.scale.set(1.2,0.3,1);
    return sprite;
  }

  function makePlate(color,label,pos){
    const group=new THREE.Group();
    const geo=new THREE.BoxGeometry(1.6,0.12,1.1);
    const mat=new THREE.MeshPhysicalMaterial({
      color:new THREE.Color(color),transparent:true,opacity:0.18,
      roughness:0.3,metalness:0.1,side:THREE.DoubleSide
    });
    group.add(new THREE.Mesh(geo,mat));
    const edges=new THREE.EdgesGeometry(geo);
    const lineMat=new THREE.LineBasicMaterial({color:new THREE.Color(color),transparent:true,opacity:0.55});
    const lbl=makeLabel(label,color);
    lbl.position.set(0,0.22,0);
    group.add(lbl);
    group.add(new THREE.LineSegments(edges,lineMat));
    const dotGeo=new THREE.SphereGeometry(0.035,12,12);
    const dotMat=new THREE.MeshBasicMaterial({color:new THREE.Color(color)});
    const hw=0.8,hh=0.06,hd=0.55;
    [[-hw,hh,-hd],[hw,hh,-hd],[-hw,hh,hd],[hw,hh,hd]].forEach(p=>{
      const d=new THREE.Mesh(dotGeo,dotMat);
      d.position.set(...p);group.add(d);
    });
    group.position.set(...pos);
    group.userData={label};
    return group;
  }

  const platesWrapper = new THREE.Group();
  const clientPlate=makePlate('#2DD4BF','Client',[-2,0.9,-0.5]);
  const serverPlate=makePlate('#FFB454','Server',[0,-0.1,0.3]);
  const dbPlate=makePlate('#8B8FFD','Database',[2,0.6,-0.3]);
  const plates=new THREE.Group();
  plates.add(clientPlate,serverPlate,dbPlate);
  platesWrapper.add(plates);
  scene.add(platesWrapper);

  function makeConnection(from,to,color,packetCount){
    const mid=new THREE.Vector3().lerpVectors(from,to,0.5);
    mid.y+=1.2; mid.z-=0.6;
    const curve=new THREE.CatmullRomCurve3([from.clone(),mid,to.clone()]);
    const lineGeo=new THREE.BufferGeometry().setFromPoints(curve.getPoints(60));
    const lineMat=new THREE.LineBasicMaterial({color:new THREE.Color(color),transparent:true,opacity:0.18});
    const line=new THREE.Line(lineGeo,lineMat);
    platesWrapper.add(line);
    const packets=[];
    const pGeo=new THREE.SphereGeometry(0.04,10,10);
    const pMat=new THREE.MeshBasicMaterial({color:new THREE.Color(color)});
    for(let i=0;i<packetCount;i++){
      const p=new THREE.Mesh(pGeo,pMat);
      p.userData={t:i/packetCount,speed:0.0006+Math.random()*0.0004};
      platesWrapper.add(p);
      packets.push(p);
    }
    return{curve,packets};
  }

  const conn1=makeConnection(clientPlate.position,serverPlate.position,'#2DD4BF',3);
  const conn2=makeConnection(serverPlate.position,dbPlate.position,'#FFB454',3);
  const conn3=makeConnection(dbPlate.position,clientPlate.position,'#8B8FFD',2);
  const connections = [conn1, conn2, conn3];

  const numParticles = 400;
  const targets = {
    hero: [], about: [], experience: [], projects: [], skills: [], education: [], certifications: [], contact: []
  };

  for(let i=0; i<numParticles; i++) {
    // Hero: scattered background shell
    const u = Math.random(), v = Math.random();
    const theta = 2 * Math.PI * u, phi = Math.acos(2 * v - 1), r = 8 + Math.random()*3;
    targets.hero.push(new THREE.Vector3(r*Math.sin(phi)*Math.cos(theta), r*Math.sin(phi)*Math.sin(theta), r*Math.cos(phi)));

    // About (Timeline): Double Helix
    const t = i / numParticles;
    const angle = t * Math.PI * 10;
    const hr = 2.5;
    const y = (t - 0.5) * 14;
    targets.about.push(new THREE.Vector3(hr * Math.cos(angle + (i%2===0?0:Math.PI)), y, hr * Math.sin(angle + (i%2===0?0:Math.PI))));

    // Experience: Cube Grid
    let p = new THREE.Vector3((Math.random()-0.5)*6, (Math.random()-0.5)*6, (Math.random()-0.5)*6);
    const max = Math.max(Math.abs(p.x), Math.abs(p.y), Math.abs(p.z));
    p.multiplyScalar(3 / max);
    targets.experience.push(p);

    // Projects: Floating Clusters
    const cluster = i % 3;
    const cx = (cluster - 1) * 4;
    const cy = (cluster === 1) ? 2 : -2;
    const cr = 1.5 + Math.random()*0.5;
    const cp = Math.acos(2 * Math.random() - 1);
    const ct = Math.random() * Math.PI * 2;
    targets.projects.push(new THREE.Vector3(cx + cr*Math.sin(cp)*Math.cos(ct), cy + cr*Math.sin(cp)*Math.sin(ct), cr*Math.cos(cp)));

    // Skills: Torus/Vortex
    const angle2 = Math.random() * Math.PI * 2;
    const rad = 4 + (Math.random()-0.5)*2;
    const ty = (Math.random()-0.5) * 4;
    targets.skills.push(new THREE.Vector3(rad * Math.cos(angle2), ty, rad * Math.sin(angle2)));
    
    // Education: Pyramid
    const py = (Math.random() - 0.5) * 6;
    const width = (3 - py) * 0.6;
    const px = (Math.random() - 0.5) * 4 * width;
    const pz = (Math.random() - 0.5) * 4 * width;
    targets.education.push(new THREE.Vector3(px, py, pz));

    // Certifications: Spiral Ring
    const cAngle = (i / numParticles) * Math.PI * 6;
    const cRad = 3 + Math.sin(cAngle * 2) * 0.8;
    const cY = (i / numParticles - 0.5) * 8;
    targets.certifications.push(new THREE.Vector3(cRad * Math.cos(cAngle), cY, cRad * Math.sin(cAngle)));

    // Contact: Grid Plane / Wave
    const gridX = (i % 20) - 10;
    const gridZ = Math.floor(i / 20) - 10;
    targets.contact.push(new THREE.Vector3(gridX * 0.6, -3, gridZ * 0.6));
  }

  const pGeo = new THREE.BufferGeometry();
  const pPos = new Float32Array(numParticles * 3);
  for(let i=0; i<numParticles; i++){
    pPos[i*3] = targets.hero[i].x; pPos[i*3+1] = targets.hero[i].y; pPos[i*3+2] = targets.hero[i].z;
  }
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  
  const tCanvas = document.createElement('canvas');
  tCanvas.width=16; tCanvas.height=16;
  const tCtx = tCanvas.getContext('2d');
  tCtx.beginPath(); tCtx.arc(8,8,6,0,Math.PI*2); tCtx.fillStyle='#fff'; tCtx.fill();
  const pTex = new THREE.CanvasTexture(tCanvas);

  const pMat = new THREE.PointsMaterial({color: 0x2DD4BF, size: 0.15, map: pTex, transparent: true, opacity: 0.4, alphaTest: 0.01});
  const particles = new THREE.Points(pGeo, pMat);
  scene.add(particles);

  let mouseX=0,mouseY=0;
  document.addEventListener('mousemove',e=>{
    mouseX=(e.clientX/window.innerWidth-0.5)*2;
    mouseY=(e.clientY/window.innerHeight-0.5)*2;
  });

  window.addEventListener('resize',()=>{
    const w=canvas.clientWidth,h=canvas.clientHeight;
    camera.aspect=w/h;camera.updateProjectionMatrix();
    renderer.setSize(w,h);
  });

  let clock=new THREE.Clock();
  function animate(){
    if(prefersReduced){renderer.render(scene,camera);return;}
    requestAnimationFrame(animate);
    const t=clock.getElapsedTime();
    const curr = window.currentSection || 'hero';

    const platesTargetY = curr === 'hero' ? 0 : 15;
    platesWrapper.position.y += (platesTargetY - platesWrapper.position.y) * 0.05;

    if(platesWrapper.position.y < 14) {
      plates.rotation.y=Math.sin(t*0.15)*0.12 + mouseX*0.08;
      plates.rotation.x=Math.cos(t*0.12)*0.04 + mouseY*0.04;
      clientPlate.position.y=0.9+Math.sin(t*0.8)*0.08;
      serverPlate.position.y=-0.1+Math.sin(t*0.6+1)*0.06;
      dbPlate.position.y=0.6+Math.sin(t*0.7+2)*0.07;
      connections.forEach(c=>{
        c.packets.forEach(p=>{
          p.userData.t=(p.userData.t+p.userData.speed)%1;
          p.position.copy(c.curve.getPointAt(p.userData.t));
        });
      });
    }

    const tPos = targets[curr] || targets.hero;
    const pos = particles.geometry.attributes.position.array;
    for(let i=0; i<numParticles; i++) {
      let tx = tPos[i].x, ty = tPos[i].y, tz = tPos[i].z;
      if(curr === 'contact') {
        ty += Math.sin(tx * 1.5 + t * 2) * 0.5 + Math.cos(tz * 1.5 + t * 2) * 0.5;
      } else if (curr === 'hero') {
        ty += Math.sin(t + i)*0.3;
      }
      pos[i*3] += (tx - pos[i*3]) * 0.04;
      pos[i*3+1] += (ty - pos[i*3+1]) * 0.04;
      pos[i*3+2] += (tz - pos[i*3+2]) * 0.04;
    }
    particles.geometry.attributes.position.needsUpdate = true;

    let cHex = 0x2DD4BF;
    if(curr==='experience' || curr==='education') cHex = 0xFFB454;
    if(curr==='projects' || curr==='about' || curr==='certifications') cHex = 0x8B8FFD;
    pMat.color.lerp(new THREE.Color(cHex), 0.05);

    particles.rotation.y += 0.001;
    particles.rotation.x += (mouseY * 0.1 - particles.rotation.x) * 0.05;
    particles.rotation.z += -(mouseX * 0.1 + particles.rotation.z) * 0.05;

    renderer.render(scene,camera);
  }
  animate();
  if(prefersReduced) renderer.render(scene,camera);
})();

/* ========== MOBILE NAV ========== */
(function(){
  const btn=document.querySelector('.nav__hamburger');
  const links=document.querySelector('.nav__links');
  if(!btn||!links)return;
  btn.addEventListener('click',()=>{
    btn.classList.toggle('open');
    links.classList.toggle('open');
  });
  links.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{
    btn.classList.remove('open');links.classList.remove('open');
  }));
})();

/* ========== SCROLL PROGRESS BAR ========== */
(function(){
  const bar=document.getElementById('nav-progress');
  if(!bar)return;
  window.addEventListener('scroll',()=>{
    const h=document.documentElement.scrollHeight-window.innerHeight;
    bar.style.width=(h>0?(window.scrollY/h)*100:0)+'%';
  },{passive:true});
})();

/* ========== BACK TO TOP ========== */
(function(){
  const btn=document.getElementById('back-to-top');
  if(!btn)return;
  window.addEventListener('scroll',()=>{
    btn.classList.toggle('visible',window.scrollY>600);
  },{passive:true});
  btn.addEventListener('click',()=>window.scrollTo({top:0,behavior:'smooth'}));
})();

/* ========== SCROLL REVEAL ========== */
(function(){
  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  const els=document.querySelectorAll('.reveal');
  const obs=new IntersectionObserver((entries)=>{
    entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');obs.unobserve(e.target);}});
  },{threshold:0.12});
  els.forEach(el=>obs.observe(el));
})();

/* ========== UNIVERSAL 3D CARD TILT ========== */
(function(){
  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  const cards = document.querySelectorAll('.proj-card, .tl-card, .exp-card, .skill-group, .edu-card, .contact__badge');
  cards.forEach(card=>{
    card.addEventListener('mousemove',e=>{
      const r=card.getBoundingClientRect();
      const x=(e.clientX-r.left)/r.width-0.5;
      const y=(e.clientY-r.top)/r.height-0.5;
      card.style.transition = 'none';
      card.style.transform=`perspective(1000px) rotateY(${x*12}deg) rotateX(${-y*12}deg) translateY(-4px)`;
    });
    card.addEventListener('mouseleave',()=>{
      card.style.transition = 'transform 0.4s ease, border-color 0.25s, box-shadow 0.25s';
      card.style.transform='';
    });
  });
})();

/* ========== ACTIVE NAV LINK ========== */
(function(){
  const sections=document.querySelectorAll('section[id]');
  const links=document.querySelectorAll('.nav__links a[href^="#"]');
  window.currentSection = 'hero';
  const obs=new IntersectionObserver(entries=>{
    entries.forEach(e=>{
      if(e.isIntersecting){
        window.currentSection = e.target.id;
        links.forEach(l=>l.style.color='');
        const active=document.querySelector(`.nav__links a[href="#${e.target.id}"]`);
        if(active)active.style.color='var(--teal)';
      }
    });
  },{threshold:0.3,rootMargin:'-80px 0px -50% 0px'});
  sections.forEach(s=>obs.observe(s));
})();

/* ========== DYNAMIC WORD SLIDER ========== */
(function(){
  const words=[
    {text:'MERN Stack Developer',color:'#2DD4BF'},
    {text:'React.js Specialist',color:'#61DAFB'},
    {text:'Node.js & Express',color:'#FFB454'},
    {text:'MongoDB Architect',color:'#8B8FFD'},
    {text:'REST API Builder',color:'#FF6B6B'},
    {text:'Real-Time Systems',color:'#2DD4BF'},
    {text:'JWT Authentication',color:'#FFD93D'},
    {text:'Socket.io Engineer',color:'#8B8FFD'},
  ];
  const track=document.getElementById('word-track');
  if(!track)return;
  let current=0;

  function createWordEl(wordObj,index){
    const el=document.createElement('div');
    el.className='hero__word-item';
    el.dataset.index=index;
    wordObj.text.split('').forEach((ch,i)=>{
      const span=document.createElement('span');
      span.className='word-char';
      span.textContent=ch===(' ')?'\u00a0':ch;
      span.style.color=wordObj.color;
      span.style.animationDelay=i*0.035+'s';
      el.appendChild(span);
    });
    return el;
  }

  // Initialize all word items
  words.forEach((w,i)=>{
    const el=createWordEl(w,i);
    if(i===0) el.classList.add('active');
    track.appendChild(el);
  });

  function rotateWords(){
    const items=track.querySelectorAll('.hero__word-item');
    const currentEl=items[current];
    const next=(current+1)%words.length;
    const nextEl=items[next];

    currentEl.classList.remove('active');
    currentEl.classList.add('exit-up');

    nextEl.classList.add('active');
    // Re-trigger char pop animation
    nextEl.querySelectorAll('.word-char').forEach((ch,i)=>{
      ch.style.animation='none';
      ch.offsetHeight;
      ch.style.animation='';
      ch.style.animationDelay=i*0.035+'s';
    });

    setTimeout(()=>{currentEl.classList.remove('exit-up');},700);
    current=next;
  }

  setInterval(rotateWords,2500);
})();

/* ========== CONTACT FORM — EmailJS ========== */
(function(){
  const form=document.getElementById('contact-form');
  const submitBtn=document.getElementById('contact-submit');
  const toast=document.getElementById('toast');
  if(!form||!toast)return;

  // ─── IMPORTANT: Replace these with your EmailJS credentials ───
  // 1. Sign up at https://www.emailjs.com (free tier = 200 emails/month)
  // 2. Create an Email Service (Gmail, Outlook, etc.) — get SERVICE_ID
  // 3. Create an Email Template with variables: {{from_name}}, {{from_email}}, {{subject}}, {{message}}
  // 4. Get your PUBLIC_KEY from Account > API Keys
  const EMAILJS_PUBLIC_KEY='YOUR_PUBLIC_KEY';
  const EMAILJS_SERVICE_ID='YOUR_SERVICE_ID';
  const EMAILJS_TEMPLATE_ID='YOUR_TEMPLATE_ID';

  // Initialize EmailJS
  if(typeof emailjs!=='undefined'){
    emailjs.init(EMAILJS_PUBLIC_KEY);
  }

  function showToast(message,type){
    const textEl=toast.querySelector('.toast__text');
    const iconEl=toast.querySelector('.toast__icon');
    textEl.textContent=message;
    toast.className='toast show toast--'+type;
    if(type==='success'){
      iconEl.innerHTML='<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg>';
    } else {
      iconEl.innerHTML='<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M15 9l-6 6"/><path d="M9 9l6 6"/></svg>';
    }
    setTimeout(()=>{toast.classList.remove('show');},4000);
  }

  form.addEventListener('submit',async function(e){
    e.preventDefault();
    submitBtn.classList.add('sending');
    submitBtn.innerHTML='<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation:spin 1s linear infinite"><path d="M12 2v4m0 12v4m-7.07-3.93l2.83-2.83m8.48-8.48l2.83-2.83M2 12h4m12 0h4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83"/></svg> Sending...';

    try{
      if(typeof emailjs==='undefined'||EMAILJS_PUBLIC_KEY==='YOUR_PUBLIC_KEY'){
        // Demo mode — show success without actually sending
        await new Promise(r=>setTimeout(r,1200));
        showToast('Message sent successfully! (Demo mode — configure EmailJS to go live)','success');
      } else {
        await emailjs.sendForm(EMAILJS_SERVICE_ID,EMAILJS_TEMPLATE_ID,form);
        showToast('Message sent successfully! I\'ll get back to you soon.','success');
      }
      form.reset();
    } catch(err){
      console.error('EmailJS error:',err);
      showToast('Failed to send message. Please try email directly.','error');
    } finally {
      submitBtn.classList.remove('sending');
      submitBtn.innerHTML='<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m22 2-7 20-4-9-9-4z"/><path d="m22 2-11 11"/></svg> Send Message';
    }
  });
})();