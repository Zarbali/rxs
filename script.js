let supabase = null;

window.doDiscordLogin = function() {
    if (supabase) {
        handleDiscordLogin();
    } else {
        alert('Supabase не настроен. Проверьте config.js и загрузку страницы.');
    }
};

document.addEventListener('DOMContentLoaded', () => {
    try { initHeroVideo(); } catch (e) {}
    try { initScrollReveal(); } catch (e) {}
    try { initHeaderScroll(); } catch (e) {}
    try { initMobileMenu(); } catch (e) {}
    try { initSmoothScroll(); } catch (e) {}
    try { initAuthModal(); } catch (e) {}
    try { initReviews(); } catch (e) {}
});

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
    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -80px 0px', // Элемент появляется чуть раньше
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

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
    const doLogin = () => {
        if (supabase) {
            handleDiscordLogin();
        } else {
            alert('Настройте Supabase для входа. См. НАСТРОЙКА_ОТЗЫВОВ.md');
        }
    };
    document.getElementById('reviewsLoginBtn')?.addEventListener('click', doLogin);
    document.getElementById('navLoginBtn')?.addEventListener('click', doLogin);
    document.getElementById('modalDiscordBtn')?.addEventListener('click', doLogin);
    document.getElementById('authModalClose')?.addEventListener('click', closeAuthModal);
    document.getElementById('authModalBackdrop')?.addEventListener('click', closeAuthModal);
    document.getElementById('navLogoutBtn')?.addEventListener('click', () => { if (supabase) handleLogout(); });
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
        document.querySelector('.nav__auth-wrap')?.style.setProperty('display', 'none');
        return;
    }

    try {
        supabase = window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
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

    if (submitBtn) submitBtn.addEventListener('click', handleSubmitReview);
    if (reviewText && reviewChars) reviewText.addEventListener('input', () => { reviewChars.textContent = reviewText.value.length; });

    supabase.auth.onAuthStateChange((event, session) => {
        if (hasReviewsSection) updateAuthUI(session);
        updateNavAuth(session);
        if (listEl) loadReviews();
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
        if (hasReviewsSection) updateAuthUI(session);
        updateNavAuth(session);
        if (listEl) loadReviews();
    });
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
    if (!supabase) return;
    try {
        const path = location.pathname.replace(/\/index\.html$/i, '').replace(/\/$/, '') || '/';
        const redirectUrl = location.origin + path + '#reviews';
        const { data, error } = await supabase.auth.signInWithOAuth({
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
    if (!supabase) return;
    await supabase.auth.signOut();
}

async function handleSubmitReview() {
    if (!supabase) return;
    const textEl = document.getElementById('reviewText');
    const text = textEl?.value?.trim();
    if (!text || text.length < 10) {
        alert('Отзыв должен содержать минимум 10 символов.');
        return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    try {
        const { error } = await supabase.from('reviews').insert({
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
    if (!listEl || !supabase) return;

    try {
        const { data, error } = await supabase
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
