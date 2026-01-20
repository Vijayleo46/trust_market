import React, { useState, useEffect, useMemo } from 'react';
import { View, ScrollView, FlatList, TouchableOpacity, StatusBar, ActivityIndicator, Image } from 'react-native';
import { Typography } from '../components/common/Typography';
import { Search, MapPin, Bell, Heart, Home, MessageCircle, User, Plus } from 'lucide-react-native';
import { listingService, Listing } from '../services/listingService';
import { useIsFocused } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

const PRIMARY_PURPLE = '#9D8BFF';
const BG_COLOR = '#F5F5F5';

const CATEGORIES = [
  { id: '1', label: 'All Items', value: 'All' },
  { id: '2', label: 'Vehicles', value: 'Vehicles' },
  { id: '3', label: 'Properties', value: 'Properties' },
];

export const HomeScreen = ({ navigation }: any) => {
  const isFocused = useIsFocused();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {
    const fetchListings = async () => {
      try {
        setLoading(true);
        let allListings = await listingService.getFeaturedListings(40);

        // Auto-seed if empty
        if (allListings.length === 0) {
          console.log("No listings found, seeding demo data...");
          await listingService.seedDemoData();
          allListings = await listingService.getFeaturedListings(40);
        }

        setListings(allListings);
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

  const filteredListings = useMemo(() => {
    let items = listings;
    if (activeCategory !== 'All') {
      items = items.filter((l: Listing) =>
        l.category === activeCategory ||
        (activeCategory === 'Vehicles' && l.category === 'Vehicles') ||
        (activeCategory === 'Properties' && l.category === 'Real Estate')
      );
    }
    return items;
  }, [listings, activeCategory]);

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: BG_COLOR }}>
        <ActivityIndicator color={PRIMARY_PURPLE} size="large" />
        <Typography style={{ marginTop: 16, color: '#6B7280', fontWeight: '600', fontSize: 14 }}>Loading...</Typography>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: BG_COLOR }}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: '#FFFFFF' }} />
      <StatusBar barStyle="dark-content" />

      <FlatList
        data={filteredListings}
        keyExtractor={(item) => item.id || Math.random().toString()}
        numColumns={2}
        ListHeaderComponent={
          <>
            {/* Header */}
            <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 16, backgroundColor: '#FFFFFF' }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <Typography style={{ fontSize: 28, fontWeight: '900', color: '#002f34', letterSpacing: -0.5 }}>Vendo</Typography>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <TouchableOpacity onPress={() => navigation.navigate('SearchTab')}>
                    <Search size={24} color="#0F172A" strokeWidth={2} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => console.log('Notifications')}>
                    <Bell size={24} color="#0F172A" strokeWidth={2} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Categories */}
            <View style={{ paddingBottom: 16, paddingHorizontal: 20, backgroundColor: '#FFFFFF' }}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 10 }}
              >
                {CATEGORIES.map((cat) => {
                  const isActive = activeCategory === cat.value;
                  return (
                    <TouchableOpacity
                      key={cat.id}
                      onPress={() => setActiveCategory(cat.value)}
                      style={{
                        paddingHorizontal: 20,
                        paddingVertical: 10,
                        borderRadius: 24,
                        backgroundColor: isActive ? '#1F2937' : '#F3F4F6',
                      }}
                    >
                      <Typography style={{
                        fontWeight: '600',
                        fontSize: 14,
                        color: isActive ? '#FFFFFF' : '#4B5563',
                      }}>
                        {cat.label}
                      </Typography>
                    </TouchableOpacity>
                  );
                })}
                <TouchableOpacity
                  style={{
                    paddingHorizontal: 20,
                    paddingVertical: 10,
                    borderRadius: 24,
                    backgroundColor: PRIMARY_PURPLE,
                  }}
                >
                  <Typography style={{ fontWeight: '600', fontSize: 14, color: '#FFFFFF' }}>
                    See All
                  </Typography>
                </TouchableOpacity>
              </ScrollView>
            </View>

            {/* Promo Banner */}
            <View style={{ paddingHorizontal: 20, paddingBottom: 16, backgroundColor: '#FFFFFF' }}>
              <View style={{ borderRadius: 16, overflow: 'hidden', height: 128 }}>
                <LinearGradient
                  colors={['#2D3748', '#1A202C']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{ flex: 1, padding: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <View style={{ flex: 1 }}>
                    <View style={{ backgroundColor: '#F97316', alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, marginBottom: 8 }}>
                      <Typography style={{ color: '#FFFFFF', fontSize: 10, fontWeight: '700' }}>PROMO</Typography>
                    </View>
                    <Typography style={{ color: '#FFFFFF', fontSize: 20, fontWeight: '900', marginBottom: 4 }}>Summer Sale</Typography>
                    <Typography style={{ color: '#D1D5DB', fontSize: 12 }}>on all electronics</Typography>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Typography style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '600', marginBottom: 8 }}>Up Up 50% off</Typography>
                    <TouchableOpacity style={{ backgroundColor: '#FFFFFF', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 }}>
                      <Typography style={{ color: '#1F2937', fontWeight: '700', fontSize: 12 }}>Shop Now</Typography>
                    </TouchableOpacity>
                  </View>
                </LinearGradient>
              </View>
            </View>

            {/* Featured Title */}
            <View style={{ paddingHorizontal: 20, paddingBottom: 12, paddingTop: 8, backgroundColor: '#FFFFFF' }}>
              <Typography style={{ fontSize: 20, fontWeight: '900', color: '#0F172A' }}>Featured</Typography>
            </View>
          </>
        }
        renderItem={({ item }) => (
          <View style={{ flex: 1, maxWidth: '50%', paddingHorizontal: 6, paddingVertical: 6 }}>
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => navigation.navigate('ProductDetails', { product: item })}
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 16,
                overflow: 'hidden',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 8,
                elevation: 2,
              }}
            >
              <View style={{ position: 'relative' }}>
                <View style={{ width: '100%', height: 160, backgroundColor: '#F3F4F6' }}>
                  <Image
                    source={{ uri: item.images?.[0] || 'https://picsum.photos/200/300' }}
                    style={{ width: '100%', height: '100%' }}
                    resizeMode="cover"
                  />
                </View>
                <TouchableOpacity
                  style={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    width: 32,
                    height: 32,
                    backgroundColor: '#FFFFFF',
                    borderRadius: 16,
                    alignItems: 'center',
                    justifyContent: 'center',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.1,
                    shadowRadius: 2,
                  }}
                >
                  <Heart size={16} color="#9CA3AF" strokeWidth={2} />
                </TouchableOpacity>
              </View>
              <View style={{ padding: 12 }}>
                <Typography style={{ fontSize: 14, fontWeight: '700', color: '#0F172A', marginBottom: 2 }} numberOfLines={2}>
                  {item.title}
                </Typography>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                  <MapPin size={10} color="#9CA3AF" strokeWidth={2} />
                  <Typography style={{ fontSize: 10, color: '#9CA3AF', marginLeft: 4 }} numberOfLines={1}>
                    {item.location || 'Kochi'}
                  </Typography>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 80, paddingHorizontal: 40 }}>
            <Typography style={{ color: '#9CA3AF', textAlign: 'center', fontWeight: '500' }}>
              No listings available
            </Typography>
          </View>
        }
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        style={{ backgroundColor: '#FFFFFF' }}
      />


    </View>
  );
};
