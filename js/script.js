// Aevorin FIRE or ICE — shared interactivity

var AEVORIN_REDUCE_MOTION = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
var AEVORIN_COARSE = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;

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

  function spawnFlood(x, y, theme){
    if(AEVORIN_REDUCE_MOTION) return;
    var el = document.createElement('div');
    el.id = 'theme-flood';
    var color = theme === 'ice' ? 'rgba(40,194,255,.55)' : 'rgba(255,91,46,.55)';
    var size = Math.max(window.innerWidth, window.innerHeight) * 2.3;
    el.style.left = x + 'px';
    el.style.top = y + 'px';
    el.style.width = size + 'px';
    el.style.height = size + 'px';
    el.style.setProperty('--flood-color', color);
    document.body.appendChild(el);
    requestAnimationFrame(function(){ el.classList.add('flooding'); });
    setTimeout(function(){ el.remove(); }, 900);
  }

  document.addEventListener('DOMContentLoaded', function(){

    // ---- theme toggle ----
    var toggle = document.querySelector('.theme-toggle');
    if(toggle){
      toggle.addEventListener('click', function(e){
        var next = root.getAttribute('data-theme') === 'fire' ? 'ice' : 'fire';
        var r = toggle.getBoundingClientRect();
        spawnFlood(r.left + r.width / 2, r.top + r.height / 2, next);
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

    // ---- 3D tilt + glow on cards ----
    document.querySelectorAll('.card').forEach(function(card){
      card.addEventListener('mousemove', function(e){
        var r = card.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width;
        var py = (e.clientY - r.top) / r.height;
        card.style.setProperty('--mx', (px * 100) + '%');
        card.style.setProperty('--my', (py * 100) + '%');
        if(AEVORIN_REDUCE_MOTION || AEVORIN_COARSE) return;
        var rx = (py - 0.5) * -9;
        var ry = (px - 0.5) * 9;
        card.style.transform = 'perspective(900px) rotateX(' + rx + 'deg) rotateY(' + ry + 'deg) translateY(-8px) scale(1.015)';
      });
      card.addEventListener('mouseleave', function(){ card.style.transform = ''; });
    });

    // ---- magnetic buttons + ripple ----
    document.querySelectorAll('.btn').forEach(function(btn){
      if(!AEVORIN_REDUCE_MOTION && !AEVORIN_COARSE){
        btn.addEventListener('mousemove', function(e){
          var r = btn.getBoundingClientRect();
          var mx = e.clientX - (r.left + r.width / 2);
          var my = e.clientY - (r.top + r.height / 2);
          btn.style.transform = 'translate(' + (mx * 0.22) + 'px,' + (my * 0.3) + 'px)';
        });
        btn.addEventListener('mouseleave', function(){ btn.style.transform = ''; });
      }
      btn.addEventListener('click', function(e){
        var r = btn.getBoundingClientRect();
        var ripple = document.createElement('span');
        ripple.className = 'ripple';
        var size = Math.max(r.width, r.height) * 2;
        ripple.style.width = size + 'px';
        ripple.style.height = size + 'px';
        ripple.style.left = (e.clientX - r.left) + 'px';
        ripple.style.top = (e.clientY - r.top) + 'px';
        btn.appendChild(ripple);
        setTimeout(function(){ ripple.remove(); }, 650);
      });
    });

    // ---- header shadow + scroll progress + parallax (rAF-throttled) ----
    var progress = document.createElement('div');
    progress.id = 'scroll-progress';
    document.body.appendChild(progress);
    var aurora = document.querySelector('.bg-aurora');
    var scrollTicking = false;
    function onScrollFrame(){
      var doc = document.documentElement;
      var max = doc.scrollHeight - window.innerHeight;
      var y = window.scrollY;
      progress.style.transform = 'scaleX(' + (max > 0 ? Math.min(y / max, 1) : 0) + ')';
      if(header) header.style.boxShadow = y > 12 ? '0 10px 30px -20px rgba(0,0,0,.6)' : 'none';
      if(aurora && !AEVORIN_REDUCE_MOTION) aurora.style.transform = 'translateY(' + Math.min(y * 0.08, 180) + 'px)';
      scrollTicking = false;
    }
    window.addEventListener('scroll', function(){
      if(!scrollTicking){ scrollTicking = true; requestAnimationFrame(onScrollFrame); }
    });
    onScrollFrame();

    // ---- marquee ribbon (inserted after header) ----
    if(header && !document.querySelector('.marquee')){
      var words = ['AEVORIN', 'FIRE OR ICE', 'ВІРА', 'НАДІЯ', 'ЛЮБОВ', 'ЦАРСТВО БОЖЕ', 'ВОГОНЬ', 'ЛІД'];
      var trackHtml = words.map(function(w){ return '<span>' + w + '</span>'; }).join('');
      var marquee = document.createElement('div');
      marquee.className = 'marquee';
      marquee.innerHTML = '<div class="track">' + trackHtml + trackHtml + '</div>';
      header.insertAdjacentElement('afterend', marquee);
    }

    // ---- word-reveal hero heading ----
    var h1 = document.querySelector('.hero h1');
    if(h1 && !h1.dataset.split){
      h1.dataset.split = '1';
      var lines = h1.innerHTML.split(/<br\s*\/?>/i);
      var idx = 0;
      var html = lines.map(function(line){
        var words = line.trim().split(/\s+/).filter(Boolean);
        return words.map(function(word){
          var span = '<span class="word"><span class="word-inner" style="animation-delay:' + (idx * 70) + 'ms">' + word + '</span></span>';
          idx++;
          return span;
        }).join(' ');
      }).join('<br>');
      h1.innerHTML = html;
      h1.style.opacity = 1;
      h1.style.animation = 'none';
    }

    // ---- page transition curtain ----
    var curtain = document.getElementById('page-curtain');
    if(curtain){
      if(AEVORIN_REDUCE_MOTION){
        curtain.style.display = 'none';
      } else {
        requestAnimationFrame(function(){ curtain.classList.add('curtain-out'); });

        document.addEventListener('click', function(e){
          var a = e.target.closest('a');
          if(!a) return;
          var href = a.getAttribute('href');
          if(!href || a.target === '_blank' || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
          if(/^(https?:)?\/\//i.test(href) || href.indexOf('mailto:') === 0 || href.indexOf('#') === 0) return;
          if(href.slice(-5) !== '.html') return;
          e.preventDefault();
          curtain.classList.remove('curtain-out');
          void curtain.offsetWidth;
          curtain.classList.add('curtain-in');
          setTimeout(function(){ window.location.href = href; }, 470);
        });
      }
    }

    // ---- intro loader ----
    var loader = document.getElementById('loader');
    if(loader){
      window.addEventListener('load', function(){
        setTimeout(function(){
          loader.classList.add('loader-hide');
          setTimeout(function(){ loader.remove(); }, 650);
        }, 380);
      });
    }
  });
})();

// ================= custom cursor =================
(function(){
  if(AEVORIN_COARSE || AEVORIN_REDUCE_MOTION) return;

  document.addEventListener('DOMContentLoaded', function(){
    var dot = document.createElement('div');
    dot.id = 'cursor-dot';
    var ring = document.createElement('div');
    ring.id = 'cursor-ring';
    document.body.appendChild(dot);
    document.body.appendChild(ring);
    document.documentElement.classList.add('has-cursor');

    var mx = -100, my = -100, rx = -100, ry = -100;
    window.addEventListener('mousemove', function(e){
      mx = e.clientX; my = e.clientY;
      dot.style.transform = 'translate(' + mx + 'px,' + my + 'px) translate(-50%,-50%)';
    });

    function loop(){
      var px = rx, py = ry;
      rx += (mx - rx) * 0.18;
      ry += (my - ry) * 0.18;
      var vx = rx - px, vy = ry - py;
      var speed = Math.min(Math.sqrt(vx * vx + vy * vy) * 0.06, 0.6);
      var angle = Math.atan2(vy, vx) * 180 / Math.PI;
      ring.style.transform = 'translate(' + rx + 'px,' + ry + 'px) translate(-50%,-50%) rotate(' + angle + 'deg) scale(' + (1 + speed) + ',' + (1 - speed * 0.4) + ')';
      requestAnimationFrame(loop);
    }
    loop();

    document.addEventListener('mouseover', function(e){
      if(e.target.closest && e.target.closest('a, button, .card, .theme-toggle, input')) ring.classList.add('hovering');
    });
    document.addEventListener('mouseout', function(e){
      if(e.target.closest && e.target.closest('a, button, .card, .theme-toggle, input')) ring.classList.remove('hovering');
    });
    document.documentElement.addEventListener('mouseleave', function(){
      dot.classList.add('hidden'); ring.classList.add('hidden');
    });
    document.documentElement.addEventListener('mouseenter', function(){
      dot.classList.remove('hidden'); ring.classList.remove('hidden');
    });
  });
})();

// ================= inline editor (owner-only) =================
(function(){
  var TOKEN_KEY = 'aevorin-gh-token';
  var REPO = 'teniakovravil7-maker/aevorin-site';
  var editMode = false;
  var dirty = false;
  var bar = null;

  function getToken(){ try{ return localStorage.getItem(TOKEN_KEY); }catch(e){ return null; } }
  function setToken(t){ try{ localStorage.setItem(TOKEN_KEY, t); }catch(e){} }
  function clearToken(){ try{ localStorage.removeItem(TOKEN_KEY); }catch(e){} }

  function currentFile(){
    var parts = location.pathname.split('/').filter(Boolean);
    var last = parts[parts.length - 1] || '';
    return /\.html$/.test(last) ? last : 'index.html';
  }

  function unsplitHeading(h1){
    if(!h1 || !h1.dataset.split) return;
    var lines = [];
    var current = [];
    h1.childNodes.forEach(function(node){
      if(node.nodeName === 'BR'){ lines.push(current.join(' ')); current = []; }
      else if(node.nodeType === 1 && node.classList.contains('word')){ current.push(node.textContent); }
    });
    lines.push(current.join(' '));
    h1.innerHTML = lines.join('<br>');
    delete h1.dataset.split;
    h1.style.opacity = '';
    h1.style.animation = '';
  }

  function editableSelector(){
    return 'main h1, main h2, main h3, main p, main blockquote, main .value, main .label, main .tag, main .eyebrow';
  }

  function setStatus(msg){
    if(!bar) return;
    var s = bar.querySelector('.status');
    if(s) s.textContent = msg;
  }

  function enterEdit(){
    unsplitHeading(document.querySelector('.hero h1'));
    document.querySelectorAll(editableSelector()).forEach(function(el){
      el.setAttribute('contenteditable', 'true');
      el.classList.add('edit-target');
      el.addEventListener('input', function(){ dirty = true; setStatus('Є незбережені зміни'); });
    });
    editMode = true;
    document.body.classList.add('edit-mode');
  }

  function exitEdit(){
    document.querySelectorAll('[contenteditable="true"]').forEach(function(el){
      el.removeAttribute('contenteditable');
      el.classList.remove('edit-target');
    });
    editMode = false;
    dirty = false;
    document.body.classList.remove('edit-mode');
  }

  // block link navigation while editing (capture phase, fires before the page-curtain handler)
  document.addEventListener('click', function(e){
    if(!editMode) return;
    if(e.target.closest && e.target.closest('#edit-toolbar')) return;
    var a = e.target.closest('a');
    if(a){ e.preventDefault(); e.stopImmediatePropagation(); }
  }, true);

  window.addEventListener('beforeunload', function(e){
    if(dirty){ e.preventDefault(); e.returnValue = ''; }
  });

  function b64encode(str){ return btoa(unescape(encodeURIComponent(str))); }
  function b64decode(str){ return decodeURIComponent(escape(atob(str))); }

  function saveToGitHub(){
    var token = getToken();
    if(!token){ setStatus('Немає токена. Натисни «Вийти» і увійди знову.'); return; }
    var file = currentFile();
    setStatus('Збереження…');

    fetch('https://api.github.com/repos/' + REPO + '/contents/' + file, {
      headers: { 'Authorization': 'token ' + token, 'Accept': 'application/vnd.github+json' }
    })
    .then(function(res){
      if(!res.ok) throw new Error('Не вдалося прочитати файл (' + res.status + ')');
      return res.json();
    })
    .then(function(fileData){
      var raw = b64decode(fileData.content);
      var startIdx = raw.indexOf('<main>');
      var endIdx = raw.lastIndexOf('</main>');
      if(startIdx === -1 || endIdx === -1) throw new Error('Не знайдено <main> у файлі');

      var newMainHtml = '<main>\n' + document.querySelector('main').innerHTML.trim() + '\n</main>';
      var newRaw = raw.slice(0, startIdx) + newMainHtml + raw.slice(endIdx + '</main>'.length);

      return fetch('https://api.github.com/repos/' + REPO + '/contents/' + file, {
        method: 'PUT',
        headers: { 'Authorization': 'token ' + token, 'Accept': 'application/vnd.github+json' },
        body: JSON.stringify({
          message: 'Edit ' + file + ' via site editor',
          content: b64encode(newRaw),
          sha: fileData.sha,
          branch: 'main'
        })
      });
    })
    .then(function(res){
      if(!res.ok) return res.text().then(function(t){ throw new Error('GitHub відмовив (' + res.status + '): ' + t.slice(0, 200)); });
      dirty = false;
      setStatus('Збережено! Сайт оновиться за ~1 хв.');
    })
    .catch(function(err){
      setStatus('Помилка: ' + err.message);
    });
  }

  function showToolbar(){
    if(bar) return;
    bar = document.createElement('div');
    bar.id = 'edit-toolbar';
    bar.innerHTML =
      '<button id="edit-save" class="btn btn-primary btn-sm">Зберегти</button>' +
      '<button id="edit-exit" class="btn btn-ghost btn-sm">Вийти</button>' +
      '<button id="edit-logout" class="btn btn-ghost btn-sm">Вийти з акаунту</button>' +
      '<span class="status">Режим редагування увімкнено</span>';
    document.body.appendChild(bar);
    bar.querySelector('#edit-save').addEventListener('click', saveToGitHub);
    bar.querySelector('#edit-exit').addEventListener('click', function(){
      if(dirty && !confirm('Незбережені зміни буде втрачено. Вийти?')) return;
      exitEdit();
      bar.remove();
      bar = null;
    });
    bar.querySelector('#edit-logout').addEventListener('click', function(){
      clearToken();
      exitEdit();
      if(bar){ bar.remove(); bar = null; }
      alert('Токен видалено з цього браузера.');
    });
  }

  function startEditing(){
    var token = getToken();
    if(!token){
      token = prompt('Встав свій GitHub Personal Access Token\n(fine-grained, доступ лише до репозиторію aevorin-site, права Contents: Read and write):');
      if(!token) return;
      setToken(token.trim());
    }
    enterEdit();
    showToolbar();
  }

  document.addEventListener('DOMContentLoaded', function(){
    var dot = document.createElement('div');
    dot.id = 'edit-trigger';
    dot.title = 'Редагувати сайт';
    document.body.appendChild(dot);
    dot.addEventListener('click', function(){
      if(!editMode) startEditing();
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
  var mouseX = -9999, mouseY = -9999;
  var reduceMotion = AEVORIN_REDUCE_MOTION;

  function resize(){
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  window.addEventListener('mousemove', function(e){ mouseX = e.clientX; mouseY = e.clientY; });

  function rand(min, max){ return Math.random() * (max - min) + min; }

  function makeParticle(){
    if(theme === 'fire'){
      return {
        x: rand(0, W),
        y: H + rand(0, 40),
        r: rand(1.4, 3.6),
        vy: -rand(0.4, 1.4),
        vx: rand(-0.3, 0.3),
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
    for(var i = 0; i < count; i++) particles.push(makeParticle());
  }
  init();

  function draw(t){
    ctx.clearRect(0, 0, W, H);
    particles.forEach(function(p){
      p.y += p.vy;
      p.x += p.vx + Math.sin((t / 1000 + p.seed) * p.sway) * 0.4;

      var dx = p.x - mouseX, dy = p.y - mouseY;
      var distSq = dx * dx + dy * dy;
      if(distSq < 14400){
        var dist = Math.sqrt(distSq) || 1;
        var force = (1 - dist / 120) * (theme === 'fire' ? 1.1 : -0.7);
        p.x += (dx / dist) * force;
        p.y += (dy / dist) * force;
      }

      if(theme === 'fire'){
        if(p.y < -10){ Object.assign(p, makeParticle(), { y: H + 10 }); }
        ctx.save();
        ctx.shadowBlur = 8;
        ctx.shadowColor = 'rgba(255,120,40,' + (0.8 * p.life) + ')';
        var g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 4);
        g.addColorStop(0, 'rgba(255,200,120,' + (0.9 * p.life) + ')');
        g.addColorStop(0.4, 'rgba(255,91,46,' + (0.5 * p.life) + ')');
        g.addColorStop(1, 'rgba(255,45,106,0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      } else {
        if(p.y > H + 10){ Object.assign(p, makeParticle(), { y: -10 }); }
        ctx.save();
        ctx.shadowBlur = 6;
        ctx.shadowColor = 'rgba(160,225,255,.8)';
        ctx.fillStyle = 'rgba(160,225,255,' + (0.85 * p.life) + ')';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
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
