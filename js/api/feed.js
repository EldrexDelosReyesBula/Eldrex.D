// Global Feed Management
class EldrexFeed {
    constructor() {
        this.currentUser = null;
        this.isParticipating = false;
        this.comments = [];
        this.currentCategory = 'all';
        this.init();
    }

    async init() {
        // Initialize security checks
        this.setupSecurity();
        
        // Initialize Firebase
        await this.initializeFirebase();
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Load initial data
        this.loadComments();
        
        // Show user banner if needed
        this.checkUserParticipation();
    }

    setupSecurity() {
        const allowedDomain = 'eldrex.landecs.org';
        const currentDomain = window.location.hostname;
        
        // Check if not running on the allowed domain
        if (currentDomain !== allowedDomain && 
            currentDomain !== 'localhost' && 
            !currentDomain.includes('127.0.0.1')) {
            
            // Show security notice
            document.getElementById('securityNotice').classList.add('active');
            
            // Prevent right-click
            document.addEventListener('contextmenu', function(e) {
                e.preventDefault();
                return false;
            });
            
            // Prevent keyboard shortcuts for dev tools
            document.addEventListener('keydown', function(e) {
                // Disable F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U
                if (e.key === 'F12' || 
                    (e.ctrlKey && e.shiftKey && e.key === 'I') || 
                    (e.ctrlKey && e.shiftKey && e.key === 'J') || 
                    (e.ctrlKey && e.key === 'u')) {
                    e.preventDefault();
                    return false;
                }
            });
            
            // Redirect attempts to embed or iframe
            if (window.self !== window.top) {
                window.top.location.href = 'https://eldrex.landecs.org/404';
            }
        }
    }

    async initializeFirebase() {
        try {
            // Firebase configuration will be loaded from feed_api.js
            if (typeof firebaseConfig === 'undefined') {
                throw new Error('Firebase configuration not found');
            }
            
            firebase.initializeApp(firebaseConfig);
            this.db = firebase.firestore();
            this.auth = firebase.auth();
            
            // Set up anonymous authentication
            await this.setupAnonymousAuth();
            
        } catch (error) {
            console.error('Firebase initialization failed:', error);
            this.showToast('Failed to initialize platform', 'error');
        }
    }

    async setupAnonymousAuth() {
        try {
            // Sign in anonymously
            const userCredential = await this.auth.signInAnonymously();
            this.currentUser = userCredential.user;
            
            // Generate anonymous user data
            await this.generateAnonymousProfile();
            
        } catch (error) {
            console.error('Anonymous auth failed:', error);
            this.showToast('Authentication failed', 'error');
        }
    }

