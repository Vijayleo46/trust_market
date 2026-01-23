import React, { useState, useEffect, useMemo } from 'react';
import { View, ScrollView, FlatList, TouchableOpacity, StatusBar, ActivityIndicator, Image, Dimensions, StyleSheet } from 'react-native';
import { Typography } from '../components/common/Typography';
import { Search, MapPin, Bell, Heart, Home, MessageCircle, User, Plus, ChevronLeft, Car, Smartphone, Briefcase, Settings, Mic, Star } from 'lucide-react-native';
import { listingService, Listing } from '../services/listingService';
import { useIsFocused } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { View as MotiView, AnimatePresence } from 'moti';
import { ProductCard } from '../components/ProductCard';
import { auth } from '../core/config/firebase';
import { userService, UserProfile } from '../services/userService';

const OLX_TEAL = '#002f34';
const PLACEHOLDERS = ['cars', 'jobs', 'mobiles', 'properties', 'everything'];

const CATEGORIES = [
  { id: '1', label: 'All', value: 'All', icon: Home },
  { id: '2', label: 'Cars', value: 'Vehicles', icon: Car },
  { id: '3', label: 'Properties', value: 'Real Estate', icon: Home },
  { id: '4', label: 'Mobile', value: 'Mobiles', icon: Smartphone },
  { id: '5', label: 'Jobs', value: 'Jobs', icon: Briefcase },
  { id: '6', label: 'Services', value: 'Services', icon: Settings },
];

