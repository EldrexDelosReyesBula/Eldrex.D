        document.addEventListener('DOMContentLoaded', function() {
            const parallaxBg = document.getElementById('parallax-bg-1');
            const heroSection = document.querySelector('.hero-section');
            const contentWrapper = document.querySelector('.content-wrapper');
            const header = document.querySelector('.header');
            const imageCounter = document.getElementById('image-counter');

            contentWrapper.style.marginTop = `${window.innerHeight}px`;

            const imageUrls = [
                'https://eldrex.landecs.org/squad/socratic/squad02.jpg',
                'https://eldrex.landecs.org/squad/socratic/squad03.jpg',
                'https://eldrex.landecs.org/squad/socratic/squad04.jpg',
                'https://eldrex.landecs.org/squad/socratic/squad05.jpg',
                'https://eldrex.landecs.org/squad/socratic/squad06.jpg',
                'https://eldrex.landecs.org/squad/socratic/squad07.jpg'
            ];

            function preloadImages(urls) {
                urls.forEach(url => {
                    const img = new Image();
                    img.src = url;
                });
            }

            preloadImages(imageUrls);

            const parallaxElements = document.querySelectorAll('.parallax-bg');
            parallaxElements.forEach((element, index) => {
                element.style.backgroundImage = `url('${imageUrls[index]}')`;
            });

            let currentImageIndex = 0;
            const totalImages = imageUrls.length;

            function changeBackgroundImage() {
                parallaxElements[currentImageIndex].classList.remove('active');
                currentImageIndex = (currentImageIndex + 1) % totalImages;
                parallaxElements[currentImageIndex].classList.add('active');
                imageCounter.textContent = `${currentImageIndex + 1}/${totalImages}`;
            }

            setInterval(changeBackgroundImage, 6000);

            window.addEventListener('scroll', function() {
                const scrolled = window.pageYOffset;
                const rate = scrolled * -0.5;
                parallaxElements.forEach(element => {
                    element.style.transform = `translate3d(0px, ${rate}px, 0px)`;
                });
                const opacity = 1 - (scrolled / (window.innerHeight * 0.7));
                heroSection.style.opacity = Math.max(opacity, 0);

                // Header effect on scroll
                if (scrolled > 50) {
                    header.classList.add('scrolled');
                } else {
                    header.classList.remove('scrolled');
                }
            });
            const memberCards = document.querySelectorAll('.member-card');
            memberCards.forEach(card => {
                card.addEventListener('mouseenter', function() {
                    this.style.transform = 'translateY(-8px) scale(1.03)';
                });

                card.addEventListener('mouseleave', function() {
                    this.style.transform = 'translateY(0) scale(1)';
                });
            });
            document.addEventListener('contextmenu', function(e) {
                if (e.target.classList.contains('parallax-bg') ||
                    e.target.tagName === 'IMG') {
                    e.preventDefault();
                    return false;
                }
            });

            document.addEventListener('dragstart', function(e) {
                if (e.target.classList.contains('parallax-bg') ||
                    e.target.tagName === 'IMG') {
                    e.preventDefault();
                    return false;
                }
            });

            const observerOptions = {
                threshold: 0.1,
                rootMargin: '0px 0px -50px 0px'
            };

            const observer = new IntersectionObserver(function(entries) {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('fade-in');
                        if (entry.target.querySelector('.members-container')) {
                            const cards = entry.target.querySelectorAll('.member-card');
                            cards.forEach((card, index) => {
                                setTimeout(() => {
                                    if (index % 2 === 0) {
                                        card.classList.add('slide-left');
                                    } else {
                                        card.classList.add('slide-right');
                                    }
                                }, index * 100);
                            });
                        }
                    }
                });
            }, observerOptions);

            const sections = document.querySelectorAll('.content-section');
            sections.forEach(section => {
                observer.observe(section);
            });

            window.addEventListener('resize', function() {
                contentWrapper.style.marginTop = `${window.innerHeight}px`;
            });
        });