import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Image, Alert, Dimensions, TextInput, Switch, Platform } from 'react-native';
import Animated, { FadeInUp, FadeIn, SlideInDown, ZoomIn } from 'react-native-reanimated';
import { useTheme } from '../theme/ThemeContext';
import { Typography } from '../components/common/Typography';
import { Camera, MapPin, ChevronRight, Check, X, ArrowRight, ArrowLeft, Image as ImageIcon, Trash2, Zap, MessageCircle, Phone, Wand2 } from 'lucide-react-native';
import { listingService } from '../services/listingService';
import { storageService } from '../services/storageService';
import { aiPriceService, PricePrediction } from '../services/aiPriceService';
import { auth } from '../core/config/firebase';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

const { width } = Dimensions.get('window');

const CONDITIONS = ['New', 'Used', 'Refurbished'];
const CATEGORIES = ['Mobiles', 'Electronics', 'Vehicles', 'Real Estate', 'Fashion', 'Services', 'Jobs'];

export const PostScreen = ({ route, navigation }: any) => {
    const { theme } = useTheme();
    const [loading, setLoading] = useState(false);
    const [statusText, setStatusText] = useState('');
    const [success, setSuccess] = useState(false);

    // Form State
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [category, setCategory] = useState('Mobiles');
    const [condition, setCondition] = useState<'New' | 'Used' | 'Refurbished'>('New');
    const [details, setDetails] = useState({ chat: true, phone: false });
    const [isBoosted, setIsBoosted] = useState(false);
    const [images, setImages] = useState<string[]>([]);
    const [location, setLocation] = useState('');
    const [analyzing, setAnalyzing] = useState(false);
    const [prediction, setPrediction] = useState<PricePrediction | null>(null);

    const pickImage = async (useCamera = false) => {
        if (images.length >= 5) {
            Alert.alert('Limit Reached', 'You can only add up to 5 images.');
            return;
        }

        let result;
        if (useCamera) {
            result = await ImagePicker.launchCameraAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.7,
            });
        } else {
            result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsMultipleSelection: true,
                selectionLimit: 5 - images.length,
                quality: 0.7,
            });
        }

        if (!result.canceled) {
            const selectedUris = result.assets.map(asset => asset.uri);
            const combinedImages = [...images, ...selectedUris].slice(0, 5);
            setImages(combinedImages);
        }
    };

    const removeImage = (index: number) => {
        const newImages = [...images];
        newImages.splice(index, 1);
        setImages(newImages);
    };
    const handleAIPredict = async () => {
        if (images.length === 0) {
            Alert.alert('No Image', 'Please upload an image first for AI to analyze.');
            return;
        }

        setAnalyzing(true);
        try {
            // In a real app, we would upload the image first or send base64
            const result = await aiPriceService.predictPrice(images[0], category, condition);
            setPrediction(result);
        } catch (error) {
            Alert.alert('AI Error', 'Could not estimate price. Please try again.');
        } finally {
            setAnalyzing(false);
        }
    };

    const applyPrice = (amount: number) => {
        setPrice(amount.toString());
        setPrediction(null);
    };

    const handlePublish = async () => {
        console.log('=== PUBLISH STARTED ===');

        if (!title.trim() || !description.trim() || !price.trim() || !location.trim()) {
            Alert.alert('Missing Fields 📝', 'Please fill in all required fields (Title, Description, Price, Location).');
            return;
        }

        if (images.length === 0) {
            Alert.alert('No Images 📸', 'Please add at least one image to showcase your product.');
            return;
        }

        setLoading(true);
        setStatusText('Checking connection...');

        // Extended Timeout Promise (60s) for slower connections
        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Network timeout. Check your connection or try smaller images.')), 60000)
        );

        try {
            const user = auth.currentUser;
            if (!user) {
                Alert.alert('Login Required', 'You must be logged in to post.');
                setLoading(false);
                setStatusText('');
                return;
            }

            // Wrap the main logic in a promise
            const publishLogic = async () => {
                setStatusText('Validating user...');
                console.log('✅ User verified, starting upload...');

                setStatusText(`Uploading ${images.length} images...`);
                const imageUrls = await storageService.uploadMultipleImages(images, 'listings');
                console.log('✅ Images uploaded successfully:', imageUrls);

                let type: 'product' | 'job' | 'service' = 'product';
                if (category === 'Jobs') type = 'job';
                else if (category === 'Services') type = 'service';

                // Data Sanity Check
                // For Products, ensure numeric price. For Jobs/Services, allow text (e.g. "15k/month")
                let finalPrice = price;
                if (type === 'product') {
                    finalPrice = price.replace(/[^0-9.]/g, '');
                }

                const listingData = {
                    title: title.trim(),
                    description: description.trim(),
                    price: finalPrice,
                    category,
                    condition,
                    enableChat: details.chat,
                    showPhone: details.phone,
                    isBoosted,
                    images: imageUrls,
                    sellerId: user.uid,
                    sellerName: user.displayName || user.email || 'User',
                    rating: 0,
                    type,
                    location: location.trim(),
                    createdAt: new Date(), // Client-side timestamp for immediate UI update
                };

                setStatusText('Saving listing...');
                console.log('📝 Creating listing with data:', JSON.stringify(listingData));
                const listingId = await listingService.createListing(listingData as any);
                console.log('✅ Listing Created ID:', listingId);
                return listingId;
            };

            // Race between publish logic and timeout
            await Promise.race([publishLogic(), timeoutPromise]);

            setStatusText('Success!');
            setSuccess(true);

            // Immediate reset for next post
            setTimeout(() => {
                setSuccess(false);
                setStatusText('');
                navigation.navigate('MyListings');
            }, 2000);

        } catch (error: any) {
            console.error('=== PUBLISH ERROR ===', error);
            Alert.alert('Publish Failed ❌', error.message || 'Check your internet connection.');
            setStatusText('');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <View style={styles.successContainer}>
                <Animated.View entering={ZoomIn} style={styles.successIcon}>
                    <Check size={60} color="#FFF" />
                </Animated.View>
                <Animated.View entering={FadeInUp.delay(300)}>
                    <Typography variant="h1" style={{ color: '#FFF', marginTop: 20 }}>Published!</Typography>
                    <Typography style={{ color: 'rgba(255,255,255,0.8)', textAlign: 'center', marginTop: 8 }}>Your product is now live.</Typography>
                </Animated.View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
                    <ArrowLeft size={24} color="#002f34" strokeWidth={2} />
                </TouchableOpacity>
                <Typography variant="h2" style={{ color: '#002f34', fontWeight: '700', fontSize: 20 }}>Sell Your Product</Typography>
                <TouchableOpacity
                    onPress={handlePublish}
                    style={[styles.textBtn, loading && { opacity: 0.5 }]}
                    disabled={loading}
                >
                    <Typography style={{ color: '#002f34', fontWeight: '700' }}>
                        {loading ? '...' : 'Save'}
                    </Typography>
                </TouchableOpacity>
            </View>

            {loading && statusText ? (
                <View style={{ backgroundColor: '#FEF3C7', padding: 8, marginHorizontal: 24, borderRadius: 8, marginBottom: 16, alignItems: 'center' }}>
                    <Typography style={{ color: '#D97706', fontSize: 13, fontWeight: '600' }}>
                        ⏳ {statusText}
                    </Typography>
                </View>
            ) : null}

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                <Animated.View entering={FadeInUp.delay(200).springify()}>
                    {/* Image Upload Section */}
                    <View style={styles.glassCard}>
                        <View style={styles.imageHeader}>
                            <Typography variant="bodyMedium" style={styles.cardTitle}>Photos ({images.length}/5)</Typography>
                            {images.length > 0 && <Check size={16} color="#10B981" />}
                        </View>
                        <View style={styles.uploadRow}>
                            <TouchableOpacity onPress={() => pickImage(false)} style={styles.uploadBtnLarge}>
                                <ImageIcon size={32} color="#002f34" />
                                <Typography style={styles.uploadText}>Gallery</Typography>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => pickImage(true)} style={styles.uploadBtnLarge}>
                                <Camera size={32} color="#002f34" />
                                <Typography style={styles.uploadText}>Camera</Typography>
                            </TouchableOpacity>
                        </View>

                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 16 }}>
                            {images.map((uri, index) => (
                                <Animated.View entering={ZoomIn.delay(index * 100)} key={index} style={styles.previewContainer}>
                                    <Image source={{ uri }} style={styles.previewImage} />
                                    <TouchableOpacity onPress={() => removeImage(index)} style={styles.deleteBadge}>
                                        <Trash2 size={14} color="#FFF" />
                                    </TouchableOpacity>
                                </Animated.View>
                            ))}
                        </ScrollView>
                    </View>
                </Animated.View>

                <Animated.View entering={SlideInDown.delay(300).springify()}>
                    {/* Product Details Form */}
                    <View style={styles.formContainer}>
                        <View style={styles.inputWrapper}>
                            <Typography variant="label" style={styles.label}>PRODUCT TITLE</Typography>
                            <TextInput
                                style={styles.input}
                                placeholder="e.g. Nike Air Max 90"
                                value={title}
                                onChangeText={setTitle}
                            />
                        </View>

                        <View style={styles.row}>
                            <View style={[styles.inputWrapper, { flex: 1, marginRight: 12 }]}>
                                <Typography variant="label" style={styles.label}>{category === 'Jobs' ? 'SALARY' : 'PRICE'}</Typography>
                                <View style={styles.priceContainer}>
                                    <Typography style={{ marginRight: 4, fontWeight: '700' }}>₹</Typography>
                                    <TextInput
                                        style={[styles.input, { borderWidth: 0, height: 40, paddingHorizontal: 0, flex: 1 }]}
                                        placeholder={category === 'Jobs' ? "e.g. 15k/mo" : "0.00"}
                                        keyboardType={category === 'Jobs' ? 'default' : 'numeric'}
                                        value={price}
                                        onChangeText={setPrice}
                                    />
                                    <TouchableOpacity onPress={handleAIPredict} style={styles.aiButton}>
                                        <Wand2 size={16} color="#FFF" />
                                    </TouchableOpacity>
                                </View>
                            </View>
                            <View style={[styles.inputWrapper, { flex: 1 }]}>
                                <Typography variant="label" style={styles.label}>CATEGORY</Typography>
                                <TouchableOpacity
                                    style={styles.dropdown}
                                    onPress={() => {
                                        const currentIndex = CATEGORIES.indexOf(category);
                                        const nextIndex = (currentIndex + 1) % CATEGORIES.length;
                                        setCategory(CATEGORIES[nextIndex]);
                                    }}
                                >
                                    <Typography numberOfLines={1}>{category}</Typography>
                                    <ChevronRight size={16} color="#6B7280" />
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Condition - Hide for Jobs/Services */}
                        {category !== 'Jobs' && category !== 'Services' && (
                            <View style={styles.inputWrapper}>
                                <Typography variant="label" style={styles.label}>CONDITION</Typography>
                                <View style={styles.chipRow}>
                                    {CONDITIONS.map((c) => (
                                        <TouchableOpacity
                                            key={c}
                                            style={[styles.chip, condition === c && styles.activeChip]}
                                            onPress={() => setCondition(c as any)}
                                        >
                                            <Typography style={[styles.chipText, condition === c && styles.activeChipText]}>{c}</Typography>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                        )}

                        <View style={styles.inputWrapper}>
                            <Typography variant="label" style={styles.label}>DESCRIPTION</Typography>
                            <TextInput
                                style={[styles.input, { height: 100, textAlignVertical: 'top', paddingTop: 12 }]}
                                placeholder="Describe your item in detail..."
                                multiline
                                value={description}
                                onChangeText={setDescription}
                            />
                        </View>

                        <View style={styles.inputWrapper}>
                            <Typography variant="label" style={styles.label}>LOCATION</Typography>
                            <View style={styles.locationInputContainer}>
                                <MapPin size={20} color="#6B7280" style={{ marginRight: 8 }} />
                                <TextInput
                                    style={[styles.input, { flex: 1, borderWidth: 0, height: 40, paddingHorizontal: 0 }]}
                                    placeholder="e.g. New York, USA"
                                    value={location}
                                    onChangeText={setLocation}
                                />
                            </View>
                        </View>
                    </View>
                </Animated.View>

                {/* Extra Options */}
                <Animated.View entering={SlideInDown.delay(400).springify()} style={{ marginTop: 24 }}>
                    <View style={styles.optionRow}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <View style={[styles.iconBox, { backgroundColor: '#EEF2FF' }]}>
                                <MessageCircle size={20} color="#002f34" />
                            </View>
                            <Typography style={{ marginLeft: 12, fontWeight: '600' }}>Enable Chat</Typography>
                        </View>
                        <Switch
                            value={details.chat}
                            onValueChange={(v) => setDetails({ ...details, chat: v })}
                            trackColor={{ false: '#E5E7EB', true: '#002f34' }}
                        />
                    </View>
                    <View style={styles.optionRow}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <View style={[styles.iconBox, { backgroundColor: '#ECFDF5' }]}>
                                <Phone size={20} color="#10B981" />
                            </View>
                            <Typography style={{ marginLeft: 12, fontWeight: '600' }}>Show Phone Number</Typography>
                        </View>
                        <Switch
                            value={details.phone}
                            onValueChange={(v) => setDetails({ ...details, phone: v })}
                            trackColor={{ false: '#E5E7EB', true: '#002f34' }}
                        />
                    </View>

                    {/* Boost Card */}
                    <TouchableOpacity onPress={() => setIsBoosted(!isBoosted)} activeOpacity={0.9}>
                        <LinearGradient
                            colors={isBoosted ? ['#4F46E5', '#7C3AED'] : ['#F3F4F6', '#E5E7EB']}
                            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                            style={[
                                styles.boostCard,
                                isBoosted && { borderWidth: 0 },
                                !isBoosted && { borderWidth: 1, borderColor: '#D1D5DB' }
                            ]}
                        >
                            <View style={styles.boostContent}>
                                <View>
                                    <Typography variant="h3" style={{ color: isBoosted ? '#FFF' : '#374151' }}>Boost Listing</Typography>
                                    <Typography style={{ color: isBoosted ? '#E0E7FF' : '#6B7280', fontSize: 13, marginTop: 4 }}>
                                        {isBoosted ? 'Boost Active ✨' : 'Get 3x more views by boosting.'}
                                    </Typography>
                                </View>
                                <View style={[styles.zapIcon, !isBoosted && { backgroundColor: '#FFF' }]}>
                                    <Zap size={24} color={isBoosted ? "#F59E0B" : "#9CA3AF"} fill={isBoosted ? "#F59E0B" : "none"} />
                                </View>
                            </View>
                        </LinearGradient>
                    </TouchableOpacity>

                </Animated.View>

            </ScrollView>

            {/* Bottom Actions */}
            <View style={styles.bottomBar}>
                <TouchableOpacity style={styles.previewBtn}>
                    <Typography style={{ color: '#002f34', fontWeight: '700' }}>Preview</Typography>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.publishBtn, loading && { opacity: 0.7 }]}
                    onPress={handlePublish}
                    disabled={loading}
                >
                    <Typography style={{ color: '#FFF', fontWeight: '700', marginRight: 8 }}>
                        {loading ? 'Publishing...' : 'Publish Now'}
                    </Typography>
                    {!loading && <ArrowRight size={20} color="#FFF" />}
                </TouchableOpacity>
            </View>
            {/* AI Prediction Modal */}
            {prediction && (
                <View style={styles.modalOverlay}>
                    <Animated.View entering={ZoomIn} style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <View style={{ backgroundColor: '#EEF2FF', padding: 8, borderRadius: 12, marginRight: 12 }}>
                                    <Wand2 size={24} color="#4F46E5" />
                                </View>
                                <Typography variant="h3">AI Estimate</Typography>
                            </View>
                            <TouchableOpacity onPress={() => setPrediction(null)}>
                                <X size={24} color="#6B7280" />
                            </TouchableOpacity>
                        </View>

                        <Typography style={{ color: '#6B7280', marginTop: 8 }}>
                            Based on your {category} item and {condition} condition, we suggest:
                        </Typography>

                        <View style={styles.priceRangeBox}>
                            <Typography variant="h2" style={{ color: '#002f34' }}>
                                ₹{prediction.min} - ₹{prediction.max}
                            </Typography>
                            <Typography variant="bodySmall" style={{ color: '#10B981', fontWeight: '600', marginTop: 4 }}>
                                {Math.round(prediction.confidence * 100)}% Confidence
                            </Typography>
                        </View>

                        <TouchableOpacity
                            style={styles.applyBtn}
                            onPress={() => applyPrice(Math.round((prediction.min + prediction.max) / 2))}
                        >
                            <Typography style={{ color: '#FFF', fontWeight: '700' }}>Apply Recommended Price</Typography>
                        </TouchableOpacity>
                    </Animated.View>
                </View>
            )}

            {/* Analyzing Overlay */}
            {analyzing && (
                <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.7)' }]}>
                    <Animated.View entering={FadeIn} style={{ alignItems: 'center' }}>
                        <Wand2 size={48} color="#FFF" style={{ marginBottom: 16 }} />
                        <Typography variant="h3" style={{ color: '#FFF' }}>AI Analyzing...</Typography>
                        <Typography style={{ color: 'rgba(255,255,255,0.7)', marginTop: 8 }}>Estimating optimal price</Typography>
                    </Animated.View>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    successContainer: {
        flex: 1,
        backgroundColor: '#002f34',
        justifyContent: 'center',
        alignItems: 'center',
    },
    successIcon: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    header: {
        paddingTop: 60,
        paddingHorizontal: 24,
        paddingBottom: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    iconBtn: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
    },
    textBtn: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.2)',
    },
    scrollContent: {
        paddingHorizontal: 24,
        paddingBottom: 120,
    },
    glassCard: {
        borderRadius: 24,
        padding: 20,
        marginBottom: 24,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.5)',
    },
    imageHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    cardTitle: {
        fontWeight: '700',
        color: '#1F2937',
    },
    uploadRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
    },
    uploadBtnLarge: {
        flex: 1,
        height: 100,
        backgroundColor: '#F3F4F6',
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderStyle: 'dashed',
        borderWidth: 2,
        borderColor: '#E5E7EB',
    },
    uploadText: {
        marginTop: 8,
        fontSize: 12,
        fontWeight: '600',
        color: '#002f34',
    },
    previewContainer: {
        marginRight: 10,
        width: 80,
        height: 80,
        borderRadius: 12,
        position: 'relative',
    },
    previewImage: {
        width: '100%',
        height: '100%',
        borderRadius: 12,
    },
    deleteBadge: {
        position: 'absolute',
        top: -6,
        right: -6,
        backgroundColor: '#EF4444',
        width: 20,
        height: 20,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#FFF',
    },
    formContainer: {
        backgroundColor: '#FFF',
        borderRadius: 24,
        padding: 24,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
    },
    inputWrapper: {
        marginBottom: 20,
    },
    label: {
        fontSize: 11,
        fontWeight: '700',
        color: '#9CA3AF',
        marginBottom: 8,
        letterSpacing: 0.5,
    },
    input: {
        backgroundColor: '#F9FAFB',
        height: 50,
        borderRadius: 12,
        paddingHorizontal: 16,
        fontSize: 15,
        color: '#1F2937',
        borderWidth: 1,
        borderColor: '#F3F4F6',
    },
    row: {
        flexDirection: 'row',
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        height: 50,
        borderRadius: 12,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: '#F3F4F6',
    },
    dropdown: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#F9FAFB',
        height: 50,
        borderRadius: 12,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: '#F3F4F6',
    },
    chipRow: {
        flexDirection: 'row',
        gap: 8,
    },
    chip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#F3F4F6',
    },
    activeChip: {
        backgroundColor: '#002f34',
    },
    chipText: {
        fontSize: 13,
        color: '#4B5563',
        fontWeight: '600',
    },
    activeChipText: {
        color: '#FFF',
    },
    locationInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        height: 50,
        borderRadius: 12,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: '#F3F4F6',
    },
    optionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#FFF',
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
    },
    iconBox: {
        width: 36,
        height: 36,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    boostCard: {
        marginTop: 12,
        borderRadius: 20,
        padding: 20,
    },
    boostContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    zapIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    bottomBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#FFF',
        paddingHorizontal: 24,
        paddingVertical: 20,
        paddingBottom: Platform.OS === 'ios' ? 34 : 20,
        flexDirection: 'row',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
    },
    previewBtn: {
        flex: 1,
        height: 56,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
        borderRadius: 16,
        backgroundColor: '#F5F3FF',
    },
    publishBtn: {
        flex: 2,
        height: 56,
        backgroundColor: '#002f34',
        borderRadius: 16,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 4,
        shadowColor: '#002f34',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    aiButton: {
        backgroundColor: '#4F46E5',
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
        zIndex: 1000,
    },
    modalContent: {
        backgroundColor: '#FFF',
        width: '100%',
        borderRadius: 24,
        padding: 24,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    priceRangeBox: {
        backgroundColor: '#F9FAFB',
        padding: 20,
        borderRadius: 16,
        alignItems: 'center',
        marginVertical: 20,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    applyBtn: {
        backgroundColor: '#002f34',
        height: 50,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

