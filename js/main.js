
/* ==========================================================================
  RÉVEILLON CARNEIROS 2026 - JAVASCRIPT COMPLETO REORGANIZADO
  
  ÍNDICE:
  1. Configurações Globais
  2. Funções Utilitárias
  3. Header (Scroll e Mudança de Cor)
  4. Navegação (Menu Mobile e Dropdowns)
  5. Hero Section
  6. Manifesto Section
  7. Experiences Section (Night Celebrations)
  8. All Inclusive Section (Slideshow de Fundo)
  9. Mouton Beach Section (Slideshow)
  10. Villa Mouton Section (Troca de Imagens)
  11. Music Section (Swiper de Artistas)
  12. Wellness Section (Carousel e Accordions)
  13. FAQ Section (Accordions)
  14. Destination Section (Slideshow)
  15. Newsletter Section (Formulário)
  16. Footer
  17. Inicialização da Aplicação
  ========================================================================== */
/* ==========================================================================
  RÉVEILLON CARNEIROS 2026 - JAVASCRIPT OTIMIZADO
  
  MUDANÇAS PRINCIPAIS:
  - Removido jQuery completamente
  - Removido Swiper.js (não utilizado)
  - Melhorada performance com lazy loading
  - Otimizado carregamento de imagens
  - Reduzido tamanho do bundle
  ========================================================================== */

/* ==========================================================================
   1. CONFIGURAÇÕES GLOBAIS
   ========================================================================== */
const CONFIG = {
    animations: {
        fadeIn: 700,
        slideTransition: 300,
        scrollSmooth: 800,
        imageTransition: 150
    },
    breakpoints: {
        mobile: 768,
        tablet: 992,
        desktop: 1200
    },
    slideshows: {
        allInclusive: 4000,
        moutonBeach: 3500,
        destination: 3500,
        villaTransition: 300
    },
    wellness: {
        scrollSpeed: 0.25  // Reduzido para movimentos mais suaves
    }
};


/* ==========================================================================
   2. FUNÇÕES UTILITÁRIAS
   ========================================================================== */
