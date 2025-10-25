document.addEventListener('DOMContentLoaded', function() {
    // Initialize all modules
    initPremiumPhysics();
    initPremiumBottomSheets();
    initEnhancedLinkAnimations();
    initContentProtection();
    initPerformanceOptimizations();
    initTouchOptimizations();

    // Start entrance animations after brief delay
    setTimeout(() => {
        initPremiumEntranceAnimations();
    }, 150);
});

// Enhanced configuration
const ANIMATION_CONFIG = {
    physics: {
        springTension: 1.2,
        springFriction: 0.4,
        recoilDuration: 1.4,
        waveSpeed: 0.04,
        explosionStrength: 1.4
    },
    timing: {
        longPressDuration: 400,
        hoverEnter: 0.5,
        hoverLeave: 0.8,
        waveReturn: 2.2,
        sheetOpen: 0.7,
        sheetClose: 0.6
    },
    effects: {
        linkLift: -10,
        linkPressDepth: -12,
        iconScale: 1.2,
        rotationIntensity: 8
    }
};

// Global state management
const APP_STATE = {
    isAnimating: false,
    activeWave: false,
    profileExplosion: false,
    scrollAnimation: false,
    activeSheet: null,
    longPressTimers: new Map(),
    touchActive: false,
    clickCount: 0,
    lastClickTime: 0
};

function initPremiumPhysics() {
    if (typeof gsap !== 'undefined') {
        gsap.config({
            nullTargetWarn: false,
            force3D: true
        });
        gsap.ticker.lagSmoothing(1000, 16);
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
            rotationY: -20,
            rotationX: 8,
            z: -80,
            filter: "blur(15px)"
        }, {
            scale: 1,
            opacity: 1,
            rotationY: 0,
            rotationX: 0,
            z: 0,
            filter: "blur(0px)",
            duration: 1.8,
            ease: "elastic.out(1.3, 0.3)",
            clearProps: "all"
        }, 0);
    }

    if (linkItems.length > 0) {
        masterTimeline.fromTo(linkItems, {
            opacity: 0,
            y: 100,
            scale: 0.8,
            rotationX: 15,
            z: -50
        }, {
            opacity: 1,
            y: 0,
            scale: 1,
            rotationX: 0,
            z: 0,
            duration: 1.3,
            stagger: {
                amount: 1.0,
                ease: "power2.out",
                from: "start"
            },
            ease: "back.out(1.6)",
            clearProps: "all"
        }, 0.5);
    }
}

