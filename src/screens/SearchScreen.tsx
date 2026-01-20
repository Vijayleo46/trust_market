import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, FlatList, TouchableOpacity, TextInput, Dimensions, Image, StatusBar, ActivityIndicator, Platform } from 'react-native';
import Animated, { FadeInUp, FadeInRight, FadeIn } from 'react-native-reanimated';
import { useTheme } from '../theme/ThemeContext';
import { Typography } from '../components/common/Typography';
import { Search, Filter, Grid, List as ListIcon, X, Clock, ArrowUpRight } from 'lucide-react-native';
import { ProductCard } from '../components/ProductCard';
import { SafeAreaView } from 'react-native-safe-area-context';
import { listingService, Listing } from '../services/listingService';
import { auth } from '../core/config/firebase';


const { width } = Dimensions.get('window');

// Mock data for search suggestions - in a real app this would come from an API
const SUGGESTIONS = [
    'iPhone 13 Pro', 'MacBook Air', 'PS5 Console', 'Royal Enfield', 'Apartment in Kochi', 'Sofa Set'
];

export const SearchScreen = ({ navigation }: any) => {
    const { theme } = useTheme();
    const [searchQuery, setSearchQuery] = useState('');
    const [results, setResults] = useState<Listing[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [activeCategory, setActiveCategory] = useState<string | null>(null);

    // Focus input on mount
    const inputRef = React.useRef<TextInput>(null);

    useEffect(() => {
        // Optional: Auto-focus input after a short delay for smoother transition
        const timer = setTimeout(() => {
            inputRef.current?.focus();
        }, 100);
        return () => clearTimeout(timer);
    }, []);

    const handleSearch = async (text: string) => {
        setSearchQuery(text);
        if (text.length > 2) {
            setIsLoading(true);
            try {
                const searchResults = await listingService.searchListings(text);
                setResults(searchResults);
            } catch (error) {
                console.error('Search error:', error);
            } finally {
                setIsLoading(false);
            }
        } else {
            setResults([]);
        }
    };

    const renderSearchResult = ({ item, index }: { item: Listing; index: number }) => (
        <Animated.View
            entering={FadeInUp.delay(index * 50).springify()}
            style={{ width: '50%', padding: 6 }}
        >
            <ProductCard
                title={item.title}
                price={item.price}
                image={item.images?.[0] || 'https://via.placeholder.com/150'}
                location={item.location}
                onPress={() => navigation.navigate('ProductDetails', { product: item })}
            />
        </Animated.View>
    );

    return (
        <SafeAreaView edges={['top']} style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

            {/* Search Header */}
            <View style={styles.header}>
                <View style={styles.searchBarContainer}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <ArrowUpRight size={24} color="#002f34" style={{ transform: [{ rotate: '225deg' }] }} />
                    </TouchableOpacity>
                    <View style={styles.searchInputWrapper}>
                        <Search size={20} color="#002f34" strokeWidth={2} />
                        <TextInput
                            ref={inputRef}
                            style={styles.searchInput}
                            placeholder="Search for cars, guitars, property..."
                            placeholderTextColor="#7f9799"
                            value={searchQuery}
                            onChangeText={handleSearch}
                            selectionColor="#002f34"
                        />
                        {searchQuery.length > 0 && (
                            <TouchableOpacity onPress={() => handleSearch('')}>
                                <X size={20} color="#7f9799" />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </View>

            {/* Content */}
            <View style={styles.content}>
                {isLoading ? (
                    <View style={styles.centerContainer}>
                        <ActivityIndicator size="large" color="#002f34" />
                    </View>
                ) : searchQuery.length > 0 ? (
                    <FlatList
                        data={results}
                        renderItem={renderSearchResult}
                        keyExtractor={item => item.id || Math.random().toString()}
                        numColumns={2}
                        contentContainerStyle={styles.resultsList}
                        showsVerticalScrollIndicator={false}
                        ListEmptyComponent={
                            <View style={styles.centerContainer}>
                                <Typography style={styles.emptyText}>No results found for "{searchQuery}"</Typography>
                            </View>
                        }
                    />
                ) : (
                    <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
                        <View style={styles.suggestionContainer}>
                            <View style={styles.sectionHeader}>
                                <Typography style={styles.sectionTitle}>Popular Searches</Typography>
                            </View>
                            <View style={styles.chipsContainer}>
                                {SUGGESTIONS.map((item, index) => (
                                    <TouchableOpacity
                                        key={index}
                                        style={styles.chip}
                                        onPress={() => handleSearch(item)}
                                    >
                                        <Typography style={styles.chipText}>{item}</Typography>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {/* Recent Categories or other content could go here */}
                    </ScrollView>
                )}
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    header: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
        backgroundColor: '#FFFFFF',
    },
    searchBarContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    backButton: {
        padding: 4,
    },
    searchInputWrapper: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
        borderRadius: 12,
        paddingHorizontal: 12,
        height: 48,
    },
    searchInput: {
        flex: 1,
        marginLeft: 10,
        fontSize: 16,
        color: '#002f34',
        fontFamily: Platform.select({ ios: 'System', android: 'Roboto' }), // Ideally utilize a font from ThemeContext
        fontWeight: '500',
    },
    content: {
        flex: 1,
    },
    centerContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 40,
    },
    resultsList: {
        padding: 10,
    },
    emptyText: {
        fontSize: 16,
        color: '#6B7280',
        textAlign: 'center',
    },
    suggestionContainer: {
        padding: 24,
    },
    sectionHeader: {
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#002f34',
    },
    chipsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    chip: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        backgroundColor: '#F3F4F6',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    chipText: {
        color: '#4B5563',
        fontWeight: '600',
        fontSize: 14,
    },
});
