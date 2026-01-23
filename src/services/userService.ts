import { collection, getDocs, query, where, doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../core/config/firebase';

export interface UserProfile {
    uid: string;
    email: string;
    displayName: string;
    photoURL?: string;
    phone?: string;
    bio?: string;
    location?: string;
    createdAt: any;
    updatedAt?: any;
    coins?: number;
    kycStatus: 'pending' | 'verified' | 'unverified';
    settings?: {
        notifications: boolean;
        marketing: boolean;
        biometric: boolean;
    };
}

export const userService = {
    // Get total user count
    getUserCount: async () => {
        try {
            const querySnapshot = await getDocs(collection(db, 'users'));
            return querySnapshot.size;
        } catch (error) {
            console.error("Error getting user count: ", error);
            return 0;
        }
    },

    // Get user profile
    getUserProfile: async (uid: string) => {
        console.log('=== GET USER PROFILE ===');
        console.log('User ID:', uid);
        try {
            const docRef = doc(db, 'users', uid);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                console.log('✅ Profile found:', docSnap.data());
                return docSnap.data() as UserProfile;
            }
            console.log('❌ Profile not found');
            return null;
        } catch (error: any) {
            console.error("=== GET PROFILE ERROR ===");
            console.error("Error:", error);
            throw error;
        }
    },

    // Alias for getUserProfile
    getProfile: async (uid: string) => {
        return userService.getUserProfile(uid);
    },

    // Update user profile (creates if doesn't exist)
    updateProfile: async (uid: string, data: Partial<UserProfile>) => {
        console.log('=== UPDATE USER PROFILE ===');
        console.log('User ID:', uid);
        console.log('Data:', data);
        try {
            const userRef = doc(db, 'users', uid);
            await setDoc(userRef, data, { merge: true });
            console.log('✅ Profile updated in Firestore');
        } catch (error: any) {
            console.error("=== UPDATE PROFILE ERROR ===");
            console.error("Error:", error);
            throw error;
        }
    },

    // Update user settings
    updateSettings: async (uid: string, settings: UserProfile['settings']) => {
        try {
            const userRef = doc(db, 'users', uid);
            await setDoc(userRef, { settings }, { merge: true });
            console.log('✅ Settings saved to backend');
        } catch (error) {
            console.error("Error updating settings: ", error);
            throw error;
        }
    }
};