function initEnhancedLinkAnimations() {
    const linkItems = document.querySelectorAll('.link-item');
    const profilePicture = document.getElementById('profile-picture');

    // Initialize link properties with enhanced physics
    linkItems.forEach((item, index) => {
        item._animationState = {
            index: index,
            isAnimating: false,
            baseY: 0,
            hoverScale: 1,
            isHovered: false,
            isPressed: false,
            href: item.getAttribute('href') || item.querySelector('a')?.getAttribute('href')
        };

        // Set initial 3D properties
        gsap.set(item, {
            transformStyle: "preserve-3d",
            transformOrigin: "center center",
            opacity: 1,
            scale: 1,
            rotation: 0,
            x: 0,
            y: 0,
            z: 0,
            rotationX: 0,
            rotationY: 0
        });

        initLinkInteractions(item);
    });

    // Enhanced smooth scroll handling for mobile
    let scrollThrottleTimeout;
    let lastScrollY = window.scrollY;
    let scrollVelocity = 0;

    function handleSmoothScroll() {
        if (APP_STATE.activeWave || APP_STATE.profileExplosion || APP_STATE.scrollAnimation) return;

        const currentScrollY = window.scrollY;
        const scrollDelta = currentScrollY - lastScrollY;
        scrollVelocity = scrollDelta * 0.6 + scrollVelocity * 0.4;

        if (Math.abs(scrollDelta) > 2) {
            APP_STATE.scrollAnimation = true;

            const scrollStrength = Math.min(Math.abs(scrollVelocity) * 0.06, 2.0);
            const scrollDirection = scrollDelta > 0 ? 1 : -1;

            linkItems.forEach((item, index) => {
                const delay = index * 0.006;
                const individualStrength = scrollStrength * (1 - (index / linkItems.length) * 0.3);
                const pushDistance = scrollDirection * individualStrength * 15;

                gsap.to(item, {
                    y: pushDistance,
                    duration: 0.2,
                    delay: delay,
                    ease: "power2.out",
                    overwrite: "auto"
                });
            });

            // Ultra-smooth return with enhanced physics
            setTimeout(() => {
                if (!APP_STATE.activeWave && !APP_STATE.profileExplosion) {
                    linkItems.forEach((item, index) => {
                        const returnDelay = index * 0.012;

                        gsap.to(item, {
                            y: 0,
                            duration: 2.0,
                            delay: returnDelay,
                            ease: "elastic.out(1.4, 0.2)",
                            overwrite: "auto",
                            onComplete: () => {
                                if (index === linkItems.length - 1) {
                                    APP_STATE.scrollAnimation = false;
                                }
                            }
                        });
                    });
                } else {
                    APP_STATE.scrollAnimation = false;
                }
            }, 120);
        }

        lastScrollY = currentScrollY;
    }

    // Throttled scroll handler for mobile performance
    window.addEventListener('scroll', function() {
        if (!scrollThrottleTimeout) {
            scrollThrottleTimeout = setTimeout(() => {
                handleSmoothScroll();
                scrollThrottleTimeout = null;
            }, 8);
        }
    });

    // Enhanced profile picture interactions
    if (profilePicture) {
        let profileLongPressTimer;
        let isProfilePressed = false;

        profilePicture.addEventListener('mousedown', function(e) {
            isProfilePressed = true;
            profileLongPressTimer = setTimeout(() => {
                createProfileExplosionWave();
            }, ANIMATION_CONFIG.timing.longPressDuration);

            gsap.to(this, {
                scale: 0.90,
                rotationY: 8,
                rotationX: -5,
                z: -15,
                duration: 0.35,
                ease: "power2.out"
            });
        });

        profilePicture.addEventListener('touchstart', function(e) {
            isProfilePressed = true;
            profileLongPressTimer = setTimeout(() => {
                createProfileExplosionWave();
            }, ANIMATION_CONFIG.timing.longPressDuration);

            gsap.to(this, {
                scale: 0.92,
                rotationY: 4,
                rotationX: -3,
                z: -10,
                duration: 0.3,
                ease: "power2.out"
            });
        });

        const clearProfilePress = () => {
            isProfilePressed = false;
            clearTimeout(profileLongPressTimer);

            if (!APP_STATE.profileExplosion) {
                gsap.to(profilePicture, {
                    scale: 1,
                    rotationY: 0,
                    rotationX: 0,
                    z: 0,
                    duration: 0.8,
                    ease: "elastic.out(1.4, 0.4)"
                });
            }
        };

        profilePicture.addEventListener('mouseup', clearProfilePress);
        profilePicture.addEventListener('mouseleave', clearProfilePress);
        profilePicture.addEventListener('touchend', clearProfilePress);
        profilePicture.addEventListener('touchcancel', clearProfilePress);
    }

    function createProfileExplosionWave() {
        if (APP_STATE.profileExplosion || APP_STATE.activeWave) return;
        APP_STATE.profileExplosion = true;

        const allItems = Array.from(document.querySelectorAll('.link-item'));

        // Enhanced 3D profile explosion
        if (profilePicture) {
            gsap.timeline()
                .to(profilePicture, {
                    scale: 1.5,
                    rotationY: 30,
                    rotationX: -20,
                    z: 30,
                    duration: 0.4,
                    ease: "power2.out"
                })
                .to(profilePicture, {
                    scale: 1,
                    rotationY: 0,
                    rotationX: 0,
                    z: 0,
                    duration: 1.1,
                    ease: "elastic.out(1.7, 0.5)"
                });
        }

        // Advanced wave propagation with vertical emphasis
        allItems.forEach((item, index) => {
            const distanceFromCenter = Math.abs(index - Math.floor(allItems.length / 2));
            const explosionStrength = Math.max(0.4, 1 - distanceFromCenter * 0.12);
            const explosionDelay = distanceFromCenter * 0.05;

            // Enhanced vertical push with subtle randomness
            gsap.to(item, {
                y: (0.8 + Math.random() * 0.4) * 40 * explosionStrength,
                z: (Math.random() - 0.5) * 20 * explosionStrength,
                scale: 1 + (Math.random() * 0.15) * explosionStrength,
                duration: 0.6,
                delay: explosionDelay,
                ease: "back.out(2.0)",
                overwrite: "auto"
            });
        });

        // Premium slow-motion return
        setTimeout(() => {
            allItems.forEach((item, index) => {
                const returnDelay = index * 0.04;

                gsap.to(item, {
                    y: 0,
                    z: 0,
                    scale: 1,
                    duration: 2.5,
                    delay: returnDelay,
                    ease: "elastic.out(1.1, 0.15)",
                    overwrite: "auto",
                    onComplete: () => {
                        if (index === allItems.length - 1) {
                            APP_STATE.profileExplosion = false;
                        }
                    }
                });
            });
        }, 800);
    }
}

