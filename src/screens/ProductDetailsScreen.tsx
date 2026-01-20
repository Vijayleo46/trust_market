import React, { useState, useEffect, useCallback } from 'react';
import { View, Image, TouchableOpacity, Dimensions, Platform, FlatList, Alert, StatusBar, StyleSheet } from 'react-native';
import Animated, {
    FadeInDown,
    FadeIn,
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withTiming,
    interpolate
} from 'react-native-reanimated';
import { Typography } from '../components/common/Typography';
import {
    Heart,
    Share2,
    ChevronLeft,
    Rotate3d,
    ShoppingBag,
    ArrowRight,
    Check
} from 'lucide-react-native';
import { listingService } from '../services/listingService';
import { auth } from '../core/config/firebase';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

const { width, height } = Dimensions.get('window');
const IMG_HEIGHT = height * 0.6;

const SIZES = ['S', 'M', 'L', 'XL'];
const COLORS = [
    { name: 'Midnight', value: '#0A0A0A' },
    { name: 'Champagne', value: '#D4AF37' },
    { name: 'Slate', value: '#2F4F4F' }
];

export const ProductDetailsScreen = ({ route, navigation }: any) => {
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const [isInWishlist, setIsInWishlist] = useState(false);
    const [wishlistLoading, setWishlistLoading] = useState(false);
    const [selectedSize, setSelectedSize] = useState('M');
    const [selectedColor, setSelectedColor] = useState(COLORS[0].value);
    const [is360Active, setIs360Active] = useState(false);
    const [isAdding, setIsAdding] = useState(false);

    const { product } = route.params || {};

    const item = {
        id: product?.id,
        title: product?.title || 'Essence Premium Watch',
        price: product?.price || '₹24,999',
        description: product?.description || 'A timeless piece of craftsmanship, designed for those who value elegance and precision. Featuring a sapphire crystal face and premium leather strap.',
        images: product?.images?.length ? product.images : [
            'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1000&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1524592094714-0f0654e20314?q=80&w=1000&auto=format&fit=crop'
        ],
        brand: 'LUXE CHRONO'
    };

    const scrollY = useSharedValue(0);

    const checkWishlist = useCallback(async () => {
        const user = auth.currentUser;
        if (user && item.id) {
            const inWishlist = await listingService.isInWishlist(user.uid, item.id);
            setIsInWishlist(inWishlist);
        }
    }, [item.id]);

    useEffect(() => {
        checkWishlist();
    }, [checkWishlist]);

    const toggleWishlist = async () => {
        const user = auth.currentUser;
        if (!user) {
            Alert.alert('Login Required', 'Please login to preserve your favorites.');
            return;
        }

        try {
            if (Haptics?.impactAsync) {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            }
        } catch (e) { }

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

    const handleAddToCart = async () => {
        setIsAdding(true);
        try {
            if (Haptics?.notificationAsync) {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }
        } catch (e) { }

        // Simulate adding to bag
        setTimeout(() => {
            setIsAdding(false);
        }, 2000);
    };

    const handleImageScroll = (event: any) => {
        const slideSize = event.nativeEvent.layoutMeasurement.width;
        const index = event.nativeEvent.contentOffset.x / slideSize;
        setActiveImageIndex(Math.round(index));
    };

    const animatedImageStyle = useAnimatedStyle(() => {
        return {
            transform: [
                { scale: interpolate(scrollY.value, [-100, 0, 100], [1.2, 1, 1.1]) },
                { translateY: interpolate(scrollY.value, [-100, 0, 100], [-50, 0, 20]) }
            ]
        };
    });

    return (
        <View className="flex-1 bg-[#0A0A0A]">
            <StatusBar barStyle="light-content" />

            {/* Sticky Header Overlay */}
            <SafeAreaView edges={['top']} className="absolute top-0 left-0 right-0 z-50 flex-row justify-between items-center px-6 py-4">
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    className="w-12 h-12 rounded-full border border-white/10 items-center justify-center bg-black/20"
                >
                    <ChevronLeft size={24} color="#FFF" />
                </TouchableOpacity>
                <View className="flex-row gap-x-4">
                    <TouchableOpacity className="w-12 h-12 rounded-full border border-white/10 items-center justify-center bg-black/20">
                        <Share2 size={20} color="#FFF" />
                    </TouchableOpacity>
                    <TouchableOpacity
                        className="w-12 h-12 rounded-full border border-white/10 items-center justify-center bg-black/20"
                        onPress={toggleWishlist}
                        disabled={wishlistLoading}
                    >
                        <Heart
                            size={20}
                            color={isInWishlist ? "#D4AF37" : "#FFF"}
                            fill={isInWishlist ? "#D4AF37" : "transparent"}
                        />
                    </TouchableOpacity>
                </View>
            </SafeAreaView>

            <Animated.ScrollView
                showsVerticalScrollIndicator={false}
                onScroll={(e) => { scrollY.value = e.nativeEvent.contentOffset.y; }}
                scrollEventThrottle={16}
                contentContainerStyle={{ paddingBottom: 120 }}
            >
                {/* Centerpiece Image Gallery */}
                <View style={{ height: IMG_HEIGHT }} className="relative">
                    <Animated.View style={[{ width, height: IMG_HEIGHT }, animatedImageStyle]}>
                        <FlatList
                            data={item.images}
                            horizontal
                            pagingEnabled
                            showsHorizontalScrollIndicator={false}
                            onScroll={handleImageScroll}
                            renderItem={({ item: imageUrl }) => (
                                <Image
                                    source={{ uri: imageUrl }}
                                    style={{ width, height: IMG_HEIGHT }}
                                    resizeMode="cover"
                                />
                            )}
                            keyExtractor={(_, index) => index.toString()}
                        />
                    </Animated.View>

                    <LinearGradient
                        colors={['transparent', 'rgba(10,10,10,0.8)', '#0A0A0A']}
                        className="absolute bottom-0 left-0 right-0 h-40"
                    />

                    {/* Image Indicators */}
                    <View className="absolute bottom-10 left-0 right-0 flex-row justify-center gap-x-2">
                        {item.images.map((_, i) => (
                            <View
                                key={i}
                                className={`h-1 rounded-full ${activeImageIndex === i ? 'w-8 bg-[#D4AF37]' : 'w-2 bg-white/30'}`}
                            />
                        ))}
                    </View>

                    {/* 360 Toggle */}
                    <TouchableOpacity
                        onPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                            setIs360Active(!is360Active);
                        }}
                        className="absolute bottom-10 right-6 flex-row items-center bg-white/10 px-4 py-2 rounded-full border border-white/20"
                    >
                        <BlurView intensity={20} className="absolute inset-0 rounded-full" />
                        <Rotate3d size={18} color="#D4AF37" />
                        <Typography className="text-white text-[10px] font-bold ml-2 tracking-widest">360° VIEW</Typography>
                    </TouchableOpacity>
                </View>

                {/* Product Info - Glassmorphism Card */}
                <Animated.View
                    entering={FadeInDown.duration(800).delay(200).springify()}
                    className="mx-6 -mt-8 rounded-[32px] overflow-hidden border border-white/10"
                >
                    <BlurView intensity={80} tint="dark" className="p-8">
                        <Typography className="text-[#D4AF37] text-[10px] font-bold tracking-[4px] mb-2 uppercase">
                            {item.brand}
                        </Typography>
                        <Typography className="text-white text-3xl font-light mb-2">
                            {item.title}
                        </Typography>
                        <Typography className="text-white/60 text-sm leading-6 mb-6">
                            {item.description}
                        </Typography>

                        <View className="flex-row items-end mb-8">
                            <Typography className="text-white text-4xl font-bold">{item.price}</Typography>
                            <Typography className="text-white/40 text-xs ml-2 mb-2">Includes taxes</Typography>
                        </View>

                        {/* Size Picker */}
                        <View className="mb-8">
                            <Typography className="text-white/40 text-[10px] font-bold tracking-widest mb-4 uppercase">SELECT SIZE</Typography>
                            <View className="flex-row gap-x-4">
                                {SIZES.map(size => (
                                    <TouchableOpacity
                                        key={size}
                                        onPress={() => {
                                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                            setSelectedSize(size);
                                        }}
                                        className={`w-12 h-12 rounded-full border items-center justify-center ${selectedSize === size ? 'bg-[#D4AF37] border-[#D4AF37]' : 'border-white/10'}`}
                                    >
                                        <Typography className={`text-sm ${selectedSize === size ? 'text-black font-bold' : 'text-white'}`}>
                                            {size}
                                        </Typography>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {/* Color Picker */}
                        <View>
                            <Typography className="text-white/40 text-[10px] font-bold tracking-widest mb-4 uppercase">AVAILABLE COLORS</Typography>
                            <View className="flex-row gap-x-4">
                                {COLORS.map(color => (
                                    <TouchableOpacity
                                        key={color.value}
                                        onPress={() => {
                                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                            setSelectedColor(color.value);
                                        }}
                                        className="w-10 h-10 rounded-full p-1 border border-white/10"
                                        style={{ borderColor: selectedColor === color.value ? color.value : 'transparent' }}
                                    >
                                        <View
                                            className="flex-1 rounded-full"
                                            style={{ backgroundColor: color.value }}
                                        />
                                        {selectedColor === color.value && (
                                            <View className="absolute -top-1 -right-1 bg-white rounded-full p-0.5">
                                                <Check size={8} color="#000" />
                                            </View>
                                        )}
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    </BlurView>
                </Animated.View>
            </Animated.ScrollView>

            {/* Floating 360 Overlay (Conditional) */}
            {is360Active && (
                <View className="absolute inset-0 bg-black/95 z-[100] items-center justify-center">
                    <Typography className="text-white text-xl font-light mb-8">Interactive 360°</Typography>
                    <View className="w-80 h-80 rounded-full border border-white/10 items-center justify-center">
                        <Rotate3d size={48} color="#D4AF37" />
                        <Typography className="text-white/40 text-xs mt-4">Drag to Rotate</Typography>
                    </View>
                    <TouchableOpacity
                        onPress={() => setIs360Active(false)}
                        className="mt-12 w-16 h-16 rounded-full bg-white items-center justify-center"
                    >
                        <ChevronLeft size={32} color="#000" style={{ transform: [{ rotate: '-90deg' }] }} />
                    </TouchableOpacity>
                </View>
            )}

            {/* Bottom Action Bar */}
            <BlurView intensity={30} tint="dark" style={styles.tabBar} className="absolute bottom-0 left-0 right-0 px-6 pt-4 pb-10 border-t border-white/5">
                <TouchableOpacity
                    onPress={handleAddToCart}
                    disabled={isAdding}
                    className="flex-row items-center justify-between bg-white px-8 h-16 rounded-full shadow-2xl"
                >
                    <View className="flex-row items-center">
                        {isAdding ? (
                            <Check size={24} color="#000" />
                        ) : (
                            <ShoppingBag size={24} color="#000" />
                        )}
                        <Typography className="text-black text-lg font-bold ml-4">
                            {isAdding ? 'ADDED TO BAG' : 'ADD TO BAG'}
                        </Typography>
                    </View>
                    {!isAdding && <ArrowRight size={24} color="#000" />}
                </TouchableOpacity>
            </BlurView>
        </View>
    );
};

const styles = StyleSheet.create({
    tabBar: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
    }
});
