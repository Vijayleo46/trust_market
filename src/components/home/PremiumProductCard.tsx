import React from 'react';
import { View, Image, Dimensions, Pressable } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    interpolate,
    Extrapolate
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { Typography } from '../common/Typography';
import { MapPin, Heart } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.44;

interface PremiumProductCardProps {
    title: string;
    price: string | number;
    image: string;
    location: string;
    onPress?: () => void;
}

export const PremiumProductCard = ({ title, price, image, location, onPress }: PremiumProductCardProps) => {
    const rotateX = useSharedValue(0);
    const rotateY = useSharedValue(0);
    const scale = useSharedValue(1);

    const gesture = Gesture.Pan()
        .onBegin(() => {
            scale.value = withSpring(0.95);
        })
        .onUpdate((event) => {
            // Calculate rotation based on touch position relative to center
            const centerX = CARD_WIDTH / 2;
            const centerY = 200 / 2; // Assuming height is around 200

            rotateY.value = interpolate(
                event.x,
                [0, CARD_WIDTH],
                [10, -10],
                Extrapolate.CLAMP
            );
            rotateX.value = interpolate(
                event.y,
                [0, 200],
                [-10, 10],
                Extrapolate.CLAMP
            );
        })
        .onFinalize(() => {
            rotateX.value = withSpring(0);
            rotateY.value = withSpring(0);
            scale.value = withSpring(1);
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

    return (
        <GestureDetector gesture={gesture}>
            <Animated.View
                style={[animatedStyle]}
                className="mb-4"
            >
                <Pressable
                    onPress={onPress}
                    className="bg-white rounded-[32px] overflow-hidden shadow-xl shadow-black/5 border border-white"
                >
                    <View className="relative h-48 w-full">
                        <Image
                            source={{ uri: image }}
                            className="h-full w-full object-cover"
                        />
                        <LinearGradient
                            colors={['transparent', 'rgba(0,0,0,0.1)']}
                            className="absolute inset-0"
                        />
                        <View className="absolute top-4 right-4 bg-white/80 rounded-full p-2 backdrop-blur-md">
                            <Heart size={16} color="#002f34" fill="white" />
                        </View>
                    </View>

                    <View className="p-4 bg-white">
                        <Typography className="text-[10px] uppercase tracking-[2px] text-[#002f34] font-bold mb-1">
                            Fresh Arrival
                        </Typography>
                        <Typography className="text-sm font-semibold text-gray-900 mb-1" numberOfLines={1}>
                            {title}
                        </Typography>

                        <View className="flex-row items-center justify-between mt-2">
                            <Typography className="text-lg font-black text-[#002f34]">
                                {typeof price === 'number' ? `₹${price.toLocaleString()}` : price}
                            </Typography>
                        </View>

                        <View className="flex-row items-center mt-2 opacity-50">
                            <MapPin size={10} color="#666" />
                            <Typography className="text-[10px] ml-1 text-gray-600">
                                {location}
                            </Typography>
                        </View>
                    </View>
                </Pressable>
            </Animated.View>
        </GestureDetector>
    );
};
