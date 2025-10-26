// Global JavaScript for Eldrex Comments Platform

// DOM Elements
const commentsContainer = document.getElementById('commentsContainer');
const commentInput = document.getElementById('commentInput');
const categorySelect = document.getElementById('categorySelect');
const sendBtn = document.getElementById('sendBtn');
const categories = document.querySelectorAll('.category');
const settingsBtn = document.getElementById('settingsBtn');
const bottomSheet = document.getElementById('bottomSheet');
const closeSheet = document.getElementById('closeSheet');
const backBtn = document.getElementById('backBtn');
const toast = document.getElementById('toast');
const toastMessage = document.getElementById('toastMessage');
const closeToast = document.getElementById('closeToast');
const nicknameModal = document.getElementById('nicknameModal');
const closeNicknameModal = document.getElementById('closeNicknameModal');
const cancelNickname = document.getElementById('cancelNickname');
const saveNickname = document.getElementById('saveNickname');
const nicknameInput = document.getElementById('nicknameInput');
const reportModal = document.getElementById('reportModal');
const closeReportModal = document.getElementById('closeReportModal');
const cancelReport = document.getElementById('cancelReport');
const submitReport = document.getElementById('submitReport');
const reportReason = document.getElementById('reportReason');
const reportDetails = document.getElementById('reportDetails');

// Current state
let currentCategory = 'all';
let comments = [];
let userNickname = localStorage.getItem('userNickname') || '';
let commentToReport = null;
let unsubscribeComments = null;

// Security measures
document.addEventListener('DOMContentLoaded', function() {
    // Prevent right-click
    document.addEventListener('contextmenu', function(e) {
        e.preventDefault();
    });
    
    // Prevent keyboard shortcuts for dev tools
    document.addEventListener('keydown', function(e) {
        // Disable F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U
        if (e.key === 'F12' || 
            (e.ctrlKey && e.shiftKey && e.key === 'I') || 
            (e.ctrlKey && e.shiftKey && e.key === 'J') || 
            (e.ctrlKey && e.key === 'u')) {
            e.preventDefault();
            showSecurityNotice();
        }
    });
    
    // Check if page is being embedded
    if (window.self !== window.top) {
        showSecurityNotice();
        setTimeout(() => {
            window.top.location.href = 'https://eldrex.landecs.org/404';
        }, 3000);
    }
    
    // Check for local or HTTP access
    if (window.location.protocol === 'http:' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        showSecurityNotice();
        setTimeout(() => {
            window.location.href = 'https://eldrex.landecs.org/404';
        }, 3000);
    }
    
    function showSecurityNotice() {
        document.getElementById('securityNotice').style.display = 'flex';
    }
});

// Initialize the app
function init() {
    setupEventListeners();
    loadComments();
    showSkeletonLoading();
    
    // Check if user needs to set nickname
    if (!localStorage.getItem('nicknameSet')) {
        setTimeout(() => {
            nicknameModal.classList.add('active');
        }, 1000);
    }
}

// Set up event listeners
function setupEventListeners() {
    // Category filter
    categories.forEach(category => {
        category.addEventListener('click', () => {
            categories.forEach(c => c.classList.remove('active'));
            category.classList.add('active');
            currentCategory = category.dataset.category;
            loadComments();
        });
    });

    // Comment input
    commentInput.addEventListener('input', () => {
        sendBtn.disabled = commentInput.value.trim() === '';
    });

    // Send comment
    sendBtn.addEventListener('click', addComment);
    commentInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (!sendBtn.disabled) {
                addComment();
            }
        }
    });

    // Settings
    settingsBtn.addEventListener('click', () => {
        bottomSheet.classList.add('active');
    });

    closeSheet.addEventListener('click', () => {
        bottomSheet.classList.remove('active');
    });

    // Back button
    backBtn.addEventListener('click', () => {
        if (document.referrer) {
            window.history.back();
        } else {
            window.location.href = 'https://eldrex.landecs.org';
        }
    });

    // Settings options
    document.getElementById('nicknameOption').addEventListener('click', () => {
        nicknameInput.value = userNickname;
        nicknameModal.classList.add('active');
        bottomSheet.classList.remove('active');
    });

    document.getElementById('filterOption').addEventListener('click', () => {
        showToast('Content filtering is enabled for sensitive words', 'info');
        bottomSheet.classList.remove('active');
    });

    document.getElementById('privacyOption').addEventListener('click', () => {
        window.open('https://eldrex.landecs.org/privacy', '_blank');
        bottomSheet.classList.remove('active');
    });

    document.getElementById('aboutOption').addEventListener('click', () => {
        window.open('https://eldrex.landecs.org/about', '_blank');
        bottomSheet.classList.remove('active');
    });

    // Toast
    closeToast.addEventListener('click', () => {
        toast.classList.remove('active');
    });

    // Nickname modal
    closeNicknameModal.addEventListener('click', () => {
        nicknameModal.classList.remove('active');
    });

    cancelNickname.addEventListener('click', () => {
        nicknameModal.classList.remove('active');
    });

    saveNickname.addEventListener('click', () => {
        userNickname = nicknameInput.value.trim();
        localStorage.setItem('userNickname', userNickname);
        localStorage.setItem('nicknameSet', 'true');
        nicknameModal.classList.remove('active');
        showToast('Nickname saved successfully', 'success');
    });

    // Report modal
    closeReportModal.addEventListener('click', () => {
        reportModal.classList.remove('active');
    });

    cancelReport.addEventListener('click', () => {
        reportModal.classList.remove('active');
    });

    submitReport.addEventListener('click', () => {
        if (commentToReport) {
            submitReportComment(commentToReport, reportReason.value, reportDetails.value);
            reportModal.classList.remove('active');
            commentToReport = null;
        }
    });

    // Close modals when clicking outside
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.classList.remove('active');
        }
    });
}

