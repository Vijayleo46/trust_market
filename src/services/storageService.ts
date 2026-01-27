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
            // Use XMLHttpRequest with timeout for reliable Blob creation
            console.log('🔄 Converting URI to Blob via XHR (with timeout)...');
            const blob: Blob = await new Promise((resolve, reject) => {
                const xhr = new XMLHttpRequest();
                xhr.onload = function () {
                    resolve(xhr.response);
                };
                xhr.onerror = function (e) {
                    console.error('XHR Error:', e);
                    reject(new TypeError("Network request failed during image processing"));
                };
                xhr.ontimeout = function () {
                    reject(new TypeError("Image processing timed out"));
                };
                xhr.responseType = "blob";
                xhr.open("GET", uri, true);
                xhr.timeout = 15000; // 15 seconds timeout for local file read
                xhr.send(null);
            });

            console.log('📦 Blob created, size:', blob.size, 'type:', blob.type);

            const storageRef = ref(storage, path);
            console.log('🚀 Sending bytes to Firebase Storage...');

            const metadata = {
                contentType: 'image/jpeg', // Force content type
            };

            await uploadBytes(storageRef, blob, metadata);
            console.log('✅ Upload complete for:', path);

            // Clean up blob to free memory
            // @ts-ignore
            blob.close && blob.close();

            const url = await getDownloadURL(storageRef);
            console.log('🔗 Download URL:', url);
            return url;
        } catch (error: any) {
            console.error("Error uploading image: ", error);
            console.error("Error details:", JSON.stringify(error, null, 2));
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
