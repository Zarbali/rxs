var supabaseClient = null;

window.doDiscordLogin = function() {
    if (typeof SUPABASE_CONFIG === 'undefined' || !SUPABASE_CONFIG.url || !SUPABASE_CONFIG.anonKey) {
        alert('Настройте config.js');
        return;
    }
    var lib = typeof supabase !== 'undefined' ? supabase : (typeof window !== 'undefined' && window.supabase);
    if (!lib || !lib.createClient) { alert('Supabase не загружен. Обновите страницу.'); return; }
    var client = supabaseClient || lib.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
    var basePath = location.pathname.replace(/\/[^/]*$/, '') || '/';
    var redirectTo = location.origin + (basePath === '/' ? '' : basePath) + '/reviews.html';
    client.auth.signInWithOAuth({ provider: 'discord', options: { redirectTo: redirectTo } })
        .then(function(r) { if (r.error) alert(r.error.message); else if (r.data && r.data.url) location.href = r.data.url; });
};

function runInits() {
    try { initHeroVideo(); } catch (e) {}
    try { initScrollReveal(); } catch (e) {}
    try { initHeaderScroll(); } catch (e) {}
    try { initMobileMenu(); } catch (e) {}
    try { initSmoothScroll(); } catch (e) {}
    try { initAuthModal(); } catch (e) {}
    try { initPlayModal(); } catch (e) {}
    try { initReviews(); } catch (e) {}
}
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runInits);
} else {
    runInits();
}

function initHeroVideo() {
    const video = document.querySelector('.hero__video');
    const soundBtn = document.getElementById('heroSoundBtn');
    const volumeSlider = document.getElementById('heroVolumeSlider');
    if (video) {
        video.muted = true;
        video.volume = 0.8;
        video.playsInline = true;
        video.setAttribute('playsinline', '');
        video.setAttribute('webkit-playsinline', '');
        const playPromise = video.play();
        if (playPromise !== undefined) {
            playPromise.catch(() => {}).then(() => {});
        }
    }
    if (video && soundBtn) {
        soundBtn.addEventListener('click', () => {
            video.muted = !video.muted;
            soundBtn.classList.toggle('hero__sound-btn--muted', video.muted);
            soundBtn.setAttribute('aria-label', video.muted ? 'Включить звук' : 'Выключить звук');
        });
        soundBtn.classList.add('hero__sound-btn--muted');
    }
    if (video && volumeSlider) {
        volumeSlider.addEventListener('input', () => {
            const vol = volumeSlider.value / 100;
            video.volume = vol;
            if (vol > 0) {
                video.muted = false;
                soundBtn.classList.remove('hero__sound-btn--muted');
                soundBtn.setAttribute('aria-label', 'Выключить звук');
            } else {
                video.muted = true;
                soundBtn.classList.add('hero__sound-btn--muted');
                soundBtn.setAttribute('aria-label', 'Включить звук');
            }
        });
    }
}


function initScrollReveal() {
    const elements = document.querySelectorAll('.scroll-reveal');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                observer.unobserve(entry.target);
            }
        });
    }, { rootMargin: '0px 0px -50px 0px', threshold: 0.1 });

    elements.forEach(el => observer.observe(el));
}


function initHeaderScroll() {
    const header = document.querySelector('.header');
    let lastScroll = 0;

    const handleScroll = () => {
        const currentScroll = window.pageYOffset;
        if (currentScroll > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
        lastScroll = currentScroll;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
}

function initMobileMenu() {
    const toggle = document.querySelector('.nav__toggle');
    const links = document.querySelector('.nav__links');
    const navLinks = document.querySelectorAll('.nav__links a');

    if (!toggle || !links) return;

    toggle.addEventListener('click', () => {
        toggle.classList.toggle('active');
        links.classList.toggle('active');
        document.body.style.overflow = links.classList.contains('active') ? 'hidden' : '';
    });

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            toggle.classList.remove('active');
            links.classList.remove('active');
            document.body.style.overflow = '';
        });
    });
}


function initAuthModal() {
    const doLogin = () => { if (typeof window.doDiscordLogin === 'function') window.doDiscordLogin(); else if (supabaseClient) handleDiscordLogin(); };
    document.getElementById('reviewsLoginBtn')?.addEventListener('click', doLogin);
    document.getElementById('navLoginBtn')?.addEventListener('click', doLogin);
    document.getElementById('modalDiscordBtn')?.addEventListener('click', doLogin);
    document.getElementById('authModalClose')?.addEventListener('click', closeAuthModal);
    document.getElementById('authModalBackdrop')?.addEventListener('click', closeAuthModal);
    document.getElementById('navLogoutBtn')?.addEventListener('click', () => { if (supabaseClient) handleLogout(); });
}

