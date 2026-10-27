// 공통 머리말·꼬리말과 각 페이지 본문을 그립니다.
// 홈페이지 내용은 이 파일이 아니라 data 폴더의 .yml 파일에서 고칩니다.

// 첫 화면(index.html)은 메뉴에 두지 않고, 왼쪽 위 연구실 이름을 누르면 이동
const NAV = [
  { label: 'RESEARCH', href: 'research.html' },
  { label: 'GROUP', href: 'pi.html', children: [
    { label: 'PI', href: 'pi.html' },
    { label: 'CURRENT', href: 'members.html' },
    { label: 'ALUMNI', href: 'alumni.html' },
  ] },
  { label: 'PUBLICATIONS', href: 'publications.html' },
  { label: 'NEWS', href: 'news.html' },
];

// 논문 저자 목록에서 굵게 표시할 교수 이름
const PI_NAMES = /(Kwon[-‐ ]Hyung Lee|K\.[-‐ ]?H\. Lee)/g;

// 선 아이콘 (메일·위치·메뉴). 한 가지 굵기로 그린 SVG
const ICON_PATHS = {
  mail: '<rect x="3" y="5" width="18" height="14"/><path d="M3 7l9 6 9-6"/>',
  pin: '<path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  close: '<path d="M6 6l12 12M18 6L6 18"/>',
};
const icon = (name) => `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true">${ICON_PATHS[name]}</svg>`;

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const list = (x) => (Array.isArray(x) ? x : []);

async function load(name) {
  const res = await fetch(`data/${name}.yml`, { cache: 'no-cache' });
  if (!res.ok) throw new Error(`data/${name}.yml 파일을 찾을 수 없습니다.`);
  try {
    return jsyaml.load(await res.text()) ?? {};
  } catch (e) {
    throw new Error(`data/${name}.yml 형식 오류 (${e.mark ? `${e.mark.line + 1}번째 줄` : ''}): ${e.reason || e.message}`);
  }
}

function fmtDate(d) {
  if (d instanceof Date) return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
  return String(d ?? '').replace(/-/g, '.');
}

function sortKey(d) {
  return d instanceof Date ? d.toISOString() : String(d ?? '').replace(/\./g, '-');
}

// 문장 속 웹 주소를 "자세히 보기" 링크로 바꿈 (괄호로 감싼 주소도 처리)
function linkify(text) {
  return esc(text).replace(/\s*\(?\s*(https?:\/\/[^\s)]+)\s*\)?/g, (_, url) => ` <a href="${url}" target="_blank" rel="noopener">자세히 보기</a>`);
}

function doiLink(doi) {
  return doi ? ` <a href="https://doi.org/${esc(doi)}" target="_blank" rel="noopener">DOI: ${esc(doi)}</a>` : '';
}

/* ---------- 머리말 / 꼬리말 ---------- */

function renderHeader(site, page) {
  const here = `${page}.html`.replace('home.html', 'index.html');
  const isActive = (item) => item.href === here || list(item.children).some((c) => c.href === here);
  const items = NAV.map((item) => `
    <li>
      <a href="${item.href}" class="${isActive(item) ? 'active' : ''}">${item.label}</a>
      ${item.children ? `<ul class="sub">${item.children.map((c) => `<li><a href="${c.href}" class="${c.href === here ? 'active' : ''}">${c.label}</a></li>`).join('')}</ul>` : ''}
    </li>`).join('');
  return `
    <div class="wrap">
      <a class="brand" href="index.html"><strong>${esc(site.name_ko)}</strong><span>${esc(site.name_en)}</span></a>
      <button class="menu-btn" type="button" aria-label="메뉴 열기" aria-expanded="false" aria-controls="site-nav">${icon('menu')}</button>
      <ul class="nav" id="site-nav">${items}</ul>
    </div>`;
}

function renderFooter(site) {
  return `
    <div class="wrap">
      <div>
        <strong>${esc(site.name_ko)}</strong>
        <p>${esc(site.name_en)} · ${esc(site.short_name)}</p>
        <p>${esc(site.affiliation)}</p>
      </div>
      <div>
        <p>${esc(site.address)}</p>
        <p>Email <a href="mailto:${esc(site.email)}">${esc(site.email)}</a> · Tel ${esc(site.phone)}</p>
        <p>${list(site.links).map((l) => `<a href="${esc(l.url)}" target="_blank" rel="noopener">${esc(l.label)}</a>`).join(' · ')}</p>
      </div>
    </div>`;
}

