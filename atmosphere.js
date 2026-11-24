(() => {
  const root=document.documentElement;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const header=document.querySelector('.site-header');
  const hero=document.querySelector('.hero');
  const stage=document.querySelector('#panel-about');
  const stripes=[...document.querySelectorAll('.stripe-wipe span')];
  const story=document.querySelector('.hero-story');
  const name=document.querySelector('.hero h1');
  const portrait=document.querySelector('.hero-portrait');
  const copy=[document.querySelector('.hero-right'),document.querySelector('.hero-bottom')];
  const clamp=x=>Math.min(1,Math.max(0,x));
  let scrollFrame=0;
  function updateScene(){
    scrollFrame=0;
    const h=header.getBoundingClientRect().height;
    const rect=stage.getBoundingClientRect();
    const travel=Math.max(1,rect.height-hero.getBoundingClientRect().height);
    const p=reduced.matches?0:clamp((h-rect.top)/travel);
    stripes.forEach((bar,i)=>{
      const t=clamp((p-.1-i*.027)/.47);
      const eased=t*t*(3-2*t);
      bar.style.transform=`scaleX(${eased})`;
    });
    const text=clamp((p-.78)/.18);
    story.style.opacity=String(text);
    story.style.transform=`translateY(${(1-text)*18}px)`;
    name.style.translate=reduced.matches?'none':`0 ${p*54}px`;
    portrait.style.translate=reduced.matches?'none':`0 ${p*30}px`;
    copy.forEach(el=>{el.inert=p>.48;el.style.opacity=String(1-clamp((p-.27)/.3));});
    root.classList.toggle('cinema-dark',p>.65&&rect.bottom>h+80);
    root.dataset.wipeProgress=p.toFixed(3);
  }
  function queueScene(){if(!scrollFrame)scrollFrame=requestAnimationFrame(updateScene)}
  function measure(){root.style.setProperty('--header-height',`${header.getBoundingClientRect().height}px`);queueScene();resize();}
  addEventListener('scroll',queueScene,{passive:true});addEventListener('resize',measure,{passive:true});
  new ResizeObserver(measure).observe(header);

  // Soft cream folds: low-contrast diffuse light, not a chrome/reflection shader.
  const canvas=document.querySelector('#cream-canvas');
  let gl,program,renderFrame=0,ready=false,visible=true,lastPaint=0;
  const uniforms={};
  const vertex='attribute vec2 position;varying vec2 uv;void main(){uv=position*.5+.5;gl_Position=vec4(position,0.,1.);}';
  const fragment=`precision mediump float;varying vec2 uv;uniform float time;uniform float aspect;
    float field(vec2 p){float a=sin(p.x*1.42+sin(p.y*1.73+time*.13)*1.8-time*.17);float b=sin(p.y*1.26-p.x*.52+time*.12);float c=sin(p.x*2.1+p.y*1.84+sin(time*.11))*.24;return a*.58+b*.32+c;}
    void main(){vec2 p=(uv-.5)*vec2(aspect,1.)*3.3;float e=.012;float h=field(p);vec2 g=vec2(field(p+vec2(e,0.))-h,field(p+vec2(0.,e))-h)/e;vec3 n=normalize(vec3(-g*.68,1.));float diffuse=dot(n,normalize(vec3(-.7,.55,1.2)));float crease=pow(max(0.,.5+.5*sin(h*3.1+p.x*.44)),9.);float shade=.87+.13*diffuse-crease*.062;vec3 cream=vec3(.97647,.93725,.90588);vec3 color=cream*shade+vec3(1.,.99,.97)*pow(max(diffuse,0.),7.)*.09;gl_FragColor=vec4(clamp(color,0.,1.),1.);}`;
  function compile(type,source){const shader=gl.createShader(type);gl.shaderSource(shader,source);gl.compileShader(shader);if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS))throw Error('Cream shader unavailable');return shader}
  function resize(){if(!ready)return;const r=canvas.getBoundingClientRect();if(!r.width||!r.height)return;const scale=innerWidth<760?.8:1;canvas.width=Math.round(r.width*scale);canvas.height=Math.round(r.height*scale);gl.viewport(0,0,canvas.width,canvas.height);gl.uniform1f(uniforms.aspect,r.width/r.height)}
  function render(now){renderFrame=0;if(!ready||!visible||document.hidden||reduced.matches)return;if(now-lastPaint>33){lastPaint=now;gl.uniform1f(uniforms.time,now*.001);gl.drawArrays(gl.TRIANGLES,0,6)}renderFrame=requestAnimationFrame(render)}
  function activity(){if(renderFrame){cancelAnimationFrame(renderFrame);renderFrame=0}if(ready&&visible&&!document.hidden&&!reduced.matches)renderFrame=requestAnimationFrame(render)}
  try{
    if(!reduced.matches){
      gl=canvas.getContext('webgl',{alpha:false,antialias:false,powerPreference:'low-power'});
      if(gl){program=gl.createProgram();gl.attachShader(program,compile(gl.VERTEX_SHADER,vertex));gl.attachShader(program,compile(gl.FRAGMENT_SHADER,fragment));gl.linkProgram(program);
        if(gl.getProgramParameter(program,gl.LINK_STATUS)){gl.useProgram(program);const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);const pos=gl.getAttribLocation(program,'position');gl.enableVertexAttribArray(pos);gl.vertexAttribPointer(pos,2,gl.FLOAT,false,0,0);uniforms.time=gl.getUniformLocation(program,'time');uniforms.aspect=gl.getUniformLocation(program,'aspect');ready=true;resize();activity();}
      }
    }
  }catch{canvas.hidden=true}
  canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();ready=false;cancelAnimationFrame(renderFrame);canvas.hidden=true});
  new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;activity()},{threshold:0}).observe(hero);
  document.addEventListener('visibilitychange',activity);reduced.addEventListener('change',()=>{activity();queueScene()});
  measure();
})();
