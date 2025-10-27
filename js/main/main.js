document.addEventListener('DOMContentLoaded', function() {
    initPremiumPhysicsEngine();
    initPremiumBottomSheets();
    initEnhancedLinkAnimations();
    initContentProtection();
    initPerformanceOptimizations();
    initTouchOptimizations();

    setTimeout(() => {
        initPremiumEntranceAnimations();
    }, 150);
});

function initPremiumPhysicsEngine() {
    if (typeof gsap !== 'undefined') {
        gsap.config({
            nullTargetWarn: false,
            force3D: true
        });
        gsap.ticker.lagSmoothing(1000, 16);
        
        // Register custom physics easing
        gsap.registerEase("springSlowReturn", function(progress) {
            return 1 - Math.pow(1 - progress, 3) * Math.cos(progress * Math.PI * 2.5);
        });
        
        gsap.registerEase("physicsRecoil", function(progress) {
            if (progress < 0.3) {
                return progress * (1 / 0.3);
            } else {
                return 1 - Math.pow(1 - ((progress - 0.3) * (1 / 0.7)), 2) * 0.3;
            }
        });
    }
}

function initPremiumEntranceAnimations() {
    const profilePicture = document.getElementById('profile-picture');
    const linkItems = document.querySelectorAll('.link-item');
    
    const masterTimeline = gsap.timeline();
    
    if (profilePicture) {
        profilePicture.classList.add('loaded');
        
        masterTimeline.fromTo(profilePicture, {
            scale: 0.8,
            opacity: 0,
            rotationY: -15,
            rotationX: 5,
            z: -50,
            filter: "blur(12px)"
        }, {
            scale: 1,
            opacity: 1,
            rotationY: 0,
            rotationX: 0,
            z: 0,
            filter: "blur(0px)",
            duration: 1.6,
            ease: "elastic.out(1.2, 0.4)",
            clearProps: "all"
        }, 0);
    }
    
    if (linkItems.length > 0) {
        // Sort link items from top to bottom
        const sortedLinkItems = Array.from(linkItems).sort((a, b) => {
            const rectA = a.getBoundingClientRect();
            const rectB = b.getBoundingClientRect();
            return rectA.top - rectB.top;
        });
        
        masterTimeline.fromTo(sortedLinkItems, {
            opacity: 0,
            y: 80,
            scale: 0.85,
            rotationX: -10,
            z: -30
        }, {
            opacity: 1,
            y: 0,
            scale: 1,
            rotationX: 0,
            z: 0,
            duration: 1.1,
            stagger: {
                amount: 0.8,
                from: "start",
                ease: "power2.out"
            },
            ease: "back.out(1.4)",
            clearProps: "all"
        }, 0.4);
    }
}

