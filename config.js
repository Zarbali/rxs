/**
 * Конфигурация Supabase для отзывов.
 * Заполните своими данными после создания проекта на supabase.com
 */
const SUPABASE_CONFIG = {
    url: 'https://hkvmbhrhzitumvtgwzyq.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhrdm1iaHJoeml0dW12dGd3enlxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzExODc5MzIsImV4cCI6MjA4Njc2MzkzMn0.a3OzEM_D-vOZJtv-kxedUzFdsQugDCh_b2B9O5_3H3c'
};

/**
 * Настройки кнопки «Играть» — запуск Arma 3, пресет, моды.
 * steam://run/107410 — запуск Arma 3 (107410 = App ID).
 * steam://install/107410 — установка, если игра не куплена.
 * Preset — ссылка на .html или .launcher для Arma 3 Launcher.
 * mods — массив ссылок на моды в Steam Workshop.
 */
const ARMA_CONFIG = {
    /** Запуск Arma 3 через Steam */
    steamRun: 'steam://run/107410',
    /** Установка Arma 3 (если не куплена) */
    steamInstall: 'https://store.steampowered.com/app/107410/Arma_3/',
    /** Ссылка на пресет (.html или .launcher) — загрузите файл в репо или на файлообменник */
    presetUrl: '', // Например: 'https://zarbali.github.io/rxs/RXS-preset.html'
    /** Ссылки на моды Steam Workshop. Строка — URL, или объект { url, name } */
    mods: [
        // 'https://steamcommunity.com/sharedfiles/filedetails/?id=450814997',
        // { url: 'https://steamcommunity.com/sharedfiles/filedetails/?id=450814997', name: 'CUP Terrains' },
    ]
};