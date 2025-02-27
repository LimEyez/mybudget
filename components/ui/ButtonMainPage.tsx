import { Pressable, StyleSheet, Text, View } from "react-native";
import BasicStyles from "@/styles/BasicStyles";
import React from "react";
import { RectButton } from "react-native-gesture-handler";

type ButtonProps = {
    image?: string,
    width?: number,
    height?: number,
    backgroundColor?: string,
    marginTop?: number,
    children?: React.ReactNode
    onPressFunction?: () => void,
}

export default function ButtonMainPage(
    { image, width, height, backgroundColor, marginTop, onPressFunction, children }: ButtonProps = {}) {

    const styles = StyleSheet.create(
        {
            button: {
                height,
                width,
                backgroundColor,
                marginTop,
                flex: 1,

            }
        }
    )

    return (
        <RectButton 
            onPress={onPressFunction} 
            style={[BasicStyles.border, BasicStyles.homePageButton, BasicStyles.shadowElements, styles.button]}>
            {children}
        </RectButton>
    )
}