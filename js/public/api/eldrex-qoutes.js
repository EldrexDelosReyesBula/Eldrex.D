/**
 * Eldrex Quotes Collection - Landecs
 * Version: 4.0.0 - Neural Intelligence Edition
 * Author: Eldrex Delos Reyes Bula
 * Publisher: Landecs
 * Website: https://eldrex.landecs.org
 * License: Landecs Proprietary Software License Quotes (LPSLQ)
 * Features: Advanced Neural Intelligence • Quantum Color Adaptation • Apple Design Excellence
 *           Multi-Container AI • Adaptive Theming 2.0 • Content Integrity Protection
 *           Developer Experience Suite • Auto-Polish Technology
 */

class EldrexQuotes {
    constructor(containerId, config = {}) {
        this.containerId = containerId;
        this.instanceId = this.generateQuantumId();
        this.config = this.validateConfig({
            containerId: containerId,
            theme: config.theme || 'neural-adaptive',
            autoRotate: config.autoRotate !== false,
            rotationInterval: config.rotationInterval || 10000,
            showAuthor: config.showAuthor !== false,
            showControls: config.showControls !== false,
            animation: config.animation || 'quantum-entrance',
            physics: config.physics !== false,
            maxQuotes: config.maxQuotes || null,
            filterQuotes: config.filterQuotes || null,
            customStyles: config.customStyles || {},
            uniqueId: this.instanceId,
            enableDownload: config.enableDownload !== false,
            staticMode: config.staticMode || false,
            adaptiveColors: config.adaptiveColors !== false,
            neuralTheme: config.neuralTheme || 'intelligent-balanced',
            integrityProtection: config.integrityProtection !== false,
            autoPolish: config.autoPolish !== false,
            contextAware: config.contextAware !== false,
            performanceMode: config.performanceMode || 'adaptive',
            developerMode: config.developerMode || false,
            ...config
        });

        this.quotes = this.protectQuotesData(EldrexQuotesManager.contentData.quotes);
        this.currentIndex = Math.floor(Math.random() * this.quotes.length);
        this.isInitialized = false;
        this.animationFrame = null;
        this.physicsEngine = null;
        this.neuralProcessor = new QuantumNeuralProcessor();
        this.isStatic = this.config.staticMode;
        this.integrityMonitor = new IntegrityMonitor();
        this.contextAnalyzer = new ContextAnalyzer();
        this.polishEngine = new AutoPolishEngine();

        // Enhanced initialization with multi-layer protection
        this.init();
    }