function initLinkInteractions(linkItem) {
    let hoverTimeline = null;
    let pressTimeline = null;
    let longPressTimer = null;
    let isPressed = false;

    // Enhanced hover enter with icon effects
    linkItem.addEventListener('mouseenter', function(e) {
        if (APP_STATE.activeWave || APP_STATE.profileExplosion || APP_STATE.scrollAnimation || 
            this._animationState.isAnimating || APP_STATE.activeSheet) return;

        if (hoverTimeline) hoverTimeline.kill();

        this._animationState.isAnimating = true;
        this._animationState.isHovered = true;

        hoverTimeline = gsap.timeline({
            onComplete: () => {
                this._animationState.isAnimating = false;
            }
        })
        .to(this, {
            y: ANIMATION_CONFIG.effects.linkLift,
            scale: 1.06,
            z: 8,
            rotationY: 3,
            rotationX: -2,
            duration: ANIMATION_CONFIG.timing.hoverEnter,
            ease: "back.out(2.4)",
            overwrite: "auto"
        })
        .to(this.querySelector('.link-icon'), {
            scale: ANIMATION_CONFIG.effects.iconScale,
            rotationZ: 6,
            duration: 0.4,
            ease: "power2.out"
        }, 0)
        .to(this.querySelector('.link-icon i'), {
            color: '#ffffff',
            duration: 0.3,
            ease: "power2.out"
        }, 0)
        .to(this.querySelector('.link-arrow'), {
            x: 6,
            scale: 1.1,
            color: 'var(--primary)',
            duration: 0.4,
            ease: "power2.out"
        }, 0);
    });

    // Enhanced hover leave with smooth return
    linkItem.addEventListener('mouseleave', function(e) {
        if (APP_STATE.activeWave || APP_STATE.profileExplosion || APP_STATE.scrollAnimation || 
            this._animationState.isAnimating || APP_STATE.activeSheet) return;

        if (hoverTimeline) hoverTimeline.kill();

        this._animationState.isAnimating = true;
        this._animationState.isHovered = false;

        hoverTimeline = gsap.timeline({
            onComplete: () => {
                this._animationState.isAnimating = false;
            }
        })
        .to(this, {
            y: 0,
            scale: 1,
            z: 0,
            rotationY: 0,
            rotationX: 0,
            duration: ANIMATION_CONFIG.timing.hoverLeave,
            ease: "elastic.out(1.3, 0.35)",
            overwrite: "auto"
        })
        .to(this.querySelector('.link-icon'), {
            scale: 1,
            rotationZ: 0,
            duration: 0.5,
            ease: "power2.out"
        }, 0)
        .to(this.querySelector('.link-icon i'), {
            color: 'var(--text-tertiary)',
            duration: 0.4,
            ease: "power2.out"
        }, 0)
        .to(this.querySelector('.link-arrow'), {
            x: 0,
            scale: 1,
            color: 'var(--text-tertiary)',
            duration: 0.4,
            ease: "power2.out"
        }, 0);
    });

    // Enhanced press interactions
    linkItem.addEventListener('mousedown', function(e) {
        if (APP_STATE.activeWave || APP_STATE.profileExplosion || APP_STATE.scrollAnimation || APP_STATE.activeSheet) return;
        
        isPressed = true;
        this._animationState.isPressed = true;
        clearTimeout(longPressTimer);
        longPressTimer = setTimeout(() => {
            createLinkWaveEffect(this, 'mouse', true);
        }, ANIMATION_CONFIG.timing.longPressDuration);

        gsap.to(this, {
            scale: 0.92,
            y: 4,
            z: ANIMATION_CONFIG.effects.linkPressDepth,
            rotationY: -2,
            duration: 0.15,
            ease: "power2.in"
        });
    });

    linkItem.addEventListener('touchstart', function(e) {
        if (APP_STATE.activeWave || APP_STATE.profileExplosion || APP_STATE.scrollAnimation || APP_STATE.activeSheet) return;
        
        isPressed = true;
        this._animationState.isPressed = true;
        APP_STATE.touchActive = true;
        clearTimeout(longPressTimer);
        longPressTimer = setTimeout(() => {
            createLinkWaveEffect(this, 'touch', true);
        }, ANIMATION_CONFIG.timing.longPressDuration);

        gsap.to(this, {
            scale: 0.94,
            z: -8,
            duration: 0.18,
            ease: "power2.out"
        });
    });

    const clearPressState = () => {
        isPressed = false;
        if (linkItem._animationState) {
            linkItem._animationState.isPressed = false;
        }
        APP_STATE.touchActive = false;
        clearTimeout(longPressTimer);

        if (!APP_STATE.activeWave && !APP_STATE.profileExplosion && !APP_STATE.scrollAnimation && !APP_STATE.activeSheet) {
            gsap.to(linkItem, {
                scale: 1,
                y: linkItem._animationState.isHovered ? ANIMATION_CONFIG.effects.linkLift : 0,
                z: linkItem._animationState.isHovered ? 8 : 0,
                rotationY: linkItem._animationState.isHovered ? 3 : 0,
                duration: 0.9,
                ease: "elastic.out(1.4, 0.4)"
            });
        }
    };

    linkItem.addEventListener('mouseup', clearPressState);
    linkItem.addEventListener('mouseleave', clearPressState);
    linkItem.addEventListener('touchend', clearPressState);
    linkItem.addEventListener('touchcancel', clearPressState);

    // Enhanced click handling for normal navigation
    linkItem.addEventListener('click', function(e) {
        const currentTime = new Date().getTime();
        const timeSinceLastClick = currentTime - APP_STATE.lastClickTime;
        
        // Reset click count if it's been more than 500ms since last click
        if (timeSinceLastClick > 500) {
            APP_STATE.clickCount = 0;
        }
        
        APP_STATE.clickCount++;
        APP_STATE.lastClickTime = currentTime;

        // Only allow single clicks to navigate
        if (APP_STATE.clickCount === 1 && !this._animationState.isPressed) {
            const href = this._animationState.href;
            if (href && href !== '#' && !href.startsWith('javascript:')) {
                // Add a small delay to allow animation to complete
                setTimeout(() => {
                    window.open(href, '_blank');
                }, 200);
            }
        }
        
        // Prevent default only for multiple clicks
        if (APP_STATE.clickCount > 1) {
            e.preventDefault();
        }
    });

    // Allow context menu for link inspection
    linkItem.addEventListener('contextmenu', function(e) {
        // Allow default context menu behavior for link inspection
        return true;
    });
}

