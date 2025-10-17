document.addEventListener('DOMContentLoaded', function() {
            // Security redirects
            if (window.location.protocol !== 'https:') {
                window.location.href = 'https://eldrex.neocities.org' + window.location.pathname;
            }

            if (window.self !== window.top) {
                window.top.location.href = 'https://eldrex.neocities.org' + window.location.pathname;
            }

            // Haptic feedback
            if ('vibrate' in navigator) {
                const vibrate = () => {
                    try {
                        navigator.vibrate([15, 3, 15]);
                    } catch (e) {
                        console.warn('Haptic feedback unavailable');
                    }
                };

                const hapticLinks = document.querySelectorAll('.haptic-link');

                hapticLinks.forEach(link => {
                    link.addEventListener('touchstart', vibrate, {
                        passive: true
                    });
                    link.addEventListener('mousedown', vibrate);
                    link.addEventListener('click', (e) => {
                        if (e.screenX !== 0) {
                            setTimeout(vibrate, 10);
                        }
                    });
                    link.addEventListener('contextmenu', vibrate);
                });
            }

            // Iframe loading animation
            const iframe = document.querySelector('iframe');
            iframe.onload = function() {
                iframe.style.opacity = '1';
            };
            iframe.style.opacity = '0';
            iframe.style.transition = 'opacity 0.5s ease';
            
            // Style the iframe content for better integration
            const styleIframeContent = () => {
                try {
                    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
                    if (iframeDoc.readyState === 'complete') {
                        // Add sage-themed styling to the license text
                        const style = iframeDoc.createElement('style');
                        style.textContent = `
                            body {
                                background-color: ${getComputedStyle(document.documentElement).getPropertyValue('--sage-100')} !important;
                                color: ${getComputedStyle(document.documentElement).getPropertyValue('--sage-900')} !important;
                                font-family: 'Poppins', -apple-system, BlinkMacSystemFont, sans-serif !important;
                                line-height: 1.6 !important;
                                padding: 2rem !important;
                                margin: 0 !important;
                            }
                            pre, code {
                                background-color: ${getComputedStyle(document.documentElement).getPropertyValue('--sage-200')} !important;
                                border: 1px solid ${getComputedStyle(document.documentElement).getPropertyValue('--sage-300')} !important;
                                border-radius: 6px !important;
                                padding: 1rem !important;
                                overflow-x: auto !important;
                                color: ${getComputedStyle(document.documentElement).getPropertyValue('--sage-800')} !important;
                            }
                            h1, h2, h3, h4, h5, h6 {
                                color: ${getComputedStyle(document.documentElement).getPropertyValue('--sage-800')} !important;
                                border-bottom: 1px solid ${getComputedStyle(document.documentElement).getPropertyValue('--sage-300')} !important;
                                padding-bottom: 0.5rem !important;
                            }
                        `;
                        iframeDoc.head.appendChild(style);
                    }
                } catch (e) {
                    // Cross-origin restrictions may prevent this
                    console.log('Cannot style iframe content due to cross-origin restrictions');
                }
            };
            
            // Try to style iframe after load
            iframe.addEventListener('load', styleIframeContent);
        });