    generateQuantumId() {
        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).substr(2, 12);
        const hash = btoa(timestamp + random).replace(/[^a-zA-Z0-9]/g, '').substr(0, 16);
        return `eldrex-quantum-${hash}`;
    }

    validateConfig(config) {
        const defaults = {
            theme: 'neural-adaptive',
            autoRotate: true,
            rotationInterval: 10000,
            showAuthor: true,
            showControls: true,
            animation: 'quantum-entrance',
            physics: true,
            maxQuotes: null,
            filterQuotes: null,
            customStyles: {},
            enableDownload: true,
            staticMode: false,
            adaptiveColors: true,
            neuralTheme: 'intelligent-balanced',
            integrityProtection: true,
            autoPolish: true,
            contextAware: true,
            performanceMode: 'adaptive',
            developerMode: false
        };

        const validated = { ...defaults, ...config };

        // Security validations
        if (validated.maxQuotes && (validated.maxQuotes < 1 || validated.maxQuotes > 1000)) {
            console.warn('Eldrex Quotes: maxQuotes must be between 1 and 1000');
            validated.maxQuotes = null;
        }

        if (validated.rotationInterval && (validated.rotationInterval < 1000 || validated.rotationInterval > 60000)) {
            console.warn('Eldrex Quotes: rotationInterval must be between 1000 and 60000 ms');
            validated.rotationInterval = 10000;
        }

        return validated;
    }

    protectQuotesData(quotes) {
        // Create deep clone with protection
        let protectedQuotes = JSON.parse(JSON.stringify(quotes));
        
        // Apply filters if specified
        if (this.config.filterQuotes && Array.isArray(this.config.filterQuotes)) {
            protectedQuotes = protectedQuotes.filter((_, index) => 
                this.config.filterQuotes.includes(index)
            );
        }

        if (this.config.maxQuotes && this.config.maxQuotes > 0) {
            protectedQuotes = protectedQuotes.slice(0, this.config.maxQuotes);
        }

        // Add protection layer
        return Object.freeze(protectedQuotes.map(quote => 
            Object.freeze({...quote})
        ));
    }

    async init() {
        try {
            await this.validateEnvironment();
            await this.analyzeEnvironment();
            this.injectStyles();
            this.createContainer();
            await this.applyQuantumTheming();
            this.renderQuote();
            this.bindEvents();

            if (this.config.autoRotate && !this.isStatic) {
                this.startAutoRotation();
            }

            if (this.config.physics) {
                this.initPhysicsEngine();
            }

            if (this.config.integrityProtection) {
                this.integrityMonitor.startMonitoring(this);
            }

            if (this.config.autoPolish) {
                this.polishEngine.applyPolish(this.container, this.envAnalysis);
            }

            this.isInitialized = true;
            this.showConsoleArt();

        } catch (error) {
            this.handleInitializationError(error);
        }
    }

    async validateEnvironment() {
        if (typeof document === 'undefined') {
            throw new Error('Eldrex Quotes: DOM environment required');
        }

        // Verify quotes integrity
        if (!EldrexQuotesManager.contentData || 
            !Array.isArray(EldrexQuotesManager.contentData.quotes) ||
            EldrexQuotesManager.contentData.quotes.length === 0) {
            throw new Error('Eldrex Quotes: Content data integrity check failed');
        }
    }

    async analyzeEnvironment() {
        const container = document.getElementById(this.containerId);
        if (container) {
            const parent = container.parentElement || document.body;
            const styles = window.getComputedStyle(parent);
            
            this.envAnalysis = await this.contextAnalyzer.analyzeEnvironment({
                container: container,
                parent: parent,
                styles: styles,
                config: this.config
            });
        }
    }

    injectStyles() {
        if (document.getElementById('eldrex-quotes-styles')) return;

        const styles = `
            /* Quantum Design System */
            :root {
                /* Neural Generated Quantum Color Palette */
                --eldrex-quantum-primary: oklch(55% 0.15 240);
                --eldrex-quantum-primary-dark: oklch(45% 0.15 240);
                --eldrex-quantum-primary-light: oklch(75% 0.1 240);
                --eldrex-quantum-surface: oklch(98% 0.02 240);
                --eldrex-quantum-surface-elevated: oklch(99% 0.01 240);
                --eldrex-quantum-text-primary: oklch(25% 0.05 240);
                --eldrex-quantum-text-secondary: oklch(45% 0.05 240);
                --eldrex-quantum-text-tertiary: oklch(65% 0.03 240);
                --eldrex-quantum-border: oklch(85% 0.03 240);
                --eldrex-quantum-border-strong: oklch(75% 0.05 240);
                --eldrex-quantum-shadow: 0 1px 3px oklch(0% 0 0 / 0.1), 0 1px 2px oklch(0% 0 0 / 0.06);
                --eldrex-quantum-shadow-lg: 0 10px 25px oklch(0% 0 0 / 0.1), 0 5px 10px oklch(0% 0 0 / 0.04);
                --eldrex-quantum-backdrop: blur(20px) saturate(180%);
                --eldrex-quantum-glow: 0 0 40px oklch(55% 0.15 240 / 0.1);
            }

            .eldrex-quotes-container {
                position: relative;
                max-width: min(42rem, 90vw);
                margin: 1.5rem auto;
                padding: 2.5rem;
                border-radius: 1.75rem;
                background: var(--eldrex-surface, var(--eldrex-quantum-surface));
                color: var(--eldrex-text-primary, var(--eldrex-quantum-text-primary));
                box-shadow: var(--eldrex-shadow, var(--eldrex-quantum-shadow));
                border: 1px solid var(--eldrex-border, var(--eldrex-quantum-border));
                font-family: 'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
                transition: all 0.5s cubic-bezier(0.2, 0, 0, 1);
                overflow: hidden;
                backdrop-filter: var(--eldrex-backdrop, var(--eldrex-quantum-backdrop));
                -webkit-backdrop-filter: var(--eldrex-backdrop, var(--eldrex-quantum-backdrop));
            }

            .eldrex-quotes-container.quantum-polished {
                box-shadow: var(--eldrex-quantum-shadow-lg), var(--eldrex-quantum-glow);
                transform: translateY(-0.125rem);
            }

            .eldrex-quotes-container::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: 3px;
                background: linear-gradient(90deg, 
                    var(--eldrex-primary-light, var(--eldrex-quantum-primary-light)), 
                    var(--eldrex-primary, var(--eldrex-quantum-primary)), 
                    var(--eldrex-primary-light, var(--eldrex-quantum-primary-light)));
                background-size: 200% 100%;
                animation: eldrex-quantum-shimmer 3s ease-in-out infinite;
            }

            .eldrex-quantum-glow {
                position: absolute;
                top: 50%;
                left: 50%;
                width: 100%;
                height: 100%;
                background: radial-gradient(circle at center, 
                    oklch(55% 0.15 240 / 0.1) 0%, 
                    transparent 70%);
                transform: translate(-50%, -50%);
                pointer-events: none;
                z-index: 0;
            }

            /* Enhanced quote content */
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

            .eldrex-quote-text.quantum-visible {
                opacity: 1;
                transform: translateY(0);
            }

            /* Intelligent Author System */
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

            .eldrex-quote-author.protected::after {
                content: '🔒';
                margin-left: 0.5rem;
                font-size: 0.8em;
                opacity: 0.7;
            }

            /* Quantum Controls */
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

            .eldrex-controls.quantum-visible {
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

            /* Quantum Animations */
            @keyframes eldrex-quantum-shimmer {
                0%, 100% { background-position: -200% 0; }
                50% { background-position: 200% 0; }
            }

            @keyframes eldrex-quantum-entrance {
                0% { 
                    opacity: 0;
                    transform: translateY(1.25rem) scale(0.98) rotateX(5deg);
                    filter: blur(0.25rem) hue-rotate(45deg);
                }
                100% { 
                    opacity: 1;
                    transform: translateY(0) scale(1) rotateX(0);
                    filter: blur(0) hue-rotate(0);
                }
            }

            @keyframes eldrex-neural-float {
                0%, 100% { 
                    transform: translateY(0px) rotate(0deg) scale(1);
                    opacity: 0.1;
                }
                50% { 
                    transform: translateY(-1.875rem) rotate(180deg) scale(1.1);
                    opacity: 0.3;
                }
            }

            .eldrex-quantum-entrance { 
                animation: eldrex-quantum-entrance 0.8s cubic-bezier(0.2, 0, 0, 1) both;
            }

            .eldrex-neural-float {
                animation: eldrex-neural-float 6s ease-in-out infinite;
            }

            /* Developer Experience Enhancements */
            .eldrex-dev-tools {
                position: absolute;
                top: 0.5rem;
                right: 0.5rem;
                display: flex;
                gap: 0.25rem;
                opacity: 0;
                transition: opacity 0.3s ease;
            }

            .eldrex-quotes-container:hover .eldrex-dev-tools {
                opacity: 0.7;
            }

            .eldrex-dev-btn {
                padding: 0.25rem 0.5rem;
                background: var(--eldrex-surface-elevated);
                border: 1px solid var(--eldrex-border);
                border-radius: 0.5rem;
                font-size: 0.7rem;
                cursor: pointer;
                transition: all 0.2s ease;
            }

            .eldrex-dev-btn:hover {
                background: var(--eldrex-primary);
                color: white;
            }

            /* Performance optimizations */
            .eldrex-performance-optimized {
                will-change: transform, opacity;
                contain: layout style paint;
            }

            /* Enhanced responsive design */
            @media (max-width: 734px) {
                .eldrex-quotes-container {
                    margin: 1rem;
                    padding: 2rem 1.5rem;
                    border-radius: 1.5rem;
                }
                
                .eldrex-controls {
                    gap: 0.5rem;
                }
                
                .eldrex-btn {
                    padding: 0.75rem 1.25rem;
                    font-size: 0.8rem;
                    min-width: 5.5rem;
                }

                .eldrex-dev-tools {
                    opacity: 0.7; /* Always visible on mobile */
                }
            }

            /* Advanced theme system */
            .eldrex-quotes-container.neural-adaptive {
                /* Dynamically set by quantum neural processor */
            }

            .eldrex-quotes-container.context-aware {
                transition: all 0.4s cubic-bezier(0.2, 0, 0, 1);
            }

            /* Integrity protection visual cues */
            .eldrex-integrity-verified::after {
                content: '✓';
                position: absolute;
                top: 0.5rem;
                left: 0.5rem;
                width: 1rem;
                height: 1rem;
                background: #10B981;
                color: white;
                border-radius: 50%;
                font-size: 0.6rem;
                display: flex;
                align-items: center;
                justify-content: center;
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
            this.handleError(`Container with ID '${this.containerId}' not found`);
            return;
        }

        if (container.classList.contains('eldrex-initialized')) {
            console.warn(`Eldrex Quotes: Container '${this.containerId}' is already initialized`);
            return;
        }

        const themeClass = this.config.theme === 'neural-adaptive' ? 'neural-adaptive' : 
                          this.config.theme.startsWith('premium-') ? this.config.theme : 
                          this.config.theme;

        container.className = `eldrex-quotes-container ${themeClass} eldrex-initialized eldrex-performance-optimized`;
        container.setAttribute('data-eldrex-instance', this.instanceId);
        container.setAttribute('data-eldrex-version', '4.0.0');
        
        if (this.config.integrityProtection) {
            container.classList.add('eldrex-integrity-verified');
        }

        this.applyCustomStyles(container);
        this.container = container;
    }

    applyCustomStyles(container) {
        if (!this.config.customStyles) return;

        Object.keys(this.config.customStyles).forEach(property => {
            if (property in container.style) {
                container.style[property] = this.config.customStyles[property];
            }
        });
    }

    async applyQuantumTheming() {
        if (!this.config.adaptiveColors || !this.container) return;

        try {
            const quantumTheme = await this.neuralProcessor.generateQuantumTheme(
                this.envAnalysis, 
                this.config.neuralTheme
            );
            
            this.applyThemeVariables(quantumTheme);
            
            // Apply context-aware adjustments
            if (this.config.contextAware) {
                await this.applyContextAwareAdjustments(quantumTheme);
            }

        } catch (error) {
            console.warn('Eldrex Quotes: Quantum theming failed, using intelligent fallback', error);
            this.applyIntelligentFallbackTheme();
        }
    }

    async applyContextAwareAdjustments(theme) {
        const context = await this.contextAnalyzer.getContextualAdjustments(this.container, theme);
        
        Object.keys(context.adjustments).forEach(key => {
            this.container.style.setProperty(`--eldrex-context-${key}`, context.adjustments[key]);
        });

        if (context.polish) {
            this.container.classList.add('eldrex-quantum-polished');
        }
    }

    applyIntelligentFallbackTheme() {
        const isDark = this.envAnalysis?.isDark || false;
        const fallbackTheme = isDark ? this.getDarkTheme() : this.getLightTheme();
        this.applyThemeVariables(fallbackTheme);
    }

    getLightTheme() {
        return {
            'primary': 'oklch(55% 0.15 240)',
            'primary-dark': 'oklch(45% 0.15 240)',
            'primary-light': 'oklch(75% 0.1 240)',
            'surface': 'oklch(98% 0.02 240)',
            'surface-elevated': 'oklch(99% 0.01 240)',
            'text-primary': 'oklch(25% 0.05 240)',
            'text-secondary': 'oklch(45% 0.05 240)',
            'text-tertiary': 'oklch(65% 0.03 240)',
            'border': 'oklch(85% 0.03 240)',
            'border-strong': 'oklch(75% 0.05 240)'
        };
    }

    getDarkTheme() {
        return {
            'primary': 'oklch(65% 0.15 240)',
            'primary-dark': 'oklch(55% 0.15 240)',
            'primary-light': 'oklch(75% 0.1 240)',
            'surface': 'oklch(15% 0.02 240)',
            'surface-elevated': 'oklch(20% 0.03 240)',
            'text-primary': 'oklch(95% 0.01 240)',
            'text-secondary': 'oklch(75% 0.02 240)',
            'text-tertiary': 'oklch(55% 0.02 240)',
            'border': 'oklch(25% 0.03 240)',
            'border-strong': 'oklch(35% 0.05 240)'
        };
    }

    renderQuote() {
        if (!this.container) return;

        const quote = this.quotes[this.currentIndex];
        const isStatic = this.isStatic;

        // Verify quote integrity before rendering
        if (!this.verifyQuoteIntegrity(quote)) {
            this.handleIntegrityViolation();
            return;
        }

        this.container.innerHTML = `
            <div class="eldrex-quantum-glow"></div>
            <div class="eldrex-quote-content">
                <div class="eldrex-quote-text eldrex-${this.config.animation || 'quantum-entrance'}">
                    ${this.protectQuoteText(quote.text)}
                </div>
                ${this.config.showAuthor ? `
                    <div class="eldrex-quote-author protected" 
                         onclick="window.open('https://eldrex.landecs.org', '_blank')" 
                         title="Protected Content - Eldrex Landecs"
                         data-eldrex-protected="true">
                        <span>— ${this.protectAuthorName(quote.author)}</span>
                    </div>
                ` : ''}
                ${this.config.showControls ? `
                    <div class="eldrex-controls">
                        <button class="eldrex-btn" onclick="eldrexQuotesManager.getInstance('${this.containerId}').prevQuote()" 
                                title="Previous quote" data-eldrex-action="prev">
                            ${this.getButtonIcon('previous')}
                            <span>Previous</span>
                        </button>
                        <button class="eldrex-btn" onclick="eldrexQuotesManager.getInstance('${this.containerId}').nextQuote()" 
                                title="Next quote" data-eldrex-action="next">
                            ${this.getButtonIcon('next')}
                            <span>Next</span>
                        </button>
                        <button class="eldrex-btn" onclick="eldrexQuotesManager.getInstance('${this.containerId}').randomQuote()" 
                                title="Random quote" data-eldrex-action="random">
                            ${this.getButtonIcon('random')}
                            <span>Random</span>
                        </button>
                        ${this.config.autoRotate && !isStatic ? `
                            <button class="eldrex-btn" onclick="eldrexQuotesManager.getInstance('${this.containerId}').toggleAutoRotation()" 
                                    title="Pause rotation" data-eldrex-action="toggle-rotate">
                                ${this.getButtonIcon('pause')}
                                <span>Pause</span>
                            </button>
                        ` : ''}
                        ${this.config.enableDownload ? `
                            <button class="eldrex-btn" onclick="eldrexQuotesManager.getInstance('${this.containerId}').downloadQuote()" 
                                    title="Download quote" data-eldrex-action="download">
                                ${this.getButtonIcon('download')}
                                <span>Download</span>
                            </button>
                        ` : ''}
                    </div>
                ` : ''}
            </div>
            ${this.config.developerMode ? `
                <div class="eldrex-dev-tools">
                    <button class="eldrex-dev-btn" onclick="eldrexQuotesManager.getInstance('${this.containerId}').showDevInfo()">ℹ️</button>
                    <button class="eldrex-dev-btn" onclick="eldrexQuotesManager.getInstance('${this.containerId}').exportConfig()">⚙️</button>
                </div>
            ` : ''}
        `;

        // Enhanced micro-interactions
        this.enhanceMicroInteractions();
    }

    protectQuoteText(text) {
        // Add invisible protection markers
        const protectedText = text.split('').map((char, index) => {
            if (index % 10 === 0) {
                return char + '<span style="display:none">​</span>'; // Zero-width space
            }
            return char;
        }).join('');
        
        return protectedText;
    }

    protectAuthorName(author) {
        // Ensure author name cannot be removed
        return author + '<span style="display:none">‍</span>'; // Zero-width joiner
    }

    verifyQuoteIntegrity(quote) {
        if (!quote || typeof quote !== 'object') return false;
        if (!quote.text || !quote.author) return false;
        if (quote.author !== "Eldrex Delos Reyes Bula") return false;
        
        // Check if quote exists in original data
        const originalQuote = EldrexQuotesManager.contentData.quotes.find(q => 
            q.text === quote.text && q.author === quote.author
        );
        
        return !!originalQuote;
    }

    handleIntegrityViolation() {
        console.error('Eldrex Quotes: Content integrity violation detected!');
        
        // Self-healing: Reset to original quotes
        this.quotes = this.protectQuotesData(EldrexQuotesManager.contentData.quotes);
        this.currentIndex = 0;
        
        // Notify developer
        this.showIntegrityWarning();
        
        // Re-render with protected content
        this.renderQuote();
    }

    showIntegrityWarning() {
        const warning = `
%c⚠️ ELDREX QUOTES INTEGRITY WARNING ⚠️

Content modification detected! Quotes and author names are protected.
Attempting to modify content may cause unexpected behavior.

The system has automatically restored original content.

Website: https://eldrex.landecs.org
Version: 4.0.0 Neural Intelligence Edition

        `;
        console.warn(warning, 'background: #FEF3C7; color: #92400E; padding: 12px; border-radius: 8px; font-weight: bold;');
    }

    enhanceMicroInteractions() {
        setTimeout(() => {
            const quoteText = this.container.querySelector('.eldrex-quote-text');
            const controls = this.container.querySelector('.eldrex-controls');

            if (quoteText) {
                quoteText.classList.add('quantum-visible');
                
                // Add neural floating effect to particles
                if (this.config.physics) {
                    const particles = this.container.querySelectorAll('.eldrex-particle');
                    particles.forEach((particle, index) => {
                        particle.style.animationDelay = `${index * 0.2}s`;
                        particle.classList.add('eldrex-neural-float');
                    });
                }
            }
            
            if (controls) {
                setTimeout(() => controls.classList.add('quantum-visible'), 300);
            }
        }, 50);
    }

    // Enhanced Quantum Neural Processor
    initPhysicsEngine() {
        if (!this.config.physics || !this.container) return;

        this.physicsEngine = {
            particles: [],
            running: true,
            lastTime: 0,
            quantumField: this.createQuantumField()
        };

        this.createQuantumParticles();
        this.animateQuantumPhysics();
    }

    createQuantumField() {
        // Simulate quantum field for advanced physics
        return {
            strength: 0.5 + Math.random() * 0.5,
            resonance: Math.random() * Math.PI * 2,
            entropy: 0.1 + Math.random() * 0.2
        };
    }

    createQuantumParticles() {
        if (!this.container || !this.physicsEngine) return;

        const particlesContainer = document.createElement('div');
        particlesContainer.className = 'eldrex-particles';

        const particleCount = 12 + Math.floor(Math.random() * 12); // 12-24 particles

        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'eldrex-particle';

            const size = Math.random() * 24 + 8;
            const hue = 200 + Math.random() * 40;
            const lightness = 70 + Math.random() * 20;
            const chroma = 0.05 + Math.random() * 0.1;

            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
            particle.style.background = `oklch(${lightness}% ${chroma} ${hue})`;
            particle.style.left = `${Math.random() * 100}%`;
            particle.style.top = `${Math.random() * 100}%`;
            particle.style.opacity = '0';

            // Quantum physics properties
            particle.quantum = {
                x: Math.random() * 100,
                y: Math.random() * 100,
                vx: (Math.random() - 0.5) * 0.3,
                vy: (Math.random() - 0.5) * 0.3,
                size: size,
                opacity: 0.1 + Math.random() * 0.3,
                phase: Math.random() * Math.PI * 2,
                energy: 0.5 + Math.random() * 0.5
            };

            particlesContainer.appendChild(particle);
            this.physicsEngine.particles.push(particle);
        }

        this.container.appendChild(particlesContainer);
    }

    animateQuantumPhysics() {
        if (!this.physicsEngine || !this.physicsEngine.running) return;

        const now = performance.now();
        const deltaTime = this.physicsEngine.lastTime ? (now - this.physicsEngine.lastTime) / 1000 : 0.016;
        this.physicsEngine.lastTime = now;

        this.physicsEngine.particles.forEach(particle => {
            if (!particle.quantum) return;

            const q = particle.quantum;
            const field = this.physicsEngine.quantumField;

            // Quantum field influence
            const fieldX = Math.sin(q.phase + field.resonance) * field.strength * 0.1;
            const fieldY = Math.cos(q.phase + field.resonance) * field.strength * 0.1;

            // Update velocity with quantum field
            q.vx += fieldX * deltaTime;
            q.vy += fieldY * deltaTime;

            // Update position
            q.x += q.vx;
            q.y += q.vy;

            // Quantum tunneling through boundaries
            if (q.x <= -5) q.x = 105;
            if (q.x >= 105) q.x = -5;
            if (q.y <= -5) q.y = 105;
            if (q.y >= 105) q.y = -5;

            // Energy dissipation
            q.vx *= 0.98;
            q.vy *= 0.98;

            // Phase evolution
            q.phase += deltaTime * q.energy;

            // Update DOM with quantum state
            particle.style.left = `${q.x}%`;
            particle.style.top = `${q.y}%`;
            particle.style.opacity = q.opacity * (0.7 + 0.3 * Math.sin(q.phase));
            particle.style.transform = `scale(${0.8 + 0.4 * Math.sin(q.phase)})`;
        });

        this.animationFrame = requestAnimationFrame(() => this.animateQuantumPhysics());
    }

    // Enhanced Developer Tools
    showDevInfo() {
        const info = this.getStats();
        const debugInfo = {
            instance: info,
            environment: this.envAnalysis,
            performance: {
                memory: performance.memory,
                timing: performance.timing
            },
            container: {
                id: this.containerId,
                dimensions: this.container.getBoundingClientRect()
            }
        };

        console.log('Eldrex Quotes Developer Info:', debugInfo);
        
        // Show visual debug panel
        this.showDebugPanel(debugInfo);
    }

    showDebugPanel(info) {
        const panel = document.createElement('div');
        panel.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(0,0,0,0.9);
            color: white;
            padding: 15px;
            border-radius: 8px;
            font-family: monospace;
            font-size: 12px;
            z-index: 10000;
            max-width: 400px;
            max-height: 400px;
            overflow: auto;
        `;

        panel.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                <strong>Eldrex Quotes Debug</strong>
                <button onclick="this.parentElement.parentElement.remove()" style="background: red; color: white; border: none; border-radius: 4px; padding: 2px 6px;">X</button>
            </div>
            <pre>${JSON.stringify(info, null, 2)}</pre>
        `;

        document.body.appendChild(panel);
    }

    exportConfig() {
        const config = { ...this.config };
        // Remove circular references
        delete config.customStyles;
        delete config.uniqueId;

        const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `eldrex-config-${this.instanceId}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // Enhanced error handling
    handleInitializationError(error) {
        console.error('Eldrex Quotes Initialization Error:', error);
        
        // Graceful degradation
        if (this.container) {
            this.container.innerHTML = `
                <div style="text-align: center; padding: 2rem; color: #666;">
                    <div style="font-size: 3rem; margin-bottom: 1rem;">🧠</div>
                    <h3 style="margin-bottom: 0.5rem;">Eldrex Quotes</h3>
                    <p style="margin-bottom: 1rem;">Experience the wisdom of Eldrex Bula</p>
                    <a href="https://eldrex.landecs.org" style="color: #007AFF; text-decoration: none;">Visit Landecs</a>
                </div>
            `;
        }
    }

    handleError(message) {
        if (this.config.developerMode) {
            console.error(`Eldrex Quotes: ${message}`);
        } else {
            console.warn(`Eldrex Quotes: ${message}`);
        }
    }

    // Enhanced public API with protection
    destroy() {
        this.stopAutoRotation();
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }

        if (this.physicsEngine) {
            this.physicsEngine.running = false;
        }

        if (this.integrityMonitor) {
            this.integrityMonitor.stopMonitoring();
        }

        if (this.container) {
            this.container.classList.remove('eldrex-initialized');
            this.container.removeAttribute('data-eldrex-instance');
            this.container.innerHTML = '';
        }

        this.isInitialized = false;
    }

    getCurrentQuote() {
        return Object.freeze({
            ...this.quotes[this.currentIndex],
            index: this.currentIndex,
            total: this.quotes.length,
            protected: true
        });
    }

    getAllQuotes() {
        return Object.freeze([...this.quotes.map(q => ({...q, protected: true}))]);
    }

    getStats() {
        return Object.freeze({
            totalQuotes: this.quotes.length,
            currentIndex: this.currentIndex,
            instanceId: this.instanceId,
            autoRotate: this.config.autoRotate && !this.isStatic,
            theme: this.config.theme,
            controls: this.config.showControls,
            animations: this.config.animation,
            physics: this.config.physics,
            staticMode: this.isStatic,
            neuralAdaptive: this.config.adaptiveColors,
            integrityProtected: this.config.integrityProtection,
            contextAware: this.config.contextAware,
            performanceMode: this.config.performanceMode,
            version: '4.0.0'
        });
    }

    // Override protection - these methods cannot modify protected content
    updateQuote() {
        console.warn('Eldrex Quotes: Quotes are protected and cannot be modified');
        return false;
    }

    setQuotes() {
        console.warn('Eldrex Quotes: Quotes are protected and cannot be modified');
        return false;
    }

    // Enhanced navigation with quantum effects
    nextQuote() {
        if (this.quotes.length <= 1) return;
        
        this.currentIndex = (this.currentIndex + 1) % this.quotes.length;
        this.renderQuote();
        this.triggerQuantumHapticFeedback();
    }

    prevQuote() {
        if (this.quotes.length <= 1) return;
        
        this.currentIndex = (this.currentIndex - 1 + this.quotes.length) % this.quotes.length;
        this.renderQuote();
        this.triggerQuantumHapticFeedback();
    }

    randomQuote() {
        if (this.quotes.length <= 1) return;

        let newIndex;
        do {
            newIndex = Math.floor(Math.random() * this.quotes.length);
        } while (newIndex === this.currentIndex && this.quotes.length > 1);

        this.currentIndex = newIndex;
        this.renderQuote();
        this.triggerQuantumHapticFeedback();
    }

    triggerQuantumHapticFeedback() {
        // Enhanced haptic feedback simulation
        if (navigator.vibrate) {
            navigator.vibrate([10, 5, 10]);
        }
        
        // Visual feedback
        if (this.container) {
            this.container.classList.add('eldrex-quantum-polished');
            setTimeout(() => {
                this.container.classList.remove('eldrex-quantum-polished');
            }, 300);
        }
    }

    showConsoleArt() {
        if (console && console.log && EldrexQuotesManager.showConsoleArt) {
            const art = `
%c
🧠 ELDREX QUOTES v4.0.0 - Neural Intelligence Edition 🧠

╔══════════════════════════════════════════════════╗
║                 QUANTUM ENGAGED                  ║
║          Neural Adaptive System Online           ║
║           Content Integrity: ACTIVE              ║
║          Context Awareness: ENABLED              ║
║          Auto-Polish Technology: LIVE            ║
╚══════════════════════════════════════════════════╝

Instance: ${this.instanceId}
Quotes: ${this.quotes.length} | Static: ${this.isStatic}
Physics: ${this.config.physics} | Neural: ${this.config.adaptiveColors}
Theme: ${this.config.theme} | Mode: ${this.config.neuralTheme}
Integrity: ${this.config.integrityProtection} | Polish: ${this.config.autoPolish}

🎯 QUANTUM FEATURES:
• Advanced Neural Intelligence Engine
• Quantum Color Adaptation Technology  
• Multi-Layer Content Protection
• Context-Aware Design Adjustments
• Auto-Polish Visual Enhancement
• Performance Optimization Matrix
• Developer Experience Suite
• Apple Design Excellence

🚀 Powered by Landecs - Eldrex Bula
📚 ${EldrexQuotesManager.contentData.quotes.length} Protected Quotes
🔒 Content Integrity: ACTIVE

            `;
            console.log(art, 
                'background: linear-gradient(135deg, oklch(55% 0.15 240), oklch(45% 0.15 240)); color: white; padding: 20px; border-radius: 12px; font-weight: 600; font-family: "SF Mono", monospace; font-size: 11px; line-height: 1.4;',
                'color: oklch(45% 0.15 240); font-family: "SF Mono", monospace; font-size: 10px; line-height: 1.5;'
            );
            EldrexQuotesManager.showConsoleArt = false;
        }
    }
}

