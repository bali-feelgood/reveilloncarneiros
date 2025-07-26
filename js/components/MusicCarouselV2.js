/* ==========================================================================
   MUSIC CAROUSEL V2 - OTIMIZADO COM TRANSFORM E PERFORMANCE
   ========================================================================== */

class MusicCarouselV2 {
    constructor(containerSelector = '.artists-swiper-container') {
        this.container = document.querySelector(containerSelector);
        this.wrapper = this.container?.querySelector('.swiper-wrapper');
        
        if (!this.container || !this.wrapper) return;
        
        this.state = {
            isPlaying: true,
            speed: 0.5,
            direction: 1,
            isDragging: false,
            translateX: 0
        };
        
        this.config = {
            edgeBuffer: 10,
            velocityDecay: 0.95,
            minVelocity: 0.5,
            throttleMs: 16
        };
        
        this.dragData = { startX: 0, startTranslate: 0, velocityHistory: [] };
        this.animationId = null;
        this.lastThrottle = 0;
        this.boundHandlers = {};
        
        this.init();
    }
    
    init() {
        this.setupCarousel();
        this.setupDragHandlers();
        this.setupTeaserLink();
        this.setupVisibilityHandler();
        this.startAnimation();
    }
    
    setupCarousel() {
        this.wrapper.classList.remove('swiper-wrapper');
        this.wrapper.parentElement.classList.remove('swiper');
        
        this.wrapper.style.cssText = `
            display: flex;
            gap: 1rem;
            transition: none;
            transform: translateX(0px);
            cursor: grab;
            user-select: none;
        `;
        
        this.container.style.cssText = `
            overflow: hidden;
            position: relative;
            width: 100%;
            padding: 0 2rem;
            touch-action: pan-x;
        `;
        
        this.wrapper.querySelectorAll('.swiper-slide').forEach(slide => {
            slide.classList.remove('swiper-slide');
            slide.style.flexShrink = '0';
        });
    }
    
    setupDragHandlers() {
        this.boundHandlers.pointerDown = (e) => this.handlePointerDown(e);
        this.boundHandlers.pointerMove = (e) => this.throttledPointerMove(e);
        this.boundHandlers.pointerUp = (e) => this.handlePointerUp(e);
        
        this.container.addEventListener('pointerdown', this.boundHandlers.pointerDown);
        this.container.addEventListener('pointermove', this.boundHandlers.pointerMove);
        this.container.addEventListener('pointerup', this.boundHandlers.pointerUp);
        this.container.addEventListener('pointercancel', this.boundHandlers.pointerUp);
        
        // Previne scroll vertical durante drag horizontal
        this.container.addEventListener('touchmove', (e) => {
            if (this.state.isDragging) {
                e.preventDefault();
            }
        }, { passive: false });
    }
    
    setupVisibilityHandler() {
        this.boundHandlers.visibilityChange = () => {
            this.state.isPlaying = !document.hidden;
        };
        document.addEventListener('visibilitychange', this.boundHandlers.visibilityChange);
    }
    
    throttledPointerMove(e) {
        const now = performance.now();
        if (now - this.lastThrottle < this.config.throttleMs) return;
        this.lastThrottle = now;
        this.handlePointerMove(e);
    }
    
    handlePointerDown(e) {
        this.state.isPlaying = false;
        this.state.isDragging = true;
        this.wrapper.style.willChange = 'transform';
        this.wrapper.style.cursor = 'grabbing';
        
        this.dragData.startX = e.clientX;
        this.dragData.startTranslate = this.state.translateX;
        this.dragData.velocityHistory = [];
        e.preventDefault();
    }
    
    handlePointerMove(e) {
        if (!this.state.isDragging) return;
        
        const deltaX = e.clientX - this.dragData.startX;
        const newTranslateX = this.dragData.startTranslate + deltaX;
        
        // Aplicar limites durante o drag usando cálculo preciso
        const maxTranslate = this.getMaxTranslate();
        this.state.translateX = Math.max(maxTranslate, Math.min(0, newTranslateX));
        
        this.updateTransform();
        
        this.dragData.velocityHistory.push({
            x: e.clientX,
            time: performance.now()
        });
        
        if (this.dragData.velocityHistory.length > 5) {
            this.dragData.velocityHistory.shift();
        }
    }
    
