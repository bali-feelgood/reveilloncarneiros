// Language Detection System
const LanguageDetector = {
    init() {
        // Redirect logic now handled by inline script in <head>
        // Only setup language selector interactions
        this.setupLanguageSelector();
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