import { StyleSheet } from "react-native";

const BasicStyles = StyleSheet.create({
    border: {
        borderRadius: 10
    },
    shadowElements: {
        shadowColor: "black",
        shadowOpacity: 0.25,
        shadowOffset: {width: 0, height: 4},
        shadowRadius: 4,
        elevation: 5,
        
    },
    homePageButton: {
        justifyContent: "center",
        alignItems: "center"
    },
    fontSemiBold:{
        fontFamily: "SemiBold"
    }
})

export default  BasicStyles