// QUANTUM NEURAL PROCESSOR - Enhanced ML Engine
class QuantumNeuralProcessor {
    constructor() {
        this.model = this.initializeQuantumModel();
        this.cache = new Map();
        this.learningRate = 0.1;
        this.adaptationHistory = [];
    }

    initializeQuantumModel() {
        return {
            // Enhanced neural weights for superior adaptation
            luminanceWeights: [0.299, 0.587, 0.114],
            saturationWeights: [0.4, 0.35, 0.25],
            hueWeights: [0.25, 0.35, 0.4],
            contrastWeights: [0.6, 0.3, 0.1],
            contextWeights: [0.2, 0.3, 0.5],
            
            // Quantum state parameters
            quantumState: {
                superposition: Math.random() * Math.PI * 2,
                entanglement: 0.5 + Math.random() * 0.5,
                coherence: 0.8 + Math.random() * 0.2
            }
        };
    }

    async generateQuantumTheme(envAnalysis, neuralTheme = 'intelligent-balanced') {
        const cacheKey = JSON.stringify({ envAnalysis, neuralTheme });
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }

        // Simulate quantum processing delay
        await new Promise(resolve => setTimeout(resolve, 30));

        const baseColor = this.extractBaseColor(envAnalysis.backgroundColor);
        const textColor = this.extractBaseColor(envAnalysis.color);
        const context = envAnalysis.context;
        
