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
    isAd?: boolean;
}

export const ProductCard = ({ title, price, image, location, type, onPress, isAd }: ProductCardProps) => {
    const displayPrice = typeof price === 'number' ? price.toLocaleString() : price;

    return (
        <TouchableOpacity
            activeOpacity={0.9}
            onPress={onPress}
            style={{
                width: '100%',
                backgroundColor: '#FFFFFF',
                borderRadius: 12,
                marginBottom: 16,
                borderWidth: 1,
                borderColor: isAd ? '#FEF08A' : '#F1F5F9', // Gold border for ads
                overflow: 'hidden',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.03,
                shadowRadius: 10,
                elevation: 2
            }}
        >
            <View style={{ position: 'relative' }}>
                <Image
                    source={{ uri: image }}
                    style={{ width: '100%', height: 140 }}
                    className="bg-[#F9FAFB]"
                    resizeMode="cover"
                />

                {isAd ? (
                    <View
                        style={{
                            position: 'absolute',
                            top: 10,
                            right: 10,
                            backgroundColor: '#FEF08A',
                            paddingHorizontal: 8,
                            paddingVertical: 4,
                            borderRadius: 4,
                        }}
                    >
                        <Typography style={{ fontSize: 10, fontWeight: '800', color: '#854D0E', textTransform: 'uppercase' }}>Sponsored</Typography>
                    </View>
                ) : (
                    <TouchableOpacity
                        style={{
                            position: 'absolute',
                            top: 10,
                            right: 10,
                            width: 32,
                            height: 32,
                            borderRadius: 16,
                            backgroundColor: 'rgba(255,255,255,0.9)',
                            alignItems: 'center',
                            justifyContent: 'center',
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.1,
                            shadowRadius: 4,
                            elevation: 3
                        }}
                    >
                        <Heart size={16} color="#002f34" strokeWidth={2} />
                    </TouchableOpacity>
                )}
            </View>

            <View style={{ padding: 12 }}>
                {!isAd && (
                    <Typography
                        style={{ color: '#002f34', fontSize: 16, fontWeight: '900', marginBottom: 4 }}
                        numberOfLines={1}
                    >
                        {type === 'job' ? price : `₹${displayPrice}`}
                    </Typography>
                )}

                <Typography
                    style={{ color: isAd ? '#002f34' : '#444', fontSize: isAd ? 15 : 13, fontWeight: '600', marginBottom: 8, lineHeight: 18 }}
                    numberOfLines={2}
                >
                    {title}
                </Typography>

                {!isAd && (
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <MapPin size={10} color="#94A3B8" strokeWidth={2} />
                        <Typography style={{ color: '#94A3B8', fontSize: 10, marginLeft: 4, fontWeight: '600' }} numberOfLines={1}>
                            {location}
                        </Typography>
                    </View>
                )}

                {isAd && (
                    <Typography style={{ color: '#64748B', fontSize: 12 }}>Visit Website &rarr;</Typography>
                )}
            </View>
        </TouchableOpacity>
    );
};
