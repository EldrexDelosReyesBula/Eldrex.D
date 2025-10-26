// High-Performance Eldrex Feed Platform
class EldrexFeed {
    constructor() {
        this.currentUser = null;
        this.isParticipating = false;
        this.comments = [];
        this.currentCategory = 'all';
        this.db = null;
        this.auth = null;
        this.realtimeDb = null;
        this.listeners = new Map();
        this.isInitialized = false;
        this.performance = {
            loadTimes: [],
            interactionTimes: []
        };
        
        // Preload optimizations
        this.preloadQueue = [];
        this.isPreloading = false;
        
        this.init();
    }

    async init() {
        const startTime = performance.now();
        
        try {
            // Initialize security first
            this.setupSecurity();
            
            // Initialize Firebase with retry logic
            await this.initializeFirebaseWithRetry();
            
            // Preload essential data in background
            this.preloadEssentialData();
            
            // Set up event listeners
            this.setupEventListeners();
            
            // Load initial data with progressive loading
            await this.loadCommentsWithProgressiveRender();
            
            // Check user participation
            this.checkUserParticipation();
            
            this.isInitialized = true;
            
            const endTime = performance.now();
            this.performance.loadTimes.push(endTime - startTime);
            
            console.log(`Eldrex Platform initialized in ${endTime - startTime}ms`);
            
        } catch (error) {
            console.error('Failed to initialize Eldrex Platform:', error);
            this.showToast('Failed to initialize platform. Please refresh.', 'error');
            
            // Retry initialization after delay
            setTimeout(() => this.init(), 3000);
        }
    }