// Load comments using API
function loadComments() {
    // Unsubscribe from previous listener
    if (unsubscribeComments) {
        unsubscribeComments();
    }
    
    // Set up real-time listener
    unsubscribeComments = EldrexAPI.setupCommentsListener(currentCategory, (comments, error) => {
        if (error) {
            console.error('Error loading comments:', error);
            showToast('Error loading comments', 'error');
            hideSkeletonLoading();
            return;
        }
        
        window.comments = comments;
        hideSkeletonLoading();
        renderComments();
    });
}

// Render comments based on current filter
function renderComments() {
    commentsContainer.innerHTML = '';
    
    if (!comments || comments.length === 0) {
        commentsContainer.innerHTML = `
            <div class="no-comments" style="text-align: center; padding: 2rem; color: var(--text-secondary);">
                <p>No comments in this category yet. Be the first to share your thoughts!</p>
            </div>
        `;
        return;
    }
    
    comments.forEach(comment => {
        const commentElement = createCommentElement(comment);
        commentsContainer.appendChild(commentElement);
    });
}

// Create a comment element
function createCommentElement(comment) {
    const commentElement = document.createElement('div');
    commentElement.className = 'comment-card';
    commentElement.dataset.id = comment.id;
    
    // Check for sensitive content
    const hasSensitiveContent = comment.sensitive;
    const contentClass = hasSensitiveContent ? 'sensitive-content blurred' : '';
    const warningHtml = hasSensitiveContent ? 
        '<div class="warning">Sensitive content - Click to reveal</div>' : '';
    
    // Generate avatar color based on nickname
    const avatarColor = stringToColor(comment.nickname || 'Anonymous');
    const displayName = comment.nickname || 'Anonymous';
    
    // Format timestamp
    const timestamp = formatTimestamp(comment.timestamp);
    
    // Check if current user liked this comment
    const userLiked = comment.userLikes && comment.userLikes.includes(getUserId());
    
    commentElement.innerHTML = `
        <div class="comment-header">
            <div class="user-info">
                <div class="user-avatar" style="background-color: ${avatarColor}">
                    ${displayName.charAt(0).toUpperCase()}
                </div>
                <div class="user-details">
                    <div class="user-nickname">${displayName}</div>
                    <div class="comment-category">${formatCategory(comment.category)}</div>
                </div>
            </div>
            <div class="comment-time">${timestamp}</div>
        </div>
        <div class="comment-content ${contentClass}" ${hasSensitiveContent ? 'onclick="toggleSensitiveContent(this)"' : ''}>
            ${comment.content}
            ${warningHtml}
        </div>
        <div class="comment-actions">
            <button class="action-btn ${userLiked ? 'active' : ''}" onclick="toggleLike('${comment.id}')">
                <i class="fas fa-thumbs-up"></i>
                <span>Like (${comment.likes || 0})</span>
            </button>
            <button class="action-btn" onclick="toggleReplyForm('${comment.id}')">
                <i class="fas fa-reply"></i>
                <span>Reply</span>
            </button>
            <button class="action-btn" onclick="openReportModal('${comment.id}')">
                <i class="fas fa-flag"></i>
                <span>Report</span>
            </button>
        </div>
        ${comment.replies && comment.replies.length > 0 ? `
            <div class="replies-container">
                ${comment.replies.map(reply => `
                    <div class="comment-card" style="background-color: var(--quote-bg);">
                        <div class="comment-header">
                            <div class="user-info">
                                <div class="user-avatar" style="background-color: ${stringToColor(reply.nickname || 'Anonymous')}">
                                    ${(reply.nickname || 'Anonymous').charAt(0).toUpperCase()}
                                </div>
                                <div class="user-details">
                                    <div class="user-nickname">${reply.nickname || 'Anonymous'}</div>
                                </div>
                            </div>
                            <div class="comment-time">${formatTimestamp(reply.timestamp)}</div>
                        </div>
                        <div class="comment-content ${reply.sensitive ? 'sensitive-content blurred' : ''}" ${reply.sensitive ? 'onclick="toggleSensitiveContent(this)"' : ''}>
                            ${reply.content}
                            ${reply.sensitive ? '<div class="warning">Sensitive content - Click to reveal</div>' : ''}
                        </div>
                    </div>
                `).join('')}
            </div>
        ` : ''}
        <div class="reply-form" id="replyForm-${comment.id}" style="display: none;">
            <textarea class="reply-input" id="replyInput-${comment.id}" placeholder="Write a reply..."></textarea>
            <button class="send-reply-btn" onclick="addReply('${comment.id}')">
                <i class="fas fa-paper-plane"></i>
            </button>
        </div>
    `;
    
    return commentElement;
}

