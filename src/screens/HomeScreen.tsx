import React, { useEffect, useState } from 'react';
import { View, ScrollView, FlatList, TouchableOpacity, Image, Dimensions, StatusBar } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { MotiView } from 'moti';
import { useTheme } from '../theme/ThemeContext';
import { Typography } from '../components/common/Typography';
import { PremiumProductCard } from '../components/home/PremiumProductCard';
import { GlassmorphismSearch } from '../components/home/GlassmorphismSearch';
import {
    Car,
    Briefcase,
    Smartphone,
    Zap,
    Compass,
    Clock,
    TrendingUp,
    Diamond,
    UserCircle
} from 'lucide-react-native';
import { listingService } from '../services/listingService';
import { useIsFocused } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const CATEGORIES = [
    { id: '1', label: 'Luxury', icon: Diamond, color: '#002f34' },
    { id: '2', label: 'Automotive', icon: Car, color: '#0EA5E9' },
    { id: '3', label: 'High-Tech', icon: Zap, color: '#F59E0B' },
    { id: '4', label: 'Careers', icon: Briefcase, color: '#10B981' },
    { id: '5', label: 'Mobiles', icon: Smartphone, color: '#EF4444' },
];

export const HomeScreen = ({ navigation }: any) => {
    const isFocused = useIsFocused();
    const [products, setProducts] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchListings = async () => {
            try {
                const allListings = await listingService.getFeaturedListings(20);
                const productsList = allListings.filter(item => item.type === 'product');
                setProducts(productsList);
            } catch (error) {
                console.error("Failed to fetch listings", error);
            } finally {
                setLoading(false);
            }
        };

        if (isFocused) {
            fetchListings();
        }
    }, [isFocused]);

    const renderHeader = () => (
        <View className="px-5 pt-4 pb-2">
            <MotiView
                from={{ translateY: -20, opacity: 0 }}
                animate={{ translateY: 0, opacity: 1 }}
                transition={{ type: 'timing', duration: 800 }}
                className="flex-row justify-between items-center"
            >
                <View>
                    <Typography className="text-[12px] uppercase tracking-[4px] text-gray-400 font-bold mb-1">Welcome to</Typography>
                    <Typography className="text-4xl font-black text-primary tracking-tighter">VENDO</Typography>
                </View>
                <TouchableOpacity className="w-12 h-12 rounded-full bg-white shadow-sm border border-gray-100 items-center justify-center">
                    <UserCircle size={28} color="#002f34" strokeWidth={1.5} />
                </TouchableOpacity>
            </MotiView>

            <GlassmorphismSearch
                value={searchQuery}
                onChangeText={setSearchQuery}
            />
        </View>
    );

    const renderCategories = () => (
        <View className="py-6">
            <MotiView
                from={{ opacity: 0, translateX: 50 }}
                animate={{ opacity: 1, translateX: 0 }}
                transition={{ delay: 300, duration: 600 }}
            >
                <View className="flex-row justify-between items-center px-6 mb-4">
                    <Typography className="text-xl font-bold text-gray-900 tracking-tight">Categories</Typography>
                    <TouchableOpacity>
                        <Typography className="text-sm font-bold text-primary">Discover All</Typography>
                    </TouchableOpacity>
                </View>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: 20 }}
                >
                    {CATEGORIES.map((item, index) => (
                        <TouchableOpacity
                            key={item.id}
                            className="mr-5 items-center"
                        >
                            <View
                                style={{ backgroundColor: `${item.color}10` }}
                                className="w-16 h-16 rounded-[24px] justify-center items-center mb-2 border border-white"
                            >
                                <item.icon size={26} color={item.color} strokeWidth={1.2} />
                            </View>
                            <Typography className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">{item.label}</Typography>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </MotiView>
        </View>
    );

    const renderQuickStats = () => (
        <View className="flex-row px-5 mb-6 gap-3">
            <MotiView
                from={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 400 }}
                className="flex-1 bg-white p-4 rounded-[28px] border border-gray-100 shadow-sm"
            >
                <TrendingUp size={24} color="#002f34" />
                <Typography className="text-[10px] uppercase font-bold text-gray-400 mt-2">New Since Yesterday</Typography>
                <Typography className="text-xl font-bold text-gray-900">+128</Typography>
            </MotiView>
            <MotiView
                from={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 500 }}
                className="flex-1 bg-white p-4 rounded-[28px] border border-gray-100 shadow-sm"
            >
                <Clock size={24} color="#0EA5E9" />
                <Typography className="text-[10px] uppercase font-bold text-gray-400 mt-2">Average Response</Typography>
                <Typography className="text-xl font-bold text-gray-900">12 min</Typography>
            </MotiView>
        </View>
    );

    return (
        <SafeAreaView className="flex-1 bg-background" edges={['top']}>
            <StatusBar barStyle="dark-content" />
            <FlatList
                data={products}
                keyExtractor={(item) => item.id}
                numColumns={2}
                ListHeaderComponent={
                    <>
                        {renderHeader()}
                        {renderCategories()}
                        {renderQuickStats()}
                        <View className="px-6 py-4 flex-row justify-between items-center">
                            <Typography className="text-2xl font-bold text-gray-900 tracking-tight">Featured Collections</Typography>
                            <Compass size={24} color="#002f34" />
                        </View>
                    </>
                }
                renderItem={({ item, index }) => (
                    <MotiView
                        from={{ opacity: 0, translateY: 50 }}
                        animate={{ opacity: 1, translateY: 0 }}
                        transition={{
                            type: 'timing',
                            duration: 700,
                            delay: index * 100 + 600,
                        }}
                        style={{ flex: 1, maxWidth: '50%', paddingHorizontal: 10 }}
                    >
                        <PremiumProductCard
                            title={item.title}
                            price={item.price}
                            image={item.image || (item.images && item.images[0]) || 'https://via.placeholder.com/200'}
                            location={item.location || 'Malappuram'}
                            onPress={() => navigation.navigate('ProductDetails', { product: item })}
                        />
                    </MotiView>
                )}
                contentContainerStyle={{ paddingBottom: 100, paddingHorizontal: 10 }}
                showsVerticalScrollIndicator={false}
            />
        </SafeAreaView>
    );
};
