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
           1. CONFIGURAÇÕES GLOBAIS
           ========================================================================== */
        const CONFIG = {
            // Tempos de animação
            animations: {
                fadeIn: 700,
                slideTransition: 300,
                scrollSmooth: 800,
                imageTransition: 150
            },

            // Breakpoints (devem coincidir com o CSS)
            breakpoints: {
                mobile: 768,
                tablet: 992,
                desktop: 1200
            },

            // Configurações dos carousels
            slideshows: {
                allInclusive: 5000,      // 5 segundos
                moutonBeach: 4000,       // 4 segundos
                destination: 4000,       // 4 segundos
                villaTransition: 300     // 200ms para transição
            },

            // Configurações do Swiper (artistas)
            swiper: {
                autoplayDelay: 3000,
                speed: 800,
                spaceBetween: {
                    mobile: 8,
                    tablet: 12,
                    desktop: 16
                }
            },

            // Configurações do Wellness Carousel
            wellness: {
                scrollSpeed: 0.5
            }
        };

        /* ==========================================================================
           2. FUNÇÕES UTILITÁRIAS
           ========================================================================== */
        const Utils = {
            // Função para verificar se estamos no mobile
            isMobile() {
                return window.innerWidth <= CONFIG.breakpoints.mobile;
            },

            // Função para adicionar delay
            delay(ms) {
                return new Promise(resolve => setTimeout(resolve, ms));
            },

            // Função para fazer fade em elementos
            fadeIn(element, duration = CONFIG.animations.fadeIn) {
                element.style.opacity = '0';
                element.style.transition = `opacity ${duration}ms ease`;

                // Força o navegador a reconhecer o estado inicial
                element.offsetHeight;

                element.style.opacity = '1';
            },

            // Função para fazer fade out
            fadeOut(element, duration = CONFIG.animations.fadeIn) {
                element.style.transition = `opacity ${duration}ms ease`;
                element.style.opacity = '0';
            },

            // Função para scroll suave
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
            }
        };

        /* ==========================================================================
           3. HEADER - MUDANÇA DE COR NO SCROLL
           ========================================================================== */
        const HeaderController = {
            init() {
                this.header = document.querySelector('#main-header');
                if (!this.header) return;

                // Adiciona listener de scroll
                window.addEventListener('scroll', () => this.handleScroll());

                // Verifica o estado inicial
                this.handleScroll();
            },

            handleScroll() {
                const scrollPosition = window.scrollY;
                const heroSection = document.querySelector('.hero-section');
                const heroHeight = heroSection ? heroSection.offsetHeight : 700;

                // Adiciona ou remove a classe baseado na posição do scroll
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

                let scrollPosition = 0;

                const toggleMenu = (forceClose = false) => {
                    const isActive = menu.classList.contains('active');
                    const shouldClose = forceClose || isActive;

                    if (shouldClose) {
                        // Fecha o menu
                        menu.classList.remove('active');
                        overlay.classList.remove('active');
                        toggle.classList.remove('active');

                        // Remove o travamento do scroll
                        document.documentElement.style.overflow = '';
                        document.body.style.overflow = '';
                        document.body.classList.remove('menu-open');
                    } else {
                        // Abre o menu
                        menu.classList.add('active');
                        overlay.classList.add('active');
                        toggle.classList.add('active');

                        // Trava o scroll sem mudar a posição
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

                        // Link "Jornada" apenas abre/fecha dropdown
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

                        // Links válidos navegam e fecham menu
                        if (href.startsWith('#')) {
                            e.preventDefault();

                            // CORREÇÃO: Fecha menu e navega SEM DELAY
                            const targetId = href;
                            toggleMenu(true);

                            // Usa requestAnimationFrame para garantir que o DOM atualizou
                            requestAnimationFrame(() => {
                                Utils.smoothScrollTo(targetId);
                            });
                        }
                    });
                });

                // ESC para fechar
                document.addEventListener('keydown', (e) => {
                    if (e.key === 'Escape' && menu.classList.contains('active')) {
                        toggleMenu(true);
                    }
                });
            },

            // Configuração dos Dropdowns
            setupDropdowns() {
                // Todos os dropdowns (Comprar e outros futuros)
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

                // Fecha dropdowns ao clicar fora
                document.addEventListener('click', (e) => {
                    if (!e.target.closest('.dropdown') && !e.target.closest('.nav-dropdown')) {
                        document.querySelectorAll('.dropdown, .nav-dropdown').forEach(d => {
                            d.classList.remove('active');
                        });
                    }
                });
            },

            // Configuração do Smooth Scrolling
            setupSmoothScrolling() {
                document.querySelectorAll('a[href^="#"]').forEach(anchor => {
                    anchor.addEventListener('click', (e) => {
                        // Se não for no menu mobile (já tem handler próprio)
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
           5. HERO SECTION - ANIMAÇÕES (se necessário)
           ========================================================================== */
        // Hero não precisa de JS específico, as animações são via CSS

        /* ==========================================================================
           6. MANIFESTO SECTION - ANIMAÇÕES (se necessário)
           ========================================================================== */
        // Manifesto usa AOS library para animações

        /* ==========================================================================
           7. EXPERIENCES SECTION - CAROUSEL MOBILE COM AUTOPLAY
           ========================================================================== */
        const ExperiencesController = {
            init() {
                this.wrapper = document.querySelector('.experiences-wrapper');
                this.cards = document.querySelectorAll('.experience-card');

                if (!this.wrapper || !this.cards.length) return;

                // Configurações
                this.currentIndex = 0;
                this.autoplayInterval = null;
                this.autoplayDelay = 6000;        // MUDOU: de 4000 para 6000 (6 segundos entre slides)
                this.slideSpeed = 1200;           // MUDOU: de 800 para 1200 (transição mais suave)
                this.expandSpeed = 1000;          // MUDOU: de 500 para 1000 (expansão mais lenta)
                this.pauseAfterInteraction = 8000; // MUDOU: de 5000 para 8000 (pausa maior após interação)

                // Variáveis de controle do drag
                this.startX = 0;
                this.currentX = 0;
                this.startTime = 0;
                this.startScrollLeft = 0;

                // Variáveis para cálculo de velocidade
                this.velocityX = 0;
                this.lastX = 0;
                this.lastTime = 0;

                // Setup apenas no mobile
                if (Utils.isMobile()) {
                    this.setupMobile();
                }

                // Monitora resize
                window.addEventListener('resize', () => {
                    if (Utils.isMobile()) {
                        if (!this.autoplayInterval) {
                            this.setupMobile();
                        }
                    } else {
                        this.cleanup();
                    }
                });
            },

            setupMobile() {
                // Garante scroll suave sempre
                this.wrapper.style.scrollBehavior = 'smooth';
                this.wrapper.style.webkitOverflowScrolling = 'touch';

                // Centraliza primeiro card
                setTimeout(() => {
                    this.goToCard(0, false);
                    this.activateCard(0);
                }, 100);

                // Configura drag/touch
                this.setupDragHandlers();

                // Inicia autoplay
                setTimeout(() => {
                    this.startAutoplay();
                }, 1000);
            },

            setupDragHandlers() {
                // Touch events
                this.wrapper.addEventListener('touchstart', (e) => this.handleStart(e), { passive: true });
                this.wrapper.addEventListener('touchmove', (e) => this.handleMove(e), { passive: false });
                this.wrapper.addEventListener('touchend', (e) => this.handleEnd(e));

                // Previne scroll vertical durante swipe horizontal
                let touchStartY = 0;
                this.wrapper.addEventListener('touchstart', (e) => {
                    touchStartY = e.touches[0].clientY;
                }, { passive: true });

                this.wrapper.addEventListener('touchmove', (e) => {
                    if (this.isDragging) {
                        const touchY = e.touches[0].clientY;
                        const diffY = Math.abs(touchY - touchStartY);
                        const diffX = Math.abs(this.currentX - this.startX);

                        // Se movimento horizontal é maior que vertical, previne scroll
                        if (diffX > diffY && diffX > 10) {
                            e.preventDefault();
                        }
                    }
                }, { passive: false });
            },

            handleStart(e) {
                this.isDragging = true;
                this.startTime = Date.now();
                this.startX = e.touches[0].clientX;
                this.lastX = this.startX;
                this.lastTime = this.startTime;
                this.velocityX = 0;
                this.startScrollLeft = this.wrapper.scrollLeft;

                // Para autoplay e recolhe informações
                this.stopAutoplay();
                this.deactivateAllCards();

                // Remove scroll behavior durante drag para controle manual
                this.wrapper.style.scrollBehavior = 'auto';
            },

            handleMove(e) {
                if (!this.isDragging) return;

                this.currentX = e.touches[0].clientX;
                const currentTime = Date.now();
                const deltaTime = currentTime - this.lastTime;
                const deltaX = this.currentX - this.lastX;

                // Calcula velocidade instantânea
                if (deltaTime > 0) {
                    this.velocityX = deltaX / deltaTime;
                }

                // Atualiza posição do scroll
                const diff = this.startX - this.currentX;
                this.wrapper.scrollLeft = this.startScrollLeft + diff;

                // Atualiza últimos valores
                this.lastX = this.currentX;
                this.lastTime = currentTime;
            },

            handleEnd(e) {
                if (!this.isDragging) return;

                this.isDragging = false;
                const endTime = Date.now();
                const totalTime = endTime - this.startTime;
                const totalDistance = this.startX - this.currentX;

                // Restaura scroll behavior
                this.wrapper.style.scrollBehavior = 'smooth';

                // Calcula velocidade final e direção
                const velocity = Math.abs(this.velocityX);
                const direction = totalDistance > 0 ? 1 : -1;

                // Thresholds ajustados para maior sensibilidade
                const minSwipeDistance = 30; // Reduzido de 50 para 30
                const minVelocity = 0.3; // Velocidade mínima para considerar swipe
                const strongVelocity = 1.2; // Velocidade para swipe forte

                let targetIndex = this.currentIndex;

                // Detecta tipo de gesto
                if (Math.abs(totalDistance) > minSwipeDistance || velocity > minVelocity) {
                    if (velocity > strongVelocity) {
                        // Swipe forte - pula múltiplos cards
                        const cardsToSkip = Math.min(Math.floor(velocity * 2), 3); // Máximo 3 cards
                        targetIndex = this.currentIndex + (direction * cardsToSkip);
                    } else {
                        // Swipe normal - passa 1 card
                        targetIndex = this.currentIndex + direction;
                    }

                    // Limita aos bounds
                    targetIndex = Math.max(0, Math.min(targetIndex, this.cards.length - 1));
                } else {
                    // Movimento muito pequeno - volta ao card atual
                    targetIndex = this.findNearestCard();
                }

                // Vai para o card alvo com animação suave
                this.goToCard(targetIndex, true);

                // Retoma autoplay após pausa
                setTimeout(() => {
                    if (!this.isDragging) {
                        this.startAutoplay();
                    }
                }, this.pauseAfterInteraction);
            },

            findNearestCard() {
                const scrollCenter = this.wrapper.scrollLeft + this.wrapper.offsetWidth / 2;
                let nearestIndex = 0;
                let nearestDistance = Infinity;

                this.cards.forEach((card, index) => {
                    const cardCenter = card.offsetLeft + card.offsetWidth / 2;
                    const distance = Math.abs(scrollCenter - cardCenter);

                    if (distance < nearestDistance) {
                        nearestDistance = distance;
                        nearestIndex = index;
                    }
                });

                return nearestIndex;
            },

            goToCard(index, animate = true) {
                const card = this.cards[index];
                const cardWidth = card.offsetWidth;
                const containerWidth = this.wrapper.offsetWidth;
                const targetScroll = card.offsetLeft - (containerWidth - cardWidth) / 2;

                if (animate) {
                    // Usa scroll behavior nativo para animação suave
                    this.wrapper.scrollTo({
                        left: targetScroll,
                        behavior: 'smooth'
                    });

                    // Ativa o card após a animação
                    setTimeout(() => {
                        this.currentIndex = index;
                        this.activateCard(index);
                    }, this.slideSpeed);
                } else {
                    this.wrapper.scrollLeft = targetScroll;
                    this.currentIndex = index;
                    this.activateCard(index);
                }
            },

            activateCard(index) {
                // Remove active de todos
                this.cards.forEach((card, i) => {
                    if (i !== index) {
                        card.classList.remove('active');
                    }
                });

                // Ativa o card específico após um pequeno delay
                setTimeout(() => {
                    this.cards[index].classList.add('active');
                }, 100);
            },

            deactivateAllCards() {
                this.cards.forEach(card => {
                    card.classList.remove('active');
                });
            },

            startAutoplay() {
                if (this.autoplayInterval) return;

                this.autoplayInterval = setInterval(() => {
                    if (!this.isDragging && !this.isAnimating) {
                        this.nextCard();
                    }
                }, this.autoplayDelay);
            },

            stopAutoplay() {
                if (this.autoplayInterval) {
                    clearInterval(this.autoplayInterval);
                    this.autoplayInterval = null;
                }
            },

            nextCard() {
                if (this.isAnimating) return;

                this.isAnimating = true;

                // Recolhe a informação do card atual
                this.cards[this.currentIndex].classList.remove('active');

                // Espera recolher e vai para próximo
                setTimeout(() => {
                    if (this.currentIndex === this.cards.length - 1) {
                        // Último card - volta ao primeiro
                        this.slideToFirst();
                    } else {
                        // Próximo card
                        this.goToCard(this.currentIndex + 1, true);
                    }

                    setTimeout(() => {
                        this.isAnimating = false;
                    }, this.slideSpeed);
                }, this.expandSpeed);
            },

            slideToFirst() {
                // Animação suave de volta ao início
                this.wrapper.scrollTo({
                    left: 0,
                    behavior: 'smooth'
                });

                setTimeout(() => {
                    this.currentIndex = 0;
                    this.activateCard(0);
                }, this.slideSpeed * 1.5); // Um pouco mais lento para ser suave
            },

            cleanup() {
                this.stopAutoplay();
                this.deactivateAllCards();
                this.wrapper.style.scrollBehavior = 'auto';
            }
        };

        /* ==========================================================================
   8. ALL INCLUSIVE SECTION - SLIDESHOW DE FUNDO
   ========================================================================== */
        const AllInclusiveController = {
            init() {
                const bgImages = document.querySelectorAll('.all-inclusive-bg .bg-image');
                if (!bgImages.length) return;

                this.images = bgImages;
                this.currentIndex = 0;

                // Inicia o slideshow
                setInterval(() => this.nextImage(), CONFIG.slideshows.allInclusive);
            },

            nextImage() {
                // Remove active de todas
                this.images.forEach(img => img.classList.remove('active'));

                // Avança o índice
                this.currentIndex = (this.currentIndex + 1) % this.images.length;

                // Adiciona active na próxima
                this.images[this.currentIndex].classList.add('active');
            }
        };

        /* ==========================================================================
           9. MOUTON BEACH SECTION - SLIDESHOW
           ========================================================================== */
        const MoutonBeachController = {
            init() {
                const slides = document.querySelectorAll('.mouton-slide');
                if (!slides.length) return;

                this.slides = slides;
                this.currentSlide = 0;

                // Inicia o slideshow
                setInterval(() => this.changeSlide(), CONFIG.slideshows.moutonBeach);
            },

            changeSlide() {
                // Remove active do slide atual
                this.slides[this.currentSlide].classList.remove('active');

                // Avança para o próximo
                this.currentSlide = (this.currentSlide + 1) % this.slides.length;

                // Adiciona active no novo slide
                this.slides[this.currentSlide].classList.add('active');
            }
        };

        /* ==========================================================================
           10. VILLA MOUTON SECTION - TROCA DE IMAGENS NO ACCORDION
           ========================================================================== */
        const VillaMoutonController = {
            init() {
                this.mainImage = document.querySelector('#villa-main-image');
                this.imageContainer = document.querySelector('.villa-mouton-images');

                if (!this.mainImage || !this.imageContainer) return;

                // Imagens para cada serviço
                this.imageMap = {
                    'beleza': 'assets/images/villa-mouton/beleza.jpg',
                    'gastronomia': 'assets/images/villa-mouton/gastronomia.jpg',
                    'store': 'assets/images/villa-mouton/store.jpg',
                    'suporte': 'assets/images/villa-mouton/suporte.jpg',
                    'default': 'assets/images/villa-mouton/default.jpg'
                };

                this.setupAccordion();
            },

            setupAccordion() {
                const items = document.querySelectorAll('.service-list-item');

                items.forEach(item => {
                    const toggle = item.querySelector('.service-toggle');
                    if (!toggle) return;

                    toggle.addEventListener('click', () => {
                        const isActive = item.classList.contains('active');

                        // Fecha todos os outros
                        items.forEach(otherItem => {
                            if (otherItem !== item) {
                                otherItem.classList.remove('active');
                            }
                        });

                        // Toggle do item atual
                        item.classList.toggle('active');

                        // Troca a imagem
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
                // Fade out simples
                this.imageContainer.classList.add('transitioning');

                // Espera apenas 300ms para o fade out
                await Utils.delay(300);

                // Troca a imagem
                this.mainImage.src = newSrc;

                // Pequeno delay e fade in
                await Utils.delay(50);
                this.imageContainer.classList.remove('transitioning');
            }
        };

        /* ==========================================================================
11. MUSIC SECTION - CARROSSEL CONTÍNUO DE ARTISTAS
========================================================================== */
        const MusicController = {
            init() {
                this.container = document.querySelector('.artists-swiper-container');
                this.wrapper = document.querySelector('.artists-swiper .swiper-wrapper');

                if (!this.container || !this.wrapper) return;

                // Configurações
                this.scrollSpeed = 0.75; // Velocidade do scroll automático
                this.pauseDuration = 2000; // Pausa de 2s nas extremidades
                this.direction = 1; // 1 = direita, -1 = esquerda
                this.isPaused = false;
                this.isDragging = false;
                this.animationId = null;

                // Variáveis de controle do drag
                this.startX = 0;
                this.currentX = 0;
                this.startScrollLeft = 0;

                // Setup
                this.setupCarousel();
                this.setupDragHandlers();

                // Inicia animação
                this.startAnimation();
            },

            setupCarousel() {
                // Remove classes do Swiper se existirem
                this.wrapper.classList.remove('swiper-wrapper');
                this.wrapper.parentElement.classList.remove('swiper');

                // Aplica estilos para carrossel contínuo
                this.wrapper.style.cssText = `
            display: flex;
            gap: 1rem;
            transition: none;
            cursor: grab;
        `;

                // Container com overflow
                this.container.style.cssText = `
            overflow-x: hidden;
            position: relative;
            width: 100%;
            padding: 0 2rem;
        `;

                // Ajusta slides
                const slides = this.wrapper.querySelectorAll('.swiper-slide');
                slides.forEach(slide => {
                    slide.classList.remove('swiper-slide');
                    slide.style.flexShrink = '0';
                });
            },

            setupDragHandlers() {
                // Mouse events
                this.container.addEventListener('mousedown', (e) => this.handleDragStart(e));
                document.addEventListener('mousemove', (e) => this.handleDragMove(e));
                document.addEventListener('mouseup', (e) => this.handleDragEnd(e));

                // Touch events
                this.container.addEventListener('touchstart', (e) => this.handleDragStart(e), { passive: true });
                this.container.addEventListener('touchmove', (e) => this.handleDragMove(e), { passive: false });
                this.container.addEventListener('touchend', (e) => this.handleDragEnd(e));

                // Hover pause
                this.container.addEventListener('mouseenter', () => {
                    if (!this.isDragging) {
                        this.isPaused = true;
                    }
                });

                this.container.addEventListener('mouseleave', () => {
                    if (!this.isDragging) {
                        this.isPaused = false;
                    }
                });
            },

            handleDragStart(e) {
                this.isDragging = true;
                this.isPaused = true;
                this.startX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
                this.startScrollLeft = this.container.scrollLeft;

                this.wrapper.style.cursor = 'grabbing';
                this.container.style.cursor = 'grabbing';

                // Previne seleção de texto
                e.preventDefault();
            },

            handleDragMove(e) {
                if (!this.isDragging) return;

                this.currentX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
                const diff = this.startX - this.currentX;

                // Aplica movimento com "física"
                const resistance = 1; // Sem resistência
                this.container.scrollLeft = this.startScrollLeft + (diff * resistance);
            },

            handleDragEnd(e) {
                if (!this.isDragging) return;

                this.isDragging = false;
                this.wrapper.style.cursor = 'grab';
                this.container.style.cursor = 'grab';

                // Calcula velocidade e aplica inércia
                const endX = e.type.includes('mouse') ? e.clientX :
                    e.changedTouches ? e.changedTouches[0].clientX : this.currentX;
                const velocity = this.startX - endX;

                // Aplica inércia baseada na velocidade
                this.applyInertia(velocity);

                // Retoma animação após 3 segundos
                setTimeout(() => {
                    if (!this.isDragging) {
                        this.isPaused = false;
                    }
                }, 500);
            },

            applyInertia(velocity) {
                // Reduz drasticamente a força inicial
                let inertia = velocity * 0.15; // Reduzido de 0.5 para 0.15
                const deceleration = 0.92; // Reduzido de 0.95 para desacelerar mais rápido

                // Limita a inércia máxima
                const maxInertia = 150; // Máximo de pixels que pode deslizar
                inertia = Math.max(-maxInertia, Math.min(maxInertia, inertia));

                const animate = () => {
                    if (Math.abs(inertia) > 0.5 && !this.isDragging) {
                        this.container.scrollLeft += inertia;
                        inertia *= deceleration;
                        requestAnimationFrame(animate);
                    }
                };

                animate();
            },

            startAnimation() {
                const animate = () => {
                    if (!this.isPaused && !this.isDragging) {
                        const maxScroll = this.wrapper.scrollWidth - this.container.clientWidth;
                        const currentScroll = this.container.scrollLeft;

                        // Verifica limites e inverte direção
                        if (currentScroll >= maxScroll && this.direction === 1) {
                            this.direction = -1;
                            this.pauseAtEdge();
                        } else if (currentScroll <= 0 && this.direction === -1) {
                            this.direction = 1;
                            this.pauseAtEdge();
                        } else {
                            // Movimento contínuo
                            this.container.scrollLeft += this.scrollSpeed * this.direction;
                        }
                    }

                    this.animationId = requestAnimationFrame(animate);
                };

                animate();
            },

            pauseAtEdge() {
                this.isPaused = true;
                setTimeout(() => {
                    if (!this.isDragging) {
                        this.isPaused = false;
                    }
                }, this.pauseDuration);
            },

            destroy() {
                if (this.animationId) {
                    cancelAnimationFrame(this.animationId);
                }
            }
        };


        /* ==========================================================================
          12. WELLNESS SECTION - CAROUSEL E ACCORDIONS
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

                let isPaused = false;
                let isDragging = false;
                let startX = 0;
                let scrollLeft = 0;

                // Animação contínua
                const animate = () => {
                    if (!isPaused && !isDragging) {
                        container.scrollLeft += CONFIG.wellness.scrollSpeed;

                        // Se chegou ao fim, volta ao início
                        const maxScroll = container.scrollWidth / 2;
                        if (container.scrollLeft >= maxScroll) {
                            container.scrollLeft = 0;
                        }
                    }

                    requestAnimationFrame(animate);
                };

                // Inicia a animação
                animate();

                // Touch events para mobile
                container.addEventListener('touchstart', (e) => {
                    isDragging = true;
                    isPaused = true;
                    startX = e.touches[0].pageX - container.offsetLeft;
                    scrollLeft = container.scrollLeft;
                }, { passive: true });

                container.addEventListener('touchmove', (e) => {
                    if (!isDragging) return;
                    e.preventDefault();
                    const x = e.touches[0].pageX - container.offsetLeft;
                    const walk = (x - startX) * 1;
                    container.scrollLeft = scrollLeft - walk;
                }, { passive: false });

                container.addEventListener('touchend', () => {
                    isDragging = false;
                    // Resume autoplay após 2 segundos
                    setTimeout(() => {
                        isPaused = false;
                    }, 800);
                });

                // Mouse events para desktop - CORRIGIDO
                container.addEventListener('mousedown', (e) => {
                    isDragging = true;
                    isPaused = true;
                    startX = e.pageX - container.offsetLeft;
                    scrollLeft = container.scrollLeft;
                    container.style.cursor = 'grabbing';
                    e.preventDefault(); // Previne seleção de texto
                });

                // IMPORTANTE: eventos no document para capturar mouse fora do container
                document.addEventListener('mousemove', (e) => {
                    if (!isDragging) return;
                    e.preventDefault();
                    const x = e.pageX - container.offsetLeft;
                    const walk = (x - startX) * 2;
                    container.scrollLeft = scrollLeft - walk;
                });

                document.addEventListener('mouseup', () => {
                    if (!isDragging) return;
                    isDragging = false;
                    container.style.cursor = 'grab';
                    // Resume após x segundos
                    setTimeout(() => {
                        isPaused = false;
                    }, 500);
                });

                // Adiciona cursor grab no container
                container.style.cursor = 'grab';
            },

            setupAccordions() {
                const items = document.querySelectorAll('.activity-item');

                items.forEach(item => {
                    const toggle = item.querySelector('.activity-toggle');
                    if (!toggle) return;

                    toggle.addEventListener('click', () => {
                        // Fecha outros accordions na mesma categoria
                        const category = item.closest('.wellness-category');
                        const otherItems = category.querySelectorAll('.activity-item');

                        otherItems.forEach(otherItem => {
                            if (otherItem !== item) {
                                otherItem.classList.remove('active');
                            }
                        });

                        // Toggle do item atual
                        item.classList.toggle('active');
                    });
                });
            }
        };

        /* ==========================================================================
           13. FAQ SECTION - ACCORDIONS DE DOIS NÍVEIS
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

                        // Fecha todas as outras categorias
                        categories.forEach(other => {
                            if (other !== category) {
                                other.classList.remove('active');
                                // Fecha todas as perguntas dentro
                                other.querySelectorAll('.faq-item').forEach(item => {
                                    item.classList.remove('active');
                                });
                            }
                        });

                        // Toggle da categoria atual
                        category.classList.toggle('active');

                        // Se fechou a categoria, fecha todas as perguntas dentro
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
                        // Fecha outras perguntas na mesma categoria
                        const category = item.closest('.faq-category-content');
                        const otherItems = category.querySelectorAll('.faq-item');

                        otherItems.forEach(otherItem => {
                            if (otherItem !== item) {
                                otherItem.classList.remove('active');
                            }
                        });

                        // Toggle da pergunta atual
                        item.classList.toggle('active');
                    });
                });
            }
        };

        /* ==========================================================================
           14. DESTINATION SECTION - SLIDESHOW
           ========================================================================== */
        const DestinationController = {
            init() {
                const slides = document.querySelectorAll('.destination-slide');
                if (!slides.length) return;

                this.slides = slides;
                this.currentIndex = 0;

                // Inicia o slideshow
                setInterval(() => this.changeSlide(), CONFIG.slideshows.destination);
            },

            changeSlide() {
                // Remove active de todos
                this.slides.forEach(slide => slide.classList.remove('active'));

                // Avança o índice
                this.currentIndex = (this.currentIndex + 1) % this.slides.length;

                // Adiciona active no próximo
                this.slides[this.currentIndex].classList.add('active');
            }
        };

        /* ==========================================================================
           15. NEWSLETTER SECTION - FORMULÁRIO
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

                // Desabilita o botão e mostra loading
                submitButton.disabled = true;
                submitButton.textContent = 'Enviando...';

                try {
                    // Simula envio (substitua por sua API real)
                    await Utils.delay(1000);

                    // Sucesso
                    this.showMessage('Obrigado por se inscrever! Em breve você receberá nossas novidades.', 'success');
                    form.reset();

                } catch (error) {
                    // Erro
                    this.showMessage('Ocorreu um erro. Por favor, tente novamente.', 'error');

                } finally {
                    // Restaura o botão
                    submitButton.disabled = false;
                    submitButton.textContent = originalText;
                }
            },

            showMessage(message, type) {
                // Remove mensagem anterior se existir
                const existingToast = document.querySelector('.toast');
                if (existingToast) {
                    existingToast.remove();
                }

                // Cria nova mensagem
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

                // Remove após 3 segundos
                setTimeout(() => {
                    toast.style.animation = 'slideOut 0.3s ease';
                    setTimeout(() => toast.remove(), 300);
                }, 3000);
            }
        };

        /* ==========================================================================
           16. FOOTER - INTERAÇÕES (se necessário)
           ========================================================================== */
        // Footer não precisa de JS específico

        /* ==========================================================================
           17. INICIALIZAÇÃO DA APLICAÇÃO
           ========================================================================== */
        const App = {
            init() {
                console.log('🎉 Iniciando Réveillon Carneiros 2026...');

                // Inicializa AOS (Animate on Scroll)
                if (typeof AOS !== 'undefined') {
                    AOS.init({
                        duration: CONFIG.animations.fadeIn,
                        once: true,
                        offset: 50
                    });
                }

                // Inicializa todos os controladores
                HeaderController.init();
                NavigationController.init();
                ExperiencesController.init();
                AllInclusiveController.init(); // Este estava faltando!
                MoutonBeachController.init();
                VillaMoutonController.init();
                MusicController.init();
                WellnessController.init();
                FAQController.init();
                DestinationController.init();
                NewsletterController.init();

                console.log('✅ Todos os módulos iniciados com sucesso!');

                // Monitora mudanças de tamanho da tela
                this.setupResizeHandler();
            },

            setupResizeHandler() {
                let resizeTimer;

                window.addEventListener('resize', () => {
                    // Debounce para performance
                    clearTimeout(resizeTimer);

                    resizeTimer = setTimeout(() => {
                        // Reinicia módulos que dependem do tamanho da tela
                        if (Utils.isMobile()) {
                            ExperiencesController.init();
                        }
                    }, 250);
                });
            }
        };

        /* ==========================================================================
           INICIALIZAÇÃO
           ========================================================================== */

        // Espera o DOM carregar completamente
        document.addEventListener('DOMContentLoaded', () => {
            App.init();
        });

        // Adiciona estilos para animações do toast
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

        // Controle de visibilidade da página (pausa animações quando não visível)
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                console.log('⏸️ Página oculta - pausando animações');
                // Aqui você pode pausar animações se necessário
            } else {
                console.log('▶️ Página visível - retomando animações');
                // Aqui você pode retomar animações
            }
        });
