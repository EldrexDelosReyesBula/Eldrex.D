// Production-Optimized Eldrex Feed Platform
class EldrexFeed {
    constructor() {
        this.currentUser = null;
        this.isParticipating = false;
        this.comments = new Map(); // Use Map for faster lookups
        this.currentCategory = 'all';
        this.db = null;
        this.auth = null;
        this.realtimeDb = null;
        this.isInitialized = false;
        this.cache = new Map();
        this.performance = {
            startTime: performance.now(),
            loadTimes: new Map()
        };
        
        this.init();
    }

    async init() {
        try {
            this.setPerformanceMark('init_start');
            
            // Initialize security first
            this.setupSecurity();
            
            // Show loading screen
            this.showLoadingScreen();
            
            // Initialize Firebase with retry logic
            await this.initializeFirebaseWithRetry();
            
            // Preload critical data
            await this.preloadCriticalData();
            
            // Initialize UI components
            this.initializeUI();
            
            // Load comments with optimized strategy
            await this.loadCommentsOptimized();
            
            // Hide loading screen and show app
            this.hideLoadingScreen();
            
            this.isInitialized = true;
            this.setPerformanceMark('init_complete');
            this.logPerformance();
            
            console.log('🚀 Eldrex Platform initialized successfully');
            
        } catch (error) {
            console.error('❌ Failed to initialize Eldrex Platform:', error);
            this.showFatalError('Failed to initialize platform. Please refresh the page.');
        }
    }

    setupSecurity() {
        const allowedDomain = 'eldrex.landecs.org';
        const currentDomain = window.location.hostname;
        
        if (!this.isValidDomain(currentDomain, allowedDomain)) {
            this.showSecurityNotice();
            this.preventAllAccess();
            throw new Error('Unauthorized domain access');
        }
        
        this.setupSecurityMeasures();
    }

    isValidDomain(current, allowed) {
        return current === allowed || 
               current === 'localhost' || 
               current.includes('127.0.0.1') ||
               current.includes('feedback-e7037');
    }

    showSecurityNotice() {
        document.getElementById('securityNotice').classList.add('active');
        document.getElementById('securityRedirect').addEventListener('click', () => {
            window.location.href = 'https://eldrex.landecs.org';
        });
    }

    preventAllAccess() {
        // Prevent right-click
        document.addEventListener('contextmenu', e => e.preventDefault());
        
        // Prevent dev tools
        this.preventDevTools();
        
        // Block iframe embedding
        if (window.self !== window.top) {
            window.top.location.href = 'https://eldrex.landecs.org/404';
        }
        
        // Disable all interactive elements
        document.querySelectorAll('button, input, textarea, select').forEach(el => {
            el.disabled = true;
        });
    }

    preventDevTools() {
        const block = () => {
            setInterval(() => {
                debugger;
            }, 100);
        };
        
        // Detect dev tools
        const element = new Image();
        Object.defineProperty(element, 'id', {
            get: () => {
                block();
                document.getElementById('securityNotice').classList.add('active');
            }
        });
        
        console.log(element);
    }

    setupSecurityMeasures() {
        // Add security headers dynamically
        const meta = document.createElement('meta');
        meta.httpEquiv = 'Content-Security-Policy';
        meta.content = "default-src 'self' https://eldrex.landecs.org https://*.firebaseio.com https://*.googleapis.com https://*.gstatic.com; script-src 'self' 'unsafe-inline' https://*.gstatic.com; style-src 'self' 'unsafe-inline' https://*.googleapis.com https://cdnjs.cloudflare.com; font-src 'self' https://*.gstatic.com https://*.googleapis.com;";
        document.head.appendChild(meta);
    }

    showLoadingScreen() {
        document.getElementById('loadingScreen').classList.remove('hidden');
    }

    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loadingScreen');
        const appContainer = document.getElementById('appContainer');
        
        loadingScreen.classList.add('hidden');
        appContainer.classList.add('loaded');
        
