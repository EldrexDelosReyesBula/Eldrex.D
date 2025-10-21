/**
 * Eldrex Quotes Collection - Landecs
 * Version: 2.1.0
 * Author: Eldrex Delos Reyes Bula
 * Publisher: Landecs
 * Website: https://eldrex.landecs.org
 * License: Landecs Proprietary Software License Quotes (LPSLQ)
 */

class EldrexQuotes {
    constructor(containerId, config = {}) {
        this.containerId = containerId;
        this.config = {
            containerId: containerId,
            theme: config.theme || 'light',
            autoRotate: config.autoRotate !== false,
            rotationInterval: config.rotationInterval || 8000,
            showAuthor: config.showAuthor !== false,
            showControls: config.showControls !== false,
            animation: config.animation || 'smoothFade',
            physics: config.physics !== false,
            maxQuotes: config.maxQuotes || null,
            filterQuotes: config.filterQuotes || null,
            customStyles: config.customStyles || {},
            uniqueId: this.generateUniqueId(),
            enableDownload: config.enableDownload !== false,
            ...config
        };

        this.quotes = this.filterQuotesData(contentData.quotes);
        this.currentIndex = 0;
        this.isInitialized = false;
        this.animationFrame = null;

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

    init() {
        this.validateEnvironment();
        this.injectStyles();
        this.createContainer();
        this.renderQuote();
        this.bindEvents();

        if (this.config.autoRotate) {
            this.startAutoRotation();
        }

        this.isInitialized = true;
    }

    validateEnvironment() {
        if (typeof document === 'undefined') {
            throw new Error('Eldrex Quotes: DOM environment required');
        }
    }

    injectStyles() {
        if (document.getElementById('eldrex-quotes-styles')) return;

        const styles = `
            @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
            
            :root {
                --sage-50: #f8faf9;
                --sage-100: #f1f4f3;
                --sage-200: #e4e9e7;
                --sage-300: #d1d9d5;
                --sage-400: #a8b8b1;
                --sage-500: #879a90;
                --sage-600: #6a7f74;
                --sage-700: #57685f;
                --sage-800: #48544d;
                --sage-900: #3e4742;
                --sage-950: #252c28;
                --primary: var(--sage-600);
                --primary-dark: var(--sage-700);
                --text-primary: var(--sage-900);
                --text-secondary: var(--sage-700);
                --background: var(--sage-50);
                --surface: #ffffff;
                --border: var(--sage-200);
                --shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
            }

            .eldrex-quotes-container {
                position: relative;
                max-width: 680px;
                margin: 24px auto;
                padding: 32px;
                border-radius: 20px;
                background: var(--surface);
                color: var(--text-primary);
                box-shadow: var(--shadow);
                border: 1px solid var(--border);
                font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
                overflow: hidden;
                backdrop-filter: blur(10px);
            }

            .eldrex-quotes-container::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: 3px;
                background: linear-gradient(90deg, var(--sage-400), var(--sage-600), var(--sage-400));
                background-size: 200% 100%;
                animation: shimmer 3s ease-in-out infinite;
            }

            .eldrex-quote-content {
                position: relative;
                z-index: 2;
            }

            .eldrex-quote-text {
                font-size: 1.25rem;
                line-height: 1.7;
                margin-bottom: 20px;
                text-align: center;
                font-weight: 400;
                position: relative;
                padding: 0 24px;
                opacity: 0;
                transform: translateY(20px);
                transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
            }

            .eldrex-quote-text.visible {
                opacity: 1;
                transform: translateY(0);
            }

            .eldrex-quote-text::before,
            .eldrex-quote-text::after {
                content: '"';
                font-size: 2.5rem;
                color: var(--sage-400);
                position: absolute;
                top: -15px;
                opacity: 0.6;
                font-family: serif;
            }

            .eldrex-quote-text::before {
                left: -5px;
            }

            .eldrex-quote-text::after {
                right: -5px;
            }

            .eldrex-quote-author {
                text-align: center;
                font-style: normal;
                color: var(--text-secondary);
                font-size: 0.95rem;
                margin-top: 16px;
                cursor: pointer;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                padding: 8px 16px;
                border-radius: 20px;
                display: inline-block;
                background: var(--sage-50);
                font-weight: 500;
                border: 1px solid transparent;
            }

            .eldrex-quote-author:hover {
                color: var(--sage-700);
                transform: translateY(-1px);
                background: var(--sage-100);
                border-color: var(--sage-300);
            }

            .eldrex-controls {
                display: flex;
                justify-content: center;
                gap: 12px;
                margin-top: 24px;
                opacity: 0;
                transform: translateY(10px);
                transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1) 0.2s;
                flex-wrap: wrap;
            }

            .eldrex-controls.visible {
                opacity: 1;
                transform: translateY(0);
            }

            .eldrex-btn {
                padding: 10px 20px;
                border: 1.5px solid var(--sage-300);
                border-radius: 16px;
                background: var(--surface);
                color: var(--text-secondary);
                cursor: pointer;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                font-size: 0.875rem;
                font-weight: 500;
                font-family: 'Poppins', sans-serif;
                display: flex;
                align-items: center;
                gap: 8px;
                min-width: 100px;
                justify-content: center;
            }

            .eldrex-btn:hover {
                background: var(--sage-50);
                border-color: var(--sage-500);
                color: var(--sage-700);
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            }

            .eldrex-btn:active {
                transform: translateY(0);
            }

            .eldrex-btn svg {
                width: 16px;
                height: 16px;
                fill: currentColor;
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
                background: var(--sage-300);
                border-radius: 50%;
                opacity: 0;
            }

            @keyframes float {
                0%, 100% { 
                    transform: translateY(0px) rotate(0deg) scale(1);
                    opacity: 0.1;
                }
                50% { 
                    transform: translateY(-30px) rotate(180deg) scale(1.1);
                    opacity: 0.3;
                }
            }

            @keyframes shimmer {
                0%, 100% { background-position: -200% 0; }
                50% { background-position: 200% 0; }
            }

            @keyframes smoothFadeIn {
                0% { 
                    opacity: 0;
                    transform: translateY(20px) scale(0.98);
                }
                100% { 
                    opacity: 1;
                    transform: translateY(0) scale(1);
                }
            }

            @keyframes gentleSlide {
                0% { 
                    opacity: 0;
                    transform: translateX(-30px);
                }
                100% { 
                    opacity: 1;
                    transform: translateX(0);
                }
            }

            @keyframes scaleBlur {
                0% { 
                    opacity: 0;
                    transform: scale(0.9);
                    filter: blur(10px);
                }
                100% { 
                    opacity: 1;
                    transform: scale(1);
                    filter: blur(0);
                }
            }

            .eldrex-smoothFade { animation: smoothFadeIn 0.8s cubic-bezier(0.4, 0, 0.2, 1); }
            .eldrex-gentleSlide { animation: gentleSlide 0.7s cubic-bezier(0.4, 0, 0.2, 1); }
            .eldrex-scaleBlur { animation: scaleBlur 0.6s cubic-bezier(0.4, 0, 0.2, 1); }

            /* Dark theme */
            .eldrex-quotes-container.dark {
                --background: var(--sage-950);
                --surface: var(--sage-900);
                --text-primary: var(--sage-100);
                --text-secondary: var(--sage-300);
                --border: var(--sage-700);
                --shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2);
            }

            /* Responsive Design */
            @media (max-width: 768px) {
                .eldrex-quotes-container {
                    margin: 16px;
                    padding: 24px 20px;
                    border-radius: 16px;
                }
                
                .eldrex-quote-text {
                    font-size: 1.1rem;
                    padding: 0 16px;
                }
                
                .eldrex-quote-text::before,
                .eldrex-quote-text::after {
                    font-size: 2rem;
                    top: -10px;
                }
                
                .eldrex-controls {
                    gap: 8px;
                }
                
                .eldrex-btn {
                    padding: 8px 16px;
                    font-size: 0.8rem;
                    min-width: 85px;
                }
            }

            @media (max-width: 480px) {
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

            @media (prefers-reduced-motion: reduce) {
                .eldrex-quote-text,
                .eldrex-controls,
                .eldrex-quotes-container,
                .eldrex-particle {
                    transition: none;
                    animation: none;
                }
                
                .eldrex-quotes-container::before {
                    animation: none;
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

        container.className = `eldrex-quotes-container ${this.config.theme === 'dark' ? 'dark' : ''} eldrex-initialized`;
        this.applyCustomStyles(container);

        if (this.config.physics) {
            this.createParticles(container);
        }

        this.container = container;
    }

    applyCustomStyles(container) {
        Object.keys(this.config.customStyles).forEach(property => {
            container.style[property] = this.config.customStyles[property];
        });
    }

    createParticles(container) {
        const particles = document.createElement('div');
        particles.className = 'eldrex-particles';

        for (let i = 0; i < 12; i++) {
            const particle = document.createElement('div');
            particle.className = 'eldrex-particle';

            const size = Math.random() * 40 + 5;
            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
            particle.style.left = `${Math.random() * 100}%`;
            particle.style.top = `${Math.random() * 100}%`;
            particle.style.animation = `float ${Math.random() * 4 + 3}s ease-in-out infinite`;
            particle.style.animationDelay = `${Math.random() * 2}s`;
            particle.style.background = `var(--sage-${Math.random() > 0.5 ? '400' : '300'})`;

            particles.appendChild(particle);
        }

        container.appendChild(particles);
    }

    getButtonIcon(type) {
        const icons = {
            previous: '<svg viewBox="0 0 24 24"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>',
            next: '<svg viewBox="0 0 24 24"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>',
            random: '<svg viewBox="0 0 24 24"><path d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z"/></svg>',
            download: '<svg viewBox="0 0 24 24"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>'
        };
        return icons[type] || '';
    }

    renderQuote() {
        if (!this.container) return;

        const quote = this.quotes[this.currentIndex];

        this.container.innerHTML = `
            <div class="eldrex-quote-content">
                <div class="eldrex-quote-text ${this.config.animation ? 'eldrex-' + this.config.animation : ''}">
                    ${quote.text}
                </div>
                ${this.config.showAuthor ? `
                    <div class="eldrex-quote-author" onclick="window.open('https://eldrex.landecs.org', '_blank')" title="Visit Eldrex Landecs">
                        — ${quote.author}
                    </div>
                ` : ''}
                ${this.config.showControls ? `
                    <div class="eldrex-controls">
                        <button class="eldrex-btn" onclick="EldrexQuotesManager.getInstance('${this.containerId}').prevQuote()" title="Previous quote">
                            ${this.getButtonIcon('previous')}
                            <span>Previous</span>
                        </button>
                        <button class="eldrex-btn" onclick="EldrexQuotesManager.getInstance('${this.containerId}').nextQuote()" title="Next quote">
                            ${this.getButtonIcon('next')}
                            <span>Next</span>
                        </button>
                        <button class="eldrex-btn" onclick="EldrexQuotesManager.getInstance('${this.containerId}').randomQuote()" title="Random quote">
                            ${this.getButtonIcon('random')}
                            <span>Random</span>
                        </button>
                        ${this.config.enableDownload ? `
                            <button class="eldrex-btn" onclick="EldrexQuotesManager.getInstance('${this.containerId}').downloadQuote()" title="Download quote">
                                ${this.getButtonIcon('download')}
                                <span>Download</span>
                            </button>
                        ` : ''}
                    </div>
                ` : ''}
            </div>
        `;

        setTimeout(() => {
            const quoteText = this.container.querySelector('.eldrex-quote-text');
            const controls = this.container.querySelector('.eldrex-controls');

            if (quoteText) quoteText.classList.add('visible');
            if (controls) setTimeout(() => controls.classList.add('visible'), 300);
        }, 50);
    }

    nextQuote() {
        this.currentIndex = (this.currentIndex + 1) % this.quotes.length;
        this.renderQuote();
    }

    prevQuote() {
        this.currentIndex = (this.currentIndex - 1 + this.quotes.length) % this.quotes.length;
        this.renderQuote();
    }

    randomQuote() {
        if (this.quotes.length <= 1) return;

        let newIndex;
        do {
            newIndex = Math.floor(Math.random() * this.quotes.length);
        } while (newIndex === this.currentIndex);

        this.currentIndex = newIndex;
        this.renderQuote();
    }

    downloadQuote() {
        const quote = this.quotes[this.currentIndex];
        const content = `"${quote.text}"\n\n— ${quote.author}\n\nFrom Eldrex Quotes Collection\nLandecs · ${new Date().toLocaleDateString()}`;

        const blob = new Blob([content], {
            type: 'text/plain'
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `eldrex-quote-${this.currentIndex + 1}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    startAutoRotation() {
        this.rotationInterval = setInterval(() => {
            this.nextQuote();
        }, this.config.rotationInterval);
    }

    stopAutoRotation() {
        if (this.rotationInterval) {
            clearInterval(this.rotationInterval);
        }
    }

    bindEvents() {
        if (!this.container) return;

        let touchStartX = 0;
        this.container.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        });

        this.container.addEventListener('touchend', (e) => {
            const touchEndX = e.changedTouches[0].screenX;
            const diff = touchStartX - touchEndX;

            if (Math.abs(diff) > 50) {
                if (diff > 0) this.nextQuote();
                else this.prevQuote();
            }
        });
    }

