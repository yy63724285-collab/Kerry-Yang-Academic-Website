(() => {
  const root=document.documentElement;
  const select=document.querySelector('#language-select');
  const sectionKeys={about:'t3',education:'t4',projects:'t5',experience:'t6',notes:'t7',contact:'t8'};
  const UI={
    en:['Language','Switch to dark theme','Switch to light theme','Continue to','Portfolio sections','Select a project','project selected','Kerry Yang, home','Opening Kerry Yang’s portfolio','Portfolio ready','A black tote filled with notebooks and everyday objects','Illustration of data points and a least-squares regression line, not project results'],
    'zh-Hans':['语言','切换深色模式','切换浅色模式','继续前往','网站栏目','选择项目','项目已选中','Kerry Yang 主页','正在打开 Kerry Yang 的个人主页','个人主页已准备就绪','装有笔记本和日常物品的黑色托特包','数据点与最小二乘回归线的概念示意，并非项目结果'],
    fr:['Langue','Passer au thème sombre','Passer au thème clair','Continuer vers','Rubriques du portfolio','Choisir un projet','projet sélectionné','Kerry Yang, accueil','Ouverture du portfolio de Kerry Yang','Portfolio prêt','Un cabas noir contenant des carnets et des objets du quotidien','Illustration de points et d’une droite de régression par moindres carrés, et non des résultats du projet'],
    es:['Idioma','Cambiar al tema oscuro','Cambiar al tema claro','Continuar a','Secciones del portafolio','Elegir un proyecto','proyecto seleccionado','Kerry Yang, inicio','Abriendo el portafolio de Kerry Yang','Portafolio listo','Un bolso negro con cuadernos y objetos cotidianos','Ilustración de puntos y una recta de regresión por mínimos cuadrados, no resultados del proyecto'],
    ko:['언어','어두운 테마로 전환','밝은 테마로 전환','다음 섹션:','포트폴리오 메뉴','프로젝트 선택','프로젝트 선택됨','Kerry Yang 홈','Kerry Yang 포트폴리오를 여는 중','포트폴리오 준비 완료','공책과 일상용품이 담긴 검은색 토트백','데이터 점과 최소제곱 회귀선의 개념도이며 실제 프로젝트 결과는 아님'],
    'zh-Hant':['語言','切換深色模式','切換淺色模式','繼續前往','網站欄目','選擇專案','專案已選取','Kerry Yang 首頁','正在開啟 Kerry Yang 的個人網站','個人網站已準備就緒','裝有筆記本與日常物品的黑色托特包','資料點與最小平方法迴歸線的概念示意，並非專案結果'],
    yue:['語言','轉深色模式','轉淺色模式','繼續去','網站欄目','揀項目','項目已揀好','Kerry Yang 主頁','開緊 Kerry Yang 嘅個人網站','個人網站準備好喇','裝住筆記簿同日用品嘅黑色手袋','數據點同最小二乘迴歸線嘅概念示意，唔係項目結果'],
    ja:['言語','ダークテーマに切り替え','ライトテーマに切り替え','次のセクション：','ポートフォリオの項目','プロジェクトを選択','プロジェクトを選択しました','Kerry Yang のホーム','Kerry Yang のポートフォリオを開いています','ポートフォリオの準備完了','ノートや日用品が入った黒いトートバッグ','データ点と最小二乗回帰線の概念図であり、実際のプロジェクト結果ではありません']
  };
  let language='en';
  const text=key=>MESSAGES[language]?.[key]??MESSAGES.en[key]??key;
  function sectionTitle(name){return `${text(sectionKeys[name]||'t3')} | Kerry Yang`;}
  function updateDynamicLabels(){
    const ui=UI[language];
    select.setAttribute('aria-label',ui[0]);document.querySelector('.language-switch .sr-only').textContent=ui[0];
    const theme=document.querySelector('.theme-toggle');theme.setAttribute('aria-label',root.dataset.theme==='dark'?ui[2]:ui[1]);theme.title=theme.getAttribute('aria-label');
    document.querySelector('#navigation').setAttribute('aria-label',ui[4]);
    document.querySelector('.project-filters').setAttribute('aria-label',ui[5]);
    const order=Object.keys(sectionKeys),next=order[order.indexOf(root.dataset.page||'about')+1];
    const arrow=document.querySelector('.next-section');
    if(next){const label=ui[3]+' '+text(sectionKeys[next]);arrow.setAttribute('aria-label',label);arrow.title=label;}
    const chosen=document.querySelector('.project-filters [aria-selected="true"]');
    document.querySelector('#filter-announcement').textContent=chosen?chosen.textContent+' — '+ui[6]:'';
    document.querySelector('.monogram').setAttribute('aria-label',ui[7]);
    const loader=document.querySelector('#intro-loader');loader.setAttribute('aria-label',root.classList.contains('site-entered')?ui[9]:ui[8]);
    document.querySelector('.bag-portrait img').alt=ui[10];
    document.querySelector('.regression-chart').setAttribute('aria-label',ui[11]);
    document.title=sectionTitle(root.dataset.page||'about');
  }
  function applyLanguage(code,save=false){
    if(!MESSAGES[code])code='en';
    const panel=document.querySelector('#panel-'+(root.dataset.page||'about'));
    const before=panel?.getBoundingClientRect().top;
    language=code;root.lang=code==='yue'?'yue-Hant':code;root.dataset.language=code;select.value=code;
    document.querySelectorAll('[data-i18n]').forEach(el=>{
      const key=el.dataset.i18n;
      if(code==='en'){el.innerHTML=MESSAGES.en[key];return;}
      const value=text(key);
      if(key==='t16'||key==='t99'){
        const label=value.replace(/\s*·?\s*PDF\s*$/,'');const badge=document.createElement('span');badge.textContent='PDF';el.replaceChildren(document.createTextNode(label+' '),badge);
      }else{
        const nodes=[];value.split('\n').forEach((line,i)=>{if(i)nodes.push(document.createElement('br'));nodes.push(document.createTextNode(line));});el.replaceChildren(...nodes);
      }
    });
    updateDynamicLabels();
    const description=document.querySelector('meta[name="description"]');if(description)description.content=code==='en'?EN_DESCRIPTION:text('t13');
    if(save){try{localStorage.setItem('kerry-portfolio-language',code)}catch{}}
    window.dispatchEvent(new Event('resize'));
    if(before!==undefined)requestAnimationFrame(()=>{const change=panel.getBoundingClientRect().top-before;if(Math.abs(change)>1)window.scrollBy({top:change,behavior:'instant'});});
  }
  window.portfolioI18n={sectionTitle,updateDynamicLabels,applyLanguage,get language(){return language;}};
  const EN_DESCRIPTION=document.querySelector('meta[name="description"]')?.content||'';
  select.addEventListener('change',()=>applyLanguage(select.value,true));
  let saved='en';try{saved=localStorage.getItem('kerry-portfolio-language')||'en'}catch{}
  applyLanguage(saved);
})();
