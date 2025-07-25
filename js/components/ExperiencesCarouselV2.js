/* ==========================================================================
   EXPERIENCES CAROUSEL V2 - ARQUITETURA MODERNA COM STATE MACHINE
   ========================================================================== */

// Estados da máquina
const CAROUSEL_STATES = {
    IDLE: 'idle',
    DRAGGING: 'dragging', 
    SCROLLING: 'scrolling',
    AUTOPLAY: 'autoplay'
};

class ExperiencesCarouselV2 {
    constructor(containerSelector = '.experiences-wrapper') {
        this.container = document.querySelector(containerSelector);
        this.cards = this.container?.querySelectorAll('.experience-card') || [];
        
        if (!this.container || !this.cards.length) {
            console.warn('ExperiencesCarouselV2: Container ou cards não encontrados');
            return;
        }
        
        // Estado centralizado
        this.state = {
            current: CAROUSEL_STATES.IDLE,
            currentIndex: 0,
            touchStartX: 0,
            touchStartTime: 0,
            scrollLeft: 0,
            autoplayTimer: null,
            scrollTimer: null,
            returnTimer: null
        };
        
        // Configurações
        this.config = {
            autoplayDelay: 5000,
            touchThreshold: 10,
            scrollDebounce: 150,
            returnDelay: 3000,
            snapThreshold: 0.3
        };
        
        this.init();
    }
    
    init() {
        if (!this.isMobile()) return;
        
        this.setupDOM();
        this.setupEventListeners();
        this.setState(CAROUSEL_STATES.IDLE);
        
        // Inicialização assíncrona
        requestAnimationFrame(() => {
            this.render();
            setTimeout(() => this.startAutoplay(), 1000);
        });
    }
    
    isMobile() {
        return window.innerWidth <= 768;
    }
    
    setupDOM() {
        // Adiciona classes para CSS
        this.container.classList.add('mobile-carousel', 'v2-carousel');
    }
    
