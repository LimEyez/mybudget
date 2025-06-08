import Swipeable, { SwipeableMethods } from "react-native-gesture-handler/ReanimatedSwipeable";
import { Gesture, GestureDetector, RectButton } from "react-native-gesture-handler";
import { memo, ReactNode, useCallback, useRef } from "react";
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import Animated, { FadeIn, FadeOut, LinearTransition, runOnJS, SharedValue, useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import TrashcanIcon from "./trashcanIcon";
import { Colors } from "@/constants/Сolors";
import BasicStyles from "@/styles/BasicStyles";

interface SwipeableElementInterface {
    swipeableContainerStyle?: StyleProp<ViewStyle>,
    children?: ReactNode,
    deleteFunc?: () => void
}

function SwipeableElement({ swipeableContainerStyle, children, deleteFunc }: SwipeableElementInterface) {
    const refSwipeable = useRef<SwipeableMethods | null>(null);

    // ✅ Вынесем useSharedValue на верхний уровень
    const scaleIcon = useSharedValue(0);
    const opacityIcon = useSharedValue(0);

    const styles = StyleSheet.create({
        swipeableContainer: {
            height: 100,
            width: "100%",
            alignItems: 'center',
            justifyContent: "center",
        },
        elementContainer: {
            height: "100%",
            width: "100%",
            justifyContent: "center",
            alignItems: "center",
        },
        rightAction: {
            width: 80,
            height: "100%",
            justifyContent: "center",
            alignItems: "center",
        },
        rightActionBox: {
            width: 40,
            alignItems: "center",
            justifyContent: "center",
            height: 40,
        },
        rectButtonIcon: {
            width: "100%",
            height: "100%",
        }
    });


    const RightAction = useCallback((prog: SharedValue<number>, drag: SharedValue<number>) => {

        const styleAnimation = useAnimatedStyle(() => {

            const relation = Math.abs(drag.value / 80);

            if (relation > 0.7 && scaleIcon.value !== 1 && opacityIcon.value !== 1) {
                scaleIcon.value = withSpring(1, { mass: 0.5, damping: 15, stiffness: 300 });
                opacityIcon.value = withSpring(1, { mass: 0.5, damping: 15, stiffness: 300 });
            } else if (relation <= 0.7 && scaleIcon.value !== 0 && opacityIcon.value !== 0) {
                scaleIcon.value = withSpring(0, { mass: 0.5, damping: 15, stiffness: 300 });
                opacityIcon.value = withSpring(0, { mass: 0.5, damping: 15, stiffness: 300 });
            }

            return {
                transform: [{ scale: scaleIcon.value }],
                opacity: opacityIcon.value,
            };
        });

        return (
            <Animated.View
                entering={FadeIn}
                exiting={FadeOut}
                layout={LinearTransition}
            >
                <View style={styles.rightAction}>
                    <Animated.View style={[
                        styles.rightActionBox,
                        styleAnimation
                    ]}>
                        <RectButton
                            style={[BasicStyles.border, styles.rectButtonIcon]}
                            onPress={deleteFunc}
                        >
                            <TrashcanIcon width={'100%'} height={'100%'} fill={Colors.red} />
                        </RectButton>
                    </Animated.View>
                </View>
            </Animated.View>
        );
    }, []); // Добавили deleteFunc в зависимости


    return (
        <Swipeable
            ref={refSwipeable}
            containerStyle={[styles.swipeableContainer, swipeableContainerStyle]}
            renderRightActions={RightAction}
            rightThreshold={50}
            overshootFriction={5}
            friction={1.7}
        >
            <View style={styles.elementContainer}>
                {children}
            </View>
        </Swipeable>
    );
}

export default memo(SwipeableElement);
