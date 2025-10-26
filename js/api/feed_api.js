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

// Performance monitoring
const performance = {
    startTime: Date.now(),
    cacheHits: 0,
    cacheMisses: 0
};

// Cache system
const cache = {
    comments: new Map(),
    userProfiles: new Map(),
    timestamps: new Map(),
    maxSize: 100,
    ttl: 5 * 60 * 1000, // 5 minutes
    
    get(key) {
        const item = this.comments.get(key);
        if (item && Date.now() - item.timestamp < this.ttl) {
            this.cacheHits++;
            return item.data;
        }
        this.cacheMisses++;
        return null;
    },
    
    set(key, data) {
        if (this.comments.size >= this.maxSize) {
            const firstKey = this.comments.keys().next().value;
            this.comments.delete(firstKey);
        }
        this.comments.set(key, {
            data,
            timestamp: Date.now()
        });
    },
    
    clear() {
        this.comments.clear();
        this.userProfiles.clear();
    }
};

// Optimized Feed API Functions
const feedAPI = {
    // Batch operations for better performance
    batch: null,
    batchSize: 0,
    maxBatchSize: 10,
    
    initializeBatch() {
        this.batch = firebase.firestore().batch();
        this.batchSize = 0;
    },
    
    async commitBatch() {
        if (this.batch && this.batchSize > 0) {
            await this.batch.commit();
            this.batch = null;
            this.batchSize = 0;
        }
    },
    
    // Optimized comment posting with compression
    async postComment(commentData) {
        const startTime = performance.now();
        
        try {
            const commentRef = firebase.firestore().collection('comments').doc();
            
            // Compress data for faster transfer
            const compressedComment = {
                id: commentRef.id,
                c: commentData.content, // content
                cat: commentData.category, // category
                un: commentData.userName, // userName
                ua: commentData.userAvatar, // userAvatar
                uid: commentData.userId, // userId
                sens: commentData.isSensitive, // isSensitive
                stat: 'active', // status
                l: 0, // likes
                lb: [], // likedBy
                rc: 0, // replyCount
                rep: 0, // reports
                ct: firebase.firestore.FieldValue.serverTimestamp(), // createdAt
                ut: firebase.firestore.FieldValue.serverTimestamp() // updatedAt
            };
            
            await commentRef.set(compressedComment);
            
            // Cache the new comment
            cache.set(`comment_${commentRef.id}`, compressedComment);
            
            // Update analytics in background
            this.updateCommentStats('increment').catch(console.error);
            
            const endTime = performance.now();
            console.log(`Comment posted in ${endTime - startTime}ms`);
            
            return commentRef.id;
            
        } catch (error) {
            console.error('Error posting comment:', error);
            throw new Error('Failed to post comment. Please try again.');
        }
    },

    // Optimized comment fetching with caching
    async getComments(limit = 20, lastDoc = null) {
        const cacheKey = `comments_${limit}_${lastDoc ? lastDoc.id : 'first'}`;
        const cached = cache.get(cacheKey);
        
        if (cached) {
            return cached;
        }

        const startTime = performance.now();
        
        try {
            let query = firebase.firestore()
                .collection('comments')
                .where('stat', '==', 'active')
                .orderBy('ct', 'desc')
                .limit(limit);

            if (lastDoc) {
                query = query.startAfter(lastDoc);
            }

            const snapshot = await query.get();
            const comments = [];

            // Parallel processing of documents
            const processDoc = async (doc) => {
                const data = doc.data();
                // Decompress data
                return {
                    id: doc.id,
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
                };
            };

            // Process documents in parallel
            const promises = snapshot.docs.map(processDoc);
            const processedComments = await Promise.all(promises);
            
            comments.push(...processedComments);

            const result = {
                comments,
                lastDoc: snapshot.docs[snapshot.docs.length - 1] || null
            };

            // Cache the result
            cache.set(cacheKey, result);
            
            const endTime = performance.now();
            console.log(`Comments fetched in ${endTime - startTime}ms`);
            
            return result;

        } catch (error) {
            console.error('Error getting comments:', error);
            throw new Error('Failed to load comments. Please refresh the page.');
        }
    },

    // Optimized like handling with immediate UI update
    async toggleLike(commentId, userId) {
        const startTime = performance.now();
        
        try {
            const commentRef = firebase.firestore().collection('comments').doc(commentId);
            
            // Use transaction for atomic operations
            const result = await firebase.firestore().runTransaction(async (transaction) => {
                const commentDoc = await transaction.get(commentRef);
                
                if (!commentDoc.exists) {
                    throw new Error('Comment not found');
                }
                
                const comment = commentDoc.data();
                const likedBy = comment.lb || [];
                const hasLiked = likedBy.includes(userId);
                
                if (hasLiked) {
                    // Remove like
                    transaction.update(commentRef, {
                        l: firebase.firestore.FieldValue.increment(-1),
                        lb: firebase.firestore.FieldValue.arrayRemove(userId),
                        ut: firebase.firestore.FieldValue.serverTimestamp()
                    });
                    return false;
                } else {
                    // Add like
                    transaction.update(commentRef, {
                        l: firebase.firestore.FieldValue.increment(1),
                        lb: firebase.firestore.FieldValue.arrayUnion(userId),
                        ut: firebase.firestore.FieldValue.serverTimestamp()
                    });
                    return true;
                }
            });
            
            // Invalidate cache for this comment
            cache.delete(`comment_${commentId}`);
            
            const endTime = performance.now();
            console.log(`Like toggled in ${endTime - startTime}ms`);
            
            return result;
            
        } catch (error) {
            console.error('Error toggling like:', error);
            throw new Error('Failed to update like. Please try again.');
        }
    },

    // Optimized user profile management
    async getUserProfile(userId, forceRefresh = false) {
        const cacheKey = `user_${userId}`;
        
        if (!forceRefresh) {
            const cached = cache.get(cacheKey);
            if (cached) return cached;
        }

        try {
            const userDoc = await firebase.firestore().collection('anonymousUsers').doc(userId).get();
            const userData = userDoc.exists ? userDoc.data() : null;
            
            if (userData) {
                cache.set(cacheKey, userData);
            }
            
            return userData;
            
        } catch (error) {
            console.error('Error getting user profile:', error);
            return null;
        }
    },

    // Batch profile updates
    async updateUserProfile(userId, updates) {
        try {
            const userRef = firebase.firestore().collection('anonymousUsers').doc(userId);
            
            await userRef.update({
                ...updates,
                lastActive: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            // Invalidate cache
            cache.delete(`user_${userId}`);
            
        } catch (error) {
            console.error('Error updating user profile:', error);
            throw new Error('Failed to update profile.');
        }
    },

    // Optimized comment streaming with debouncing
    setupCommentsListener(callback, options = {}) {
        const {
            debounceMs = 300,
            limit = 50
        } = options;

        let debounceTimer;
        let lastSnapshot;

        const debouncedCallback = (snapshot) => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                callback(snapshot);
            }, debounceMs);
        };

        const commentsRef = firebase.firestore()
            .collection('comments')
            .where('stat', '==', 'active')
            .orderBy('ct', 'desc')
            .limit(limit);

        return commentsRef.onSnapshot((snapshot) => {
            lastSnapshot = snapshot;
            debouncedCallback(snapshot);
        });
    },

    // Prefetch next page of comments
    async prefetchNextComments(lastDoc, limit = 10) {
        try {
            const nextComments = await this.getComments(limit, lastDoc);
            // Cache the prefetched data
            const cacheKey = `prefetch_${lastDoc.id}_${limit}`;
            cache.set(cacheKey, nextComments);
            return nextComments;
        } catch (error) {
            console.error('Prefetch failed:', error);
            return null;
        }
    },

    // Update platform statistics
    async updateCommentStats(operation = 'increment') {
        try {
            const statsRef = firebase.database().ref('platformStats/comments');
            await statsRef.transaction((current) => {
                return (current || 0) + (operation === 'increment' ? 1 : -1);
            });
        } catch (error) {
            console.error('Error updating stats:', error);
        }
    },

    // Get performance metrics
    getPerformanceMetrics() {
        return {
            ...performance,
            cacheHitRate: performance.cacheHits / (performance.cacheHits + performance.cacheMisses) || 0,
            uptime: Date.now() - performance.startTime
        };
    },

    // Clear cache (useful for development)
    clearCache() {
        cache.clear();
    }
};

// Initialize performance monitoring
performance.startTime = Date.now();

// Preload essential data
feedAPI.preloadEssentialData = async function() {
    try {
        // Preload first page of comments
        await this.getComments(10);
        
        // Preload platform stats
        const statsRef = firebase.database().ref('platformStats');
        statsRef.once('value').then(snapshot => {
            cache.set('platformStats', snapshot.val());
        }).catch(console.error);
        
    } catch (error) {
        console.error('Preload failed:', error);
    }
};

// Initialize connection monitoring
feedAPI.setupConnectionMonitoring = function() {
    const connectedRef = firebase.database().ref('.info/connected');
    connectedRef.on('value', (snap) => {
        if (snap.val() === true) {
            console.log('Firebase connection established');
            // Re-establish any broken listeners
            if (window.eldrexFeed) {
                window.eldrexFeed.reconnectListeners();
            }
        } else {
            console.log('Firebase connection lost');
        }
    });
};

// Export for global access
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { firebaseConfig, feedAPI, cache, performance };
}

// Initialize connection monitoring immediately
setTimeout(() => {
    if (typeof firebase !== 'undefined') {
        feedAPI.setupConnectionMonitoring();
    }
}, 1000);