    destroy() {
        this.stopAutoRotation();
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }

        if (this.container) {
            this.container.classList.remove('eldrex-initialized');
            this.container.innerHTML = '';
        }

        this.isInitialized = false;
    }

    getCurrentQuote() {
        return {
            ...this.quotes[this.currentIndex],
            index: this.currentIndex
        };
    }

    getAllQuotes() {
        return [...this.quotes];
    }

    getStats() {
        return {
            totalQuotes: this.quotes.length,
            currentIndex: this.currentIndex,
            uniqueId: this.config.uniqueId,
            autoRotate: this.config.autoRotate,
            theme: this.config.theme,
            controls: this.config.showControls,
            animations: this.config.animation,
            physics: this.config.physics
        };
    }

    addQuote(text, author = "Eldrex Delos Reyes Bula") {
        this.quotes.push({
            text,
            author
        });
        this.renderQuote();
    }

    removeQuote(index) {
        if (index >= 0 && index < this.quotes.length) {
            this.quotes.splice(index, 1);
            this.currentIndex = Math.min(this.currentIndex, this.quotes.length - 1);
            this.renderQuote();
        }
    }

    toggleTheme() {
        this.config.theme = this.config.theme === 'light' ? 'dark' : 'light';
        this.container.classList.toggle('dark', this.config.theme === 'dark');
    }
}

