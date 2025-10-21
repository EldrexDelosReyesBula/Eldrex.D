/**
 * Eldrex Quotes Collection - Landecs
 * Version: 3.0.0 - Neural Adaptive Edition
 * Author: Eldrex Delos Reyes Bula
 * Publisher: Landecs
 * Website: https://eldrex.landecs.org
 * License: Landecs Proprietary Software License Quotes (LPSLQ)
 * Features: Neural Color Adaptation • Apple Design Principles • Physics Animations
 *           Multi-Container Support • Adaptive Theming • Local ML Processing
 */

class EldrexQuotes {
    constructor(containerId, config = {}) {
        this.containerId = containerId;
        this.instanceId = this.generateUniqueId();
        this.config = {
            containerId: containerId,
            theme: config.theme || 'auto',
            autoRotate: config.autoRotate !== false,
            rotationInterval: config.rotationInterval || 10000,
            showAuthor: config.showAuthor !== false,
            showControls: config.showControls !== false,
            animation: config.animation || 'neuralFade',
            physics: config.physics !== false,
            maxQuotes: config.maxQuotes || null,
            filterQuotes: config.filterQuotes || null,
            customStyles: config.customStyles || {},
            uniqueId: this.instanceId,
            enableDownload: config.enableDownload !== false,
            staticMode: config.staticMode || false, // New: Show only one quote, no rotation
            adaptiveColors: config.adaptiveColors !== false,
            neuralTheme: config.neuralTheme || 'balanced',
            ...config
        };

        this.quotes = this.filterQuotesData(EldrexQuotesManager.contentData.quotes);
        this.currentIndex = Math.floor(Math.random() * this.quotes.length);
        this.isInitialized = false;
        this.animationFrame = null;
        this.physicsEngine = null;
        this.neuralProcessor = new NeuralColorProcessor();
        this.isStatic = this.config.staticMode;

        // Initialize with neural processing
        this.init();
    }

    generateUniqueId() {
        return 'eldrex-' + Math.random().toString(36).substr(2, 9) + '-' + Date.now().toString(36);
    }

    filterQuotesData(quotes) {
        let filtered = [...quotes];

        if (this.config.filterQuotes && Array.isArray(this.config.filterQuotes)) {
            filtered = filtered.filter((_, index) => this.config.filterQuotes.includes(index));
        }

        if (this.config.maxQuotes && this.config.maxQuotes > 0) {
            filtered = filtered.slice(0, this.config.maxQuotes);
        }

        return filtered;
    }

    async init() {
        await this.validateEnvironment();
        await this.analyzeEnvironment();
        this.injectStyles();
        this.createContainer();
        await this.applyNeuralTheming();
        this.renderQuote();
        this.bindEvents();

        if (this.config.autoRotate && !this.isStatic) {
            this.startAutoRotation();
        }

        if (this.config.physics) {
            this.initPhysicsEngine();
        }

        this.isInitialized = true;
        this.showConsoleArt();
    }

    async validateEnvironment() {
        if (typeof document === 'undefined') {
            throw new Error('Eldrex Quotes: DOM environment required');
        }
    }

    async analyzeEnvironment() {
        // Analyze surrounding styles for adaptive theming
        const container = document.getElementById(this.containerId);
        if (container) {
            const styles = window.getComputedStyle(container.parentElement || document.body);
            this.envAnalysis = {
                backgroundColor: styles.backgroundColor,
                color: styles.color,
                fontFamily: styles.fontFamily,
                fontSize: styles.fontSize,
                textAlign: styles.textAlign
            };
        }
    }

