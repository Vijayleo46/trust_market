import React from 'react';
import { View, Image, TouchableOpacity, Dimensions, Platform } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withTiming,
    interpolate,
    Extrapolate
} from 'react-native-reanimated';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import { BlurView } from 'expo-blur';
import { Heart, MapPin } from 'lucide-react-native';
import { Typography } from '../common/Typography';
import { useTheme } from '../../theme/ThemeContext';
import { hapticFeedback } from '../common/HapticFeedback';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

interface PremiumProductCardProps {
    id: string;
    title: string;
    price: string;
    image: string;
    location: string;
    onPress?: () => void;
}

export const PremiumProductCard: React.FC<PremiumProductCardProps> = ({
    title,
    price,
    image,
    location,
    onPress
}) => {
    const { theme } = useTheme();

    // Animation Values for 3D Tilt
    const rotateX = useSharedValue(0);
    const rotateY = useSharedValue(0);
    const scale = useSharedValue(1);

    const gesture = Gesture.Pan()
        .onUpdate((event) => {
            // Calculate rotation based on touch position relative to center
            const centerX = CARD_WIDTH / 2;
            const centerY = (CARD_WIDTH * 1.5) / 2;

            // Limit rotation range
            rotateY.value = interpolate(
                event.x,
                [0, CARD_WIDTH],
                [-15, 15],
                Extrapolate.CLAMP
            );
            rotateX.value = interpolate(
                event.y,
                [0, CARD_WIDTH * 1.5],
                [15, -15],
                Extrapolate.CLAMP
            );
        })
        .onEnd(() => {
            rotateX.value = withSpring(0);
            rotateY.value = withSpring(0);
        });

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [
                { perspective: 1000 },
                { rotateX: `${rotateX.value}deg` },
                { rotateY: `${rotateY.value}deg` },
                { scale: scale.value }
            ],
        };
    });

    const handlePressIn = () => {
        scale.value = withTiming(0.95, { duration: 100 });
        hapticFeedback.selection();
    };

    const handlePressOut = () => {
        scale.value = withSpring(1);
    };

    return (
        <GestureDetector gesture={gesture}>
            <Animated.View style={[animatedStyle]}>
                <TouchableOpacity
                    activeOpacity={1}
                    onPressIn={handlePressIn}
                    onPressOut={handlePressOut}
                    onPress={onPress}
                    className="bg-white rounded-[32px] overflow-hidden"
                    style={{
                        width: CARD_WIDTH,
                        height: CARD_WIDTH * 1.5,
                        // Custom Outer Glow instead of heavy shadow
                        shadowColor: theme.primary,
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.1,
                        shadowRadius: 12,
                        elevation: 5,
                    }}
                >
                    <Image
                        source={{ uri: image }}
                        className="w-full h-full absolute"
                        resizeMode="cover"
                    />

                    {/* Top Icons */}
                    <View className="flex-row justify-end p-4 z-10">
                        <TouchableOpacity className="bg-white/20 p-2 rounded-full backdrop-blur-md">
                            <Heart size={18} color="#FFF" strokeWidth={1} />
                        </TouchableOpacity>
                    </View>

                    {/* Glassmorphism Bottom Section */}
                    <View className="absolute bottom-0 left-0 right-0 overflow-hidden rounded-b-[32px]">
                        <BlurView intensity={30} tint="light" className="p-4 bg-white/40">
                            <Typography
                                className="text-white font-serif font-black text-lg"
                                numberOfLines={1}
                                style={{ letterSpacing: -0.5 }}
                            >
                                {price}
                            </Typography>
                            <Typography
                                variant="bodySmall"
                                className="text-white/90 font-medium"
                                numberOfLines={1}
                            >
                                {title}
                            </Typography>

                            <View className="flex-row items-center mt-2 opacity-80">
                                <MapPin size={12} color="#FFF" strokeWidth={1} />
                                <Typography className="text-white text-[10px] ml-1">
                                    {location}
                                </Typography>
                            </View>
                        </BlurView>
                    </View>
                </TouchableOpacity>
            </Animated.View>
        </GestureDetector>
    );
};