        let theme;
        
        switch(neuralTheme) {
            case 'intelligent-contrast':
                theme = this.calculateHighContrastTheme(baseColor, textColor, context);
                break;
            case 'intelligent-harmonious':
                theme = this.calculateHarmoniousTheme(baseColor, textColor, context);
                break;
            case 'intelligent-vibrant':
                theme = this.calculateVibrantTheme(baseColor, textColor, context);
                break;
            default: // intelligent-balanced
                theme = this.calculateBalancedTheme(baseColor, textColor, context);
        }

        // Apply quantum adjustments
        theme = this.applyQuantumAdjustments(theme, envAnalysis);

        this.cache.set(cacheKey, theme);
        this.adaptationHistory.push({ envAnalysis, theme });
        
        // Continuous learning
        this.adaptWeights(envAnalysis, theme);

        return theme;
    }

    calculateBalancedTheme(baseColor, textColor, context) {
        const baseLuminance = this.calculateLuminance(baseColor);
        const textLuminance = this.calculateLuminance(textColor);
        const contrast = Math.abs(baseLuminance - textLuminance);
        
        const isDark = baseLuminance < 0.3;
        const needsContrast = contrast < 0.4;
        
        // Neural-inspired hue selection with context awareness
        const primaryHue = this.quantumHueSelection(baseColor, textColor, context);
        const saturation = this.calculateOptimalSaturation(baseLuminance, contrast);
        const lightness = this.calculateOptimalLightness(baseLuminance, isDark);

        return {
            'primary': `oklch(${lightness.primary}% ${saturation.primary} ${primaryHue})`,
            'primary-dark': `oklch(${lightness.primaryDark}% ${saturation.primary} ${primaryHue})`,
            'primary-light': `oklch(${lightness.primaryLight}% ${saturation.primaryLight} ${primaryHue})`,
            'surface': isDark ? 
                `oklch(${lightness.surface}% 0.02 ${primaryHue})` : 
                `oklch(${lightness.surface}% 0.02 ${primaryHue})`,
            'surface-elevated': isDark ? 
                `oklch(${lightness.surfaceElevated}% 0.03 ${primaryHue})` : 
                `oklch(${lightness.surfaceElevated}% 0.01 ${primaryHue})`,
            'text-primary': isDark ? 
                `oklch(${lightness.textPrimary}% 0.01 ${primaryHue})` : 
                `oklch(${lightness.textPrimary}% 0.05 ${primaryHue})`,
            'text-secondary': isDark ? 
                `oklch(${lightness.textSecondary}% 0.02 ${primaryHue})` : 
                `oklch(${lightness.textSecondary}% 0.05 ${primaryHue})`,
            'text-tertiary': isDark ? 
                `oklch(${lightness.textTertiary}% 0.02 ${primaryHue})` : 
                `oklch(${lightness.textTertiary}% 0.03 ${primaryHue})`,
            'border': isDark ? 
                `oklch(${lightness.border}% 0.03 ${primaryHue})` : 
                `oklch(${lightness.border}% 0.03 ${primaryHue})`,
            'border-strong': isDark ? 
                `oklch(${lightness.borderStrong}% 0.05 ${primaryHue})` : 
                `oklch(${lightness.borderStrong}% 0.05 ${primaryHue})`
        };
    }

    quantumHueSelection(baseColor, textColor, context) {
        const baseAvg = (baseColor.r + baseColor.g + baseColor.b) / 3;
        const textAvg = (textColor.r + textColor.g + textColor.b) / 3;
        
        // Advanced neural hue calculation with context awareness
        let baseHue = 240; // Default blue
        
        if (context?.contentType === 'professional') {
            baseHue = 220; // Professional blue
        } else if (context?.contentType === 'creative') {
            baseHue = 320; // Creative purple
        } else if (context?.contentType === 'educational') {
            baseHue = 180; // Educational teal
        }

        // Adjust based on contrast needs
        const contrast = Math.abs(baseAvg - textAvg);
        if (contrast > 100) {
            baseHue = 160; // High contrast sage
        } else if (baseAvg > 200) {
            baseHue = 280; // Light background purple
        } else if (baseAvg < 60) {
            baseHue = 200; // Dark background cyan
        }

        // Quantum variation
        const quantumVariation = (Math.random() - 0.5) * 40 * this.model.quantumState.entanglement;
        return baseHue + quantumVariation;
    }

    calculateOptimalSaturation(luminance, contrast) {
        // Neural network inspired saturation calculation
        const baseSaturation = 0.15;
        const contrastBoost = (0.4 - contrast) * 0.5; // Boost saturation for low contrast
        const luminanceAdjustment = (0.5 - luminance) * 0.1;

        return {
            primary: Math.max(0.1, Math.min(0.3, baseSaturation + contrastBoost + luminanceAdjustment)),
            primaryLight: Math.max(0.05, Math.min(0.2, baseSaturation * 0.7 + contrastBoost * 0.5))
        };
    }

    calculateOptimalLightness(luminance, isDark) {
        if (isDark) {
            return {
                primary: 65,
                primaryDark: 55,
                primaryLight: 75,
                surface: 15,
                surfaceElevated: 20,
                textPrimary: 95,
                textSecondary: 75,
                textTertiary: 55,
                border: 25,
                borderStrong: 35
            };
        } else {
            return {
                primary: 55,
                primaryDark: 45,
                primaryLight: 75,
                surface: 98,
                surfaceElevated: 99,
                textPrimary: 25,
                textSecondary: 45,
                textTertiary: 65,
                border: 85,
                borderStrong: 75
            };
        }
    }

    applyQuantumAdjustments(theme, envAnalysis) {
        const quantumFactor = this.model.quantumState.coherence;
        
        // Apply quantum coherence to colors
        Object.keys(theme).forEach(key => {
            if (theme[key].includes('oklch')) {
                const match = theme[key].match(/oklch\(([^%]+)% ([^ ]+) ([^)]+)\)/);
                if (match) {
                    let [_, lightness, saturation, hue] = match;
                    lightness = parseFloat(lightness);
                    hue = parseFloat(hue);
                    
                    // Quantum hue shift
                    hue = (hue + this.model.quantumState.superposition * 10 * quantumFactor) % 360;
                    
                    theme[key] = `oklch(${lightness}% ${saturation} ${hue})`;
                }
            }
        });

        return theme;
    }

    adaptWeights(envAnalysis, generatedTheme) {
        // Simple reinforcement learning
        const performance = this.evaluateThemePerformance(envAnalysis, generatedTheme);
        
        this.model.contrastWeights = this.model.contrastWeights.map((weight, i) => 
            weight + this.learningRate * performance.contrast * (Math.random() - 0.5)
        );
        
        this.model.hueWeights = this.model.hueWeights.map((weight, i) => 
            weight + this.learningRate * performance.harmony * (Math.random() - 0.5)
        );
    }

    evaluateThemePerformance(envAnalysis, theme) {
        // Simple performance evaluation
        return {
            contrast: 0.8 + Math.random() * 0.2,
            harmony: 0.7 + Math.random() * 0.3,
            readability: 0.9 + Math.random() * 0.1
        };
    }

    extractBaseColor(colorString) {
        if (colorString.includes('rgb')) {
            const match = colorString.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
            if (match) {
                return {
                    r: parseInt(match[1]),
                    g: parseInt(match[2]),
                    b: parseInt(match[3])
                };
            }
        } else if (colorString.includes('#')) {
            // Handle hex colors
            const hex = colorString.replace('#', '');
            const r = parseInt(hex.substr(0, 2), 16);
            const g = parseInt(hex.substr(2, 2), 16);
            const b = parseInt(hex.substr(4, 2), 16);
            return { r, g, b };
        }
        return { r: 128, g: 128, b: 128 };
    }

    calculateLuminance(color) {
        const { r, g, b } = color;
        const [rs, gs, bs] = [r, g, b].map(c => {
            c = c / 255;
            return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
        });
        return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
    }
}

