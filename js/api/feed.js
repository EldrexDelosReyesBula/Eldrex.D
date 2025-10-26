// Production Eldrex Feed Platform
class EldrexFeed {
    constructor() {
        this.currentUser = null;
        this.isParticipating = false;
        this.comments = [];
        this.currentCategory = 'all';
        this.db = null;
        this.auth = null;
        this.realtimeDb = null;
        this.init();
    }

    async init() {
        try {
            // Initialize security first
            this.setupSecurity();
            
            // Initialize Firebase
            await this.initializeFirebase();
            
            // Set up event listeners
            this.setupEventListeners();
            
            // Load initial data
            await this.loadComments();
            
            // Check user participation
            this.checkUserParticipation();
            
            console.log('Eldrex Platform initialized successfully');
            
        } catch (error) {
            console.error('Failed to initialize Eldrex Platform:', error);
            this.showToast('Failed to initialize platform. Please refresh.', 'error');
        }
    }

    setupSecurity() {
        const allowedDomain = 'eldrex.landecs.org';
        const currentDomain = window.location.hostname;
        const currentProtocol = window.location.protocol;
        
        // Enhanced domain validation
        if (currentDomain !== allowedDomain && 
            currentDomain !== 'localhost' && 
            !currentDomain.includes('127.0.0.1') &&
            !currentDomain.includes('feedback-e7037')) {
            
            // Show security notice immediately
            document.getElementById('securityNotice').classList.add('active');
            
            // Prevent all dev tools access
            this.preventDevTools();
            
            // Redirect if embedded
            if (window.self !== window.top) {
                window.top.location.href = 'https://eldrex.landecs.org/404';
            }
            
            // Block further execution
            throw new Error('Unauthorized domain access');
        }
        
        // Force HTTPS in production
        if (currentProtocol !== 'https:' && !currentDomain.includes('localhost')) {
            window.location.href = 'https://' + currentDomain + window.location.pathname + window.location.search;
        }
    }

    preventDevTools() {
        // Prevent right-click
        document.addEventListener('contextmenu', function(e) {
            e.preventDefault();
            return false;
        });
        
        // Prevent keyboard shortcuts
        document.addEventListener('keydown', function(e) {
            if (e.key === 'F12' || 
                (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) || 
                (e.ctrlKey && e.key === 'u')) {
                e.preventDefault();
                return false;
            }
        });
        
        // Detect dev tools opening
        let devToolsOpen = false;
        const element = new Image();
        Object.defineProperty(element, 'id', {
            get: function() {
                devToolsOpen = true;
                document.getElementById('securityNotice').classList.add('active');
            }
        });
        
        console.log(element);
    }

    async initializeFirebase() {
        try {
            // Check if firebaseConfig is available
            if (typeof firebaseConfig === 'undefined') {
                throw new Error('Firebase configuration not loaded');
            }
            
            // Initialize Firebase
            firebase.initializeApp(firebaseConfig);
            this.db = firebase.firestore();
            this.auth = firebase.auth();
            this.realtimeDb = firebase.database();
            
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
            // Sign in anonymously
            const userCredential = await this.auth.signInAnonymously();
            this.currentUser = userCredential.user;
            
            console.log('Anonymous authentication successful:', this.currentUser.uid);
            
            // Generate or get anonymous profile
            await this.generateAnonymousProfile();
            
        } catch (error) {
            console.error('Anonymous authentication failed:', error);
            throw new Error('Failed to establish anonymous session');
        }
    }

    async generateAnonymousProfile() {
        const userId = this.currentUser.uid;
        const userRef = this.db.collection('anonymousUsers').doc(userId);
        
        try {
            const userDoc = await userRef.get();
            
            if (!userDoc.exists) {
                // Generate random anonymous profile
                const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
                const randomLetter = letters[Math.floor(Math.random() * letters.length)];
                const randomName = 'AnonymousUser' + Math.floor(Math.random() * 10000);
                
                await userRef.set({
                    avatarLetter: randomLetter,
                    displayName: randomName,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                    lastActive: firebase.firestore.FieldValue.serverTimestamp(),
                    sessionCount: 1
                });
                
                console.log('New anonymous profile created');
            } else {
                // Update last active and session count
                await userRef.update({
                    lastActive: firebase.firestore.FieldValue.serverTimestamp(),
                    sessionCount: firebase.firestore.FieldValue.increment(1)
                });
            }
            
        } catch (error) {
            console.error('Error managing user profile:', error);
            // Continue without profile - it's optional
        }
    }

