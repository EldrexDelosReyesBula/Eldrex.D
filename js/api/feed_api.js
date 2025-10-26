
// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyBXon59d9UHyLT0gYuZE2KKJ-gv0u5rTHk",
  authDomain: "feedback-e7037.firebaseapp.com",
  databaseURL: "https://feedback-e7037-default-rtdb.firebaseio.com",
  projectId: "feedback-e7037",
  storageBucket: "feedback-e7037.firebasestorage.app",
  messagingSenderId: "53701493047",
  appId: "1:53701493047:web:39fa1d4f5fcb46531f9ab2",
  measurementId: "G-TZDZMDPX6D"
};


// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();
const rtdb = firebase.database();

// Comprehensive sensitive words list for client-side filtering
const sensitiveWords = [
    // Profanity and offensive language
    'fuck', 'shit', 'asshole', 'bitch', 'bastard', 'dick', 'pussy', 'cunt',
    'whore', 'slut', 'retard', 'fag', 'faggot', 'nigger', 'nigga', 'chink',
    'spic', 'kike', 'cracker', 'gook', 'wetback',
    
    // Harassment and hate speech
    'kill', 'murder', 'death', 'die', 'suicide', 'harm', 'hurt', 'attack',
    'violence', 'abuse', 'rape', 'molest', 'pedophile', 'terrorist',
    'bomb', 'shoot', 'gun', 'weapon', 'attack',
    
    // Discriminatory terms
    'retarded', 'stupid', 'idiot', 'moron', 'imbecile', 'retard',
    'fatso', 'ugly', 'loser', 'worthless', 'useless', 'failure',
    
    // Explicit content
    'porn', 'porno', 'xxx', 'sex', 'sexual', 'nude', 'naked', 'dick', 'pussy',
    'penis', 'vagina', 'boobs', 'tits', 'ass', 'butt', 'anal', 'blowjob',
    
    // Threats and dangerous content
    'threat', 'danger', 'dangerous', 'illegal', 'drugs', 'cocaine', 'heroin',
    'meth', 'weed', 'marijuana', 'alcohol', 'drunk', 'drinking'
];

// Rate limiting utility
const RateLimiter = {
    async checkRateLimit(userId, action, limit = 10, windowMs = 60000) {
        try {
            const now = Date.now();
            const windowStart = now - windowMs;
            
            const rateLimitRef = rtdb.ref(`rateLimits/${userId}/${action}`);
            const snapshot = await rateLimitRef.once('value');
            const data = snapshot.val() || { count: 0, lastAction: 0 };
            
            // Reset count if outside the time window
            if (data.lastAction < windowStart) {
                data.count = 0;
            }
            
            // Check if limit exceeded
            if (data.count >= limit) {
                return { allowed: false, remaining: 0, resetTime: data.lastAction + windowMs };
            }
            
            // Update rate limit
            await rateLimitRef.update({
                count: data.count + 1,
                lastAction: now
            });
            
            return { allowed: true, remaining: limit - (data.count + 1), resetTime: now + windowMs };
        } catch (error) {
            console.error('Rate limit check error:', error);
            return { allowed: true, remaining: limit, resetTime: Date.now() + windowMs };
        }
    }
};