    setupEventListeners() {
        // Scroll events
        this.container.addEventListener('scroll', this.handleScroll.bind(this), { passive: true });
        
        // Touch events  
        this.container.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: true });
        this.container.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: true });
        
        // Resize events
        window.addEventListener('resize', this.handleResize.bind(this));
        
        // Configura IntersectionObserver para detectar card ativo
        this.observeCards();
    }
    
    setState(newState, payload = {}) {
        const prevState = this.state.current;
        
        // Atualiza estado
        this.state = {
            ...this.state,
            current: newState,
            ...payload
        };
        
        // Log para debug
        if (prevState !== newState) {
            console.log(`Carousel: ${prevState} → ${newState}`, payload);
        }
        
        // Trigger render
        this.render();
        
        // State-specific side effects
        this.handleStateChange(newState, prevState);
    }
    
    handleStateChange(newState, prevState) {
        switch (newState) {
            case CAROUSEL_STATES.AUTOPLAY:
                this.scheduleAutoplay();
                break;
                
            case CAROUSEL_STATES.DRAGGING:
                this.clearTimers();
                break;
                
            case CAROUSEL_STATES.SCROLLING:
                this.clearTimers();
                this.scheduleScrollEnd();
                break;
                
            case CAROUSEL_STATES.IDLE:
                this.scheduleAutoplayReturn();
                break;
        }
    }
    
    render() {
        // Atualiza classes CSS dos cards
        this.cards.forEach((card, index) => {
            card.classList.toggle('active', index === this.state.currentIndex);
        });
        
        // Atualiza classes do container baseado no estado
        this.container.classList.toggle('is-dragging', this.state.current === CAROUSEL_STATES.DRAGGING);
        this.container.classList.toggle('is-scrolling', this.state.current === CAROUSEL_STATES.SCROLLING);
        this.container.classList.toggle('is-autoplay', this.state.current === CAROUSEL_STATES.AUTOPLAY);
    }
    
    // IntersectionObserver para detectar card ativo
    observeCards() {
        // Configura observer com threshold de 50%
        this.cardObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                // Card está >50% visível
                if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
                    const cardIndex = Array.from(this.cards).indexOf(entry.target);
                    
                    // Atualiza estado apenas se mudou
                    if (cardIndex !== this.state.currentIndex && cardIndex >= 0) {
                        console.log(`Card ${cardIndex} está ativo (${Math.round(entry.intersectionRatio * 100)}% visível)`);
                        
                        // Atualiza estado sem mudar o estado atual da máquina
                        this.setState(this.state.current, { currentIndex: cardIndex });
                    }
                }
            });
        }, {
            root: this.container,
            rootMargin: '0px',
            threshold: 0.5 // Trigger quando card está 50% visível
        });
        
        // Observa todos os cards
        this.cards.forEach(card => {
            this.cardObserver.observe(card);
        });
    }

    // Event Handlers
    handleScroll(e) {
        // Detecta início do scroll manual (usuário tocou/arrastou)
        if (this.state.current === CAROUSEL_STATES.AUTOPLAY) {
            this.setState(CAROUSEL_STATES.SCROLLING);
        } else if (this.state.current === CAROUSEL_STATES.IDLE) {
            this.setState(CAROUSEL_STATES.SCROLLING);
        }
    }
    
    handleTouchStart(e) {
        // Touch detectado - para autoplay e muda para DRAGGING
        this.setState(CAROUSEL_STATES.DRAGGING, {
            touchStartX: e.touches[0].clientX,
            touchStartTime: Date.now()
        });
    }
    
    handleTouchEnd(e) {
        const touchEndX = e.changedTouches[0].clientX;
        const touchDuration = Date.now() - this.state.touchStartTime;
        const distance = Math.abs(this.state.touchStartX - touchEndX);
        
        // Se foi um tap rápido (não drag), não agenda restart
        if (distance < this.config.touchThreshold && touchDuration < 200) {
            this.setState(CAROUSEL_STATES.IDLE);
            return;
        }
        
        // Foi um drag - volta para IDLE e agenda restart do autoplay
        this.setState(CAROUSEL_STATES.IDLE);
        this.scheduleAutoplayReturn();
    }
    
    handleResize() {
        // TODO: Implementar lógica de resize
    }
    
    // Métodos de controle do autoplay
    startAutoplay() {
        // Só inicia se não estiver já em AUTOPLAY
        if (this.state.current !== CAROUSEL_STATES.AUTOPLAY) {
            console.log('Iniciando autoplay...');
            this.setState(CAROUSEL_STATES.AUTOPLAY);
        }
    }
    
    stopAutoplay() {
        // Para autoplay e limpa timers
        if (this.state.current === CAROUSEL_STATES.AUTOPLAY) {
            console.log('Parando autoplay...');
            this.clearTimers();
            this.setState(CAROUSEL_STATES.IDLE);
        }
    }
    
    nextCard() {
        // Só executa autoplay se o carousel estiver visível na viewport
        if (!this.isCarouselVisible()) {
            console.log('Carousel não visível - pausando autoplay');
            this.stopAutoplay();
            return;
        }
        
        // Calcula próximo índice com wrap around
        const nextIndex = (this.state.currentIndex + 1) % this.cards.length;
        console.log(`Autoplay: ${this.state.currentIndex} → ${nextIndex}`);
        
        // Scroll suave para o próximo card
        const targetCard = this.cards[nextIndex];
        if (targetCard) {
            targetCard.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
                inline: 'center'
            });
        }
        
        // NÃO modifica currentIndex - IntersectionObserver fará isso
    }
    
    isCarouselVisible() {
        const rect = this.container.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        
        // Verifica se pelo menos 50% do carousel está visível
        return rect.top < windowHeight * 0.5 && rect.bottom > windowHeight * 0.5;
    }
    
    prevCard() {
        // Calcula índice anterior com wrap around
        const prevIndex = this.state.currentIndex === 0 
            ? this.cards.length - 1 
            : this.state.currentIndex - 1;
            
        const targetCard = this.cards[prevIndex];
        if (targetCard) {
            targetCard.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
                inline: 'center'
            });
        }
    }
    
    scrollToCard(index) {
        // Scroll programático para card específico
        if (index >= 0 && index < this.cards.length) {
            const targetCard = this.cards[index];
            targetCard.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
                inline: 'center'
            });
        }
    }
    
    // Utilitários
    clearTimers() {
        clearInterval(this.state.autoplayTimer);
        clearTimeout(this.state.scrollTimer);
        clearTimeout(this.state.returnTimer);
        
        this.state.autoplayTimer = null;
        this.state.scrollTimer = null;
        this.state.returnTimer = null;
    }
    
    scheduleAutoplay() {
        // Cria interval para autoplay apenas se estiver no estado AUTOPLAY
        if (this.state.current === CAROUSEL_STATES.AUTOPLAY && !this.state.autoplayTimer) {
            this.state.autoplayTimer = setInterval(() => {
                // Verifica se ainda está em AUTOPLAY antes de avançar
                if (this.state.current === CAROUSEL_STATES.AUTOPLAY) {
                    this.nextCard();
                }
            }, this.config.autoplayDelay);
            
            console.log(`Autoplay agendado (${this.config.autoplayDelay}ms)`);
        }
    }
    
    scheduleScrollEnd() {
        // Agenda detecção do fim do scroll
        this.state.scrollTimer = setTimeout(() => {
            // Após o scroll parar, volta para IDLE
            if (this.state.current === CAROUSEL_STATES.SCROLLING) {
                this.setState(CAROUSEL_STATES.IDLE);
            }
        }, this.config.scrollDebounce);
    }
    
    scheduleAutoplayReturn() {
        // Agenda retorno do autoplay após interação do usuário
        this.state.returnTimer = setTimeout(() => {
            // Só retorna autoplay se estiver IDLE (não interagindo)
            if (this.state.current === CAROUSEL_STATES.IDLE) {
                console.log('Retomando autoplay após interação...');
                this.startAutoplay();
            }
        }, this.config.returnDelay);
        
        console.log(`Autoplay agendado para retornar em ${this.config.returnDelay}ms`);
    }
    
    destroy() {
        this.clearTimers();
        
        // Desconecta IntersectionObserver
        if (this.cardObserver) {
            this.cardObserver.disconnect();
            this.cardObserver = null;
        }
        
        // Remove classes
        this.container.classList.remove('mobile-carousel', 'v2-carousel', 'is-dragging', 'is-scrolling', 'is-autoplay');
        
        this.cards.forEach(card => {
            card.classList.remove('active');
        });
    }
}

export default ExperiencesCarouselV2;