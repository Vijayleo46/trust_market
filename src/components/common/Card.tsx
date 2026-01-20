import React from 'react';
import { View, ViewProps, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';

interface CardProps extends ViewProps {
    children: React.ReactNode;
    variant?: 'elevated' | 'flat' | 'outline';
}

export const Card: React.FC<CardProps> = ({
    children,
    variant = 'elevated',
    style,
    ...props
}) => {
    const { theme, spacing, borderRadius } = useTheme();

    const getVariantStyles = () => {
        switch (variant) {
            case 'elevated':
                return {
                    backgroundColor: theme.card,
                    shadowColor: theme.shadow,
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.1,
                    shadowRadius: 8,
                    elevation: 4,
                };
            case 'flat':
                return {
                    backgroundColor: theme.card,
                };
            case 'outline':
                return {
                    backgroundColor: 'transparent',
                    borderWidth: 1,
                    borderColor: theme.border,
                };
        }
    };

    return (
        <View
            style={[
                styles.base,
                {
                    borderRadius: borderRadius.lg,
                    padding: spacing.md,
                },
                getVariantStyles(),
                style,
            ] as any}
            {...props}
        >
            {children}
        </View>
    );
};

const styles = StyleSheet.create({
    base: {
        overflow: 'hidden',
    },
});