const Utils = {
    isMobile() {
        return window.innerWidth <= CONFIG.breakpoints.mobile;
    },

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    },

    fadeIn(element, duration = CONFIG.animations.fadeIn) {
        element.style.opacity = '0';
        element.style.transition = `opacity ${duration}ms ease`;
        element.offsetHeight;
        element.style.opacity = '1';
    },

    fadeOut(element, duration = CONFIG.animations.fadeIn) {
        element.style.transition = `opacity ${duration}ms ease`;
        element.style.opacity = '0';
    },

    smoothScrollTo(targetId) {
        const target = document.querySelector(targetId);
        if (!target) return;

        const header = document.querySelector('#main-header');
        const headerHeight = header ? header.offsetHeight : 0;
        const targetPosition = target.offsetTop - headerHeight - 20;

        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });
    },

    // Sistema unificado de lazy loading com fallbacks
    lazyLoadImages() {
        const images = document.querySelectorAll('img[data-src], img.lazyload');
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.loadImageWithFallback(entry.target);
                    imageObserver.unobserve(entry.target);
                }
            });
        }, {
            rootMargin: '50px 0px',
            threshold: 0.01
        });

        images.forEach(img => imageObserver.observe(img));
    },

    // Carrega imagem com sistema de fallback robusto
    async loadImageWithFallback(img) {
        const originalSrc = img.dataset.src || img.src;
        if (!originalSrc || originalSrc.includes('data:image/svg+xml')) return;

        const fallbacks = this.generateImageFallbacks(originalSrc);
        
        for (const src of fallbacks) {
            try {
                await this.testImageLoad(src);
                img.src = src;
                img.removeAttribute('data-src');
                img.classList.remove('lazyload');
                img.classList.add('loaded');
                return;
            } catch (error) {
                console.warn(`Failed to load: ${src}`);
            }
        }
        
        // Se todos falharam, usa placeholder
        img.src = this.getPlaceholderSVG();
        img.classList.add('image-error');
        console.error('❌ Todas as tentativas de carregamento falharam para:', originalSrc);
    },

    // Gera lista de fallbacks para uma imagem
    generateImageFallbacks(src) {
        const fallbacks = new Set();
        
        // Normaliza o path
        const normalizedSrc = src.startsWith('/') ? src : `/${src}`;
        const withoutSlash = src.replace(/^\//, '');
        
        // Adiciona variações de path
        fallbacks.add(normalizedSrc);
        fallbacks.add(withoutSlash);
        
        // Adiciona variações de formato
        if (src.includes('.webp')) {
            fallbacks.add(normalizedSrc.replace('.webp', '.jpg'));
            fallbacks.add(withoutSlash.replace('.webp', '.jpg'));
        } else if (src.includes('.jpg')) {
            fallbacks.add(normalizedSrc.replace('.jpg', '.webp'));
            fallbacks.add(withoutSlash.replace('.jpg', '.webp'));
        }
        
        return Array.from(fallbacks);
    },

    // Testa se uma imagem pode ser carregada
    testImageLoad(src) {
        return new Promise((resolve, reject) => {
            const testImg = new Image();
            testImg.onload = () => resolve(src);
            testImg.onerror = () => reject(new Error(`Failed to load: ${src}`));
            testImg.src = src;
        });
    },

    // Retorna SVG placeholder
    getPlaceholderSVG() {
        return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%23f0f0f0'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%23999' font-family='Arial' font-size='16'%3EImagem indisponível%3C/text%3E%3C/svg%3E`;
    }
};

/* ==========================================================================
   3. HEADER - MUDANÇA DE COR NO SCROLL
   ========================================================================== */
const HeaderController = {
    init() {
        this.header = document.querySelector('#main-header');
        if (!this.header) return;

        // Throttle do scroll para melhor performance
        let ticking = false;
        const handleScroll = () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    this.handleScroll();
                    ticking = false;
                });
                ticking = true;
            }
        };

        window.addEventListener('scroll', handleScroll);
        this.handleScroll();
    },

    handleScroll() {
        const scrollPosition = window.scrollY;
        const heroSection = document.querySelector('.hero-section');
        const heroHeight = heroSection ? heroSection.offsetHeight : 700;

        if (scrollPosition > heroHeight - 100) {
            this.header.classList.add('header-scrolled');
        } else {
            this.header.classList.remove('header-scrolled');
        }
    }
};

/* ==========================================================================
   4. NAVEGAÇÃO - MENU MOBILE E DROPDOWNS
   ========================================================================== */
const NavigationController = {
    init() {
        this.setupMobileMenu();
        this.setupDropdowns();
        this.setupSmoothScrolling();
    },

    setupMobileMenu() {
        const toggle = document.querySelector('.mobile-menu-toggle');
        const menu = document.querySelector('.nav-menu');
        const overlay = document.querySelector('.mobile-menu-overlay');

        if (!toggle || !menu || !overlay) return;

        const toggleMenu = (forceClose = false) => {
            const isActive = menu.classList.contains('active');
            const shouldClose = forceClose || isActive;

            if (shouldClose) {
                menu.classList.remove('active');
                overlay.classList.remove('active');
                toggle.classList.remove('active');
                document.documentElement.style.overflow = '';
                document.body.style.overflow = '';
                document.body.classList.remove('menu-open');
            } else {
                menu.classList.add('active');
                overlay.classList.add('active');
                toggle.classList.add('active');
                document.documentElement.style.overflow = 'hidden';
                document.body.style.overflow = 'hidden';
                document.body.classList.add('menu-open');
            }
        };

        toggle.addEventListener('click', () => toggleMenu());
        overlay.addEventListener('click', () => toggleMenu(true));

        // Tratamento dos links
        menu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');

                if (href === '#' || !href) {
                    if (Utils.isMobile()) {
                        e.preventDefault();
                        const dropdown = link.closest('.nav-dropdown');
                        if (dropdown) {
                            dropdown.classList.toggle('active');
                        }
                    }
                    return;
                }

                if (href.startsWith('#')) {
                    e.preventDefault();
                    toggleMenu(true);
                    requestAnimationFrame(() => {
                        Utils.smoothScrollTo(href);
                    });
                }
            });
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && menu.classList.contains('active')) {
                toggleMenu(true);
            }
        });
    },

    setupDropdowns() {
        document.querySelectorAll('.dropdown:not(.nav-dropdown)').forEach(dropdown => {
            const toggle = dropdown.querySelector('.dropdown-toggle');
            if (!toggle) return;

            toggle.addEventListener('click', (e) => {
                if (Utils.isMobile()) {
                    e.preventDefault();
                    dropdown.classList.toggle('active');
                }
            });
        });

        document.addEventListener('click', (e) => {
            if (!e.target.closest('.dropdown') && !e.target.closest('.nav-dropdown')) {
                document.querySelectorAll('.dropdown, .nav-dropdown').forEach(d => {
                    d.classList.remove('active');
                });
            }
        });
    },

    setupSmoothScrolling() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                if (!e.target.closest('.nav-menu')) {
                    e.preventDefault();
                    const targetId = anchor.getAttribute('href');
                    Utils.smoothScrollTo(targetId);
                }
            });
        });
    }
};

/* ==========================================================================
   7. EXPERIENCES SECTION - REMOVIDO (AGORA USA V2)
   ========================================================================== */
// ExperiencesController removido - substituído por ExperiencesCarouselV2

/* ==========================================================================
   8. ALL INCLUSIVE SECTION - SLIDESHOW OTIMIZADO
   ========================================================================== */
const AllInclusiveController = {
    init() {
        const bgImages = document.querySelectorAll('.all-inclusive-bg .bg-image');
        if (!bgImages.length) return;

        this.images = bgImages;
        this.currentIndex = 0;
        
        // Carrega primeira imagem imediatamente
        this.loadBackgroundImage(0);
        
        // Pré-carrega próxima imagem
        setTimeout(() => this.preloadNextImage(), 1000);

        setInterval(() => this.nextImage(), CONFIG.slideshows.allInclusive);
    },

    loadBackgroundImage(index) {
        const image = this.images[index];
        const bgUrl = image.dataset.bg;
        
        if (bgUrl) {
            // Responsive background: mobile-optimized on small screens
            const isMobile = window.innerWidth <= 768;
            const fileName = bgUrl.split('/').pop().replace('.jpg', '');
            const basePath = bgUrl.replace(/\/[^/]+$/, '/');
            
            if (isMobile) {
                // Prioriza WebP mobile, fallback JPG mobile
                const webpUrl = `${basePath}${fileName}-768.webp`;
                const jpgUrl = `${basePath}${fileName}-768.jpg`;
                
                // Testa suporte WebP
                this.supportsWebP().then(supportsWebP => {
                    const optimizedUrl = supportsWebP ? webpUrl : jpgUrl;
                    image.style.backgroundImage = `url(${optimizedUrl})`;
                });
            } else {
                // Desktop: prioriza WebP, fallback JPG original
                const webpUrl = bgUrl.replace('.jpg', '.webp');
                
                this.supportsWebP().then(supportsWebP => {
                    const optimizedUrl = supportsWebP ? webpUrl : bgUrl;
                    image.style.backgroundImage = `url(${optimizedUrl})`;
                });
            }
            
            image.removeAttribute('data-bg');
        }
    },

    // Detecta suporte WebP
    supportsWebP() {
        return new Promise((resolve) => {
            const webP = new Image();
            webP.onload = webP.onerror = () => resolve(webP.height === 2);
            webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
        });
    },

    preloadNextImage() {
        const nextIndex = (this.currentIndex + 1) % this.images.length;
        this.loadBackgroundImage(nextIndex);
    },

    nextImage() {
        this.images.forEach(img => img.classList.remove('active'));
        this.currentIndex = (this.currentIndex + 1) % this.images.length;
        this.images[this.currentIndex].classList.add('active');
        
        // Pré-carrega a próxima
        setTimeout(() => this.preloadNextImage(), 1000);
    }
};

/* ==========================================================================
   9. MOUTON BEACH SECTION - SLIDESHOW OTIMIZADO
   ========================================================================== */
const MoutonBeachController = {
    init() {
        const slides = document.querySelectorAll('.mouton-slide');
        if (!slides.length) return;

        this.slides = slides;
        this.currentSlide = 0;

        // O lazy loading é gerenciado pelo sistema global Utils.lazyLoadImages()

        setInterval(() => this.changeSlide(), CONFIG.slideshows.moutonBeach);
    },


    changeSlide() {
        this.slides[this.currentSlide].classList.remove('active');
        this.currentSlide = (this.currentSlide + 1) % this.slides.length;
        this.slides[this.currentSlide].classList.add('active');
    }
};

/* ==========================================================================
   10. VILLA MOUTON SECTION - OTIMIZADO
   ========================================================================== */
const VillaMoutonController = {
    init() {
        this.mainImage = document.querySelector('#villa-main-image');
        this.imageContainer = document.querySelector('.villa-mouton-images');

        if (!this.mainImage || !this.imageContainer) return;

        // Detecta se está no subdiretório /en/ para ajustar paths
        const basePath = window.location.pathname.includes('/en/') ? '../assets/images/villa-mouton/' : '/assets/images/villa-mouton/';
        
        // Optimize images - use WebP when supported, JPG fallback
        this.imageMap = {
            'beleza': basePath + 'beleza.webp',
            'gastronomia': basePath + 'gastronomia.webp', 
            'store': basePath + 'store.webp',
            'suporte': basePath + 'suporte.webp',
            'default': basePath + 'default.webp'
        };
        
        // Fallback map for browsers without WebP support
        this.fallbackMap = {
            'beleza': basePath + 'beleza.jpg',
            'gastronomia': basePath + 'gastronomia.jpg',
            'store': basePath + 'store.jpg', 
            'suporte': basePath + 'suporte.jpg',
            'default': basePath + 'default.jpg'
        };
        
        console.log('🏰 Villa Mouton: imageMap criado:', this.imageMap);

        // Pré-carrega imagens após 3 segundos
        setTimeout(() => this.preloadImages(), 3000);

        this.setupAccordion();
    },

    preloadImages() {
        Object.values(this.imageMap).forEach(src => {
            const img = new Image();
            img.src = src;
        });
    },

    setupAccordion() {
        const items = document.querySelectorAll('.service-list-item');

        items.forEach(item => {
            const toggle = item.querySelector('.service-toggle');
            if (!toggle) return;

            toggle.addEventListener('click', () => {
                const isActive = item.classList.contains('active');

                items.forEach(otherItem => {
                    if (otherItem !== item) {
                        otherItem.classList.remove('active');
                    }
                });

                item.classList.toggle('active');

                const imageKey = item.getAttribute('data-image');
                if (!isActive && imageKey) {
                    this.changeImage(this.imageMap[imageKey]);
                } else {
                    this.changeImage(this.imageMap.default);
                }
            });
        });
    },

    async changeImage(newSrc) {
        console.log('🏰 Villa Mouton: Tentando trocar imagem para:', newSrc);
        
        // Transição mais rápida e natural
        this.mainImage.style.transition = 'opacity 150ms ease-out';
        this.mainImage.style.opacity = '0';
        
        setTimeout(async () => {
            // Tenta carregar WebP primeiro
            try {
                await this.testImageLoad(newSrc);
                this.mainImage.src = newSrc;
                console.log('✅ Villa Mouton: WebP carregado com sucesso:', newSrc);
                this.mainImage.style.opacity = '1';
            } catch (error) {
                // Fallback para JPG
                const imageKey = Object.keys(this.imageMap).find(key => this.imageMap[key] === newSrc);
                const fallbackSrc = this.fallbackMap[imageKey];
                
                if (fallbackSrc) {
                    console.log('🔄 Villa Mouton: Tentando fallback JPG:', fallbackSrc);
                    this.mainImage.src = fallbackSrc;
                    this.mainImage.onload = () => {
                        console.log('✅ Villa Mouton: JPG fallback carregado:', fallbackSrc);
                        this.mainImage.style.opacity = '1';
                    };
                    this.mainImage.onerror = () => {
                        console.error('❌ Villa Mouton: Falha total ao carregar:', fallbackSrc);
                        this.mainImage.style.opacity = '1';
                    };
                } else {
                    console.error('❌ Villa Mouton: Sem fallback disponível para:', newSrc);
                    this.mainImage.style.opacity = '1';
                }
            }
        }, 150);
    },
    
    // Helper para testar carregamento de imagem
    testImageLoad(src) {
        return new Promise((resolve, reject) => {
            const testImg = new Image();
            testImg.onload = () => resolve(src);
            testImg.onerror = () => reject(new Error(`Failed to load: ${src}`));
            testImg.src = src;
        });
    }
};

/* ==========================================================================
   11. MUSIC SECTION - REMOVIDO (AGORA USA V2)
   ========================================================================== */
// MusicController removido - substituído por MusicCarouselV2

/* ==========================================================================
   12. WELLNESS SECTION - OTIMIZADO
   
   📌 BACKUP MARCO REFERÊNCIA - REFATORAÇÃO WELLNESS
   Data: 2025-07-24
   Status: Funcionando perfeitamente
   Complexidade: 171 linhas - simplificar mantendo loop infinito
   ========================================================================== */
const WellnessController = {
    init() {
        this.setupCarousel();
        this.setupAccordions();
    },

    setupCarousel() {
        const container = document.querySelector('.wellness-carousel-container');
        const carousel = document.querySelector('#wellness-carousel');
        if (!container || !carousel) return;

        // Estado baseado no MusicCarouselV2
        const state = {
            isPlaying: true,
            isDragging: false,
            translateX: 0,
            speed: CONFIG.wellness.scrollSpeed
        };

        const dragData = { startX: 0, startTranslate: 0 };

        // Setup CSS - inspirado no MusicCarouselV2
        container.style.touchAction = 'pan-x';
        container.style.cursor = 'grab';
        carousel.style.transform = 'translateX(0px)';
        carousel.style.transition = 'none';

        // Animação principal - loop infinito com transform
        const animate = () => {
            if (state.isPlaying && !state.isDragging) {
                state.translateX -= state.speed;
                
                // Reset quando chega na metade (6 slides)
                const slideWidth = carousel.children[0]?.offsetWidth || 400;
                const maxTranslate = -(slideWidth * 6); // 6 slides originais
                
                if (state.translateX <= maxTranslate) {
                    state.translateX = 0;
                }
                
                carousel.style.transform = `translateX(${state.translateX}px)`;
            }
            requestAnimationFrame(animate);
        };

        // Inicia após delay
        setTimeout(() => {
            console.log('💆 Iniciando wellness carousel');
            animate();
        }, Utils.isMobile() ? 2000 : 1000);

        // Pointer Events (unificado mouse/touch) - como MusicCarouselV2
        container.addEventListener('pointerdown', (e) => {
            state.isPlaying = false;
            state.isDragging = true;
            container.style.cursor = 'grabbing';
            
            dragData.startX = e.clientX;
            dragData.startTranslate = state.translateX;
            e.preventDefault();
        });

        container.addEventListener('pointermove', (e) => {
            if (!state.isDragging) return;
            
            const deltaX = e.clientX - dragData.startX;
            // Amplifica movimento apenas no mobile para navegação fluida
            const multiplier = Utils.isMobile() ? 2.5 : 1;
            state.translateX = dragData.startTranslate + (deltaX * multiplier);
            carousel.style.transform = `translateX(${state.translateX}px)`;
        });

        container.addEventListener('pointerup', (e) => {
            if (!state.isDragging) return;
            
            state.isDragging = false;
            container.style.cursor = 'grab';
            
            // Resume autoplay imediatamente - como artists carousel
            state.isPlaying = true;
        });

        container.addEventListener('pointercancel', (e) => {
            if (state.isDragging) {
                state.isDragging = false;
                container.style.cursor = 'grab';
                state.isPlaying = true;
            }
        });

        // Previne scroll vertical durante drag horizontal - como MusicCarouselV2
        container.addEventListener('touchmove', (e) => {
            if (state.isDragging) {
                e.preventDefault();
            }
        }, { passive: false });
    },

    setupAccordions() {
        const items = document.querySelectorAll('.activity-item');

        items.forEach(item => {
            const toggle = item.querySelector('.activity-toggle');
            if (!toggle) return;

            toggle.addEventListener('click', () => {
                const category = item.closest('.wellness-category');
                const otherItems = category.querySelectorAll('.activity-item');
                const isCurrentlyActive = item.classList.contains('active');

                // Fecha todos os itens da mesma categoria
                otherItems.forEach(otherItem => {
                    otherItem.classList.remove('active');
                });

                // Se não estava ativo, ativa o atual. Se estava ativo, deixa fechado
                if (!isCurrentlyActive) {
                    item.classList.add('active');
                }
            });
        });
    }
};

/* ==========================================================================
   13. FAQ SECTION
   ========================================================================== */
const FAQController = {
    init() {
        this.setupCategoryAccordions();
        this.setupQuestionAccordions();
    },

    setupCategoryAccordions() {
        const categories = document.querySelectorAll('.faq-category-wrapper');

        categories.forEach(category => {
            const toggle = category.querySelector('.faq-category-toggle');
            if (!toggle) return;

            toggle.addEventListener('click', () => {
                const isActive = category.classList.contains('active');

                categories.forEach(other => {
                    if (other !== category) {
                        other.classList.remove('active');
                        other.querySelectorAll('.faq-item').forEach(item => {
                            item.classList.remove('active');
                        });
                    }
                });

                category.classList.toggle('active');

                if (isActive) {
                    category.querySelectorAll('.faq-item').forEach(item => {
                        item.classList.remove('active');
                    });
                }
            });
        });
    },

    setupQuestionAccordions() {
        const questions = document.querySelectorAll('.faq-item');

        questions.forEach(item => {
            const question = item.querySelector('.faq-question');
            if (!question) return;

            question.addEventListener('click', () => {
                const category = item.closest('.faq-category-content');
                const otherItems = category.querySelectorAll('.faq-item');

                otherItems.forEach(otherItem => {
                    if (otherItem !== item) {
                        otherItem.classList.remove('active');
                    }
                });

                item.classList.toggle('active');
            });
        });
    }
};

/* ==========================================================================
   14. DESTINATION SECTION
   ========================================================================== */
const DestinationController = {
    init() {
        const slides = document.querySelectorAll('.destination-slide');
        if (!slides.length) return;

        this.slides = slides;
        this.currentIndex = 0;

        setInterval(() => this.changeSlide(), CONFIG.slideshows.destination);
    },

    changeSlide() {
        this.slides.forEach(slide => slide.classList.remove('active'));
        this.currentIndex = (this.currentIndex + 1) % this.slides.length;
        this.slides[this.currentIndex].classList.add('active');
    }
};

/* ==========================================================================
   15. NEWSLETTER SECTION
   ========================================================================== */
const NewsletterController = {
    init() {
        const form = document.querySelector('.newsletter-form');
        if (!form) return;

        form.addEventListener('submit', (e) => this.handleSubmit(e));
    },

    async handleSubmit(e) {
        e.preventDefault();

        const form = e.target;
        const emailInput = form.querySelector('input[type="email"]');
        const submitButton = form.querySelector('button[type="submit"]');
        const originalText = submitButton.textContent;

        submitButton.disabled = true;
        submitButton.textContent = 'Enviando...';

        try {
            await Utils.delay(1000);
            this.showMessage('Obrigado por se inscrever! Em breve você receberá nossas novidades.', 'success');
            form.reset();
        } catch (error) {
            this.showMessage('Ocorreu um erro. Por favor, tente novamente.', 'error');
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = originalText;
        }
    },

    showMessage(message, type) {
        const existingToast = document.querySelector('.toast');
        if (existingToast) {
            existingToast.remove();
        }

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: ${type === 'success' ? '#4CAF50' : '#f44336'};
            color: white;
            padding: 16px 24px;
            border-radius: 4px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.2);
            z-index: 9999;
            animation: slideIn 0.3s ease;
            max-width: 90%;
        `;

        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
};

/* ==========================================================================
   16. INICIALIZAÇÃO DA APLICAÇÃO
   ========================================================================== */
const App = {
    init() {
        console.log('🎉 Iniciando Réveillon Carneiros 2026...');

        // Sistema global de error handling
        this.setupGlobalErrorHandling();
        
        // Preload de imagens críticas
        this.preloadCriticalImages();

        // Lazy load de imagens globalmente
        Utils.lazyLoadImages();

        // Inicializa todos os controladores
        HeaderController.init();
        NavigationController.init();
        
        // Novo carousel V2 para mobile
        if (window.innerWidth <= 768) {
            import('./components/ExperiencesCarouselV2.js').then(module => {
                new module.default('.experiences-wrapper');
            });
        }
        
        AllInclusiveController.init();
        MoutonBeachController.init();
        VillaMoutonController.init();
        
        // Comentar: MusicController.init();
        
        // Novo Music Carousel V2
        import('./components/MusicCarouselV2.js').then(module => {
            const carousel = new module.default('.artists-swiper-container');
            
            // Início suave após 1s
            setTimeout(() => carousel.startAnimation(), 1000);
        });
        
        WellnessController.init();
        FAQController.init();
        DestinationController.init();
        NewsletterController.init();

        console.log('✅ Todos os módulos iniciados com sucesso!');


        // Monitora mudanças de tamanho da tela
        this.setupResizeHandler();
    },

    // Sistema global de tratamento de erros de imagem
    setupGlobalErrorHandling() {
        document.addEventListener('error', (e) => {
            if (e.target.tagName === 'IMG') {
                this.handleImageError(e.target);
            }
        }, true);
    },

    // Trata erros de imagem com retry automático
    handleImageError(img) {
        const retryCount = parseInt(img.dataset.retryCount || '0');
        
        if (retryCount < 2) {
            img.dataset.retryCount = retryCount + 1;
            
            // Retry com exponential backoff
            setTimeout(() => {
                const fallbacks = Utils.generateImageFallbacks(img.src);
                const nextFallback = fallbacks[retryCount + 1];
                
                if (nextFallback && nextFallback !== img.src) {
                    console.warn(`🔄 Retry ${retryCount + 1} para imagem:`, img.src, '→', nextFallback);
                    img.src = nextFallback;
                } else {
                    img.src = Utils.getPlaceholderSVG();
                    img.classList.add('image-error');
                }
            }, 1000 * Math.pow(2, retryCount));
        } else {
            img.src = Utils.getPlaceholderSVG();
            img.classList.add('image-error');
            console.error('❌ Imagem falhou permanentemente:', img.src);
        }
    },

    // Preload de imagens críticas
    preloadCriticalImages() {
        const criticalImages = [
            '/assets/images/hero/hero-background-high.webp',
            '/assets/images/hero/hero-background.webp',
            '/assets/images/mouton/mouton-main.jpg',
            '/assets/images/night-celebrations/aura.jpg',
            '/assets/images/night-celebrations/luau.jpg'
        ];

        criticalImages.forEach(src => {
            const img = new Image();
            img.src = src;
        });

        console.log('🚀 Preload de imagens críticas iniciado');
    },


    setupResizeHandler() {
        let resizeTimer;

        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                // V2 carousel tem resize handler interno
            }, 250);
        });
    }
};