// 상단 배너 배경 그림 (site.yml 의 header_image). 왼쪽을 어둡게 덮어 글씨가 잘 보이게 함
let HEADER_IMAGE = '';
function headerBg(left, right) {
  if (!HEADER_IMAGE) return '';
  return ` style="background-image: linear-gradient(90deg, rgba(0,0,0,${left}) 0%, rgba(0,0,0,${left - 0.1}) 45%, rgba(0,0,0,${right}) 80%), url('${esc(HEADER_IMAGE)}')"`;
}

function pageHead(title, desc) {
  return `<section class="page-head"${headerBg(0.92, 0.55)}><div class="wrap"><h1>${esc(title)}</h1>${desc ? `<p>${esc(desc)}</p>` : ''}</div></section>`;
}

function recruitBlock(site) {
  const r = site.recruit || {};
  return `
    <div class="recruit">
      <div>
        <h2>${esc(r.title)}</h2>
        <p>${esc(r.body)}</p>
        <div class="tags">${list(r.targets).map((t) => `<span>${esc(t)}</span>`).join('')}</div>
      </div>
      <div class="contact">
        <div>${icon('mail')}<a href="mailto:${esc(site.email)}">${esc(site.email)}</a></div>
        <div>${icon('pin')}<span>${esc(r.visit)}</span></div>
        <div class="note">${esc(r.note)}</div>
      </div>
    </div>`;
}

function newsItems(items) {
  return `<div class="news-list">${items.map((n) => `
    <article class="card news-item">
      <time>${esc(fmtDate(n.date))}</time>
      <div>
        <h3>${esc(n.title)}</h3>
        <p>${esc(n.body)}</p>
        ${n.link ? `<p style="margin-top:6px"><a href="${esc(n.link)}" target="_blank" rel="noopener">${esc(n.link_label || '자세히 보기')} →</a></p>` : ''}
        ${n.image ? `<img src="${esc(n.image)}" alt="${esc(n.title)}">` : ''}
      </div>
    </article>`).join('')}</div>`;
}

const sortedNews = (news) => list(news).slice().sort((a, b) => sortKey(b.date).localeCompare(sortKey(a.date)));

/* ---------- 페이지 ---------- */