// Manager class to handle multiple instances
class EldrexQuotesManager {
    constructor() {
        this.instances = new Map();
        this.globalStylesInjected = false;
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

        // Create new instance
        const instance = new EldrexQuotes(containerId, config);
        this.instances.set(containerId, instance);

        return instance;
    }

    injectGlobalStyles() {
        if (document.getElementById('eldrex-quotes-styles')) return;

        const styles = `
            /* Global keyboard events */
            body.eldrex-quotes-active {
                position: relative;
            }
            
            body.eldrex-quotes-active:focus {
                outline: none;
            }
        `;

        const styleSheet = document.createElement('style');
        styleSheet.id = 'eldrex-quotes-global-styles';
        styleSheet.textContent = styles;
        document.head.appendChild(styleSheet);

        // Add global keyboard listener
        document.addEventListener('keydown', (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

            // Get all active instances
            const instances = Array.from(this.instances.values());
            if (instances.length === 0) return;

            // Apply to the first instance (or you can modify this logic)
            const instance = instances[0];
            
            if (e.key === 'ArrowLeft') instance.prevQuote();
            if (e.key === 'ArrowRight') instance.nextQuote();
            if (e.key === ' ' || e.key === 'r') instance.randomQuote();
            if (e.key === 'd' && instance.config.enableDownload) instance.downloadQuote();
        });

        // Handle page visibility
        document.addEventListener('visibilitychange', () => {
            const instances = Array.from(this.instances.values());
            instances.forEach(instance => {
                if (document.hidden) {
                    instance.stopAutoRotation();
                } else if (instance.config.autoRotate) {
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
    }

    getAllInstances() {
        return this.instances;
    }
}

const contentData = {
    quotes: [
        // ... (your quotes array remains exactly the same)
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
            theme: container.getAttribute('data-theme') || 'light',
            autoRotate: container.getAttribute('data-auto-rotate') !== 'false',
            showAuthor: container.getAttribute('data-show-author') !== 'false',
            showControls: container.getAttribute('data-show-controls') !== 'false'
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
        initEldrexQuotes,
        contentData,
        eldrexQuotesManager
    };
}

// Global access
window.EldrexQuotesManager = EldrexQuotesManager;
window.initEldrexQuotes = initEldrexQuotes;
window.eldrexQuotesManager = eldrexQuotesManager;