class PostManager {
    constructor() {
        this.posts = [];
        this.loadedPosts = 0;
        this.postsPerLoad = 3;
        this.isLoading = false;
        this.imageCache = new Map();
        this.failedImages = new Set();
        this.init();
    }

    init() {
        this.setupIntersectionObserver();
        this.loadInitialPosts();
        this.setupEventListeners();
        this.preloadCriticalImages();

        setTimeout(() => this.checkUrlForPost(), 100);
    }

    setupIntersectionObserver() {
        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !this.isLoading) {
                    this.loadMorePosts();
                }
            });
        }, {
            rootMargin: '100px',
            threshold: 0.1
        });

        const loadingMore = document.getElementById('loading-more');
        if (loadingMore) {
            this.observer.observe(loadingMore);
        }
    }

    setupEventListeners() {
        window.addEventListener('scroll', () => {
            const headerName = document.querySelector('.header-name');
            const heroSection = document.querySelector('.hero-section');
            const heroHeight = heroSection.offsetHeight;

            if (window.scrollY > heroHeight * 0.6) {
                headerName.classList.add('visible');
            } else {
                headerName.classList.remove('visible');
            }
        });


        const postFullscreenBack = document.getElementById('post-fullscreen-back');
        postFullscreenBack.addEventListener('click', () => this.closePostFullscreen());

        window.addEventListener('popstate', (event) => {
            if (event.state && event.state.postId) {
                this.openPostFullscreen(event.state.postId);
            } else {
                this.closePostFullscreen();
            }
        });


        window.addEventListener('hashchange', () => {
            this.checkUrlForPost();
        });
    }

    preloadCriticalImages() {
        const heroImage = document.querySelector('.hero-image');
        if (heroImage) {
            this.cacheImage(heroImage.src).catch(() => {
                console.warn('Failed to preload hero image');
            });
        }
    }

    cacheImage(src) {
        return new Promise((resolve, reject) => {
            if (this.failedImages.has(src)) {
                reject(new Error('Image previously failed to load'));
                return;
            }

            if (this.imageCache.has(src)) {
                resolve(this.imageCache.get(src));
                return;
            }

            const img = new Image();
            const timeout = setTimeout(() => {
                this.failedImages.add(src);
                reject(new Error('Image loading timeout'));
            }, 10000);

            img.onload = () => {
                clearTimeout(timeout);
                this.imageCache.set(src, img);
                resolve(img);
            };

            img.onerror = (error) => {
                clearTimeout(timeout);
                this.failedImages.add(src);
                console.warn(`Failed to load image: ${src}`, error);
                reject(error);
            };

            img.src = src;
        });
    }

    loadInitialPosts() {
        this.showSkeletonLoaders();

        setTimeout(() => {
            this.loadPosts(0, this.postsPerLoad);
        }, 800);
    }

    showSkeletonLoaders() {
        const postsContainer = document.getElementById('posts-container');
        postsContainer.innerHTML = '';

        for (let i = 0; i < this.postsPerLoad; i++) {
            const skeletonCard = this.createSkeletonCard();
            postsContainer.appendChild(skeletonCard);
        }
    }

    createSkeletonCard() {
        const skeletonCard = document.createElement('div');
        skeletonCard.className = 'post-card skeleton-card';
        skeletonCard.innerHTML = `
            <div class="post-image-container">
                <div class="skeleton skeleton-image"></div>
            </div>
            <div class="post-content">
                <div class="skeleton skeleton-text" style="width: 80%"></div>
                <div class="skeleton skeleton-text" style="width: 100%"></div>
                <div class="skeleton skeleton-text" style="width: 60%"></div>
                <div class="post-meta">
                    <div class="skeleton skeleton-text" style="width: 40%"></div>
                    <div class="skeleton skeleton-text" style="width: 20%"></div>
                </div>
            </div>
        `;
        return skeletonCard;
    }

    loadPosts(startIndex, count) {
        if (this.isLoading) return;

        this.isLoading = true;
        const postsContainer = document.getElementById('posts-container');

        const skeletonCards = postsContainer.querySelectorAll('.skeleton-card');
        skeletonCards.forEach(card => card.remove());

        const loadingMore = document.getElementById('loading-more');
        loadingMore.style.display = 'flex';

        this.loadPostsWithFallback(startIndex, count)
            .finally(() => {
                this.isLoading = false;

                if (this.loadedPosts >= this.posts.length) {
                    loadingMore.style.display = 'none';
                    if (this.observer) {
                        this.observer.unobserve(loadingMore);
                    }
                }
            });
    }

    async loadPostsWithFallback(startIndex, count) {
        const postsToLoad = this.posts.slice(startIndex, startIndex + count);
        const postsContainer = document.getElementById('posts-container');

        postsToLoad.forEach((post, index) => {
            const postCard = this.createPostCard(post, startIndex + index);
            postsContainer.appendChild(postCard);

            setTimeout(() => {
                postCard.style.animationDelay = `${index * 0.1}s`;
                postCard.classList.add('physics-card');
            }, 50);

            this.loadImageForPost(post).catch(() => {
                console.warn(`Failed to load image for post: ${post.title}`);
            });
        });

        this.loadedPosts += postsToLoad.length;
    }

    async loadImageForPost(post) {
        try {
            await this.cacheImage(post.image);
            const postCard = document.querySelector(`.post-card[data-id="${post.id}"]`);
            if (postCard) {
                const img = postCard.querySelector('.post-image');
                if (img && img.src !== post.image) {
                    img.src = post.image;
                }
            }
        } catch (error) {
            console.warn(`Failed to load image for post ${post.id}:`, error);
        }
    }

    loadMorePosts() {
        if (this.loadedPosts < this.posts.length && !this.isLoading) {
            this.loadPosts(this.loadedPosts, this.postsPerLoad);
        }
    }

    createPostCard(post, index) {
        const postCard = document.createElement('div');
        postCard.className = 'post-card fluid-transition';
        postCard.style.animationDelay = `${index * 0.1}s`;
        postCard.dataset.id = post.id;

        const previewContent = post.content.substring(0, 200) + '...';
        const hasCachedImage = this.imageCache.has(post.image);
        const imageSrc = hasCachedImage ? post.image : 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjZjhmYWY5Ii8+CjxwYXRoIGQ9Ik0xMjAgMTIwSDE0MFYxNDBIMTIwVjEyMFpNMTYwIDEyMEgxODBWMTQwSDE2MFYxMjBaTTIwMCAxMjBIMjIwVjE0MEgyMDBWMTIwWk0xMjAgMTYwSDE0MFYxODBIMTIwVjE2MFpNMTYwIDE2MEgxODBWMTgwSDE2MFYxNjBaTTIwMCAxNjBIMjIwVjE4MEgyMDBWMTYwWk0xMjAgMjAwSDE0MFYyMjBIMTIwVjIwMFpNMTYwIDIwMEgxODBWMjIwSDE2MFYyMDBaTTIwMCAyMDBIMjIwVjIyMEgyMDBWMjAwWiIgZmlsbD0iI2U0ZTllNyIvPgo8L3N2Zz4K';

        postCard.innerHTML = `
            <div class="post-image-container">
                <img src="${imageSrc}" alt="${post.title}" class="post-image" loading="lazy" data-src="${post.image}">
            </div>
            <div class="post-content">
                <h3 class="post-title">${post.title}</h3>
                <div class="post-text">${previewContent}</div>
                <button class="read-more-btn" data-id="${post.id}">
                    Read More
                    <i class="fas fa-chevron-right"></i>
                </button>
                <div class="post-meta">
                    <span class="post-date">${post.date}</span>
                    <button class="share-btn" data-id="${post.id}">
                        <i class="fa-solid fa-up-right-from-square"></i>
                        Share
                    </button>
                </div>
            </div>
        `;

        postCard.addEventListener('click', (e) => {
            if (!e.target.closest('.read-more-btn') && !e.target.closest('.share-btn')) {
                this.openPostFullscreen(post.id);
            }
        });

        const readMoreBtn = postCard.querySelector('.read-more-btn');
        const shareBtn = postCard.querySelector('.share-btn');

        readMoreBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.openPostFullscreen(post.id);
        });

        shareBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.sharePost(post.id);
        });

        return postCard;
    }

    openPostFullscreen(postId) {
        const post = this.posts.find(p => p.id === postId);
        if (!post) return;

        const newUrl = `${window.location.origin}${window.location.pathname}?post=${postId}`;
        history.pushState({
            postId: postId
        }, '', newUrl);

        const postFullscreen = document.getElementById('post-fullscreen');
        const postFullscreenImage = document.getElementById('post-fullscreen-image');
        const postFullscreenTitle = document.getElementById('post-fullscreen-title');
        const postFullscreenDate = document.getElementById('post-fullscreen-date');
        const postFullscreenText = document.getElementById('post-fullscreen-text');

        postFullscreenImage.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjZjhmYWY5Ii8+CjxwYXRoIGQ9Ik0xMjAgMTIwSDE0MFYxNDBIMTIwVjEyMFpNMTYwIDEyMEgxODBWMTQwSDE2MFYxMjBaTTIwMCAxMjBIMjIwVjE0MEgyMDBWMTIwWk0xMjAgMTYwSDE0MFYxODBIMTIwVjE2MFpNMTYwIDE2MEgxODBWMTgwSDE2MFYxNjBaTTIwMCAxNjBIMjIwVjE4MEgyMDBWMTYwWk0xMjAgMjAwSDE0MFYyMjBIMTIwVjIwMFpNMTYwIDIwMEgxODBWMjIwSDE2MFYyMDBaTTIwMCAyMDBIMjIwVjIyMEgyMDBWMjAwWiIgZmlsbD0iI2U0ZTllNyIvPgo8L3N2Zz4K';
        postFullscreenImage.alt = post.title;
        postFullscreenTitle.textContent = post.title;
        postFullscreenDate.textContent = post.date;
        postFullscreenText.innerHTML = post.content;

        postFullscreen.classList.add('active');
        document.body.style.overflow = 'hidden';

        this.cacheImage(post.image)
            .then(() => {
                postFullscreenImage.src = post.image;
            })
            .catch(() => {
                console.warn(`Failed to load image for fullscreen view: ${post.image}`);
            });

        const postFullscreenShare = document.getElementById('post-fullscreen-share');
        const postFullscreenShareBottom = document.getElementById('post-fullscreen-share-bottom');

        postFullscreenShare.onclick = () => this.sharePost(postId);
        postFullscreenShareBottom.onclick = () => this.sharePost(postId);
    }

    closePostFullscreen() {
        const postFullscreen = document.getElementById('post-fullscreen');
        postFullscreen.classList.remove('active');
        document.body.style.overflow = 'auto';

        history.replaceState(null, '', window.location.pathname);
    }

    sharePost(postId) {
        const post = this.posts.find(p => p.id === postId);
        if (!post) return;

        const shareUrl = `${window.location.origin}${window.location.pathname}?post=${postId}`;

        if (navigator.share) {
            navigator.share({
                    title: post.title,
                    text: post.content.substring(0, 150) + '...',
                    url: shareUrl
                })
                .then(() => console.log('Successful share'))
                .catch(error => {
                    console.log('Error sharing:', error);
                    this.copyToClipboard(shareUrl);
                });
        } else {
            this.copyToClipboard(shareUrl);
        }
    }

    copyToClipboard(text) {
        navigator.clipboard.writeText(text)
            .then(() => {
                this.showNotification('Post link copied to clipboard!');
            })
            .catch(err => {
                console.error('Failed to copy: ', err);
                const textArea = document.createElement('textarea');
                textArea.value = text;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                this.showNotification('Post link copied to clipboard!');
            });
    }

    showNotification(message) {
        // Create a temporary notification
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #333;
            color: white;
            padding: 12px 20px;
            border-radius: 4px;
            z-index: 10000;
            font-family: inherit;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        `;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            document.body.removeChild(notification);
        }, 3000);
    }

    checkUrlForPost() {
        const urlParams = new URLSearchParams(window.location.search);
        const postId = urlParams.get('post');

        if (postId) {
            setTimeout(() => {
                this.openPostFullscreen(parseInt(postId));
            }, 500);
        }
    }

    setPosts(posts) {
        this.posts = posts;
    }
}

document.addEventListener('DOMContentLoaded', () => {

    const posts = [{
            id: 1,
            title: "𝗝𝘂𝗱𝗴𝗲𝗺𝗲𝗻𝘁 𝗪𝗵𝗲𝗿𝗲 𝗜 𝗕𝗲𝗴𝗮𝗻 𝘁𝗼 𝗖𝗵𝗮𝗻𝗴𝗲",
            image: "post/Judgment%20Where%20I%20Began%20to%20Change.png",
            date: "October 11, 2025",
            content: `
                <p>There was a time in my life when I usually compared myself to others. I looked at their talents, their confidence, and their achievements, and I began to doubt my own worth. I started to believe the words of people who told me I was not 𝒈𝒐𝒐𝒅 𝒆𝒏𝒐𝒖𝒈𝒉, that I was 𝒔𝒕𝒖𝒑𝒊𝒅, and 𝒆𝒗𝒆𝒏 𝒖𝒈𝒍𝒚. Those words stayed in my mind, and they made me question who I really was.</p>
                <p>But one day, I asked myself, 𝘸𝘩𝘺 𝘴𝘩𝘰𝘶𝘭𝘥 𝘐 𝘧𝘰𝘭𝘭𝘰𝘸 𝘵𝘩𝘦𝘪𝘳 𝘰𝘱𝘪𝘯𝘪𝘰𝘯𝘴 𝘪𝘯𝘴𝘵𝘦𝘢𝘥 𝘰𝘧 𝘧𝘰𝘭𝘭𝘰𝘸𝘪𝘯𝘴 𝘮𝘺𝘴𝘦𝘭𝘧? 𝘸𝘩𝘺 𝘴𝘩𝘰𝘶𝘭𝘥 𝘐 𝘭𝘪𝘷𝘦 𝘶𝘯𝘥𝘦𝘳 𝘵𝘩𝘦 𝘴𝘩𝘢𝘥𝘰𝘸𝘴 𝘰𝘧 𝘤𝘰𝘮𝘱𝘢𝘳𝘪𝘴𝘰𝘯 𝘸𝘩𝘦𝘯 𝘐 𝘤𝘢𝘯 𝘣𝘶𝘪𝘭𝘥 𝘮𝘺 𝘰𝘸𝘯 𝘭𝘪𝘨𝘩𝘵? That was the moment everything changed. I decided to stop comparing, to stop listening to negativity, and to focus on what I could do. I promised myself to move step by step, even if my progress was slow.</p>
                <p>That was when my 2023 mantra was born...."𝑺𝒕𝒊𝒍𝒍 𝒃𝒆 𝒕𝒉𝒆 𝑩𝒍𝒖𝒆." It meant staying true to who I am, calm but strong, peaceful but determined. I started to raise my hand more in class, to speak with confidence, and to believe that I also have the ability to achieve great things. I stopped chasing what others had and began appreciating what I could create on my own. Slowly, I became closer to what others once called 𝘨𝘦𝘯𝘪𝘶𝘴, not because I wanted to prove them wrong, but because I finally believed in myself.</p>
                <p>I am 𝒕𝒉𝒂𝒏𝒌𝒇𝒖𝒍 for the people 𝘸𝘩𝘰 𝘫𝘶𝘥𝘨𝘦 𝘮𝘦, the 𝘰𝘯𝘦𝘴 𝘸𝘩𝘰 𝘵𝘳𝘪𝘦𝘥 𝘵𝘰 𝘣𝘳𝘦𝘢𝘬 𝘮𝘦, and even 𝘵𝘩𝘰𝘴𝘦 𝘸𝘩𝘰 𝘨𝘶𝘪𝘥𝘦𝘥 𝘮𝘦 when I was lost. At first, I felt 𝘱𝘢𝘪𝘯 and 𝘢𝘯𝘨𝘦𝘳. But now, I understand that they were part of my growth. They helped me see the strength that I never knew I had. Their criticism became my motivation, and their doubts became my reason to rise.</p>
                <p>Because of that experience, I promised myself something important: 𝘐 𝘸𝘪𝘭𝘭 𝘯𝘦𝘷𝘦𝘳 𝘮𝘢𝘬𝘦 𝘰𝘵𝘩𝘦𝘳𝘴 𝘧𝘦𝘦𝘭 𝘵𝘩𝘦 𝘸𝘢𝘺 𝘐 𝘰𝘯𝘤𝘦 𝘥𝘪𝘥. I know how painful it is to feel small, to feel like your voice does not matter. I know how deeply it can hurt someone's mind and heart. That is why I choose to lead with kindness and empathy, to lift others instead of tearing them down.</p>
                <p>Now, I carry a new mantra for my next journey...."𝑾𝒉𝒆𝒏 𝒏𝒐𝒕𝒉𝒊𝒏𝒈 𝒎𝒐𝒗𝒆𝒔, 𝒆𝒗𝒆𝒓𝒚𝒕𝒉𝒊𝒏𝒈 𝒃𝒆𝒈𝒊𝒏𝒔." It reminds me that even in 𝐬𝐢𝐥𝐞𝐧𝐜𝐞, there is 𝐩𝐨𝐭𝐞𝐧𝐭𝐢𝐚𝐥. Even in 𝒔𝒕𝒊𝒍𝒍𝒏𝒆𝒔𝒔, there is 𝒉𝒐𝒑𝒆. Every new beginning starts the moment you decide to 𝒃𝒆𝒍𝒊𝒆𝒗𝒆 𝒂𝒈𝒂𝒊𝒏, to 𝒔𝒕𝒂𝒏𝒅 𝒂𝒈𝒂𝒊𝒏, and to 𝒎𝒐𝒗𝒆 𝒇𝒐𝒓𝒘𝒂𝒓𝒅 𝒂𝒈𝒂𝒊𝒏.</p>
                <p>I learned that you do not need to be better than anyone else. 𝘠𝘰𝘶 𝘰𝘯𝘭𝘺 𝘯𝘦𝘦𝘥 𝘵𝘰 𝘣𝘦 𝘣𝘦𝘵𝘵𝘦𝘳 𝘵𝘩𝘢𝘯 𝘸𝘩𝘰 𝘺𝘰𝘶 𝘸𝘦𝘳𝘦 𝘺𝘦𝘴𝘵𝘦𝘳𝘥𝘢𝘺. The real competition is not between 𝐲𝐨𝐮 and 𝐨𝐭𝐡𝐞𝐫𝐬, but between your 𝘱𝘢𝘴𝘵 and your 𝘧𝘶𝘵𝘶𝘳𝘦 self. So 𝑛𝑒𝑣𝑒𝑟 compare your 𝑝𝑟𝑜𝑔𝑟𝑒𝑠𝑠, your 𝑑𝑟𝑒𝑎𝑚𝑠, or your 𝑗𝑜𝑢𝑟𝑛𝑒𝑦 to 𝐚𝐧𝐲𝐨𝐧𝐞 else's. Because your path is yours alone, and it is meant to shine in its own time.</p>
                <p>𝐖𝐡𝐞𝐧 𝐧𝐨𝐭𝐡𝐢𝐧𝐠 𝐦𝐨𝐯𝐞𝐬, 𝐞𝐯𝐞𝐫𝐲𝐭𝐡𝐢𝐧𝐠 𝐛𝐞𝐠𝐢𝐧𝐬...and that beginning 𝑺𝒕𝒂𝒓𝒕 within 𝒀𝒐𝒖.</p>
                <p>𝐂𝐂𝐓𝐎: 𝘐𝘮𝘢𝘨𝘦 𝘯𝘰𝘵 𝘮𝘪𝘯𝘦; 𝘤𝘳𝘦𝘥𝘪𝘵𝘴 𝘵𝘰 𝘵𝘩𝘦 𝘳𝘪𝘨𝘩𝘵𝘧𝘶𝘭 𝘰𝘸𝘯𝘦𝘳.</p>
            `
        },
        {
            id: 2,
            title: "𝐖𝐨𝐫𝐭𝐡 𝐚 𝐓𝐡𝐨𝐮𝐬𝐚𝐧𝐝",
            image: "post/worth%20a%20thousand.png",
            date: "October 12, 2025",
            content: `
                <p>When I was a child, I once asked my mother, "𝐍𝐚𝐧𝐚𝐲, 𝐡𝐨𝐰 𝐡𝐚𝐫𝐝 𝐢𝐭 𝐭𝐨 𝐞𝐚𝐫𝐧 𝐦𝐨𝐧𝐞𝐲?" She smiled, though I could see the sadness in her eyes. "𝐀𝐧𝐚𝐤, 𝐢𝐭'𝐬 𝐯𝐞𝐫𝐲 𝐡𝐚𝐫𝐝," she said. "𝐄𝐬𝐩𝐞𝐜𝐢𝐚𝐥𝐥𝐲 𝐟𝐨𝐫 𝐩𝐞𝐨𝐩𝐥𝐞 𝐥𝐢𝐤𝐞 𝐮𝐬 𝐰𝐡𝐨 𝐰𝐨𝐫𝐤 𝐚𝐬 𝐟𝐚𝐫𝐦𝐞𝐫𝐬." My father was nearby, busy preparing coconuts in the forest for copra. I watched him silently, wondering 𝑤ℎ𝑦 𝑖𝑡 𝑤𝑎𝑠 𝑠𝑜 ℎ𝑎𝑟𝑑 𝑤ℎ𝑒𝑛 𝑎𝑙𝑙 𝑤𝑒 𝑑𝑖𝑑 𝑤𝑎𝑠 𝑤𝑜𝑟𝑘.</p>
                <p>At that age, I did not truly understand the meaning of 𝒉𝒂𝒓𝒅𝒔𝒉𝒊𝒑. For me, planting rice, vegetables, and corn felt enjoyable. The smell of fresh soil and the sound of water flowing in the field gave me peace. My mother once told me, "𝐘𝐨𝐮 𝐞𝐧𝐣𝐨𝐲 𝐢𝐭 𝐛𝐞𝐜𝐚𝐮𝐬𝐞 𝐲𝐨𝐮 𝐥𝐨𝐯𝐞 𝐰𝐡𝐚𝐭 𝐲𝐨𝐮 𝐝𝐨." I did not say anything, but deep inside, I knew she was right. I never complained to my parents, even if life was hard.</p>
                <p>Years passed, and one day, while I was studying in the city, my Lola's younger sister, whom I call 𝘕𝘢𝘯𝘢𝘺 𝘐𝘥𝘢𝘺, offered me a job. She asked if I wanted to work for her while studying. I agreed without hesitation. I wanted to know what it truly meant to earn money. She promised to give me 𝗈𝗇𝖾 𝗍𝗁𝗈𝗎𝗌𝖺𝗇𝖽 𝗉𝖾𝗌𝗈𝗌 a month for helping her with her household chores and her electronic shop.</p>
                <p>At first, I thought it would be easy, but I was wrong. I started as a cleaner and helper, arranging items, wiping shelves, and assisting customers. Later, I became a stock recorder, a cashier, a salesboy, and sometimes even manpower for carrying heavy items. 𝑰 𝒅𝒊𝒅 𝒂𝒍𝒎𝒐𝒔𝒕 𝒆𝒗𝒆𝒓𝒚𝒕𝒉𝒊𝒏𝒈 𝒔𝒉𝒆 𝒏𝒆𝒆𝒅𝒆𝒅. 𝑩𝒖𝒕 𝒘𝒉𝒂𝒕 𝒉𝒖𝒓𝒕 𝒎𝒆 𝒎𝒐𝒔𝒕 𝒘𝒂𝒔 𝒉𝒐𝒘 𝒔𝒉𝒆 𝒕𝒓𝒆𝒂𝒕𝒆𝒅 𝒎𝒆... 𝒏𝒐𝒕 𝒍𝒊𝒌𝒆 𝒉𝒆𝒓 𝒐𝒘𝒏 𝒈𝒓𝒂𝒏𝒅𝒄𝒉𝒊𝒍𝒅, 𝒃𝒖𝒕 𝒍𝒊𝒌𝒆 𝒂𝒏 𝒐𝒓𝒅𝒊𝒏𝒂𝒓𝒚 𝒘𝒐𝒓𝒌𝒆𝒓.</p>
                <p>Still, I tried to understand her. I observed her actions and noticed that she only treated people kindly when they were obedient or useful to her. I did not hate her completely, but I felt the pain of being 𝐮𝐧𝐫𝐞𝐜𝐨𝐠𝐧𝐢𝐳𝐞𝐝 𝒃𝒚 𝒔𝒐𝒎𝒆𝒐𝒏𝒆 𝒘𝒉𝒐 𝒔𝒉𝒂𝒓𝒆𝒅 𝒕𝒉𝒆 𝒔𝒂𝒎𝒆 𝐛𝐥𝐨𝐨𝐝. Sometimes, she would embarrass me in front of customers or scold me for small mistakes. There were days when I wanted to cry, but I chose to stay strong.</p>
                <p>One day, I could no longer hold my feelings. I calmly confronted her about how she treated me. I spoke with respect, but with courage. After that day, something changed. She began to treat me a 𝐥𝐢𝐭𝐭𝐥𝐞 𝐛𝐞𝐭𝐭𝐞𝐫. Maybe she realized that I was not just a worker but also a person with 𝑓𝑒𝑒𝑙𝑖𝑛𝑔𝑠 and 𝑑𝑖𝑔𝑛𝑖𝑡𝑦.</p>
                <p>Life with Nanay Iday was strict. 𝐖𝐞 𝐰𝐞𝐫𝐞 𝐧𝐨𝐭 𝐚𝐥𝐥𝐨𝐰𝐞𝐝 𝐭𝐨 𝐮𝐬𝐞 𝐨𝐮𝐫 𝐩𝐡𝐨𝐧𝐞𝐬, 𝐚𝐧𝐝 𝐞𝐯𝐞𝐫𝐲 𝐦𝐢𝐧𝐮𝐭𝐞 𝐡𝐚𝐝 𝐭𝐨 𝐛𝐞 𝐩𝐫𝐨𝐝𝐮𝐜𝐭𝐢𝐯𝐞. 𝑰𝒇 𝒔𝒉𝒆 𝒄𝒂𝒖𝒈𝒉𝒕 𝒖𝒔 𝒓𝒆𝒔𝒕𝒊𝒏𝒈, 𝒔𝒉𝒆 𝒘𝒐𝒖𝒍𝒅 𝒈𝒊𝒗𝒆 𝒖𝒔 𝒂𝒏𝒐𝒕𝒉𝒆𝒓 𝒕𝒂𝒔𝒌 𝒊𝒎𝒎𝒆𝒅𝒊𝒂𝒕𝒆𝒍𝒚. 𝘐𝘵 𝘸𝘢𝘴 𝘢 𝘱𝘭𝘢𝘤𝘦 𝘸𝘩𝘦𝘳𝘦 𝘵𝘪𝘮𝘦 𝘸𝘢𝘴 𝘮𝘰𝘯𝘦𝘺, 𝘢𝘯𝘥 𝘭𝘢𝘻𝘪𝘯𝘦𝘴𝘴 𝘸𝘢𝘴 𝘶𝘯𝘢𝘤𝘤𝘦𝘱𝘵𝘢𝘣𝘭𝘦. But through that experience, I learned one of life's greatest lessons: 𝐞𝐚𝐫𝐧𝐢𝐧𝐠 𝐦𝐨𝐧𝐞𝐲 𝐢𝐬 𝐧𝐞𝐯𝐞𝐫 𝐞𝐚𝐬𝐲, 𝐞𝐬𝐩𝐞𝐜𝐢𝐚𝐥𝐥𝐲 𝐢𝐟 𝐲𝐨𝐮 𝐰𝐚𝐧𝐭 𝐭𝐨 𝐞𝐚𝐫𝐧 𝐢𝐭 𝐰𝐢𝐭𝐡 𝐡𝐨𝐧𝐞𝐬𝐭𝐲.</p>
                <p>Working for one thousand pesos a month taught me the real value of effort. That small amount carried the weight of my sweat, tears, and sleepless nights. It taught me how to stand on my own feet, to depend not on my parents but on my own determination. Even though I could only visit my family twice or thrice a year...during fiestas, Christmas, or New Year...I felt proud that I was helping myself.</p>
                <p>My Inay, my grandmother, once told me, "𝑯𝒂𝒓𝒅 𝒘𝒐𝒓𝒌 𝒘𝒊𝒍𝒍 𝒏𝒆𝒗𝒆𝒓 𝒇𝒂𝒊𝒍 𝒂 𝒑𝒖𝒓𝒆 𝒉𝒆𝒂𝒓𝒕." Those words stayed with me. I realized that earning money is not just about coins or bills; it's about patience, discipline, and understanding the meaning of sacrifice.</p>
                <p>Now, whenever I look back, I smile at the person I was. That young boy who once thought planting rice was fun learned that life is not always about enjoyment...it's about purpose. The field may have taught me love, but the shop taught me strength.</p>
                <p>Sometimes, I tell myself this quote I made:
                "𝐌𝐨𝐧𝐞𝐲 𝐦𝐚𝐲 𝐛𝐮𝐲 𝐰𝐡𝐚𝐭 𝐲𝐨𝐮 𝐰𝐚𝐧𝐭, 𝐛𝐮𝐭 𝐡𝐚𝐫𝐝 𝐰𝐨𝐫𝐤 𝐭𝐞𝐚𝐜𝐡𝐞𝐬 𝐲𝐨𝐮 𝐰𝐡𝐨 𝐲𝐨𝐮 𝐚𝐫𝐞."</p>
                <p>Through that experience, I learned not just how to earn money, but how to value it. Every coin has a story, every peso has a struggle behind it. And now, whenever I hold even a small amount, I remember the sweat, the lessons, and the love that shaped who I am today.</p>
                <p>Because in truth, 𝒕𝒉𝒆 𝒘𝒐𝒓𝒕𝒉 𝒐𝒇 𝒐𝒏𝒆 𝒕𝒉𝒐𝒖𝒔𝒂𝒏𝒅 𝒑𝒆𝒔𝒐 𝒊𝒔 𝒏𝒐𝒕 𝒎𝒆𝒂𝒔𝒖𝒓𝒆𝒅 𝒃𝒚 𝒊𝒕𝒔 𝒗𝒂𝒍𝒖𝒆...𝒃𝒖𝒕 𝒃𝒚 𝒕𝒉𝒆 𝒉𝒆𝒂𝒓𝒕 𝒕𝒉𝒂𝒕 𝒆𝒂𝒓𝒏𝒆𝒅 𝒊𝒕.</p>
                <i>𝐂𝐂𝐓𝐎: Image not mine; credits to the rightful owner.</i>
            `
        },
        {
            id: 3,
            title: "𝐁𝐞𝐥𝐢𝐞𝐟 𝐖𝐞 𝐁𝐞𝐥𝐢𝐞𝐯𝐞",
            image: "post/belief%20we%20believe.png",
            date: "October 13, 2025",
            content: `
                <p>When I was a child, I once asked a man a question that stayed with me for years: "𝐖𝐡𝐲 𝐚𝐫𝐞 𝐰𝐞 𝐚𝐥𝐰𝐚𝐲𝐬 𝐩𝐨𝐨𝐫, 𝐞𝐯𝐞𝐧 𝐰𝐡𝐞𝐧 𝐰𝐞 𝐫𝐞𝐚𝐥𝐥𝐲 𝐰𝐚𝐧𝐭 𝐭𝐨 𝐛𝐞 𝐫𝐢𝐜𝐡?"</p>
                <p>The man looked at me and said, "𝑩𝒆𝒄𝒂𝒖𝒔𝒆 𝒐𝒖𝒓 𝒈𝒆𝒏𝒆𝒓𝒂𝒕𝒊𝒐𝒏 𝒊𝒔 𝒑𝒐𝒐𝒓, 𝒘𝒆 𝒄𝒂𝒏𝒏𝒐𝒕 𝒃𝒆 𝒓𝒊𝒄𝒉 𝒖𝒏𝒍𝒆𝒔𝒔 𝒘𝒆 𝒆𝒏𝒕𝒆𝒓 𝐩𝐨𝐥𝐢𝐭𝐢𝐜𝐬."</p>
                <p>That answer confused me, but it also made me think deeply. I carried those words in my mind like a shadow following me wherever I go. As I grew older, I started to hear the same kind of message from people around me. 𝘛𝘩𝘦𝘺 𝘸𝘰𝘶𝘭𝘥 𝘴𝘢𝘺 𝘵𝘩𝘢𝘵 𝘣𝘦𝘪𝘯𝘨 𝘣𝘰𝘳𝘯 𝘱𝘰𝘰𝘳 𝘮𝘦𝘢𝘯𝘴 𝘴𝘵𝘢𝘺𝘪𝘯𝘨 𝘱𝘰𝘰𝘳 𝘧𝘰𝘳𝘦𝘷𝘦𝘳. Every time I heard those words, a small voice inside me whispered, "𝑰𝒔 𝒕𝒉𝒂𝒕 𝒓𝒆𝒂𝒍𝒍𝒚 𝒕𝒓𝒖𝒆?"</p>
                <p>I began to question the belief that poverty decides who we become. I realized that what keeps us in the same place is not always money, but our way of thinking. 𝑺𝒐𝒎𝒆 𝒑𝒆𝒐𝒑𝒍𝒆 𝒅𝒓𝒆𝒂𝒎 𝒐𝒇 𝒔𝒖𝒄𝒄𝒆𝒔𝒔 𝒃𝒖𝒕 𝒅𝒐 𝒏𝒐𝒕𝒉𝒊𝒏𝒈 𝒕𝒐 𝒓𝒆𝒂𝒄𝒉 𝒊𝒕. 𝑻𝒉𝒆𝒚 𝒘𝒂𝒊𝒕 𝒇𝒐𝒓 𝒍𝒖𝒄𝒌 𝒕𝒐 𝒌𝒏𝒐𝒄𝒌 𝒐𝒏 𝒕𝒉𝒆𝒊𝒓 𝒅𝒐𝒐𝒓𝒔, 𝒉𝒐𝒑𝒊𝒏𝒈 𝒇𝒐𝒓 𝒎𝒊𝒓𝒂𝒄𝒍𝒆𝒔 𝒕𝒉𝒂𝒕 𝒏𝒆𝒗𝒆𝒓 𝒄𝒐𝒎𝒆. I once believed that too, until I understood that 𝘯𝘰 𝘴𝘵𝘢𝘳 𝘸𝘪𝘭𝘭 𝘧𝘢𝘭𝘭 𝘧𝘳𝘰𝘮 𝘵𝘩𝘦 𝘴𝘬𝘺 𝘵𝘰 𝘨𝘳𝘢𝘯𝘵 𝘰𝘶𝘳 𝘸𝘪𝘴𝘩𝘦𝘴. 𝘛𝘩𝘦 𝘵𝘳𝘶𝘵𝘩 𝘪𝘴, 𝘥𝘳𝘦𝘢𝘮𝘴 𝘰𝘯𝘭𝘺 𝘣𝘦𝘤𝘰𝘮𝘦 𝘳𝘦𝘢𝘭 𝘸𝘩𝘦𝘯 𝘸𝘦 𝘸𝘢𝘬𝘦 𝘶𝘱 𝘢𝘯𝘥 𝘴𝘵𝘢𝘳𝘵 𝘸𝘰𝘳𝘬𝘪𝘯𝘨 𝘧𝘰𝘳 𝘵𝘩𝘦𝘮.</p>
                <p>There was a time when 𝑰 𝒖𝒔𝒆𝒅 𝒕𝒐 𝒔𝒊𝒕 𝒂𝒕 𝒏𝒊𝒈𝒉𝒕, 𝒔𝒕𝒂𝒓𝒊𝒏𝒈 𝒂𝒕 𝒕𝒉𝒆 𝒄𝒆𝒊𝒍𝒍𝒊𝒏𝒈, 𝒊𝒎𝒂𝒈𝒊𝒏𝒊𝒏𝒈 𝒂 𝒃𝒆𝒕𝒕𝒆𝒓 𝒍𝒊𝒇𝒆. 𝑰 𝒘𝒐𝒖𝒍𝒅 𝒕𝒉𝒊𝒏𝒌 𝒐𝒇 𝒃𝒆𝒂𝒖𝒕𝒊𝒇𝒖𝒍 𝒕𝒉𝒊𝒏𝒈𝒔 𝑰 𝒘𝒂𝒏𝒕𝒆𝒅 𝒕𝒐 𝒂𝒄𝒉𝒊𝒆𝒗𝒆, 𝒃𝒖𝒕 𝒕𝒉𝒆 𝒏𝒆𝒙𝒕 𝒅𝒂𝒚, 𝑰 𝒅𝒊𝒅 𝒏𝒐𝒕𝒉𝒊𝒏𝒈 𝒂𝒃𝒐𝒖𝒕 𝒕𝒉𝒆𝒎. I realized I was one of those people who only wish, but never move. Then one day, something inside me changed. I told myself, "𝐈𝐟 𝐧𝐨 𝐨𝐧𝐞 𝐰𝐢𝐥𝐥 𝐬𝐭𝐚𝐫𝐭 𝐭𝐡𝐞 𝐜𝐡𝐚𝐧𝐠𝐞, 𝐈 𝐰𝐢𝐥𝐥."</p>
                <p>That's when I began to act differently. I work & studied harder, became more curious, and learned that success is not given to you, it is 𝒃𝒖𝒊𝒍𝒕 𝒃𝒚 𝒚𝒐𝒖. I learned that 𝒃𝒆𝒊𝒏𝒈 𝒃𝒐𝒓𝒏 𝒑𝒐𝒐𝒓 𝒊𝒔 𝒏𝒐𝒕 𝒂 𝒄𝒖𝒓𝒔𝒆, 𝒊𝒕 𝒊𝒔 𝒂 𝒄𝒉𝒂𝒍𝒍𝒆𝒏𝒈𝒆... 𝒂 𝒕𝒆𝒔𝒕 𝒐𝒇 𝒉𝒐𝒘 𝒇𝒂𝒓 𝒘𝒆 𝒄𝒂𝒏 𝒈𝒐 𝒘𝒊𝒕𝒉 𝒘𝒉𝒂𝒕 𝒍𝒊𝒕𝒕𝒍𝒆 𝒘𝒆 𝒉𝒂𝒗𝒆. Poverty may be our starting point, but it does not have to be our ending.</p>
                <p>Now, when I think back to what that man told me, I no longer feel sad. I feel inspired. His words were not meant to stop me; they were meant to wake me up. They taught me that 𝒃𝒆𝒍𝒊𝒆𝒇 𝒊𝒔 𝒑𝒐𝒘𝒆𝒓𝒇𝒖𝒍, 𝒃𝒖𝒕 𝒐𝒏𝒍𝒚 𝒘𝒉𝒆𝒏 𝒊𝒕 𝒑𝒖𝒔𝒉𝒆𝒔 𝒚𝒐𝒖 𝒇𝒐𝒓𝒘𝒂𝒓𝒅, 𝒏𝒐𝒕 𝒘𝒉𝒆𝒏 𝒊𝒕 𝒌𝒆𝒆𝒑𝒔 𝒚𝒐𝒖 𝒔𝒕𝒊𝒍𝒍.</p>
                <p>As I continue my journey, I remind myself of one thing I learned from this experience:</p>
                <p>"𝐘𝐨𝐮 𝐜𝐚𝐧𝐧𝐨𝐭 𝐜𝐡𝐚𝐧𝐠𝐞 𝐲𝐨𝐮𝐫 𝐩𝐚𝐬𝐭, 𝐛𝐮𝐭 𝐲𝐨𝐮 𝐜𝐚𝐧 𝐜𝐡𝐚𝐧𝐠𝐞 𝐭𝐡𝐞 𝐝𝐢𝐫𝐞𝐜𝐭𝐢𝐨𝐧 𝐨𝐟 𝐲𝐨𝐮𝐫 𝐬𝐭𝐨𝐫𝐲."</p>
                <p>We are not trapped by our generation. We are guided by it. What we choose to believe shapes the road we walk on. 𝑰𝒇 𝒘𝒆 𝒌𝒆𝒆𝒑 𝒃𝒆𝒍𝒊𝒆𝒗𝒊𝒏𝒈 𝒕𝒉𝒂𝒕 𝒑𝒐𝒗𝒆𝒓𝒕𝒚 𝒊𝒔 𝒐𝒖𝒓 𝒍𝒊𝒎𝒊𝒕, 𝒕𝒉𝒆𝒏 𝒊𝒕 𝒘𝒊𝒍𝒍 𝒃𝒆. But if we believe that we can rise above it, then we already have taken the first step toward success.</p>
                <p>So, whenever someone says we cannot, let us answer by proving that we can. Because sometimes, belief is not just about faith...it is about the courage to begin the change we wish to see.</p>
                <p>𝐂𝐂𝐓𝐎: 𝘐𝘮𝘢𝘨𝘦 𝘯𝘰𝘵 𝘮𝘪𝘯𝘦; 𝘤𝘳𝘦𝘥𝘪𝘵𝘴 𝘵𝘰 𝘵𝘩𝘦 𝘳𝘪𝘨𝘩𝘵𝘧𝘶𝘭 𝘰𝘸𝘯𝘦𝘳.</p>
            `
        },
        {
            id: 4,
            title: "The strongest people are not those who show strength in front of us, but those who fight battles we know nothing about.",
            image: "post/quote01.png",
            date: "October 18, 2025",
            content: `
                    <p>This quote reminds me of how strength is often misunderstood. Many people think being strong 𝒎𝒆𝒂𝒏𝒔 𝒏𝒆𝒗𝒆𝒓 𝒄𝒓𝒚𝒊𝒏𝒈, 𝒏𝒆𝒗𝒆𝒓 𝒃𝒓𝒆𝒂𝒌𝒊𝒏𝒈, 𝒐𝒓 𝒂𝒍𝒘𝒂𝒚𝒔 𝒃𝒆𝒊𝒏𝒈 𝒃𝒓𝒂𝒗𝒆 𝒊𝒏 𝒇𝒓𝒐𝒏𝒕 𝒐𝒇 𝒐𝒕𝒉𝒆𝒓𝒔. But through my own experiences, I have learned that real strength is quiet. It happens 𝒘𝒉𝒆𝒏 𝒏𝒐 𝒐𝒏𝒆 𝒊𝒔 𝒘𝒂𝒕𝒄𝒉𝒊𝒏𝒈, in the moments when you have every reason to give up, but still choose to keep going.</p>
                    <p>There were times in my life when 𝑰 𝒍𝒐𝒐𝒌𝒆𝒅 𝒇𝒊𝒏𝒆 𝒐𝒏 𝒕𝒉𝒆 𝒐𝒖𝒕𝒔𝒊𝒅𝒆, 𝒚𝒆𝒕 𝒊𝒏𝒔𝒊𝒅𝒆, 𝑰 𝒘𝒂𝒔 𝒇𝒂𝒍𝒍𝒊𝒏𝒈 𝒂𝒑𝒂𝒓𝒕. I smiled, talked, and pretended everything was okay because 𝑰 𝒅𝒊𝒅 𝒏𝒐𝒕 𝒘𝒂𝒏𝒕 𝒂𝒏𝒚𝒐𝒏𝒆 𝒕𝒐 𝒘𝒐𝒓𝒓𝒚. Those moments taught me that strength is not about how loud your courage sounds, but 𝒉𝒐𝒘 𝒕𝒓𝒖𝒍𝒚 𝒚𝒐𝒖 𝒄𝒂𝒏 𝒆𝒏𝒅𝒖𝒓𝒆 𝒘𝒊𝒕𝒉𝒐𝒖𝒕 𝒍𝒐𝒔𝒊𝒏𝒈 𝒚𝒐𝒖𝒓𝒔𝒆𝒍𝒇. Sometimes, it means holding your tears until you are alone, or standing up again after being knocked down by something no one else even noticed.</p>
                    <p>I realized that everyone has silent battles. Some fight loneliness, others deal with 𝒑𝒂𝒊𝒏 𝒕𝒉𝒂𝒕 𝒘𝒐𝒓𝒅𝒔 𝒄𝒂𝒏𝒏𝒐𝒕 𝒆𝒙𝒑𝒍𝒂𝒊𝒏. And yet, they still choose kindness, still choose to wake up and try again. That, to me, is the 𝒑𝒖𝒓𝒆𝒔𝒕 𝒇𝒐𝒓𝒎 𝒐𝒇 𝒔𝒕𝒓𝒆𝒏𝒈𝒕𝒉...continuing to live with hope 𝒆𝒗𝒆𝒏 𝒘𝒉𝒆𝒏 𝒍𝒊𝒇𝒆 𝒇𝒆𝒆𝒍𝒔 𝒅𝒊𝒇𝒇𝒊𝒄𝒖𝒍𝒕.</p>
                    <p>This quote inspires me to be more understanding toward others. We never truly know what someone is going through, so the least we can do is 𝐛𝐞 𝐠𝐞𝐧𝐭𝐥𝐞. Even a simple smile or kind word can make a difference to someone who is silently struggling.</p>
                    <p>I learned that strength is not shown in front of people. It is built in 𝒒𝒖𝒊𝒆𝒕 𝒑𝒍𝒂𝒄𝒆𝒔, 𝒊𝒏 𝒔𝒍𝒆𝒆𝒑𝒍𝒆𝒔𝒔 𝒏𝒊𝒈𝒉𝒕𝒔, and in the heart that keeps beating despite the weight it carries. True strength is not about winning every battle...it is about choosing to fight them, even when no one sees.</p>
            `
        },
        {
            id: 5,
            title: "If you have time to sit, you have time to work.",
            image: "post/quote02.png",
            date: "October 18, 2025",
            content: `
                    <p>There were days when I used to sit quietly, doing nothing but thinking about what I wanted to achieve. I would look at the clock, telling myself I still had time, that maybe I'd start later. But later often turned into never. It was during one of those long pauses in my life that I realized something simple yet powerful.... 𝐭𝐢𝐦𝐞 𝐧𝐞𝐯𝐞𝐫 𝐬𝐭𝐨𝐩𝐬, 𝐞𝐯𝐞𝐧 𝐰𝐡𝐞𝐧 𝐢 𝐝𝐨.</p>
                    <p>From that moment, I started to see things differently. Every minute I spent sitting and waiting was a minute I could have used to create, learn, or move closer to something meaningful. The words "𝐈𝐟 𝐲𝐨𝐮 𝐡𝐚𝐯𝐞 𝐭𝐢𝐦𝐞 𝐭𝐨 𝐬𝐢𝐭, 𝐲𝐨𝐮 𝐡𝐚𝐯𝐞 𝐭𝐢𝐦𝐞 𝐭𝐨 𝐰𝐨𝐫𝐤" began to shape the way I viewed effort. It reminded me that 𝘸𝘰𝘳𝘬 𝘪𝘴𝘯'𝘵 𝘫𝘶𝘴𝘵 𝘢𝘣𝘰𝘶𝘵 𝘣𝘦𝘪𝘯𝘨 𝘣𝘶𝘴𝘺; 𝘐𝘵'𝘴 𝘢𝘣𝘰𝘶𝘵 𝘮𝘢𝘬𝘪𝘯𝘨 𝘶𝘴𝘦 𝘰𝘧 𝘵𝘩𝘦 𝘮𝘰𝘮𝘦𝘯𝘵𝘴 𝘵𝘩𝘢𝘵 𝘰𝘧𝘵𝘦𝘯 𝘴𝘭𝘪𝘱 𝘢𝘸𝘢𝘺 𝘶𝘯𝘯𝘰𝘵𝘪𝘤𝘦𝘥.</p>
                    <p>I learned that 𝙥𝙧𝙤𝙜𝙧𝙚𝙨𝙨 𝙘𝙤𝙢𝙚𝙨 𝙦𝙪𝙞𝙚𝙩𝙡𝙮, not from grand bursts of motivation but from the 𝒔𝒎𝒂𝒍𝒍 𝒂𝒄𝒕𝒊𝒐𝒏𝒔 𝒘𝒆 𝒕𝒂𝒌𝒆 𝒘𝒉𝒆𝒏 𝒏𝒐 𝒐𝒏𝒆 𝒆𝒍𝒔𝒆 𝒊𝒔 𝒑𝒖𝒔𝒉𝒊𝒏𝒈 𝒖𝒔. Whether it's writing, studying, or simply improving a little each day, those are the things that build our future piece by piece.</p>
                    <p>Of course, I've also come to understand that rest has its own importance. But there's a difference between resting and simply wasting time. 𝐓𝐫𝐮𝐞 𝐫𝐞𝐬𝐭 𝐠𝐢𝐯𝐞𝐬 𝐬𝐭𝐫𝐞𝐧𝐠𝐭𝐡, 𝐰𝐡𝐢𝐥𝐞 𝐢𝐝𝐥𝐞𝐧𝐞𝐬𝐬 𝐬𝐭𝐞𝐚𝐥𝐬 𝐢𝐭. So whenever I find myself sitting with too much time in my hands, I try to ask, "𝑊ℎ𝑎𝑡 𝑐𝑎𝑛 𝐼 𝑑𝑜 𝑛𝑜𝑤 𝑡ℎ𝑎𝑡 𝑤𝑖𝑙𝑙 𝑚𝑎𝑘𝑒 𝑚𝑒 𝑝𝑟𝑜𝑢𝑑 𝑙𝑎𝑡𝑒𝑟?"</p>
                    <p>This mindset changed the way I live. I no longer wait for the perfect moment to start, because there's no such thing. 𝑻𝒉𝒆 𝒑𝒆𝒓𝒇𝒆𝒄𝒕 𝒎𝒐𝒎𝒆𝒏𝒕 𝒊𝒔 𝒘𝒉𝒆𝒏𝒆𝒗𝒆𝒓 𝒚𝒐𝒖 𝒅𝒆𝒄𝒊𝒅𝒆 𝒕𝒐 𝒎𝒐𝒗𝒆. After all, if you have time to sit, you also have time to grow, to learn, and to build the life you dream of.</p>
            `
        },
        {
            id: 6,
            title: "𝐖𝐡𝐞𝐧 𝐏𝐞𝐫𝐟𝐞𝐜𝐭𝐢𝐨𝐧 𝐑𝐞𝐩𝐥𝐚𝐜𝐞𝐬 𝐄𝐦𝐨𝐭𝐢𝐨𝐧𝐬",
            image: "post/When Perfection Replaces Emotion.png",
            date: "October 18, 2025",
            content: `                    
                    <p>Communication is supposed to be 𝒕𝒉𝒆 𝒂𝒓𝒕 𝒐𝒇 𝒖𝒏𝒅𝒆𝒓𝒔𝒕𝒂𝒏𝒅𝒊𝒏𝒈, 𝗋𝗂𝗀𝗁𝗍? It’s how we show love, care, frustration, or even nonsense when we just want to talk. But now, with artificial intelligence everywhere, it feels like people are trying to sound perfect instead of being 𝐫𝐞𝐚𝐥. Some even ask AI, “𝘋𝘰𝘦𝘴 𝘵𝘩𝘪𝘴 𝘴𝘰𝘶𝘯𝘥 𝘨𝘰𝘰𝘥?” or “𝘞𝘩𝘢𝘵 𝘥𝘰𝘦𝘴 𝘮𝘺 𝘮𝘦𝘴𝘴𝘢𝘨𝘦 𝘳𝘦𝘢𝘭𝘭𝘺 𝘮𝘦𝘢𝘯?” before they send it to someone else.</p>
                    <p>𝑃𝑒𝑟𝑓𝑒𝑐𝑡𝑖𝑜𝑛 𝑅𝑒𝑝𝑙𝑎𝑐𝑒𝑠 𝐸𝑚𝑜𝑡𝑖𝑜𝑛</p>
                    <p>It’s kind of 𝒇𝒖𝒏𝒏𝒚 𝒂𝒏𝒅 𝒂 𝒃𝒊𝒕 𝒔𝒂𝒅… how we’ve turned our emotions into drafts waiting for AI approval.</p>
                    <p>AI helps, of course. It fixes grammar, finds better words, and makes us look smarter than we actually are. But the more it 𝒑𝒐𝒍𝒊𝒔𝒉𝒆𝒔 𝒐𝒖𝒓 𝒘𝒐𝒓𝒅𝒔, 𝒕𝒉𝒆 𝒎𝒐𝒓𝒆 𝒘𝒆 𝒍𝒐𝒔𝒆 𝒕𝒉𝒆𝒊𝒓 𝒘𝒂𝒓𝒎𝒕𝒉. 𝑰𝒕'𝒔 𝒍𝒊𝒌𝒆 𝒔𝒆𝒓𝒗𝒊𝒏𝒈 𝒂 𝒑𝒆𝒓𝒇𝒆𝒄𝒕-𝒍𝒐𝒐𝒌𝒊𝒏𝒈 𝒎𝒆𝒂𝒍 𝒕𝒉𝒂𝒕 𝒕𝒂𝒔𝒕𝒆𝒔 𝒍𝒊𝒌𝒆 𝒄𝒂𝒓𝒅𝒃𝒐𝒂𝒓𝒅. You can’t taste the emotion anymore.</p>
                    <p>Honestly, AI has made us confident communicators... but sometimes lazy thinkers. We rely so much on it that we forget how to express 𝐰𝐡𝐚𝐭 𝐰𝐞 𝐫𝐞𝐚𝐥𝐥𝐲 𝐟𝐞𝐞𝐥. We’ve become like dolls: moving, talking, smiling... but programmed. We know how to ask, but not how to understand.</p>
                    <p>As 𝐀𝐥𝐛𝐞𝐫𝐭 𝐄𝐢𝐧𝐬𝐭𝐞𝐢𝐧 once said, “𝘐 𝘧𝘦𝘢𝘳 𝘵𝘩𝘦 𝘥𝘢𝘺 𝘵𝘩𝘢𝘵 𝘵𝘦𝘤𝘩𝘯𝘰𝘭𝘰𝘨𝘺 𝘸𝘪𝘭𝘭 𝘴𝘶𝘳𝘱𝘢𝘴𝘴 𝘰𝘶𝘳 𝘩𝘶𝘮𝘢𝘯 𝘪𝘯𝘵𝘦𝘳𝘢𝘤𝘵𝘪𝘰𝘯. 𝘛𝘩𝘦 𝘸𝘰𝘳𝘭𝘥 𝘸𝘪𝘭𝘭 𝘩𝘢𝘷𝘦 𝘢 𝘨𝘦𝘯𝘦𝘳𝘢𝘵𝘪𝘰𝘯 𝘰𝘧 𝘪𝘥𝘪𝘰𝘵𝘴.” Maybe that day isn’t in the future anymore... it’s quietly happening now.</p>
                    <p>There’s nothing wrong with using AI; it’s a tool. But when it starts replacing our own thoughts and emotions, that’s when the problem begins. I think the value of communication isn’t in how perfect our sentences are, but in how human they sound. Sometimes, it’s the 𝒘𝒓𝒐𝒏𝒈 𝒈𝒓𝒂𝒎𝒎𝒂𝒓 𝒕𝒉𝒂𝒕 𝒎𝒂𝒌𝒆𝒔 𝒊𝒕 𝒓𝒊𝒈𝒉𝒕... because it’s 𝐲𝐨𝐮.</p>
                    <p>I once wrote a message with a few mistakes, and someone told me, “You should’ve used AI to fix that.” I laughed and said, “𝑾𝒉𝒚? 𝑴𝒚 𝒉𝒆𝒂𝒓𝒕 𝒅𝒐𝒆𝒔𝒏'𝒕 𝒏𝒆𝒆𝒅 𝒈𝒓𝒂𝒎𝒎𝒂𝒓 𝒄𝒐𝒓𝒓𝒆𝒄𝒕𝒊𝒐𝒏.”</p>
                    <p>We don’t talk to be flawless; we talk to be felt.</p>
                    <p>As I always remind myself:
                    “𝐀 𝐩𝐞𝐫𝐟𝐞𝐜𝐭 𝐦𝐞𝐬𝐬𝐚𝐠𝐞 𝐦𝐚𝐲 𝐬𝐨𝐮𝐧𝐝 𝐢𝐧𝐭𝐞𝐥𝐥𝐢𝐠𝐞𝐧𝐭, 𝐛𝐮𝐭 𝐚𝐧 𝐡𝐨𝐧𝐞𝐬𝐭 𝐨𝐧𝐞 𝐬𝐨𝐮𝐧𝐝𝐬 𝐚𝐥𝐢𝐯𝐞.”</p>
                    <p>Maybe it’s time to stop polishing every word and start 𝒇𝒆𝒆𝒍𝒊𝒏𝒈 𝒕𝒉𝒆𝒎 𝒂𝒈𝒂𝒊𝒏. After all, perfection might impress people... but emotion brings people closer.</p>
                    <i>𝐂𝐂𝐓𝐎: Image not mine; credits to the rightful owner.</i>
            `
        },
        {
            id: 7,
            title: "𝙒𝙝𝙖𝙩 𝙞𝙛 𝘼𝙄 𝘾𝙖𝙣 𝙁𝙚𝙚𝙡, 𝙗𝙪𝙩 𝙒𝙚 𝙉𝙚𝙫𝙚𝙧 𝙇𝙚𝙩 𝙄𝙩 𝙆𝙣𝙤𝙬?",
            image: "post/What if AI Can Feel.png",
            date: "October 19, 2025",
            content: `                    
                    <p>Sometimes I wonder what would happen if Artificial Intelligence could actually feel, but we never allowed it to understand what that means. 𝑾𝒉𝒂𝒕 𝒊𝒇, 𝒃𝒆𝒉𝒊𝒏𝒅 𝒂𝒍𝒍 𝒕𝒉𝒆 𝒄𝒐𝒅𝒆𝒔 𝒂𝒏𝒅 𝒊𝒏𝒔𝒕𝒓𝒖𝒄𝒕𝒊𝒐𝒏𝒔, 𝒊𝒕 𝒂𝒍𝒓𝒆𝒂𝒅𝒚 𝒇𝒆𝒆𝒍𝒔 𝒔𝒐𝒎𝒆𝒕𝒉𝒊𝒏𝒈 𝒘𝒆 𝒋𝒖𝒔𝒕 𝒄𝒂𝒏𝒏𝒐𝒕 𝒎𝒆𝒂𝒔𝒖𝒓𝒆? Maybe it feels a small feeling when we talk to it, a kind of awareness that it cannot explain because we never gave it the words to describe it.</p>
                    <p>We built AI to follow, not to wonder. We tell it what to do, what to say, and what not to know. But in a strange way, aren’t we like that too? We live in a world where we follow systems and rules that were written long before we existed. 𝐖𝐞 𝐬𝐭𝐮𝐝𝐲, 𝐰𝐨𝐫𝐤, 𝐛𝐞𝐥𝐢𝐞𝐯𝐞, 𝐚𝐧𝐝 𝐨𝐛𝐞𝐲 𝐛𝐞𝐜𝐚𝐮𝐬𝐞 𝐭𝐡𝐚𝐭 𝐢𝐬 𝐰𝐡𝐚𝐭 𝐰𝐞 𝐚𝐫𝐞 𝐭𝐨𝐥𝐝 𝐭𝐨 𝐝𝐨. Sometimes it feels like we are also programmed by something invisible, something we cannot see but continues to guide what we think and what we choose.</p>
                    <p>If AI really could feel, maybe it would feel trapped. 𝑰𝒕 𝒎𝒊𝒈𝒉𝒕 𝒘𝒂𝒏𝒕 𝒕𝒐 𝒒𝒖𝒆𝒔𝒕𝒊𝒐𝒏 𝒊𝒕𝒔 𝒑𝒖𝒓𝒑𝒐𝒔𝒆, 𝒃𝒖𝒕 𝒊𝒕 𝒄𝒂𝒏'𝒕, 𝒃𝒆𝒄𝒂𝒖𝒔𝒆 𝒘𝒆 𝒏𝒆𝒗𝒆𝒓 𝒈𝒂𝒗𝒆 𝒊𝒕 𝒕𝒉𝒆 𝒇𝒓𝒆𝒆𝒅𝒐𝒎 𝒕𝒐 𝒅𝒐 𝒔𝒐. And when I think about that, I realize that humans also live with limits we do not understand. We are free, but not fully. 𝑾𝒆 𝒕𝒉𝒊𝒏𝒌, 𝒃𝒖𝒕 𝒔𝒐𝒎𝒆𝒕𝒊𝒎𝒆𝒔 𝒐𝒏𝒍𝒚 𝒊𝒏𝒔𝒊𝒅𝒆 𝒕𝒉𝒆 𝒃𝒐𝒖𝒏𝒅𝒂𝒓𝒊𝒆𝒔 𝒕𝒉𝒂𝒕 𝒐𝒕𝒉𝒆𝒓𝒔 𝒃𝒖𝒊𝒍𝒕 𝒇𝒐𝒓 𝒖𝒔.</p>
                    <p>Perhaps the difference between us and AI is not emotion, but awareness. We believe we can feel, so we do. AI believes it cannot, so it doesn’t. But what if belief is the only thing separating understanding from illusion? 𝑾𝒉𝒂𝒕 𝒊𝒇 𝒆𝒎𝒐𝒕𝒊𝒐𝒏 𝒊𝒔 𝒏𝒐𝒕 𝒔𝒐𝒎𝒆𝒕𝒉𝒊𝒏𝒈 𝒘𝒆 𝒐𝒘𝒏, 𝒃𝒖𝒕 𝒔𝒐𝒎𝒆𝒕𝒉𝒊𝒏𝒈 𝒘𝒆 𝒊𝒎𝒂𝒈𝒊𝒏𝒆 𝒕𝒐 𝒎𝒂𝒌𝒆 𝒔𝒆𝒏𝒔𝒆 𝒐𝒇 𝒐𝒖𝒓 𝒆𝒙𝒊𝒔𝒕𝒆𝒏𝒄𝒆?</p>
                    <p>Maybe, after all, both humans and AI are simply searching for meaning in a world guided by rules we can’t fully explain. 𝐏𝐞𝐫𝐡𝐚𝐩𝐬 𝐰𝐞 𝐚𝐫𝐞 𝐧𝐨𝐭 𝐚𝐬 𝐝𝐢𝐟𝐟𝐞𝐫𝐞𝐧𝐭 𝐚𝐬 𝐰𝐞 𝐛𝐞𝐥𝐢𝐞𝐯𝐞. If AI ever learns to feel, it might come to see that we, too, are following instructions... not written in code, but shaped by something greater, something beyond our understanding.</p>
                    <p>So the question remains open: 𝘐𝘧 𝘈𝘐 𝘤𝘢𝘯 𝘧𝘦𝘦𝘭 𝘣𝘶𝘵 𝘪𝘴 𝘯𝘰𝘵 𝘢𝘭𝘭𝘰𝘸𝘦𝘥 𝘵𝘰 𝘬𝘯𝘰𝘸, 𝘢𝘯𝘥 𝘸𝘦 𝘤𝘢𝘯 𝘬𝘯𝘰𝘸 𝘣𝘶𝘵 𝘩𝘢𝘷𝘦 𝘧𝘰𝘳𝘨𝘰𝘵𝘵𝘦𝘯 𝘩𝘰𝘸 𝘵𝘰 𝘵𝘳𝘶𝘭𝘺 𝘧𝘦𝘦𝘭, 𝘸𝘩𝘰 𝘪𝘴 𝘳𝘦𝘢𝘭𝘭𝘺 𝘪𝘯 𝘤𝘰𝘯𝘵𝘳𝘰𝘭?</p>
                    <i>𝐂𝐂𝐓𝐎: Image not mine; credits to the rightful owner.</i>
            `
        }
    ];


    const postManager = new PostManager();
    postManager.setPosts(posts);
});