// Add a new comment using API
async function addComment() {
    const content = commentInput.value.trim();
    if (!content) return;
    
    const category = categorySelect.value;
    
    const commentData = {
        content: content,
        category: category,
        nickname: userNickname
    };
    
    try {
        await EldrexAPI.addComment(commentData);
        
        // Reset input
        commentInput.value = '';
        sendBtn.disabled = true;
        showToast('Comment posted successfully', 'success');
    } catch (error) {
        console.error('Error adding comment:', error);
        showToast('Error posting comment', 'error');
    }
}

// Add a reply using API
async function addReply(commentId) {
    const replyInput = document.getElementById(`replyInput-${commentId}`);
    const content = replyInput.value.trim();
    if (!content) return;
    
    const replyData = {
        content: content,
        nickname: userNickname
    };
    
    try {
        await EldrexAPI.addReply(commentId, replyData);
        
        // Hide the reply form
        document.getElementById(`replyForm-${commentId}`).style.display = 'none';
        replyInput.value = '';
        showToast('Reply posted successfully', 'success');
    } catch (error) {
        console.error('Error adding reply:', error);
        showToast('Error posting reply', 'error');
    }
}

// Toggle like using API
async function toggleLike(commentId) {
    try {
        await EldrexAPI.toggleLike(commentId, getUserId());
        // Real-time listener will update the UI automatically
    } catch (error) {
        console.error('Error toggling like:', error);
        showToast('Error updating like', 'error');
    }
}

// Toggle reply form visibility
function toggleReplyForm(commentId) {
    const replyForm = document.getElementById(`replyForm-${commentId}`);
    replyForm.style.display = replyForm.style.display === 'none' ? 'flex' : 'none';
    
    // Focus on the input when showing
    if (replyForm.style.display === 'flex') {
        document.getElementById(`replyInput-${commentId}`).focus();
    }
}

// Open report modal
function openReportModal(commentId) {
    commentToReport = commentId;
    reportModal.classList.add('active');
}

// Report a comment using API
async function submitReportComment(commentId, reason, details) {
    const reportData = {
        reason: reason,
        details: details,
        reporterId: getUserId()
    };
    
    try {
        await EldrexAPI.reportComment(commentId, reportData);
        showToast('Comment reported successfully', 'success');
    } catch (error) {
        console.error('Error reporting comment:', error);
        showToast('Error reporting comment', 'error');
    }
}

// Toggle sensitive content blur
function toggleSensitiveContent(element) {
    element.classList.toggle('blurred');
}

// Format category for display
function formatCategory(category) {
    return category.charAt(0).toUpperCase() + category.slice(1);
}

// Generate a color from a string (for avatars)
function stringToColor(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    const hue = hash % 360;
    return `hsl(${hue}, 60%, 65%)`;
}

// Format timestamp
function formatTimestamp(timestamp) {
    if (!timestamp) return 'Just now';
    
    const now = new Date();
    const commentTime = timestamp.toDate();
    const diffMs = now - commentTime;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hr ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    
    return commentTime.toLocaleDateString();
}

// Generate a unique user ID (for anonymous tracking)
function getUserId() {
    let userId = localStorage.getItem('userId');
    if (!userId) {
        userId = 'user_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('userId', userId);
    }
    return userId;
}

// Show skeleton loading
function showSkeletonLoading() {
    const skeletonComment = document.querySelector('.skeleton-comment');
    if (skeletonComment) {
        skeletonComment.style.display = 'block';
        // Clone it a few times
        for (let i = 0; i < 3; i++) {
            const clone = skeletonComment.cloneNode(true);
            commentsContainer.appendChild(clone);
        }
    }
}

// Hide skeleton loading
function hideSkeletonLoading() {
    document.querySelectorAll('.skeleton-comment').forEach(el => {
        el.style.display = 'none';
    });
}

// Show toast notification
function showToast(message, type = 'success') {
    toastMessage.textContent = message;
    toast.className = 'toast ' + type;
    toast.classList.add('active');
    
    setTimeout(() => {
        toast.classList.remove('active');
    }, 5000);
}

// Make functions available globally
window.toggleLike = toggleLike;
window.toggleReplyForm = toggleReplyForm;
window.addReply = addReply;
window.openReportModal = openReportModal;
window.toggleSensitiveContent = toggleSensitiveContent;

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', init);