const PAGES = {
  async home(site) {
    const [research, news] = await Promise.all([load('research'), load('news')]);
    const h = site.hero || {};
    return `
      <section class="hero"${headerBg(0.9, 0.35)}><div class="wrap">
        <div>
          <h1>${esc(h.headline)}</h1>
          <p>${esc(h.intro)}</p>
          <div class="actions"><a class="btn" href="research.html">연구 분야 보기</a><a class="btn ghost" href="#join">함께하기</a></div>
        </div>
      </div></section>

      <section class="section"><div class="wrap">
        <h2>우리가 도전하는 문제</h2>
        <div class="pillars">${list(research.topics).map((t, i) => `
          <a class="card pillar" href="research.html#${esc(t.id)}">
            ${(t.thumb || list(t.images)[0]) ? `<div class="thumb"><img src="${esc(t.thumb || t.images[0])}" alt="${esc(t.title)}" loading="lazy"></div>` : ''}
            <div class="num">${String(i + 1).padStart(2, '0')}</div>
            <h3>${esc(t.title_ko)}</h3>
            <p class="en">${esc(t.title)}</p>
            <p>${esc(t.summary)}</p>
          </a>`).join('')}</div>
      </div></section>

      <section class="section" style="padding-top:0"><div class="wrap">
        <h2>최근 소식</h2>
        ${newsItems(sortedNews(news).slice(0, 3))}
        <p class="muted" style="margin-top:14px"><a href="news.html">모든 소식 보기 →</a></p>
      </div></section>

      <section class="section" id="join" style="padding-top:0"><div class="wrap">${recruitBlock(site)}</div></section>

      ${site.map_query ? `
      <section class="section map" id="location" style="padding-top:0"><div class="wrap">
        <h2>오시는 길</h2>
        <iframe src="https://maps.google.com/maps?q=${encodeURIComponent(site.map_query)}&z=17&hl=ko&output=embed" loading="lazy" referrerpolicy="no-referrer-when-downgrade" title="연구실 위치 지도"></iframe>
        <p>${esc(site.address)} · <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(site.map_query)}" target="_blank" rel="noopener">Google 지도에서 열기 →</a></p>
      </div></section>` : ''}`;
  },

  async pi() {
    const p = await load('pi');
    const rows = (items) => `<ul>${list(items).map((x) => `<li><span class="yr">${esc(x.year)}</span><span>${esc(x.text)}</span></li>`).join('')}</ul>`;
    return `
      ${pageHead('연구책임자')}
      <section class="section"><div class="wrap pi">
        <div>
          <div class="photo"><img src="${esc(p.photo)}" alt="${esc(p.name_ko)} 교수"></div>
          <div class="card contact">
            ${p.email ? `<div><b>Email</b><a href="mailto:${esc(p.email)}">${esc(p.email)}</a></div>` : ''}
            ${p.phone ? `<div><b>Tel</b><span>${esc(p.phone)}</span></div>` : ''}
            ${p.office ? `<div><b>Office</b><span>${esc(p.office)}</span></div>` : ''}
          </div>
          <div class="links">${list(p.links).map((l) => `<a href="${esc(l.url)}" target="_blank" rel="noopener">${esc(l.label)}</a>`).join('')}</div>
        </div>
        <div class="cv">
          <h2 class="name">${esc(p.name_ko)} <span class="muted" style="font-size:20px;font-weight:500">${esc(p.name_en)}</span></h2>
          <p class="title">${esc(p.title)} · ${esc(p.affiliation)}</p>
          ${p.bio ? `<p>${esc(p.bio)}</p>` : ''}
          <h3>EDUCATION</h3>${rows(p.education)}
          <h3>CAREER</h3>${rows(p.career)}
          <h3>AWARDS</h3>${rows(p.awards)}
          ${list(p.teaching).length ? `<h3>TEACHING</h3><div class="chips">${list(p.teaching).map((t) => `<span>${esc(t)}</span>`).join('')}</div>` : ''}
        </div>
      </div></section>`;
  },

  async research() {
    const r = await load('research');
    const ref = (x) => `<li><span class="t">${esc(x.title)}</span><br><i>${esc(x.journal)}</i> (${esc(x.year)})${doiLink(x.doi)}</li>`;
    const topics = list(r.topics).map((t, i) => `
      <section class="topic" id="${esc(t.id)}"><div class="wrap">
        <div class="head"><span class="num">${String(i + 1).padStart(2, '0')}</span><div><h2>${esc(t.title)}</h2><p class="ko">${esc(t.title_ko)}</p></div></div>
        <p class="desc">${esc(t.description)}</p>
        ${list(t.images).length ? `<div class="gallery">${list(t.images).map((src) => `<figure><img src="${esc(src)}" alt="${esc(t.title)} 연구 그림" tabindex="0" role="button" aria-label="${esc(t.title)} 연구 그림 크게 보기"></figure>`).join('')}</div>` : ''}
        ${list(t.papers).length ? `<h3>REPRESENTATIVE PAPERS</h3><ul class="refs">${list(t.papers).map(ref).join('')}</ul>` : ''}
      </div></section>`).join('');
    const projects = list(r.projects).length ? `
      <section class="section"><div class="wrap cv">
        <h2>수행 과제</h2>
        <ul class="projects">${list(r.projects).map((p) => `<li><span><b>${esc(p.title)}</b><br><span class="meta">${[p.agency, p.period, p.role].filter(Boolean).map(esc).join(' · ')}</span></span></li>`).join('')}</ul>
      </div></section>` : '';
    return `${pageHead('연구 분야', r.intro)}${topics}${projects}<div class="lightbox" role="dialog" aria-label="연구 그림 크게 보기"><img alt=""></div>`;
  },

  async members(site) {
    const m = await load('members');
    const current = list(m.current);
    const body = current.length ? `
      <div class="members">${current.map((p) => `
        <div class="card member">
          ${p.photo ? `<img src="${esc(p.photo)}" alt="${esc(p.name_ko)}">` : ''}
          <h3>${esc(p.name_ko)} <span class="muted" style="font-weight:500;font-size:14px">${esc(p.name_en)}</span></h3>
          <div class="role">${esc(p.position)}${p.since ? ` · ${esc(p.since)}~` : ''}</div>
          ${p.topic ? `<p>${esc(p.topic)}</p>` : ''}
          ${p.education ? `<p>${esc(p.education)}</p>` : ''}
          ${p.email ? `<p><a href="mailto:${esc(p.email)}">${esc(p.email)}</a></p>` : ''}
        </div>`).join('')}</div>
      <div style="margin-top:48px">${recruitBlock(site)}</div>` : waitingBlock(site);
    return `${pageHead('구성원')}<section class="section"><div class="wrap">${body}</div></section>`;
  },

  async alumni() {
    const m = await load('members');
    const alumni = list(m.alumni);
    const body = alumni.length ? `
      <table class="list"><thead><tr><th>이름</th><th>학위</th><th>기간</th><th>학위논문</th><th>현재 소속</th></tr></thead>
      <tbody>${alumni.map((a) => `<tr><td>${esc(a.name)}</td><td>${esc(a.degree)}</td><td>${esc(a.period)}</td><td>${esc(a.thesis)}</td><td>${esc(a.now)}</td></tr>`).join('')}</tbody></table>`
      : `<div class="card" style="text-align:center;padding:48px 24px"><h2 style="margin:0 0 8px">첫 번째 졸업생을 기다리고 있습니다</h2><p class="muted" style="margin:0">이 표의 첫 줄은 당신의 이름으로 채워질 수 있습니다. <a href="members.html">함께하기 →</a></p></div>`;
    return `${pageHead('졸업생')}<section class="section"><div class="wrap">${body}</div></section>`;
  },

  async publications() {
    const pubs = list(await load('publications'));
    const shown = pubs.slice().sort((a, b) => (b.year || 0) - (a.year || 0));
    let n = shown.length;
    const years = [...new Set(shown.map((p) => p.year))];
    return `
      ${pageHead('논문')}
      <section class="section"><div class="wrap">
        ${years.map((y) => `
          <div class="year">${esc(y)}</div>
          <ol class="pubs">${shown.filter((p) => p.year === y).map((p) => `
            <li class="pub">
              <span class="no">[${n--}]</span>
              <div>
                <div class="t">${esc(p.title)}</div>
                <div class="a">${esc(p.authors).replace(PI_NAMES, '<b>$1</b>')}</div>
                <div class="j"><i>${esc(p.journal)}</i>${p.volume ? `, ${esc(p.volume)}` : ''}${p.pages ? `, ${esc(p.pages)}` : ''} (${esc(p.year)})${doiLink(p.doi)}</div>
                ${[].concat(p.highlights ?? []).length ? `<div class="hl">${[].concat(p.highlights).map(linkify).join(' · ')}</div>` : ''}
              </div>
            </li>`).join('')}</ol>`).join('')}
      </div></section>`;
  },

  async news() {
    const news = await load('news');
    return `${pageHead('연구실 소식')}<section class="section"><div class="wrap">${newsItems(sortedNews(news))}</div></section>`;
  },
};