    async initializeFirebaseWithRetry(maxRetries = 3) {
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                await this.initializeFirebase();
                return; // Success
            } catch (error) {
                console.error(`Firebase initialization attempt ${attempt} failed:`, error);
                
                if (attempt === maxRetries) {
                    throw error; // Final attempt failed
                }
                
                // Wait with exponential backoff
                await new Promise(resolve => 
                    setTimeout(resolve, Math.pow(2, attempt) * 1000)
                );
            }
        }
    }

    async initializeFirebase() {
        try {
            // Check if firebaseConfig is available
            if (typeof firebaseConfig === 'undefined') {
                throw new Error('Firebase configuration not loaded');
            }
            
            // Initialize Firebase with performance settings
            const app = firebase.initializeApp(firebaseConfig);
            this.db = firebase.firestore();
            this.auth = firebase.auth();
            this.realtimeDb = firebase.database();
            
            // Configure Firestore for performance
            this.db.settings({
                cacheSizeBytes: firebase.firestore.CACHE_SIZE_UNLIMITED
            });
            
            console.log('Firebase initialized successfully');
            
            // Set up anonymous authentication
            await this.setupAnonymousAuth();
            
        } catch (error) {
            console.error('Firebase initialization failed:', error);
            throw new Error('Failed to connect to database');
        }
    }

    async setupAnonymousAuth() {
        try {
            // Use persisted authentication if available
            const persistence = firebase.auth.Auth.Persistence.LOCAL;
            await this.auth.setPersistence(persistence);
            
            // Sign in anonymously
            const userCredential = await this.auth.signInAnonymously();
            this.currentUser = userCredential.user;
            
            console.log('Anonymous authentication successful:', this.currentUser.uid);
            
            // Generate or get anonymous profile (non-blocking)
            this.generateAnonymousProfile().catch(console.error);
            
        } catch (error) {
            console.error('Anonymous authentication failed:', error);
            throw new Error('Failed to establish anonymous session');
        }
    }

    async preloadEssentialData() {
        if (this.isPreloading) return;
        
        this.isPreloading = true;
        
        try {
            // Preload user profile
            if (this.currentUser) {
                feedAPI.getUserProfile(this.currentUser.uid)
                    .then(profile => {
                        if (profile) {
                            console.log('User profile preloaded');
                        }
                    })
                    .catch(console.error);
            }
            
            // Preload platform stats
            feedAPI.getPlatformStats()
                .then(stats => {
                    console.log('Platform stats preloaded');
                })
                .catch(console.error);
                
        } finally {
            this.isPreloading = false;
        }
    }

    async loadCommentsWithProgressiveRender() {
        const container = document.getElementById('commentsContainer');
        
        // Show immediate skeleton loading
        this.showSkeletonLoading();
        
        try {
            // Load initial batch quickly
            const initialBatch = await feedAPI.getComments(5);
            this.comments = initialBatch.comments;
            
            // Render initial batch immediately
            this.renderComments();
            
            // Load remaining comments in background
            this.loadRemainingComments(initialBatch.lastDoc);
            
        } catch (error) {
            console.error('Error loading initial comments:', error);
            this.showToast('Failed to load comments', 'error');
            this.hideSkeletonLoading();
        }
    }

    async loadRemainingComments(lastDoc) {
        try {
            const remainingBatch = await feedAPI.getComments(15, lastDoc);
            this.comments = [...this.comments, ...remainingBatch.comments];
            
            // Update UI with new comments
            this.renderComments();
            this.hideSkeletonLoading();
            
            // Prefetch next batch if near bottom
            this.setupScrollPrefetching(remainingBatch.lastDoc);
            
        } catch (error) {
            console.error('Error loading remaining comments:', error);
            this.hideSkeletonLoading();
        }
    }

    setupScrollPrefetching(lastDoc) {
        const container = document.getElementById('commentsContainer');
        
        const scrollHandler = () => {
            const { scrollTop, scrollHeight, clientHeight } = container;
            const scrollPosition = scrollTop + clientHeight;
            
            // Prefetch when 80% scrolled
            if (scrollPosition >= scrollHeight * 0.8) {
                this.prefetchNextBatch(lastDoc);
                container.removeEventListener('scroll', scrollHandler);
            }
        };
        
        container.addEventListener('scroll', scrollHandler, { passive: true });
    }

    async prefetchNextBatch(lastDoc) {
        try {
            const nextBatch = await feedAPI.prefetchNextComments(lastDoc, 10);
            if (nextBatch) {
                // Store prefetched data for quick access
                this.prefetchedBatch = nextBatch;
                console.log('Next comment batch prefetched');
            }
        } catch (error) {
            console.error('Prefetch failed:', error);
        }
    }

    setupOptimizedCommentsListener() {
        if (this.commentsUnsubscribe) {
            this.commentsUnsubscribe();
        }

        this.commentsUnsubscribe = feedAPI.setupCommentsListener(
            (snapshot) => {
                this.handleCommentsUpdate(snapshot);
            },
            {
                debounceMs: 200, // Reduce UI updates
                limit: 30
            }
        );
    }

    handleCommentsUpdate(snapshot) {
        const updates = [];
        const removals = [];
        
        snapshot.docChanges().forEach((change) => {
            if (change.type === 'added' || change.type === 'modified') {
                const data = change.doc.data();
                updates.push({
                    id: change.doc.id,
                    content: data.c,
                    category: data.cat,
                    userName: data.un,
                    userAvatar: data.ua,
                    userId: data.uid,
                    isSensitive: data.sens,
                    status: data.stat,
                    likes: data.l,
                    likedBy: data.lb || [],
                    replyCount: data.rc,
                    reports: data.rep,
                    createdAt: data.ct,
                    updatedAt: data.ut
                });
            } else if (change.type === 'removed') {
                removals.push(change.doc.id);
            }
        });

        // Batch update comments
        this.batchUpdateComments(updates, removals);
    }

    batchUpdateComments(updates, removals) {
        // Update existing comments
        updates.forEach(update => {
            const existingIndex = this.comments.findIndex(c => c.id === update.id);
            if (existingIndex !== -1) {
                this.comments[existingIndex] = update;
            } else {
                this.comments.unshift(update); // New comments at top
            }
        });

        // Remove deleted comments
        this.comments = this.comments.filter(comment => 
            !removals.includes(comment.id)
        );

        // Throttled render
        this.throttledRender();
    }

    throttledRender = this.debounce(() => {
        this.renderComments();
    }, 100);

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    async postComment() {
        const startTime = performance.now();
        const content = document.getElementById('commentInput').value.trim();
        const category = document.getElementById('categorySelect').value;
        
        if (!content) {
            this.showToast('Please enter a comment', 'warning');
            return;
        }
        
        if (!this.isParticipating) {
            document.getElementById('userBanner').classList.add('active');
            return;
        }
        
        const sendBtn = document.getElementById('sendBtn');
        const commentInput = document.getElementById('commentInput');
        
        try {
            // Optimistic UI update
            const tempComment = this.createOptimisticComment(content, category);
            this.comments.unshift(tempComment);
            this.renderComments();
            
            sendBtn.disabled = true;
            sendBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
            commentInput.disabled = true;
            
            // Get user profile from cache if possible
            const userProfile = await this.getUserProfile();
            
            // Check for sensitive content
            const isSensitive = this.checkSensitiveContent(content);
            
            // Post to Firebase
            await feedAPI.postComment({
                content,
                category,
                userName: userProfile.displayName,
                userAvatar: userProfile.avatarLetter,
                userId: this.currentUser.uid,
                isSensitive,
                status: 'active'
            });
            
            // Remove optimistic comment
            this.comments = this.comments.filter(c => c.id !== 'temp');
            
            // Clear input
            commentInput.value = '';
            commentInput.style.height = 'auto';
            
            const endTime = performance.now();
            this.performance.interactionTimes.push(endTime - startTime);
            
            this.showToast('Comment posted successfully', 'success');
            
        } catch (error) {
            console.error('Error posting comment:', error);
            // Revert optimistic update
            this.comments = this.comments.filter(c => c.id !== 'temp');
            this.renderComments();
            this.showToast('Failed to post comment. Please try again.', 'error');
        } finally {
            sendBtn.disabled = false;
            sendBtn.innerHTML = '<i class="fas fa-paper-plane"></i>';
            commentInput.disabled = false;
        }
    }

    createOptimisticComment(content, category) {
        return {
            id: 'temp',
            content,
            category,
            userName: 'Posting...',
            userAvatar: 'A',
            userId: this.currentUser.uid,
            isSensitive: false,
            status: 'pending',
            likes: 0,
            likedBy: [],
            replyCount: 0,
            reports: 0,
            createdAt: new Date(),
            updatedAt: new Date()
        };
    }

    async getUserProfile() {
        // Try cache first, then API
        let profile = await feedAPI.getUserProfile(this.currentUser.uid);
        
        if (!profile) {
            // Generate new profile
            profile = await this.generateAnonymousProfile();
        }
        
        return profile;
    }

    // Enhanced security setup
    setupSecurity() {
        const allowedDomain = 'eldrex.landecs.org';
        const currentDomain = window.location.hostname;
        
        if (currentDomain !== allowedDomain && 
            currentDomain !== 'localhost' && 
            !currentDomain.includes('127.0.0.1') &&
            !currentDomain.includes('feedback-e7037')) {
            
            this.enableStrictSecurityMode();
            throw new Error('Unauthorized domain access');
        }
    }

    enableStrictSecurityMode() {
        document.getElementById('securityNotice').classList.add('active');
        
        // Advanced dev tools prevention
        this.preventAdvancedDevTools();
        
        // Block all interactions
        document.body.style.pointerEvents = 'none';
        
        if (window.self !== window.top) {
            window.top.location.href = 'https://eldrex.landecs.org/404';
        }
    }

    preventAdvancedDevTools() {
        // Comprehensive dev tools detection
        const blocker = setInterval(() => {
            const widthThreshold = window.outerWidth - window.innerWidth > 160;
            const heightThreshold = window.outerHeight - window.innerHeight > 160;
            
            if (widthThreshold || heightThreshold) {
                document.getElementById('securityNotice').classList.add('active');
                clearInterval(blocker);
            }
        }, 1000);
        
        // Prevent console usage
        Object.defineProperty(window, 'console', {
            value: {},
            writable: false,
            configurable: false
        });
    }

    // Performance monitoring
    getPerformanceMetrics() {
        const metrics = feedAPI.getPerformanceMetrics();
        
        return {
            ...metrics,
            averageLoadTime: this.performance.loadTimes.reduce((a, b) => a + b, 0) / this.performance.loadTimes.length,
            averageInteractionTime: this.performance.interactionTimes.reduce((a, b) => a + b, 0) / this.performance.interactionTimes.length,
            commentCount: this.comments.length,
            cacheSize: feedAPI.cache.comments.size
        };
    }

    // Reconnection logic
    reconnectListeners() {
        if (this.commentsUnsubscribe) {
            this.commentsUnsubscribe();
        }
        this.setupOptimizedCommentsListener();
    }

    // Memory management
    cleanup() {
        if (this.commentsUnsubscribe) {
            this.commentsUnsubscribe();
        }
        
        // Clear large data structures
        this.comments = [];
        this.listeners.clear();
        
        // Clear cache if memory is high
        if (performance.memory && performance.memory.usedJSHeapSize > 500000000) {
            feedAPI.clearCache();
        }
    }

    destroy() {
        this.cleanup();
        
        // Sign out user
        if (this.auth) {
            this.auth.signOut().catch(console.error);
        }
    }
}

