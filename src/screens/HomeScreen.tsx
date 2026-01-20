import React, { useEffect, useState } from 'react';
import { View, ScrollView, FlatList, TouchableOpacity, Image, Dimensions, TextInput, StatusBar } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTheme } from '../theme/ThemeContext';
import { Typography } from '../components/common/Typography';
import { ProductCard } from '../components/home/ProductCard';
import { Search, MapPin, Bell, Car, Home, Briefcase, Shirt, Wrench, Laptop, Smartphone, Palette } from 'lucide-react-native';
import { listingService } from '../services/listingService';
import { useIsFocused } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const CATEGORIES = [
    { id: '1', label: 'Cars', icon: Car },
    { id: '2', label: 'Properties', icon: Home },
    { id: '3', label: 'Mobiles', icon: Smartphone },
    { id: '4', label: 'Jobs', icon: Briefcase },
    { id: '5', label: 'Bikes', icon: Wrench },
    { id: '6', label: 'Electronics', icon: Laptop },
    { id: '7', label: 'Fashion', icon: Shirt },
    { id: '8', label: 'Hobbies', icon: Palette },
];

export const HomeScreen = ({ navigation }: any) => {
    const { theme } = useTheme();
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
        <View className="bg-gray-100/50 px-4 pb-4">
            <View className="flex-row justify-between items-center py-4">
                <View>
                    <Typography className="text-2xl font-black text-[#002f34] tracking-tight">VENDO</Typography>
                </View>
                <View className="flex-row items-center">
                    <View className="flex-row items-center mr-4">
                        <MapPin size={18} color="#002f34" />
                        <Typography className="text-sm font-bold ml-1 text-[#002f34]">
                            Kerala, India
                        </Typography>
                    </View>
                    <TouchableOpacity>
                        <Bell size={24} color="#002f34" />
                    </TouchableOpacity>
                </View>
            </View>

            <View className="flex-row items-center bg-white border-2 border-[#002f34] rounded-md px-3 h-12">
                <Search size={20} color="#002f34" />
                <TextInput
                    placeholder="Find Cars, Mobile Phones and more..."
                    placeholderTextColor="#4a7374"
                    className="flex-1 ml-2 text-sm text-[#002f34]"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
            </View>
        </View>
    );

    const renderCategories = () => (
        <View className="bg-white py-4">
            <View className="flex-row justify-between items-center px-4 mb-4">
                <Typography className="text-base font-bold text-[#002f34]">Browse categories</Typography>
                <TouchableOpacity>
                    <Typography className="text-sm font-bold text-[#002f34] underline">See all</Typography>
                </TouchableOpacity>
            </View>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 12 }}
            >
                {CATEGORIES.map((item) => (
                    <TouchableOpacity key={item.id} className="items-center w-20">
                        <View className="w-14 h-14 rounded-full bg-[#ebf1f3] justify-center items-center mb-2">
                            <item.icon size={24} color="#002f34" />
                        </View>
                        <Typography className="text-[11px] text-center font-medium text-gray-700">{item.label}</Typography>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );

    return (
        <SafeAreaView className="flex-1 bg-white" edges={['top']}>
            <StatusBar barStyle="dark-content" />
            <FlatList
                data={products}
                keyExtractor={(item) => item.id}
                numColumns={2}
                ListHeaderComponent={
                    <>
                        {renderHeader()}
                        {renderCategories()}
                        <View className="px-4 py-3 bg-gray-100/50">
                            <Typography className="text-base font-bold text-[#002f34]">Fresh recommendations</Typography>
                        </View>
                    </>
                }
                renderItem={({ item }) => (
                    <View className="flex-1 max-w-[50%] p-2">
                        <ProductCard
                            id={item.id}
                            title={item.title}
                            price={item.price}
                            image={item.image || (item.images && item.images[0]) || 'https://via.placeholder.com/200'}
                            location={item.location || 'Kerala'}
                            onPress={() => navigation.navigate('ProductDetails', { product: item })}
                        />
                    </View>
                )}
                contentContainerStyle={{ paddingBottom: 100 }}
                showsVerticalScrollIndicator={false}
            />
        </SafeAreaView>
    );
};
jobCardInner: {
    backgroundColor: '#FFF',
        borderRadius: 20,
            padding: 20,
                shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
        shadowRadius: 8,
            elevation: 2,
    },
jobHeader: {
    flexDirection: 'row',
        justifyContent: 'space-between',
            alignItems: 'center',
                marginBottom: 16,
    },
companyLogo: {
    width: 48,
        height: 48,
            borderRadius: 12,
                backgroundColor: '#F3F4F6',
                    justifyContent: 'center',
                        alignItems: 'center',
    },
jobBadge: {
    backgroundColor: '#EEF2FF',
        paddingHorizontal: 12,
            paddingVertical: 6,
                borderRadius: 8,
    },
jobBadgeText: {
    fontSize: 11,
        fontWeight: '700',
            color: '#6366F1',
    },
jobTitle: {
    marginBottom: 8,
        lineHeight: 22,
    },
jobFooter: {
    flexDirection: 'row',
        justifyContent: 'space-between',
            alignItems: 'center',
                marginTop: 12,
                    paddingTop: 12,
                        borderTopWidth: 1,
                            borderTopColor: '#F3F4F6',
    },
// Filter Modal Styles
modalOverlay: {
    flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'flex-end',
    },
modalContent: {
    backgroundColor: '#FFF',
        borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
                paddingTop: 20,
                    paddingBottom: 40,
                        maxHeight: '80%',
    },
modalHeader: {
    flexDirection: 'row',
        justifyContent: 'space-between',
            alignItems: 'center',
                paddingHorizontal: 24,
                    paddingBottom: 20,
                        borderBottomWidth: 1,
                            borderBottomColor: '#F3F4F6',
    },
filterSection: {
    paddingHorizontal: 24,
        paddingVertical: 20,
            borderBottomWidth: 1,
                borderBottomColor: '#F3F4F6',
    },
filterLabel: {
    fontSize: 16,
        fontWeight: '600',
            color: '#1F2937',
                marginBottom: 12,
    },
filterOptions: {
    flexDirection: 'row',
        flexWrap: 'wrap',
            gap: 8,
    },
filterChip: {
    paddingHorizontal: 16,
        paddingVertical: 8,
            borderRadius: 20,
                backgroundColor: '#F3F4F6',
                    borderWidth: 1,
                        borderColor: '#E5E7EB',
    },
filterChipActive: {
    backgroundColor: '#6366F1',
        borderColor: '#6366F1',
    },
filterChipText: {
    fontSize: 14,
        fontWeight: '500',
            color: '#6B7280',
    },
filterChipTextActive: {
    color: '#FFF',
    },
modalActions: {
    flexDirection: 'row',
        paddingHorizontal: 24,
            paddingTop: 20,
                gap: 12,
    },
resetButton: {
    flex: 1,
        paddingVertical: 14,
            borderRadius: 12,
                backgroundColor: '#F3F4F6',
                    alignItems: 'center',
    },
resetButtonText: {
    fontSize: 16,
        fontWeight: '600',
            color: '#6B7280',
    },
applyButton: {
    flex: 2,
        borderRadius: 12,
            overflow: 'hidden',
    },
applyGradient: {
    paddingVertical: 14,
        alignItems: 'center',
    },
applyButtonText: {
    fontSize: 16,
        fontWeight: '700',
            color: '#FFF',
    },
});