// 구성원이 없을 때 보여 주는 "당신을 기다립니다" 배터리 그림
function waitingBlock(site) {
  const cell = (x, cls, label, sub) => `
    <rect x="${x}" y="78" width="80" height="124" class="${cls}"
      ${cls === 'cell-pi' ? 'fill="url(#charge)"' : cls === 'cell-you' ? 'fill="#1f6fc0" stroke="#1f6fc0" stroke-width="3" stroke-dasharray="8 6"' : 'fill="none" stroke="#b5ab98" stroke-width="3" stroke-dasharray="8 6"'}/>
    <text x="${x + 40}" y="${sub ? 140 : 150}" text-anchor="middle" font-size="${label.length > 2 ? 20 : 26}" font-weight="800" fill="${cls === 'cell-pi' ? '#fff' : cls === 'cell-you' ? '#111111' : '#b5ab98'}">${label}</text>
    ${sub ? `<text x="${x + 40}" y="166" text-anchor="middle" font-size="12" fill="${cls === 'cell-pi' ? '#e0f0ff' : '#2a2a2a'}">${sub}</text>` : ''}`;
  return `
    <div class="waiting">
      <div>
        <h2>이 자리,<br>당신을 위해 비워 두었습니다.</h2>
        <p>${esc(site.name_ko)}는 지금 첫 구성원을 기다리고 있습니다. 배터리는 셀이 하나씩 연결될 때마다 더 큰 힘을 냅니다. 다음에 연결될 셀은 당신입니다.</p>
        <p class="muted">${list(site.recruit?.targets).map(esc).join(' · ')} 모집 중</p>
        <p class="muted contact-line">
          <span>${icon('mail')}<a href="mailto:${esc(site.email)}">${esc(site.email)}</a></span>
          <span>${icon('pin')}${esc(site.recruit?.visit)}</span></p>
      </div>
      <svg viewBox="0 0 640 280" role="img" aria-label="한 칸만 충전된 배터리, 다음 칸에 YOU라고 적혀 있음">
        <defs><linearGradient id="charge" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5fb0ff"/><stop offset="1" stop-color="#1f6fc0"/></linearGradient></defs>
        <rect x="40" y="56" width="520" height="168" fill="#fffdf8" stroke="#111111" stroke-width="8"/>
        <rect x="562" y="106" width="34" height="68" fill="#111111"/>
        ${cell(66, 'cell-pi', 'PI', '연결됨')}
        ${cell(162, 'cell-you', 'YOU', '연결 대기')}
        ${cell(258, 'cell-empty', '?')}
        ${cell(354, 'cell-empty', '?')}
        ${cell(450, 'cell-empty', '?')}
        <path class="bolt" d="M318 6 L298 40 L314 40 L304 66 L332 30 L316 30 L328 6 Z" fill="#f5b700"/>
        <text x="300" y="262" text-anchor="middle" font-size="16" fill="#2a2a2a" font-weight="600">충전 대기 중 · 20%</text>
      </svg>
    </div>`;
}