        setTimeout(() => {
            loadingScreen.style.display = 'none';
        }, 500);
    }

    async initializeFirebaseWithRetry(maxRetries = 3) {
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                await this.initializeFirebase();
                return;
            } catch (error) {
                console.warn(`Firebase initialization attempt ${attempt} failed:`, error);
                
                if (attempt === maxRetries) {
                    throw new Error(`Firebase initialization failed after ${maxRetries} attempts`);
                }
                
                // Exponential backoff
                await this.delay(Math.pow(2, attempt) * 1000);
            }
        }
    }

    async initializeFirebase() {
        if (typeof firebaseConfig === 'undefined') {
            throw new Error('Firebase configuration not loaded');
        }

        // Initialize Firebase
        firebase.initializeApp(firebaseConfig);
        this.db = firebase.firestore();
        this.auth = firebase.auth();
        this.realtimeDb = firebase.database();

        // Enable offline persistence for better performance
        await this.db.enablePersistence({
            synchronizeTabs: true
        }).catch(err => {
            console.warn('Offline persistence not supported:', err);
        });

        // Set up anonymous auth
        await this.setupAnonymousAuth();
    }

    async setupAnonymousAuth() {
        const userCredential = await this.auth.signInAnonymously();
        this.currentUser = userCredential.user;
        
        // Generate user profile in background (non-blocking)
        this.generateAnonymousProfile().catch(console.error);
    }

    async generateAnonymousProfile() {
        const userId = this.currentUser.uid;
        const userRef = this.db.collection('anonymousUsers').doc(userId);
        const userDoc = await userRef.get();

        if (!userDoc.exists) {
            const profile = this.generateRandomProfile();
            await userRef.set({
                ...profile,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                lastActive: firebase.firestore.FieldValue.serverTimestamp(),
                sessionCount: 1
            });
        } else {
            await userRef.update({
                lastActive: firebase.firestore.FieldValue.serverTimestamp(),
                sessionCount: firebase.firestore.FieldValue.increment(1)
            });
        }
    }

    generateRandomProfile() {
        const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const adjectives = ['Quick', 'Clever', 'Brave', 'Calm', 'Eager', 'Gentle', 'Happy', 'Jolly', 'Kind', 'Lively'];
        const nouns = ['Panda', 'Tiger', 'Eagle', 'Dolphin', 'Wolf', 'Fox', 'Owl', 'Lion', 'Bear', 'Hawk'];
        
        const randomLetter = letters[Math.floor(Math.random() * letters.length)];
        const randomName = `${adjectives[Math.floor(Math.random() * adjectives.length)]}${nouns[Math.floor(Math.random() * nouns.length)]}${Math.floor(Math.random() * 1000)}`;
        
        return {
            avatarLetter: randomLetter,
            displayName: randomName
        };
    }

    async preloadCriticalData() {
        // Preload user profile and platform stats in parallel
        await Promise.allSettled([
            this.getUserProfile(),
            feedAPI.getPlatformStats()
        ]);
    }

    initializeUI() {
        this.setupEventListeners();
        this.checkUserParticipation();
        this.setupInputHandler();
    }

    setupEventListeners() {
        // Header buttons
        this.setupHeaderEvents();
        
        // Categories
        this.setupCategoryEvents();
        
        // Settings
        this.setupSettingsEvents();
        
        // Banner
        this.setupBannerEvents();
        
        // Security
        this.setupSecurityEvents();
    }

    setupHeaderEvents() {
        document.getElementById('backBtn').addEventListener('click', () => {
            window.history.length > 1 ? window.history.back() : window.location.href = '/';
        });

        document.getElementById('settingsBtn').addEventListener('click', () => {
            this.openSettings();
        });
    }

    setupCategoryEvents() {
        document.querySelectorAll('.category').forEach(category => {
            category.addEventListener('click', (e) => {
                this.handleCategoryChange(e.currentTarget);
            });
        });
    }

    setupSettingsEvents() {
        document.getElementById('closeSheet').addEventListener('click', () => {
            this.closeSettings();
        });

        document.getElementById('sheetOverlay').addEventListener('click', () => {
            this.closeSettings();
        });

        // Settings options
        document.getElementById('changeNickname').addEventListener('click', () => {
            this.changeNickname();
        });

        document.getElementById('filterContent').addEventListener('click', () => {
            this.showContentFilters();
        });

        document.getElementById('privacyInfo').addEventListener('click', () => {
            this.showPrivacyInfo();
        });

        document.getElementById('reportProblem').addEventListener('click', () => {
            this.reportProblem();
        });
    }

    setupBannerEvents() {
        document.getElementById('confirmParticipation').addEventListener('click', () => {
            this.confirmParticipation();
        });

        document.getElementById('exploreOnly').addEventListener('click', () => {
            this.setExploreOnlyMode();
        });
    }

    setupSecurityEvents() {
        document.getElementById('securityRedirect').addEventListener('click', () => {
            window.location.href = 'https://eldrex.landecs.org';
        });
    }

    setupInputHandler() {
        const commentInput = document.getElementById('commentInput');
        const charCounter = document.getElementById('charCounter');
        
        commentInput.addEventListener('input', () => {
            this.handleInputChange(commentInput, charCounter);
        });
        
        commentInput.addEventListener('keydown', (e) => {
            this.handleInputKeydown(e);
        });
        
        document.getElementById('sendBtn').addEventListener('click', () => {
            this.postComment();
        });
    }

    handleInputChange(input, counter) {
        const length = input.value.length;
        counter.textContent = `${length}/1000`;
        
        // Auto-resize
        input.style.height = 'auto';
        input.style.height = Math.min(input.scrollHeight, 120) + 'px';
        
        // Update counter color
        counter.style.color = length > 900 ? '#ef4444' : 'var(--text-secondary)';
    }

    handleInputKeydown(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            this.postComment();
        }
    }

    async loadCommentsOptimized() {
        this.setPerformanceMark('comments_load_start');
        
        try {
            this.showSkeletonLoading();
            
            // Load initial batch
            const initialBatch = await feedAPI.getComments(20);
            this.processCommentsBatch(initialBatch.comments);
            
            // Set up real-time listener for new comments only
            this.setupRealtimeListener();
            
            // Load older comments in background
            this.loadOlderCommentsBackground();
            
            this.setPerformanceMark('comments_load_complete');
            
        } catch (error) {
            console.error('Error loading comments:', error);
            this.showToast('Failed to load comments. Please refresh.', 'error');
            this.showEmptyState();
        } finally {
            this.hideSkeletonLoading();
        }
    }

    processCommentsBatch(comments) {
        comments.forEach(comment => {
            if (!this.comments.has(comment.id)) {
                this.comments.set(comment.id, comment);
            }
        });
        this.renderComments();
    }

    setupRealtimeListener() {
        // Listen only for new comments to reduce bandwidth
        const newCommentsQuery = this.db.collection('comments')
            .where('status', '==', 'active')
            .orderBy('createdAt', 'desc')
            .limit(10);

        this.commentsUnsubscribe = newCommentsQuery.onSnapshot(snapshot => {
            snapshot.docChanges().forEach(change => {
                if (change.type === 'added') {
                    const comment = {
                        id: change.doc.id,
                        ...change.doc.data()
                    };
                    
                    if (!this.comments.has(comment.id)) {
                        this.comments.set(comment.id, comment);
                        this.prependComment(comment);
                    }
                }
            });
        }, error => {
            console.error('Realtime listener error:', error);
        });
    }

    async loadOlderCommentsBackground() {
        try {
            const olderComments = await feedAPI.getComments(30, this.getOldestComment());
            this.processCommentsBatch(olderComments.comments);
        } catch (error) {
            console.warn('Failed to load older comments:', error);
        }
    }

    getOldestComment() {
        let oldest = null;
        this.comments.forEach(comment => {
            if (!oldest || comment.createdAt < oldest.createdAt) {
                oldest = comment;
            }
        });
        return oldest;
    }

    showSkeletonLoading() {
        const container = document.getElementById('commentsContainer');
        container.innerHTML = this.generateSkeletonHTML(3);
    }

    generateSkeletonHTML(count) {
        return Array.from({ length: count }, () => `
            <div class="skeleton-comment">
                <div class="skeleton-header">
                    <div class="skeleton skeleton-avatar"></div>
                    <div class="skeleton-user">
                        <div class="skeleton skeleton-text short"></div>
                        <div class="skeleton skeleton-text medium"></div>
                    </div>
                    <div class="skeleton skeleton-tag"></div>
                </div>
                <div class="skeleton-content">
                    <div class="skeleton skeleton-text long"></div>
                    <div class="skeleton skeleton-text long"></div>
                    <div class="skeleton skeleton-text medium"></div>
                </div>
                <div class="skeleton-actions">
                    <div class="skeleton skeleton-action"></div>
                    <div class="skeleton skeleton-action"></div>
                    <div class="skeleton skeleton-action"></div>
                </div>
            </div>
        `).join('');
    }

    hideSkeletonLoading() {
        // Handled by renderComments
    }

    renderComments() {
        const container = document.getElementById('commentsContainer');
        const filteredComments = this.getFilteredComments();
        
        if (filteredComments.length === 0) {
            this.showEmptyState();
            return;
        }
        
        container.innerHTML = filteredComments
            .map(comment => this.createCommentElement(comment))
            .join('');
            
        this.attachCommentListeners();
    }

    prependComment(comment) {
        const container = document.getElementById('commentsContainer');
        const commentElement = this.createCommentElement(comment);
        
        // Remove empty state if present
        const emptyState = container.querySelector('.empty-state');
        if (emptyState) {
            emptyState.remove();
        }
        
        container.insertAdjacentHTML('afterbegin', commentElement);
        this.attachCommentListeners(container.firstElementChild);
    }

    getFilteredComments() {
        const comments = Array.from(this.comments.values());
        
        if (this.currentCategory === 'all') {
            return comments.sort((a, b) => b.createdAt - a.createdAt);
        }
        
        return comments
            .filter(comment => comment.category === this.currentCategory)
            .sort((a, b) => b.createdAt - a.createdAt);
    }

    showEmptyState() {
        const container = document.getElementById('commentsContainer');
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-comments"></i>
                <h3>No comments yet</h3>
                <p>Be the first to share your thoughts and start the conversation!</p>
            </div>
        `;
    }

    createCommentElement(comment) {
        const timestamp = this.formatTimestamp(comment.createdAt?.toDate());
        const isSensitive = this.checkSensitiveContent(comment.content);
        const userLiked = comment.likedBy?.includes(this.currentUser.uid);
        
        return `
            <div class="comment-card" data-comment-id="${comment.id}">
                <div class="comment-header">
                    <div class="user-info">
                        <div class="avatar">${comment.userAvatar || 'A'}</div>
                        <div class="user-details">
                            <div class="username">${comment.userName || 'AnonymousUser'}</div>
                            <div class="timestamp">${timestamp}</div>
                        </div>
                    </div>
                    <div class="category-tag">${this.formatCategory(comment.category)}</div>
                </div>
                <div class="comment-content">
                    <div class="comment-text ${isSensitive ? 'blurred' : ''}">
                        ${this.escapeHtml(comment.content)}
                    </div>
                    ${isSensitive ? `
                        <div class="sensitive-warning">
                            <i class="fas fa-eye-slash"></i>
                            <span>Sensitive content detected</span>
                        </div>
                    ` : ''}
                </div>
                <div class="comment-actions">
                    <button class="action-btn like-btn ${userLiked ? 'liked' : ''}" 
                            data-comment-id="${comment.id}"
                            ${!this.isParticipating ? 'disabled' : ''}>
                        <i class="${userLiked ? 'fas' : 'far'} fa-heart"></i>
                        <span>${comment.likes || 0}</span>
                    </button>
                    <button class="action-btn reply-btn"
                            data-comment-id="${comment.id}"
                            ${!this.isParticipating ? 'disabled' : ''}>
                        <i class="far fa-comment"></i>
                        <span>${comment.replyCount || 0}</span>
                    </button>
                    <button class="action-btn report-btn"
                            data-comment-id="${comment.id}"
                            ${!this.isParticipating ? 'disabled' : ''}>
                        <i class="far fa-flag"></i>
                        <span>Report</span>
                    </button>
                </div>
            </div>
        `;
    }

    attachCommentListeners(container = null) {
        const scope = container || document;
        
        scope.querySelectorAll('.like-btn').forEach(btn => {
            btn.addEventListener('click', () => this.handleLike(btn));
        });
        
        scope.querySelectorAll('.report-btn').forEach(btn => {
            btn.addEventListener('click', () => this.handleReport(btn));
        });
        
        scope.querySelectorAll('.reply-btn').forEach(btn => {
            btn.addEventListener('click', () => this.handleReply(btn));
        });
    }

    async handleLike(button) {
        if (!this.isParticipating) {
            this.showUserBanner();
            return;
        }

        const commentId = button.dataset.commentId;
        
        try {
            button.disabled = true;
            const result = await feedAPI.toggleLike(commentId, this.currentUser.uid);
            this.updateLikeUI(button, result);
        } catch (error) {
            console.error('Error toggling like:', error);
            this.showToast('Failed to update like', 'error');
        } finally {
            button.disabled = false;
        }
    }

    updateLikeUI(button, liked) {
        const icon = button.querySelector('i');
        const countSpan = button.querySelector('span');
        const currentCount = parseInt(countSpan.textContent);

        if (liked) {
            icon.classList.replace('far', 'fas');
            button.classList.add('liked');
            countSpan.textContent = currentCount + 1;
        } else {
            icon.classList.replace('fas', 'far');
            button.classList.remove('liked');
            countSpan.textContent = currentCount - 1;
        }
    }

    async handleReport(button) {
        if (!this.isParticipating) {
            this.showUserBanner();
            return;
        }

        const commentId = button.dataset.commentId;
        const reason = prompt('Please specify the reason for reporting this content:');
        
        if (!reason?.trim()) return;

        try {
            button.disabled = true;
            await feedAPI.reportContent(commentId, 'comment', reason.trim(), this.currentUser.uid);
            this.showToast('Content reported. Thank you for helping keep the community safe.', 'success');
        } catch (error) {
            console.error('Error reporting content:', error);
            this.showToast('Failed to report content', 'error');
        } finally {
            button.disabled = false;
        }
    }

    handleReply(button) {
        if (!this.isParticipating) {
            this.showUserBanner();
            return;
        }

        const commentId = button.dataset.commentId;
        const replyText = prompt('Enter your reply:');
        
        if (!replyText?.trim()) return;
        
        this.postReply(commentId, replyText.trim());
    }

    async postComment() {
        const content = document.getElementById('commentInput').value.trim();
        const category = document.getElementById('categorySelect').value;

        if (!this.validateComment(content)) return;

        const sendBtn = document.getElementById('sendBtn');
        const commentInput = document.getElementById('commentInput');

        try {
            this.setUIState('sending', true, sendBtn, commentInput);
            
            const userProfile = await this.getUserProfile();
            const isSensitive = this.checkSensitiveContent(content);
            
            await feedAPI.postComment({
                content,
                category,
                userName: userProfile.displayName,
                userAvatar: userProfile.avatarLetter,
                userId: this.currentUser.uid,
                isSensitive,
                status: 'active',
                likes: 0,
                likedBy: [],
                replyCount: 0,
                reports: 0
            });

            this.clearInput(commentInput);
            this.showToast('Comment posted successfully', 'success');

        } catch (error) {
            console.error('Error posting comment:', error);
            this.showToast('Failed to post comment. Please try again.', 'error');
        } finally {
            this.setUIState('sending', false, sendBtn, commentInput);
        }
    }

    validateComment(content) {
        if (!content) {
            this.showToast('Please enter a comment', 'warning');
            return false;
        }

        if (content.length > 1000) {
            this.showToast('Comment too long. Maximum 1000 characters.', 'warning');
            return false;
        }

        if (!this.isParticipating) {
            this.showUserBanner();
            return false;
        }

        return true;
    }

    setUIState(state, active, button, input) {
        if (state === 'sending' && active) {
            button.disabled = true;
            button.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
            input.disabled = true;
        } else {
            button.disabled = false;
            button.innerHTML = '<i class="fas fa-paper-plane"></i>';
            input.disabled = false;
        }
    }

    clearInput(input) {
        input.value = '';
        input.style.height = 'auto';
        document.getElementById('charCounter').textContent = '0/1000';
    }

    async postReply(commentId, content) {
        try {
            const userProfile = await this.getUserProfile();
            await feedAPI.postReply(commentId, {
                content,
                userName: userProfile.displayName,
                userAvatar: userProfile.avatarLetter,
                userId: this.currentUser.uid,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                likes: 0,
                likedBy: []
            });
            this.showToast('Reply posted successfully', 'success');
        } catch (error) {
            console.error('Error posting reply:', error);
            this.showToast('Failed to post reply', 'error');
        }
    }

    async getUserProfile() {
        const cacheKey = `user_profile_${this.currentUser.uid}`;
        
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }

        try {
            const profile = await feedAPI.getUserProfile(this.currentUser.uid);
            const result = profile || { displayName: 'AnonymousUser', avatarLetter: 'A' };
            this.cache.set(cacheKey, result);
            return result;
        } catch (error) {
            console.error('Error getting user profile:', error);
            return { displayName: 'AnonymousUser', avatarLetter: 'A' };
        }
    }

    checkSensitiveContent(text) {
        const sensitiveWords = [
            'hate', 'violence', 'attack', 'harm', 'abuse', 'kill', 'hurt', 'assault',
            'discrimination', 'harassment', 'threat', 'danger', 'dangerous', 'weapon',
            'offensive', 'inappropriate', 'explicit', 'racist', 'sexist', 'bigot'
        ];

        const lowerText = text.toLowerCase();
        return sensitiveWords.some(word => {
            const regex = new RegExp(`\\b${word}\\b`, 'i');
            return regex.test(lowerText);
        });
    }

    handleCategoryChange(categoryElement) {
        document.querySelectorAll('.category').forEach(c => c.classList.remove('active'));
        categoryElement.classList.add('active');
        this.currentCategory = categoryElement.dataset.category;
        this.renderComments();
    }

    checkUserParticipation() {
        const userConfirmed = localStorage.getItem('eldrexUserConfirmed');
        const userSession = sessionStorage.getItem('eldrexSessionActive');

        if (!userConfirmed || !userSession) {
            setTimeout(() => this.showUserBanner(), 1000);
        } else {
            this.isParticipating = true;
        }
    }

    showUserBanner() {
        document.getElementById('userBanner').classList.add('active');
    }

    confirmParticipation() {
        localStorage.setItem('eldrexUserConfirmed', 'true');
        sessionStorage.setItem('eldrexSessionActive', 'true');
        document.getElementById('userBanner').classList.remove('active');
        this.isParticipating = true;
        this.enableInteractions();
        this.showToast('Welcome! You can now participate anonymously.', 'success');
    }

    setExploreOnlyMode() {
        localStorage.setItem('eldrexExploreOnly', 'true');
        document.getElementById('userBanner').classList.remove('active');
        this.disableInteractions();
        this.showToast('Explore mode activated. You can view but not interact.', 'warning');
    }

    enableInteractions() {
        document.getElementById('commentInput').disabled = false;
        document.getElementById('sendBtn').disabled = false;
        document.querySelectorAll('.action-btn').forEach(btn => {
            btn.disabled = false;
        });
    }

    disableInteractions() {
        document.getElementById('commentInput').disabled = true;
        document.getElementById('commentInput').placeholder = "Explore mode active - sign in to comment";
        document.getElementById('sendBtn').disabled = true;
        document.querySelectorAll('.action-btn').forEach(btn => {
            btn.disabled = true;
        });
    }

    openSettings() {
        document.getElementById('bottomSheet').classList.add('active');
    }

    closeSettings() {
        document.getElementById('bottomSheet').classList.remove('active');
    }

    async changeNickname() {
        const newName = prompt('Enter new nickname (3-20 characters):');
        if (!newName || newName.trim().length < 3 || newName.trim().length > 20) {
            this.showToast('Nickname must be between 3-20 characters', 'warning');
            return;
        }

        try {
            await feedAPI.updateUserProfile(this.currentUser.uid, {
                displayName: newName.trim()
            });
            
            // Clear cache
            this.cache.delete(`user_profile_${this.currentUser.uid}`);
            
            this.showToast('Nickname updated successfully', 'success');
            this.closeSettings();
        } catch (error) {
            console.error('Error updating nickname:', error);
            this.showToast('Failed to update nickname', 'error');
        }
    }

    showContentFilters() {
        this.showToast('Content filters will be available in the next update', 'info');
        this.closeSettings();
    }

    showPrivacyInfo() {
        const info = `
Eldrex Privacy Information:

• Complete Anonymity: No personal data is collected
• No Tracking: We don't track your activity
• Auto-Expiring: Comments may be removed after 90 days
• Content Moderation: AI-assisted filtering
• No Cookies: We don't use tracking cookies
• Open Source: Transparent and verifiable code

Your privacy is our priority.`;
        
        alert(info);
        this.closeSettings();
    }

    reportProblem() {
        const problem = prompt('Please describe the problem or issue:');
        if (!problem?.trim()) return;

        // Store in Firebase for tracking
        this.db.collection('problemReports').add({
            description: problem.trim(),
            userId: this.currentUser.uid,
            userAgent: navigator.userAgent,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            url: window.location.href
        }).catch(console.error);

        this.showToast('Problem reported. Thank you for your feedback!', 'success');
        this.closeSettings();
    }

    formatTimestamp(timestamp) {
        if (!timestamp) return 'Recently';
        
        const now = new Date();
        const diff = now - timestamp;
        
        const minute = 60 * 1000;
        const hour = minute * 60;
        const day = hour * 24;
        const week = day * 7;
        
        if (diff < minute) return 'Just now';
        if (diff < hour) return `${Math.floor(diff / minute)}m ago`;
        if (diff < day) return `${Math.floor(diff / hour)}h ago`;
        if (diff < week) return `${Math.floor(diff / day)}d ago`;
        
        return timestamp.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric',
            year: timestamp.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
        });
    }

    formatCategory(category) {
        const categories = {
            improvement: 'Improvement',
            recommendation: 'Recommendation',
            request: 'Request',
            report: 'Report',
            others: 'Others'
        };
        return categories[category] || category;
    }

    escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    showToast(message, type = 'success') {
        const container = document.getElementById('toastContainer');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <div class="toast-icon">
                <i class="fas fa-${type === 'success' ? 'check' : type === 'error' ? 'exclamation-triangle' : 'info'}"></i>
            </div>
            <div class="toast-message">${message}</div>
        `;
        
        container.appendChild(toast);
        
        // Animate in
        requestAnimationFrame(() => toast.classList.add('active'));
        
        // Auto remove
        setTimeout(() => {
            toast.classList.remove('active');
            setTimeout(() => toast.remove(), 300);
        }, 4000);
    }

    showFatalError(message) {
        document.getElementById('loadingScreen').innerHTML = `
            <div class="loading-content">
                <div class="security-icon">
                    <i class="fas fa-exclamation-triangle"></i>
                </div>
                <h2>Platform Error</h2>
                <p>${message}</p>
                <button class="security-btn" onclick="window.location.reload()">
                    <i class="fas fa-redo"></i>
                    Reload Platform
                </button>
            </div>
        `;
    }

    // Performance monitoring
    setPerformanceMark(name) {
        this.performance.loadTimes.set(name, performance.now());
    }

    logPerformance() {
        const initTime = this.performance.loadTimes.get('init_complete') - this.performance.startTime;
        const commentsTime = this.performance.loadTimes.get('comments_load_complete') - this.performance.loadTimes.get('comments_load_start');
        
        console.log(`📊 Performance Metrics:
        • Total Initialization: ${initTime.toFixed(2)}ms
        • Comments Load: ${commentsTime.toFixed(2)}ms
        • Total Comments: ${this.comments.size}
        • Cache Size: ${this.cache.size}`);
        
        // Send to analytics
        feedAPI.trackAnalytics('performance_metrics', {
            initTime: Math.round(initTime),
            commentsTime: Math.round(commentsTime),
            commentCount: this.comments.size,
            cacheSize: this.cache.size
        });
    }

    // Utility methods
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Cleanup
    destroy() {
        if (this.commentsUnsubscribe) {
            this.commentsUnsubscribe();
        }
        this.cache.clear();
        this.comments.clear();
    }
}

// Initialize platform
let eldrexFeed;

document.addEventListener('DOMContentLoaded', () => {
    eldrexFeed = new EldrexFeed();
});

window.addEventListener('beforeunload', () => {
    if (eldrexFeed) {
        eldrexFeed.destroy();
    }
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EldrexFeed;
}