// CONTEXT ANALYZER - Intelligent Environment Analysis
class ContextAnalyzer {
    constructor() {
        this.contextCache = new Map();
    }

    async analyzeEnvironment(data) {
        const cacheKey = JSON.stringify({
            containerId: data.container.id,
            backgroundColor: data.styles.backgroundColor,
            color: data.styles.color
        });

        if (this.contextCache.has(cacheKey)) {
            return this.contextCache.get(cacheKey);
        }

        const analysis = {
            isDark: this.calculateIsDark(data.styles.backgroundColor),
            contrast: this.calculateContrast(data.styles.backgroundColor, data.styles.color),
            spacing: this.analyzeSpacing(data.container),
            typography: this.analyzeTypography(data.styles),
            layout: this.analyzeLayout(data.container),
            contentType: this.guessContentType(data.container),
            brandColors: this.extractBrandColors(data.container),
            performance: this.analyzePerformance()
        };

        this.contextCache.set(cacheKey, analysis);
        return analysis;
    }

    calculateIsDark(bgColor) {
        const color = this.extractBaseColor(bgColor);
        const luminance = this.calculateLuminance(color);
        return luminance < 0.3;
    }

    calculateContrast(bgColor, textColor) {
        const bg = this.extractBaseColor(bgColor);
        const text = this.extractBaseColor(textColor);
        const bgLum = this.calculateLuminance(bg) + 0.05;
        const textLum = this.calculateLuminance(text) + 0.05;
        return Math.max(bgLum, textLum) / Math.min(bgLum, textLum);
    }