/* ---------- 시작 ---------- */

(async function main() {
  const page = document.body.dataset.page;
  const header = document.querySelector('header');
  const app = document.getElementById('app');
  try {
    const site = await load('site');
    HEADER_IMAGE = site.header_image || '';
    document.title = `${({ home: '', pi: 'PI', research: 'Research', members: 'Group', alumni: 'Alumni', publications: 'Publications', news: 'News' })[page] || ''}${page === 'home' ? '' : ' | '}${site.name_ko}`;
    header.innerHTML = renderHeader(site, page);
    document.querySelector('footer').innerHTML = renderFooter(site);
    app.innerHTML = await PAGES[page](site);
    // 가로로 긴 그림은 한 줄 전체를 쓰도록
    document.querySelectorAll('.gallery img').forEach((img) => {
      const fit = () => img.parentElement.classList.toggle('wide', img.naturalWidth / img.naturalHeight > 2);
      img.complete ? fit() : img.addEventListener('load', fit);
    });
    // 연구 그림 크게 보기: 클릭·Enter로 열고, 클릭·Esc로 닫음
    const lb = document.querySelector('.lightbox');
    let opener = null;
    const closeLb = () => { lb.classList.remove('open'); opener?.focus(); };
    document.querySelectorAll('.gallery img').forEach((img) => {
      const open = () => {
        opener = img;
        lb.querySelector('img').src = img.src;
        lb.querySelector('img').alt = img.alt;
        lb.classList.add('open');
      };
      img.addEventListener('click', open);
      img.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } });
    });
    lb?.addEventListener('click', closeLb);

    // 모바일 메뉴 열기·닫기
    const nav = document.getElementById('site-nav');
    const menuBtn = document.querySelector('.menu-btn');
    const setMenu = (open) => {
      nav.classList.toggle('open', open);
      menuBtn.setAttribute('aria-expanded', String(open));
      menuBtn.setAttribute('aria-label', open ? '메뉴 닫기' : '메뉴 열기');
      menuBtn.innerHTML = icon(open ? 'close' : 'menu');
    };
    menuBtn.addEventListener('click', () => setMenu(!nav.classList.contains('open')));

    addEventListener('keydown', (e) => {
      if (e.key !== 'Escape') return;
      if (lb?.classList.contains('open')) closeLb();
      if (nav.classList.contains('open')) { setMenu(false); menuBtn.focus(); }
    });
    // #주소로 들어온 경우: 바로 해당 위치로 이동하고, 위쪽 그림이 불러와지며 위치가 밀리면 다시 맞춤
    if (location.hash) {
      history.scrollRestoration = 'manual';
      const target = document.getElementById(decodeURIComponent(location.hash.slice(1)));
      if (target) {
        let userMoved = false;
        const stop = () => { userMoved = true; };
        ['wheel', 'touchstart', 'keydown', 'mousedown'].forEach((ev) => addEventListener(ev, stop, { once: true, passive: true }));
        const go = () => { if (!userMoved) target.scrollIntoView({ behavior: 'instant' }); };
        go();
        app.querySelectorAll('img').forEach((img) => { if (!img.complete) img.addEventListener('load', go); });
      }
    }
  } catch (e) {
    app.innerHTML = `<div class="wrap"><div class="error"><b>페이지를 불러오지 못했습니다.</b><br>${esc(e.message)}</div></div>`;
    console.error(e);
  }
})();