export const HomeScreen = ({ navigation }: any) => {
  const isFocused = useIsFocused();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const { width } = Dimensions.get('window');

  const [activeCategory, setActiveCategory] = useState('All');
  const [location, setLocation] = useState('Panampilly Nagar, Kochi');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);



  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % PLACEHOLDERS.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchUserProfile = async () => {
      const user = auth.currentUser;
      if (user) {
        try {
          const profile = await userService.getProfile(user.uid);
          if (profile) {
            setUserProfile(profile);
          }
        } catch (error) {
          console.error("Error fetching user profile", error);
        }
      }
    };

    if (isFocused) {
      fetchUserProfile();
    }
  }, [isFocused]);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        setLoading(true);
        let allListings = await listingService.getFeaturedListings(60);

        if (allListings.length === 0) {
          await listingService.seedDemoData();
          allListings = await listingService.getFeaturedListings(60);
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

  const sections = useMemo(() => {
    const products = listings.filter(l => l.type !== 'job');
    const jobs = listings.filter(l => l.type === 'job');

    const filterByCat = (items: Listing[]) => {
      if (activeCategory === 'All') return items;
      return items.filter(l =>
        l.category === activeCategory ||
        (activeCategory === 'Vehicles' && l.category === 'Vehicles') ||
        (activeCategory === 'Real Estate' && l.category === 'Real Estate')
      );
    };

    const productsWithAds = [...products];
    // Inject Mock Ads
    const ad1: any = {
      id: 'ad-1',
      title: 'Upgrade to Premium Insurance',
      price: 'Ad',
      location: 'Sponsored',
      images: ['https://images.unsplash.com/photo-1556742502-ec7c0e9f34b1?auto=format&fit=crop&w=500&q=80'],
      isAd: true
    };
    const ad2: any = {
      id: 'ad-2',
      title: 'Google Pixel 8 - Sale Live',
      price: 'Ad',
      location: 'Sponsored',
      images: ['https://images.unsplash.com/photo-1598327105666-5b89351aff23?auto=format&fit=crop&w=500&q=80'],
      isAd: true
    };
    if (productsWithAds.length > 2) productsWithAds.splice(2, 0, ad1);
    if (productsWithAds.length > 6) productsWithAds.splice(6, 0, ad2);

    return {
      products: filterByCat(productsWithAds).slice(0, 10),
      jobs: filterByCat(jobs).slice(0, 10),
      all: filterByCat(listings)
    };
  }, [listings, activeCategory]);

  const renderSectionHeader = (title: string, onSeeAll?: () => void) => (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 32, paddingBottom: 12 }}>
      <Typography style={{ color: '#002f34', fontSize: 20, fontWeight: '900', textTransform: 'uppercase', letterSpacing: -0.5 }}>
        {title}
      </Typography>
      {onSeeAll && (
        <TouchableOpacity onPress={onSeeAll}>
          <Typography style={{ color: '#002f34', fontSize: 14, fontWeight: '700', opacity: 0.6 }}>See All</Typography>
        </TouchableOpacity>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FAFAFA' }}>
        <ActivityIndicator color={OLX_TEAL} size="large" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#FAFAFA' }}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: '#FFFFFF' }} />
      <StatusBar barStyle="dark-content" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* Header */}
        <View style={{ backgroundColor: '#FFFFFF', paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <Typography style={{ fontSize: 28, fontWeight: '900', color: '#002f34', letterSpacing: -1 }}>Vendo</Typography>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>

              <TouchableOpacity onPress={() => navigation.navigate('Wishlist')}>
                <Heart size={24} color="#0F172A" />
              </TouchableOpacity>
              <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF7ED', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, borderWidth: 1, borderColor: '#FFEDD5' }}>
                <Star size={16} color="#F59E0B" fill="#F59E0B" />
                <Typography style={{ marginLeft: 4, fontSize: 13, fontWeight: '800', color: '#B45309' }}>{userProfile?.coins || 0}</Typography>
              </TouchableOpacity>
              <TouchableOpacity>
                <Bell size={24} color="#0F172A" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => navigation.navigate('ProfileTab')}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: '#F1F5F9',
                  overflow: 'hidden',
                  borderWidth: 1,
                  borderColor: '#E2E8F0'
                }}
              >
                <Image
                  key={userProfile?.photoURL || auth.currentUser?.photoURL}
                  source={{
                    uri: (userProfile?.photoURL || auth.currentUser?.photoURL || 'https://i.pravatar.cc/150?u=default')
                      + (userProfile?.photoURL || auth.currentUser?.photoURL ? `?t=${Date.now()}` : '')
                  }}
                  style={{ width: '100%', height: '100%' }}
                />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center' }}>
            <MapPin size={18} color={OLX_TEAL} />
            <Typography style={{ color: '#0F172A', fontSize: 14, fontWeight: '700', marginLeft: 6 }}>{location}</Typography>
            <View style={{ transform: [{ rotate: '90deg' }], marginLeft: 4 }}>
              <ChevronLeft size={14} color="#0F172A" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Search Bar - Premium Glass Effect */}
        <View style={{ paddingHorizontal: 16, paddingVertical: 12 }}>
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => navigation.navigate('SearchTab')}
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 16,
              padding: 16,
              flexDirection: 'row',
              alignItems: 'center',
              borderWidth: 1.5,
              borderColor: '#002f34',
              shadowColor: '#002f34',
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.1,
              shadowRadius: 15,
              elevation: 6
            }}
          >
            <Search size={22} color={OLX_TEAL} strokeWidth={2.5} />
            <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 12, flex: 1 }}>
              <Typography style={{ color: '#94A3B8', fontSize: 16, fontWeight: '600', fontStyle: 'italic' }}>Find </Typography>
              <AnimatePresence exitBeforeEnter>
                <MotiView
                  key={placeholderIndex}
                  from={{ opacity: 0, translateY: 10 }}
                  animate={{ opacity: 1, translateY: 0 }}
                  exit={{ opacity: 0, translateY: -10 }}
                  transition={{ type: 'timing', duration: 400 }}
                >
                  <Typography style={{ color: '#94A3B8', fontSize: 16, fontWeight: '600', fontStyle: 'italic' }}>
                    {PLACEHOLDERS[placeholderIndex]}...
                  </Typography>
                </MotiView>
              </AnimatePresence>
            </View>
            <View style={{ paddingLeft: 12 }}>
              <Mic size={22} color={OLX_TEAL} strokeWidth={2.5} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Categories */}
        <View style={{ backgroundColor: '#FFFFFF', paddingBottom: 16, overflow: 'visible' }}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16, gap: 12, paddingVertical: 10 }}
            style={{ overflow: 'visible' }}
          >
            {CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat.value;
              const Icon = cat.icon;
              return (
                <TouchableOpacity
                  key={cat.id}
                  onPress={() => setActiveCategory(cat.value)}
                  style={{ alignItems: 'center', width: 70 }}
                >
                  <MotiView
                    from={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: isActive ? 1.1 : 1, opacity: 1 }}
                    style={{
                      width: 60,
                      height: 60,
                      borderRadius: 30,
                      backgroundColor: isActive ? '#002f34' : '#F8FAFB',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: 6,
                      borderWidth: 1,
                      borderColor: isActive ? '#002f34' : '#F1F5F9',
                      shadowColor: isActive ? '#002f34' : '#000',
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: isActive ? 0.2 : 0.05,
                      shadowRadius: 8,
                      elevation: isActive ? 4 : 1
                    }}
                  >
                    <Icon size={24} color={isActive ? '#FFFFFF' : '#002f34'} />
                  </MotiView>
                  <Typography style={{ fontSize: 10, fontWeight: '800', color: isActive ? '#002f34' : '#64748B', textAlign: 'center' }}>
                    {cat.label}
                  </Typography>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>



        {/* Jobs Section */}
        {sections.jobs.length > 0 && (activeCategory === 'All' || activeCategory === 'Jobs') && (
          <View>
            {renderSectionHeader('Premium Jobs', () => console.log('See All Jobs'))}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
            >
              {sections.jobs.map((item, index) => (
                <MotiView
                  key={item.id}
                  from={{ opacity: 0, translateX: 50 }}
                  animate={{ opacity: 1, translateX: 0 }}
                  transition={{ type: 'spring', delay: index * 100 }}
                  style={{ width: 180 }}
                >
                  <ProductCard
                    title={item.title}
                    price={item.price}
                    image={item.images[0]}
                    location={item.location}
                    type="job"
                    onPress={() => navigation.navigate('ProductDetails', { product: item })}
                  />
                </MotiView>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Products Section */}
        {sections.products.length > 0 && (activeCategory === 'All' || activeCategory !== 'Jobs') && (
          <View>
            {renderSectionHeader('Fresh Recommendations', () => console.log('See All Products'))}
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', paddingHorizontal: 16 }}>
              {sections.products.map((item, index) => (
                <MotiView
                  key={item.id}
                  from={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: 'spring', delay: index * 150 }}
                  style={{ width: '48%' }}
                >
                  <ProductCard
                    {...item}
                    image={item.images[0]}
                    isAd={item.isAd}
                    onPress={() => item.isAd ? console.log('Ad Clicked') : navigation.navigate('ProductDetails', { product: item })}
                  />
                </MotiView>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

    </View>
  );
};
