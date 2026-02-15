
document.addEventListener('DOMContentLoaded', () => {
    initHeroVideo();
    initScrollReveal();
    initHeaderScroll();
    initMobileMenu();
    initSmoothScroll();
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
