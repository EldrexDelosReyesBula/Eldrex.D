
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all components with enhanced performance
    initPremiumBottomSheets();
    initEnhancedLinkAnimations();
    initContentProtection();
    initPerformanceOptimizations();
    initTouchOptimizations();

    setTimeout(() => {
        initPremiumEntranceAnimations();
    }, 100);
});

function initPremiumEntranceAnimations() {
    const profilePicture = document.getElementById('profile-picture');
    if (profilePicture) {
        profilePicture.classList.add('loaded');

        if (typeof gsap !== 'undefined') {
            gsap.fromTo(profilePicture, {
                scale: 0.8,
                opacity: 0,
                rotationY: -15
            }, {
                scale: 1,
                opacity: 1,
                rotationY: 0,
                duration: 1.2,
                ease: "elastic.out(1.2, 0.5)",
                clearProps: "all"
            });
        }
    }

    // Perfectly smooth link animations without shake
    initStaggeredLinkAnimations();
}

// Fixed Staggered Link Animations - No More Shaking
function initStaggeredLinkAnimations() {
    const linkItems = document.querySelectorAll('.link-item');

    linkItems.forEach((item, index) => {
        // Reset any conflicting transforms
        item.style.transform = 'translate3d(0, 0, 0)';
        item.style.willChange = 'transform, opacity';

        if (typeof gsap !== 'undefined') {
            // Use proper 3D transforms for better performance
            gsap.fromTo(item, {
                opacity: 0,
                y: 50,
                scale: 0.95,
                rotationX: 5
            }, {
                opacity: 1,
                y: 0,
                scale: 1,
                rotationX: 0,
                duration: 0.8,
                delay: index * 0.1,
                ease: "power3.out",
                clearProps: "all",
                overwrite: "auto"
            });
        } else {
            // Fallback with proper timing
            setTimeout(() => {
                item.style.transition = 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
                item.style.opacity = '1';
                item.style.transform = 'translateY(0) scale(1)';
            }, index * 100);
        }
    });
}

// Enhanced Link Interactions - Smooth Hover Effects
function initEnhancedLinkAnimations() {
    const linkItems = document.querySelectorAll('.link-item');

    linkItems.forEach(item => {
        let hoverAnimation = null;

        // Mouse enter with perfect physics
        item.addEventListener('mouseenter', function(e) {
            if (typeof gsap !== 'undefined') {
                if (hoverAnimation) hoverAnimation.kill();

                hoverAnimation = gsap.to(this, {
                    y: -4,
                    scale: 1.02,
                    duration: 0.4,
                    ease: "back.out(1.7)",
                    overwrite: "auto"
                });

                // Enhanced icon animation
                const icon = this.querySelector('.link-icon');
                if (icon) {
                    gsap.to(icon, {
                        scale: 1.1,
                        duration: 0.3,
                        ease: "power2.out"
                    });
                }
            }
        });

        // Mouse leave with smooth return
        item.addEventListener('mouseleave', function(e) {
            if (typeof gsap !== 'undefined') {
                if (hoverAnimation) hoverAnimation.kill();

                hoverAnimation = gsap.to(this, {
                    y: 0,
                    scale: 1,
                    duration: 0.5,
                    ease: "power3.out",
                    overwrite: "auto"
                });

                // Reset icon
                const icon = this.querySelector('.link-icon');
                if (icon) {
                    gsap.to(icon, {
                        scale: 1,
                        duration: 0.3,
                        ease: "power2.out"
                    });
                }
            }
        });

        // Click feedback with premium feel
        item.addEventListener('click', function(e) {
            if (typeof gsap !== 'undefined') {
                gsap.to(this, {
                    scale: 0.98,
                    duration: 0.1,
                    yoyo: true,
                    repeat: 1,
                    ease: "power2.inOut"
                });
            }
        });
    });
}

