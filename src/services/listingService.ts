import {
    collection,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    getDoc,
    setDoc,
    getDocs,
    query,
    where,
    orderBy,
    limit,
    serverTimestamp,
    Timestamp
} from 'firebase/firestore';
import { db, auth } from '../core/config/firebase';

export interface Listing {
    id?: string;
    title: string;
    description: string;
    price: string;
    category: string;
    images: string[];
    sellerId: string;
    sellerName: string;
    location?: string;
    createdAt?: Timestamp;
    rating: number;
    type: 'product' | 'job' | 'service';
    condition?: 'New' | 'Used' | 'Refurbished';
    enableChat?: boolean;
    showPhone?: boolean;
    isBoosted?: boolean;

    // Job specific fields
    salaryRange?: string;
    jobType?: string;
    skills?: string[];
    experienceLevel?: string;
    companyName?: string;
    companyLogo?: string;
    deadline?: Timestamp;
    applicationUrl?: string;
    contactEmail?: string;
    contactPhone?: string;
    workMode?: 'Onsite' | 'Remote' | 'Hybrid';
    status?: 'active' | 'sold' | 'expired' | 'pending' | 'closed';
    views?: number;
    chatsCount?: number;
    applicantsCount?: number;
    oldPrice?: string;
}

export const listingService = {
    // Create a new listing
    createListing: async (listing: Omit<Listing, 'id' | 'createdAt'>) => {
        try {
            const docRef = await addDoc(collection(db, 'listings'), {
                ...listing,
                createdAt: serverTimestamp(),
            });
            return docRef.id;
        } catch (error) {
            console.error("Error adding listing: ", error);
            throw error;
        }
    },

    // Get featured listings
    getFeaturedListings: async (listingLimit = 10) => {
        try {
            const q = query(
                collection(db, 'listings'),
                orderBy('createdAt', 'desc'),
                limit(listingLimit)
            );
            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Listing));
        } catch (error) {
            console.error("Error fetching featured listings: ", error);
            return []; // Return empty list on error for UX
        }
    },

    // Get listings by category
    getListingsByCategory: async (category: string) => {
        try {
            const q = query(
                collection(db, 'listings'),
                where('category', '==', category),
                orderBy('createdAt', 'desc')
            );
            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Listing));
        } catch (error) {
            console.error("Error fetching category listings: ", error);
            throw error;
        }
    },

    // Get listing by ID
    getListingById: async (id: string) => {
        try {
            const docRef = doc(db, 'listings', id);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                return { id: docSnap.id, ...docSnap.data() } as Listing;
            }
            return null;
        } catch (error) {
            console.error("Error fetching listing by ID: ", error);
            throw error;
        }
    },

    // Search listings
    searchListings: async (searchQuery: string) => {
        try {
            const q = query(collection(db, 'listings'), limit(50));
            const querySnapshot = await getDocs(q);
            const all = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Listing));
            if (!searchQuery) return all;
            return all.filter(l => l.title.toLowerCase().includes(searchQuery.toLowerCase()));
        } catch (error) {
            console.error("Error searching listings: ", error);
            throw error;
        }
    },

    // Get listings by user
    getListingsByUser: async (userId: string) => {
        try {
            const q = query(
                collection(db, 'listings'),
                where('sellerId', '==', userId)
            );
            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Listing));
        } catch (error) {
            console.error("Error fetching user listings: ", error);
            throw error;
        }
    },

    // Get total listing count
    getListingCount: async () => {
        try {
            const querySnapshot = await getDocs(collection(db, 'listings'));
            return querySnapshot.size;
        } catch (error) {
            console.error("Error getting listing count: ", error);
            return 0;
        }
    },

    // Get trending listings (high rating)
    getTrendingListings: async (listingLimit = 4) => {
        try {
            const q = query(
                collection(db, 'listings'),
                orderBy('rating', 'desc'),
                limit(listingLimit)
            );
            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Listing));
        } catch (error) {
            console.error("Error fetching trending listings: ", error);
            // Fallback to featured/latest if rating index is missing or empty
            return listingService.getFeaturedListings(listingLimit);
        }
    },

    // Get similar listings by category (excluding current item)
    getSimilarListings: async (category: string, currentId?: string, listingLimit = 4) => {
        try {
            const q = query(
                collection(db, 'listings'),
                where('category', '==', category),
                limit(listingLimit + 1) // Fetch one extra to handle exclusion
            );
            const querySnapshot = await getDocs(q);
            const listings = querySnapshot.docs
                .map(doc => ({ id: doc.id, ...doc.data() } as Listing))
                .filter(item => item.id !== currentId)
                .slice(0, listingLimit);

            return listings;
        } catch (error) {
            console.error("Error fetching similar listings: ", error);
            return [];
        }
    },

    // Seed demo data
    seedDemoData: async () => {
        try {
            const user = auth.currentUser;
            const sellerId = user?.uid || 'demo_user';
            const sellerName = user?.displayName || 'Demo User';

            const demoListings: Omit<Listing, 'id' | 'createdAt'>[] = [
                // User Request Specific Items
                {
                    title: 'Ultimate Gaming Build',
                    description: 'Full custom gaming setup. RTX 4090, i9-14900K, 64GB DDR5. Perfect for content creation and 4K gaming.',
                    price: '$3500',
                    category: 'Electronics',
                    images: [
                        'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&q=80&w=1000',
                        'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=1000',
                        'https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&q=80&w=1000',
                        'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=1000',
                        'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?auto=format&fit=crop&q=80&w=1000'
                    ],
                    sellerId,
                    sellerName: user?.displayName || 'Leo',
                    rating: 5.0,
                    type: 'product',
                    location: 'San Francisco, CA',
                    condition: 'New',
                    enableChat: true,
                    status: 'active',
                    views: 150,
                    chatsCount: 2
                },
                {
                    title: 'Senior Mobile Architect',
                    description: 'We are looking for a visionary Mobile Architect to lead our engineering team. You will be responsible for defining the technical roadmap and mentoring senior developers.',
                    price: '₹ 45L - 60L',
                    category: 'Jobs',
                    images: ['https://images.unsplash.com/photo-1549921294-585720df5122?auto=format&fit=crop&q=80&w=1000'],
                    sellerId: 'admin',
                    sellerName: user?.displayName || 'Leo',
                    rating: 5,
                    type: 'job',
                    location: 'Bangalore, India',
                    condition: 'New',
                    jobType: 'Full Time',
                    salaryRange: '₹ 45L - 60L',
                    skills: ['React Native', 'Swift', 'Kotlin', 'System Design', 'Team Leadership'],
                    experienceLevel: 'Senior (8+ years)',
                    companyName: user?.displayName || 'Leo',
                    workMode: 'Hybrid',
                    enableChat: true,
                    status: 'active',
                    views: 320,
                    chatsCount: 15
                },
                {
                    title: 'UX/UI Designer',
                    description: 'We need a creative designer for our new startup. Remote friendly.',
                    price: '$80k/yr',
                    category: 'Jobs',
                    images: ['https://images.unsplash.com/photo-1586717791821-3f44a5638d28?auto=format&fit=crop&q=80&w=1000'],
                    sellerId,
                    sellerName: user?.displayName || 'Leo',
                    rating: 0,
                    type: 'job',
                    location: 'New York, NY',
                    condition: 'New',
                    enableChat: true,
                    status: 'active',
                    views: 1200,
                    chatsCount: 5
                },
                {
                    title: 'Senior React Native Developer',
                    description: 'Looking for an expert to build a marketplace app. Must know Expo and Firebase.',
                    price: 'Remote',
                    category: 'Jobs',
                    images: ['https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&q=80&w=1000'],
                    sellerId,
                    sellerName: user?.displayName || 'Leo',
                    rating: 0,
                    type: 'job',
                    location: 'Remote',
                    condition: 'New',
                    enableChat: true,
                    status: 'active',
                    views: 3500,
                    chatsCount: 15
                },
                {
                    title: 'Professional Home Cleaning',
                    description: 'Top rated cleaning service in Seattle. We use eco-friendly products.',
                    price: '$50/hr',
                    category: 'Services',
                    images: ['https://images.unsplash.com/photo-1581579186913-45ac3e6e3dd2?auto=format&fit=crop&q=80&w=1000'],
                    sellerId,
                    sellerName: user?.displayName || 'Leo',
                    rating: 4.8,
                    type: 'service',
                    location: 'Seattle, WA',
                    enableChat: true,
                    status: 'active',
                    views: 890,
                    chatsCount: 20
                },
                {
                    title: 'Modern Downtown Loft',
                    description: 'Beautiful loft in the heart of Chicago. Close to all amenities.',
                    price: '2800/mo',
                    category: 'Real Estate',
                    images: ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&q=80&w=1000'],
                    sellerId,
                    sellerName: user?.displayName || 'Leo',
                    rating: 4.9,
                    type: 'product',
                    location: 'Chicago, IL',
                    enableChat: true,
                    status: 'active',
                    views: 5000,
                    chatsCount: 45
                }
            ];

            const promises = demoListings.map(item => listingService.createListing(item));
            await Promise.all(promises);
            console.log('Demo data seeded successfully');
        } catch (error) {
            console.error("Error seeding demo data: ", error);
            throw error;
        }
    },

    // Delete a listing
    deleteListing: async (id: string) => {
        try {
            await deleteDoc(doc(db, 'listings', id));
        } catch (error) {
            console.error("Error deleting listing: ", error);
            throw error;
        }
    },

    // Update listing status
    updateListingStatus: async (id: string, status: string) => {
        try {
            await updateDoc(doc(db, 'listings', id), { status });
        } catch (error) {
            console.error("Error updating listing status: ", error);
            throw error;
        }
    },

    // Boost a listing
    boostListing: async (id: string) => {
        try {
            await updateDoc(doc(db, 'listings', id), { isBoosted: true });
        } catch (error) {
            console.error("Error boosting listing: ", error);
            throw error;
        }
    },

    // --- Wishlist Methods ---

    // Add to wishlist
    addToWishlist: async (userId: string, listingId: string) => {
        console.log('=== ADD TO WISHLIST SERVICE ===');
        console.log('User ID:', userId);
        console.log('Listing ID:', listingId);

        try {
            const wishlistRef = doc(db, 'users', userId, 'wishlist', listingId);
            await setDoc(wishlistRef, {
                listingId,
                addedAt: serverTimestamp()
            });
            console.log('✅ Added to wishlist in Firebase');
        } catch (error: any) {
            console.error('=== ADD TO WISHLIST ERROR ===');
            console.error('Error:', error);
            console.error('Error code:', error.code);
            console.error('Error message:', error.message);
            throw error;
        }
    },

    // Remove from wishlist
    removeFromWishlist: async (userId: string, listingId: string) => {
        console.log('=== REMOVE FROM WISHLIST SERVICE ===');
        console.log('User ID:', userId);
        console.log('Listing ID:', listingId);

        try {
            const wishlistRef = doc(db, 'users', userId, 'wishlist', listingId);
            await deleteDoc(wishlistRef);
            console.log('✅ Removed from wishlist in Firebase');
        } catch (error: any) {
            console.error('=== REMOVE FROM WISHLIST ERROR ===');
            console.error('Error:', error);
            console.error('Error code:', error.code);
            console.error('Error message:', error.message);
            throw error;
        }
    },

    // Check if item is in wishlist
    isInWishlist: async (userId: string, listingId: string) => {
        console.log('=== CHECK WISHLIST SERVICE ===');
        console.log('User ID:', userId);
        console.log('Listing ID:', listingId);

        try {
            const wishlistRef = doc(db, 'users', userId, 'wishlist', listingId);
            const docSnap = await getDoc(wishlistRef);
            const exists = docSnap.exists();
            console.log('Is in wishlist:', exists);
            return exists;
        } catch (error: any) {
            console.error('=== CHECK WISHLIST ERROR ===');
            console.error('Error:', error);
            return false;
        }
    },

    // Get user's wishlist items (including listing data)
    getWishlistItems: async (userId: string) => {
        console.log('=== GET WISHLIST ITEMS SERVICE ===');
        console.log('User ID:', userId);

        try {
            const wishlistRef = collection(db, 'users', userId, 'wishlist');
            const querySnapshot = await getDocs(wishlistRef);
            console.log('Wishlist documents found:', querySnapshot.size);

            const itemPromises = querySnapshot.docs.map(async (wishlistDoc) => {
                const listingId = wishlistDoc.data().listingId;
                console.log('Fetching listing:', listingId);

                const listingRef = doc(db, 'listings', listingId);
                const listingSnap = await getDoc(listingRef);

                if (listingSnap.exists()) {
                    console.log('✅ Listing found:', listingId);
                    return { id: listingSnap.id, ...listingSnap.data() } as Listing;
                } else {
                    console.log('❌ Listing not found:', listingId);
                }
                return null;
            });

            const results = await Promise.all(itemPromises);
            const validItems = results.filter(item => item !== null) as Listing[];
            console.log('✅ Total valid wishlist items:', validItems.length);
            return validItems;
        } catch (error: any) {
            console.error('=== GET WISHLIST ITEMS ERROR ===');
            console.error('Error:', error);
            console.error('Error code:', error.code);
            console.error('Error message:', error.message);
            throw error;
        }
    }
};
