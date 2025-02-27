import { View, Dimensions, StatusBar, StyleSheet, StyleProp, ViewStyle } from "react-native";
import { useHeaderHeight } from "@react-navigation/elements";
import { PixelRatio } from "react-native";
import { Stack } from "expo-router";
import { ReactNode, useEffect, useState } from "react";

const getHeaderHeightInPixel = () => {
  const windowHeight = Dimensions.get("window").height;
  const statusBarHeightInPixel = StatusBar.currentHeight || 0;
  const headerHeightInPixel = useHeaderHeight() || 0;

  return(headerHeightInPixel + statusBarHeightInPixel);
};

const getSizeInDp = (value: number = getHeaderHeightInPixel()) => {
  const windowHeight = Dimensions.get("window").height;
  return (windowHeight-(value / PixelRatio.get()));
};

export default function LayoutWindowHeight({children, style}: {children?: ReactNode, style?: StyleProp<ViewStyle>}) {
  const [windowHeightDp, setWindowHeightDp] = useState(getSizeInDp());

  useEffect(() => {
    const updateSize = () => setWindowHeightDp(getSizeInDp());
    const subscription = Dimensions.addEventListener("change", updateSize);

    return () => subscription?.remove(); // Отписываемся при размонтировании
  }, []);

  const styles = StyleSheet.create({
    container:{

      flex: 1, 
      height: windowHeightDp 
    }
  })

  console.log(windowHeightDp)

  return (
    <View style={[styles.container, style]}>
      {children}
    </View>
  );
}