function initEnhancedLinkAnimations() {
    const linkItems = document.querySelectorAll('.link-item');
    const profilePicture = document.getElementById('profile-picture');
    
    let waveAnimationActive = false;
    let profileExplosionActive = false;
    let scrollAnimationActive = false;
    
    // Initialize physics properties for each link item
    linkItems.forEach((item, index) => {
        item._originalIndex = index;
        item._isAnimating = false;
        item._baseY = 0;
        item._physics = {
            velocity: 0,
            friction: 0.92,
            spring: 0.4
        };
        
        gsap.set(item, {
            opacity: 1,
            scale: 1,
            rotation: 0,
            rotationX: 0,
            rotationY: 0,
            x: 0,
            y: 0,
            z: 0,
            transformStyle: "preserve-3d"
        });
    });
    
    // Enhanced scroll physics
    let lastScrollY = window.scrollY;
    let scrollVelocity = 0;
    let lastScrollTime = Date.now();
    
    function handleAdvancedScrollPhysics() {
        if (waveAnimationActive || profileExplosionActive) return;
        
        const currentScrollY = window.scrollY;
        const currentTime = Date.now();
        const deltaTime = Math.min(currentTime - lastScrollTime, 50);
        
        // Calculate scroll velocity
        scrollVelocity = (currentScrollY - lastScrollY) / (deltaTime / 16);
        const scrollStrength = Math.min(Math.abs(scrollVelocity) * 0.15, 4);
        
        if (Math.abs(scrollVelocity) > 0.5) {
            scrollAnimationActive = true;
            
            const scrollDirection = scrollVelocity > 0 ? 1 : -1;
            const pushStrength = scrollStrength * 0.4;
            
            linkItems.forEach((item, index) => {
                const delay = index * 0.008;
                const individualStrength = pushStrength * (1 - (index / linkItems.length) * 0.4);
                const pushDistance = scrollDirection * individualStrength;
                
                // Apply push with physics
                gsap.to(item, {
                    y: pushDistance,
                    rotationX: scrollDirection * individualStrength * 0.5,
                    duration: 0.25,
                    delay: delay,
                    ease: "power2.out",
                    overwrite: "auto",
                    onComplete: () => {
                        if (index === linkItems.length - 1) {
                            startSlowReturnPhysics();
                        }
                    }
                });
            });
        }
        
        lastScrollY = currentScrollY;
        lastScrollTime = currentTime;
    }
    
    function startSlowReturnPhysics() {
        if (waveAnimationActive || profileExplosionActive) return;
        
        linkItems.forEach((item, index) => {
            const returnDelay = index * 0.02;
            
            gsap.to(item, {
                y: 0,
                rotationX: 0,
                duration: 1.2,
                delay: returnDelay,
                ease: "elastic.out(1.1, 0.6)",
                overwrite: "auto",
                onComplete: () => {
                    if (index === linkItems.length - 1) {
                        scrollAnimationActive = false;
                    }
                }
            });
        });
    }
    
    let scrollThrottleTimeout;
    window.addEventListener('scroll', function() {
        if (!scrollThrottleTimeout) {
            scrollThrottleTimeout = setTimeout(() => {
                handleAdvancedScrollPhysics();
                scrollThrottleTimeout = null;
            }, 10);
        }
    });
    
    // Enhanced Profile Picture 3D Long Press
    if (profilePicture) {
        let profileLongPressTimer;
        let profilePressStartTime;
        
        profilePicture.style.transformStyle = "preserve-3d";
        
        profilePicture.addEventListener('mousedown', function(e) {
            profilePressStartTime = Date.now();
            profileLongPressTimer = setTimeout(() => {
                create3DProfileExplosionEffect();
            }, 600);
            
            // 3D press effect
            gsap.to(this, {
                scale: 0.92,
                rotationY: 5,
                rotationX: -3,
                z: -10,
                duration: 0.4,
                ease: "power2.out"
            });
        });
        
        profilePicture.addEventListener('touchstart', function(e) {
            profilePressStartTime = Date.now();
            profileLongPressTimer = setTimeout(() => {
                create3DProfileExplosionEffect();
            }, 600);
            
            gsap.to(this, {
                scale: 0.94,
                rotationY: 3,
                rotationX: -2,
                z: -8,
                duration: 0.3,
                ease: "power2.out"
            });
        });
        
        const clearProfilePress = () => {
            clearTimeout(profileLongPressTimer);
            
            if (!profileExplosionActive) {
                const pressDuration = Date.now() - profilePressStartTime;
                const intensity = Math.min(pressDuration / 1000, 1);
                
                gsap.to(profilePicture, {
                    scale: 1,
                    rotationY: 0,
                    rotationX: 0,
                    z: 0,
                    duration: 0.8 + (intensity * 0.4),
                    ease: "elastic.out(1.3, 0.5)"
                });
            }
        };
        
        profilePicture.addEventListener('mouseup', clearProfilePress);
        profilePicture.addEventListener('mouseleave', clearProfilePress);
        profilePicture.addEventListener('touchend', clearProfilePress);
        profilePicture.addEventListener('touchcancel', clearProfilePress);
    }
    
    function create3DProfileExplosionEffect() {
        if (profileExplosionActive || waveAnimationActive) return;
        profileExplosionActive = true;
        
        const allItems = Array.from(document.querySelectorAll('.link-item'));
        
        // Enhanced 3D profile animation
        if (profilePicture) {
            gsap.timeline()
                .to(profilePicture, {
                    scale: 1.4,
                    rotationY: 180,
                    rotationX: 15,
                    z: 20,
                    duration: 0.4,
                    ease: "power2.inOut"
                })
                .to(profilePicture, {
                    scale: 1,
                    rotationY: 360,
                    rotationX: 0,
                    z: 0,
                    duration: 0.9,
                    ease: "elastic.out(1.6, 0.7)"
                });
        }
        
        // Shockwave effect - push items downward with 3D depth
        allItems.forEach((item, index) => {
            const distanceFromCenter = Math.abs(index - Math.floor(allItems.length / 2));
            const explosionStrength = Math.max(0.4, 1 - distanceFromCenter * 0.15);
            const explosionDelay = distanceFromCenter * 0.04;
            
            // Downward push with slight 3D perspective
            gsap.to(item, {
                y: 25 * explosionStrength,
                rotationX: 8 * explosionStrength,
                scale: 1 - (explosionStrength * 0.1),
                z: -15 * explosionStrength,
                duration: 0.5,
                delay: explosionDelay,
                ease: "back.out(1.8)",
                overwrite: "auto"
            });
        });
        
        // Slow return with physics
        setTimeout(() => {
            allItems.forEach((item, index) => {
                const returnDelay = index * 0.025;
                
                gsap.to(item, {
                    y: 0,
                    rotationX: 0,
                    scale: 1,
                    z: 0,
                    duration: 1.4,
                    delay: returnDelay,
                    ease: "elastic.out(1.1, 0.5)",
                    overwrite: "auto",
                    onComplete: () => {
                        if (index === allItems.length - 1) {
                            profileExplosionActive = false;
                        }
                    }
                });
            });
        }, 700);
    }
    
    // Enhanced Link Item Physics
    linkItems.forEach((item, index) => {
        let hoverTimeline = null;
        let pressTimeline = null;
        let longPressTimer = null;
        
        item.addEventListener('mouseenter', function(e) {
            if (waveAnimationActive || profileExplosionActive || scrollAnimationActive || this._isAnimating) return;
            
            if (hoverTimeline) hoverTimeline.kill();
            
            this._isAnimating = true;
            hoverTimeline = gsap.timeline({
                onComplete: () => { this._isAnimating = false; }
            })
            .to(this, {
                y: -8,
                scale: 1.04,
                rotationX: -2,
                z: 5,
                duration: 0.6,
                ease: "back.out(1.9)",
                overwrite: "auto"
            })
            .to(this.querySelector('.link-icon'), {
                scale: 1.2,
                rotationZ: 2,
                duration: 0.4,
                ease: "power2.out"
            }, 0);
        });
        
        item.addEventListener('mouseleave', function(e) {
            if (waveAnimationActive || profileExplosionActive || scrollAnimationActive || this._isAnimating) return;
            
            if (hoverTimeline) hoverTimeline.kill();
            
            this._isAnimating = true;
            hoverTimeline = gsap.timeline({
                onComplete: () => { this._isAnimating = false; }
            })
            .to(this, {
                y: 0,
                scale: 1,
                rotationX: 0,
                z: 0,
                duration: 1.2,
                ease: "elastic.out(1.1, 0.6)",
                overwrite: "auto"
            })
            .to(this.querySelector('.link-icon'), {
                scale: 1,
                rotationZ: 0,
                duration: 0.6,
                ease: "power2.out"
            }, 0);
        });
        
        item.addEventListener('mousedown', function(e) {
            if (waveAnimationActive || profileExplosionActive || scrollAnimationActive) return;
            clearTimeout(longPressTimer);
            longPressTimer = setTimeout(() => {
                createPhysicsWaveEffect(this, 'mouse', true);
            }, 400);
            
            // 3D press effect
            gsap.to(this, {
                scale: 0.94,
                y: 3,
                rotationX: 1,
                z: -5,
                duration: 0.15,
                ease: "power2.in"
            });
        });
        
        item.addEventListener('touchstart', function(e) {
            if (waveAnimationActive || profileExplosionActive || scrollAnimationActive) return;
            clearTimeout(longPressTimer);
            longPressTimer = setTimeout(() => {
                createPhysicsWaveEffect(this, 'touch', true);
            }, 400);
            
            gsap.to(this, {
                scale: 0.96,
                rotationX: 0.5,
                z: -3,
                duration: 0.2,
                ease: "power2.out"
            });
        });
        
        const clearPress = () => {
            clearTimeout(longPressTimer);
            
            if (!waveAnimationActive && !profileExplosionActive && !scrollAnimationActive) {
                gsap.to(item, {
                    scale: 1,
                    y: 0,
                    rotationX: 0,
                    z: 0,
                    duration: 0.8,
                    ease: "elastic.out(1.2, 0.6)"
                });
            }
        };
        
        item.addEventListener('mouseup', clearPress);
        item.addEventListener('mouseleave', clearPress);
        item.addEventListener('touchend', clearPress);
        item.addEventListener('touchcancel', clearPress);
    });
    
    function createPhysicsWaveEffect(originItem, inputType, isLongPress = false) {
        if (waveAnimationActive || profileExplosionActive || scrollAnimationActive) return;
        waveAnimationActive = true;
        
        const allItems = Array.from(document.querySelectorAll('.link-item'));
        const originIndex = originItem._originalIndex;
        const totalItems = allItems.length;
        const waveStrength = isLongPress ? 1.4 : 1.0;
        const waveDuration = isLongPress ? 1.0 : 0.7;
        
        // Clear any existing animations
        allItems.forEach(item => {
            gsap.killTweensOf(item);
            gsap.set(item, {
                opacity: 1,
                display: 'flex',
                visibility: 'visible'
            });
            item._isAnimating = true;
        });
        
        // Enhanced origin item animation with 3D
        gsap.to(originItem, {
            scale: 0.88,
            y: 8,
            rotationX: 4,
            z: -8,
            duration: 0.25,
            ease: "power2.out",
            overwrite: "auto"
        });
        
        // Physics-based wave propagation
        allItems.forEach((item, index) => {
            if (item === originItem) return;
            
            const distance = Math.abs(index - originIndex);
            const maxDistance = Math.max(originIndex, totalItems - 1 - originIndex);
            const normalizedDistance = distance / maxDistance;
            const waveDelay = distance * 0.04;
            const wavePower = waveStrength * (1 - normalizedDistance * 0.6);
            
            const direction = index < originIndex ? -1 : 1;
            const pushDistance = 22 * wavePower * direction;
            
            if (wavePower > 0.05) {
                gsap.to(item, {
                    y: pushDistance,
                    x: (Math.random() - 0.5) * 6 * wavePower,
                    rotationX: 3 * wavePower * direction,
                    scale: 1 + wavePower * 0.08,
                    z: -10 * wavePower,
                    duration: waveDuration * 0.7,
                    delay: waveDelay,
                    ease: "back.out(1.7)",
                    overwrite: "auto",
                    onComplete: () => {
                        item._isAnimating = false;
                    }
                });
            }
        });
        
        // Enhanced slow return with physics
        setTimeout(() => {
            allItems.forEach((item, index) => {
                const distance = Math.abs(index - originIndex);
                const returnDelay = distance * 0.012;
                
                gsap.to(item, {
                    y: 0,
                    x: 0,
                    rotationX: 0,
                    scale: 1,
                    z: 0,
                    duration: 1.6,
                    delay: returnDelay,
                    ease: "elastic.out(1.1, 0.5)",
                    overwrite: "auto",
                    onComplete: () => {
                        if (index === allItems.length - 1) {
                            waveAnimationActive = false;
                        }
                        item._isAnimating = false;
                    }
                });
            });
        }, waveDuration * 600);
    }
}

