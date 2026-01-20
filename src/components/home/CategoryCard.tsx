import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { Typography } from '../common/Typography';
import { LinearGradient } from 'expo-linear-gradient';

interface CategoryCardProps {
    label: string;
    icon: React.ReactNode;
    colors: [string, string];
}

export const CategoryCard: React.FC<CategoryCardProps> = ({ label, icon, colors }) => {
    const { theme, spacing, borderRadius } = useTheme();

    return (
        <TouchableOpacity activeOpacity={0.9} style={styles.container}>
            <LinearGradient
                colors={colors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.gradient, { borderRadius: borderRadius.lg }]}
            >
                <View style={styles.iconContainer}>
                    {icon}
                </View>
            </LinearGradient>
            <Typography variant="label" align="center" style={{ marginTop: spacing.xs }}>
                {label}
            </Typography>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        width: 80,
        marginRight: 16,
    },
    gradient: {
        width: 64,
        height: 64,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    iconContainer: {
        transform: [{ scale: 1.1 }],
    },
});