// Premium Bottom Sheets with Flawless Physics
function initPremiumBottomSheets() {
    const profilePicture = document.getElementById('profile-picture');
    const profileSheet = document.getElementById('profile-sheet');
    const overlay = document.getElementById('overlay');
    const closeButtons = document.querySelectorAll('.close-sheet');

    let activeSheet = null;
    let isAnimating = false;

    // Enhanced profile sheet opening
    if (profilePicture && profileSheet) {
        profilePicture.addEventListener('click', function(e) {
            if (isAnimating) return;
            openPremiumSheet(profileSheet);
        });
    }

    // Enhanced close functionality
    function closeActiveSheet() {
        if (!activeSheet || isAnimating) return;

        isAnimating = true;

        if (typeof gsap !== 'undefined') {
            const timeline = gsap.timeline({
                onComplete: () => {
                    activeSheet.classList.remove('active');
                    overlay.classList.remove('active');
                    document.body.style.overflow = '';
                    activeSheet = null;
                    isAnimating = false;
                }
            });

            timeline.to(activeSheet, {
                y: '100%',
                duration: 0.5,
                ease: "power3.inOut"
            });

            timeline.to(overlay, {
                opacity: 0,
                duration: 0.3,
                ease: "power2.out"
            }, 0);
        } else {
            // Fallback
            activeSheet.classList.remove('active');
            overlay.classList.remove('active');
            document.body.style.overflow = '';
            activeSheet = null;
            isAnimating = false;
        }
    }

    // Close buttons
    if (closeButtons) {
        closeButtons.forEach(button => {
            button.addEventListener('click', function(e) {
                e.stopPropagation();
                closeActiveSheet();
            });
        });
    }

    // Close with overlay click
    if (overlay) {
        overlay.addEventListener('click', function() {
            closeActiveSheet();
        });
    }

    // Prevent closing when clicking inside sheets
    if (profileSheet) {
        profileSheet.addEventListener('click', function(e) {
            e.stopPropagation();
        });
    }

    // Premium sheet opening with flawless animation
    function openPremiumSheet(sheetElement) {
        isAnimating = true;

        sheetElement.classList.add('active');
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
        activeSheet = sheetElement;

        if (typeof gsap !== 'undefined') {
            // Reset position
            gsap.set(sheetElement, { y: '100%', opacity: 1 });

            const timeline = gsap.timeline({
                onComplete: () => {
                    isAnimating = false;
                }
            });

            // Sheet entrance with premium easing
            timeline.to(sheetElement, {
                y: '0%',
                duration: 0.7,
                ease: "power3.out"
            }, 0);

            // Overlay fade in
            timeline.fromTo(overlay, {
                opacity: 0
            }, {
                opacity: 1,
                duration: 0.4,
                ease: "power2.out"
            }, 0);

            // Content animations
            const contentElements = sheetElement.querySelectorAll('.profile-card, .profile-avatar, .profile-info, .more-about-btn');
            if (contentElements.length > 0) {
                timeline.fromTo(contentElements, {
                    y: 20,
                    opacity: 0
                }, {
                    y: 0,
                    opacity: 1,
                    duration: 0.6,
                    stagger: 0.1,
                    ease: "power2.out"
                }, 0.3);
            }
        } else {
            // Fallback
            sheetElement.style.transform = 'translateY(0)';
            overlay.style.opacity = '1';
            isAnimating = false;
        }
    }
}

