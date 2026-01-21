import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Image, Dimensions, TextInput, ActivityIndicator } from 'react-native';
import Animated, { FadeInUp, FadeInRight } from 'react-native-reanimated';
import { useTheme } from '../theme/ThemeContext';
import { Typography } from '../components/common/Typography';
import { Search, MoreHorizontal, MessageSquare, Bell } from 'lucide-react-native';
import { chatService, ChatThread } from '../services/chatService';
import { userService } from '../services/userService';
import { auth } from '../core/config/firebase';
import { onAuthStateChanged } from 'firebase/auth';

const { width } = Dimensions.get('window');

const ChatListItem = ({ item, index, navigation }: { item: ChatThread, index: number, navigation: any }) => {
    const [otherProfile, setOtherProfile] = useState<any>(null);
    const otherUserId = item.participants.find(id => id !== auth.currentUser?.uid);

    useEffect(() => {
        if (otherUserId) {
            userService.getProfile(otherUserId).then(profile => {
                if (profile) setOtherProfile(profile);
            });
        }
    }, [otherUserId]);

    const title = otherProfile?.displayName || item.participantDetails?.[otherUserId || '']?.name || 'Chat';
    const avatar = otherProfile?.photoURL || item.participantDetails?.[otherUserId || '']?.avatar || 'https://i.pravatar.cc/150?u=default';
    const time = item.lastMessageAt ? new Date(item.lastMessageAt.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now';

    return (
        <Animated.View entering={FadeInRight.delay(index * 50 + 100).springify()}>
            <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => navigation.navigate('ChatRoom', {
                    chatId: item.id,
                    otherName: title,
                    otherAvatar: avatar,
                    productTitle: item.listingTitle,
                    productImage: item.participantDetails?.[otherUserId || '']?.avatar || '', // Fallback or fetch from listing
                    productId: item.listingId,
                })}
                style={styles.chatCard}
            >
                <View style={styles.avatarContainer}>
                    <Image source={{ uri: avatar }} style={styles.avatar} />
                    <View style={styles.onlineIndicator} />
                </View>

                <View style={styles.cardContent}>
                    <View style={styles.cardTopRow}>
                        <Typography variant="bodyMedium" style={{ fontWeight: '600', fontSize: 16, color: '#000' }}>
                            {title}
                        </Typography>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            {item.listingTitle && (
                                <Typography variant="bodySmall" style={{ fontSize: 10, color: '#6366F1', marginRight: 8, fontStyle: 'italic' }}>
                                    {item.listingTitle}
                                </Typography>
                            )}
                            <Typography variant="bodySmall" style={{ fontSize: 12, color: '#8E8E93' }}>
                                {time}
                            </Typography>
                        </View>
                    </View>

                    <Typography variant="bodySmall" color="#8E8E93" numberOfLines={1} style={{ marginTop: 2, fontSize: 14 }}>
                        {item.lastMessage || "Tap to start chatting"}
                    </Typography>
                </View>
            </TouchableOpacity>
        </Animated.View>
    );
};

