import React, { useImperativeHandle, useState, forwardRef, useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import Animated, { withTiming, Easing, useSharedValue, useAnimatedStyle, FadeInDown, FadeOutDown, withDelay } from "react-native-reanimated";

export interface ModalMessageInterface {
    showMessage: () => void;
    hideMessage: () => void;
}

const ModalMessage = forwardRef((props: { text: string, backgroundColor?: string }, ref) => {
    const [isVisible, setIsVisible] = useState(false);
    const [sizesModal, setSizesModal] = useState<{ width: number, height: number }>({ width: 0, height: 0 });
    // Изначально модальное окно скрыто за верхней границей
    const translateY = useSharedValue(-1000); // Позиция окна выше экрана
    const opacity = useSharedValue(0); // Позиция окна выше экрана

    const paddingTop = 30;

    // Анимированный стиль для появления и исчезновения с эффектом движения вверх/вниз
    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [
                {
                    translateY: withTiming(translateY.value + paddingTop, {
                        duration: 500,
                        easing: Easing.inOut(Easing.ease),
                    }),
                },
            ],
            opacity: withTiming(opacity.value, {
                    duration: 500,
                    easing: Easing.inOut(Easing.ease),
                })
        };
    });

    const styles = StyleSheet.create({
        modal: {
            position: "absolute",
            top: 0, // Расстояние от верхней части экрана, чтобы окно не зацепило верх
            left: 20,
            right: 20,
            padding: 20,
            backgroundColor: props.backgroundColor,
            borderRadius: 10,
        },
        text: {
            color: "#fff",
            fontSize: 16,
        },
    });

    const showMessage = () => {
        translateY.value = 0; // Окно выезжает из верхней части
        opacity.value = 1;
        setIsVisible(true); // Сделать сообщение видимым
    }
    const hideMessage = () => {
        translateY.value = -sizesModal.height; // Окно уезжает вверх, за пределы экрана
        opacity.value = 0;
        setIsVisible(false); // Сделать сообщение скрытым
    }

    // Экспонируем методы родительскому компоненту
    useImperativeHandle(ref, () => ({
        showMessage,
        hideMessage
    }));

    useEffect(() => {
        translateY.value = -sizesModal.height;
    }, [sizesModal])

    useEffect(() => {
        if (isVisible) {
            setTimeout(() => {
                hideMessage(); // Скрыть сообщение через 2.5 секунды
            }, 2500); // Задержка 2 секунды перед скрытием
        }
    }, [isVisible]);

    return (
        <Animated.View
            style={[styles.modal, animatedStyle]}
            onLayout={(event) => {
                const { width, height } = event.nativeEvent.layout;
                setSizesModal({ width, height })
            }}
        >
            <Text style={styles.text}>{props.text}</Text>
        </Animated.View>
    );
});

export default ModalMessage;