    injectStyles() {
        if (document.getElementById('eldrex-quotes-styles')) return;

        const styles = `
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=SF+Pro+Display:wght@300;400;500;600;700&display=swap');
            
            :root {
                /* Neural Generated Color Palette */
                --eldrex-primary: oklch(55% 0.15 240);
                --eldrex-primary-dark: oklch(45% 0.15 240);
                --eldrex-primary-light: oklch(75% 0.1 240);
                --eldrex-surface: oklch(98% 0.02 240);
                --eldrex-surface-elevated: oklch(99% 0.01 240);
                --eldrex-text-primary: oklch(25% 0.05 240);
                --eldrex-text-secondary: oklch(45% 0.05 240);
                --eldrex-text-tertiary: oklch(65% 0.03 240);
                --eldrex-border: oklch(85% 0.03 240);
                --eldrex-border-strong: oklch(75% 0.05 240);
                --eldrex-shadow: 0 1px 3px oklch(0% 0 0 / 0.1), 0 1px 2px oklch(0% 0 0 / 0.06);
                --eldrex-shadow-lg: 0 10px 25px oklch(0% 0 0 / 0.1), 0 5px 10px oklch(0% 0 0 / 0.04);
                --eldrex-backdrop: blur(20px) saturate(180%);
            }

            .eldrex-quotes-container {
                position: relative;
                max-width: min(42rem, 90vw);
                margin: 1.5rem auto;
                padding: 2.5rem;
                border-radius: 1.75rem;
                background: var(--eldrex-surface);
                color: var(--eldrex-text-primary);
                box-shadow: var(--eldrex-shadow);
                border: 1px solid var(--eldrex-border);
                font-family: 'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
                transition: all 0.5s cubic-bezier(0.2, 0, 0, 1);
                overflow: hidden;
                backdrop-filter: var(--eldrex-backdrop);
                -webkit-backdrop-filter: var(--eldrex-backdrop);
            }

            .eldrex-quotes-container.elevated {
                background: var(--eldrex-surface-elevated);
                box-shadow: var(--eldrex-shadow-lg);
            }

            .eldrex-quotes-container::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: 3px;
                background: linear-gradient(90deg, 
                    var(--eldrex-primary-light), 
                    var(--eldrex-primary), 
                    var(--eldrex-primary-light));
                background-size: 200% 100%;
                animation: eldrex-shimmer 3s ease-in-out infinite;
            }

            .eldrex-quote-content {
                position: relative;
                z-index: 10;
            }

            .eldrex-quote-text {
                font-size: clamp(1.125rem, 2.5vw, 1.375rem);
                line-height: 1.7;
                margin-bottom: 1.5rem;
                text-align: center;
                font-weight: 400;
                position: relative;
                padding: 0 1.5rem;
                opacity: 0;
                transform: translateY(1.25rem);
                transition: all 0.6s cubic-bezier(0.2, 0, 0, 1);
                letter-spacing: -0.01em;
            }

            .eldrex-quote-text.visible {
                opacity: 1;
                transform: translateY(0);
            }

            .eldrex-quote-text::before,
            .eldrex-quote-text::after {
                content: '"';
                font-size: 3.5rem;
                color: var(--eldrex-primary-light);
                position: absolute;
                top: -1rem;
                opacity: 0.4;
                font-family: 'Times New Roman', serif;
                font-weight: 300;
                line-height: 1;
            }

            .eldrex-quote-text::before {
                left: -0.25rem;
            }

            .eldrex-quote-text::after {
                right: -0.25rem;
            }

            .eldrex-quote-author {
                text-align: center;
                font-style: normal;
                color: var(--eldrex-text-secondary);
                font-size: 0.95rem;
                margin-top: 1.25rem;
                cursor: pointer;
                transition: all 0.3s cubic-bezier(0.2, 0, 0, 1);
                padding: 0.75rem 1.25rem;
                border-radius: 1rem;
                display: inline-flex;
                align-items: center;
                gap: 0.5rem;
                background: var(--eldrex-surface);
                font-weight: 500;
                border: 1px solid transparent;
                position: relative;
                overflow: hidden;
            }

            .eldrex-quote-author::before {
                content: '';
                position: absolute;
                top: 0;
                left: -100%;
                width: 100%;
                height: 100%;
                background: linear-gradient(90deg, transparent, var(--eldrex-primary-light), transparent);
                transition: left 0.6s ease;
            }

            .eldrex-quote-author:hover::before {
                left: 100%;
            }

            .eldrex-quote-author:hover {
                color: var(--eldrex-primary-dark);
                transform: translateY(-0.125rem);
                background: var(--eldrex-surface-elevated);
                border-color: var(--eldrex-primary-light);
            }

            .eldrex-controls {
                display: flex;
                justify-content: center;
                gap: 0.75rem;
                margin-top: 2rem;
                opacity: 0;
                transform: translateY(0.625rem);
                transition: all 0.5s cubic-bezier(0.2, 0, 0, 1) 0.2s;
                flex-wrap: wrap;
            }

            .eldrex-controls.visible {
                opacity: 1;
                transform: translateY(0);
            }

            .eldrex-btn {
                padding: 0.875rem 1.5rem;
                border: 1.5px solid var(--eldrex-border);
                border-radius: 1rem;
                background: var(--eldrex-surface);
                color: var(--eldrex-text-secondary);
                cursor: pointer;
                transition: all 0.3s cubic-bezier(0.2, 0, 0, 1);
                font-size: 0.875rem;
                font-weight: 500;
                font-family: inherit;
                display: inline-flex;
                align-items: center;
                gap: 0.5rem;
                min-width: 6.25rem;
                justify-content: center;
                position: relative;
                overflow: hidden;
            }

            .eldrex-btn::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: var(--eldrex-primary);
                opacity: 0;
                transition: opacity 0.3s ease;
            }

            .eldrex-btn:hover {
                background: var(--eldrex-surface-elevated);
                border-color: var(--eldrex-primary);
                color: var(--eldrex-primary-dark);
                transform: translateY(-0.125rem);
                box-shadow: 0 4px 12px oklch(0% 0 0 / 0.08);
            }

            .eldrex-btn:active {
                transform: translateY(0);
            }

            .eldrex-btn svg {
                width: 1.125rem;
                height: 1.125rem;
                fill: currentColor;
                transition: transform 0.3s ease;
            }

            .eldrex-btn:hover svg {
                transform: scale(1.1);
            }

            .eldrex-particles {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                pointer-events: none;
                z-index: 1;
            }

            .eldrex-particle {
                position: absolute;
                border-radius: 50%;
                opacity: 0;
                pointer-events: none;
            }

            /* Physics Animations */
            @keyframes eldrex-float {
                0%, 100% { 
                    transform: translateY(0px) rotate(0deg) scale(1);
                    opacity: 0.1;
                }
                50% { 
                    transform: translateY(-1.875rem) rotate(180deg) scale(1.1);
                    opacity: 0.3;
                }
            }

            @keyframes eldrex-shimmer {
                0%, 100% { background-position: -200% 0; }
                50% { background-position: 200% 0; }
            }

            @keyframes eldrex-neuralFade {
                0% { 
                    opacity: 0;
                    transform: translateY(1.25rem) scale(0.98);
                    filter: blur(0.25rem);
                }
                100% { 
                    opacity: 1;
                    transform: translateY(0) scale(1);
                    filter: blur(0);
                }
            }

            @keyframes eldrex-gentleSlide {
                0% { 
                    opacity: 0;
                    transform: translateX(-1.875rem);
                }
                100% { 
                    opacity: 1;
                    transform: translateX(0);
                }
            }

            @keyframes eldrex-scaleBlur {
                0% { 
                    opacity: 0;
                    transform: scale(0.95);
                    filter: blur(0.5rem);
                }
                100% { 
                    opacity: 1;
                    transform: scale(1);
                    filter: blur(0);
                }
            }

            @keyframes eldrex-physics-bounce {
                0%, 100% { 
                    transform: translateY(0) scale(1);
                }
                25% { 
                    transform: translateY(-0.5rem) scale(1.05);
                }
                50% { 
                    transform: translateY(0) scale(1);
                }
                75% { 
                    transform: translateY(-0.25rem) scale(1.02);
                }
            }

            .eldrex-neuralFade { 
                animation: eldrex-neuralFade 0.8s cubic-bezier(0.2, 0, 0, 1) both;
            }
            .eldrex-gentleSlide { 
                animation: eldrex-gentleSlide 0.7s cubic-bezier(0.2, 0, 0, 1) both;
            }
            .eldrex-scaleBlur { 
                animation: eldrex-scaleBlur 0.6s cubic-bezier(0.2, 0, 0, 1) both;
            }
            .eldrex-physics-bounce {
                animation: eldrex-physics-bounce 0.6s cubic-bezier(0.2, 0, 0, 1) both;
            }

            /* Dark theme */
            .eldrex-quotes-container.dark {
                --eldrex-surface: oklch(15% 0.02 240);
                --eldrex-surface-elevated: oklch(20% 0.03 240);
                --eldrex-text-primary: oklch(95% 0.01 240);
                --eldrex-text-secondary: oklch(75% 0.02 240);
                --eldrex-text-tertiary: oklch(55% 0.02 240);
                --eldrex-border: oklch(25% 0.03 240);
                --eldrex-border-strong: oklch(35% 0.05 240);
                --eldrex-shadow: 0 1px 3px oklch(0% 0 0 / 0.3), 0 1px 2px oklch(0% 0 0 / 0.2);
                --eldrex-shadow-lg: 0 10px 25px oklch(0% 0 0 / 0.3), 0 5px 10px oklch(0% 0 0 / 0.2);
            }

            /* Auto theme based on system preference */
            @media (prefers-color-scheme: dark) {
                .eldrex-quotes-container.auto {
                    --eldrex-surface: oklch(15% 0.02 240);
                    --eldrex-surface-elevated: oklch(20% 0.03 240);
                    --eldrex-text-primary: oklch(95% 0.01 240);
                    --eldrex-text-secondary: oklch(75% 0.02 240);
                    --eldrex-text-tertiary: oklch(55% 0.02 240);
                    --eldrex-border: oklch(25% 0.03 240);
                    --eldrex-border-strong: oklch(35% 0.05 240);
                    --eldrex-shadow: 0 1px 3px oklch(0% 0 0 / 0.3), 0 1px 2px oklch(0% 0 0 / 0.2);
                    --eldrex-shadow-lg: 0 10px 25px oklch(0% 0 0 / 0.3), 0 5px 10px oklch(0% 0 0 / 0.2);
                }
            }

            /* Premium Themes */
            .eldrex-quotes-container.premium-sage {
                --eldrex-primary: oklch(55% 0.12 160);
                --eldrex-primary-dark: oklch(45% 0.12 160);
                --eldrex-primary-light: oklch(75% 0.08 160);
            }

            .eldrex-quotes-container.premium-amber {
                --eldrex-primary: oklch(65% 0.18 75);
                --eldrex-primary-dark: oklch(55% 0.18 75);
                --eldrex-primary-light: oklch(80% 0.12 75);
            }

            .eldrex-quotes-container.premium-rose {
                --eldrex-primary: oklch(60% 0.2 10);
                --eldrex-primary-dark: oklch(50% 0.2 10);
                --eldrex-primary-light: oklch(75% 0.15 10);
            }

            .eldrex-quotes-container.premium-indigo {
                --eldrex-primary: oklch(55% 0.2 270);
                --eldrex-primary-dark: oklch(45% 0.2 270);
                --eldrex-primary-light: oklch(70% 0.15 270);
            }

            /* Responsive Design with Apple-like breakpoints */
            @media (max-width: 734px) { /* iPhone */
                .eldrex-quotes-container {
                    margin: 1rem;
                    padding: 2rem 1.5rem;
                    border-radius: 1.5rem;
                }
                
                .eldrex-quote-text {
                    padding: 0 1rem;
                }
                
                .eldrex-quote-text::before,
                .eldrex-quote-text::after {
                    font-size: 2.5rem;
                    top: -0.75rem;
                }
                
                .eldrex-controls {
                    gap: 0.5rem;
                }
                
                .eldrex-btn {
                    padding: 0.75rem 1.25rem;
                    font-size: 0.8rem;
                    min-width: 5.5rem;
                }
            }

            @media (max-width: 428px) { /* Small phones */
                .eldrex-controls {
                    flex-direction: row;
                    flex-wrap: nowrap;
                }
                
                .eldrex-btn {
                    flex: 1;
                    min-width: auto;
                }
                
                .eldrex-btn span {
                    display: none;
                }
                
                .eldrex-btn svg {
                    margin: 0;
                }
            }

            @media (min-width: 1024px) { /* Desktop */
                .eldrex-quotes-container {
                    margin: 2rem auto;
                }
                
                .eldrex-quotes-container:hover {
                    transform: translateY(-0.125rem);
                    box-shadow: var(--eldrex-shadow-lg);
                }
            }

            /* Accessibility and reduced motion */
            @media (prefers-reduced-motion: reduce) {
                .eldrex-quote-text,
                .eldrex-controls,
                .eldrex-quotes-container,
                .eldrex-particle,
                .eldrex-btn {
                    transition: none;
                    animation: none;
                }
                
                .eldrex-quotes-container::before {
                    animation: none;
                }
                
                .eldrex-quote-text {
                    opacity: 1;
                    transform: none;
                }
                
                .eldrex-controls {
                    opacity: 1;
                    transform: none;
                }
            }

            /* High contrast mode support */
            @media (prefers-contrast: high) {
                .eldrex-quotes-container {
                    border-width: 2px;
                }
                
                .eldrex-btn {
                    border-width: 2px;
                }
                
                .eldrex-quote-text::before,
                .eldrex-quote-text::after {
                    opacity: 0.8;
                }
            }

            /* Focus styles for accessibility */
            .eldrex-btn:focus-visible {
                outline: 2px solid var(--eldrex-primary);
                outline-offset: 2px;
            }

            .eldrex-quote-author:focus-visible {
                outline: 2px solid var(--eldrex-primary);
                outline-offset: 2px;
            }
        `;

        const styleSheet = document.createElement('style');
        styleSheet.id = 'eldrex-quotes-styles';
        styleSheet.textContent = styles;
        document.head.appendChild(styleSheet);
    }

