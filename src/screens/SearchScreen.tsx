import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, FlatList, TouchableOpacity, TextInput, Dimensions, Image } from 'react-native';
import Animated, { FadeInUp, FadeInRight, FadeIn } from 'react-native-reanimated';
import { useTheme } from '../theme/ThemeContext';
import { Typography } from '../components/common/Typography';
import { Search, Filter, Grid, List as ListIcon, X, Clock, ArrowUpRight } from 'lucide-react-native';
import { ProductCard } from '../components/home/ProductCard';
import { listingService, Listing } from '../services/listingService';
import { auth } from '../core/config/firebase';

const { width } = Dimensions.get('window');

const RECENT_SEARCHES = ['Apple Watch Series 7', 'Sony WH-1000XM5', 'MacBook Air M2', 'Gaming Chair'];

export const SearchScreen = ({ navigation, route }: any) => {
    const { theme } = useTheme();
    const [searchQuery, setSearchQuery] = useState('');
    const [results, setResults] = useState<Listing[]>([]);
    const [trending, setTrending] = useState<Listing[]>([]);
    const [loading, setLoading] = useState(false);

    // Derived state for mode
    const isSearching = searchQuery.length > 0;

    useEffect(() => {
        // Fetch trending products on mount
        const loadTrending = async () => {
            try {
                const data = await listingService.getTrendingListings(8); // Get more trending items
                setTrending(data);
                console.log('🔥 Loaded trending products:', data.length);
            } catch (error) {
                console.error('❌ Failed to load trending products:', error);
            }
        };
        loadTrending();
    }, []);

    useEffect(() => {
        if (!isSearching) {
            setResults([]);
            return;
        }

        const fetchResults = async () => {
            setLoading(true);
            try {
                console.log('🔍 Searching for:', searchQuery);
                const data = await listingService.searchListings(searchQuery);
                setResults(data);
                console.log('✅ Search results:', data.length, 'items found');
            } catch (error) {
                console.error('❌ Search failed:', error);
            } finally {
                setLoading(false);
            }
        };

        const timeout = setTimeout(fetchResults, 500);
        return () => clearTimeout(timeout);
    }, [searchQuery]);

    const renderRecentSearches = () => (
        <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
                <Typography variant="bodyMedium" style={styles.sectionTitle}>Recent Searches</Typography>
                <TouchableOpacity onPress={() => { }}>
                    <Typography variant="bodySmall" style={styles.clearText}>Clear</Typography>
                </TouchableOpacity>
            </View>
            <View>
                {RECENT_SEARCHES.map((item, index) => (
                    <TouchableOpacity
                        key={index}
                        style={styles.recentItem}
                        onPress={() => setSearchQuery(item)}
                    >
                        <View style={styles.recentLeft}>
                            <Clock size={16} color="#9CA3AF" />
                            <Typography style={styles.recentText}>{item}</Typography>
                        </View>
                        <X size={16} color="#D1D5DB" />
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );

    const renderTrending = () => (
        <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
                <Typography variant="bodyMedium" style={styles.sectionTitle}>Trending Now</Typography>
                <TouchableOpacity>
                    <ArrowUpRight size={18} color="#6366F1" />
                </TouchableOpacity>
            </View>
            <View style={styles.trendingGrid}>
                {trending.map((item, index) => (
                    <Animated.View
                        key={item.id || index}
                        entering={FadeInUp.delay(index * 100)}
                        style={styles.trendingCardWrapper}
                    >
                        <ProductCard
                            title={item.title}
                            price={item.price}
                            seller={item.sellerName || 'Unknown'} // Corrected to match Listing interface
                            rating={item.rating || 4.5}
                            image={item.images?.[0] || 'https://via.placeholder.com/150'} // Corrected for Listing interface
                            onPress={() => navigation.navigate('ProductDetails', { product: item })}
                        />
                    </Animated.View>
                ))}
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            {/* Header Area */}
            <View style={[styles.header, { paddingTop: 60, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#e8ebed' }]}>
                <View style={styles.searchContainer}>
                    <Search size={22} color="#002f34" strokeWidth={2} style={styles.searchIcon} />
                    <TextInput
                        style={styles.input}
                        placeholder="Find Cars, Mobile Phones and more..."
                        placeholderTextColor="#7f9799"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        autoCapitalize="none"
                    />
                    {isSearching && (
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                            <X size={20} color="#002f34" />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {!isSearching ? (
                    <Animated.View entering={FadeIn}>
                        {renderRecentSearches()}
                        {renderTrending()}
                    </Animated.View>
                ) : (
                    <View style={styles.resultsContainer}>
                        <Typography variant="bodySmall" color="#6B7280" style={{ marginBottom: 16 }}>
                            {loading ? 'Searching...' : `Found ${results.length} results`}
                        </Typography>

                        <View style={styles.trendingGrid}>
                            {results.map((item, index) => (
                                <Animated.View
                                    key={item.id || index}
                                    entering={FadeInUp.delay(index * 50)}
                                    style={styles.trendingCardWrapper}
                                >
                                    <ProductCard
                                        title={item.title}
                                        price={item.price}
                                        seller={item.sellerName || 'Unknown'}
                                        rating={item.rating || 0}
                                        image={item.images?.[0] || 'https://via.placeholder.com/150'}
                                        onPress={() => navigation.navigate('ProductDetails', { product: item })}
                                    />
                                </Animated.View>
                            ))}
                        </View>
                    </View>
                )}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    header: {
        paddingHorizontal: 24,
        paddingBottom: 16,
        backgroundColor: '#FFFFFF',
        // Optional: faint border bottom
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        height: 56,
        borderRadius: 16,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    searchIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: '#111827',
        fontWeight: '500',
    },
    scrollContent: {
        paddingTop: 24,
        paddingBottom: 40,
    },
    sectionContainer: {
        marginBottom: 32,
        paddingHorizontal: 24,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
    },
    clearText: {
        color: '#6B7280',
        fontWeight: '600',
    },
    recentItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F9FAFB',
    },
    recentLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    recentText: {
        marginLeft: 12,
        color: '#4B5563',
        fontSize: 15,
    },
    trendingGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    trendingCardWrapper: {
        width: '48%',
        marginBottom: 16,
    },
    resultsContainer: {
        paddingHorizontal: 24,
    }
});