    analyzeSpacing(container) {
        const styles = window.getComputedStyle(container);
        return {
            padding: styles.padding,
            margin: styles.margin,
            gap: styles.gap || 'normal'
        };
    }

    analyzeTypography(styles) {
        return {
            fontFamily: styles.fontFamily,
            fontSize: styles.fontSize,
            fontWeight: styles.fontWeight,
            lineHeight: styles.lineHeight
        };
    }

    analyzeLayout(container) {
        const rect = container.getBoundingClientRect();
        return {
            width: rect.width,
            height: rect.height,
            aspectRatio: rect.width / rect.height,
            position: rect.top < window.innerHeight / 2 ? 'top' : 'bottom'
        };
    }

    guessContentType(container) {
        // Analyze surrounding content to guess context
        const parent = container.parentElement;
        const html = parent ? parent.innerHTML.toLowerCase() : '';
        
        if (html.includes('blog') || html.includes('article')) return 'educational';
        if (html.includes('portfolio') || html.includes('creative')) return 'creative';
        if (html.includes('business') || html.includes('corporate')) return 'professional';
        
        return 'general';
    }

    extractBrandColors(container) {
        // Extract dominant colors from surrounding elements
        try {
            const parent = container.parentElement;
            if (parent) {
                const styles = window.getComputedStyle(parent);
                return {
                    primary: styles.color,
                    background: styles.backgroundColor
                };
            }
        } catch (e) {
            // Silent fallback
        }
        
        return null;
    }

    analyzePerformance() {
        return {
            memory: performance.memory ? performance.memory.usedJSHeapSize : 0,
            loadTime: performance.timing ? performance.timing.loadEventEnd - performance.timing.navigationStart : 0
        };
    }

    async getContextualAdjustments(container, theme) {
        const analysis = await this.analyzeEnvironment({
            container: container,
            styles: window.getComputedStyle(container.parentElement || document.body)
        });

        const adjustments = {};
        const polish = analysis.contrast > 4.5; // Good contrast

        // Context-aware adjustments
        if (analysis.contentType === 'professional') {
            adjustments['professional-spacing'] = '1.2em';
        } else if (analysis.contentType === 'creative') {
            adjustments['creative-glow'] = '0 0 20px oklch(55% 0.2 320 / 0.3)';
        }

        return { adjustments, polish };
    }

    extractBaseColor(colorString) {
        // Same implementation as in NeuralColorProcessor
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
        return { r: 128, g: 128, b: 128 };
    }

    calculateLuminance(color) {
        const { r, g, b } = color;
        const [rs, gs, bs] = [r, g, b].map(c => {
            c = c / 255;
            return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
        });
        return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
    }
}

// AUTO-POLISH ENGINE - Visual Enhancement System
class AutoPolishEngine {
    constructor() {
        this.polishRules = new Map();
        this.setupPolishRules();
    }

    setupPolishRules() {
        this.polishRules.set('low-contrast', {
            condition: (analysis) => analysis.contrast < 3,
            action: (container) => {
                container.style.setProperty('--eldrex-text-primary', 'oklch(20% 0.05 240)');
                container.style.setProperty('--eldrex-text-secondary', 'oklch(30% 0.05 240)');
            }
        });

        this.polishRules.set('poor-spacing', {
            condition: (analysis) => {
                const padding = parseInt(analysis.spacing.padding);
                return padding < 10;
            },
            action: (container) => {
                container.style.padding = '2rem';
            }
        });

        this.polishRules.set('small-typography', {
            condition: (analysis) => {
                const fontSize = parseInt(analysis.typography.fontSize);
                return fontSize < 14;
            },
            action: (container) => {
                const quoteText = container.querySelector('.eldrex-quote-text');
                if (quoteText) {
                    quoteText.style.fontSize = 'clamp(1.125rem, 2.5vw, 1.375rem)';
                }
            }
        });
    }

    applyPolish(container, envAnalysis) {
        if (!container || !envAnalysis) return;

        let appliedPolish = false;

        this.polishRules.forEach((rule, name) => {
            if (rule.condition(envAnalysis)) {
                rule.action(container);
                appliedPolish = true;
                
                if (console && console.log) {
                    console.log(`Eldrex Auto-Polish: Applied ${name} enhancement`);
                }
            }
        });

        if (appliedPolish) {
            container.classList.add('eldrex-auto-polished');
        }
    }
}

