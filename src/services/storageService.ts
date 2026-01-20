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
        try {
            // Fetch the image and convert to blob for Firebase
            const response = await fetch(uri);
            const blob = await response.blob();

            const storageRef = ref(storage, path);
            await uploadBytes(storageRef, blob);

            const downloadURL = await getDownloadURL(storageRef);
            return downloadURL;
        } catch (error) {
            console.error("Error uploading image: ", error);
            throw error;
        }
    },

    /**
     * Uploads multiple images and returns their download URLs
     */
    uploadMultipleImages: async (uris: string[], folder: string): Promise<string[]> => {
        const uploadPromises = uris.map((uri, index) => {
            const extension = uri.split('.').pop() || 'jpg';
            const filename = `${Date.now()}_${index}.${extension}`;
            return storageService.uploadImage(uri, `${folder}/${filename}`);
        });

        return Promise.all(uploadPromises);
    }
};
