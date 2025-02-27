// import { Colors } from "@/constants/Сolors";
// import React, { useEffect} from "react";
// import {StyleSheet, AppState } from "react-native";
// import Animated, {
//     useSharedValue,
//     withRepeat,
//     withTiming,
//     useAnimatedStyle,
//     withDelay,
//     Easing,
//     SharedValue,
// } from "react-native-reanimated";

// function LoadingModal(
//     { radius = 15, showLoader = false }: 
//     { radius?: number, showLoader?: boolean }) {

//     const opacity = useSharedValue(0);
//     const duration = 1500; // Время одного полного оборота (мс)
//     // const [showLoaderIcon, setShowLoaderIcon] = useState(Boolean(showLoader));

//     const initialDots = new Array(20).fill(null).map(() => useSharedValue(0))
//     // Инициализируем SharedValue один раз
//     const dots = Array.from(initialDots);

//     function resetDots() {
//         // dots = Array.from(initialDots);
//         dots.forEach(dot => {dot.value = withTiming(0, {duration: 0})})
//     }

//     function startAnimation() {
//         opacity.value = withDelay(100, withTiming(1, {duration: 100}))
        
//         dots.forEach((dot, index) => {
//             const delay = index * 15;
//             if (showLoader) {
//                 dot.value = withDelay(
//                     delay,
//                     withRepeat(
//                         withTiming(2 * Math.PI, {
//                             duration,
//                             easing: Easing.linear,
//                         }),
//                         -1
//                     )
//                 );
//             }
//         });
//     }

//     useEffect(() => {
//         if (showLoader) {
//             // resetDots();
//             startAnimation(); // Запускаем анимацию при первом рендере

//         } else {
//             setTimeout(() => {
//                 opacity.value = withTiming(0, {duration: 100})
//                 resetDots();
//             }, 200)
//         }

//         const subscription = AppState.addEventListener("change", (nextAppState) => {
//             if (nextAppState === "active" && showLoader) {
//                 resetDots();
//                 startAnimation(); // Перезапускаем анимацию при возвращении
//             }
//         });

//         return () => {
//             subscription.remove(); // Отписываемся от событий AppState при размонтировании
//         };
//     }, [showLoader]); // Следим за изменениями showLoaderIcon

//     const styles = StyleSheet.create({
//         container: {
//             flexDirection: "row",
//             alignItems: "center",
//             justifyContent: "center",
//             flex: 1,
//             backgroundColor: "#0000045",
//         },
//         dot: {
//             width: 6,
//             height: 6,
//             backgroundColor: Colors.blue,
//             borderRadius: 6,
//             position: "absolute",
//         },
//     });
    
//     return (
//         <>
//             {
//                     dots.map((angle, index) => {
//                         const animatedStyle = useAnimatedStyle(() => ({
//                             transform: [
//                                 { translateX: radius * Math.cos(angle.value) },
//                                 { translateY: radius * Math.sin(angle.value) },
//                             ],
//                             opacity: opacity.value
//                         }));

//                         return <Animated.View key={index} style={[styles.dot, animatedStyle]} />;
//                     })
//             }
//         </>
//     );
// }

// export default LoadingModal

import { Colors } from "@/constants/Сolors";
import React, { useEffect} from "react";
import {StyleSheet, AppState, ActivityIndicator } from "react-native";
import Animated, {
    useSharedValue,
    withRepeat,
    withTiming,
    useAnimatedStyle,
    withDelay,
    Easing,
    SharedValue,
} from "react-native-reanimated";

function LoadingModal(
    { showLoader = false }: 
    { showLoader?: boolean }) {

    const opacity = useSharedValue(0);
    const duration = 1500; // Время одного полного оборота (мс)
    // const [showLoaderIcon, setShowLoaderIcon] = useState(Boolean(showLoader));

    const initialDots = new Array(20).fill(null).map(() => useSharedValue(0))
    // Инициализируем SharedValue один раз



    useEffect(() => {
        const subscription = AppState.addEventListener("change", (nextAppState) => {
        });

        return () => {
            subscription.remove(); // Отписываемся от событий AppState при размонтировании
        };
    }, [showLoader]); // Следим за изменениями showLoaderIcon
    
    return (
        <ActivityIndicator size={40}/>
    );
}

export default LoadingModal