function createLinkWaveEffect(originItem, inputType, isLongPress = false) {
    if (APP_STATE.activeWave || APP_STATE.profileExplosion || APP_STATE.scrollAnimation) return;
    APP_STATE.activeWave = true;

    const allItems = Array.from(document.querySelectorAll('.link-item'));
    const originIndex = originItem._animationState.index;
    const totalItems = allItems.length;
    const waveStrength = isLongPress ? ANIMATION_CONFIG.physics.explosionStrength : 1.0;

    // Clear existing animations
    allItems.forEach(item => {
        gsap.killTweensOf(item);
        item._animationState.isAnimating = true;
    });

    // Enhanced origin item press
    gsap.to(originItem, {
        scale: 0.86,
        y: 10,
        z: -15,
        duration: 0.3,
        ease: "power2.out",
        overwrite: "auto"
    });

    // Advanced wave propagation
    allItems.forEach((item, index) => {
        if (item === originItem) return;

        const distance = Math.abs(index - originIndex);
        const maxDistance = Math.max(originIndex, totalItems - 1 - originIndex);
        const normalizedDistance = distance / maxDistance;
        const waveDelay = distance * ANIMATION_CONFIG.physics.waveSpeed;
        const wavePower = waveStrength * (1 - normalizedDistance * 0.5);

        const direction = index < originIndex ? -1 : 1;
        const pushDistance = 25 * wavePower * direction;

        if (wavePower > 0.05) {
            gsap.to(item, {
                y: pushDistance,
                z: (Math.random() - 0.5) * 8 * wavePower,
                scale: 1 + wavePower * 0.1,
                rotationX: wavePower * 3 * direction,
                duration: 0.8,
                delay: waveDelay,
                ease: "back.out(2.0)",
                overwrite: "auto"
            });
        }
    });

    // Premium slow-motion return with icon restoration
    setTimeout(() => {
        allItems.forEach((item, index) => {
            const distance = Math.abs(index - originIndex);
            const returnDelay = distance * 0.03;

            gsap.to(item, {
                y: item._animationState.isHovered ? ANIMATION_CONFIG.effects.linkLift : 0,
                z: item._animationState.isHovered ? 8 : 0,
                scale: item._animationState.isHovered ? 1.06 : 1,
                rotationX: 0,
                rotationY: item._animationState.isHovered ? 3 : 0,
                duration: ANIMATION_CONFIG.timing.waveReturn,
                delay: returnDelay,
                ease: "elastic.out(1.1, 0.12)",
                overwrite: "auto",
                onComplete: () => {
                    if (index === allItems.length - 1) {
                        APP_STATE.activeWave = false;
                    }
                    item._animationState.isAnimating = false;
                    
                    // Restore icon states for hovered items
                    if (item._animationState.isHovered) {
                        gsap.to(item.querySelector('.link-icon'), {
                            scale: ANIMATION_CONFIG.effects.iconScale,
                            rotationZ: 6,
                            duration: 0.3
                        });
                        gsap.to(item.querySelector('.link-icon i'), {
                            color: '#ffffff',
                            duration: 0.2
                        });
                    }
                }
            });
        });
    }, 600);
}

