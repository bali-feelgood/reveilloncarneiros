// Language Detection System
const LanguageDetector = {
    init() {
        // Only redirect on homepage to avoid loops
        if (window.location.pathname === '/' || window.location.pathname === '/en/') {
            this.checkAndRedirect();
        }
        
        // Setup language selector interactions
        this.setupLanguageSelector();
    },
    
    getPreferredLanguage() {
        // 1. Check saved preference
        const saved = localStorage.getItem('preferred-language');
        if (saved) return saved;
        
        // 2. Check browser language
        const browserLang = navigator.language || navigator.userLanguage;
        
        // 3. Map to supported languages
        if (browserLang.startsWith('pt')) return 'pt';
        if (browserLang.startsWith('en')) return 'en';
        
        // 4. Default to Portuguese
        return 'pt';
    },
    
    getCurrentLanguage() {
        return window.location.pathname.startsWith('/en/') ? 'en' : 'pt';
    },
    
    checkAndRedirect() {
        const current = this.getCurrentLanguage();
        const preferred = this.getPreferredLanguage();
        
        // Only redirect once per session
        if (sessionStorage.getItem('lang-redirect-done')) return;
        
        if (current !== preferred) {
            sessionStorage.setItem('lang-redirect-done', 'true');
            
            if (preferred === 'en' && current === 'pt') {
                window.location.href = '/en/';
            } else if (preferred === 'pt' && current === 'en') {
                window.location.href = '/';
            }
        }
    },
    
    setupLanguageSelector() {
        const selector = document.querySelector('.language-selector');
        if (!selector) return;
        
        // Mobile toggle
        if (window.innerWidth <= 768) {
            const toggle = selector.querySelector('.lang-toggle');
            toggle?.addEventListener('click', (e) => {
                e.preventDefault();
                selector.classList.toggle('active');
            });
        }
        
        // Save preference on language change
        const options = selector.querySelectorAll('.lang-option:not(.active)');
        options.forEach(option => {
            option.addEventListener('click', (e) => {
                const newLang = option.href.includes('/en/') ? 'en' : 'pt';
                localStorage.setItem('preferred-language', newLang);
            });
        });
    }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    LanguageDetector.init();
});