// Enhanced Content Protection
function initContentProtection() {
    // Enhanced anti-copy CSS injection
    const antiCopyCSS = `
        body {
            user-select: none;
            -webkit-user-select: none;
            -moz-user-select: none;
            -ms-user-select: none;
        }
        
        img {
            pointer-events: none;
            -webkit-touch-callout: none;
            -webkit-user-drag: none;
        }
        
        /* Selection prevention */
        ::selection {
            background: transparent;
        }
        ::-moz-selection {
            background: transparent;
        }
    `;

    const antiCopyStyle = document.createElement('style');
    antiCopyStyle.textContent = antiCopyCSS;
    document.head.appendChild(antiCopyStyle);

    // Enhanced event listeners
    document.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        showProtectionMessage('Action Restricted');
        return false;
    });

    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey && (e.key === 'c' || e.key === 'C' || e.key === 'x' || e.key === 'X' || e.key === 'a' || e.key === 'A')) ||
            e.key === 'F12' ||
            (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j'))) {
            e.preventDefault();
            showProtectionMessage('This action is restricted');
        }
    });

    function showProtectionMessage(text) {
        // Remove existing messages
        document.querySelectorAll('.protection-message').forEach(msg => msg.remove());

        const message = document.createElement('div');
        message.className = 'protection-message';
        message.textContent = text;
        message.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            color: white;
            padding: 12px 20px;
            border-radius: 25px;
            z-index: 10000;
            font-size: 14px;
            font-weight: 500;
            background: rgba(239, 68, 68, 0.9);
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
            transform: translateX(100px);
            opacity: 0;
        `;
        document.body.appendChild(message);

        if (typeof gsap !== 'undefined') {
            gsap.to(message, {
                x: 0,
                opacity: 1,
                duration: 0.5,
                ease: "back.out(1.2)"
            });

            setTimeout(() => {
                gsap.to(message, {
                    x: 100,
                    opacity: 0,
                    duration: 0.4,
                    onComplete: () => {
                        if (message.parentNode) {
                            message.remove();
                        }
                    }
                });
            }, 2000);
        } else {
            setTimeout(() => {
                if (message.parentNode) {
                    message.remove();
                }
            }, 2000);
        }
    }
}

// Performance Optimizations for Buttery Smooth Experience
function initPerformanceOptimizations() {
    // Use passive event listeners for better scrolling performance
    const passiveOptions = { passive: true };

    // Optimize scroll performance
    window.addEventListener('scroll', () => {}, passiveOptions);

    // Optimize touch events
    document.addEventListener('touchstart', () => {}, passiveOptions);
    document.addEventListener('touchmove', () => {}, passiveOptions);

    // Reduce layout thrashing
    let scheduledAnimationFrame = false;

    function optimizedScrollHandler() {
        if (!scheduledAnimationFrame) {
            scheduledAnimationFrame = true;
            requestAnimationFrame(() => {
                // Perform scroll-related calculations here
                scheduledAnimationFrame = false;
            });
        }
    }

    window.addEventListener('scroll', optimizedScrollHandler, passiveOptions);

    // Optimize GSAP if available
    if (typeof gsap !== 'undefined') {
        gsap.ticker.lagSmoothing(1000, 16);
        gsap.ticker.add(optimizedTickHandler);
    }

    function optimizedTickHandler() {
        // GSAP animation optimizations
    }

    // Handle page visibility changes
    document.addEventListener('visibilitychange', function() {
        if (document.hidden) {
            // Reduce animations when page is not visible
            if (typeof gsap !== 'undefined') {
                gsap.ticker.lagSmoothing(0);
            }
        } else {
            // Restore when page becomes visible
            if (typeof gsap !== 'undefined') {
                gsap.ticker.lagSmoothing(1000, 16);
            }
        }
    });
}

// Touch Device Optimizations
function initTouchOptimizations() {
    // Add touch-specific styles
    const touchStyles = `
        @media (hover: none) and (pointer: coarse) {
            .link-item, .member-card {
                min-height: 44px;
                min-width: 44px;
            }
            
            .haptic-link:active {
                transform: scale(0.96);
                transition: transform 0.1s ease;
            }
            
            /* Prevent zoom on double-tap */
            button, .link-item, .member-card {
                touch-action: manipulation;
            }
            
            /* Enhanced touch feedback */
            .link-item:active {
                background: rgba(106, 127, 116, 0.1);
                transform: scale(0.98);
            }
        }
        
        /* Reduce motion for users who prefer it */
        @media (prefers-reduced-motion: reduce) {
            *, *::before, *::after {
                animation-duration: 0.01ms !important;
                animation-iteration-count: 1 !important;
                transition-duration: 0.01ms !important;
            }
        }
    `;

    const styleSheet = document.createElement('style');
    styleSheet.textContent = touchStyles;
    document.head.appendChild(styleSheet);
}

// Enhanced Image Loading with Error Handling
function initImageOptimizations() {
    const images = document.querySelectorAll('img');

    images.forEach(img => {
        // Add loading attribute for native lazy loading
        if (!img.getAttribute('loading')) {
            img.setAttribute('loading', 'lazy');
        }

        // Handle image loading errors
        img.addEventListener('error', function() {
            console.warn('Image failed to load:', this.src);
            this.style.opacity = '0.5';
        });

        // Handle successful image loads
        img.addEventListener('load', function() {
            this.style.opacity = '1';
        });
    });
}

// Initialize image optimizations
initImageOptimizations();

// Enhanced Resize Handler with Debouncing
let resizeTimeout;
window.addEventListener('resize', function() {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        // Handle resize operations here
        console.log('Window resized - optimizing layout');
    }, 250);
});

// Global Error Handling for Robustness
window.addEventListener('error', function(e) {
    console.error('Global error caught:', e.error);
});

// Promise rejection handling
window.addEventListener('unhandledrejection', function(e) {
    console.warn('Unhandled promise rejection:', e.reason);
});

// Cleanup on page unload
window.addEventListener('beforeunload', function() {
    // Clean up any ongoing animations
    if (typeof gsap !== 'undefined') {
        gsap.globalTimeline.clear();
    }

    // Remove event listeners
    const overlay = document.getElementById('overlay');
    if (overlay && overlay._cleanup) {
        overlay._cleanup();
    }
});

// Export functions for potential module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initPremiumBottomSheets,
        initEnhancedLinkAnimations,
        initStaggeredLinkAnimations,
        initPerformanceOptimizations
    };
}