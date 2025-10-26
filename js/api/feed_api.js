// Firebase Configuration and API Functions
// This file contains sensitive API keys and should be added to .gitignore

// Firebase Configuration
        const firebaseConfig = {
            apiKey: "AIzaSyBy1ny3eqjU6MZlZjmvhnzW3PvZrUFUzZ0",
            authDomain: "wishwall-53e7f.firebaseapp.com",
            databaseURL: "https://wishwall-53e7f-default-rtdb.firebaseio.com",
            projectId: "wishwall-53e7f",
            storageBucket: "wishwall-53e7f.firebasestorage.app",
            messagingSenderId: "937910869393",
            appId: "1:937910869393:web:ec5b7b1a3d48fba7540e30",
            measurementId: "G-KXHX991S6N"
        };
        

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

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

// API Functions
const EldrexAPI = {
    // Content moderation function (client-side only)
    moderateContent(content) {
        return new Promise((resolve) => {
            // Client-side filtering
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
                .orderBy('timestamp', 'desc');
            
            if (category !== 'all') {
                query = query.where('category', '==', category);
            }
            
            const snapshot = await query.get();
            const comments = [];
            
            snapshot.forEach(doc => {
                const comment = doc.data();
                comment.id = doc.id;
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
            // Moderate content before posting
            const moderationResult = await this.moderateContent(commentData.content);
            
            const commentWithMetadata = {
                ...commentData,
                sensitive: moderationResult.sensitive,
                approved: true, // Auto-approve all comments
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                likes: 0,
                userLikes: [],
                replies: [],
                reported: false,
                reportCount: 0
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
            // Moderate reply content
            const moderationResult = await this.moderateContent(replyData.content);
            
            const replyWithMetadata = {
                ...replyData,
                sensitive: moderationResult.sensitive,
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
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
            const report = {
                ...reportData,
                commentId: commentId,
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
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
        let query = db.collection('comments')
            .where('approved', '==', true)
            .orderBy('timestamp', 'desc');
        
        if (category !== 'all') {
            query = query.where('category', '==', category);
        }
        
        return query.onSnapshot(snapshot => {
            const comments = [];
            snapshot.forEach(doc => {
                const comment = doc.data();
                comment.id = doc.id;
                comments.push(comment);
            });
            callback(comments);
        }, error => {
            console.error('Comments listener error:', error);
            callback(null, error);
        });
    }
};