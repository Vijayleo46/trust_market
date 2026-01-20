import React from 'react';
import { View, StyleSheet, TouchableOpacity, Modal, TouchableWithoutFeedback } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../theme/ThemeContext';
import { Typography } from '../common/Typography';
import { ShoppingBag, Briefcase } from 'lucide-react-native';

interface PostTypeSelectorProps {
    visible: boolean;
    onClose: () => void;
    onSelect: (type: 'product' | 'job') => void;
}

export const PostTypeSelector = ({ visible, onClose, onSelect }: PostTypeSelectorProps) => {
    const { theme } = useTheme();

    const handleSelect = (type: 'product' | 'job') => {
        onSelect(type);
    };

    const OptionCard = ({ type, icon, label, description, color }: any) => (
        <TouchableOpacity
            style={[styles.optionCard, { borderColor: theme.border }]}
            onPress={() => handleSelect(type)}
            activeOpacity={0.8}
        >
            <LinearGradient
                colors={[`${color}20`, `${color}10`]}
                style={styles.cardGradient}
            />
            
            <View style={[styles.iconContainer, { backgroundColor: color + '30' }]}>
                {icon}
            </View>
            
            <View style={styles.textContainer}>
                <Typography variant="h3" style={[styles.cardTitle, { color: theme.text }]}>
                    {label}
                </Typography>
                <Typography variant="bodySmall" style={[styles.cardDescription, { color: theme.textTertiary }]}>
                    {description}
                </Typography>
            </View>
        </TouchableOpacity>
    );

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <TouchableWithoutFeedback onPress={onClose}>
                    <View style={styles.overlayTouch} />
                </TouchableWithoutFeedback>
                
                <View style={[styles.content, { backgroundColor: theme.background }]}>
                    {/* Handle */}
                    <View style={[styles.handle, { backgroundColor: theme.border }]} />

                    {/* Header */}
                    <View style={styles.header}>
                        <Typography variant="h2" style={[styles.headerTitle, { color: theme.text }]}>
                            What would you like to post?
                        </Typography>
                        <Typography variant="bodyMedium" style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
                            Choose the type of listing
                        </Typography>
                    </View>

                    {/* Options */}
                    <View style={styles.optionsContainer}>
                        <OptionCard
                            type="product"
                            label="Sell Product"
                            description="List items for sale"
                            icon={<ShoppingBag size={32} color="#D97706" />}
                            color="#D97706"
                        />
                        
                        <OptionCard
                            type="job"
                            label="Post Job"
                            description="Hire talent & find workers"
                            icon={<Briefcase size={32} color="#7C3AED" />}
                            color="#7C3AED"
                        />
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    overlayTouch: {
        flex: 1,
    },
    content: {
        padding: 24,
        paddingBottom: 40,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
    },
    handle: {
        width: 40,
        height: 4,
        borderRadius: 2,
        marginBottom: 24,
        alignSelf: 'center',
    },
    header: {
        marginBottom: 32,
        alignItems: 'center',
    },
    headerTitle: {
        marginBottom: 8,
        textAlign: 'center',
    },
    headerSubtitle: {
        textAlign: 'center',
    },
    optionsContainer: {
        width: '100%',
        gap: 16,
    },
    optionCard: {
        padding: 20,
        borderRadius: 16,
        borderWidth: 1,
        flexDirection: 'row',
        alignItems: 'center',
        overflow: 'hidden',
    },
    cardGradient: {
        ...StyleSheet.absoluteFillObject,
    },
    iconContainer: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    textContainer: {
        flex: 1,
    },
    cardTitle: {
        marginBottom: 4,
    },
    cardDescription: {
        fontSize: 13,
    },
});