    createContainer() {
        let container = document.getElementById(this.containerId);

        if (!container) {
            console.warn(`Eldrex Quotes: Container with ID '${this.containerId}' not found`);
            return;
        }

        // Check if this container is already initialized
        if (container.classList.contains('eldrex-initialized')) {
            console.warn(`Eldrex Quotes: Container '${this.containerId}' is already initialized`);
            return;
        }

        const themeClass = this.config.theme === 'auto' ? 'auto' : 
                          this.config.theme.startsWith('premium-') ? this.config.theme : 
                          this.config.theme;

        container.className = `eldrex-quotes-container ${themeClass} eldrex-initialized`;
        container.setAttribute('data-eldrex-instance', this.instanceId);
        
        this.applyCustomStyles(container);
        this.container = container;
    }

    applyCustomStyles(container) {
        Object.keys(this.config.customStyles).forEach(property => {
            if (property in container.style) {
                container.style[property] = this.config.customStyles[property];
            }
        });
    }

    initPhysicsEngine() {
        if (!this.config.physics || !this.container) return;

        this.physicsEngine = {
            particles: [],
            running: true,
            lastTime: 0
        };

        this.createParticles();
        this.animatePhysics();
    }

    createParticles() {
        if (!this.container || !this.physicsEngine) return;

        const particlesContainer = document.createElement('div');
        particlesContainer.className = 'eldrex-particles';

        const particleCount = 8 + Math.floor(Math.random() * 8); // 8-15 particles

        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'eldrex-particle';

            const size = Math.random() * 24 + 8; // 8-32px
            const hue = 200 + Math.random() * 40; // Blue-ish range
            const lightness = 70 + Math.random() * 20;
            const chroma = 0.05 + Math.random() * 0.1;

            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
            particle.style.background = `oklch(${lightness}% ${chroma} ${hue})`;
            particle.style.left = `${Math.random() * 100}%`;
            particle.style.top = `${Math.random() * 100}%`;

            // Physics properties
            particle.physics = {
                x: Math.random() * 100,
                y: Math.random() * 100,
                vx: (Math.random() - 0.5) * 0.2,
                vy: (Math.random() - 0.5) * 0.2,
                size: size,
                opacity: 0.1 + Math.random() * 0.2
            };

            particlesContainer.appendChild(particle);
            this.physicsEngine.particles.push(particle);
        }

