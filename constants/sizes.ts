import { useHeaderHeight } from "@react-navigation/elements";
import { Dimensions, PixelRatio, StatusBar } from "react-native";

const Sizes = {
    mainContainerPaddingTop: 20,
}
const getHeightWindow = () => {
    const windowHeight = Dimensions.get("window").height;
    const statusBarHeightInPixel = StatusBar.currentHeight || 0;
    const headerHeightInPixel = useHeaderHeight() || 0;

    return (windowHeight - ((headerHeightInPixel + statusBarHeightInPixel) / PixelRatio.get()));
};
export { Sizes, getHeightWindow }