function initPremiumBottomSheets() {
    const profilePicture = document.getElementById('profile-picture');
    const profileSheet = document.getElementById('profile-sheet');
    const overlay = document.getElementById('overlay');
    const closeButtons = document.querySelectorAll('.close-sheet');
    const linkItems = document.querySelectorAll('.link-item');

    // Ensure bottom sheet starts closed
    if (profileSheet) {
        profileSheet.classList.remove('active');
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    function resetLinkItemsToHoverState() {
        if (linkItems.length > 0) {
            linkItems.forEach(item => {
                const isHovered = item._animationState?.isHovered;
                gsap.to(item, {
                    y: isHovered ? ANIMATION_CONFIG.effects.linkLift : 0,
                    z: isHovered ? 8 : 0,
                    scale: isHovered ? 1.06 : 1,
                    rotationY: isHovered ? 3 : 0,
                    rotationX: 0,
                    duration: 1.4,
                    ease: "elastic.out(1.2, 0.3)",
                    overwrite: "auto"
                });

                // Restore icon states for hovered items
                if (isHovered) {
                    gsap.to(item.querySelector('.link-icon'), {
                        scale: ANIMATION_CONFIG.effects.iconScale,
                        rotationZ: 6,
                        duration: 0.4
                    });
                    gsap.to(item.querySelector('.link-icon i'), {
                        color: '#ffffff',
                        duration: 0.3
                    });
                }
            });
        }
    }

    if (profilePicture && profileSheet) {
        profilePicture.addEventListener('click', function(e) {
            if (APP_STATE.isAnimating) return;
            if (APP_STATE.activeSheet) {
                closeActiveSheet();
            } else {
                openPremiumSheet(profileSheet);
            }
        });
    }

    function openPremiumSheet(sheetElement) {
        APP_STATE.isAnimating = true;

        // Enhanced link items push-up effect
        if (linkItems.length > 0) {
            gsap.to(linkItems, {
                y: -25,
                scale: 0.94,
                z: -30,
                rotationX: 6,
                duration: ANIMATION_CONFIG.timing.sheetOpen,
                ease: "power2.out",
                stagger: 0.02,
                overwrite: "auto"
            });
        }

        sheetElement.classList.add('active');
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
        APP_STATE.activeSheet = sheetElement;

        if (typeof gsap !== 'undefined') {
            gsap.set(sheetElement, {
                y: '100%',
                opacity: 1,
                scale: 1,
                rotationX: 10
            });
            gsap.set(overlay, { opacity: 0 });

            const masterTimeline = gsap.timeline({
                onComplete: () => {
                    APP_STATE.isAnimating = false;
                }
            });

            masterTimeline.to(overlay, {
                opacity: 1,
                duration: 0.6,
                ease: "power2.out"
            }, 0);

            masterTimeline.to(sheetElement, {
                y: '0%',
                rotationX: 0,
                duration: 0.9,
                ease: "power2.out"
            }, 0.1);

            const contentElements = sheetElement.querySelectorAll('.profile-card, .profile-avatar, .profile-info, .more-about-btn');
            if (contentElements.length > 0) {
                masterTimeline.fromTo(contentElements, {
                    y: 50,
                    opacity: 0,
                    z: -60,
                    rotationX: 12
                }, {
                    y: 0,
                    opacity: 1,
                    z: 0,
                    rotationX: 0,
                    duration: 0.8,
                    stagger: 0.18,
                    ease: "back.out(1.8)"
                }, 0.3);
            }
        }
    }

    function closeActiveSheet() {
        if (!APP_STATE.activeSheet || APP_STATE.isAnimating) return;
        APP_STATE.isAnimating = true;

        // Reset link items with enhanced physics and hover state restoration
        resetLinkItemsToHoverState();

        if (typeof gsap !== 'undefined') {
            const closeTimeline = gsap.timeline({
                onComplete: () => {
                    APP_STATE.activeSheet.classList.remove('active');
                    overlay.classList.remove('active');
                    document.body.style.overflow = '';
                    APP_STATE.activeSheet = null;
                    APP_STATE.isAnimating = false;
                }
            });

            closeTimeline.to(APP_STATE.activeSheet, {
                y: '100%',
                rotationX: 12,
                duration: ANIMATION_CONFIG.timing.sheetClose,
                ease: "power2.inOut"
            }, 0);

            closeTimeline.to(overlay, {
                opacity: 0,
                duration: 0.5,
                ease: "power2.out"
            }, 0.1);
        }
    }

    // Event listeners
    closeButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation();
            closeActiveSheet();
        });
    });

    overlay.addEventListener('click', closeActiveSheet);

    if (profileSheet) {
        profileSheet.addEventListener('click', function(e) {
            e.stopPropagation();
        });
    }

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && APP_STATE.activeSheet) {
            closeActiveSheet();
        }
    });

    window.resetLinkItems = resetLinkItemsToHoverState;
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

    const style = document.createElement('style');
    style.textContent = antiCopyCSS;
    document.head.appendChild(style);

    // Only prevent dragstart for images, allow other default behaviors
    document.addEventListener('dragstart', (e) => {
        if (e.target.tagName === 'IMG') {
            e.preventDefault();
        }
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
            if (typeof gsap !== 'undefined') gsap.ticker.lagSmoothing(0);
        } else {
            if (typeof gsap !== 'undefined') gsap.ticker.lagSmoothing(1000, 16);
        }
    });
}

function initTouchOptimizations() {
    const touchStyles = `
        @media (hover: none) and (pointer: coarse) {
            .link-item {
                min-height: 52px;
                min-width: 52px;
            }
            
            .haptic-link:active {
                transform: scale(0.95);
                transition: transform 0.15s ease;
            }
            
            button, .link-item {
                touch-action: manipulation;
                -webkit-tap-highlight-color: transparent;
            }
            
            /* Enhanced smooth scrolling for mobile */
            .links-section {
                -webkit-overflow-scrolling: touch;
                scroll-behavior: smooth;
            }
            
            body {
                -webkit-overflow-scrolling: touch;
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
        if (typeof gsap !== 'undefined') {
            gsap.ticker.lagSmoothing(1000, 16);
        }
    }, 250);
});

// Error handling
window.addEventListener('error', function(e) {
    console.error('Global error:', e.error);
});

window.addEventListener('unhandledrejection', function(e) {
    console.warn('Unhandled promise rejection:', e.reason);
});

// Cleanup
window.addEventListener('beforeunload', function() {
    if (typeof gsap !== 'undefined') {
        gsap.globalTimeline.clear();
    }
});