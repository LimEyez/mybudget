import { Dates } from "@/constants/interfaces/Dates";
import { useEffect, useState } from "react";
import DatePicker, { RangeOutput } from "react-native-neat-date-picker"
import { languageSetting } from "@/constants/languageSettings";
import { Animated, Button, Dimensions, Modal, SafeAreaView, StyleSheet, Text, TouchableWithoutFeedback, View } from "react-native";
import { Colors } from "@/constants/Сolors";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StatusBar } from "expo-status-bar";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "@/redux/store";
import { setDates } from "@/redux/datesSlice";
import { parse } from "date-fns";

interface DatePickerRangeInterface {
    setShowDatePickerRange: (value: boolean) => void,
    showDatePickerRange: boolean
}

export default function DatePickerRange({ setShowDatePickerRange, showDatePickerRange }: DatePickerRangeInterface) {

    const { dates } = useSelector((state: RootState) => state.dates);

    const dispatch = useDispatch<AppDispatch>();

    const onCancelRange = () => {
        setShowDatePickerRange(false);
    };

    const onConfirmRange = (output: RangeOutput) => {
        setShowDatePickerRange(false);
        if (output.startDateString && output.endDateString) {
            dispatch(setDates({
                startDate: output.startDateString,
                endDate: output.endDateString
            }));
            // setDates({ startDate: output.startDateString, endDate: output.endDateString: output.endDateString })
        }
    };


    const styles = StyleSheet.create({
        overlay: {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)', // Затемнение фона
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000, // Расположить поверх всех остальных элементов
        },
        content: {
            width: 300,
            padding: 20,
            backgroundColor: 'white',
            borderRadius: 10,
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
        },
        text: {
            fontSize: 18,
            marginBottom: 20,
            textAlign: 'center',
        },
        button: {
            marginTop: 10,
            padding: 10,
            backgroundColor: '#007BFF',
            borderRadius: 5,
        },
        buttonText: {
            color: 'white',
            fontSize: 16,
        },
        modalContainer: {
            flex: 1,
        },
        modalContentContainer: {
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: "center",
            alignContent: "center",
            alignItems: "center"
        }
    });


    const colorOptions = {
        backgroundColor: Colors.white,
        headerColor: Colors.red,
        headerTextColor: Colors.white,
        selectedDateBackgroundColor: Colors.blue,
        selectedDateTextColor: Colors.white,
        weekDaysColor: Colors.green,
        changeYearModalColor: Colors.blue
    }



    return (
        <GestureHandlerRootView style={{ backgroundColor: "#000000" }}>
            <Modal
                onRequestClose={onCancelRange}
                statusBarTranslucent={true}
                transparent={true}
                style={styles.modalContainer}
                animationType="fade"
                visible={showDatePickerRange}>
                {/* <TouchableWithoutFeedback onPress={onCancelRange}> */}
                <View style={styles.modalContentContainer}>
                    <DatePicker
                        isVisible={showDatePickerRange}
                        mode={'range'}
                        onCancel={onCancelRange}
                        onConfirm={onConfirmRange}
                        startDate={parse(dates.startDate, "yyyy-MM-dd", new Date())}
                        endDate={parse(dates.endDate, "yyyy-MM-dd", new Date())}
                        customLanguageConfig={languageSetting}
                        colorOptions={colorOptions}
                        withoutModal={true}
                    />
                </View>
                {/* </TouchableWithoutFeedback> */}
            </Modal>
        </GestureHandlerRootView>
    )

}