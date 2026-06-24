// Aevorin FIRE or ICE — shared interactivity

(function(){
  var root = document.documentElement;
  var THEME_KEY = 'aevorin-theme';

  function applyTheme(theme){
    root.setAttribute('data-theme', theme);
    try{ localStorage.setItem(THEME_KEY, theme); }catch(e){}
    if(window.__fxSetTheme) window.__fxSetTheme(theme);
  }

  var saved = null;
  try{ saved = localStorage.getItem(THEME_KEY); }catch(e){}
  applyTheme(saved === 'ice' ? 'ice' : 'fire');

  document.addEventListener('DOMContentLoaded', function(){

    // ---- theme toggle ----
    var toggle = document.querySelector('.theme-toggle');
    if(toggle){
      toggle.addEventListener('click', function(){
        var next = root.getAttribute('data-theme') === 'fire' ? 'ice' : 'fire';
        applyTheme(next);
      });
    }

    // ---- mobile nav ----
    var burger = document.querySelector('.burger');
    var header = document.querySelector('.site-header');
    if(burger && header){
      burger.addEventListener('click', function(){
        header.classList.toggle('nav-open');
      });
      document.querySelectorAll('.nav-links a').forEach(function(a){
        a.addEventListener('click', function(){ header.classList.remove('nav-open'); });
      });
    }

    // ---- scroll reveal ----
    var revealEls = document.querySelectorAll('.reveal');
    if('IntersectionObserver' in window){
      var io = new IntersectionObserver(function(entries){
        entries.forEach(function(entry){
          if(entry.isIntersecting){
            entry.target.classList.add('in');
            io.unobserve(entry.target);
          }
        });
      }, { threshold: 0.15 });
      revealEls.forEach(function(el, i){
        el.style.setProperty('--i', i % 8);
        io.observe(el);
      });
    } else {
      revealEls.forEach(function(el){ el.classList.add('in'); });
    }

    // ---- card glow follows cursor ----
    document.querySelectorAll('.card').forEach(function(card){
      card.addEventListener('mousemove', function(e){
        var r = card.getBoundingClientRect();
        card.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100) + '%');
        card.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100) + '%');
      });
    });

    // ---- header shrink on scroll ----
    var lastY = window.scrollY;
    window.addEventListener('scroll', function(){
      if(!header) return;
      header.style.boxShadow = window.scrollY > 12 ? '0 10px 30px -20px rgba(0,0,0,.6)' : 'none';
      lastY = window.scrollY;
    });
  });
})();

// ================= particle background (embers / ice shards) =================
(function(){
  var canvas = document.getElementById('fx-canvas');
  if(!canvas) return;
  var ctx = canvas.getContext('2d');
  var W, H, particles = [];
  var theme = 'fire';
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function resize(){
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  function rand(min, max){ return Math.random() * (max - min) + min; }

  function makeParticle(){
    if(theme === 'fire'){
      return {
        x: rand(0, W),
        y: H + rand(0, 40),
        r: rand(1.4, 3.6),
        vy: -rand(0.4, 1.4),
        vx: rand(-0.3, 0.3),
        hue: rand(0,1),
        sway: rand(0.4, 1.4),
        seed: rand(0, 1000),
        life: rand(0.6, 1)
      };
    }
    return {
      x: rand(0, W),
      y: -rand(0, 40),
      r: rand(1.2, 3.2),
      vy: rand(0.5, 1.6),
      vx: rand(-0.2, 0.2),
      sway: rand(0.4, 1.2),
      seed: rand(0, 1000),
      life: rand(0.6, 1)
    };
  }

  function init(){
    particles = [];
    var count = window.innerWidth < 700 ? 45 : 90;
    for(var i=0;i<count;i++) particles.push(makeParticle());
  }
  init();

  function draw(t){
    ctx.clearRect(0,0,W,H);
    particles.forEach(function(p){
      p.y += p.vy;
      p.x += p.vx + Math.sin((t/1000 + p.seed) * p.sway) * 0.4;

      if(theme === 'fire'){
        if(p.y < -10){ Object.assign(p, makeParticle(), { y: H + 10 }); }
        var g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r*4);
        g.addColorStop(0, 'rgba(255,200,120,'+(0.9*p.life)+')');
        g.addColorStop(0.4, 'rgba(255,91,46,'+(0.5*p.life)+')');
        g.addColorStop(1, 'rgba(255,45,106,0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r*4, 0, Math.PI*2);
        ctx.fill();
      } else {
        if(p.y > H + 10){ Object.assign(p, makeParticle(), { y: -10 }); }
        ctx.fillStyle = 'rgba(160,225,255,'+(0.85*p.life)+')';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
        ctx.fill();
      }
    });
    if(!reduceMotion) requestAnimationFrame(draw);
  }

  window.__fxSetTheme = function(next){
    theme = next;
    init();
  };

  if(!reduceMotion){
    requestAnimationFrame(draw);
  } else {
    draw(0);
  }
})();
