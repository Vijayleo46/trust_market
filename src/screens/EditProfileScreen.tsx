import React, { useState, useEffect } from 'react';
import {
    View,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Image,
    Alert,
    ActivityIndicator,
    Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Typography } from '../components/common/Typography';
import { ChevronLeft, Camera, Save } from 'lucide-react-native';
import { auth } from '../core/config/firebase';
import { updateProfile } from 'firebase/auth';
import { userService } from '../services/userService';
import { storageService } from '../services/storageService';
import * as ImagePicker from 'expo-image-picker';

export const EditProfileScreen = ({ navigation }: any) => {
    const user = auth.currentUser;
    const [name, setName] = useState(user?.displayName || '');
    const [email, setEmail] = useState(user?.email || '');
    const [phone, setPhone] = useState('');
    const [bio, setBio] = useState('');
    const [location, setLocation] = useState('');
    const [loading, setLoading] = useState(false);
    const [photoURL, setPhotoURL] = useState(user?.photoURL || '');

    useEffect(() => {
        // Fetch user profile data from Firestore
        const fetchProfile = async () => {
            if (user) {
                console.log('=== FETCHING USER PROFILE ===');
                console.log('User ID:', user.uid);
                try {
                    const profile = await userService.getProfile(user.uid);
                    if (profile) {
                        console.log('✅ Profile fetched:', profile);
                        setPhone(profile.phone || '');
                        setBio(profile.bio || '');
                        setLocation(profile.location || '');
                    }
                } catch (error) {
                    console.error('Error fetching profile:', error);
                }
            }
        };
        fetchProfile();
    }, [user]);

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled) {
            setPhotoURL(result.assets[0].uri);
        }
    };

    const handleSave = async () => {
        console.log('=== SAVING PROFILE TO BACKEND ===');
        console.log('User ID:', user?.uid);
        console.log('Name:', name);
        console.log('Email:', email);
        console.log('Phone:', phone);
        console.log('Bio:', bio);
        console.log('Location:', location);

        if (!name.trim()) {
            Alert.alert('Error', 'Name is required');
            return;
        }

        if (!user) {
            Alert.alert('Error', 'No user logged in');
            return;
        }

        setLoading(true);

        try {
            console.log('📤 Step 1: Checking for image upload...');
            let finalPhotoURL = photoURL;

            // Check if photoURL is a local URI that needs uploading (handles Mobile and Web)
            if (photoURL && (photoURL.startsWith('file://') || photoURL.startsWith('content://') || photoURL.startsWith('blob:'))) {
                console.log('📸 New image detected, uploading to storage...');
                const storagePath = `profile_pictures/${user.uid}_${Date.now()}.jpg`;
                finalPhotoURL = await storageService.uploadImage(photoURL, storagePath);
                console.log('✅ Image uploaded successfully:', finalPhotoURL);
                setPhotoURL(finalPhotoURL); // Update local state with remote URL
            }

            console.log('📤 Step 2: Updating Firebase Auth profile...');
            // Update Firebase Auth profile
            const authUpdateData: any = {
                displayName: name.trim(),
            };
            if (finalPhotoURL) {
                authUpdateData.photoURL = finalPhotoURL;
            }

            await updateProfile(user, authUpdateData);
            console.log('✅ Firebase Auth updated successfully');

            console.log('📤 Step 3: Saving to Firestore database...');
            // Update Firestore user document in 'users' collection
            await userService.updateProfile(user.uid, {
                uid: user.uid,
                email: user.email || '',
                displayName: name.trim(),
                phone: phone.trim(),
                bio: bio.trim(),
                location: location.trim(),
                photoURL: finalPhotoURL || user.photoURL || '',
                updatedAt: new Date(),
                kycStatus: 'unverified',
            } as any);
            console.log('✅ Firestore database updated successfully');
            console.log('✅ Profile saved to: users/' + user.uid);

            // Reload auth state to get updated profile
            await user.reload();
            console.log('✅ Auth state reloaded');

            Alert.alert(
                'Success! ✅',
                'Profile updated and saved to database successfully!',
                [
                    {
                        text: 'OK',
                        onPress: () => navigation.goBack()
                    }
                ]
            );
        } catch (error: any) {
            console.error('=== PROFILE UPDATE ERROR ===');
            console.error('Error:', error);
            console.error('Error code:', error.code);
            console.error('Error message:', error.message);
            Alert.alert('Error', 'Failed to save profile: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <ChevronLeft size={24} color="#002f34" strokeWidth={2} />
                </TouchableOpacity>
                <Typography variant="h2" style={{ fontWeight: '700', fontSize: 20, color: '#002f34' }}>
                    Edit Profile
                </Typography>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
                {/* Profile Photo */}
                <View style={styles.photoSection}>
                    <View style={styles.photoContainer}>
                        <Image
                            source={{ uri: photoURL || 'https://i.pravatar.cc/150?u=default' }}
                            style={styles.photo}
                        />
                        <TouchableOpacity style={styles.cameraButton} onPress={pickImage}>
                            <Camera size={18} color="#FFF" />
                        </TouchableOpacity>
                    </View>
                    <Typography variant="bodySmall" color="#6B7280" style={{ marginTop: 12, textAlign: 'center' }}>
                        Tap to change profile photo
                    </Typography>
                </View>

                {/* Form Fields */}
                <View style={styles.form}>
                    <View style={styles.inputGroup}>
                        <Typography variant="bodySmall" style={styles.label}>FULL NAME</Typography>
                        <TextInput
                            style={styles.input}
                            value={name}
                            onChangeText={setName}
                            placeholder="Enter your name"
                            placeholderTextColor="#9CA3AF"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Typography variant="bodySmall" style={styles.label}>EMAIL</Typography>
                        <TextInput
                            style={[styles.input, styles.inputDisabled]}
                            value={email}
                            editable={false}
                            placeholderTextColor="#9CA3AF"
                        />
                        <Typography variant="bodySmall" color="#9CA3AF" style={{ marginTop: 4 }}>
                            Email cannot be changed
                        </Typography>
                    </View>

                    <View style={styles.inputGroup}>
                        <Typography variant="bodySmall" style={styles.label}>PHONE NUMBER</Typography>
                        <TextInput
                            style={styles.input}
                            value={phone}
                            onChangeText={setPhone}
                            placeholder="Enter phone number"
                            placeholderTextColor="#9CA3AF"
                            keyboardType="phone-pad"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Typography variant="bodySmall" style={styles.label}>LOCATION</Typography>
                        <TextInput
                            style={styles.input}
                            value={location}
                            onChangeText={setLocation}
                            placeholder="Enter your location"
                            placeholderTextColor="#9CA3AF"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Typography variant="bodySmall" style={styles.label}>BIO</Typography>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            value={bio}
                            onChangeText={setBio}
                            placeholder="Tell us about yourself"
                            placeholderTextColor="#9CA3AF"
                            multiline
                            numberOfLines={4}
                        />
                    </View>
                </View>

                {/* Save Button */}
                <TouchableOpacity
                    style={styles.saveButton}
                    onPress={handleSave}
                    disabled={loading}
                    activeOpacity={0.8}
                >
                    <View style={styles.saveBtnInternal}>
                        {loading ? (
                            <ActivityIndicator color="#FFF" />
                        ) : (
                            <>
                                <Save size={20} color="#FFF" />
                                <Typography style={styles.saveText}>Save Changes</Typography>
                            </>
                        )}
                    </View>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FAFAFA',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: Platform.OS === 'ios' ? 60 : 20,
        paddingBottom: 16,
        backgroundColor: '#FFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#F8FAFC',
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        padding: 24,
        paddingBottom: 40,
    },
    photoSection: {
        alignItems: 'center',
        marginBottom: 32,
    },
    photoContainer: {
        position: 'relative',
    },
    photo: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#E2E8F0',
    },
    cameraButton: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#002f34',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#FFF',
    },
    form: {
        gap: 20,
    },
    inputGroup: {
        marginBottom: 4,
    },
    label: {
        fontSize: 12,
        fontWeight: '700',
        color: '#64748B',
        marginBottom: 8,
        letterSpacing: 0.5,
    },
    input: {
        backgroundColor: '#FFF',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 15,
        color: '#002f34',
        borderWidth: 1.5,
        borderColor: '#E2E8F0',
    },
    inputDisabled: {
        backgroundColor: '#F8FAFC',
        color: '#94A3B8',
        borderColor: '#F1F5F9',
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
        paddingTop: 14,
    },
    saveButton: {
        marginTop: 32,
        borderRadius: 16,
        overflow: 'hidden',
        backgroundColor: '#002f34',
        shadowColor: '#002f34',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    saveBtnInternal: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 16,
        gap: 8,
    },
    saveText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '700',
    },
});
