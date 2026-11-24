(() => {
  const root = document.documentElement;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const nav = document.querySelector('#navigation');
  const panels = [...document.querySelectorAll('.page-panel')];
  const tabs = [...nav.querySelectorAll('a')];
  const theme = document.querySelector('.theme-toggle');
  const loader = document.querySelector('#intro-loader');
  const main = document.querySelector('main');
  const header = document.querySelector('.site-header');
  let activePage = 'about';
  let introDone = false;
  root.classList.add('tabbed');
  const revealElements = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduced.matches) {
    root.classList.add('motion-ready');
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) {entry.target.classList.add('is-visible');observer.unobserve(entry.target);}
    }), {threshold:.12, rootMargin:'0px 0px 30px 0px'});
    revealElements.forEach(el => {el.classList.remove('is-visible');observer.observe(el)});
  } else revealElements.forEach(el => el.classList.add('is-visible'));

  const nextSection = document.querySelector('.next-section');
  root.classList.add('scroll-flow');
  panels.forEach(panel => panel.hidden = false);
  function activatePage(name) {
    if (root.dataset.page === name) return;
    activePage = name;
    panels.forEach(panel => panel.classList.toggle('active', panel.id === `panel-${name}`));
    tabs.forEach(tab => {
      const active = tab.hash === `#${name}`;
      if (active) tab.setAttribute('aria-current', 'location'); else tab.removeAttribute('aria-current');
      tab.tabIndex = 0;
    });
    root.dataset.page = name;
    document.title = window.portfolioI18n?.sectionTitle(name) ?? `${name[0].toUpperCase()+name.slice(1)} | Kerry Yang`;
    const index = panels.findIndex(p => p.id === `panel-${name}`);
    const next = panels[index + 1];
    nextSection.hidden = !next;
    if (next) {const label = `Continue to ${next.id.replace('panel-','')}`;nextSection.setAttribute('aria-label',label);nextSection.title=label;}
    window.portfolioI18n?.updateDynamicLabels();
  }
  let scrollTween = 0;
  function cancelScroll() {
    if (scrollTween) {cancelAnimationFrame(scrollTween);scrollTween=0;syncScroll();}
  }
  function glideTo(top, completed) {
    cancelScroll();
    const from=scrollY, distance=top-from;
    if(Math.abs(distance)<1){completed?.();syncScroll();return;}
    const duration=Math.min(1100,Math.max(650,Math.sqrt(Math.abs(distance))*15));
    const start=performance.now();
    function frame(now) {
      const p=Math.min(1,(now-start)/duration);
      const ease=p<.5?4*p*p*p:1-Math.pow(-2*p+2,3)/2;
      window.scrollTo({top:from+distance*ease,behavior:'instant'});
      if(p<1)scrollTween=requestAnimationFrame(frame);
      else{scrollTween=0;completed?.();syncScroll();}
    }
    scrollTween=requestAnimationFrame(frame);
  }
  ['wheel','touchstart','pointerdown'].forEach(event=>addEventListener(event,cancelScroll,{passive:true}));
  addEventListener('keydown',event=>{if(['ArrowUp','ArrowDown','PageUp','PageDown','Home','End',' '].includes(event.key))cancelScroll()});
  function showPage(name, updateHistory = false, keyboard = false, smooth = true) {
    if (!panels.some(p => p.id === `panel-${name}`)) name = 'about';
    const panel = document.querySelector(`#panel-${name}`);
    const top = Math.max(0,Math.min(document.documentElement.scrollHeight-innerHeight,panel.getBoundingClientRect().top+scrollY-header.getBoundingClientRect().height));
    const complete=()=>{activatePage(name);if(updateHistory&&location.hash!==`#${name}`)history.pushState(null,'',`#${name}`);if(keyboard)panel.focus({preventScroll:true});};
    if(smooth&&!reduced.matches&&!keyboard&&introDone)glideTo(top,complete);
    else{cancelScroll();window.scrollTo({top,behavior:'instant'});complete();}
  }
  let scrollFrame = 0;
  function syncScroll() {
    scrollFrame = 0;
    if(scrollTween)return;
    const line = header.getBoundingClientRect().height + Math.min(innerHeight * .28, 180);
    let current = panels[0];
    for (const panel of panels) {if(panel.getBoundingClientRect().top <= line) current = panel;}
    const name = current.id.replace('panel-', '');
    if (root.dataset.page !== name) {
      activatePage(name);
      history.replaceState(null, '', `#${name}`);
    }
  }
  addEventListener('scroll', () => {if(!scrollFrame)scrollFrame=requestAnimationFrame(syncScroll);}, {passive:true});
  nextSection.addEventListener('click', () => {
    const index = panels.findIndex(p => p.id === `panel-${activePage}`);
    const next = panels[index + 1];
    if(next)showPage(next.id.replace('panel-',''),true,false,true);
  });
  // Delegate all in-page links so CV/file links remain native.
  document.addEventListener('click', event => {
    const anchor = event.target.closest('a[href^="#"]');
    if (!anchor) return;
    const target = anchor.hash.slice(1);
    if (panels.some(p => p.id === `panel-${target}`)) {
      event.preventDefault(); showPage(target, true, event.detail === 0);
    }
  });
  function keyboardTabs(items, onSelect) {
    items.forEach((item, index) => item.addEventListener('keydown', event => {
      let next;
      if (event.key === 'ArrowRight') next = (index + 1) % items.length;
      if (event.key === 'ArrowLeft') next = (index + items.length - 1) % items.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = items.length - 1;
      if (next === undefined) return;
      event.preventDefault(); items[next].focus(); onSelect(items[next]);
    }));
  }
  keyboardTabs(tabs, tab => showPage(tab.hash.slice(1), true, true));
  addEventListener('popstate', () => showPage(location.hash.slice(1)));
  addEventListener('hashchange', () => showPage(location.hash.slice(1)));
  const projectTabs = [...document.querySelectorAll('[data-project]')];
  const projects = [...document.querySelectorAll('.project-list > article')];
  function showProject(key, animate = true) {
    projects.forEach(project => project.hidden = project.id !== `project-${key}`);
    projectTabs.forEach(tab => { const active = tab.dataset.project === key; tab.classList.toggle('active', active); tab.setAttribute('aria-selected', String(active)); tab.tabIndex = active ? 0 : -1; });
    const selected=projects.find(p=>p.id===`project-${key}`);
    if(animate&&!reduced.matches&&selected){selected.getAnimations().forEach(a=>a.cancel());selected.animate([{opacity:0,transform:'translateY(14px)',filter:'blur(3px)'},{opacity:1,transform:'translateY(0)',filter:'blur(0)'}],{duration:480,easing:'cubic-bezier(.22,1,.36,1)'});}
    document.querySelector('#filter-announcement').textContent = projectTabs.find(t => t.dataset.project === key)?.textContent + ' project selected';
    window.portfolioI18n?.updateDynamicLabels();
  }
  projectTabs.forEach(tab => tab.addEventListener('click', () => showProject(tab.dataset.project)));
  keyboardTabs(projectTabs, tab => showProject(tab.dataset.project));
  showProject('housing',false);
  function updateThemeLabel() { theme.setAttribute('aria-label', root.dataset.theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'); }
  updateThemeLabel();
  theme.addEventListener('click', () => { root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark'; try { localStorage.setItem('kerry-editorial-paper-theme', root.dataset.theme); } catch {} updateThemeLabel(); window.portfolioI18n?.updateDynamicLabels(); });

  // A two-second introduction, independent of navigation or any network request.
  const percent = loader.querySelector('.loader-percent');
  const track = loader.querySelector('.loader-track span');
  let introFrame;
  function finishIntro() {
    if (introDone) return;
    introDone = true; cancelAnimationFrame(introFrame);
    percent.textContent = '100%'; track.style.transform = 'scaleX(1)';
    main.inert = false; header.inert = false; document.querySelector('footer').inert = false;
    loader.setAttribute('aria-label', 'Portfolio ready');
    root.classList.remove('booting'); root.classList.add('site-entered', 'intro-animating');
    window.portfolioI18n?.updateDynamicLabels();
    setTimeout(() => root.classList.remove('intro-animating'), 1700);
    setTimeout(() => { loader.hidden = true; }, reduced.matches ? 0 : 500);
  }
  loader.querySelector('.skip-intro').addEventListener('click', finishIntro);
  if (reduced.matches) finishIntro();
  else {
    main.inert = true; header.inert = true; document.querySelector('footer').inert = true;
    const start = performance.now(); let previous = -1;
    function tick(now) {
      const fraction = Math.min(1, (now - start) / 2000);
      const value = Math.floor(fraction * 100);
      if (value !== previous) { percent.textContent = `${value}%`; track.style.transform = `scaleX(${fraction})`; previous = value; }
      if (fraction < 1) introFrame = requestAnimationFrame(tick); else finishIntro();
    }
    introFrame = requestAnimationFrame(tick);
  }

  // The new reference uses quiet text/image reveals rather than continuous shaders.
  showPage(location.hash.slice(1));
})();
