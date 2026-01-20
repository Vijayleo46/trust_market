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
                where('sellerId', '==', userId),
                orderBy('createdAt', 'desc')
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
                // Products
                {
                    title: 'Apple MacBook Pro 16"',
                    description: 'M3 Max chip, 32GB RAM, 1TB SSD. Space Black. Barely used, comes with original box and apple care plus.',
                    price: '2499',
                    category: 'Electronics',
                    images: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=1000'],
                    sellerId,
                    sellerName,
                    rating: 5,
                    type: 'product',
                    location: 'San Francisco, CA',
                    condition: 'Used',
                    enableChat: true,
                    isBoosted: true,
                    status: 'active',
                    views: 452,
                    chatsCount: 8
                },
                {
                    title: 'Sony WH-1000XM5',
                    description: 'Industry leading noise canceling headphones. Silver color. Brand new in box.',
                    price: '348',
                    category: 'Electronics',
                    images: ['https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&q=80&w=1000'],
                    sellerId,
                    sellerName,
                    rating: 4.8,
                    type: 'product',
                    location: 'New York, NY',
                    condition: 'New',
                    enableChat: true,
                    status: 'active',
                    views: 128,
                    chatsCount: 3
                },
                {
                    title: 'Herman Miller Aeron Chair',
                    description: 'Size B, fully loaded. Graphite color. Perfect for home office.',
                    price: '850',
                    category: 'Furniture',
                    images: ['https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?auto=format&fit=crop&q=80&w=1000'],
                    sellerId,
                    sellerName,
                    rating: 4.9,
                    type: 'product',
                    location: 'Austin, TX',
                    condition: 'Used',
                    enableChat: true,
                    status: 'sold',
                    views: 890,
                    chatsCount: 15
                },
                {
                    title: 'Vintage Denim Jacket',
                    description: 'Classic 90s Levi jacket. Size L. Great fade and condition.',
                    price: '120',
                    category: 'Fashion',
                    images: ['https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?auto=format&fit=crop&q=80&w=1000'],
                    sellerId,
                    sellerName,
                    rating: 4.5,
                    type: 'product',
                    location: 'Los Angeles, CA',
                    condition: 'Used',
                    enableChat: true,
                    status: 'active',
                    views: 89,
                    chatsCount: 1
                },
                // Vehicles
                {
                    title: 'Tesla Model 3 Long Range',
                    description: '2022 Model. White interior. Full Self Driving capability included. Low mileage.',
                    price: '34,900',
                    category: 'Vehicles',
                    images: ['https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&q=80&w=1000'],
                    sellerId,
                    sellerName: 'AutoTrader',
                    rating: 4.7,
                    type: 'product',
                    location: 'Miami, FL',
                    condition: 'Used',
                    enableChat: true,
                    isBoosted: true,
                    status: 'active',
                    views: 1250,
                    chatsCount: 42
                },
                {
                    title: 'BMW M4 Competition',
                    description: 'Brooklyn Grey. Carbon bucket seats. Track package. Absolute beast on the road.',
                    price: '78,500',
                    category: 'Vehicles',
                    images: ['https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&q=80&w=1000'],
                    sellerId,
                    sellerName,
                    rating: 5,
                    type: 'product',
                    location: 'Los Angeles, CA',
                    condition: 'Used',
                    enableChat: true,
                    status: 'active',
                    views: 940,
                    chatsCount: 22
                },
                // Real Estate
                {
                    title: 'Modern Downtown Loft',
                    description: '1 Bed 1 Bath. High ceilings, exposed brick. In the heart of the arts district.',
                    price: '2800/mo',
                    category: 'Real Estate',
                    images: ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&q=80&w=1000'],
                    sellerId,
                    sellerName: 'Urban Living',
                    rating: 4.8,
                    type: 'product',
                    location: 'Chicago, IL',
                    enableChat: true,
                    status: 'active',
                    views: 560,
                    chatsCount: 11
                },
                // Services
                {
                    title: 'Professional Home Cleaning',
                    description: 'Deep cleaning service for 2-3 bedroom apartments. Eco-friendly products used.',
                    price: '150',
                    category: 'Services',
                    images: ['https://images.unsplash.com/photo-1581578731117-104f2a896572?auto=format&fit=crop&q=80&w=1000'],
                    sellerId,
                    sellerName: 'Sparkle Clean',
                    rating: 4.9,
                    type: 'service',
                    location: 'Seattle, WA',
                    enableChat: true,
                    status: 'active',
                    views: 310,
                    chatsCount: 5
                },
                // Jobs
                {
                    title: 'Senior React Native Developer',
                    description: 'We are looking for an experienced developer to build our mobile marketplace. Must verify expertise in Reanimated and Firebase.',
                    price: '$120k - $160k',
                    category: 'Jobs',
                    images: ['https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=1000'],
                    sellerId,
                    sellerName: 'TechStart Inc.',
                    rating: 0,
                    type: 'job',
                    location: 'Remote',
                    condition: 'New',
                    jobType: 'Full Time',
                    salaryRange: '$120k - $160k',
                    skills: ['React Native', 'TypeScript', 'Firebase'],
                    experienceLevel: 'Senior',
                    companyName: 'TechStart Inc.',
                    workMode: 'Remote',
                    contactEmail: 'careers@techstart.io',
                    enableChat: true,
                    isBoosted: true,
                    status: 'active',
                    views: 2450,
                    applicantsCount: 45
                },
                {
                    title: 'UX/UI Designer',
                    description: 'Design beautiful interfaces for our next gen crypto wallet. Figma mastery required.',
                    price: '$90k - $130k',
                    category: 'Jobs',
                    images: ['https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&q=80&w=1000'],
                    sellerId,
                    sellerName: 'CryptoFlow',
                    rating: 0,
                    type: 'job',
                    location: 'New York, NY',
                    condition: 'New',
                    jobType: 'Full Time',
                    salaryRange: '$90k - $130k',
                    skills: ['Figma', 'UI Design', 'Prototyping'],
                    experienceLevel: 'Mid Level',
                    companyName: 'CryptoFlow',
                    workMode: 'Hybrid',
                    contactEmail: 'design@cryptoflow.io',
                    enableChat: false,
                    status: 'active',
                    views: 1800,
                    applicantsCount: 28
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
