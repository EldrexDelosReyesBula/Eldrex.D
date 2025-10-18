document.addEventListener('DOMContentLoaded', function() {
    initPremiumPhysics();
    initPremiumBottomSheets();
    initEnhancedLinkAnimations();
    initContentProtection();
    initPerformanceOptimizations();
    initTouchOptimizations();

    setTimeout(() => {
        initPremiumEntranceAnimations();
    }, 150);
});

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
            rotationY: -10,
            filter: "blur(10px)"
        }, {
            scale: 1,
            opacity: 1,
            rotationY: 0,
            filter: "blur(0px)",
            duration: 1.4,
            ease: "elastic.out(1.1, 0.5)",
            clearProps: "all"
        }, 0);
    }
    
    if (linkItems.length > 0) {
        masterTimeline.fromTo(linkItems, {
            opacity: 0,
            y: 60,
            scale: 0.9
        }, {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.9,
            stagger: {
                amount: 0.6,
                ease: "power2.out"
            },
            ease: "back.out(1.2)",
            clearProps: "all"
        }, 0.3);
    }
}

function initEnhancedLinkAnimations() {
    const linkItems = document.querySelectorAll('.link-item');
    const profilePicture = document.getElementById('profile-picture');
    let waveAnimationActive = false;
    let profileExplosionActive = false;
    let scrollAnimationActive = false;
    
    linkItems.forEach((item, index) => {
        item._originalIndex = index;
        item._isAnimating = false;
        item._baseY = 0;
        gsap.set(item, {
            opacity: 1,
            scale: 1,
            rotation: 0,
            x: 0,
            y: 0
        });
    });
    
    let lastScrollY = window.scrollY;
    let scrollTimeout;
    
    function handleSoftScroll() {
        if (scrollAnimationActive || waveAnimationActive || profileExplosionActive) return;
        
        const currentScrollY = window.scrollY;
        const scrollDelta = currentScrollY - lastScrollY;
        const scrollStrength = Math.min(Math.abs(scrollDelta) * 0.1, 3); 
        
        if (Math.abs(scrollDelta) > 2) { 
            scrollAnimationActive = true;
            
            const scrollDirection = scrollDelta > 0 ? 1 : -1;
            const pushStrength = scrollStrength * 0.3; 
            
            linkItems.forEach((item, index) => {
                const delay = index * 0.01;
                const individualStrength = pushStrength * (1 - (index / linkItems.length) * 0.3);
                
                gsap.to(item, {
                    y: scrollDirection * individualStrength,
                    duration: 0.2,
                    delay: delay,
                    ease: "power1.out",
                    overwrite: "auto",
                    onComplete: () => {
                        if (index === linkItems.length - 1) {
                            setTimeout(() => {
                                if (!waveAnimationActive && !profileExplosionActive) {
                                    gsap.to(item, {
                                        y: 0,
                                        duration: 0.4,
                                        ease: "power1.out",
                                        overwrite: "auto"
                                    });
                                }
                            }, 100);
                        }
                    }
                });
            });
            
            setTimeout(() => {
                scrollAnimationActive = false;
            }, 300);
        }
        
        lastScrollY = currentScrollY;
    }
    
    let scrollThrottleTimeout;
    window.addEventListener('scroll', function() {
        if (!scrollThrottleTimeout) {
            scrollThrottleTimeout = setTimeout(() => {
                handleSoftScroll();
                scrollThrottleTimeout = null;
            }, 16); 
        }
    });
    
    if (profilePicture) {
        let profileLongPressTimer;
        
        profilePicture.addEventListener('mousedown', function(e) {
            profileLongPressTimer = setTimeout(() => {
                createProfileExplosionEffect();
            }, 500);
            
            gsap.to(this, {
                scale: 0.95,
                duration: 0.3,
                ease: "power2.out"
            });
        });
        
        profilePicture.addEventListener('touchstart', function(e) {
            profileLongPressTimer = setTimeout(() => {
                createProfileExplosionEffect();
            }, 500);
            
            gsap.to(this, {
                scale: 0.95,
                duration: 0.3,
                ease: "power2.out"
            });
        });
        
        const clearProfilePress = () => {
            clearTimeout(profileLongPressTimer);
            
            if (!profileExplosionActive) {
                gsap.to(profilePicture, {
                    scale: 1,
                    duration: 0.4,
                    ease: "elastic.out(1.2, 0.5)"
                });
            }
        };
        
        profilePicture.addEventListener('mouseup', clearProfilePress);
        profilePicture.addEventListener('mouseleave', clearProfilePress);
        profilePicture.addEventListener('touchend', clearProfilePress);
        profilePicture.addEventListener('touchcancel', clearProfilePress);
    }
    
    function createProfileExplosionEffect() {
        if (profileExplosionActive || waveAnimationActive) return;
        profileExplosionActive = true;
        
        const allItems = Array.from(document.querySelectorAll('.link-item'));
        
        if (profilePicture) {
            gsap.timeline()
                .to(profilePicture, {
                    scale: 1.3,
                    rotation: 360,
                    duration: 0.3,
                    ease: "power2.out"
                })
                .to(profilePicture, {
                    scale: 1,
                    rotation: 0,
                    duration: 0.6,
                    ease: "elastic.out(1.5, 0.8)"
                });
        }
        
        allItems.forEach((item, index) => {
            const distanceFromCenter = Math.abs(index - Math.floor(allItems.length / 2));
            const explosionStrength = Math.max(0.3, 1 - distanceFromCenter * 0.2);
            const explosionDelay = distanceFromCenter * 0.05;
            
            gsap.to(item, {
                y: (Math.random() - 0.5) * 30 * explosionStrength,
                x: (Math.random() - 0.5) * 20 * explosionStrength,
                scale: 1 + (Math.random() * 0.1) * explosionStrength,
                duration: 0.4,
                delay: explosionDelay,
                ease: "back.out(1.5)",
                overwrite: "auto"
            });
        });
        
        setTimeout(() => {
            allItems.forEach((item, index) => {
                const returnDelay = index * 0.03;
                
                gsap.to(item, {
                    y: 0,
                    x: 0,
                    scale: 1,
                    duration: 0.7,
                    delay: returnDelay,
                    ease: "elastic.out(1.2, 0.6)",
                    overwrite: "auto",
                    onComplete: () => {
                        if (index === allItems.length - 1) {
                            profileExplosionActive = false;
                        }
                    }
                });
            });
        }, 600);
    }
    
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
                y: -6,
                scale: 1.03,
                duration: 0.5,
                ease: "back.out(1.8)",
                overwrite: "auto"
            })
            .to(this.querySelector('.link-icon'), {
                scale: 1.15,
                duration: 0.3,
                ease: "power2.out"
            }, 0);
                

            gsap.to(this, {
                duration: 0.4,
                ease: "power2.out"
            });
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
                duration: 0.7,
                ease: "elastic.out(1.1, 0.5)",
                overwrite: "auto"
            })
            .to(this.querySelector('.link-icon'), {
                scale: 1,
                duration: 0.4,
                ease: "power2.out"
            }, 0)
            .to(this, {
                duration: 0.5,
                ease: "power2.out"
            }, 0);
        });
        
        item.addEventListener('mousedown', function(e) {
            if (waveAnimationActive || profileExplosionActive || scrollAnimationActive) return;
            clearTimeout(longPressTimer);
            longPressTimer = setTimeout(() => {
                createWaveEffect(this, 'mouse', true);
            }, 300);
            
            gsap.to(this, {
                scale: 0.95,
                y: 2,
                duration: 0.1,
                ease: "power2.in"
            });
        });
        
        item.addEventListener('touchstart', function(e) {
            if (waveAnimationActive || profileExplosionActive || scrollAnimationActive) return;
            clearTimeout(longPressTimer);
            longPressTimer = setTimeout(() => {
                createWaveEffect(this, 'touch', true);
            }, 300);
            
            gsap.to(this, {
                scale: 0.96,
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
                    duration: 0.3,
                    ease: "elastic.out(1.2, 0.5)"
                });
            }
        };
        
        item.addEventListener('mouseup', clearPress);
        item.addEventListener('mouseleave', clearPress);
        item.addEventListener('touchend', clearPress);
        item.addEventListener('touchcancel', clearPress);
    });
    
    function createWaveEffect(originItem, inputType, isLongPress = false) {
        if (waveAnimationActive || profileExplosionActive || scrollAnimationActive) return;
        waveAnimationActive = true;
        
        const allItems = Array.from(document.querySelectorAll('.link-item'));
        const originIndex = originItem._originalIndex;
        const totalItems = allItems.length;
        const waveStrength = isLongPress ? 1.2 : 0.8;
        const waveDuration = isLongPress ? 0.8 : 0.6;
        
        allItems.forEach(item => {
            gsap.killTweensOf(item);

            gsap.set(item, {
                opacity: 1,
                display: 'flex',
                visibility: 'visible'
            });
            item._isAnimating = true;
        });
        
        gsap.to(originItem, {
            scale: 0.90,
            y: 6,
            duration: 0.2,
            ease: "power2.out",
            overwrite: "auto"
        });
        
        allItems.forEach((item, index) => {
            if (item === originItem) return;
            
            const distance = Math.abs(index - originIndex);
            const maxDistance = Math.max(originIndex, totalItems - 1 - originIndex);
            const normalizedDistance = distance / maxDistance;
            const waveDelay = distance * 0.05;
            const wavePower = waveStrength * (1 - normalizedDistance * 0.7);
            
            const direction = index < originIndex ? -1 : 1;
            const pushDistance = 18 * wavePower * direction;
            
            if (wavePower > 0.05) {
                gsap.to(item, {
                    y: pushDistance,
                    x: (Math.random() - 0.5) * 8 * wavePower,
                    scale: 1 + wavePower * 0.06,
                    duration: waveDuration * 0.6,
                    delay: waveDelay,
                    ease: "back.out(1.6)",
                    overwrite: "auto",
                    onComplete: () => {
                        item._isAnimating = false;
                    }
                });
            }
        });
        
        setTimeout(() => {
            allItems.forEach((item, index) => {
                const distance = Math.abs(index - originIndex);
                const returnDelay = distance * 0.015;
                
                gsap.to(item, {
                    y: 0,
                    x: 0,
                    scale: 1,
                    duration: 0.8,
                    delay: returnDelay,
                    ease: "elastic.out(1.2, 0.6)",
                    overwrite: "auto",
                    onComplete: () => {
                        if (index === allItems.length - 1) {
                            waveAnimationActive = false;
                        }
                        item._isAnimating = false;
                    }
                });
            });
        }, waveDuration * 450);
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
    
    function resetAllLinkItems() {
        if (linkItems.length > 0) {
            gsap.to(linkItems, {
                y: 0,
                x: 0,
                scale: 1,
                rotation: 0,
                duration: 0.5,
                ease: "elastic.out(1.1, 0.6)",
                stagger: 0.02,
                overwrite: "auto"
            });
        }
    }
    
    if (profilePicture && profileSheet) {
        profilePicture.addEventListener('click', function(e) {
            if (isAnimating) return;
            openPremiumSheet(profileSheet);
        });
    }
    
    function openPremiumSheet(sheetElement) {
        isAnimating = true;
        
        resetAllLinkItems();
        
        sheetElement.classList.add('active');
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
        activeSheet = sheetElement;
        
        if (linkItems.length > 0) {
            gsap.to(linkItems, {
                y: -8, 
                scale: 0.995,
                duration: 0.3,
                ease: "power1.out",
                stagger: 0.005,
                overwrite: "auto"
            });
        }
        
        if (typeof gsap !== 'undefined') {
            gsap.set(sheetElement, { 
                y: '100%', 
                opacity: 1,
                scale: 1
            });
            gsap.set(overlay, { opacity: 0 });
            
            const masterTimeline = gsap.timeline({
                onComplete: () => {
                    isAnimating = false;
                }
            });
            
            masterTimeline.to(overlay, {
                opacity: 1,
                duration: 0.4,
                ease: "power2.out"
            }, 0);
            
            masterTimeline.to(sheetElement, {
                y: '0%',
                duration: 0.5,
                ease: "power2.out"
            }, 0.1);
            
            const contentElements = sheetElement.querySelectorAll('.profile-card, .profile-avatar, .profile-info, .more-about-btn');
            if (contentElements.length > 0) {
                masterTimeline.fromTo(contentElements, {
                    y: 20,
                    opacity: 0
                }, {
                    y: 0,
                    opacity: 1,
                    duration: 0.4,
                    stagger: 0.1,
                    ease: "power2.out"
                }, 0.2);
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
        
        resetAllLinkItems();
        
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
            
            closeTimeline.to(activeSheet, {
                y: '100%',
                duration: 0.4,
                ease: "power2.inOut"
            }, 0);
            
            closeTimeline.to(overlay, {
                opacity: 0,
                duration: 0.3,
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
    
    window.resetLinkItems = resetAllLinkItems;
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

initImageOptimizations();

let resizeTimeout;
window.addEventListener('resize', function() {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        console.log('Window resized - optimizing layout');
    }, 250);
});

window.addEventListener('error', function(e) {
    console.error('Global error caught:', e.error);
});

window.addEventListener('unhandledrejection', function(e) {
    console.warn('Unhandled promise rejection:', e.reason);
});

window.addEventListener('beforeunload', function() {
    if (typeof gsap !== 'undefined') {
        gsap.globalTimeline.clear();
    }
});