export const ChatScreen = ({ navigation }: any) => {
    const { theme, spacing, isDark } = useTheme();
    const [chats, setChats] = useState<ChatThread[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState<'products' | 'jobs'>('products');

    useEffect(() => {
        console.log('=== CHAT SCREEN INITIALIZING ===');

        const initializeSubscription = (user: any) => {
            if (!user) {
                console.log('❌ No user logged in for chat subscription');
                setChats([]);
                setLoading(false);
                return;
            }

            console.log('✅ User ready for chat subscription:', user.uid);
            setLoading(true);

            return chatService.subscribeToUserChats(user.uid, (data) => {
                console.log('=== CHATS RECEIVED ===');
                console.log('Total chats:', data.length);
                setChats(data);
                setLoading(false);
            });
        };

        // First attempt with current user
        let currentUnsubscribe = initializeSubscription(auth.currentUser);

        // Also listen for auth state changes to catch delayed initialization
        const authUnsubscribe = onAuthStateChanged(auth, (user) => {
            console.log('Auth state changed in ChatScreen:', user?.uid);
            if (currentUnsubscribe) currentUnsubscribe();
            currentUnsubscribe = initializeSubscription(user);
        });

        return () => {
            console.log('Cleaning up chat subscriptions');
            if (currentUnsubscribe) currentUnsubscribe();
            authUnsubscribe();
        };
    }, []);

    // Separate chats by type (based on chat metadata or listing type)
    const productChats = chats.filter(chat => {
        return !chat.jobRelated;
    });

    const jobChats = chats.filter(chat => {
        return chat.jobRelated === true;
    });

    console.log('Product chats:', productChats.length);
    console.log('Job chats:', jobChats.length);

    const currentChats = activeTab === 'products' ? productChats : jobChats;

    const filteredChats = currentChats.filter(chat => {
        const otherUserId = chat.participants.find(id => id !== auth.currentUser?.uid);
        const otherUser = chat.participantDetails?.[otherUserId || ''];
        if (!otherUser) return true; // Show it anyway if we can't find details
        return otherUser.name.toLowerCase().includes(searchQuery.toLowerCase());
    });

    return (
        <View style={[styles.container, { backgroundColor: '#FFFFFF' }]}>
            {/* WhatsApp Style Header */}
            <View style={styles.header}>
                <Typography variant="h1" style={{ fontSize: 24, fontWeight: '700', color: '#002f34' }}>
                    Chats
                </Typography>
            </View>

            {/* Premium Search Bar */}
            <View style={styles.searchContainer}>
                <View style={styles.searchInner}>
                    <Search size={18} color="#94A3B8" strokeWidth={2.5} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search chats"
                        placeholderTextColor="#94A3B8"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>
            </View>

            {/* Tab Selector - Chats/Groups Style */}
            <View style={styles.tabContainer}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'products' && styles.activeTab]}
                    onPress={() => setActiveTab('products')}
                >
                    <Typography
                        variant="bodyMedium"
                        style={[
                            styles.tabText,
                            activeTab === 'products' && styles.activeTabText
                        ]}
                    >
                        Products
                    </Typography>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'jobs' && styles.activeTab]}
                    onPress={() => setActiveTab('jobs')}
                >
                    <Typography
                        variant="bodyMedium"
                        style={[
                            styles.tabText,
                            activeTab === 'jobs' && styles.activeTabText
                        ]}
                    >
                        Jobs
                    </Typography>
                </TouchableOpacity>
            </View>

            {loading ? (
                <View style={[styles.emptyContainer, { marginTop: 100 }]}>
                    <ActivityIndicator size="large" color="#002f34" />
                    <Typography style={{ marginTop: 16, color: '#6B7280' }}>Loading chats...</Typography>
                </View>
            ) : (
                <FlatList
                    data={filteredChats}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={{ paddingBottom: 100 }}
                    ListEmptyComponent={
                        <Animated.View entering={FadeInUp.delay(300)} style={styles.emptyContainer}>
                            <View style={styles.emptyIconCircle}>
                                <MessageSquare size={40} {...{ color: "#9CA3AF" } as any} />
                            </View>
                            <Typography variant="h3" color="#1F2937" style={{ marginTop: 20 }}>
                                No {activeTab} chats yet
                            </Typography>
                            <Typography variant="bodyMedium" color="#9CA3AF" style={{ textAlign: 'center', marginTop: 8 }}>
                                Your conversations about {activeTab} will appear here.
                            </Typography>
                        </Animated.View>
                    }
                    renderItem={({ item, index }) => (
                        <ChatListItem item={item} index={index} navigation={navigation} />
                    )}
                />
            )}
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
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 16,
        backgroundColor: '#FFFFFF',
    },
    headerIcon: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
    },
    notifBadge: {
        position: 'absolute',
        top: 12,
        right: 12,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#EF4444',
    },
    tabContainer: {
        flexDirection: 'row',
        marginHorizontal: 20,
        marginBottom: 16,
        backgroundColor: '#F3F4F6',
        borderRadius: 12,
        padding: 4,
    },
    tab: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: 8,
    },
    activeTab: {
        backgroundColor: '#FFFFFF',
    },
    tabText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#6B7280',
    },
    activeTabText: {
        color: '#002f34',
    },
    searchContainer: {
        paddingHorizontal: 20,
        marginBottom: 16,
    },
    searchInner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
        height: 48,
        borderRadius: 16,
        paddingHorizontal: 16,
        borderWidth: 1.5,
        borderColor: '#F3F4F6',
    },
    searchInput: {
        flex: 1,
        marginLeft: 12,
        fontSize: 15,
        color: '#002f34',
        fontWeight: '500',
    },
    chatCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 16,
        paddingVertical: 12,
        marginHorizontal: 0,
        borderBottomWidth: 0.5,
        borderBottomColor: '#F3F4F6',
    },
    avatarContainer: {
        position: 'relative',
        marginRight: 12,
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#F3F4F6',
    },
    onlineIndicator: {
        position: 'absolute',
        bottom: 2,
        right: 2,
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#22C55E',
        borderWidth: 2,
        borderColor: '#FFFFFF',
    },
    cardContent: {
        flex: 1,
    },
    cardTopRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    unreadDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#002f34',
        marginLeft: 8,
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: 80,
    },
    emptyIconCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
    },
});