/* ==========================================================================
   INICIALIZAÇÃO
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});

// Estilos para animações do toast
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);

// Controle de visibilidade da página
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        console.log('⏸️ Página oculta - pausando animações');
    } else {
        console.log('▶️ Página visível - retomando animações');
    }
});
// Language Selector Controller
const LanguageSelectorController = {
    init() {
        this.bindEvents();
    },

    bindEvents() {
        // Mobile language selector click handler
        const langToggle = document.querySelector('.lang-toggle');
        const langSelector = document.querySelector('.language-selector');
        
        if (langToggle && langSelector) {
            langToggle.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                // Toggle active class for mobile dropdown
                langSelector.classList.toggle('active');
            });
        }

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            const langSelector = document.querySelector('.language-selector');
            if (langSelector && !langSelector.contains(e.target)) {
                langSelector.classList.remove('active');
            }
        });

        // Close dropdown on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const langSelector = document.querySelector('.language-selector');
                if (langSelector) {
                    langSelector.classList.remove('active');
                }
            }
        });
    }
};

// Import language detector
document.addEventListener('DOMContentLoaded', () => {
    if (typeof LanguageDetector !== 'undefined') {
        LanguageDetector.init();
    }
    
    // Initialize language selector
    LanguageSelectorController.init();
});