function initPremiumBottomSheets() {
    const profilePicture = document.getElementById('profile-picture');
    const profileSheet = document.getElementById('profile-sheet');
    const overlay = document.getElementById('overlay');
    const closeButtons = document.querySelectorAll('.close-sheet');
    const linkItems = document.querySelectorAll('.link-item');
    
    let activeSheet = null;
    let isAnimating = false;
    
    function createSheetOpeningPhysics() {
        if (linkItems.length > 0) {
            // Enhanced physics push effect
            gsap.to(linkItems, {
                y: -15,
                scale: 0.98,
                rotationX: 3,
                z: -20,
                opacity: 0.9,
                duration: 0.5,
                ease: "power2.out",
                stagger: {
                    amount: 0.3,
                    from: "start"
                },
                overwrite: "auto"
            });
        }
    }
    
    function resetSheetClosingPhysics() {
        if (linkItems.length > 0) {
            gsap.to(linkItems, {
                y: 0,
                x: 0,
                scale: 1,
                rotationX: 0,
                rotationY: 0,
                z: 0,
                opacity: 1,
                duration: 1.0,
                ease: "elastic.out(1.1, 0.6)",
                stagger: {
                    amount: 0.4,
                    from: "end"
                },
                overwrite: "auto"
            });
        }
    }
    
    if (profilePicture && profileSheet) {
        profilePicture.addEventListener('click', function(e) {
            if (isAnimating) return;
            openPremiumPhysicsSheet(profileSheet);
        });
    }
    
    function openPremiumPhysicsSheet(sheetElement) {
        isAnimating = true;
        
        createSheetOpeningPhysics();
        
        sheetElement.classList.add('active');
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
        activeSheet = sheetElement;
        
        if (typeof gsap !== 'undefined') {
            gsap.set(sheetElement, { 
                y: '100%', 
                opacity: 1,
                scale: 1,
                rotationX: 5
            });
            gsap.set(overlay, { opacity: 0 });
            
            const masterTimeline = gsap.timeline({
                onComplete: () => {
                    isAnimating = false;
                }
            });
            
            // Overlay with depth
            masterTimeline.to(overlay, {
                opacity: 1,
                duration: 0.5,
                ease: "power2.out"
            }, 0);
            
            // Sheet entrance with 3D perspective
            masterTimeline.to(sheetElement, {
                y: '0%',
                rotationX: 0,
                duration: 0.6,
                ease: "power2.out"
            }, 0.1);
            
            // Staggered content entrance with physics
            const contentElements = sheetElement.querySelectorAll('.profile-card, .profile-avatar, .profile-info, .more-about-btn');
            if (contentElements.length > 0) {
                masterTimeline.fromTo(contentElements, {
                    y: 30,
                    opacity: 0,
                    rotationX: -10,
                    z: -30
                }, {
                    y: 0,
                    opacity: 1,
                    rotationX: 0,
                    z: 0,
                    duration: 0.6,
                    stagger: {
                        amount: 0.3,
                        ease: "back.out(1.5)"
                    },
                    ease: "power2.out"
                }, 0.3);
            }
        } else {
            sheetElement.style.transform = 'translateY(0)';
            overlay.style.opacity = '1';
            isAnimating = false;
        }
    }
    
    function closeActiveSheet() {
        if (!activeSheet || isAnimating) return;
        
        isAnimating = true;
        
        resetSheetClosingPhysics();
        
        if (typeof gsap !== 'undefined') {
            const closeTimeline = gsap.timeline({
                onComplete: () => {
                    activeSheet.classList.remove('active');
                    overlay.classList.remove('active');
                    document.body.style.overflow = '';
                    activeSheet = null;
                    isAnimating = false;
                }
            });
            
            // Sheet exit with physics
            closeTimeline.to(activeSheet, {
                y: '100%',
                rotationX: 8,
                duration: 0.5,
                ease: "power2.inOut"
            }, 0);
            
            // Overlay fade
            closeTimeline.to(overlay, {
                opacity: 0,
                duration: 0.4,
                ease: "power2.out"
            }, 0);
        } else {
            activeSheet.classList.remove('active');
            overlay.classList.remove('active');
            document.body.style.overflow = '';
            activeSheet = null;
            isAnimating = false;
        }
    }
    
    if (closeButtons) {
        closeButtons.forEach(button => {
            button.addEventListener('click', function(e) {
                e.stopPropagation();
                closeActiveSheet();
            });
        });
    }
    
    if (overlay) {
        overlay.addEventListener('click', function() {
            closeActiveSheet();
        });
    }
    
    if (profileSheet) {
        profileSheet.addEventListener('click', function(e) {
            e.stopPropagation();
        });
    }
    
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && activeSheet) {
            closeActiveSheet();
        }
    });
    
    window.resetLinkItems = resetSheetClosingPhysics;
}

