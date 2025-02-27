import { StyleSheet, Text, View } from "react-native";
import BasicStyles from "@/styles/BasicStyles";
import { Colors } from "@/constants/Сolors";
import { getFormatedDate } from "@/services/DateFunctions";
import { RectButton } from "react-native-gesture-handler";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";

export default function InfoOfDateRange({ totalAmount, onPress }: {totalAmount: number, onPress: () => void }) {

    const { dates } = useSelector((state: RootState) => state.dates)

    const styles = StyleSheet.create({
        container: {
            minWidth: 186,
            height: 60,
            alignItems: "center",
            justifyContent: "center",
            gap: 2,
            marginHorizontal: 21,
            marginBottom: 14,
            backgroundColor: Colors.red
        },
        containerText: {
            height: 20,
            justifyContent: "center",
        },
        textSum: {
            fontWeight: "300",
            fontSize: 20,
            color: Colors.white,
        },
        textDate: {
            fontSize: 16,
            fontWeight: "300",
            color: Colors.brightBlue,
        },
    });

    return (

            <RectButton
                style={[
                    BasicStyles.shadowElements,
                    BasicStyles.border,
                    styles.container,
                ]}
                onPress={onPress}
            >
                <View style={styles.containerText}>
                    <Text style={[styles.textSum, BasicStyles.fontSemiBold]}>{Number(totalAmount.toFixed(2))}₽</Text>
                </View>
                <View style={styles.containerText}>
                    <Text style={[styles.textDate, BasicStyles.fontSemiBold]}>
                        {getFormatedDate(dates.startDate)} - {getFormatedDate(dates.endDate)}
                    </Text>
                </View>
            </RectButton>

    );
}
