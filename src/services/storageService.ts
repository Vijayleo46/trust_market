import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../core/config/firebase';

export const storageService = {
    /**
     * Uploads an image from a local URI to Firebase Storage
     * @param uri Local file URI (from image picker)
     * @param path Path in storage (e.g. 'listings/image123.jpg')
     * @returns Download URL of the uploaded image
     */
    uploadImage: async (uri: string, path: string): Promise<string> => {
        console.log(`📸 Starting upload: URI=${uri}, PATH=${path}`);
        try {
            // Using fetch for better compatibility in modern Expo/React Native
            console.log('🔄 Converting URI to Blob...');
            const response = await fetch(uri);
            const blob = await response.blob();

            console.log('📦 Blob created, size:', blob?.size, 'type:', blob?.type);
            const storageRef = ref(storage, path);
            console.log('🚀 Sending bytes to Firebase Storage...');
            await uploadBytes(storageRef, blob);
            console.log('✅ Upload complete for:', path);

            return await getDownloadURL(storageRef);
        } catch (error) {
            console.error("Error uploading image: ", error);
            throw error;
        }
    },

    /**
     * Uploads multiple images and returns their download URLs
     */
    uploadMultipleImages: async (uris: string[], folder: string): Promise<string[]> => {
        console.log(`📂 Uploading ${uris.length} images to ${folder}`);
        const uploadPromises = uris.map((uri, index) => {
            // Robust extension detection
            let extension = 'jpg';
            const parts = uri.split(/[#?]/)[0].split('.');
            if (parts.length > 1) {
                extension = parts.pop() || 'jpg';
            }
            const filename = `${Date.now()}_${index}.${extension}`;
            return storageService.uploadImage(uri, `${folder}/${filename}`);
        });

        return Promise.all(uploadPromises);
    }
};
