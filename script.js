(()=> {
  const bp = 768;

  // Desktop nav indicator
  const nav = document.getElementById('mainnav');
  const indicator = document.getElementById('navIndicator');

  function keyFromPath(){
    const p = location.pathname.toLowerCase();
    if (p.includes('/projects/')) return 'works'; // ← 新增这一行，放最前面
    if (p.includes('works')) return 'works';
    if (p.includes('storyboards')) return 'storyboards';
    if (p.includes('indie')) return 'indie';
    if (p.includes('about')) return 'about';
    return 'reel';
  }

  function moveTo(el){
    if(!nav || !indicator || !el) return;
    indicator.style.left = (el.offsetLeft - 9) + 'px';
    indicator.style.width = (el.offsetWidth + 18) + 'px';
  }
  if (nav && indicator){
    const key = keyFromPath();
    let current = nav.querySelector(`a[data-key="${key}"]`) || nav.querySelector('a[data-key]');
    moveTo(current);
    const links = nav.querySelectorAll('a[data-key]');
    links.forEach(a=>{
      a.addEventListener('mouseenter',()=>moveTo(a));
      a.addEventListener('mouseleave',()=>moveTo(current));
      a.addEventListener('focus',()=>moveTo(a));
      a.addEventListener('blur',()=>moveTo(current));
      a.addEventListener('click',()=>{ current = a; moveTo(current); });
    });
    window.addEventListener('resize',()=> moveTo(current));
  }

  // Mobile menu
  const burger = document.getElementById('hamburger');
  const menu = document.getElementById('mobileMenu');
  function closeMenu(){ if(menu){ menu.hidden=true; menu.style.display='none'; } burger?.setAttribute('aria-expanded','false'); }
  function openMenu(){ if(menu){ menu.hidden=false; menu.style.display='block'; } burger?.setAttribute('aria-expanded','true'); }
  burger?.addEventListener('click', ()=> (burger.getAttribute('aria-expanded')==='true') ? closeMenu() : openMenu());
  window.addEventListener('resize', ()=>{ if(window.innerWidth>bp) closeMenu(); });
})();

/* ===== Works：卡片入场 & 阶梯化 ===== */
(() => {
  const grid = document.querySelector('.motion-grid');
  if (!grid) return;

  const cards = grid.querySelectorAll('.motion-card');
  if (!cards.length) return;

  // 给每张卡片设置一个序号，用于阶梯延迟
  cards.forEach((card, i) => card.style.setProperty('--i', i));

  // 进入视口时加 in-view；只触发一次
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('in-view');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.15 });

  cards.forEach(c => io.observe(c));
})();


/* ===== 详情页翻页：上一条 / 返回 Works / 下一条 ===== */
/* 维护你所有项目的顺序和路径 */
window.WORKS_INDEX = [
  { slug: '/projects/sweeten.html', title: 'Sweeten Your World | Donuts Commercial' },
  { slug: '/projects/AnInterView.html',      title: 'An InterView | Frame-by-frame Animation' },
  { slug: '/projects/Ashwaganda.html',        title: 'Calm the Chaos | Ashwaganda Commercial' },
  { slug: '/projects/RobBHood.html',        title: 'Rob-B-Hood | freeze-frame character intro' },
  { slug: '/projects/daydaydream.html',        title: 'Day Day Dream| Camera Track Study' },
  { slug: '/projects/namelogo.html',        title: 'Rob-B-Hood | freeze-frame character intro' },
  // …按你的真实文件继续添加
];

(() => {
  const pager = document.getElementById('projectPager');
  if (!pager || !Array.isArray(window.WORKS_INDEX)) return;

  // 规范化当前路径用于匹配
  const cur = location.pathname.replace(/index\.html$/,'').replace(/\/+$/,'');
  const idx = window.WORKS_INDEX.findIndex(p => cur.endsWith(p.slug.replace(/\/+$/,'')));
  if (idx < 0) return;

  const prev = window.WORKS_INDEX[idx-1];
  const next = window.WORKS_INDEX[idx+1];
  const backHref = '/works.html';          // 你的 Works 列表页路径

  pager.innerHTML = `
    ${prev ? `
      <a class="prev" href="${prev.slug}" aria-label="Previous project: ${prev.title}">
        <span class="label">← Previous</span>
        <span class="title">${prev.title}</span>
      </a>` : `<span></span>`}

    <a class="back" href="${backHref}" aria-label="Back to Works">Back to Works</a>

    ${next ? `
      <a class="next" href="${next.slug}" aria-label="Next project: ${next.title}">
        <span class="label">Next →</span>
        <span class="title">${next.title}</span>
      </a>` : `<span></span>`}
  `;
})();

(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const io = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;

      // 普通单个元素
      if (el.classList.contains('fade-up')) {
        el.classList.add('is-in');
      }

      // 容器内错峰
      if (el.classList.contains('stagger')) {
        el.classList.add('is-in');
        // 子元素做级联延时
        const items = Array.from(el.children);
        items.forEach((child, i) => {
          child.style.transitionDelay = `${Math.min(i * 70, 400)}ms`;
        });
      }

      obs.unobserve(el); // 只播一次
    });
  }, { rootMargin: '0px 0px -10% 0px', threshold: 0.15 });

  document.querySelectorAll('.fade-up, .stagger').forEach(el => io.observe(el));
})();

// === 提前触发设置 ===
const PRE_TRIGGER = 300; // 提前 300px 进入视口就算可见

// 1) IntersectionObserver：往前预触发
const io = new IntersectionObserver((entries, obs) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el = entry.target;

    if (el.classList.contains('fade-up')) {
      el.classList.add('is-in');
    }

    if (el.classList.contains('stagger')) {
      el.classList.add('is-in');
      Array.from(el.children).forEach((child, i) => {
        child.style.transitionDelay = `${Math.min(i * 70, 400)}ms`;
      });
    }

    obs.unobserve(el); // 只执行一次
  });
}, {
  rootMargin: `${PRE_TRIGGER}px 0px`,
  threshold: 0.01
});

// 把需要动画的元素交给 IO
document.querySelectorAll('.fade-up, .stagger').forEach(el => io.observe(el));

// 2) 首屏 & 资源加载后手动检查一次（不用等滚动）
function revealNow() {
  const els = document.querySelectorAll('.fade-up:not(.is-in), .stagger:not(.is-in)');
  els.forEach(el => {
    const rect = el.getBoundingClientRect();
    if (rect.top <= window.innerHeight + PRE_TRIGGER) {
      el.classList.add('is-in');
      if (el.classList.contains('stagger')) {
        Array.from(el.children).forEach((child, i) => {
          child.style.transitionDelay = `${Math.min(i * 70, 400)}ms`;
        });
      }
    }
  });
}

window.addEventListener('DOMContentLoaded', revealNow);
window.addEventListener('load', revealNow);      // 字体/图片/布局稳定后再检查
window.addEventListener('resize', revealNow);
setTimeout(revealNow, 600);                      // 避免懒加载导致的迟到
