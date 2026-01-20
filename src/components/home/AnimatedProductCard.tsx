import React from 'react';
import { View, Image, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Heart, MapPin } from 'lucide-react-native';
import { MotiView } from 'moti';
import { Typography } from '../common/Typography';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

interface AnimatedProductCardProps {
    id: string;
    title: string;
    price: string;
    image: string;
    location: string;
    index: number;
    onPress?: () => void;
}

export const AnimatedProductCard: React.FC<AnimatedProductCardProps> = ({
    id,
    title,
    price,
    image,
    location,
    index,
    onPress
}) => {
    return (
        <MotiView
            from={{
                opacity: 0,
                translateY: 50,
                scale: 0.9,
            }}
            animate={{
                opacity: 1,
                translateY: 0,
                scale: 1,
            }}
            transition={{
                type: 'timing',
                duration: 500,
                delay: index * 100, // Staggered animation
            }}
            style={styles.container}
        >
            <TouchableOpacity
                activeOpacity={0.95}
                onPress={onPress}
                style={styles.card}
            >
                {/* Product Image with Shared Element ID */}
                <MotiView
                    style={styles.imageContainer}
                    from={{ scale: 1 }}
                    animate={{ scale: 1 }}
                    transition={{
                        type: 'spring',
                        damping: 15,
                    }}
                >
                    <Image
                        source={{ uri: image }}
                        style={styles.image}
                        resizeMode="cover"
                    />
                    
                    {/* Heart Icon */}
                    <TouchableOpacity style={styles.heartButton}>
                        <Heart size={18} color="#0f172a" strokeWidth={2} />
                    </TouchableOpacity>
                </MotiView>

                {/* Product Info */}
                <MotiView
                    from={{ opacity: 0, translateY: 10 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    transition={{
                        type: 'timing',
                        duration: 400,
                        delay: index * 100 + 200,
                    }}
                    style={styles.infoContainer}
                >
                    <Typography style={styles.price}>{price}</Typography>
                    <Typography style={styles.title} numberOfLines={2}>
                        {title}
                    </Typography>
                    
                    <View style={styles.locationRow}>
                        <MapPin size={12} color="#94a3b8" strokeWidth={2} />
                        <Typography style={styles.location} numberOfLines={1}>
                            {location}
                        </Typography>
                    </View>
                </MotiView>
            </TouchableOpacity>
        </MotiView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    card: {
        backgroundColor: '#FFF',
        borderRadius: 24,
        overflow: 'hidden',
        shadowColor: '#0f172a',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.06,
        shadowRadius: 20,
        elevation: 4,
    },
    imageContainer: {
        width: '100%',
        height: 160,
        backgroundColor: '#f1f5f9',
        position: 'relative',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    heartButton: {
        position: 'absolute',
        top: 12,
        right: 12,
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#0f172a',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    infoContainer: {
        padding: 16,
    },
    price: {
        fontSize: 22,
        fontWeight: '800',
        color: '#0f172a',
        marginBottom: 6,
        letterSpacing: -0.5,
    },
    title: {
        fontSize: 14,
        color: '#475569',
        marginBottom: 10,
        lineHeight: 20,
        fontWeight: '500',
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    location: {
        fontSize: 12,
        color: '#94a3b8',
        marginLeft: 6,
        flex: 1,
        fontWeight: '500',
    },
});