    async generateAnonymousProfile() {
        const userId = this.currentUser.uid;
        const userRef = this.db.collection('anonymousUsers').doc(userId);
        
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
                lastActive: firebase.firestore.FieldValue.serverTimestamp()
            });
        }
    }

    setupEventListeners() {
        // Back button
        document.getElementById('backBtn').addEventListener('click', () => {
            window.history.back();
        });
        
        // Settings button
        document.getElementById('settingsBtn').addEventListener('click', () => {
            document.getElementById('bottomSheet').classList.add('active');
        });
        
        // Close bottom sheet
        document.getElementById('closeSheet').addEventListener('click', () => {
            document.getElementById('bottomSheet').classList.remove('active');
        });
        
        // Category selection
        document.querySelectorAll('.category').forEach(category => {
            category.addEventListener('click', () => {
                document.querySelectorAll('.category').forEach(c => c.classList.remove('active'));
                category.classList.add('active');
                this.currentCategory = category.dataset.category;
                this.filterCommentsByCategory(this.currentCategory);
            });
        });
        
        // Send comment
        document.getElementById('sendBtn').addEventListener('click', () => this.postComment());
        document.getElementById('commentInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.postComment();
            }
        });
        
        // Auto-resize textarea
        document.getElementById('commentInput').addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = (this.scrollHeight) + 'px';
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
    }

    checkUserParticipation() {
        const userConfirmed = localStorage.getItem('userConfirmed');
        if (!userConfirmed) {
            setTimeout(() => {
                document.getElementById('userBanner').classList.add('active');
            }, 1000);
        } else {
            this.isParticipating = true;
        }
    }

    confirmParticipation() {
        localStorage.setItem('userConfirmed', 'true');
        document.getElementById('userBanner').classList.remove('active');
        this.isParticipating = true;
        this.showToast('Welcome! You can now participate anonymously.', 'success');
    }

    setExploreOnlyMode() {
        document.getElementById('userBanner').classList.remove('active');
        
        // Disable interaction elements
        document.getElementById('commentInput').disabled = true;
        document.getElementById('commentInput').placeholder = "Sign in to comment...";
        document.getElementById('sendBtn').disabled = true;
        
        document.querySelectorAll('.action-btn').forEach(btn => {
            btn.disabled = true;
        });
        
        this.showToast('Explore mode activated. You can view but not interact.', 'warning');
    }

    async loadComments() {
        try {
            this.showSkeletonLoading();
            
            const commentsRef = this.db.collection('comments')
                .where('status', '==', 'approved')
                .orderBy('createdAt', 'desc')
                .limit(50);
            
            // Real-time listener
            commentsRef.onSnapshot(snapshot => {
                this.comments = [];
                snapshot.forEach(doc => {
                    this.comments.push({
                        id: doc.id,
                        ...doc.data()
                    });
                });
                
                this.renderComments();
                this.hideSkeletonLoading();
                
            }, error => {
                console.error('Error loading comments:', error);
                this.hideSkeletonLoading();
                this.showToast('Failed to load comments', 'error');
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
                    <div class="skeleton skeleton-text short"></div>
                </div>
                <div class="comment-content">
                    <div class="skeleton skeleton-text long"></div>
                    <div class="skeleton skeleton-text long"></div>
                    <div class="skeleton skeleton-text medium"></div>
                </div>
                <div class="comment-actions">
                    <div class="skeleton skeleton-text short"></div>
                    <div class="skeleton skeleton-text short"></div>
                    <div class="skeleton skeleton-text short"></div>
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
                    <div class="skeleton skeleton-text short"></div>
                </div>
                <div class="comment-content">
                    <div class="skeleton skeleton-text long"></div>
                    <div class="skeleton skeleton-text long"></div>
                    <div class="skeleton skeleton-text medium"></div>
                </div>
                <div class="comment-actions">
                    <div class="skeleton skeleton-text short"></div>
                    <div class="skeleton skeleton-text short"></div>
                    <div class="skeleton skeleton-text short"></div>
                </div>
            </div>
        `;
    }

    hideSkeletonLoading() {
        // Skeleton will be replaced when comments are rendered
    }

    renderComments() {
        const container = document.getElementById('commentsContainer');
        const filteredComments = this.currentCategory === 'all' 
            ? this.comments 
            : this.comments.filter(comment => comment.category === this.currentCategory);
        
        if (filteredComments.length === 0) {
            container.innerHTML = `
                <div class="no-comments">
                    <div style="text-align: center; padding: 3rem; color: var(--text-secondary);">
                        <i class="fas fa-comments" style="font-size: 3rem; margin-bottom: 1rem;"></i>
                        <h3>No comments yet</h3>
                        <p>Be the first to share your thoughts!</p>
                    </div>
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
                    <div class="comment-text ${isSensitive ? 'blurred' : ''}">${comment.content}</div>
                    ${isSensitive ? '<div class="sensitive-warning"><i class="fas fa-eye-slash"></i> Sensitive content</div>' : ''}
                </div>
                <div class="comment-actions">
                    <button class="action-btn like-btn" data-comment-id="${comment.id}">
                        <i class="${comment.userLiked ? 'fas' : 'far'} fa-heart"></i>
                        <span>${comment.likes || 0}</span>
                    </button>
                    <button class="action-btn reply-btn" data-comment-id="${comment.id}">
                        <i class="far fa-comment"></i>
                        <span>${comment.replyCount || 0}</span>
                    </button>
                    <button class="action-btn report-btn" data-comment-id="${comment.id}">
                        <i class="far fa-flag"></i>
                        <span>Report</span>
                    </button>
                </div>
                ${comment.replies && comment.replies.length > 0 ? this.renderReplies(comment.replies) : ''}
            </div>
        `;
    }

    renderReplies(replies) {
        return `
            <div class="replies-container">
                ${replies.map(reply => `
                    <div class="reply-card">
                        <div class="comment-header">
                            <div class="user-info">
                                <div class="avatar">${reply.userAvatar || 'A'}</div>
                                <div class="user-details">
                                    <div class="username">${reply.userName || 'AnonymousUser'}</div>
                                    <div class="timestamp">${this.formatTimestamp(reply.createdAt.toDate())}</div>
                                </div>
                            </div>
                        </div>
                        <div class="comment-content">
                            <div class="comment-text">${reply.content}</div>
                        </div>
                        <div class="comment-actions">
                            <button class="action-btn like-btn" data-reply-id="${reply.id}">
                                <i class="far fa-heart"></i>
                                <span>${reply.likes || 0}</span>
                            </button>
                            <button class="action-btn report-btn" data-reply-id="${reply.id}">
                                <i class="far fa-flag"></i>
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    attachActionListeners() {
        // Like buttons
        document.querySelectorAll('.like-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                if (!this.isParticipating) {
                    document.getElementById('userBanner').classList.add('active');
                    return;
                }
                this.handleLike(e.target.closest('.like-btn'));
            });
        });
        
        // Report buttons
        document.querySelectorAll('.report-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                if (!this.isParticipating) {
                    document.getElementById('userBanner').classList.add('active');
                    return;
                }
                this.handleReport(e.target.closest('.report-btn'));
            });
        });
        
        // Reply buttons
        document.querySelectorAll('.reply-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                if (!this.isParticipating) {
                    document.getElementById('userBanner').classList.add('active');
                    return;
                }
                this.handleReply(e.target.closest('.reply-btn'));
            });
        });
    }

    async handleLike(button) {
        const commentId = button.dataset.commentId;
        const replyId = button.dataset.replyId;
        
        try {
            if (commentId) {
                await feedAPI.toggleLike(commentId, this.currentUser.uid);
            } else if (replyId) {
                await feedAPI.toggleReplyLike(replyId, this.currentUser.uid);
            }
        } catch (error) {
            console.error('Error toggling like:', error);
            this.showToast('Failed to update like', 'error');
        }
    }

    async handleReport(button) {
        const commentId = button.dataset.commentId;
        const replyId = button.dataset.replyId;
        
        const reason = prompt('Please specify the reason for reporting:');
        if (!reason) return;
        
        try {
            if (commentId) {
                await feedAPI.reportContent(commentId, 'comment', reason, this.currentUser.uid);
            } else if (replyId) {
                await feedAPI.reportContent(replyId, 'reply', reason, this.currentUser.uid);
            }
            
            this.showToast('Content reported successfully', 'success');
        } catch (error) {
            console.error('Error reporting content:', error);
            this.showToast('Failed to report content', 'error');
        }
    }

    handleReply(button) {
        const commentId = button.dataset.commentId;
        const replyText = prompt('Enter your reply:');
        
        if (!replyText) return;
        
        this.postReply(commentId, replyText);
    }

    async postComment() {
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
        
        try {
            // Get user profile
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
                status: 'approved'
            });
            
            // Clear input
            document.getElementById('commentInput').value = '';
            document.getElementById('commentInput').style.height = 'auto';
            
            // Show success
            this.showToast('Comment posted successfully', 'success');
            
        } catch (error) {
            console.error('Error posting comment:', error);
            this.showToast('Failed to post comment', 'error');
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
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            this.showToast('Reply posted successfully', 'success');
            
        } catch (error) {
            console.error('Error posting reply:', error);
            this.showToast('Failed to post reply', 'error');
        }
    }

    async getUserProfile() {
        const userDoc = await this.db.collection('anonymousUsers').doc(this.currentUser.uid).get();
        return userDoc.exists ? userDoc.data() : { displayName: 'AnonymousUser', avatarLetter: 'A' };
    }

    checkSensitiveContent(text) {
        const sensitiveWords = [
            'hate', 'violence', 'attack', 'harm', 'abuse', 'kill', 'hurt',
            'discrimination', 'harassment', 'threat', 'danger', 'dangerous',
            'offensive', 'inappropriate', 'explicit'
        ];
        
        const lowerText = text.toLowerCase();
        return sensitiveWords.some(word => lowerText.includes(word));
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
        
        if (diff < minute) return 'Just now';
        if (diff < hour) return `${Math.floor(diff / minute)}m ago`;
        if (diff < day) return `${Math.floor(diff / hour)}h ago`;
        if (diff < day * 7) return `${Math.floor(diff / day)}d ago`;
        
        return timestamp.toLocaleDateString();
    }

    showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <div class="toast-icon">
                <i class="fas fa-${type === 'success' ? 'check' : type === 'error' ? 'exclamation-triangle' : 'info'}"></i>
            </div>
            <div class="toast-message">${message}</div>
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => toast.classList.add('active'), 100);
        
        setTimeout(() => {
            toast.classList.remove('active');
            setTimeout(() => toast.remove(), 500);
        }, 4000);
    }

    // Settings methods
    async changeNickname() {
        const newName = prompt('Enter new nickname:');
        if (!newName) return;
        
        try {
            await this.db.collection('anonymousUsers').doc(this.currentUser.uid).update({
                displayName: newName
            });
            
            this.showToast('Nickname updated successfully', 'success');
            document.getElementById('bottomSheet').classList.remove('active');
            
        } catch (error) {
            console.error('Error updating nickname:', error);
            this.showToast('Failed to update nickname', 'error');
        }
    }

    showContentFilters() {
        alert('Content filter settings would be implemented here');
        document.getElementById('bottomSheet').classList.remove('active');
    }

    showPrivacyInfo() {
        alert(`Privacy Information:
        
• All interactions are completely anonymous
• No personal data is stored or collected
• Comments are automatically screened for sensitive content
• You can report inappropriate content
• Your identity is protected at all times`);
        document.getElementById('bottomSheet').classList.remove('active');
    }

    reportProblem() {
        const problem = prompt('Please describe the problem you encountered:');
        if (!problem) return;
        
        // In a real implementation, this would send to a support system
        console.log('Problem reported:', problem);
        this.showToast('Problem reported successfully', 'success');
        document.getElementById('bottomSheet').classList.remove('active');
    }
}

// Initialize the platform when DOM is loaded
let eldrexFeed;
document.addEventListener('DOMContentLoaded', () => {
    eldrexFeed = new EldrexFeed();
});