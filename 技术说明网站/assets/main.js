/* 易宿技术说明网站 —— 轻交互（原生 JS，无依赖）
   1. 滚动渐显  2. 测深导航高亮当前章节  3. 指标读数计数动画 */

(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- 1. 滚动渐显 ---------- */
  var reveals = document.querySelectorAll('.reveal');
  if (reduceMotion || !('IntersectionObserver' in window)) {
    reveals.forEach(function (el) { el.classList.add('in'); });
  } else {
    var revObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); revObs.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    reveals.forEach(function (el) { revObs.observe(el); });
  }

  /* ---------- 2. 左侧导航高亮 + 滚动进度 ---------- */
  var railLinks = Array.prototype.slice.call(document.querySelectorAll('.side-nav a'));
  var sections = railLinks
    .map(function (a) { return document.getElementById(a.dataset.sec); })
    .filter(Boolean);
  var total = railLinks.length;

  var spFill  = document.getElementById('spFill');
  var tpFill  = document.getElementById('tpFill');
  var spPct   = document.getElementById('spPct');
  var spCount = document.getElementById('spCount');

  function pad2(n) { return (n < 10 ? '0' : '') + n; }

  function setActive(id) {
    var idx = -1;
    railLinks.forEach(function (a, i) {
      var on = a.dataset.sec === id;
      if (on) idx = i;
      a.classList.toggle('active', on);
    });
    // 当前之前的标记为已读
    railLinks.forEach(function (a, i) { a.classList.toggle('done', idx > -1 && i < idx); });
    if (spCount && idx > -1) spCount.textContent = pad2(idx + 1) + ' / ' + pad2(total);
  }

  function updateProgress() {
    var h = document.documentElement;
    var max = h.scrollHeight - h.clientHeight;
    var p = max > 0 ? Math.min(Math.max(h.scrollTop / max, 0), 1) : 0;
    var pct = Math.round(p * 100);
    if (spFill) spFill.style.height = pct + '%';
    if (tpFill) tpFill.style.width = pct + '%';
    if (spPct)  spPct.textContent = pct + '%';
  }

  if ('IntersectionObserver' in window && sections.length) {
    var secObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { setActive(e.target.id); }
      });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
    sections.forEach(function (s) { secObs.observe(s); });
  }

  setActive('demo');
  updateProgress();
  window.addEventListener('scroll', function () {
    if (window.__spTick) return;
    window.__spTick = true;
    requestAnimationFrame(function () { updateProgress(); window.__spTick = false; });
  }, { passive: true });
  window.addEventListener('resize', updateProgress, { passive: true });

  /* ---------- 3. 指标计数动画 ---------- */
  var counters = document.querySelectorAll('[data-count]');
  function runCount(el) {
    var target = parseInt(el.dataset.count, 10) || 0;
    if (reduceMotion) { el.textContent = target; return; }
    var start = performance.now(), dur = 1100;
    function step(now) {
      var p = Math.min((now - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased);
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = target;
    }
    requestAnimationFrame(step);
  }

  if ('IntersectionObserver' in window) {
    var cntObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { runCount(e.target); cntObs.unobserve(e.target); }
      });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { cntObs.observe(el); });
  } else {
    counters.forEach(function (el) { el.textContent = el.dataset.count; });
  }

  /* ---------- 4. 签名时刻：AI 两阶段流式演示 ---------- */
  initAiDemo(reduceMotion);

  /* ---------- 5. 并发防超卖可视化 ---------- */
  initOversell(reduceMotion);

  function initOversell(reduced) {
    var run = document.getElementById('osRun');
    var reqs = document.getElementById('osReqs');
    var booked = document.getElementById('osBooked');
    var fill = document.getElementById('osFill');
    if (!run || !reqs || !booked || !fill) return;

    var tks = [], tok = 0;
    function clr() { tks.forEach(clearTimeout); tks = []; }
    function later(fn, ms) { var t = setTimeout(fn, ms); tks.push(t); return t; }

    function build() {
      reqs.innerHTML = '';
      for (var i = 1; i <= 3; i++) {
        var d = document.createElement('div');
        d.className = 'os-req';
        d.innerHTML = '<span>req#' + i + ' · POST /api/bookings</span><span class="st"></span>';
        reqs.appendChild(d);
      }
      return reqs.querySelectorAll('.os-req');
    }

    function fail(row) { row.classList.remove('run'); row.classList.add('fail'); row.querySelector('.st').textContent = '✗ 售罄（并发冲突）'; }

    function play() {
      clr(); tok++; var my = tok;
      booked.textContent = '0'; fill.style.width = '0%';
      var rows = build();
      run.disabled = true;

      if (reduced) {
        rows[0].classList.add('ok');
        fail(rows[1]); fail(rows[2]);
        booked.textContent = '1'; fill.style.width = '100%'; run.disabled = false;
        return;
      }
      rows.forEach(function (r, i) { later(function () { if (my === tok) r.classList.add('run'); }, 120 + i * 90); });
      later(function () {
        if (my !== tok) return;
        rows[0].classList.remove('run'); rows[0].classList.add('ok');
        booked.textContent = '1'; fill.style.width = '100%';
      }, 720);
      later(function () {
        if (my !== tok) return;
        fail(rows[1]); fail(rows[2]); run.disabled = false;
      }, 1080);
    }

    build();
    run.addEventListener('click', play);

    var done = false;
    if ('IntersectionObserver' in window) {
      var o = new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (e.isIntersecting && !done) { done = true; later(play, 300); o.disconnect(); } });
      }, { threshold: 0.4 });
      o.observe(run.closest('.oversell'));
    }
  }

  function initAiDemo(reduced) {
    var input  = document.getElementById('demoInput');
    var runBtn = document.getElementById('demoRun');
    var chipsEl = document.getElementById('demoChips');
    var jsonEl = document.getElementById('demoJson');
    var queryEl = document.getElementById('demoQuery');
    var streamEl = document.getElementById('demoStream');
    var cardsEl = document.getElementById('demoCards');
    var hintEl = document.getElementById('demoHint');
    if (!input || !runBtn || !jsonEl || !streamEl) return;

    // 场景：query → 真实 schema criteria → 文案 → 结果卡（确定性，无网络）
    var SCENES = [
      {
        query: '找北京性价比高、带早餐的酒店',
        criteria: { destination: '北京', minPrice: null, maxPrice: 600, amenities: ['早餐'], keywords: ['性价比'], sort: 'price_asc' },
        reply: '为你在北京找到 3 家含早餐、口碑不错的高性价比酒店，已按每晚价格从低到高排列。国贸一带交通便利，适合商务出行～',
        cards: [
          { icon: '🏨', name: '北京国贸·亦宿精选', tags: '含早餐 · 地铁 3 分钟 · 商务', price: 398, rating: 4.8 },
          { icon: '🏨', name: '望京 SOHO 智选假日', tags: '含早餐 · 免费停车 · 健身房', price: 452, rating: 4.7 },
          { icon: '🏨', name: '王府井·栖澜居酒店', tags: '含早餐 · 步行街 · 亲子', price: 528, rating: 4.9 }
        ]
      },
      {
        query: '上海外滩安静高分的民宿',
        criteria: { destination: '上海', minPrice: null, maxPrice: null, amenities: ['安静'], keywords: ['外滩', '民宿'], sort: 'rating' },
        reply: '上海外滩周边为你精选 3 家高评分、主打安静的民宿，已按评分排序。江景与老城厢风情都有，很适合度假放松。',
        cards: [
          { icon: '🏡', name: '外滩源·听江隐庐民宿', tags: '江景 · 隔音优 · 高分', price: 688, rating: 4.9 },
          { icon: '🏡', name: '思南公馆·梧桐私宅', tags: '安静 · 老洋房 · 管家', price: 620, rating: 4.9 },
          { icon: '🏡', name: '豫园·墨巷小院', tags: '安静 · 庭院 · 地铁近', price: 540, rating: 4.8 }
        ]
      },
      {
        query: '预算 400 以内、评分高的性价比房',
        criteria: { destination: null, minPrice: null, maxPrice: 400, amenities: [], keywords: ['性价比', '高评分'], sort: 'price_asc' },
        reply: '按 400 元以内预算为你筛出 3 家高评分的高性价比房源，价格从低到高。都是复购率较高的连锁与精选民宿，闭眼入不踩雷。',
        cards: [
          { icon: '🏨', name: '城市之光·智选连锁', tags: '¥300 档 · 高复购 · 干净', price: 268, rating: 4.7 },
          { icon: '🏨', name: '青柠公寓·地铁店', tags: '公寓 · 可做饭 · 安静', price: 328, rating: 4.8 },
          { icon: '🏡', name: '小满民宿·河景房', tags: '河景 · 高分 · 早餐', price: 388, rating: 4.8 }
        ]
      }
    ];

    var timers = [];
    var token = 0;
    function clearTimers() { timers.forEach(clearTimeout); timers = []; }
    function later(fn, ms) { var t = setTimeout(fn, ms); timers.push(t); return t; }

    // JSON 值上色
    function valHtml(v) {
      if (v === null) return '<span class="jnull">null</span>';
      if (typeof v === 'number') return '<span class="jn">' + v + '</span>';
      if (Array.isArray(v)) {
        if (v.length === 0) return '<span class="jp">[]</span>';
        return '<span class="jp">[</span>' + v.map(function (s) { return '<span class="js">"' + s + '"</span>'; }).join('<span class="jp">, </span>') + '<span class="jp">]</span>';
      }
      return '<span class="js">"' + v + '"</span>';
    }
    function buildJsonLines(c) {
      var keys = ['destination', 'minPrice', 'maxPrice', 'amenities', 'keywords', 'sort'];
      var lines = ['<span class="jp">{</span>'];
      keys.forEach(function (k, i) {
        var comma = i < keys.length - 1 ? '<span class="jp">,</span>' : '';
        lines.push('&nbsp;&nbsp;<span class="jk">"' + k + '"</span><span class="jp">:</span> ' + valHtml(c[k]) + comma);
      });
      lines.push('<span class="jp">}</span>');
      return lines;
    }

    function reset() {
      clearTimers(); token++;
      jsonEl.innerHTML = ''; queryEl.className = 'query-line'; queryEl.innerHTML = '';
      streamEl.innerHTML = ''; cardsEl.innerHTML = '';
      if (hintEl) hintEl.style.visibility = 'hidden';
    }

    function renderFinal(scene) {
      // 无动画版（reduced motion）：直接终态
      buildJsonLines(scene.criteria).forEach(function (h) {
        var d = document.createElement('div'); d.className = 'line show'; d.innerHTML = h; jsonEl.appendChild(d);
      });
      queryEl.className = 'query-line show';
      queryEl.innerHTML = '构建 Prisma 查询 → <b>where: { status: \'published\', … }</b>';
      streamEl.textContent = scene.reply;
      scene.cards.forEach(function (c) { cardsEl.appendChild(cardEl(c, true)); });
    }

    function cardEl(c, shown) {
      var el = document.createElement('div');
      el.className = 'hcard' + (shown ? ' show' : '');
      el.innerHTML =
        '<div class="thumb">' + c.icon + '</div>' +
        '<div class="hinfo"><div class="hname">' + c.name + '</div><div class="htags">' + c.tags + '</div></div>' +
        '<div class="hprice"><div class="p">¥' + c.price + '<small>/晚</small></div><div class="r">★ ' + c.rating + '</div></div>';
      return el;
    }

    function play(scene) {
      reset();
      var my = token;
      input.value = scene.query;
      runBtn.disabled = true;
      markChip(scene.query);

      if (reduced) { renderFinal(scene); runBtn.disabled = false; return; }

      // 阶段一：JSON 字段逐行浮现
      var lines = buildJsonLines(scene.criteria);
      lines.forEach(function (h) {
        var d = document.createElement('div'); d.className = 'line'; d.innerHTML = h; jsonEl.appendChild(d);
      });
      var lineEls = jsonEl.querySelectorAll('.line');
      lineEls.forEach(function (d, i) {
        later(function () { if (my === token) d.classList.add('show'); }, 260 + i * 150);
      });

      // 过渡：Prisma 查询
      var afterJson = 260 + lines.length * 150 + 220;
      later(function () {
        if (my !== token) return;
        queryEl.className = 'query-line show';
        queryEl.innerHTML = '构建 Prisma 查询 → <b>where: { status: \'published\', … }</b>';
      }, afterJson);

      // 阶段二：打字机流式
      later(function () { if (my === token) typeStream(scene, my); }, afterJson + 480);
    }

    function typeStream(scene, my) {
      var text = scene.reply, i = 0;
      streamEl.innerHTML = '<span class="cursor"></span>';
      function tick() {
        if (my !== token) return;
        i++;
        streamEl.innerHTML = text.slice(0, i).replace(/</g, '&lt;') + '<span class="cursor"></span>';
        if (i < text.length) { later(tick, 20); }
        else {
          streamEl.textContent = text;           // 去光标
          revealCards(scene, my);
        }
      }
      later(tick, 20);
    }

    function revealCards(scene, my) {
      scene.cards.forEach(function (c) { cardsEl.appendChild(cardEl(c, false)); });
      var els = cardsEl.querySelectorAll('.hcard');
      els.forEach(function (el, i) { later(function () { if (my === token) el.classList.add('show'); }, 180 + i * 160); });
      later(function () { if (my === token) runBtn.disabled = false; }, 180 + els.length * 160);
    }

    function markChip(q) {
      chipsEl.querySelectorAll('.demo-chip').forEach(function (ch) {
        ch.classList.toggle('on', ch.dataset.q === q);
      });
    }
    function pickScene(q) {
      for (var i = 0; i < SCENES.length; i++) { if (SCENES[i].query === q) return SCENES[i]; }
      // 自定义输入：按城市关键词轻量匹配，否则回退首个
      for (var j = 0; j < SCENES.length; j++) {
        var d = SCENES[j].criteria.destination;
        if (d && q.indexOf(d) !== -1) return SCENES[j];
      }
      return SCENES[0];
    }

    // 场景 chip
    SCENES.forEach(function (s, i) {
      var b = document.createElement('button');
      b.className = 'demo-chip' + (i === 0 ? ' on' : '');
      b.type = 'button'; b.dataset.q = s.query; b.textContent = s.query;
      b.addEventListener('click', function () { play(s); });
      chipsEl.appendChild(b);
    });

    runBtn.addEventListener('click', function () { play(pickScene(input.value.trim())); });
    input.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); play(pickScene(input.value.trim())); } });

    // 滚动进入视口自动播放一次
    var played = false;
    if ('IntersectionObserver' in window) {
      var demoObs = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting && !played) { played = true; later(function () { play(SCENES[0]); }, 350); demoObs.disconnect(); }
        });
      }, { threshold: 0.35 });
      demoObs.observe(document.getElementById('demo'));
    } else {
      play(SCENES[0]);
    }
  }

  /* ---------- 6. 可探索请求 trace ---------- */
  initTrace(reduceMotion);

  function initTrace(reduced) {
    var cut = document.getElementById('archCut');
    var log = document.getElementById('archLog');
    var titleEl = document.getElementById('traceTitle');
    var methodEl = document.getElementById('traceMethod');
    var respEl = document.getElementById('traceResp');
    var replay = document.getElementById('traceReplay');
    if (!cut || !log) return;
    var btns = Array.prototype.slice.call(document.querySelectorAll('.trace-bar .tb-btn'));
    var strata = {};
    cut.querySelectorAll('.stratum').forEach(function (s) { strata[s.dataset.l] = s; });

    var TRACE = [
      { title: '受保护请求鉴权', method: 'GET /api/users/profile',
        steps: [
          { l: 1, f: 'services/user.ts', t: '发起 <b>getProfile()</b>' },
          { l: 2, f: 'lib/request.ts', t: '拦截器注入 <b>Authorization: Bearer</b>' },
          { l: 3, f: 'api/utils/auth.ts', t: '<b>verifyAuth()</b> → jwt.verify 验签' },
          { l: 4, f: 'lib/token-blacklist.ts', t: '<b>isTokenBlacklisted()</b> 查 Redis 黑名单' },
          { l: 5, f: 'MySQL', t: '未命中 → <b>prisma.user.findUnique</b>' }
        ], resp: '200 · <b>{ success: true, data: { ...user } }</b>' },
      { title: '在线预订 · 防超卖', method: 'POST /api/bookings',
        steps: [
          { l: 1, f: 'BookingConfirm/index.jsx', t: '小程序提交入住人与日期' },
          { l: 2, f: 'services/booking.js', t: '<b>Taro.request</b> POST body' },
          { l: 3, f: 'api/bookings/route.tsx', t: '<b>verifyAuth()</b> + 日期/归属校验' },
          { l: 4, f: 'prisma.$transaction', t: '逐日 upsert + <b>updateMany(booked &lt; quota)</b>' },
          { l: 5, f: 'MySQL · InnoDB', t: '行锁原子递增；<b>count===0 抛错回滚</b>' }
        ], resp: '201 · <b>{ success:true, data:{ booking } }</b> &nbsp;/&nbsp; 已售罄 → 回滚' },
      { title: 'AI 推荐 · 流式', method: 'POST /api/ai/recommend',
        steps: [
          { l: 1, f: 'AiChatWidget/index.jsx', t: '发送自然语言需求' },
          { l: 2, f: 'fetch · ReadableStream', t: '建立 SSE 流式连接' },
          { l: 3, f: 'api/ai/recommend/route.ts', t: '<b>checkRateLimit</b>(10/h) + verifyAuth' },
          { l: 4, f: 'LangChain + Prisma', t: '阶段一 <b>意图提取(t=0)</b> → hotel.findMany' },
          { l: 5, f: 'MySQL → LLM', t: '取真实酒店 → 阶段二 <b>流式(t=0.7)</b>' }
        ], resp: '200 · <b>text/plain</b> 逐 chunk SSE 回包' }
    ];

    var tks = [], tok = 0;
    function clr() { tks.forEach(clearTimeout); tks = []; }
    function later(fn, ms) { var t = setTimeout(fn, ms); tks.push(t); return t; }
    function resetStrata() { for (var k in strata) { strata[k].classList.remove('on'); strata[k].classList.add('dim'); } }

    function play(idx) {
      clr(); tok++; var my = tok;
      btns.forEach(function (b, i) { b.classList.toggle('on', i === idx); });
      var sc = TRACE[idx];
      titleEl.innerHTML = sc.title; methodEl.textContent = sc.method;
      log.innerHTML = ''; respEl.className = 'tp-resp'; respEl.innerHTML = '';
      resetStrata();

      sc.steps.forEach(function (st) {
        var li = document.createElement('li');
        li.innerHTML = '<span class="lt">L' + st.l + '</span><em>' + st.f + '</em> · ' + st.t;
        log.appendChild(li);
      });
      var lis = log.querySelectorAll('li');

      if (reduced) {
        lis.forEach(function (li) { li.classList.add('show'); });
        for (var k in strata) strata[k].classList.remove('dim');
        respEl.className = 'tp-resp show'; respEl.innerHTML = '响应 &nbsp; ' + sc.resp;
        return;
      }
      sc.steps.forEach(function (st, i) {
        later(function () {
          if (my !== tok) return;
          lis[i].classList.add('show');
          var s = strata[st.l];
          if (s) { s.classList.remove('dim'); s.classList.add('on'); }
        }, 350 + i * 620);
      });
      later(function () {
        if (my !== tok) return;
        respEl.className = 'tp-resp show'; respEl.innerHTML = '响应 &nbsp; ' + sc.resp;
      }, 350 + sc.steps.length * 620 + 200);
    }

    btns.forEach(function (b, i) { b.addEventListener('click', function () { play(i); }); });
    if (replay) replay.addEventListener('click', function () {
      var cur = btns.findIndex(function (b) { return b.classList.contains('on'); });
      play(cur < 0 ? 0 : cur);
    });

    var done = false;
    if ('IntersectionObserver' in window) {
      var o = new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (e.isIntersecting && !done) { done = true; later(function () { play(0); }, 300); o.disconnect(); } });
      }, { threshold: 0.3 });
      o.observe(cut);
    } else { play(0); }
  }

  /* ---------- 7. 交互式 ER 图 ---------- */
  initER();

  function initER() {
    var nodesEl = document.getElementById('erNodes');
    var panelEl = document.getElementById('erPanel');
    if (!nodesEl || !panelEl) return;

    var GROUPS = ['身份与权限', '酒店与房态', '交易与互动', '营销与元数据'];
    var ER = {
      User: { g: 0, tbl: 'users', f: [['id', 'Int · PK'], ['email', 'String @unique'], ['password', 'String'], ['roleId', 'Int? · FK'], ['merchantId', 'Int? · FK→User'], ['points', 'Int']], r: ['Role', 'Hotel', 'Booking', 'Favorite', 'Review', 'Comment', 'UserCoupon'] },
      Role: { g: 0, tbl: 'roles', f: [['id', 'Int · PK'], ['name', 'String'], ['description', 'String?']], r: ['RolePermission', 'User'] },
      Permission: { g: 0, tbl: 'permissions', f: [['id', 'Int · PK'], ['name', 'String'], ['description', 'String?']], r: ['RolePermission'] },
      RolePermission: { g: 0, tbl: 'role_permissions', f: [['roleId', 'FK'], ['permissionId', 'FK'], ['(roleId,permissionId)', '@@id']], r: ['Role', 'Permission'] },
      Hotel: { g: 1, tbl: 'hotels', f: [['id', 'Int · PK'], ['merchantId', 'Int? · FK→User'], ['locationId', 'Int? · FK'], ['status', 'String @index'], ['type', 'String @index'], ['latitude', 'Float?']], r: ['User', 'Location', 'RoomType', 'HotelAuditLog', 'HotelTag', 'Booking', 'Favorite', 'Review', 'Comment'] },
      RoomType: { g: 1, tbl: 'room_types', f: [['id', 'Int · PK'], ['hotelId', 'Int? · FK'], ['price', 'Decimal(10,2)'], ['discount', 'Decimal(3,2)'], ['stock', 'Int']], r: ['Hotel', 'RoomAvailability', 'Booking'] },
      RoomAvailability: { g: 1, tbl: 'room_availability', f: [['id', 'Int · PK'], ['roomTypeId', 'Int · FK'], ['date', 'DateTime'], ['quota', 'Int?'], ['booked', 'Int = 0'], ['(roomTypeId,date)', '@@unique']], r: ['RoomType'] },
      HotelAuditLog: { g: 1, tbl: 'hotel_audit_logs', f: [['id', 'Int · PK'], ['hotelId', 'FK'], ['operatorId', 'FK→User'], ['oldStatus', 'String'], ['newStatus', 'String']], r: ['Hotel', 'User'] },
      Booking: { g: 2, tbl: 'bookings', f: [['id', 'Int · PK'], ['userId', 'FK'], ['hotelId', 'FK'], ['roomTypeId', 'FK'], ['totalPrice', 'Decimal(10,2)'], ['status', 'String'], ['couponId', 'Int?']], r: ['User', 'Hotel', 'RoomType', 'Review'] },
      Review: { g: 2, tbl: 'reviews', f: [['id', 'Int · PK'], ['bookingId', 'Int @unique'], ['userId', 'FK'], ['hotelId', 'FK'], ['rating', 'Int']], r: ['Booking', 'User', 'Hotel'] },
      Comment: { g: 2, tbl: 'comments', f: [['id', 'Int · PK'], ['userId', 'FK'], ['hotelId', 'FK'], ['content', 'String']], r: ['User', 'Hotel'] },
      Favorite: { g: 2, tbl: 'favorites', f: [['userId', 'FK'], ['hotelId', 'FK'], ['(userId,hotelId)', '@@id']], r: ['User', 'Hotel'] },
      Coupon: { g: 3, tbl: 'coupons', f: [['id', 'Int · PK'], ['code', 'String @unique'], ['discount', 'Decimal'], ['pointsCost', 'Int']], r: ['UserCoupon'] },
      UserCoupon: { g: 3, tbl: 'user_coupons', f: [['userId', 'FK'], ['couponId', 'FK'], ['isUsed', 'Boolean']], r: ['User', 'Coupon'] },
      Location: { g: 3, tbl: 'locations', f: [['id', 'Int · PK'], ['name', 'String'], ['parentId', 'Int? · FK→self']], r: ['Hotel', 'Location'] },
      Tag: { g: 3, tbl: 'tags', f: [['id', 'Int · PK'], ['name', 'String']], r: ['HotelTag'] },
      HotelTag: { g: 3, tbl: 'hotel_tags', f: [['hotelId', 'FK'], ['tagId', 'FK'], ['(hotelId,tagId)', '@@id']], r: ['Hotel', 'Tag'] }
    };

    var nodeEls = {};
    GROUPS.forEach(function (gname, gi) {
      var grp = document.createElement('div'); grp.className = 'er-group';
      var h = document.createElement('div'); h.className = 'egh';
      h.innerHTML = '<span class="d" style="background:var(--g' + (gi + 1) + ')"></span>' + gname;
      grp.appendChild(h);
      var chips = document.createElement('div'); chips.className = 'er-chips';
      Object.keys(ER).forEach(function (name) {
        if (ER[name].g !== gi) return;
        var b = document.createElement('button'); b.className = 'er-node'; b.type = 'button';
        b.textContent = name; b.dataset.m = name;
        b.addEventListener('click', function () { select(name); });
        chips.appendChild(b); nodeEls[name] = b;
      });
      grp.appendChild(chips); nodesEl.appendChild(grp);
    });

    /* SVG overlay for relation lines */
    var erSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    erSvg.setAttribute('aria-hidden', 'true');
    erSvg.style.cssText = 'position:absolute;left:0;top:0;width:100%;height:100%;pointer-events:none;overflow:visible;z-index:1;';
    nodesEl.appendChild(erSvg);

    function drawLines(name) {
      while (erSvg.firstChild) erSvg.removeChild(erSvg.firstChild);
      var selEl = nodeEls[name]; if (!selEl) return;
      var cr = nodesEl.getBoundingClientRect();
      var sr = selEl.getBoundingClientRect();
      var sx = sr.left - cr.left + sr.width / 2;
      var sy = sr.top - cr.top + sr.height / 2;
      ER[name].r.forEach(function (rn) {
        var re = nodeEls[rn]; if (!re) return;
        var rr = re.getBoundingClientRect();
        var tx = rr.left - cr.left + rr.width / 2;
        var ty = rr.top - cr.top + rr.height / 2;
        var ln = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        ln.setAttribute('x1', sx); ln.setAttribute('y1', sy);
        ln.setAttribute('x2', tx); ln.setAttribute('y2', ty);
        ln.setAttribute('stroke', 'rgba(237,237,237,0.28)');
        ln.setAttribute('stroke-width', '1');
        ln.setAttribute('stroke-dasharray', '4 3');
        erSvg.appendChild(ln);
      });
    }

    function select(name) {
      var m = ER[name];
      Object.keys(nodeEls).forEach(function (n) {
        nodeEls[n].classList.remove('sel', 'rel');
        if (m.r.indexOf(n) !== -1) nodeEls[n].classList.add('rel');
      });
      nodeEls[name].classList.add('sel');
      drawLines(name);

      var fields = m.f.map(function (fr) {
        var isc = fr[1].indexOf('@@') !== -1 || fr[1].indexOf('@unique') !== -1;
        return '<div class="frow"><span class="fn">' + fr[0] + '</span><span class="ft">' + fr[1] + '</span>' +
          (isc ? '<span class="fb uq">约束</span>' : (/FK|PK/.test(fr[1]) ? '<span class="fb ix">键</span>' : '')) + '</div>';
      }).join('');
      var rels = m.r.map(function (rn) { return '<button type="button" data-m="' + rn + '">→ ' + rn + '</button>'; }).join('');
      panelEl.innerHTML =
        '<div class="eph"><span class="nm">' + name + '</span><span class="tbl">' + m.tbl + '</span></div>' +
        '<div class="epf">' + fields + '</div>' +
        '<div class="er-rel"><div class="rl-h">关联 · ' + m.r.length + '</div><div class="rl-list">' + rels + '</div></div>';
      panelEl.querySelectorAll('.rl-list button').forEach(function (b) {
        b.addEventListener('click', function () { select(b.dataset.m); });
      });
    }

    requestAnimationFrame(function () { select('Booking'); });
  }

  /* ---------- 8. 交互式 API 浏览器 ---------- */
  initApiExplorer();

  function initApiExplorer() {
    var detail = document.getElementById('apiDetail');
    if (!detail) return;
    var rows = Array.prototype.slice.call(document.querySelectorAll('.api-row[data-ep]'));

    var DATA = {
      login: { m: 'POST', path: '/api/auth/login', auth: '公开',
        req: '{\n  "email": "user@demo.com",\n  "password": "••••••"\n}',
        resp: '{\n  "success": true,\n  "token": "eyJhbGciOiJIUzI1NiI...",\n  "refreshToken": "eyJ...",\n  "user": { "id": 12, "role": "user" }\n}',
        note: '签发双 Token（Access 1h / Refresh 7d）· 登录接 Redis 限流' },
      register: { m: 'POST', path: '/api/auth/register', auth: '公开',
        req: '{\n  "email": "m@demo.com",\n  "password": "••••••",\n  "name": "商户A",\n  "role": "merchant"\n}',
        resp: '{\n  "success": true,\n  "user": { "id": 31, "role": "merchant" }\n}',
        note: '密码 bcrypt 哈希（rounds=10）· 邮箱唯一约束去重' },
      hotels: { m: 'GET', path: '/api/hotels', auth: '公开',
        req: 'query:\n  locationId?  minPrice?  minStarRating?\n  status?=published  tags?  page=1  limit=10',
        resp: '{\n  "success": true,\n  "total": 128,\n  "data": [\n    { "id": 1, "nameZh": "…", "roomTypes": [ { "price": "420.00" } ] }\n  ]\n}',
        note: '$transaction([count, findMany]) 消除 N+1 · 服务端分页 10/页' },
      hotelPut: { m: 'PUT', path: '/api/hotels/[id]', auth: 'ADMIN · HOTEL_AUDIT',
        req: '{\n  "status": "published",\n  "rejectionReason": null\n}',
        resp: '{\n  "success": true,\n  "data": { "id": 1, "status": "published" }\n}',
        note: '状态变更与 HotelAuditLog 在同一 $transaction 原子写入' },
      bookings: { m: 'POST', path: '/api/bookings', auth: 'USER',
        req: '{\n  "hotelId": 1,\n  "roomTypeId": 8,\n  "checkInDate": "2026-08-01",\n  "checkOutDate": "2026-08-03",\n  "guestCount": 2,\n  "guestInfo": { "name": "张三", "phone": "138…" }\n}',
        resp: '201 {\n  "success": true,\n  "data": { "id": 501, "totalPrice": "796.00", "status": "pending" }\n}\n\n// 售罄 → 409 { "success": false, "error": "已售罄" }',
        note: '$transaction 逐日 upsert + 条件更新（booked < quota）防超卖' },
      availability: { m: 'POST', path: '/api/room-types/[id]/availability', auth: 'MERCHANT',
        req: '{\n  "data": [\n    { "date": "2026-08-01", "price": 420, "quota": 5 },\n    { "date": "2026-08-02", "isClosed": true }\n  ]\n}',
        resp: '{\n  "success": true,\n  "results": 2\n}',
        note: '$transaction(map(upsert)) 按 (roomTypeId,date) 复合键幂等' },
      reviews: { m: 'POST', path: '/api/reviews', auth: 'USER',
        req: '{\n  "bookingId": 501,\n  "rating": 5,\n  "content": "很棒的入住体验"\n}',
        resp: '{\n  "success": true,\n  "data": { "id": 88 }\n}\n\n// 400 只有已完成的订单才能评价 / 该订单已评价',
        note: '三重校验：订单归属 · 状态 completed/checked_out · bookingId 唯一' },
      claim: { m: 'POST', path: '/api/coupons/[id]/claim', auth: 'USER',
        req: '(无请求体，券 id 在路径中)',
        resp: '{\n  "success": true,\n  "data": { "userId": 12, "couponId": 3 }\n}',
        note: '积分兑换 · UserCoupon 复合键防重复领取' },
      ai: { m: 'POST', path: '/api/ai/recommend', auth: 'USER · 限流 10/h',
        req: '{\n  "messages": [\n    { "role": "user", "content": "找北京带早餐的酒店" }\n  ]\n}',
        resp: '200 · text/plain（SSE 流式）\n\n"为你在北京找到 3 家…"   ← 逐 chunk 回包',
        note: '两阶段：意图提取(t=0, Zod) → 查真实库存 → 流式生成(t=0.7)' },
      upload: { m: 'POST', path: '/api/upload', auth: '需登录',
        req: 'multipart/form-data\n  file: <binary>',
        resp: '{\n  "success": true,\n  "url": "/uploads/1770916-865-x.png"\n}',
        note: '文件名净化 timestamp-random-safeName 防路径穿越' }
    };

    function esc(s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;'); }
    function hl(s) {
      s = esc(s);
      s = s.replace(/(\/\/[^\n]*)/g, '<span class="jc">$1</span>');
      s = s.replace(/("[\w\[\](),]+")(\s*:)/g, '<span class="jk">$1</span>$2');
      s = s.replace(/\b(\d+(?:\.\d+)?)\b/g, '<span class="jn">$1</span>');
      return s;
    }
    function render(ep) {
      var e = DATA[ep]; if (!e) return;
      rows.forEach(function (r) { r.classList.toggle('on', r.dataset.ep === ep); });
      detail.innerHTML =
        '<div class="adh"><span class="m">' + e.m + '</span><span class="path">' + e.path + '</span><span class="auth">' + e.auth + '</span></div>' +
        '<div class="ad-body">' +
          '<div class="ad-box"><div class="abt">请求 · Request</div><pre>' + hl(e.req) + '</pre></div>' +
          '<div class="ad-box"><div class="abt">响应 · Response</div><pre>' + hl(e.resp) + '</pre></div>' +
        '</div>' +
        '<div class="adn">▸ ' + e.note + '</div>';
    }

    rows.forEach(function (r) { r.addEventListener('click', function () { render(r.dataset.ep); }); });
    render('bookings');
  }

  /* ---------- 9. JWT 解码器 ---------- */
  initJwt();
  function initJwt() {
    var box = document.getElementById('jwtPayload');
    if (!box) return;
    box.innerHTML =
      '<span class="jp">{</span>\n' +
      '  <span class="jk">"userId"</span>: <span class="jn">12</span>,\n' +
      '  <span class="jk">"email"</span>: <span class="js">"m@demo.com"</span>,\n' +
      '  <span class="jk">"role"</span>: <span class="js">"merchant"</span>,\n' +
      '  <span class="jk">"roleId"</span>: <span class="jn">3</span>,\n' +
      '  <span class="jk">"merchantId"</span>: <span class="js">null</span>,\n' +
      '  <span class="jk">"iat"</span>: <span class="jn">1770000000</span>,\n' +
      '  <span class="jk">"exp"</span>: <span class="jn">1770003600</span>\n' +
      '<span class="jp">}</span>';
    box.style.whiteSpace = 'pre';
  }

  /* ---------- 10. 限流可视化 ---------- */
  initRateLimit();
  function initRateLimit() {
    var btn = document.getElementById('rlBtn');
    var reset = document.getElementById('rlReset');
    var nEl = document.getElementById('rlN');
    var fill = document.getElementById('rlFill');
    var log = document.getElementById('rlLog');
    var bar = fill ? fill.parentNode : null;
    if (!btn || !nEl || !fill || !log) return;
    var n = 0, LIMIT = 10;
    function hit() {
      n++;
      var ok = n <= LIMIT;
      nEl.textContent = Math.min(n, LIMIT);
      fill.style.width = (Math.min(n, LIMIT) / LIMIT * 100) + '%';
      bar.classList.toggle('over', n > LIMIT);
      var s = document.createElement('span');
      s.className = ok ? 'ok' : 'blocked';
      s.textContent = ok ? '200' : '429';
      log.appendChild(s);
    }
    function clr() { n = 0; nEl.textContent = '0'; fill.style.width = '0%'; bar.classList.remove('over'); log.innerHTML = ''; }
    btn.addEventListener('click', hit);
    if (reset) reset.addEventListener('click', clr);
  }

  /* ---------- 11. 权限模拟器 ---------- */
  initPermSim();
  function initPermSim() {
    var table = document.getElementById('rbacTable');
    var sum = document.getElementById('psSum');
    if (!table) return;
    var btns = Array.prototype.slice.call(document.querySelectorAll('.ps-btn'));
    var headCells = table.querySelectorAll('thead th');
    var rows = table.querySelectorAll('tbody tr');

    function pick(col) {
      btns.forEach(function (b) { b.classList.toggle('on', +b.dataset.col === col); });
      headCells.forEach(function (th, i) { th.classList.toggle('col-on', i === col); });
      var allowed = 0;
      rows.forEach(function (tr) {
        tr.querySelectorAll('td').forEach(function (td, i) { td.classList.toggle('col-on', i === col); });
        var cell = tr.children[col];
        if (cell && !cell.classList.contains('no')) allowed++;
      });
      if (sum) sum.textContent = '可访问 ' + allowed + ' / ' + rows.length + ' 项';
    }
    btns.forEach(function (b) { b.addEventListener('click', function () { pick(+b.dataset.col); }); });
    pick(1);
  }
})();
