import React from 'react';
import { View, StyleSheet, Dimensions, TouchableOpacity, Image, StatusBar } from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    interpolate,
    Extrapolate
} from 'react-native-reanimated';
import { X, RotateCcw } from 'lucide-react-native';
import { Typography } from '../components/common/Typography';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

export const ImageViewerScreen = ({ route, navigation }: any) => {
    const { imageUrl } = route.params || {};

    const rotateX = useSharedValue(0);
    const rotateY = useSharedValue(0);
    const scale = useSharedValue(1);

    const gesture = Gesture.Pan()
        .onUpdate((event) => {
            rotateY.value = event.translationX / 5;
            rotateX.value = -event.translationY / 5;
            scale.value = 1.1;
        })
        .onEnd(() => {
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
                { scale: scale.value },
            ],
        };
    });

    const shadowStyle = useAnimatedStyle(() => {
        const opacity = interpolate(
            scale.value,
            [1, 1.1],
            [0.1, 0.3],
            Extrapolate.CLAMP
        );
        return {
            opacity,
            transform: [
                { translateY: 40 },
                { scaleX: scale.value },
            ]
        };
    });

    return (
        <GestureHandlerRootView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#000" />
            <SafeAreaView style={styles.header}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={styles.closeBtn}
                >
                    <X size={24} color="#FFF" />
                </TouchableOpacity>
                <View style={styles.headerTitle}>
                    <Typography style={styles.titleText}>360° Viewer</Typography>
                    <Typography style={styles.subtitleText}>Drag to rotate image</Typography>
                </View>
                <TouchableOpacity
                    onPress={() => {
                        rotateX.value = withSpring(0);
                        rotateY.value = withSpring(0);
                    }}
                    style={styles.resetBtn}
                >
                    <RotateCcw size={20} color="#FFF" />
                </TouchableOpacity>
            </SafeAreaView>

            <View style={styles.viewerContainer}>
                <GestureDetector gesture={gesture}>
                    <View style={styles.gestureReceiver}>
                        <Animated.View style={[styles.imageContainer, animatedStyle]}>
                            <Image
                                source={{ uri: imageUrl }}
                                style={styles.image}
                                resizeMode="contain"
                            />
                        </Animated.View>
                        <Animated.View style={[styles.shadow, shadowStyle]} />
                    </View>
                </GestureDetector>
            </View>

            <View style={styles.footer}>
                <Typography style={styles.footerText}>
                    Use your finger to move the image in 3D space
                </Typography>
            </View>
        </GestureHandlerRootView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 20,
        zIndex: 10,
    },
    closeBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255,255,255,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        flex: 1,
        alignItems: 'center',
    },
    titleText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: '700',
    },
    subtitleText: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: 12,
    },
    resetBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255,255,255,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    viewerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    gestureReceiver: {
        width: width,
        height: height * 0.6,
        justifyContent: 'center',
        alignItems: 'center',
    },
    imageContainer: {
        width: width * 0.9,
        height: width * 0.9,
        backgroundColor: '#111',
        borderRadius: 20,
        overflow: 'hidden',
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
    },
    image: {
        width: '100%',
        height: '100%',
    },
    shadow: {
        position: 'absolute',
        bottom: -20,
        width: width * 0.6,
        height: 20,
        backgroundColor: '#FFF',
        borderRadius: 50,
        filter: 'blur(20px)',
    },
    footer: {
        paddingBottom: 40,
        alignItems: 'center',
    },
    footerText: {
        color: 'rgba(255,255,255,0.4)',
        fontSize: 14,
        textAlign: 'center',
        paddingHorizontal: 40,
    },
});