function initReviews() {
    const authBlock = document.getElementById('reviewsAuth');
    const formBlock = document.getElementById('reviewsForm');
    const listEl = document.getElementById('reviewsList');
    const emptyEl = document.getElementById('reviewsEmpty');
    const hasReviewsSection = authBlock && formBlock && listEl;

    const isConfigured = typeof SUPABASE_CONFIG !== 'undefined' &&
        SUPABASE_CONFIG.url &&
        SUPABASE_CONFIG.anonKey &&
        !SUPABASE_CONFIG.url.includes('YOUR_PROJECT');

    if (!isConfigured) {
        if (authBlock) authBlock.innerHTML = '<p class="reviews__config-hint">Для работы отзывов настройте Supabase. См. НАСТРОЙКА_ОТЗЫВОВ.md</p>';
        return;
    }

    try {
        supabaseClient = window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey, {
            auth: { detectSessionInUrl: true }
        });
    } catch (e) {
        if (authBlock) authBlock.innerHTML = '<p class="reviews__error">Ошибка инициализации. Проверьте config.js</p>';
        return;
    }

    const submitBtn = document.getElementById('submitReviewBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const reviewText = document.getElementById('reviewText');
    const reviewChars = document.getElementById('reviewChars');
    const userEl = document.getElementById('reviewsUser');
    if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);

    if (submitBtn) submitBtn.addEventListener('click', function(e) { e.preventDefault(); e.stopPropagation(); handleSubmitReview(); });
    if (reviewText && reviewChars) reviewText.addEventListener('input', () => { reviewChars.textContent = reviewText.value.length; });

    function applyAuthState(session) {
        if (hasReviewsSection) updateAuthUI(session);
        updateNavAuth(session);
        if (listEl) loadReviews();
    }

    supabaseClient.auth.onAuthStateChange((event, session) => {
        applyAuthState(session);
    });

    async function initSession() {
        const hash = (window.location.hash || '').replace(/^#/, '');
        if (hash) {
            const params = new URLSearchParams(hash);
            const access_token = params.get('access_token');
            const refresh_token = params.get('refresh_token');
            if (access_token && refresh_token) {
                try {
                    const { data, error } = await supabaseClient.auth.setSession({ access_token, refresh_token });
                    const session = (data && data.session) ? data.session : (await supabaseClient.auth.getSession()).data.session;
                    if (session) applyAuthState(session);
                } catch (e) {
                    console.error('Ошибка входа:', e);
                }
                window.history.replaceState({}, document.title, window.location.pathname + window.location.search);
                return;
            }
        }
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        if (code) {
            try {
                const { data, error } = await supabaseClient.auth.exchangeCodeForSession(code);
                if (!error && data.session) applyAuthState(data.session);
            } catch (e) {}
            window.history.replaceState({}, document.title, window.location.pathname);
            return;
        }
        const { data: { session } } = await supabaseClient.auth.getSession();
        applyAuthState(session);
    }
    initSession();
}

function openAuthModal() {
    const modal = document.getElementById('authModal');
    if (modal) {
        modal.classList.add('auth-modal--open');
        modal.setAttribute('aria-hidden', 'false');
    }
}

function closeAuthModal() {
    const modal = document.getElementById('authModal');
    if (modal) {
        modal.classList.remove('auth-modal--open');
        modal.setAttribute('aria-hidden', 'true');
    }
}

function initPlayModal() {
    const cfg = typeof ARMA_CONFIG !== 'undefined' ? ARMA_CONFIG : {};
    const launchEl = document.getElementById('playModalLaunch');
    const installEl = document.getElementById('playModalInstall');
    const presetEl = document.getElementById('playModalPreset');
    const modsWrap = document.getElementById('playModalMods');
    const modsList = document.getElementById('playModalModsList');

    if (launchEl) {
        launchEl.href = cfg.steamRun || 'steam://run/107410';
    }
    if (installEl) {
        installEl.href = cfg.steamInstall || 'https://store.steampowered.com/app/107410/Arma_3/';
    }
    if (presetEl && cfg.presetUrl) {
        presetEl.href = cfg.presetUrl;
        presetEl.style.display = '';
    }
    if (modsWrap && modsList && cfg.mods && cfg.mods.length > 0) {
        modsWrap.style.display = 'block';
        modsList.innerHTML = cfg.mods.map(function (m) {
            var url = typeof m === 'string' ? m : m.url;
            var name = typeof m === 'string' ? 'Подписаться на мод' : (m.name || 'Подписаться на мод');
            return '<li><a href="' + escapeHtml(url) + '" target="_blank" rel="noopener noreferrer">' + escapeHtml(name) + '</a></li>';
        }).join('');
    }

    document.querySelectorAll('[data-open-play-modal]').forEach(function (btn) {
        btn.addEventListener('click', function (e) {
            e.preventDefault();
            openPlayModal();
        });
    });
    document.getElementById('playModalClose')?.addEventListener('click', closePlayModal);
    document.getElementById('playModalBackdrop')?.addEventListener('click', closePlayModal);
}

function openPlayModal() {
    const modal = document.getElementById('playModal');
    if (modal) {
        modal.classList.add('play-modal--open');
        modal.setAttribute('aria-hidden', 'false');
    }
}

function closePlayModal() {
    const modal = document.getElementById('playModal');
    if (modal) {
        modal.classList.remove('play-modal--open');
        modal.setAttribute('aria-hidden', 'true');
    }
}