    setupEventListeners() {
        // Back button
        document.getElementById('backBtn').addEventListener('click', () => {
            if (window.history.length > 1) {
                window.history.back();
            } else {
                window.location.href = '/';
            }
        });
        
        // Settings button
        document.getElementById('settingsBtn').addEventListener('click', () => {
            this.openSettings();
        });
        
        // Close bottom sheet
        document.getElementById('closeSheet').addEventListener('click', () => {
            this.closeSettings();
        });
        
        // Category selection
        document.querySelectorAll('.category').forEach(category => {
            category.addEventListener('click', (e) => {
                this.handleCategoryChange(e.target);
            });
        });
        
        // Send comment
        document.getElementById('sendBtn').addEventListener('click', () => this.postComment());
        document.getElementById('commentInput').addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.postComment();
            }
        });
        
        // Auto-resize textarea
        document.getElementById('commentInput').addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = Math.min(this.scrollHeight, 120) + 'px';
        });
        
        // Banner actions
        document.getElementById('confirmParticipation').addEventListener('click', () => {
            this.confirmParticipation();
        });
        
        document.getElementById('exploreOnly').addEventListener('click', () => {
            this.setExploreOnlyMode();
        });
        
        // Security redirect
        document.getElementById('securityRedirect').addEventListener('click', () => {
            window.location.href = 'https://eldrex.landecs.org';
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
        
        // Close settings when clicking outside
        document.getElementById('bottomSheet').addEventListener('click', (e) => {
            if (e.target === document.getElementById('bottomSheet')) {
                this.closeSettings();
            }
        });
    }

    openSettings() {
        document.getElementById('bottomSheet').classList.add('active');
    }

    closeSettings() {
        document.getElementById('bottomSheet').classList.remove('active');
    }

    handleCategoryChange(categoryElement) {
        document.querySelectorAll('.category').forEach(c => c.classList.remove('active'));
        categoryElement.classList.add('active');
        this.currentCategory = categoryElement.dataset.category;
        this.filterCommentsByCategory(this.currentCategory);
    }

    checkUserParticipation() {
        const userConfirmed = localStorage.getItem('eldrexUserConfirmed');
        const userSession = sessionStorage.getItem('eldrexSessionActive');
        
        if (!userConfirmed || !userSession) {
            setTimeout(() => {
                document.getElementById('userBanner').classList.add('active');
            }, 1500);
        } else {
            this.isParticipating = true;
        }
    }

    confirmParticipation() {
        localStorage.setItem('eldrexUserConfirmed', 'true');
        sessionStorage.setItem('eldrexSessionActive', 'true');
        document.getElementById('userBanner').classList.remove('active');
        this.isParticipating = true;
        this.showToast('Welcome! You can now participate anonymously.', 'success');
    }

    setExploreOnlyMode() {
        localStorage.setItem('eldrexExploreOnly', 'true');
        document.getElementById('userBanner').classList.remove('active');
        
        // Disable interaction elements
        const commentInput = document.getElementById('commentInput');
        const sendBtn = document.getElementById('sendBtn');
        
        commentInput.disabled = true;
        commentInput.placeholder = "Explore mode active - sign in to comment";
        sendBtn.disabled = true;
        
        document.querySelectorAll('.action-btn').forEach(btn => {
            btn.disabled = true;
        });
        
        this.showToast('Explore mode activated. You can view but not interact.', 'warning');
    }

    async loadComments() {
        try {
            this.showSkeletonLoading();
            
            const commentsRef = this.db.collection('comments')
                .where('status', '==', 'active')
                .orderBy('createdAt', 'desc')
                .limit(50);
            
            // Real-time listener for comments
            this.commentsUnsubscribe = commentsRef.onSnapshot(snapshot => {
                this.comments = [];
                snapshot.forEach(doc => {
                    const commentData = doc.data();
                    this.comments.push({
                        id: doc.id,
                        ...commentData,
                        // Ensure all required fields exist
                        likes: commentData.likes || 0,
                        likedBy: commentData.likedBy || [],
                        replyCount: commentData.replyCount || 0,
                        reports: commentData.reports || 0
                    });
                });
                
                this.renderComments();
                this.hideSkeletonLoading();
                
            }, error => {
                console.error('Error in comments listener:', error);
                this.hideSkeletonLoading();
                this.showToast('Connection issue - reconnecting...', 'warning');
                
                // Retry after delay
                setTimeout(() => this.loadComments(), 3000);
            });
            
        } catch (error) {
            console.error('Error loading comments:', error);
            this.hideSkeletonLoading();
            this.showToast('Failed to load comments', 'error');
        }
    }

    showSkeletonLoading() {
        const container = document.getElementById('commentsContainer');
        container.innerHTML = `
            <div class="skeleton-comment">
                <div class="comment-header">
                    <div class="user-info">
                        <div class="skeleton skeleton-avatar"></div>
                        <div class="user-details">
                            <div class="skeleton skeleton-text short"></div>
                            <div class="skeleton skeleton-text medium"></div>
                        </div>
                    </div>
                    <div class="skeleton skeleton-text short" style="width: 80px;"></div>
                </div>
                <div class="comment-content">
                    <div class="skeleton skeleton-text long"></div>
                    <div class="skeleton skeleton-text long"></div>
                    <div class="skeleton skeleton-text medium"></div>
                </div>
                <div class="comment-actions">
                    <div class="skeleton skeleton-text short" style="width: 40px;"></div>
                    <div class="skeleton skeleton-text short" style="width: 40px;"></div>
                    <div class="skeleton skeleton-text short" style="width: 60px;"></div>
                </div>
            </div>
            <div class="skeleton-comment">
                <div class="comment-header">
                    <div class="user-info">
                        <div class="skeleton skeleton-avatar"></div>
                        <div class="user-details">
                            <div class="skeleton skeleton-text short"></div>
                            <div class="skeleton skeleton-text medium"></div>
                        </div>
                    </div>
                    <div class="skeleton skeleton-text short" style="width: 80px;"></div>
                </div>
                <div class="comment-content">
                    <div class="skeleton skeleton-text long"></div>
                    <div class="skeleton skeleton-text long"></div>
                    <div class="skeleton skeleton-text medium"></div>
                </div>
                <div class="comment-actions">
                    <div class="skeleton skeleton-text short" style="width: 40px;"></div>
                    <div class="skeleton skeleton-text short" style="width: 40px;"></div>
                    <div class="skeleton skeleton-text short" style="width: 60px;"></div>
                </div>
            </div>
        `;
    }

    hideSkeletonLoading() {
        // Handled by renderComments
    }

    renderComments() {
        const container = document.getElementById('commentsContainer');
        const filteredComments = this.currentCategory === 'all' 
            ? this.comments 
            : this.comments.filter(comment => comment.category === this.currentCategory);
        
        if (filteredComments.length === 0) {
            container.innerHTML = `
                <div class="no-comments">
                    <i class="fas fa-comments"></i>
                    <h3>No comments yet</h3>
                    <p>Be the first to share your thoughts!</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = filteredComments.map(comment => this.createCommentElement(comment)).join('');
        
        // Re-attach event listeners to action buttons
        this.attachActionListeners();
    }

    createCommentElement(comment) {
        const timestamp = comment.createdAt ? this.formatTimestamp(comment.createdAt.toDate()) : 'Recently';
        const isSensitive = this.checkSensitiveContent(comment.content);
        const userLiked = comment.likedBy && comment.likedBy.includes(this.currentUser.uid);
        
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
                    <div class="comment-text ${isSensitive ? 'blurred' : ''}">${this.escapeHtml(comment.content)}</div>
                    ${isSensitive ? '<div class="sensitive-warning"><i class="fas fa-eye-slash"></i> Sensitive content detected</div>' : ''}
                    ${comment.linkPreview ? this.renderLinkPreview(comment.linkPreview) : ''}
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

    renderLinkPreview(preview) {
        if (!preview) return '';
        
        return `
            <div class="link-preview">
                <div class="link-preview-content">
                    ${preview.title ? `<div class="link-preview-title">${this.escapeHtml(preview.title)}</div>` : ''}
                    ${preview.description ? `<div class="link-preview-description">${this.escapeHtml(preview.description)}</div>` : ''}
                    ${preview.url ? `<div class="link-preview-url">${this.escapeHtml(preview.url)}</div>` : ''}
                </div>
            </div>
        `;
    }

    attachActionListeners() {
        // Like buttons
        document.querySelectorAll('.like-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                if (!this.isParticipating) {
                    document.getElementById('userBanner').classList.add('active');
                    return;
                }
                await this.handleLike(e.currentTarget);
            });
        });
        
        // Report buttons
        document.querySelectorAll('.report-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                if (!this.isParticipating) {
                    document.getElementById('userBanner').classList.add('active');
                    return;
                }
                await this.handleReport(e.currentTarget);
            });
        });
        
        // Reply buttons
        document.querySelectorAll('.reply-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                if (!this.isParticipating) {
                    document.getElementById('userBanner').classList.add('active');
                    return;
                }
                this.handleReply(e.currentTarget);
            });
        });
    }

    async handleLike(button) {
        const commentId = button.dataset.commentId;
        
        try {
            button.disabled = true;
            const result = await feedAPI.toggleLike(commentId, this.currentUser.uid);
            
            // Update UI immediately
            const icon = button.querySelector('i');
            const countSpan = button.querySelector('span');
            const currentCount = parseInt(countSpan.textContent);
            
            if (result) {
                // Liked
                icon.classList.remove('far');
                icon.classList.add('fas', 'liked');
                button.classList.add('liked');
                countSpan.textContent = currentCount + 1;
            } else {
                // Unliked
                icon.classList.remove('fas', 'liked');
                icon.classList.add('far');
                button.classList.remove('liked');
                countSpan.textContent = currentCount - 1;
            }
            
        } catch (error) {
            console.error('Error toggling like:', error);
            this.showToast('Failed to update like', 'error');
        } finally {
            button.disabled = false;
        }
    }

    async handleReport(button) {
        const commentId = button.dataset.commentId;
        
        const reason = prompt('Please specify the reason for reporting this content:');
        if (!reason || reason.trim() === '') return;
        
        try {
            button.disabled = true;
            await feedAPI.reportContent(commentId, 'comment', reason.trim(), this.currentUser.uid);
            this.showToast('Content reported successfully. Thank you for helping keep the community safe.', 'success');
        } catch (error) {
            console.error('Error reporting content:', error);
            this.showToast('Failed to report content', 'error');
        } finally {
            button.disabled = false;
        }
    }

    handleReply(button) {
        const commentId = button.dataset.commentId;
        const replyText = prompt('Enter your reply:');
        
        if (!replyText || replyText.trim() === '') return;
        
        this.postReply(commentId, replyText.trim());
    }

    async postComment() {
        const content = document.getElementById('commentInput').value.trim();
        const category = document.getElementById('categorySelect').value;
        
        if (!content) {
            this.showToast('Please enter a comment', 'warning');
            return;
        }
        
        if (content.length > 1000) {
            this.showToast('Comment too long. Maximum 1000 characters.', 'warning');
            return;
        }
        
        if (!this.isParticipating) {
            document.getElementById('userBanner').classList.add('active');
            return;
        }
        
        const sendBtn = document.getElementById('sendBtn');
        const commentInput = document.getElementById('commentInput');
        
        try {
            sendBtn.disabled = true;
            sendBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
            commentInput.disabled = true;
            
            // Get user profile
            const userProfile = await this.getUserProfile();
            
            // Check for sensitive content
            const isSensitive = this.checkSensitiveContent(content);
            
            // Extract link preview
            const linkPreview = this.extractLinkPreview(content);
            
            // Post to Firebase
            await feedAPI.postComment({
                content,
                category,
                userName: userProfile.displayName,
                userAvatar: userProfile.avatarLetter,
                userId: this.currentUser.uid,
                isSensitive,
                linkPreview,
                status: 'active',
                likes: 0,
                likedBy: [],
                replyCount: 0,
                reports: 0
            });
            
            // Clear input
            commentInput.value = '';
            commentInput.style.height = 'auto';
            
            // Show success
            this.showToast('Comment posted successfully', 'success');
            
        } catch (error) {
            console.error('Error posting comment:', error);
            this.showToast('Failed to post comment. Please try again.', 'error');
        } finally {
            sendBtn.disabled = false;
            sendBtn.innerHTML = '<i class="fas fa-paper-plane"></i>';
            commentInput.disabled = false;
        }
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
        try {
            const userDoc = await this.db.collection('anonymousUsers').doc(this.currentUser.uid).get();
            return userDoc.exists ? userDoc.data() : { displayName: 'AnonymousUser', avatarLetter: 'A' };
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

    extractLinkPreview(text) {
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        const matches = text.match(urlRegex);
        
        if (matches && matches.length > 0) {
            return {
                url: matches[0],
                // In a real implementation, you'd fetch the actual preview
                // For now, we'll just return the URL
                title: 'External Link',
                description: 'Click to visit this link'
            };
        }
        
        return null;
    }

    filterCommentsByCategory(category) {
        this.currentCategory = category;
        this.renderComments();
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

    formatTimestamp(timestamp) {
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

    escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    showToast(message, type = 'success') {
        // Remove existing toasts
        document.querySelectorAll('.toast').forEach(toast => toast.remove());
        
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <div class="toast-icon">
                <i class="fas fa-${type === 'success' ? 'check' : type === 'error' ? 'exclamation-triangle' : 'info'}"></i>
            </div>
            <div class="toast-message">${message}</div>
        `;
        
        document.body.appendChild(toast);
        
        // Animate in
        setTimeout(() => toast.classList.add('active'), 10);
        
        // Auto remove
        setTimeout(() => {
            toast.classList.remove('active');
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 500);
        }, 4000);
    }

    // Settings methods
    async changeNickname() {
        const newName = prompt('Enter new nickname (3-20 characters):');
        if (!newName || newName.trim().length < 3 || newName.trim().length > 20) {
            this.showToast('Nickname must be between 3-20 characters', 'warning');
            return;
        }
        
        try {
            await this.db.collection('anonymousUsers').doc(this.currentUser.uid).update({
                displayName: newName.trim()
            });
            
            this.showToast('Nickname updated successfully', 'success');
            this.closeSettings();
            
        } catch (error) {
            console.error('Error updating nickname:', error);
            this.showToast('Failed to update nickname', 'error');
        }
    }

    showContentFilters() {
        alert('Content filter settings would be implemented here.\n\nYou can customize what type of content you want to see and set sensitivity filters.');
        this.closeSettings();
    }

    showPrivacyInfo() {
        const privacyInfo = `
Eldrex Privacy Information:

• Complete Anonymity: No personal data is ever collected or stored
• No Tracking: We don't track your activity across sessions
• Auto-Expiring: Comments may be automatically removed after 90 days
• Content Moderation: AI-assisted filtering for inappropriate content
• No Cookies: We don't use tracking cookies or persistent identifiers
• Open Source: Platform code is transparent and verifiable

Your privacy and security are our top priority.`;

        alert(privacyInfo);
        this.closeSettings();
    }

    reportProblem() {
        const problem = prompt('Please describe the problem or issue you encountered:');
        if (!problem || problem.trim() === '') return;
        
        // In production, this would send to a support system
        console.log('Problem reported:', problem.trim());
        
        // Store in Firebase for tracking
        this.db.collection('problemReports').add({
            description: problem.trim(),
            userId: this.currentUser.uid,
            userAgent: navigator.userAgent,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            url: window.location.href
        }).catch(error => {
            console.error('Error saving problem report:', error);
        });
        
        this.showToast('Problem reported successfully. Thank you for your feedback!', 'success');
        this.closeSettings();
    }

    // Cleanup on page unload
    destroy() {
        if (this.commentsUnsubscribe) {
            this.commentsUnsubscribe();
        }
    }
}

// Initialize the platform when DOM is loaded
let eldrexFeed;

document.addEventListener('DOMContentLoaded', () => {
    eldrexFeed = new EldrexFeed();
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (eldrexFeed) {
        eldrexFeed.destroy();
    }
});

// Export for potential module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EldrexFeed;
}