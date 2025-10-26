// Optimized Firebase API for Eldrex Platform
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

// Cache for frequently accessed data
const apiCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Performance monitoring
const performanceMetrics = {
    requests: new Map(),
    startRequest: (endpoint) => {
        performanceMetrics.requests.set(endpoint, performance.now());
    },
    endRequest: (endpoint) => {
        const start = performanceMetrics.requests.get(endpoint);
        if (start) {
            const duration = performance.now() - start;
            console.log(`🚀 ${endpoint}: ${duration.toFixed(2)}ms`);
            performanceMetrics.requests.delete(endpoint);
            
            // Track in analytics
            feedAPI.trackAnalytics('api_performance', {
                endpoint,
                duration: Math.round(duration)
            });
        }
    }
};

// Feed API Functions with optimizations
const feedAPI = {
    // Post a new comment with batch operations
    async postComment(commentData) {
        performanceMetrics.startRequest('postComment');
        
        try {
            const batch = firebase.firestore().batch();
            const commentRef = firebase.firestore().collection('comments').doc();
            const statsRef = firebase.database().ref('platformStats/comments');
            
            // Prepare comment data
            const comment = {
                id: commentRef.id,
                ...commentData,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            };
            
            // Add to batch
            batch.set(commentRef, comment);
            
            // Execute batch
            await batch.commit();
            
            // Update stats in background (non-blocking)
            statsRef.transaction(current => (current || 0) + 1).catch(console.error);
            
            // Cache the new comment
            apiCache.set(`comment_${commentRef.id}`, {
                data: comment,
                timestamp: Date.now()
            });
            
            performanceMetrics.endRequest('postComment');
            return commentRef.id;
            
        } catch (error) {
            performanceMetrics.endRequest('postComment');
            console.error('Error posting comment:', error);
            throw new Error('Failed to post comment. Please try again.');
        }
    },

    // Post a reply with optimistic updates
    async postReply(commentId, replyData) {
        performanceMetrics.startRequest('postReply');
        
        try {
            const replyRef = firebase.firestore()
                .collection('comments')
                .doc(commentId)
                .collection('replies')
                .doc();
            
            const reply = {
                id: replyRef.id,
                ...replyData
            };
            
            // Use batch for atomic operations
            const batch = firebase.firestore().batch();
            batch.set(replyRef, reply);
            batch.update(
                firebase.firestore().collection('comments').doc(commentId),
                {
                    replyCount: firebase.firestore.FieldValue.increment(1),
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                }
            );
            
            await batch.commit();
            
            performanceMetrics.endRequest('postReply');
            return replyRef.id;
            
        } catch (error) {
            performanceMetrics.endRequest('postReply');
            console.error('Error posting reply:', error);
            throw new Error('Failed to post reply. Please try again.');
        }
    },

    // Optimized like toggle with optimistic UI
    async toggleLike(commentId, userId) {
        performanceMetrics.startRequest('toggleLike');
        
        try {
            const commentRef = firebase.firestore().collection('comments').doc(commentId);
            const commentDoc = await this.getCachedDocument(commentRef);
            
            if (!commentDoc.exists) {
                throw new Error('Comment not found');
            }
            
            const comment = commentDoc.data();
            const likedBy = comment.likedBy || [];
            const hasLiked = likedBy.includes(userId);
            
            if (hasLiked) {
                // Remove like
                await commentRef.update({
                    likes: firebase.firestore.FieldValue.increment(-1),
                    likedBy: firebase.firestore.FieldValue.arrayRemove(userId),
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                });
                
                // Update cache
                this.updateCommentCache(commentId, {
                    likes: (comment.likes || 1) - 1,
                    likedBy: likedBy.filter(id => id !== userId)
                });
                
                performanceMetrics.endRequest('toggleLike');
                return false;
            } else {
                // Add like
                await commentRef.update({
                    likes: firebase.firestore.FieldValue.increment(1),
                    likedBy: firebase.firestore.FieldValue.arrayUnion(userId),
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                });
                
                // Update cache
                this.updateCommentCache(commentId, {
                    likes: (comment.likes || 0) + 1,
                    likedBy: [...likedBy, userId]
                });
                
                performanceMetrics.endRequest('toggleLike');
                return true;
            }
            
        } catch (error) {
            performanceMetrics.endRequest('toggleLike');
            console.error('Error toggling like:', error);
            throw new Error('Failed to update like. Please try again.');
        }
    },

    // Report content with deduplication
    async reportContent(contentId, contentType, reason, userId) {
        performanceMetrics.startRequest('reportContent');
        
        try {
            // Check for recent duplicate reports
            const recentReports = await firebase.firestore()
                .collection('reports')
                .where('contentId', '==', contentId)
                .where('reportedBy', '==', userId)
                .where('createdAt', '>', new Date(Date.now() - 24 * 60 * 60 * 1000)) // 24 hours
                .limit(1)
                .get();
            
            if (!recentReports.empty) {
                throw new Error('You have already reported this content recently.');
            }
            
            const reportRef = firebase.firestore().collection('reports').doc();
            const report = {
                id: reportRef.id,
                contentId,
                contentType,
                reason,
                reportedBy: userId,
                status: 'pending',
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                reviewed: false
            };
            
            await reportRef.set(report);
            
            // Update report count
            if (contentType === 'comment') {
                await firebase.firestore()
                    .collection('comments')
                    .doc(contentId)
                    .update({
                        reports: firebase.firestore.FieldValue.increment(1),
                        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                    });
            }
            
            performanceMetrics.endRequest('reportContent');
            return reportRef.id;
            
        } catch (error) {
            performanceMetrics.endRequest('reportContent');
            console.error('Error reporting content:', error);
            throw error.message.includes('already reported') 
                ? error 
                : new Error('Failed to report content. Please try again.');
        }
    },

    // Optimized user profile with caching
    async getUserProfile(userId) {
        const cacheKey = `user_${userId}`;
        const cached = apiCache.get(cacheKey);
        
        if (cached && (Date.now() - cached.timestamp < CACHE_TTL)) {
            return cached.data;
        }
        
        performanceMetrics.startRequest('getUserProfile');
        
        try {
            const userDoc = await firebase.firestore()
                .collection('anonymousUsers')
                .doc(userId)
                .get();
            
            const data = userDoc.exists ? userDoc.data() : null;
            
            // Cache the result
            apiCache.set(cacheKey, {
                data,
                timestamp: Date.now()
            });
            
            performanceMetrics.endRequest('getUserProfile');
            return data;
            
        } catch (error) {
            performanceMetrics.endRequest('getUserProfile');
            console.error('Error getting user profile:', error);
            throw new Error('Failed to load user profile.');
        }
    },

    // Update user profile with cache invalidation
    async updateUserProfile(userId, updates) {
        performanceMetrics.startRequest('updateUserProfile');
        
        try {
            await firebase.firestore()
                .collection('anonymousUsers')
                .doc(userId)
                .update({
                    ...updates,
                    lastActive: firebase.firestore.FieldValue.serverTimestamp()
                });
            
            // Invalidate cache
            apiCache.delete(`user_${userId}`);
            
            performanceMetrics.endRequest('updateUserProfile');
            
        } catch (error) {
            performanceMetrics.endRequest('updateUserProfile');
            console.error('Error updating user profile:', error);
            throw new Error('Failed to update profile. Please try again.');
        }
    },

    // Optimized comments loading with pagination and caching
    async getComments(limit = 20, startAfter = null) {
        const cacheKey = `comments_${limit}_${startAfter?.id || 'initial'}`;
        const cached = apiCache.get(cacheKey);
        
        if (cached && (Date.now() - cached.timestamp < CACHE_TTL / 2)) { // Shorter TTL for comments
            return cached.data;
        }
        
        performanceMetrics.startRequest('getComments');
        
        try {
            let query = firebase.firestore()
                .collection('comments')
                .where('status', '==', 'active')
                .orderBy('createdAt', 'desc')
                .limit(limit);
            
            if (startAfter) {
                query = query.startAfter(startAfter);
            }
            
            const snapshot = await query.get();
            const comments = [];
            
            snapshot.forEach(doc => {
                comments.push({
                    id: doc.id,
                    ...doc.data()
                });
                
                // Cache individual comments
                apiCache.set(`comment_${doc.id}`, {
                    data: doc.data(),
                    timestamp: Date.now()
                });
            });
            
            const result = {
                comments,
                lastDoc: snapshot.docs[snapshot.docs.length - 1] || null
            };
            
            // Cache the batch result
            apiCache.set(cacheKey, {
                data: result,
                timestamp: Date.now()
            });
            
            performanceMetrics.endRequest('getComments');
            return result;
            
        } catch (error) {
            performanceMetrics.endRequest('getComments');
            console.error('Error getting comments:', error);
            throw new Error('Failed to load comments. Please refresh the page.');
        }
    },

    // Get replies with caching
    async getReplies(commentId) {
        const cacheKey = `replies_${commentId}`;
        const cached = apiCache.get(cacheKey);
        
        if (cached && (Date.now() - cached.timestamp < CACHE_TTL)) {
            return cached.data;
        }
        
        performanceMetrics.startRequest('getReplies');
        
        try {
            const snapshot = await firebase.firestore()
                .collection('comments')
                .doc(commentId)
                .collection('replies')
                .orderBy('createdAt', 'asc')
                .get();
            
            const replies = [];
            snapshot.forEach(doc => {
                replies.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            
            // Cache the result
            apiCache.set(cacheKey, {
                data: replies,
                timestamp: Date.now()
            });
            
            performanceMetrics.endRequest('getReplies');
            return replies;
            
        } catch (error) {
            performanceMetrics.endRequest('getReplies');
            console.error('Error getting replies:', error);
            throw new Error('Failed to load replies.');
        }
    },

    // Analytics with batching
    async trackAnalytics(event, data = {}) {
        // Use requestIdleCallback for non-critical analytics
        if ('requestIdleCallback' in window) {
            requestIdleCallback(() => {
                this._sendAnalytics(event, data);
            });
        } else {
            setTimeout(() => this._sendAnalytics(event, data), 0);
        }
    },

    async _sendAnalytics(event, data) {
        try {
            const analyticsRef = firebase.database().ref(`analytics/${event}/${Date.now()}`);
            await analyticsRef.set({
                ...data,
                timestamp: Date.now(),
                userAgent: navigator.userAgent?.substring(0, 100), // Limit size
                path: window.location.pathname,
                screen: `${screen.width}x${screen.height}`
            });
        } catch (error) {
            console.warn('Analytics error:', error);
        }
    },

    // Platform statistics with caching
    async getPlatformStats() {
        const cacheKey = 'platform_stats';
        const cached = apiCache.get(cacheKey);
        
        if (cached && (Date.now() - cached.timestamp < CACHE_TTL)) {
            return cached.data;
        }
        
        try {
            const statsRef = firebase.database().ref('platformStats');
            const snapshot = await statsRef.once('value');
            const data = snapshot.val() || {};
            
            // Cache the result
            apiCache.set(cacheKey, {
                data,
                timestamp: Date.now()
            });
            
            return data;
        } catch (error) {
            console.error('Error getting platform stats:', error);
            return {};
        }
    },

    // Cache management helpers
    async getCachedDocument(docRef) {
        const cacheKey = `doc_${docRef.path}`;
        const cached = apiCache.get(cacheKey);
        
        if (cached && (Date.now() - cached.timestamp < CACHE_TTL)) {
            return cached.data;
        }
        
        const doc = await docRef.get();
        apiCache.set(cacheKey, {
            data: doc,
            timestamp: Date.now()
        });
        
        return doc;
    },

    updateCommentCache(commentId, updates) {
        const cacheKey = `comment_${commentId}`;
        const cached = apiCache.get(cacheKey);
        
        if (cached) {
            apiCache.set(cacheKey, {
                data: { ...cached.data, ...updates },
                timestamp: Date.now()
            });
        }
    },

    // Clear cache (useful for logout or refresh)
    clearCache() {
        apiCache.clear();
    },

    // Preload critical data
    async preloadCriticalData() {
        const preloads = [
            this.getPlatformStats(),
            this.getComments(10) // Preload first 10 comments
        ];
        
        await Promise.allSettled(preloads);
    }
};

// Initialize analytics on load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        feedAPI.trackAnalytics('page_view', {
            load_time: performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart
        });
    });
} else {
    feedAPI.trackAnalytics('page_view');
}

// Export for global access
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { firebaseConfig, feedAPI };
}