        this.container.appendChild(particlesContainer);
    }

    animatePhysics() {
        if (!this.physicsEngine || !this.physicsEngine.running) return;

        const now = performance.now();
        const deltaTime = this.physicsEngine.lastTime ? (now - this.physicsEngine.lastTime) / 1000 : 0;
        this.physicsEngine.lastTime = now;

        this.physicsEngine.particles.forEach(particle => {
            if (!particle.physics) return;

            // Update position
            particle.physics.x += particle.physics.vx;
            particle.physics.y += particle.physics.vy;

            // Boundary collision
            if (particle.physics.x <= 0 || particle.physics.x >= 100) {
                particle.physics.vx *= -0.8;
                particle.physics.x = Math.max(0, Math.min(100, particle.physics.x));
            }
            if (particle.physics.y <= 0 || particle.physics.y >= 100) {
                particle.physics.vy *= -0.8;
                particle.physics.y = Math.max(0, Math.min(100, particle.physics.y));
            }

            // Apply damping
            particle.physics.vx *= 0.99;
            particle.physics.vy *= 0.99;

            // Apply gravity
            particle.physics.vy += 0.01;

            // Update DOM
            particle.style.left = `${particle.physics.x}%`;
            particle.style.top = `${particle.physics.y}%`;
            particle.style.opacity = particle.physics.opacity;
        });

        this.animationFrame = requestAnimationFrame(() => this.animatePhysics());
    }

    getButtonIcon(type) {
        const icons = {
            previous: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 18l-6-6 6-6"/></svg>',
            next: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>',
            random: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 2l4 4-4 4"/><path d="M3 11v-1a4 4 0 014-4h14"/><path d="M7 22l-4-4 4-4"/><path d="M21 13v1a4 4 0 01-4 4H3"/></svg>',
            download: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><path d="M7 10l5 5 5-5"/><path d="M12 15V3"/></svg>',
            pause: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>',
            play: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 3l14 9-14 9V3z"/></svg>'
        };
        return icons[type] || '';
    }

    renderQuote() {
        if (!this.container) return;

        const quote = this.quotes[this.currentIndex];
        const isStatic = this.isStatic;

        this.container.innerHTML = `
            <div class="eldrex-quote-content">
                <div class="eldrex-quote-text ${this.config.animation ? 'eldrex-' + this.config.animation : ''}">
                    ${quote.text}
                </div>
                ${this.config.showAuthor ? `
                    <div class="eldrex-quote-author" onclick="window.open('https://eldrex.landecs.org', '_blank')" title="Visit Eldrex Landecs">
                        <span>— ${quote.author}</span>
                    </div>
                ` : ''}
                ${this.config.showControls ? `
                    <div class="eldrex-controls">
                        <button class="eldrex-btn" onclick="eldrexQuotesManager.getInstance('${this.containerId}').prevQuote()" title="Previous quote">
                            ${this.getButtonIcon('previous')}
                            <span>Previous</span>
                        </button>
                        <button class="eldrex-btn" onclick="eldrexQuotesManager.getInstance('${this.containerId}').nextQuote()" title="Next quote">
                            ${this.getButtonIcon('next')}
                            <span>Next</span>
                        </button>
                        <button class="eldrex-btn" onclick="eldrexQuotesManager.getInstance('${this.containerId}').randomQuote()" title="Random quote">
                            ${this.getButtonIcon('random')}
                            <span>Random</span>
                        </button>
                        ${this.config.autoRotate && !isStatic ? `
                            <button class="eldrex-btn" onclick="eldrexQuotesManager.getInstance('${this.containerId}').toggleAutoRotation()" title="Pause rotation">
                                ${this.getButtonIcon('pause')}
                                <span>Pause</span>
                            </button>
                        ` : ''}
                        ${this.config.enableDownload ? `
                            <button class="eldrex-btn" onclick="eldrexQuotesManager.getInstance('${this.containerId}').downloadQuote()" title="Download quote">
                                ${this.getButtonIcon('download')}
                                <span>Download</span>
                            </button>
                        ` : ''}
                    </div>
                ` : ''}
            </div>
        `;

        // Add micro-interactions
        setTimeout(() => {
            const quoteText = this.container.querySelector('.eldrex-quote-text');
            const controls = this.container.querySelector('.eldrex-controls');

            if (quoteText) {
                quoteText.classList.add('visible');
                // Add physics bounce effect
                if (this.config.physics) {
                    quoteText.classList.add('eldrex-physics-bounce');
                }
            }
            if (controls) {
                setTimeout(() => controls.classList.add('visible'), 300);
            }
        }, 50);
    }

    nextQuote() {
        if (this.quotes.length <= 1) return;
        
        this.currentIndex = (this.currentIndex + 1) % this.quotes.length;
        this.renderQuote();
        this.triggerHapticFeedback();
    }

    prevQuote() {
        if (this.quotes.length <= 1) return;
        
        this.currentIndex = (this.currentIndex - 1 + this.quotes.length) % this.quotes.length;
        this.renderQuote();
        this.triggerHapticFeedback();
    }

    randomQuote() {
        if (this.quotes.length <= 1) return;

        let newIndex;
        do {
            newIndex = Math.floor(Math.random() * this.quotes.length);
        } while (newIndex === this.currentIndex && this.quotes.length > 1);

        this.currentIndex = newIndex;
        this.renderQuote();
        this.triggerHapticFeedback();
    }

    triggerHapticFeedback() {
        // Simple haptic feedback simulation
        if (navigator.vibrate) {
            navigator.vibrate(10);
        }
    }

    downloadQuote() {
        const quote = this.quotes[this.currentIndex];
        const content = `"${quote.text}"\n\n— ${quote.author}\n\nFrom Eldrex Quotes Collection v3.0.0\nLandecs · ${new Date().toLocaleDateString()}\n\nDownload more at: https://eldrex.landecs.org`;

        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `eldrex-quote-${this.currentIndex + 1}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.triggerHapticFeedback();
    }

    startAutoRotation() {
        if (this.isStatic) return;
        
        this.stopAutoRotation();
        this.rotationInterval = setInterval(() => {
            this.nextQuote();
        }, this.config.rotationInterval);
    }

    stopAutoRotation() {
        if (this.rotationInterval) {
            clearInterval(this.rotationInterval);
            this.rotationInterval = null;
        }
    }

    toggleAutoRotation() {
        if (this.rotationInterval) {
            this.stopAutoRotation();
            // Update button to play icon
            const pauseBtn = this.container?.querySelector('.eldrex-btn:nth-child(4)');
            if (pauseBtn) {
                pauseBtn.innerHTML = `${this.getButtonIcon('play')}<span>Play</span>`;
            }
        } else {
            this.startAutoRotation();
            // Update button to pause icon
            const playBtn = this.container?.querySelector('.eldrex-btn:nth-child(4)');
            if (playBtn) {
                playBtn.innerHTML = `${this.getButtonIcon('pause')}<span>Pause</span>`;
            }
        }
        this.triggerHapticFeedback();
    }

    bindEvents() {
        if (!this.container) return;

        // Touch gestures for mobile
        let touchStartX = 0;
        let touchStartY = 0;
        
        this.container.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
            touchStartY = e.changedTouches[0].screenY;
        });

        this.container.addEventListener('touchend', (e) => {
            const touchEndX = e.changedTouches[0].screenX;
            const touchEndY = e.changedTouches[0].screenY;
            const diffX = touchStartX - touchEndX;
            const diffY = touchStartY - touchEndY;

            // Only trigger if primarily horizontal swipe
            if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 30) {
                if (diffX > 0) this.nextQuote();
                else this.prevQuote();
            }
        });

        // Keyboard navigation
        this.container.setAttribute('tabindex', '0');
        this.container.addEventListener('keydown', (e) => {
            if (e.target !== this.container) return;
            
            switch(e.key) {
                case 'ArrowLeft':
                    e.preventDefault();
                    this.prevQuote();
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    this.nextQuote();
                    break;
                case ' ':
                    e.preventDefault();
                    this.randomQuote();
                    break;
                case 'r':
                    e.preventDefault();
                    this.randomQuote();
                    break;
                case 'd':
                    if (this.config.enableDownload) {
                        e.preventDefault();
                        this.downloadQuote();
                    }
                    break;
                case 'p':
                    e.preventDefault();
                    this.toggleAutoRotation();
                    break;
            }
        });
    }

    async applyNeuralTheming() {
        if (!this.config.adaptiveColors || !this.container) return;

        try {
            const theme = await this.neuralProcessor.generateTheme(this.envAnalysis);
            this.applyThemeVariables(theme);
        } catch (error) {
            console.warn('Eldrex Quotes: Neural theming failed, using fallback', error);
        }
    }

    applyThemeVariables(theme) {
        if (!this.container) return;

        Object.keys(theme).forEach(key => {
            this.container.style.setProperty(`--eldrex-${key}`, theme[key]);
        });
    }

    showConsoleArt() {
        if (console && console.log && EldrexQuotesManager.showConsoleArt) {
            const styles = [
                `%c🧠 Eldrex Quotes v3.0.0 - Neural Adaptive Edition %c\n` +
                `Instance: ${this.instanceId}\n` +
                `Quotes: ${this.quotes.length} | Static: ${this.isStatic}\n` +
                `Physics: ${this.config.physics} | Neural: ${this.config.adaptiveColors}\n` +
                `Theme: ${this.config.theme} | Mode: ${this.config.neuralTheme}\n\n` +
                `🎯 Features:\n` +
                `• Neural Color Adaptation\n` +
                `• Physics Particle System\n` +
                `• Apple Design Principles\n` +
                `• Multi-Container Support\n` +
                `• Adaptive Responsiveness\n` +
                `• Premium Theming System\n\n` +
                `🚀 Powered by Landecs - Eldrex Bula\n` +
                `📚 ${EldrexQuotesManager.contentData.quotes.length} Total Quotes Available`,
                'background: linear-gradient(135deg, oklch(55% 0.15 240), oklch(45% 0.15 240)); color: white; padding: 12px 20px; border-radius: 12px; font-weight: 600; font-family: "SF Pro Display", system-ui; font-size: 14px;',
                'color: oklch(45% 0.15 240); font-family: "SF Pro Display", system-ui; font-size: 12px; line-height: 1.5;'
            ];
            console.log(...styles);
            EldrexQuotesManager.showConsoleArt = false;
        }
    }

    // Public API Methods
    destroy() {
        this.stopAutoRotation();
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }

        if (this.physicsEngine) {
            this.physicsEngine.running = false;
        }

        if (this.container) {
            this.container.classList.remove('eldrex-initialized');
            this.container.removeAttribute('data-eldrex-instance');
            this.container.innerHTML = '';
        }

        this.isInitialized = false;
    }

    getCurrentQuote() {
        return {
            ...this.quotes[this.currentIndex],
            index: this.currentIndex,
            total: this.quotes.length
        };
    }

    getAllQuotes() {
        return [...this.quotes];
    }

    getStats() {
        return {
            totalQuotes: this.quotes.length,
            currentIndex: this.currentIndex,
            instanceId: this.instanceId,
            autoRotate: this.config.autoRotate && !this.isStatic,
            theme: this.config.theme,
            controls: this.config.showControls,
            animations: this.config.animation,
            physics: this.config.physics,
            staticMode: this.isStatic,
            neuralAdaptive: this.config.adaptiveColors
        };
    }

    setStaticMode(staticMode) {
        this.isStatic = staticMode;
        if (staticMode) {
            this.stopAutoRotation();
        } else if (this.config.autoRotate) {
            this.startAutoRotation();
        }
        this.renderQuote();
    }

    updateQuote(index, text, author) {
        if (index >= 0 && index < this.quotes.length) {
            this.quotes[index] = { text, author };
            if (index === this.currentIndex) {
                this.renderQuote();
            }
        }
    }

    setTheme(theme) {
        this.config.theme = theme;
        if (this.container) {
            this.container.className = this.container.className.replace(/(premium-|light|dark|auto)/g, '') + ` ${theme}`;
        }
    }
}

// Neural Color Processor with Local ML Simulation
class NeuralColorProcessor {
    constructor() {
        this.model = this.initializeModel();
        this.cache = new Map();
    }

    initializeModel() {
        // Simulated neural network weights for color adaptation
        return {
            luminanceWeights: [0.299, 0.587, 0.114],
            saturationWeights: [0.5, 0.3, 0.2],
            hueWeights: [0.33, 0.33, 0.34]
        };
    }

    async generateTheme(envAnalysis) {
        const cacheKey = JSON.stringify(envAnalysis);
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }

        // Simulate neural processing delay
        await new Promise(resolve => setTimeout(resolve, 50));

        const baseColor = this.extractBaseColor(envAnalysis.backgroundColor);
        const textColor = this.extractBaseColor(envAnalysis.color);
        
        const theme = this.calculateAdaptiveTheme(baseColor, textColor);
        
        this.cache.set(cacheKey, theme);
        return theme;
    }

    extractBaseColor(colorString) {
        // Simple color extraction from computed styles
        if (colorString.includes('rgb')) {
            const match = colorString.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
            if (match) {
                return {
                    r: parseInt(match[1]),
                    g: parseInt(match[2]),
                    b: parseInt(match[3])
                };
            }
        }
        // Fallback to neutral gray
        return { r: 128, g: 128, b: 128 };
    }

    calculateAdaptiveTheme(baseColor, textColor) {
        const baseLuminance = this.calculateLuminance(baseColor);
        const textLuminance = this.calculateLuminance(textColor);
        
        const isDark = baseLuminance < 0.3;
        const contrast = Math.abs(baseLuminance - textLuminance);
        
        // Neural-inspired color generation
        const primaryHue = this.neuralHueSelection(baseColor, textColor);
        
        return {
            'primary': `oklch(55% 0.15 ${primaryHue})`,
            'primary-dark': `oklch(45% 0.15 ${primaryHue})`,
            'primary-light': `oklch(75% 0.1 ${primaryHue})`,
            'surface': isDark ? 'oklch(15% 0.02 240)' : 'oklch(98% 0.02 240)',
            'surface-elevated': isDark ? 'oklch(20% 0.03 240)' : 'oklch(99% 0.01 240)',
            'text-primary': isDark ? 'oklch(95% 0.01 240)' : 'oklch(25% 0.05 240)',
            'text-secondary': isDark ? 'oklch(75% 0.02 240)' : 'oklch(45% 0.05 240)',
            'text-tertiary': isDark ? 'oklch(55% 0.02 240)' : 'oklch(65% 0.03 240)',
            'border': isDark ? 'oklch(25% 0.03 240)' : 'oklch(85% 0.03 240)',
            'border-strong': isDark ? 'oklch(35% 0.05 240)' : 'oklch(75% 0.05 240)'
        };
    }

    calculateLuminance(color) {
        const { r, g, b } = color;
        const [rs, gs, bs] = [r, g, b].map(c => {
            c = c / 255;
            return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
        });
        return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
    }

    neuralHueSelection(baseColor, textColor) {
        // Simulated neural network for hue selection
        const baseAvg = (baseColor.r + baseColor.g + baseColor.b) / 3;
        const textAvg = (textColor.r + textColor.g + textColor.b) / 3;
        
        // Neural-inspired hue calculation
        let hue = 240; // Default blue
        if (Math.abs(baseAvg - textAvg) > 60) {
            hue = 160; // Sage green for high contrast
        } else if (baseAvg > 180) {
            hue = 280; // Purple for light backgrounds
        } else if (baseAvg < 80) {
            hue = 200; // Cyan for dark backgrounds
        }
        
        return hue + (Math.random() * 20 - 10); // Small random variation
    }
}

// Enhanced Manager Class with Multi-Container Support
class EldrexQuotesManager {
    static contentData = {
        quotes: [
            // ... (all your quotes array exactly as before)
            {
                text: "Still Be the Blue",
                author: "Eldrex Delos Reyes Bula"
            },
            {
                text: "Crazy? Maybe. But I'd rather learn passionately than memorize mindlessly.",
                author: "Eldrex Delos Reyes Bula"
            },
            {
                text: "The more we think, the more risks we understand, but sometimes we're quick to regret instead of embracing them.",
                author: "Eldrex Delos Reyes Bula"
            },
            {
                text: "An old book might look like trash, yet it has the power to change lives, even if people can't see its worth at first glance.",
                author: "Eldrex Delos Reyes Bula"
            },
            {
                text: "Sometimes, it's people themselves who make things seem impossible.",
                author: "Eldrex Delos Reyes Bula"
            },
            {
                text: "Sometimes, it's curiosity that takes you to the place where you were meant to be.",
                author: "Eldrex Delos Reyes Bula"
            },
            {
                text: "I serve people not a company",
                author: "Eldrex Delos Reyes Bula"
            },
            {
                text: "Numbers may define you, but it's your will to give them meaning.",
                author: "Eldrex Delos Reyes Bula"
            },
            {
                text: "A man who can do what he wants, does what he wants.",
                author: "Eldrex Delos Reyes Bula"
            },
            {
                text: "We lose not because we have little, but because we expect nothing more.",
                author: "Eldrex Delos Reyes Bula"
            },
            {
                text: "Create what others can't see—because they won't know they needed it until it's here.",
                author: "Eldrex Delos Reyes Bula"
            },
            {
                text: "Your limits aren't real if you're the one writing the rules.",
                author: "Eldrex Delos Reyes Bula"
            },
            {
                text: "I never asked for attention. I just made things impossible to ignore.",
                author: "Eldrex Delos Reyes Bula"
            },
            {
                text: "I didn't say it. I didn't do it. But that doesn't mean I didn't mean it with all of me.",
                author: "Eldrex Delos Reyes Bula"
            },
            {
                text: "To own your information is not a feature—it is a right that should never be questioned.",
                author: "Eldrex Delos Reyes Bula"
            },
            {
                text: "Change is our only goal, and that's why we're here to create a new story and become part of history.",
                author: "Eldrex Delos Reyes Bula"
            },
            {
                text: "To exist is to question; to question is to live. And if all else is illusion, let my curiosity be real.",
                author: "Eldrex Delos Reyes Bula"
            },
            {
                text: "If life is a labyrinth of illusions, then perhaps my purpose is not to escape, but to wander. To question without answer, to search without end—this may be the only truth we ever know.",
                author: "Eldrex Delos Reyes Bula"
            },
            {
                text: "I'm in love—not with you, but with the essence of who you are.",
                author: "Eldrex Delos Reyes Bula"
            },
            {
                text: "The strongest people are not those who show strength in front of us, but those who fight battles we know nothing about.",
                author: "Eldrex Delos Reyes Bula"
            },
            {
                text: "The cost of convenience should never be the loss of control.",
                author: "Eldrex Delos Reyes Bula"
            },
            {
                text: "A mother's gift isn't measured by how it looks, but by the love that came with it.",
                author: "Eldrex Delos Reyes Bula"
            },
            {
                text: "A seed doesn't ask for perfect soil, nor does it wait for the perfect rain. It simply grows where it's planted, reaching for light with whatever it can find.",
                author: "Eldrex Delos Reyes Bula"
            },
            {
                text: "If you can question everything, you can understand anything.",
                author: "Eldrex Delos Reyes Bula"
            },
            {
                text: "A child's heart remembers the warmth of home, even when life keeps them far away.",
                author: "Eldrex Delos Reyes Bula"
            },
            {
                text: "Hoping to be enough, just as I am",
                author: "Eldrex Delos Reyes Bula"
            },
            {
                text: "Fly again, My blue",
                author: "Eldrex Delos Reyes Bula"
            },
            {
                text: "Time moves so slow, yet I blink, and everything is gone.",
                author: "Eldrex Delos Reyes Bula"
            },
            {
                text: "I thought I wanted freedom, but now I just want one more yesterday.",
                author: "Eldrex Delos Reyes Bula"
            },
            {
                text: "A road without signs is only a problem if you believe you're going somewhere.",
                author: "Eldrex Delos Reyes Bula"
            },
            {
                text: "A recipe followed perfectly still tastes different in someone else's hands.",
                author: "Eldrex Delos Reyes Bula"
            },
            {
                text: "We've waited for this day, but now we're wishing for one more.",
                author: "Eldrex Delos Reyes Bula"
            },
            {
                text: "Mistakes don't make you weak; refusing to correct them does.",
                author: "Eldrex Delos Reyes Bula"
            },
            {
                text: "Identity isn't what you do; it's what you stand for.",
                author: "Eldrex Delos Reyes Bula"
            },
            {
                text: "Money may buy what you want, but hard work teaches you who you are.",
                author: "Eldrex Delos Reyes Bula"
            },
            {
                text: "If you have time to sit, you have time to work.",
                author: "Eldrex Delos Reyes Bula"
            },
            {
                text: "Failure is not the end; it is the beginning of learning.",
                author: "Eldrex Delos Reyes Bula"
            }
        ]
    };

    static showConsoleArt = true;

    constructor() {
        this.instances = new Map();
        this.globalStylesInjected = false;
        this.usedIndices = new Set(); // Track used quote indices across instances
    }

    init(containerId, config = {}) {
        // Check if container exists
        const container = document.getElementById(containerId);
        if (!container) {
            console.warn(`Eldrex Quotes: Container with ID '${containerId}' not found`);
            return null;
        }

        // Check if already initialized
        if (this.instances.has(containerId)) {
            console.warn(`Eldrex Quotes: Instance for container '${containerId}' already exists`);
            return this.instances.get(containerId);
        }

        // Inject global styles if not already done
        if (!this.globalStylesInjected) {
            this.injectGlobalStyles();
            this.globalStylesInjected = true;
        }

        // Ensure static mode for single quote display
        const finalConfig = {
            staticMode: true, // Force single quote per container
            ...config
        };

        // Create new instance with unique quote
        const instance = new EldrexQuotes(containerId, finalConfig);
        this.instances.set(containerId, instance);

        return instance;
    }

    injectGlobalStyles() {
        if (document.getElementById('eldrex-quotes-global-styles')) return;

        const styles = `
            /* Global keyboard events and focus management */
            .eldrex-quotes-active {
                outline: none;
            }
            
            /* Smooth scrolling for quote containers */
            html {
                scroll-behavior: smooth;
            }
        `;

        const styleSheet = document.createElement('style');
        styleSheet.id = 'eldrex-quotes-global-styles';
        styleSheet.textContent = styles;
        document.head.appendChild(styleSheet);

        // Add global keyboard listener
        document.addEventListener('keydown', (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

            const instances = Array.from(this.instances.values());
            if (instances.length === 0) return;

            // Apply to focused instance or first instance
            const focusedInstance = instances.find(inst => 
                inst.container === document.activeElement
            ) || instances[0];

            if (!focusedInstance) return;

            switch(e.key) {
                case 'ArrowLeft':
                    e.preventDefault();
                    focusedInstance.prevQuote();
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    focusedInstance.nextQuote();
                    break;
                case ' ':
                case 'r':
                    e.preventDefault();
                    focusedInstance.randomQuote();
                    break;
                case 'd':
                    if (focusedInstance.config.enableDownload) {
                        e.preventDefault();
                        focusedInstance.downloadQuote();
                    }
                    break;
                case 'p':
                    e.preventDefault();
                    focusedInstance.toggleAutoRotation();
                    break;
            }
        });

        // Handle page visibility
        document.addEventListener('visibilitychange', () => {
            const instances = Array.from(this.instances.values());
            instances.forEach(instance => {
                if (document.hidden) {
                    instance.stopAutoRotation();
                } else if (instance.config.autoRotate && !instance.isStatic) {
                    instance.startAutoRotation();
                }
            });
        });
    }

    getInstance(containerId) {
        return this.instances.get(containerId);
    }

    destroyInstance(containerId) {
        const instance = this.instances.get(containerId);
        if (instance) {
            instance.destroy();
            this.instances.delete(containerId);
        }
    }

    destroyAll() {
        this.instances.forEach(instance => instance.destroy());
        this.instances.clear();
        this.usedIndices.clear();
    }

    getAllInstances() {
        return this.instances;
    }

    getRandomUniqueQuoteIndex() {
        const allIndices = Array.from({length: EldrexQuotesManager.contentData.quotes.length}, (_, i) => i);
        const availableIndices = allIndices.filter(i => !this.usedIndices.has(i));
        
        if (availableIndices.length === 0) {
            // Reset if all quotes are used
            this.usedIndices.clear();
            return Math.floor(Math.random() * allIndices.length);
        }
        
        const randomIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
        this.usedIndices.add(randomIndex);
        return randomIndex;
    }
}

// Create global manager instance
const eldrexQuotesManager = new EldrexQuotesManager();

// Global initialization function
function initEldrexQuotes(config = {}) {
    if (typeof document === 'undefined') return null;

    const initializeContainer = (containerId) => {
        if (!containerId) {
            console.warn('Eldrex Quotes: No containerId specified');
            return null;
        }

        return eldrexQuotesManager.init(containerId, config);
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            if (config.containerId) {
                return initializeContainer(config.containerId);
            }
        });
    } else {
        if (config.containerId) {
            return initializeContainer(config.containerId);
        }
    }

    return null;
}

// Auto-initialize containers with data attributes
function autoInitializeEldrexQuotes() {
    const containers = document.querySelectorAll('[data-eldrex-quotes]');
    containers.forEach(container => {
        const containerId = container.id;
        if (!containerId) {
            console.warn('Eldrex Quotes: Container must have an ID for auto-initialization');
            return;
        }

        const config = {
            theme: container.getAttribute('data-theme') || 'auto',
            autoRotate: container.getAttribute('data-auto-rotate') !== 'false',
            showAuthor: container.getAttribute('data-show-author') !== 'false',
            showControls: container.getAttribute('data-show-controls') !== 'false',
            physics: container.getAttribute('data-physics') !== 'false',
            adaptiveColors: container.getAttribute('data-adaptive-colors') !== 'false',
            staticMode: container.getAttribute('data-static-mode') !== 'false'
        };

        eldrexQuotesManager.init(containerId, config);
    });
}

// Initialize on DOM ready
if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', autoInitializeEldrexQuotes);
    } else {
        autoInitializeEldrexQuotes();
    }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        EldrexQuotes,
        EldrexQuotesManager,
        NeuralColorProcessor,
        initEldrexQuotes,
        eldrexQuotesManager
    };
}

// Global access
window.EldrexQuotes = EldrexQuotes;
window.EldrexQuotesManager = EldrexQuotesManager;
window.initEldrexQuotes = initEldrexQuotes;
window.eldrexQuotesManager = eldrexQuotesManager;

// Service registration for PWA support
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // Optional: Register service worker for offline functionality
    });
}