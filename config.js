/**
 * Конфигурация Supabase для отзывов.
 * Заполните своими данными после создания проекта на supabase.com
 */
const SUPABASE_CONFIG = {
    url: 'https://hkvmbhrhzitumvtgwzyq.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhrdm1iaHJoeml0dW12dGd3enlxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzExODc5MzIsImV4cCI6MjA4Njc2MzkzMn0.a3OzEM_D-vOZJtv-kxedUzFdsQugDCh_b2B9O5_3H3c'
};

/**
 * Настройки кнопки «Играть» — скачивание пресета, запуск Arma 3.
 */
const ARMA_CONFIG = {
    steamRun: 'steam://run/107410',
    steamInstall: 'https://store.steampowered.com/app/107410/Arma_3/',
    /** Файл пресета (скачивается целиком) */
    presetUrl: 'Arma 3 Preset RSX_24STS_V_1.html'
};