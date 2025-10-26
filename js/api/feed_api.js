// Production Firebase API for Eldrex Platform
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

// Feed API Functions
const feedAPI = {
    // Post a new comment
    async postComment(commentData) {
        try {
            const commentRef = firebase.firestore().collection('comments').doc();
            
            const comment = {
                id: commentRef.id,
                ...commentData,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            };
            
            await commentRef.set(comment);
            
            // Also store in Realtime Database for analytics
            const realtimeRef = firebase.database().ref('comments/' + commentRef.id);
            await realtimeRef.set({
                id: commentRef.id,
                category: commentData.category,
                timestamp: Date.now(),
                hasSensitiveContent: commentData.isSensitive || false
            });
            
            return commentRef.id;
            
        } catch (error) {
            console.error('Error posting comment:', error);
            throw new Error('Failed to post comment. Please try again.');
        }
    },

    // Post a reply to a comment
    async postReply(commentId, replyData) {
        try {
            const commentRef = firebase.firestore().collection('comments').doc(commentId);
            const replyRef = commentRef.collection('replies').doc();
            
            const reply = {
                id: replyRef.id,
                ...replyData
            };
            
            // Add reply
            await replyRef.set(reply);
            
            // Update comment reply count
            await commentRef.update({
                replyCount: firebase.firestore.FieldValue.increment(1),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            return replyRef.id;
            
        } catch (error) {
            console.error('Error posting reply:', error);
            throw new Error('Failed to post reply. Please try again.');
        }
    },

    // Toggle like on comment
    async toggleLike(commentId, userId) {
        try {
            const commentRef = firebase.firestore().collection('comments').doc(commentId);
            const commentDoc = await commentRef.get();
            
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
                
                // Update Realtime DB
                const realtimeRef = firebase.database().ref('commentLikes/' + commentId + '/' + userId);
                await realtimeRef.remove();
                
                return false;
            } else {
                // Add like
                await commentRef.update({
                    likes: firebase.firestore.FieldValue.increment(1),
                    likedBy: firebase.firestore.FieldValue.arrayUnion(userId),
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                });
                
                // Update Realtime DB
                const realtimeRef = firebase.database().ref('commentLikes/' + commentId + '/' + userId);
                await realtimeRef.set({
                    timestamp: Date.now()
                });
                
                return true;
            }
            
        } catch (error) {
            console.error('Error toggling like:', error);
            throw new Error('Failed to update like. Please try again.');
        }
    },

    // Report content
    async reportContent(contentId, contentType, reason, userId) {
        try {
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
            
            // Increment report count on the content
            if (contentType === 'comment') {
                const commentRef = firebase.firestore().collection('comments').doc(contentId);
                await commentRef.update({
                    reports: firebase.firestore.FieldValue.increment(1),
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                });
                
                // Also track in Realtime DB for real-time moderation
                const realtimeRef = firebase.database().ref('reports/' + contentId);
                await realtimeRef.set({
                    count: firebase.database.ServerValue.increment(1),
                    lastReported: Date.now()
                });
            }
            
            return reportRef.id;
            
        } catch (error) {
            console.error('Error reporting content:', error);
            throw new Error('Failed to report content. Please try again.');
        }
    },

    // Get user profile
    async getUserProfile(userId) {
        try {
            const userDoc = await firebase.firestore().collection('anonymousUsers').doc(userId).get();
            return userDoc.exists ? userDoc.data() : null;
        } catch (error) {
            console.error('Error getting user profile:', error);
            throw new Error('Failed to load user profile.');
        }
    },

    // Update user profile
    async updateUserProfile(userId, updates) {
        try {
            const userRef = firebase.firestore().collection('anonymousUsers').doc(userId);
            await userRef.update({
                ...updates,
                lastActive: firebase.firestore.FieldValue.serverTimestamp()
            });
        } catch (error) {
            console.error('Error updating user profile:', error);
            throw new Error('Failed to update profile. Please try again.');
        }
    },

    // Get comments with pagination
    async getComments(limit = 50, lastDoc = null) {
        try {
            let query = firebase.firestore()
                .collection('comments')
                .where('status', '==', 'active')
                .orderBy('createdAt', 'desc')
                .limit(limit);
            
            if (lastDoc) {
                query = query.startAfter(lastDoc);
            }
            
            const snapshot = await query.get();
            const comments = [];
            
            snapshot.forEach(doc => {
                comments.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            
            return {
                comments,
                lastDoc: snapshot.docs[snapshot.docs.length - 1] || null
            };
            
        } catch (error) {
            console.error('Error getting comments:', error);
            throw new Error('Failed to load comments. Please refresh the page.');
        }
    },

    // Get replies for a comment
    async getReplies(commentId) {
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
            
            return replies;
            
        } catch (error) {
            console.error('Error getting replies:', error);
            throw new Error('Failed to load replies.');
        }
    },

    // Analytics - track platform usage
    async trackAnalytics(event, data = {}) {
        try {
            const analyticsRef = firebase.database().ref('analytics/' + event + '/' + Date.now());
            await analyticsRef.set({
                ...data,
                timestamp: Date.now(),
                userAgent: navigator.userAgent,
                path: window.location.pathname
            });
        } catch (error) {
            console.error('Error tracking analytics:', error);
            // Don't throw for analytics failures
        }
    },

    // Get platform statistics
    async getPlatformStats() {
        try {
            const statsRef = firebase.database().ref('platformStats');
            const snapshot = await statsRef.once('value');
            return snapshot.val() || {};
        } catch (error) {
            console.error('Error getting platform stats:', error);
            return {};
        }
    }
};

// Initialize analytics tracking
feedAPI.trackAnalytics('pageView', {
    page: 'feed',
    referrer: document.referrer
});

// Export for global access
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { firebaseConfig, feedAPI };
}