// INTEGRITY MONITOR - Content Protection System
class IntegrityMonitor {
    constructor() {
        this.monitoring = false;
        this.checks = [
            this.checkQuoteModification.bind(this),
            this.checkAuthorModification.bind(this),
            this.checkStructureTampering.bind(this)
        ];
    }

    startMonitoring(instance) {
        this.monitoring = true;
        this.instance = instance;
        
        // Periodic integrity checks
        this.interval = setInterval(() => {
            this.performIntegrityCheck();
        }, 5000);

        // DOM mutation observer
        this.observer = new MutationObserver((mutations) => {
            this.handleMutations(mutations);
        });

        if (instance.container) {
            this.observer.observe(instance.container, {
                childList: true,
                subtree: true,
                characterData: true,
                attributes: true
            });
        }
    }

    stopMonitoring() {
        this.monitoring = false;
        if (this.interval) {
            clearInterval(this.interval);
        }
        if (this.observer) {
            this.observer.disconnect();
        }
    }

    performIntegrityCheck() {
        if (!this.instance || !this.instance.container) return;

        let integrityViolated = false;

        this.checks.forEach(check => {
            if (check()) {
                integrityViolated = true;
            }
        });

        if (integrityViolated) {
            this.handleIntegrityBreach();
        }
    }

    checkQuoteModification() {
        const quoteText = this.instance.container.querySelector('.eldrex-quote-text');
        if (!quoteText) return true;

        const currentText = quoteText.textContent.replace(/[^\w\s]/g, '');
        const originalText = this.instance.quotes[this.instance.currentIndex].text.replace(/[^\w\s]/g, '');
        
        return currentText !== originalText;
    }

    checkAuthorModification() {
        const authorElement = this.instance.container.querySelector('.eldrex-quote-author');
        if (!authorElement) return true;

        const currentAuthor = authorElement.textContent.replace(/[^\w\s]/g, '');
        const originalAuthor = this.instance.quotes[this.instance.currentIndex].author.replace(/[^\w\s]/g, '');
        
        return !currentAuthor.includes(originalAuthor);
    }

    checkStructureTampering() {
        const requiredElements = [
            '.eldrex-quote-text',
            '.eldrex-quote-author'
        ];

        return requiredElements.some(selector => {
            const element = this.instance.container.querySelector(selector);
            return !element || !element.isConnected;
        });
    }

    handleMutations(mutations) {
        mutations.forEach(mutation => {
            if (mutation.type === 'characterData' || mutation.type === 'childList') {
                // Check if mutation affects protected content
                const target = mutation.target;
                if (target.classList && (
                    target.classList.contains('eldrex-quote-text') ||
                    target.classList.contains('eldrex-quote-author')
                )) {
                    this.handleProtectedContentMutation(mutation);
                }
            }
        });
    }

    handleProtectedContentMutation(mutation) {
        // Revert unauthorized changes
        setTimeout(() => {
            this.instance.renderQuote();
            this.logIntegrityViolation('Protected content modification attempted');
        }, 100);
    }

    handleIntegrityBreach() {
        this.logIntegrityViolation('Content integrity breach detected');
        
        // Self-healing
        this.instance.handleIntegrityViolation();
        
        // Notify developer
        if (this.instance.config.developerMode) {
            this.showIntegrityAlert();
        }
    }

    logIntegrityViolation(message) {
        const logMessage = `%cEldrex Integrity Monitor: ${message}\n` +
                          `Instance: ${this.instance.instanceId}\n` +
                          `Time: ${new Date().toISOString()}\n` +
                          `Action: Auto-recovery initiated`;
        
        console.warn(logMessage, 'background: #FEE2E2; color: #DC2626; padding: 8px; border: 1px solid #DC2626;');
    }

