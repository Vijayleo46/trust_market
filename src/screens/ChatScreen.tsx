import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Image, Dimensions, TextInput } from 'react-native';
import Animated, { FadeInUp, FadeInRight } from 'react-native-reanimated';
import { useTheme } from '../theme/ThemeContext';
import { Typography } from '../components/common/Typography';
import { Search, MoreHorizontal, MessageSquare, Bell } from 'lucide-react-native';
import { chatService, ChatThread } from '../services/chatService';
import { auth } from '../core/config/firebase';

const { width } = Dimensions.get('window');

export const ChatScreen = ({ navigation }: any) => {
    const { theme, spacing, isDark } = useTheme();
    const [chats, setChats] = useState<ChatThread[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState<'products' | 'jobs'>('products');

    useEffect(() => {
        console.log('=== CHAT SCREEN MOUNTED ===');
        const user = auth.currentUser;
        
        if (!user) {
            console.log('❌ No user logged in');
            setLoading(false);
            return;
        }

        console.log('✅ User logged in:', user.uid, user.displayName);
        console.log('Subscribing to chats...');
        
        const unsubscribe = chatService.subscribeToUserChats(user.uid, (data) => {
            console.log('=== CHATS RECEIVED ===');
            console.log('Total chats:', data.length);
            data.forEach((chat, index) => {
                console.log(`Chat ${index + 1}:`, {
                    id: chat.id,
                    participants: chat.participants,
                    lastMessage: chat.lastMessage,
                    jobRelated: chat.jobRelated,
                    listingType: chat.listingType,
                    listingTitle: chat.listingTitle
                });
            });
            setChats(data);
            setLoading(false);
        });

        return () => {
            console.log('Unsubscribing from chats');
            unsubscribe();
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
        const otherUser = chat.participantDetails
            ? (Object.values(chat.participantDetails) as { name: string }[]).find(p => p.name !== auth.currentUser?.displayName)
            : null;
        return otherUser?.name.toLowerCase().includes(searchQuery.toLowerCase());
    });

    return (
        <View style={[styles.container, { backgroundColor: '#FFFFFF' }]}>
            {/* WhatsApp Style Header */}
            <View style={styles.header}>
                <Typography variant="h1" style={{ fontSize: 24, fontWeight: '700', color: '#002f34' }}>
                    Chats
                </Typography>
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
                renderItem={({ item, index }) => {
                    const otherUser = item.participantDetails
                        ? (Object.values(item.participantDetails) as { name: string, avatar: string }[]).find(p => p.name !== auth.currentUser?.displayName)
                        : null;

                    const title = otherUser?.name || 'Chat';
                    const avatar = otherUser?.avatar || 'https://i.pravatar.cc/150?u=default';
                    const time = item.lastMessageAt ? new Date(item.lastMessageAt.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now';

                    return (
                        <Animated.View entering={FadeInRight.delay(index * 50 + 100).springify()}>
                            <TouchableOpacity
                                activeOpacity={0.7}
                                onPress={() => navigation.navigate('ChatRoom', {
                                    chatId: item.id,
                                    otherName: title,
                                    otherAvatar: avatar
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
                                        <Typography variant="bodySmall" style={{ fontSize: 12, color: '#8E8E93' }}>
                                            {time}
                                        </Typography>
                                    </View>

                                    <Typography variant="bodySmall" color="#8E8E93" numberOfLines={1} style={{ marginTop: 2, fontSize: 14 }}>
                                        {item.lastMessage || "Tap to start chatting"}
                                    </Typography>
                                </View>
                            </TouchableOpacity>
                        </Animated.View>
                    );
                }}
            />
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
        color: '#1F2937',
    },
    searchContainer: {
        paddingHorizontal: 20,
        marginBottom: 12,
    },
    searchInner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
        height: 44,
        borderRadius: 12,
        paddingHorizontal: 14,
    },
    searchInput: {
        flex: 1,
        marginLeft: 10,
        fontSize: 14,
        color: '#1F2937',
    },
    chatCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 16,
        paddingVertical: 12,
        marginHorizontal: 0,
    },
    avatarContainer: {
        position: 'relative',
        marginRight: 12,
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
    },
    onlineIndicator: {
        position: 'absolute',
        bottom: 2,
        right: 2,
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#25D366',
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
        backgroundColor: '#6366F1',
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
