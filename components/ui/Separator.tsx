import { Colors } from "@/constants/Сolors"
import BasicStyles from "@/styles/BasicStyles"
import { StyleSheet, Text, View } from "react-native"
import Animated, { FadeIn, FadeInDown, FadeOut, LinearTransition } from "react-native-reanimated"

export default function DateContainer({ title }: { title: string }) {

    const styles = StyleSheet.create({
        containerDate: {
            marginHorizontal: 21,
            marginBottom: 9,
        },
        dateTextContainer: {
            textAlign: "center",
            fontSize: 16,
            marginTop: 5,
            color: Colors.blue
        },
        line: {
            height: 1,
            backgroundColor: Colors.blue,
        },
    })

    return (
        <Animated.View 
            style={styles.containerDate} 
            entering={FadeInDown.delay(100)}
            exiting={FadeOut}
            layout={LinearTransition}>
            <Text style={[styles.dateTextContainer, BasicStyles.fontSemiBold]}>{title}</Text>
            <View style={[styles.line, BasicStyles.border]} />
        </Animated.View>
    )
}