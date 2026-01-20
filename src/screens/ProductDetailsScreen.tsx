import React, { useState, useEffect, useCallback } from 'react';
import { View, Image, TouchableOpacity, Dimensions, ScrollView, Alert, StatusBar, Platform, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import { Typography } from '../components/common/Typography';
import {
    Heart,
    Share2,
    ChevronLeft,
    MapPin,
    Clock,
    CheckCircle2,
    MessageCircle,
    Phone
} from 'lucide-react-native';
import { listingService } from '../services/listingService';
import { chatService } from '../services/chatService';
import { auth } from '../core/config/firebase';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

const { width, height } = Dimensions.get('window');
const IMG_HEIGHT = height * 0.5;

export const ProductDetailsScreen = ({ route, navigation }: any) => {
    const { product } = route.params || {};
    const [item, setItem] = useState<any>(product);
    const [isInWishlist, setIsInWishlist] = useState(false);
    const [wishlistLoading, setWishlistLoading] = useState(false);
    const [loading, setLoading] = useState(!product);
    const [isZoomed, setIsZoomed] = useState(false);

    // Fetch fresh data from backend
    useEffect(() => {
        const fetchListing = async () => {
            if (!item?.id) return;
            try {
                const freshData = await listingService.getListingById(item.id);
                if (freshData) {
                    setItem(freshData);
                }
            } catch (error) {
                console.error('Error fetching fresh listing data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchListing();
    }, [item?.id]);

    // Check wishlist status
    const checkWishlist = useCallback(async () => {
        const user = auth.currentUser;
        if (user && item?.id) {
            try {
                const inWishlist = await listingService.isInWishlist(user.uid, item.id);
                setIsInWishlist(inWishlist);
            } catch (error) {
                console.error('Error checking wishlist:', error);
            }
        }
    }, [item?.id]);

    useEffect(() => {
        checkWishlist();
    }, [checkWishlist]);

    const toggleWishlist = async () => {
        const user = auth.currentUser;
        if (!user) {
            Alert.alert('Login Required', 'Please login to save favorites.');
            return;
        }

        try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } catch (e) { }

        setWishlistLoading(true);
        try {
            if (isInWishlist) {
                await listingService.removeFromWishlist(user.uid, item.id);
                setIsInWishlist(false);
            } else {
                await listingService.addToWishlist(user.uid, item.id);
                setIsInWishlist(true);
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to update wishlist');
        } finally {
            setWishlistLoading(false);
        }
    };

    const handleChatWithSeller = async () => {
        const user = auth.currentUser;
        if (!user) {
            Alert.alert('Login Required', 'Please login to chat with seller.');
            return;
        }

        if (user.uid === item.sellerId) {
            Alert.alert('Info', 'You cannot chat with yourself.');
            return;
        }

        try {
            const chatId = await chatService.getOrCreateChat(
                user.uid,
                item.sellerId,
                user.displayName || 'Buyer',
                item.sellerName || 'Seller',
                item.type || 'product',
                item.id,
                item.title
            );

            navigation.navigate('ChatRoom', {
                chatId,
                otherName: item.sellerName || 'Seller',
                otherAvatar: `https://i.pravatar.cc/150?u=${item.sellerId}`,
                productImage: item.images?.[0],
                productPrice: item.price,
                productTitle: item.title
            });
        } catch (error) {
            Alert.alert('Error', 'Failed to initiate chat.');
        }
    };

    const handleCallSeller = () => {
        if (item.contactPhone || item.showPhone) {
            Alert.alert('Call Seller', `Connecting to ${item.contactPhone || 'seller'}...`);
        } else {
            Alert.alert('Info', 'Seller has not provided a phone number.');
        }
    };

    const getTimeAgo = () => {
        if (!item?.createdAt) return 'Just now';
        return 'Recently added';
    };

    if (loading || !item) {
        return (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF' }}>
                <ActivityIndicator size="large" color="#002f34" />
            </View>
        );
    }
    return (
        <View style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 140 }}
                bounces={false}
            >
                {/* Main Product Image */}
                <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={() => {
                        setIsZoomed(!isZoomed);
                        try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch (e) { }
                    }}
                    style={{ height: IMG_HEIGHT, width: '100%', overflow: 'hidden' }}
                >
                    <MotiView
                        animate={{
                            scale: isZoomed ? 1.3 : 1,
                        }}
                        transition={{
                            type: 'timing',
                            duration: 400,
                        }}
                        style={{ width: '100%', height: '100%' }}
                    >
                        <Image
                            source={{ uri: item.images[0] }}
                            style={{ width, height: IMG_HEIGHT }}
                            resizeMode="cover"
                        />
                    </MotiView>
                </TouchableOpacity>

                {/* Dark Overlay for better button visibility */}
                <LinearGradient
                    colors={['rgba(0,0,0,0.4)', 'transparent', 'transparent']}
                    style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 120 }}
                />

                {/* Header Buttons Overlay */}
                <View style={{ position: 'absolute', top: 0, left: 0, right: 0 }}>
                    <SafeAreaView edges={['top']} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 10 }}>
                        <TouchableOpacity
                            onPress={() => navigation.goBack()}
                            style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.9)', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 }}
                        >
                            <ChevronLeft size={24} color="#0F172A" strokeWidth={2.5} />
                        </TouchableOpacity>

                        <View style={{ flexDirection: 'row', gap: 12 }}>
                            <TouchableOpacity style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.9)', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 }}>
                                <Share2 size={20} color="#0F172A" strokeWidth={2.5} />
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={toggleWishlist}
                                disabled={wishlistLoading}
                                style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.9)', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 }}
                            >
                                <Heart
                                    size={20}
                                    color={isInWishlist ? "#EF4444" : "#0F172A"}
                                    fill={isInWishlist ? "#EF4444" : "transparent"}
                                    strokeWidth={2.5}
                                />
                            </TouchableOpacity>
                        </View>
                    </SafeAreaView>
                </View>

                {/* Product Details Sheet */}
                <MotiView
                    from={{ translateY: 100 }}
                    animate={{ translateY: 0 }}
                    transition={{ type: 'spring', damping: 20 }}
                    style={{
                        backgroundColor: '#FFFFFF',
                        borderTopLeftRadius: 32,
                        borderTopRightRadius: 32,
                        marginTop: -32,
                        paddingHorizontal: 24,
                        paddingTop: 32,
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: -10 },
                        shadowOpacity: 0.05,
                        shadowRadius: 20,
                        elevation: 5,
                    }}
                >
                    {/* Category & Time */}
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                        <View style={{ backgroundColor: '#EEF2FF', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 }}>
                            <Typography style={{ color: '#4F46E5', fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 }}>
                                {item.category}
                            </Typography>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Clock size={14} color="#94A3B8" />
                            <Typography style={{ color: '#64748B', fontSize: 12, marginLeft: 6 }}>{getTimeAgo()}</Typography>
                        </View>
                    </View>

                    {/* Title */}
                    <Typography style={{ color: '#0F172A', fontSize: 28, fontWeight: '900', marginBottom: 16, lineHeight: 36 }}>
                        {item.title}
                    </Typography>

                    {/* Price & Badge */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 24 }}>
                        <Typography style={{ color: '#6366F1', fontSize: 36, fontWeight: '900' }}>
                            {item.price}
                        </Typography>
                        <View style={{ marginLeft: 16, backgroundColor: '#FEF08A', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, flexDirection: 'row', alignItems: 'center' }}>
                            <Typography style={{ fontSize: 14 }}>⭐</Typography>
                            <Typography style={{ color: '#854D0E', fontSize: 12, fontWeight: '700', marginLeft: 4 }}>Featured</Typography>
                        </View>
                    </View>

                    {/* Location */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 24 }}>
                        <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center' }}>
                            <MapPin size={18} color="#6366F1" />
                        </View>
                        <Typography style={{ color: '#475569', fontSize: 16, fontWeight: '600', marginLeft: 12 }}>
                            {item.location}
                        </Typography>
                    </View>

                    <View style={{ height: 1, backgroundColor: '#F1F5F9', marginBottom: 24 }} />

                    {/* Seller Info */}
                    <Typography style={{ color: '#94A3B8', fontSize: 12, fontWeight: '800', letterSpacing: 1.5, marginBottom: 16 }}>
                        LISTED BY
                    </Typography>

                    <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', padding: 16, borderRadius: 20, marginBottom: 32 }}>
                        <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: '#6366F1', alignItems: 'center', justifyContent: 'center' }}>
                            <Typography style={{ color: '#FFFFFF', fontSize: 20, fontWeight: '700' }}>
                                {item.sellerName?.charAt(0) || 'U'}
                            </Typography>
                        </View>
                        <View style={{ marginLeft: 16, flex: 1 }}>
                            <Typography style={{ color: '#0F172A', fontSize: 18, fontWeight: '700' }}>
                                {item.sellerName}
                            </Typography>
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                                <CheckCircle2 size={14} color="#10B981" fill="#10B981" />
                                <Typography style={{ color: '#10B981', fontSize: 13, fontWeight: '600', marginLeft: 6 }}>
                                    Verified Professional
                                </Typography>
                            </View>
                        </View>
                        <ChevronLeft size={20} color="#94A3B8" style={{ transform: [{ rotate: '180deg' }] }} />
                    </TouchableOpacity>

                    {/* Description */}
                    <Typography style={{ color: '#94A3B8', fontSize: 12, fontWeight: '800', letterSpacing: 1.5, marginBottom: 12 }}>
                        DESCRIPTION
                    </Typography>
                    <Typography style={{ color: '#334155', fontSize: 16, lineHeight: 26, marginBottom: 32 }}>
                        {item.description}
                    </Typography>

                    {/* Condition */}
                    {item.condition && (
                        <>
                            <Typography style={{ color: '#94A3B8', fontSize: 12, fontWeight: '800', letterSpacing: 1.5, marginBottom: 12 }}>
                                CONDITION
                            </Typography>
                            <View style={{ alignSelf: 'flex-start', backgroundColor: '#F0FDF4', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12, marginBottom: 32 }}>
                                <Typography style={{ color: '#166534', fontSize: 14, fontWeight: '700' }}>
                                    {item.condition}
                                </Typography>
                            </View>
                        </>
                    )}
                </MotiView>
            </ScrollView>

            {/* Sticky Bottom Actions */}
            <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#FFFFFF', paddingHorizontal: 24, paddingTop: 16, paddingBottom: Platform.OS === 'ios' ? 34 : 16, borderTopWidth: 1, borderTopColor: '#F1F5F9' }}>
                <MotiView
                    from={{ translateY: 50, opacity: 0 }}
                    animate={{ translateY: 0, opacity: 1 }}
                    transition={{ type: 'spring', delay: 300 }}
                >
                    <TouchableOpacity
                        onPress={handleChatWithSeller}
                        activeOpacity={0.8}
                        style={{
                            backgroundColor: '#002f34',
                            height: 64,
                            borderRadius: 32,
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'center',
                            shadowColor: '#002f34',
                            shadowOffset: { width: 0, height: 8 },
                            shadowOpacity: 0.3,
                            shadowRadius: 16,
                            elevation: 8,
                        }}
                    >
                        <MessageCircle size={24} color="#FFFFFF" strokeWidth={2.5} />
                        <Typography style={{ color: '#FFFFFF', fontSize: 18, fontWeight: '700', marginLeft: 12 }}>
                            Chat with Seller
                        </Typography>
                    </TouchableOpacity>
                </MotiView>
            </View>
        </View >
    );
};
