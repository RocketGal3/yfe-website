/* ── SPACESHIP CLICK SOUNDS ── */
(function(){
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return;
  let ctx = null;

  // Lazily init AudioContext on first user gesture (browser policy)
  function getCtx() {
    if (!ctx) ctx = new AudioCtx();
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  // Sound library — each is a tiny synth recipe
  const sounds = [
    // Soft blip — short rising beep
    function softBlip(ac) {
      const o = ac.createOscillator();
      const g = ac.createGain();
      o.connect(g); g.connect(ac.destination);
      o.type = 'sine';
      o.frequency.setValueAtTime(440, ac.currentTime);
      o.frequency.exponentialRampToValueAtTime(880, ac.currentTime + 0.08);
      g.gain.setValueAtTime(0.06, ac.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.18);
      o.start(ac.currentTime);
      o.stop(ac.currentTime + 0.18);
    },
    // Warp flicker — descending sweep
    function warpFlick(ac) {
      const o = ac.createOscillator();
      const g = ac.createGain();
      o.connect(g); g.connect(ac.destination);
      o.type = 'sawtooth';
      o.frequency.setValueAtTime(600, ac.currentTime);
      o.frequency.exponentialRampToValueAtTime(200, ac.currentTime + 0.12);
      g.gain.setValueAtTime(0.04, ac.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.14);
      o.start(ac.currentTime);
      o.stop(ac.currentTime + 0.15);
    },
    // Comm ping — double blip
    function commPing(ac) {
      [0, 0.1].forEach(function(delay) {
        const o = ac.createOscillator();
        const g = ac.createGain();
        o.connect(g); g.connect(ac.destination);
        o.type = 'sine';
        o.frequency.setValueAtTime(700 + delay * 500, ac.currentTime + delay);
        g.gain.setValueAtTime(0.05, ac.currentTime + delay);
        g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + delay + 0.1);
        o.start(ac.currentTime + delay);
        o.stop(ac.currentTime + delay + 0.1);
      });
    },
    // Thruster pulse — low rumble tap
    function thruster(ac) {
      const buf = ac.createBuffer(1, ac.sampleRate * 0.15, ac.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < data.length; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / data.length, 3);
      }
      const src = ac.createBufferSource();
      const g = ac.createGain();
      const filter = ac.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 180;
      src.buffer = buf;
      src.connect(filter); filter.connect(g); g.connect(ac.destination);
      g.gain.setValueAtTime(0.25, ac.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.15);
      src.start(ac.currentTime);
    },
    // System confirm — ascending chord
    function systemConfirm(ac) {
      [330, 440, 550].forEach(function(freq, i) {
        const o = ac.createOscillator();
        const g = ac.createGain();
        o.connect(g); g.connect(ac.destination);
        o.type = 'triangle';
        o.frequency.value = freq;
        g.gain.setValueAtTime(0, ac.currentTime + i * 0.04);
        g.gain.linearRampToValueAtTime(0.04, ac.currentTime + i * 0.04 + 0.02);
        g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + i * 0.04 + 0.14);
        o.start(ac.currentTime + i * 0.04);
        o.stop(ac.currentTime + i * 0.04 + 0.15);
      });
    },
  ];

  let lastSound = -1;

  function playSound() {
    const ac = getCtx();
    // Pick a random sound, avoid repeating same one twice
    let idx;
    do { idx = Math.floor(Math.random() * sounds.length); } while (idx === lastSound);
    lastSound = idx;
    try { sounds[idx](ac); } catch(e) {}
  }

  // Attach to all clickable elements — use capture so it fires before navigation
  document.addEventListener('click', function(e) {
    const target = e.target.closest('a, button, .inquiry-block, .brand-card, .mission-card, .platform-card, .feature-card, .photo-dot');
    if (target) playSound();
  }, true);

  // Also play on hover for nav links (subtle)
  document.addEventListener('mouseenter', function(e) {
    if (e.target.matches && e.target.matches('nav a')) {
      const ac = getCtx();
      // Very quiet hover tick
      const o = ac.createOscillator();
      const g = ac.createGain();
      o.connect(g); g.connect(ac.destination);
      o.type = 'sine';
      o.frequency.value = 520;
      g.gain.setValueAtTime(0.025, ac.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.06);
      o.start(ac.currentTime);
      o.stop(ac.currentTime + 0.06);
    }
  }, true);
})();

/* CURSOR */
const cursor=document.getElementById('cursor');
const ring=document.getElementById('cursorRing');
let mx=0,my=0,rx=0,ry=0;
if(cursor && ring){
  document.addEventListener('mousemove',e=>{mx=e.clientX;my=e.clientY;});
  function animCursor(){
    cursor.style.left=mx-4+'px';cursor.style.top=my-4+'px';
    rx+=(mx-rx)*.12;ry+=(my-ry)*.12;
    ring.style.left=rx-18+'px';ring.style.top=ry-18+'px';
    requestAnimationFrame(animCursor);
  }
  animCursor();
  document.querySelectorAll('a,button,.stat-block,.mission-card,.platform-card,.pillar-chip,.topic-card,.contact-link-item').forEach(el=>{
    el.addEventListener('mouseenter',()=>{ring.style.width='56px';ring.style.height='56px';ring.style.opacity='.8';});
    el.addEventListener('mouseleave',()=>{ring.style.width='36px';ring.style.height='36px';ring.style.opacity='.5';});
  });
}

/* STARFIELD */
const canvas=document.getElementById('starfield');
if(canvas){
const ctx=canvas.getContext('2d');
let W,H,stars=[];
function initCanvas(){
  W=canvas.width=window.innerWidth;
  H=canvas.height=window.innerHeight;
  stars=Array.from({length:180},()=>({x:Math.random(),y:Math.random(),r:Math.random()*1.4+.2,op:Math.random()*.35+.05,sp:Math.random()*.012+.004,ph:Math.random()*Math.PI*2}));
}
initCanvas();
window.addEventListener('resize',initCanvas);
function drawStars(t){
  ctx.clearRect(0,0,W,H);
  stars.forEach(s=>{
    const o=s.op+Math.sin(t*s.sp+s.ph)*.06;
    ctx.beginPath();ctx.arc(s.x*W,s.y*H,s.r,0,Math.PI*2);
    ctx.fillStyle=`rgba(180,200,255,${Math.max(0,o)})`;ctx.fill();
  });
  requestAnimationFrame(drawStars);
}
requestAnimationFrame(drawStars);
}

/* NAV SCROLL */
const nav=document.getElementById('nav');
window.addEventListener('scroll',()=>nav.classList.toggle('scrolled',window.scrollY>60));

/* REVEAL */
const reveals=document.querySelectorAll('.reveal');
const io=new IntersectionObserver(entries=>{
  entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');io.unobserve(e.target);}});
},{threshold:.12});
reveals.forEach(el=>io.observe(el));

// ── MOBILE NAV ──
const hamburger = document.getElementById('navHamburger');
const navLinks  = document.querySelector('.nav-links');
if (hamburger && navLinks) {
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    navLinks.classList.toggle('open');
    document.body.style.overflow = navLinks.classList.contains('open') ? 'hidden' : '';
  });
  // Close when a link is clicked
  navLinks.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      hamburger.classList.remove('open');
      navLinks.classList.remove('open');
      document.body.style.overflow = '';
    });
  });
}
