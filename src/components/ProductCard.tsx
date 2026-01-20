import React from 'react';
import { View, TouchableOpacity, Image, StyleSheet, Dimensions } from 'react-native';
import { Typography } from './common/Typography';
import { Heart, MapPin } from 'lucide-react-native';

const { width } = Dimensions.get('window');

interface ProductCardProps {
    title: string;
    price: string | number;
    image: string;
    location?: string;
    type?: string;
    seller?: string;
    rating?: number;
    description?: string;
    onPress: () => void;
}

export const ProductCard = ({ title, price, image, location, type, onPress }: ProductCardProps) => {
    const displayPrice = typeof price === 'number' ? price.toLocaleString() : price;

    return (
        <TouchableOpacity
            activeOpacity={0.9}
            onPress={onPress}
            className="bg-white rounded-[32px] mb-5 overflow-hidden shadow-sm border border-gray-100"
            style={{ width: (width / 2) - 30 }}
        >
            <View className="relative">
                <Image
                    source={{ uri: image }}
                    style={{ width: '100%', height: 165 }}
                    className="bg-[#F9FAFB]"
                    resizeMode="contain"
                />
                <TouchableOpacity
                    className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 items-center justify-center shadow-sm"
                >
                    <Heart size={16} color="#000" strokeWidth={1.5} />
                </TouchableOpacity>
            </View>

            <View className="p-3">
                {type === 'job' ? (
                    <Typography className="text-lg font-black text-[#1A1A1A] mb-1">Company Hire</Typography>
                ) : (
                    <Typography className="text-lg font-black text-[#1A1A1A] mb-1">₹ {displayPrice}</Typography>
                )}

                <Typography className="text-sm font-medium text-gray-900 leading-tight mb-2" numberOfLines={2}>
                    {title}
                </Typography>

                <View className="flex-row items-center justify-between mt-auto">
                    <View className="flex-row items-center flex-1 mr-2">
                        <MapPin size={12} color="#6B7280" strokeWidth={2} />
                        <Typography className="text-[10px] text-gray-500 ml-1" numberOfLines={1}>{location}</Typography>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
};
