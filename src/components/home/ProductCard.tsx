import React from 'react';
import { View, Image, TouchableOpacity } from 'react-native';
import { Heart, MapPin } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Typography } from '../common/Typography';

interface ProductCardProps {
    id?: string;
    title: string;
    price: string;
    image: string;
    location: string;
    isLiked?: boolean;
    onPress?: () => void;
    onLikePress?: () => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
    title,
    price,
    image,
    location,
    isLiked,
    onPress,
    onLikePress
}) => {
    return (
        <Animated.View
            entering={FadeInDown.duration(400)}
            className="w-full bg-white border border-gray-100 rounded-lg overflow-hidden mb-3 shadow-sm"
        >
            <TouchableOpacity activeOpacity={0.9} onPress={onPress}>
                <View className="relative w-full aspect-[4/3] bg-gray-50">
                    <Image source={{ uri: image }} className="w-full h-full" resizeMode="cover" />
                    <TouchableOpacity
                        className="absolute top-2 right-2 bg-white/80 p-1.5 rounded-full"
                        onPress={onLikePress}
                    >
                        <Heart
                            size={18}
                            color={isLiked ? '#ff5252' : '#002f34'}
                            fill={isLiked ? '#ff5252' : 'transparent'}
                        />
                    </TouchableOpacity>
                </View>
                <View className="p-3">
                    <Typography className="text-lg font-extrabold text-[#002f34] mb-1">
                        {price}
                    </Typography>
                    <Typography
                        className="text-sm font-medium text-gray-600 mb-2"
                        numberOfLines={1}
                    >
                        {title}
                    </Typography>

                    <View className="flex-row justify-between items-center mt-auto">
                        <View className="flex-row items-center flex-1 mr-2">
                            <MapPin size={10} color="#9ca3af" />
                            <Typography
                                className="text-[10px] text-gray-400 ml-1 uppercase"
                                numberOfLines={1}
                            >
                                {location}
                            </Typography>
                        </View>
                        <Typography className="text-[10px] text-gray-400 uppercase">
                            Today
                        </Typography>
                    </View>
                </View>
            </TouchableOpacity>
        </Animated.View>
    );
};

