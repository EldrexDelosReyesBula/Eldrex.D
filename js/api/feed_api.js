
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
try {
    firebase.initializeApp(firebaseConfig);
    console.log('Firebase initialized successfully');
} catch (error) {
    console.error('Firebase initialization error:', error);
}

const db = firebase.firestore();
const auth = firebase.auth();

// Comprehensive sensitive words list for client-side filtering
const sensitiveWords = [
    // Profanity and offensive language
    'fuck', 'shit', 'asshole', 'bitch', 'bastard', 'dick', 'pussy', 'cunt',
    'whore', 'slut', 'retard', 'fag', 'faggot', 'nigger', 'nigga', 'chink',
    
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

// Generate a unique user ID (for anonymous tracking)
function getUserId() {
    let userId = localStorage.getItem('userId');
    if (!userId) {
        userId = 'user_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('userId', userId);
    }
    return userId;
}

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

    // Get comments from Firestore
    async getComments(category = 'all') {
        try {
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
            
            return comments;
        } catch (error) {
            console.error('Error getting comments:', error);
            throw error;
        }
    },

    // Add comment to Firestore
    async addComment(commentData) {
        try {
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
                userId: getUserId() // Track user for moderation purposes
            };
            
            const docRef = await db.collection('comments').add(commentWithMetadata);
            return docRef.id;
        } catch (error) {
            console.error('Error adding comment:', error);
            throw error;
        }
    },

    // Add reply to comment
    async addReply(commentId, replyData) {
        try {
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
                userId: getUserId()
            };
            
            await db.collection('comments').doc(commentId).update({
                replies: firebase.firestore.FieldValue.arrayUnion(replyWithMetadata)
            });
            
            return true;
        } catch (error) {
            console.error('Error adding reply:', error);
            throw error;
        }
    },

    // Toggle like on comment
    async toggleLike(commentId, userId) {
        try {
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
                return { liked: false, likes: comment.likes - 1 };
            } else {
                // Like
                await commentRef.update({
                    likes: firebase.firestore.FieldValue.increment(1),
                    userLikes: firebase.firestore.FieldValue.arrayUnion(userId)
                });
                return { liked: true, likes: comment.likes + 1 };
            }
        } catch (error) {
            console.error('Error toggling like:', error);
            throw error;
        }
    },

    // Report comment
    async reportComment(commentId, reportData) {
        try {
            const userId = getUserId();
            
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
            
            return true;
        } catch (error) {
            console.error('Error reporting comment:', error);
            throw error;
        }
    },

    // Real-time listener for comments
    setupCommentsListener(category, callback) {
        try {
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
        } catch (error) {
            console.error('Error setting up comments listener:', error);
            callback(null, error);
        }
    }
};

// Make EldrexAPI globally available
window.EldrexAPI = EldrexAPI;
window.getUserId = getUserId;

console.log('EldrexAPI loaded successfully');