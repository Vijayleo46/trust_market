import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Image, Switch, Dimensions } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import Animated, { FadeInUp, FadeInRight } from 'react-native-reanimated';
import { useTheme } from '../theme/ThemeContext';
import { Typography } from '../components/common/Typography';
import { Button } from '../components/common/Button';
import {
    Settings,
    ChevronRight,
    ShoppingBag,
    Heart,
    Bell,
    ShieldCheck,
    LogOut,
    Moon,
    User,
    Star,
    Grid
} from 'lucide-react-native';
import { authService } from '../services/authService';
import { auth } from '../core/config/firebase';
import { listingService } from '../services/listingService';
import { userService } from '../services/userService';

const { width } = Dimensions.get('window');

export const ProfileScreen = ({ navigation }: any) => {
    const { theme, spacing, isDark, toggleTheme } = useTheme();
    const isFocused = useIsFocused();
    const user = auth.currentUser;
    const [userListingCount, setUserListingCount] = useState(0);
    const [userProfile, setUserProfile] = useState<any>(null);

    useEffect(() => {
        const fetchUserData = async () => {
            if (user && isFocused) {
                console.log('=== REFRESHING PROFILE DATA ===');
                try {
                    // Re-fetch everything to be safe
                    const [listings, profile] = await Promise.all([
                        listingService.getListingsByUser(user.uid),
                        userService.getProfile(user.uid)
                    ]);

                    setUserListingCount(listings.length);
                    if (profile) {
                        setUserProfile(profile);
                        console.log('✅ Profile synced with backend');
                    }
                } catch (error) {
                    console.error('❌ Sync error:', error);
                }
            }
        };
        fetchUserData();
    }, [user, isFocused]);

    // Use profile data from database if available, otherwise use Auth data
    const displayName = userProfile?.displayName || user?.displayName || 'User';
    const email = userProfile?.email || user?.email || '';
    const photoURL = userProfile?.photoURL || user?.photoURL || 'https://i.pravatar.cc/150?u=premium';
    const phone = userProfile?.phone || '';
    const location = userProfile?.location || '';
    const bio = userProfile?.bio || '';

    const MenuItem = ({ icon, label, rightElement, onPress, index }: any) => (
        <Animated.View entering={FadeInRight.delay(500 + index * 100)}>
            <TouchableOpacity
                style={[styles.menuItem, { backgroundColor: '#FFF' }]}
                onPress={onPress}
            >
                <View style={styles.menuLeft}>
                    <View style={styles.iconBackground}>
                        {icon}
                    </View>
                    <Typography variant="bodyMedium" style={{ marginLeft: 16, fontWeight: '600' }}>{label}</Typography>
                </View>
                {rightElement || <ChevronRight size={20} {...{ color: "#9CA3AF" } as any} />}
            </TouchableOpacity>
        </Animated.View>
    );

    return (
        <View style={[styles.container, { backgroundColor: '#F9FAFB' }]}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
                {/* Premium Header */}
                <View style={[styles.header, { paddingTop: 60, paddingHorizontal: 16, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#e8ebed' }]}>
                    <Typography variant="h1" style={{ fontSize: 28, fontWeight: '700', color: '#002f34' }}>Profile</Typography>
                    <TouchableOpacity
                        style={styles.settingsBtn}
                        onPress={() => navigation.navigate('Settings')}
                    >
                        <Settings size={22} color="#002f34" strokeWidth={2} />
                    </TouchableOpacity>
                </View>

                {/* Profile Identity */}
                <Animated.View entering={FadeInUp.delay(200)} style={styles.profileHero}>
                    <View style={styles.avatarGlow}>
                        <Image
                            key={photoURL}
                            source={{ uri: `${photoURL}${photoURL.includes('?') ? '&' : '?'}t=${Date.now()}` }}
                            style={styles.avatar}
                        />
                        <View style={styles.verifiedBadge}>
                            <ShieldCheck size={14} {...{ color: "#FFF" } as any} />
                        </View>
                    </View>

                    <View style={styles.userInfo}>
                        <Typography variant="h2" style={{ textAlign: 'center' }}>{displayName}</Typography>
                        <Typography variant="bodySmall" color="#9CA3AF" style={{ textAlign: 'center' }}>{email}</Typography>
                        {location && (
                            <Typography variant="bodySmall" color="#6366F1" style={{ textAlign: 'center', marginTop: 4 }}>
                                📍 {location}
                            </Typography>
                        )}
                        {bio && (
                            <Typography variant="bodySmall" color="#6B7280" style={{ textAlign: 'center', marginTop: 8, paddingHorizontal: 20 }}>
                                {bio}
                            </Typography>
                        )}
                    </View>
                </Animated.View>

                {/* Premium Stats bar */}
                <Animated.View entering={FadeInUp.delay(300)} style={styles.statsBar}>
                    <View style={styles.statItem}>
                        <Typography variant="h3">{userListingCount}</Typography>
                        <Typography variant="bodySmall" color="#9CA3AF">Listings</Typography>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Typography variant="h3">4.9</Typography>
                        <Typography variant="bodySmall" color="#9CA3AF">Rating</Typography>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Typography variant="h3">12</Typography>
                        <Typography variant="bodySmall" color="#9CA3AF">Sales</Typography>
                    </View>
                </Animated.View>

                {/* Menu Sections */}
                <View style={styles.menuSection}>
                    <Typography variant="label" color="#9CA3AF" style={styles.sectionTitle}>ACCOUNT</Typography>
                    <MenuItem
                        index={0}
                        icon={<User size={20} {...{ color: "#1F2937" } as any} />}
                        label="Edit Profile"
                        onPress={() => navigation.navigate('EditProfile')}
                    />
                    <MenuItem
                        index={1}
                        icon={<ShoppingBag size={20} {...{ color: "#1F2937" } as any} />}
                        label="My Listings"
                        onPress={() => navigation.navigate('MyListings')}
                    />
                    <MenuItem
                        index={2}
                        icon={<Heart size={20} {...{ color: "#1F2937" } as any} />}
                        label="Saved Items"
                        onPress={() => navigation.navigate('Wishlist')}
                    />
                </View>

                <View style={[styles.menuSection, { marginTop: 24 }]}>
                    <Typography variant="label" color="#9CA3AF" style={styles.sectionTitle}>PREFERENCES</Typography>
                    <MenuItem
                        index={3}
                        icon={<Moon size={20} {...{ color: "#1F2937" } as any} />}
                        label="Dark Mode"
                        rightElement={
                            <Switch
                                value={isDark}
                                onValueChange={toggleTheme}
                                trackColor={{ false: '#E5E7EB', true: '#1F2937' }}
                                thumbColor="#FFF"
                            />
                        }
                    />
                    <MenuItem
                        index={4}
                        icon={<ShieldCheck size={20} {...{ color: "#1F2937" } as any} />}
                        label="Get Verified (KYC)"
                        onPress={() => navigation.navigate('KYC')}
                    />
                    <MenuItem
                        index={5}
                        icon={<Grid size={20} {...{ color: "#1F2937" } as any} />}
                        label="Admin Dashboard"
                        onPress={() => navigation.navigate('AdminDashboard')}
                    />
                    <MenuItem
                        index={6}
                        icon={<Settings size={20} {...{ color: "#1F2937" } as any} />}
                        label="Populate Demo Data"
                        onPress={async () => {
                            try {
                                await listingService.seedDemoData();
                                alert('Demo data added! Check Home & My Listings.');
                            } catch (e) {
                                alert('Failed to seed data');
                            }
                        }}
                    />
                </View>

                <Animated.View entering={FadeInUp.delay(900)} style={{ paddingHorizontal: 24, marginTop: 40 }}>
                    <TouchableOpacity
                        style={styles.logoutBtn}
                        onPress={async () => {
                            try {
                                await authService.logout();
                            } catch (error) {
                                console.error('Logout failed:', error);
                            }
                        }}
                    >
                        <LogOut size={20} {...{ color: "#EF4444" } as any} />
                        <Typography variant="bodyMedium" style={{ marginLeft: 12, fontWeight: '700', color: '#EF4444' }}>Sign Out</Typography>
                    </TouchableOpacity>
                </Animated.View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 30,
    },
    settingsBtn: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#FFF',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
    },
    profileHero: {
        alignItems: 'center',
        marginBottom: 30,
    },
    avatarGlow: {
        position: 'relative',
        padding: 4,
        borderRadius: 55,
        backgroundColor: '#FFF',
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.1,
        shadowRadius: 15,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
    },
    verifiedBadge: {
        position: 'absolute',
        bottom: 5,
        right: 5,
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#3B82F6',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#FFF',
    },
    userInfo: {
        marginTop: 16,
    },
    statsBar: {
        flexDirection: 'row',
        backgroundColor: '#FFF',
        marginHorizontal: 24,
        paddingVertical: 20,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        marginBottom: 30,
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    statDivider: {
        width: 1,
        height: 30,
        backgroundColor: '#F3F4F6',
    },
    menuSection: {
        paddingHorizontal: 24,
    },
    sectionTitle: {
        marginBottom: 12,
        marginLeft: 4,
        letterSpacing: 1.5,
        fontSize: 11,
        fontWeight: '700',
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderRadius: 20,
        marginBottom: 10,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 5,
    },
    menuLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconBackground: {
        width: 40,
        height: 40,
        borderRadius: 14,
        backgroundColor: '#F9FAFB',
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoutBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 18,
        borderRadius: 20,
        backgroundColor: '#FFF',
        borderWidth: 1,
        borderColor: '#FEE2E2',
    },
});