function updateNavAuth(session) {
    const loginBtn = document.getElementById('navLoginBtn');
    const userBlock = document.getElementById('navAuthUser');
    const avatarEl = document.getElementById('navAuthAvatar');
    const nameEl = document.getElementById('navAuthName');

    if (session?.user) {
        const meta = session.user.user_metadata;
        const name = meta.full_name || meta.name || meta.user_name || session.user.email || 'Игрок';
        const avatar = meta.avatar_url || meta.picture;

        if (loginBtn) loginBtn.style.display = 'none';
        if (userBlock) {
            userBlock.style.display = 'flex';
            if (avatarEl) {
                if (avatar) {
                    avatarEl.src = avatar;
                    avatarEl.style.display = 'block';
                } else {
                    avatarEl.style.display = 'none';
                }
            }
            if (nameEl) nameEl.textContent = name;
        }
        closeAuthModal();
    } else {
        if (loginBtn) loginBtn.style.display = 'block';
        if (userBlock) userBlock.style.display = 'none';
    }
}

function updateAuthUI(session) {
    const authBlock = document.getElementById('reviewsAuth');
    const formBlock = document.getElementById('reviewsForm');
    const userEl = document.getElementById('reviewsUser');
    if (!authBlock || !formBlock) return;

    if (session?.user) {
        const meta = session.user.user_metadata;
        const name = meta.full_name || meta.name || meta.user_name || session.user.email || 'Игрок';
        const avatar = meta.avatar_url || meta.picture;

        authBlock.style.display = 'none';
        formBlock.style.display = 'block';

        if (userEl) {
            userEl.innerHTML = avatar
                ? `<img src="${avatar}" alt="" class="reviews__avatar"><span>${escapeHtml(name)}</span>`
                : `<span>${escapeHtml(name)}</span>`;
        }
    } else {
        authBlock.style.display = 'block';
        formBlock.style.display = 'none';
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

async function handleDiscordLogin() {
    if (!supabaseClient) return;
    try {
        const basePath = location.pathname.replace(/\/[^/]*$/, '') || '/';
        const redirectUrl = location.origin + (basePath === '/' ? '' : basePath) + '/reviews.html';
        const { data, error } = await supabaseClient.auth.signInWithOAuth({
            provider: 'discord',
            options: { redirectTo: redirectUrl }
        });
        if (error) throw error;
        if (data?.url) {
            window.location.href = data.url;
        }
    } catch (e) {
        alert('Ошибка входа: ' + (e.message || e));
    }
}

async function handleLogout() {
    if (!supabaseClient) return;
    if (!confirm('Выйти из аккаунта?')) return;
    await supabaseClient.auth.signOut();
}

async function handleSubmitReview() {
    if (!supabaseClient) return;
    const textEl = document.getElementById('reviewText');
    const text = textEl?.value?.trim();
    if (!text || text.length < 10) {
        alert('Отзыв должен содержать минимум 10 символов.');
        return;
    }

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) return;

    try {
        const { error } = await supabaseClient.from('reviews').insert({
            user_id: user.id,
            user_name: user.user_metadata?.full_name || user.user_metadata?.name || user.user_metadata?.user_name || user.email || 'Аноним',
            user_avatar: user.user_metadata?.avatar_url || user.user_metadata?.picture || null,
            text: text
        });
        if (error) throw error;
        textEl.value = '';
        document.getElementById('reviewChars').textContent = '0';
        loadReviews();
    } catch (e) {
        alert('Ошибка: ' + (e.message || e));
    }
}

async function loadReviews() {
    const listEl = document.getElementById('reviewsList');
    const emptyEl = document.getElementById('reviewsEmpty');
    if (!listEl || !supabaseClient) return;

    try {
        const { data, error } = await supabaseClient
            .from('reviews')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        listEl.innerHTML = '';
        if (emptyEl) emptyEl.style.display = data.length ? 'none' : 'block';

        data.forEach(r => {
            const card = document.createElement('div');
            card.className = 'reviews__card scroll-reveal';
            const avatarHtml = r.user_avatar
                ? `<img src="${r.user_avatar}" alt="" class="reviews__card-avatar">`
                : `<div class="reviews__card-avatar reviews__card-avatar--placeholder"></div>`;
            card.innerHTML = `
                <div class="reviews__card-header">
                    ${avatarHtml}
                    <div class="reviews__card-meta">
                        <span class="reviews__card-name">${escapeHtml(r.user_name || 'Аноним')}</span>
                        <span class="reviews__card-date">${formatDate(r.created_at)}</span>
                    </div>
                </div>
                <p class="reviews__card-text">${escapeHtml(r.text)}</p>
            `;
            listEl.appendChild(card);
        });
    } catch (e) {
        listEl.innerHTML = '<p class="reviews__error">Не удалось загрузить отзывы. Проверьте настройку таблицы.</p>';
        if (emptyEl) emptyEl.style.display = 'none';
    }
}

function formatDate(iso) {
    const d = new Date(iso);
    return d.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
}

function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href === '#') return;
            
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}