// API Functions
const EldrexAPI = {
    // Content moderation function (client-side only)
    moderateContent(content) {
        return new Promise((resolve) => {
            // Client-side filtering with word boundaries
            const hasSensitiveContent = sensitiveWords.some(word => {
                const regex = new RegExp(`\\b${word}\\b`, 'i');
                return regex.test(content);
            });
            
            resolve({ 
                sensitive: hasSensitiveContent, 
                blocked: false // Never block, just mark as sensitive
            });
        });
    },

    // Get comments from Firestore with rate limiting
    async getComments(category = 'all') {
        try {
            const userId = getUserId();
            const rateLimit = await RateLimiter.checkRateLimit(userId, 'comment_read', 60, 60000); // 60 reads per minute
            
            if (!rateLimit.allowed) {
                throw new Error('Rate limit exceeded for reading comments');
            }
            
            let query = db.collection('comments')
                .where('approved', '==', true)
                .orderBy('timestamp', 'desc')
                .limit(50); // Limit to 50 comments per request
            
            if (category !== 'all') {
                query = query.where('category', '==', category);
            }
            
            const snapshot = await query.get();
            const comments = [];
            
            snapshot.forEach(doc => {
                const comment = doc.data();
                comment.id = doc.id;
                
                // Ensure all required fields exist
                comment.likes = comment.likes || 0;
                comment.userLikes = comment.userLikes || [];
                comment.replies = comment.replies || [];
                comment.reportCount = comment.reportCount || 0;
                
                comments.push(comment);
            });
            
            // Log analytics
            this.logAnalytics('comment_read', { category, count: comments.length });
            
            return comments;
        } catch (error) {
            console.error('Error getting comments:', error);
            throw error;
        }
    },

    // Add comment to Firestore with rate limiting and validation
    async addComment(commentData) {
        try {
            const userId = getUserId();
            
            // Rate limiting
            const rateLimit = await RateLimiter.checkRateLimit(userId, 'comment_post', 5, 60000); // 5 posts per minute
            if (!rateLimit.allowed) {
                throw new Error('Rate limit exceeded for posting comments');
            }
            
            // Input validation
            if (!commentData.content || commentData.content.trim().length === 0) {
                throw new Error('Comment content cannot be empty');
            }
            
            if (commentData.content.length > 1000) {
                throw new Error('Comment content too long');
            }
            
            const validCategories = ['recommendation', 'improvement', 'request', 'report', 'other'];
            if (!validCategories.includes(commentData.category)) {
                throw new Error('Invalid comment category');
            }
            
            // Moderate content before posting
            const moderationResult = await this.moderateContent(commentData.content);
            
            const commentWithMetadata = {
                content: commentData.content.trim(),
                category: commentData.category,
                nickname: commentData.nickname ? commentData.nickname.trim().substring(0, 20) : null,
                sensitive: moderationResult.sensitive,
                approved: true, // Auto-approve all comments
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                likes: 0,
                userLikes: [],
                replies: [],
                reported: false,
                reportCount: 0,
                userId: userId // Track user for moderation purposes
            };
            
            const docRef = await db.collection('comments').add(commentWithMetadata);
            
            // Update real-time database statistics
            this.updateStatistics('comment_post');
            
            // Log analytics
            this.logAnalytics('comment_post', { 
                category: commentData.category,
                hasSensitiveContent: moderationResult.sensitive 
            });
            
            return docRef.id;
        } catch (error) {
            console.error('Error adding comment:', error);
            throw error;
        }
    },

    // Add reply to comment with rate limiting
    async addReply(commentId, replyData) {
        try {
            const userId = getUserId();
            
            // Rate limiting
            const rateLimit = await RateLimiter.checkRateLimit(userId, 'reply_post', 10, 60000); // 10 replies per minute
            if (!rateLimit.allowed) {
                throw new Error('Rate limit exceeded for posting replies');
            }
            
            // Input validation
            if (!replyData.content || replyData.content.trim().length === 0) {
                throw new Error('Reply content cannot be empty');
            }
            
            if (replyData.content.length > 500) {
                throw new Error('Reply content too long');
            }
            
            // Moderate reply content
            const moderationResult = await this.moderateContent(replyData.content);
            
            const replyWithMetadata = {
                content: replyData.content.trim(),
                nickname: replyData.nickname ? replyData.nickname.trim().substring(0, 20) : null,
                sensitive: moderationResult.sensitive,
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                userId: userId
            };
            
            await db.collection('comments').doc(commentId).update({
                replies: firebase.firestore.FieldValue.arrayUnion(replyWithMetadata)
            });
            
            // Log analytics
            this.logAnalytics('reply', { commentId });
            
            return true;
        } catch (error) {
            console.error('Error adding reply:', error);
            throw error;
        }
    },

    // Toggle like on comment with rate limiting
    async toggleLike(commentId, userId) {
        try {
            // Rate limiting
            const rateLimit = await RateLimiter.checkRateLimit(userId, 'like', 30, 60000); // 30 likes per minute
            if (!rateLimit.allowed) {
                throw new Error('Rate limit exceeded for liking comments');
            }
            
            const commentRef = db.collection('comments').doc(commentId);
            const commentDoc = await commentRef.get();
            
            if (!commentDoc.exists) {
                throw new Error('Comment not found');
            }
            
            const comment = commentDoc.data();
            const userLikes = comment.userLikes || [];
            const userLiked = userLikes.includes(userId);
            
            if (userLiked) {
                // Unlike
                await commentRef.update({
                    likes: firebase.firestore.FieldValue.increment(-1),
                    userLikes: firebase.firestore.FieldValue.arrayRemove(userId)
                });
                
                // Log analytics
                this.logAnalytics('unlike', { commentId });
                
                return { liked: false, likes: comment.likes - 1 };
            } else {
                // Like
                await commentRef.update({
                    likes: firebase.firestore.FieldValue.increment(1),
                    userLikes: firebase.firestore.FieldValue.arrayUnion(userId)
                });
                
                // Log analytics
                this.logAnalytics('like', { commentId });
                
                return { liked: true, likes: comment.likes + 1 };
            }
        } catch (error) {
            console.error('Error toggling like:', error);
            throw error;
        }
    },

    // Report comment with rate limiting
    async reportComment(commentId, reportData) {
        try {
            const userId = getUserId();
            
            // Rate limiting
            const rateLimit = await RateLimiter.checkRateLimit(userId, 'report', 5, 60000); // 5 reports per minute
            if (!rateLimit.allowed) {
                throw new Error('Rate limit exceeded for reporting comments');
            }
            
            // Check if user already reported this comment
            const reportsSnapshot = await db.collection('reports')
                .where('commentId', '==', commentId)
                .where('reporterId', '==', userId)
                .limit(1)
                .get();
            
            if (!reportsSnapshot.empty) {
                throw new Error('You have already reported this comment');
            }
            
            const report = {
                commentId: commentId,
                reason: reportData.reason,
                details: reportData.details ? reportData.details.trim().substring(0, 500) : null,
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                reporterId: userId,
                status: 'pending'
            };
            
            // Add to reports collection
            await db.collection('reports').add(report);
            
            // Increment report count on comment
            await db.collection('comments').doc(commentId).update({
                reportCount: firebase.firestore.FieldValue.increment(1),
                reported: true
            });
            
            // Log analytics
            this.logAnalytics('report', { commentId, reason: reportData.reason });
            
            return true;
        } catch (error) {
            console.error('Error reporting comment:', error);
            throw error;
        }
    },

    // Real-time listener for comments
    setupCommentsListener(category, callback) {
        let query = db.collection('comments')
            .where('approved', '==', true)
            .orderBy('timestamp', 'desc')
            .limit(50);
        
        if (category !== 'all') {
            query = query.where('category', '==', category);
        }
        
        return query.onSnapshot(snapshot => {
            const comments = [];
            snapshot.forEach(doc => {
                const comment = doc.data();
                comment.id = doc.id;
                
                // Ensure all required fields exist
                comment.likes = comment.likes || 0;
                comment.userLikes = comment.userLikes || [];
                comment.replies = comment.replies || [];
                comment.reportCount = comment.reportCount || 0;
                
                comments.push(comment);
            });
            callback(comments);
        }, error => {
            console.error('Comments listener error:', error);
            callback(null, error);
        });
    },

    // Analytics logging
    async logAnalytics(type, data = {}) {
        try {
            const userId = getUserId();
            
            await db.collection('analytics').add({
                type: type,
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                userId: userId,
                data: data,
                userAgent: navigator.userAgent,
                platform: navigator.platform
            });
        } catch (error) {
            console.error('Error logging analytics:', error);
            // Don't throw error for analytics failures
        }
    },

    // Update real-time statistics
    async updateStatistics(action) {
        try {
            const statsRef = rtdb.ref('statistics');
            
            switch (action) {
                case 'comment_post':
                    await statsRef.child('totalComments').transaction(current => (current || 0) + 1);
                    break;
                case 'like':
                    await statsRef.child('totalLikes').transaction(current => (current || 0) + 1);
                    break;
                case 'reply':
                    await statsRef.child('totalReplies').transaction(current => (current || 0) + 1);
                    break;
            }
            
            // Update active users count
            const presenceRef = rtdb.ref('presence');
            const presenceSnapshot = await presenceRef.once('value');
            const activeUsers = Object.keys(presenceSnapshot.val() || {}).length;
            
            await statsRef.update({
                activeUsers: activeUsers,
                lastUpdate: Date.now()
            });
            
        } catch (error) {
            console.error('Error updating statistics:', error);
            // Don't throw error for statistics failures
        }
    },

    // Get platform statistics
    async getStatistics() {
        try {
            const statsRef = rtdb.ref('statistics');
            const snapshot = await statsRef.once('value');
            return snapshot.val() || {};
        } catch (error) {
            console.error('Error getting statistics:', error);
            return {};
        }
    },

    // Check system status
    async getSystemStatus() {
        try {
            const systemRef = rtdb.ref('system');
            const snapshot = await systemRef.once('value');
            return snapshot.val() || { status: 'online', message: '' };
        } catch (error) {
            console.error('Error getting system status:', error);
            return { status: 'online', message: '' };
        }
    }
};

// Initialize presence system
function initializePresence() {
    const userId = getUserId();
    const presenceRef = rtdb.ref('presence/' + userId);
    
    // Set user as online
    presenceRef.set('online');
    
    // Set user as away when window loses focus
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            presenceRef.set('away');
        } else {
            presenceRef.set('online');
        }
    });
    
    // Set user as offline when window closes
    window.addEventListener('beforeunload', () => {
        presenceRef.set('offline');
    });
}

// Initialize presence when API is loaded
setTimeout(initializePresence, 1000);