    handlePointerUp(e) {
        if (!this.state.isDragging) return;
        
        this.state.isDragging = false;
        this.wrapper.style.willChange = 'auto';
        this.wrapper.style.cursor = 'grab';
        
        const velocity = this.calculateVelocity();
        this.applyInertia(velocity);
    }
    
    calculateVelocity() {
        if (this.dragData.velocityHistory.length < 2) return 0;
        
        const recent = this.dragData.velocityHistory.slice(-3);
        const first = recent[0];
        const last = recent[recent.length - 1];
        
        const deltaX = last.x - first.x;
        const deltaTime = last.time - first.time;
        
        return deltaTime > 0 ? deltaX / deltaTime : 0;
    }
    
    applyInertia(velocity) {
        const inertiaStep = () => {
            if (Math.abs(velocity) < this.config.minVelocity) {
                // Retoma imediatamente sem delay
                this.state.isPlaying = true;
                return;
            }
            
            this.state.translateX += velocity;
            this.updateTransform();
            velocity *= this.config.velocityDecay;
            
            requestAnimationFrame(inertiaStep);
        };
        
        if (Math.abs(velocity) > this.config.minVelocity) {
            inertiaStep();
        } else {
            // Retoma imediatamente
            this.state.isPlaying = true;
        }
    }
    
    animate() {
        if (!this.state.isPlaying || this.state.isDragging || document.hidden) {
            this.animationId = requestAnimationFrame(() => this.animate());
            return;
        }
        
        const movement = this.state.speed * this.state.direction;
        const maxTranslate = this.getMaxTranslate();
        
        // Limites mais precisos - sem edgeBuffer
        if (this.state.translateX <= maxTranslate && this.state.direction === -1) {
            this.state.direction = 1;
            this.state.translateX = maxTranslate; // Força ficar no limite exato
        } else if (this.state.translateX >= 0 && this.state.direction === 1) {
            this.state.direction = -1;
            this.state.translateX = 0; // Força ficar no limite exato
        } else {
            // Só move se não estiver nos limites
            this.state.translateX += movement;
        }
        
        this.updateTransform();
        this.animationId = requestAnimationFrame(() => this.animate());
    }
    
    updateTransform() {
        this.wrapper.style.transform = `translateX(${this.state.translateX}px)`;
    }
    
    getMaxTranslate() {
        const cards = this.wrapper.children;
        const totalCardWidth = Array.from(cards).reduce((total, card) => {
            return total + card.offsetWidth + parseFloat(getComputedStyle(card).marginRight || 0);
        }, 0);
        return -(totalCardWidth - this.container.clientWidth + 32); // +32 para padding
    }
    
    // Removido: pauseAtEdge() - agora é bounce contínuo
    
    startAnimation() {
        if (this.animationId) cancelAnimationFrame(this.animationId);
        this.animate();
    }
    
    stopAnimation() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }
    
    setupTeaserLink() {
        document.querySelectorAll('.teaser-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const newsletter = document.querySelector('#newsletter');
                if (newsletter) {
                    newsletter.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    setTimeout(() => {
                        const emailInput = newsletter.querySelector('input[type="email"]');
                        if (emailInput) {
                            emailInput.focus();
                            emailInput.style.boxShadow = '0 0 0 3px rgba(132, 133, 71, 0.3)';
                            setTimeout(() => emailInput.style.boxShadow = '', 2000);
                        }
                    }, 800);
                }
            });
        });
    }
    
    play() { this.state.isPlaying = true; }
    pause() { this.state.isPlaying = false; }
    setSpeed(speed) { this.state.speed = speed; }
    reverseDirection() { this.state.direction *= -1; }
    
    destroy() {
        this.stopAnimation();
        
        // Remove todos os event listeners
        Object.entries(this.boundHandlers).forEach(([event, handler]) => {
            if (event === 'visibilityChange') {
                document.removeEventListener('visibilitychange', handler);
            } else {
                this.container.removeEventListener(event.replace(/([A-Z])/g, '$1').toLowerCase(), handler);
            }
        });
        
        // Reset estado e DOM
        this.state = { isPlaying: false, isDragging: false, translateX: 0 };
        this.wrapper.style.cssText = '';
        this.container.style.cssText = '';
        this.boundHandlers = {};
    }
}

export default MusicCarouselV2;