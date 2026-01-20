import React from 'react';
import { View, TextInput, TouchableOpacity } from 'react-native';
import { BlurView } from 'expo-blur';
import { Search, SlidersHorizontal } from 'lucide-react-native';

interface GlassmorphismSearchProps {
    value: string;
    onChangeText: (text: string) => void;
    onFilterPress?: () => void;
}

export const GlassmorphismSearch = ({ value, onChangeText, onFilterPress }: GlassmorphismSearchProps) => {
    return (
        <View className="px-4 py-2 mt-4">
            <BlurView
                intensity={40}
                tint="light"
                className="flex-row items-center bg-white/60 border border-white/40 rounded-3xl px-4 h-14 overflow-hidden"
            >
                <Search size={20} color="#002f34" />
                <TextInput
                    placeholder="Search premium products..."
                    placeholderTextColor="#9ca3af"
                    className="flex-1 ml-3 text-base text-gray-800 font-medium"
                    value={value}
                    onChangeText={onChangeText}
                />
                <TouchableOpacity
                    onPress={onFilterPress}
                    className="bg-primary/10 p-2 rounded-2xl"
                >
                    <SlidersHorizontal size={20} color="#002f34" />
                </TouchableOpacity>
            </BlurView>
        </View>
    );
};