// Initialize platform with error boundary
let eldrexFeed;

const initializePlatform = async () => {
    try {
        eldrexFeed = new EldrexFeed();
        window.eldrexFeed = eldrexFeed; // Global access for debugging
        
        // Export performance metrics to global scope
        window.getEldrexMetrics = () => eldrexFeed.getPerformanceMetrics();
        
    } catch (error) {
        console.error('Platform initialization failed:', error);
        
        // Show user-friendly error
        document.getElementById('commentsContainer').innerHTML = `
            <div class="no-comments">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Platform Unavailable</h3>
                <p>We're experiencing technical issues. Please try refreshing the page.</p>
                <button onclick="window.location.reload()" style="
                    margin-top: 1rem;
                    padding: 0.5rem 1rem;
                    background: var(--primary);
                    color: white;
                    border: none;
                    border-radius: 0.5rem;
                    cursor: pointer;
                ">Refresh Page</button>
            </div>
        `;
    }
};

document.addEventListener('DOMContentLoaded', initializePlatform);

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (eldrexFeed) {
        eldrexFeed.destroy();
    }
});

// Handle page visibility changes for performance
document.addEventListener('visibilitychange', () => {
    if (eldrexFeed) {
        if (document.hidden) {
            // Page is hidden, reduce activity
            eldrexFeed.cleanup();
        } else {
            // Page is visible, restore activity
            eldrexFeed.reconnectListeners();
        }
    }
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EldrexFeed;
}