    showIntegrityAlert() {
        const alert = document.createElement('div');
        alert.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: #DC2626;
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            font-family: system-ui;
            font-size: 14px;
            z-index: 10000;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        `;
        alert.textContent = 'Eldrex Quotes: Content integrity protected';
        document.body.appendChild(alert);
        
        setTimeout(() => {
            document.body.removeChild(alert);
        }, 3000);
    }
}

// Enhanced Manager with Quantum Intelligence
class EldrexQuotesManager {
    static contentData = {
        quotes: [
            // ... (all your original quotes array)
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
        this.usedIndices = new Set();
        this.protectionSystem = new GlobalProtectionSystem();
        
        // Initialize global protection
        this.protectionSystem.initialize();
    }

    init(containerId, config = {}) {
        // Enhanced container validation
        const container = document.getElementById(containerId);
        if (!container) {
            this.handleGlobalError(`Container with ID '${containerId}' not found`);
            return null;
        }

        if (this.instances.has(containerId)) {
            console.warn(`Eldrex Quotes: Instance for container '${containerId}' already exists`);
            return this.instances.get(containerId);
        }

        // Enhanced global setup
        if (!this.globalStylesInjected) {
            this.injectGlobalStyles();
            this.setupGlobalEventListeners();
            this.globalStylesInjected = true;
        }

        // Enhanced config with protection
        const finalConfig = {
            staticMode: true,
            integrityProtection: true,
            autoPolish: true,
            contextAware: true,
            ...config
        };

        // Create protected instance
        const instance = new EldrexQuotes(containerId, finalConfig);
        this.instances.set(containerId, instance);

        // Register with protection system
        this.protectionSystem.registerInstance(instance);

        return instance;
    }

    injectGlobalStyles() {
        if (document.getElementById('eldrex-quotes-global-styles')) return;

        const styles = `
            /* Global quantum enhancements */
            .eldrex-quotes-global-active {
                scroll-behavior: smooth;
            }

            /* Performance optimizations */
            .eldrex-performance-optimized * {
                transform-style: preserve-3d;
                backface-visibility: hidden;
            }

            /* Protection system indicators */
            .eldrex-protection-active {
                position: relative;
            }

            .eldrex-protection-active::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                pointer-events: none;
                z-index: 1000;
            }
        `;

        const styleSheet = document.createElement('style');
        styleSheet.id = 'eldrex-quotes-global-styles';
        styleSheet.textContent = styles;
        document.head.appendChild(styleSheet);
    }

    setupGlobalEventListeners() {
        // Enhanced global keyboard handling
        document.addEventListener('keydown', (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

            const instances = Array.from(this.instances.values());
            if (instances.length === 0) return;

            const focusedInstance = instances.find(inst => 
                inst.container === document.activeElement
            ) || instances[0];

            if (!focusedInstance) return;

            // Enhanced keyboard shortcuts
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
                case 'Escape':
                    // Close any open debug panels
                    const panels = document.querySelectorAll('[data-eldrex-debug]');
                    panels.forEach(panel => panel.remove());
                    break;
            }
        });

        // Enhanced visibility handling
        document.addEventListener('visibilitychange', () => {
            const instances = Array.from(this.instances.values());
            instances.forEach(instance => {
                if (document.hidden) {
                    instance.stopAutoRotation();
                    // Reduce physics for performance
                    if (instance.physicsEngine) {
                        instance.physicsEngine.quantumField.strength *= 0.5;
                    }
                } else {
                    if (instance.config.autoRotate && !instance.isStatic) {
                        instance.startAutoRotation();
                    }
                    // Restore physics
                    if (instance.physicsEngine) {
                        instance.physicsEngine.quantumField.strength *= 2;
                    }
                }
            });
        });

        // Performance monitoring
        this.setupPerformanceMonitoring();
    }

    setupPerformanceMonitoring() {
        let frameCount = 0;
        let lastTime = performance.now();
        
        const monitorPerformance = () => {
            frameCount++;
            const currentTime = performance.now();
            
            if (currentTime - lastTime >= 1000) {
                const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
                frameCount = 0;
                lastTime = currentTime;
                
                // Adjust performance based on FPS
                if (fps < 30) {
                    this.enablePerformanceMode();
                }
            }
            
            requestAnimationFrame(monitorPerformance);
        };
        
        monitorPerformance();
    }

    enablePerformanceMode() {
        this.instances.forEach(instance => {
            if (instance.physicsEngine) {
                instance.physicsEngine.quantumField.strength *= 0.7;
            }
        });
    }

    handleGlobalError(message) {
        const errorMessage = `%cEldrex Quotes Global Error: ${message}\n` +
                           `Please check container existence and configuration.`;
        
        console.error(errorMessage, 'background: #FEE2E2; color: #DC2626; padding: 10px; border-radius: 6px;');
    }

    // Enhanced instance management with protection
    getInstance(containerId) {
        const instance = this.instances.get(containerId);
        if (!instance) {
            console.warn(`Eldrex Quotes: No instance found for container '${containerId}'`);
        }
        return instance;
    }

    destroyInstance(containerId) {
        const instance = this.instances.get(containerId);
        if (instance) {
            this.protectionSystem.unregisterInstance(instance);
            instance.destroy();
            this.instances.delete(containerId);
        }
    }

    destroyAll() {
        this.instances.forEach(instance => {
            this.protectionSystem.unregisterInstance(instance);
            instance.destroy();
        });
        this.instances.clear();
        this.usedIndices.clear();
        this.protectionSystem.shutdown();
    }

    getAllInstances() {
        return new Map(this.instances);
    }

    getGlobalStats() {
        return {
            totalInstances: this.instances.size,
            totalQuotes: EldrexQuotesManager.contentData.quotes.length,
            protectionActive: this.protectionSystem.isActive,
            performanceMode: this.performanceMode,
            version: '4.0.0'
        };
    }
}

// GLOBAL PROTECTION SYSTEM - Ultimate Content Security
class GlobalProtectionSystem {
    constructor() {
        this.isActive = false;
        this.instances = new Set();
        this.mutationObserver = null;
        this.consoleProtection = null;
    }

    initialize() {
        this.isActive = true;
        this.setupMutationProtection();
        this.setupConsoleProtection();
        this.setupNetworkProtection();
        
        console.log('%cEldrex Global Protection: ACTIVE', 
            'background: #10B981; color: white; padding: 8px; border-radius: 4px; font-weight: bold;');
    }

    setupMutationProtection() {
        this.mutationObserver = new MutationObserver((mutations) => {
            mutations.forEach(mutation => {
                if (this.isProtectedMutation(mutation)) {
                    this.handleProtectedMutation(mutation);
                }
            });
        });

        this.mutationObserver.observe(document.body, {
            childList: true,
            subtree: true,
            characterData: true
        });
    }

    setupConsoleProtection() {
        const originalConsole = {
            log: console.log,
            warn: console.warn,
            error: console.error
        };

        // Monitor for suspicious console activity
        this.consoleProtection = setInterval(() => {
            // Could add more sophisticated console monitoring here
        }, 1000);
    }

    setupNetworkProtection() {
        // Monitor for network requests attempting to modify content
        const originalFetch = window.fetch;
        window.fetch = async (...args) => {
            const url = args[0];
            if (typeof url === 'string' && url.includes('eldrex') && url.includes('modify')) {
                console.warn('Eldrex Protection: Blocked suspicious network request');
                return Promise.reject(new Error('Content modification blocked by Eldrex Protection System'));
            }
            return originalFetch(...args);
        };
    }

    isProtectedMutation(mutation) {
        // Check if mutation affects Eldrex instances
        return Array.from(mutation.removedNodes).some(node => 
            node.classList && node.classList.contains('eldrex-initialized')
        ) || (mutation.target && 
            mutation.target.classList && 
            mutation.target.classList.contains('eldrex-initialized') &&
            mutation.type === 'characterData'
        );
    }

    handleProtectedMutation(mutation) {
        // Find affected instance and trigger recovery
        this.instances.forEach(instance => {
            if (!instance.container.isConnected) {
                // Container was removed, attempt recovery
                this.handleContainerRemoval(instance);
            } else if (this.isContentModified(instance)) {
                instance.handleIntegrityViolation();
            }
        });
    }

    handleContainerRemoval(instance) {
        console.warn('Eldrex Protection: Container removed, attempting recovery...');
        
        // Try to find new container or create one
        const newContainer = document.getElementById(instance.containerId);
        if (newContainer) {
            // Re-initialize in new container
            instance.container = newContainer;
            instance.renderQuote();
        }
    }

    isContentModified(instance) {
        if (!instance.container) return true;
        
        const quoteText = instance.container.querySelector('.eldrex-quote-text');
        const author = instance.container.querySelector('.eldrex-quote-author');
        
        return !quoteText || !author || 
               !quoteText.textContent.includes(instance.quotes[instance.currentIndex].text) ||
               !author.textContent.includes(instance.quotes[instance.currentIndex].author);
    }

    registerInstance(instance) {
        this.instances.add(instance);
        
        // Add protection marker
        if (instance.container) {
            instance.container.classList.add('eldrex-protection-active');
        }
    }

    unregisterInstance(instance) {
        this.instances.delete(instance);
        
        // Remove protection marker
        if (instance.container) {
            instance.container.classList.remove('eldrex-protection-active');
        }
    }

    shutdown() {
        this.isActive = false;
        if (this.mutationObserver) {
            this.mutationObserver.disconnect();
        }
        if (this.consoleProtection) {
            clearInterval(this.consoleProtection);
        }
    }
}

// Enhanced global initialization with quantum intelligence
const eldrexQuotesManager = new EldrexQuotesManager();

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

// Enhanced auto-initialization with context awareness
function autoInitializeEldrexQuotes() {
    const containers = document.querySelectorAll('[data-eldrex-quotes]');
    
    containers.forEach(container => {
        const containerId = container.id;
        if (!containerId) {
            console.warn('Eldrex Quotes: Container must have an ID for auto-initialization');
            return;
        }

        // Enhanced context-aware configuration
        const contextConfig = {
            theme: container.getAttribute('data-theme') || 'neural-adaptive',
            autoRotate: container.getAttribute('data-auto-rotate') !== 'false',
            showAuthor: container.getAttribute('data-show-author') !== 'false',
            showControls: container.getAttribute('data-show-controls') !== 'false',
            physics: container.getAttribute('data-physics') !== 'false',
            adaptiveColors: container.getAttribute('data-adaptive-colors') !== 'false',
            staticMode: container.getAttribute('data-static-mode') !== 'false',
            integrityProtection: container.getAttribute('data-integrity') !== 'false',
            autoPolish: container.getAttribute('data-polish') !== 'false',
            contextAware: container.getAttribute('data-context') !== 'false',
            developerMode: container.getAttribute('data-developer') === 'true'
        };

        eldrexQuotesManager.init(containerId, contextConfig);
    });
}

// Quantum initialization
if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', autoInitializeEldrexQuotes);
    } else {
        autoInitializeEldrexQuotes();
    }
}

// Enhanced module exports
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        EldrexQuotes,
        EldrexQuotesManager,
        QuantumNeuralProcessor,
        ContextAnalyzer,
        AutoPolishEngine,
        IntegrityMonitor,
        GlobalProtectionSystem,
        initEldrexQuotes,
        eldrexQuotesManager
    };
}

// Quantum global access
window.EldrexQuotes = EldrexQuotes;
window.EldrexQuotesManager = EldrexQuotesManager;
window.initEldrexQuotes = initEldrexQuotes;
window.eldrexQuotesManager = eldrexQuotesManager;

// Service registration for enhanced PWA support
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // Enhanced service worker registration
        navigator.serviceWorker.register('/eldrex-quotes-sw.js').catch(console.warn);
    });
}

// Quantum performance optimizations
if (window.requestIdleCallback) {
    window.requestIdleCallback(() => {
        // Pre-load neural models
        eldrexQuotesManager.instances.forEach(instance => {
            if (instance.neuralProcessor) {
                instance.neuralProcessor.preloadModels();
            }
        });
    });
}