function initContentProtection() {
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
    
    document.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        return false;
    });
    
    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey && (e.key === 'c' || e.key === 'C' || e.key === 'x' || e.key === 'X' || e.key === 'a' || e.key === 'A')) ||
            e.key === 'F12' ||
            (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j'))) {
            e.preventDefault();
        }
    });
}

function initPerformanceOptimizations() {
    const passiveOptions = { passive: true };
    
    window.addEventListener('scroll', () => {}, passiveOptions);
    document.addEventListener('touchstart', () => {}, passiveOptions);
    document.addEventListener('touchmove', () => {}, passiveOptions);
    document.addEventListener('visibilitychange', function() {
        if (document.hidden) {
            if (typeof gsap !== 'undefined') {
                gsap.ticker.lagSmoothing(0);
            }
        } else {
            if (typeof gsap !== 'undefined') {
                gsap.ticker.lagSmoothing(1000, 16);
            }
        }
    });
}

function initTouchOptimizations() {
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
            
            button, .link-item, .member-card {
                touch-action: manipulation;
            }
            
            .link-item:active {
                background: rgba(106, 127, 116, 0.1);
                transform: scale(0.98);
            }
        }
        
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

function initImageOptimizations() {
    const images = document.querySelectorAll('img');
    
    images.forEach(img => {
        if (!img.getAttribute('loading')) {
            img.setAttribute('loading', 'lazy');
        }
        
        img.addEventListener('error', function() {
            console.warn('Image failed to load:', this.src);
            this.style.opacity = '0.5';
        });
        
        img.addEventListener('load', function() {
            this.style.opacity = '1';
        });
    });
}

// Initialize image optimizations
initImageOptimizations();

// Enhanced resize handling
let resizeTimeout;
window.addEventListener('resize', function() {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        console.log('Window resized - optimizing physics layout');
    }, 250);
});

// Error handling
window.addEventListener('error', function(e) {
    console.error('Global physics error caught:', e.error);
});

window.addEventListener('unhandledrejection', function(e) {
    console.warn('Unhandled physics promise rejection:', e.reason);
});

// Cleanup on exit
window.addEventListener('beforeunload', function() {
    if (typeof gsap !== 'undefined') {
        gsap.globalTimeline.clear();
    }
});