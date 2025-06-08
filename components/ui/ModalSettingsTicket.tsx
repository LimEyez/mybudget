import { Colors } from "@/constants/Сolors";
import { getFormatedDate } from "@/services/DateFunctions";
import BasicStyles from "@/styles/BasicStyles";
import { format } from "date-fns";
import React, { useEffect, useRef, useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { GestureHandlerRootView, TextInput } from "react-native-gesture-handler";
import DatePickerDay from "./DatePickerDay";
import { useSQLiteContext } from "expo-sqlite";
import DataBase from "@/services/DataBase";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { fetchTickets } from "@/redux/ticketsSlice";
import Animated, { LinearTransition, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import LoadingModal from "./LoadingModal";
import { getHeightWindow } from "@/constants/sizes";

interface ModalSettingsTicketInterface {
    id: number,
    ticketName: string,
    date: string,
    showSettingsTicket: boolean,
    setShowSettingsTicket: (value: boolean) => void,
    getTicketInfo: () => void
}

export default function ModalSettingsTicket({ id, ticketName, date = format(Date.now(), "yyyy-MM-dd"), showSettingsTicket, setShowSettingsTicket, getTicketInfo }: ModalSettingsTicketInterface) {

    const [showLoader, setShowLoader] = useState(false);

    const { dates } = useSelector((state: RootState) => state.dates);
    const dispatch = useDispatch<AppDispatch>();

    const DB = new DataBase(useSQLiteContext());

    const onCancelSetting = () => {
        setShowSettingsTicket(false);
    };

    const onConfirmSetting = async () => {
        try {
            setShowLoader(true);
            const result = await DB.updateNameAndDateTicket({ ticketId: id, date: dateConfirm, name: nameConfirm });
            if (result?.changes == 1 || result?.changes == 2) {
                dispatch(fetchTickets({ dates, DB }));
                getTicketInfo();
            }
        } catch (error) {
            console.log(error)
        } finally {
            setShowLoader(false);
            setShowSettingsTicket(false);
        }
    };

    const [dateConfirm, setDateConfirm] = useState<Date>(new Date(date));
    const [nameConfirm, setNameConfirm] = useState<string>(ticketName);
    const [showDatePickerDay, setShowDatePickerDay] = useState<boolean>(false);

    const refDateInput = useRef<Text>(null);
    const refNameTicketInput = useRef<TextInput>(null);

    const styles = StyleSheet.create({
        loadingContainer: {
            ...StyleSheet.absoluteFillObject,
            height: getHeightWindow(),
            justifyContent: "center",
            alignItems: "center",
            marginTop: 15,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
        },
        modalContainer: {
            flex: 1,
            zIndex: 1000
        },
        modalContentContainer: {
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: "center",
            alignContent: "center",
            alignItems: "center",
            paddingHorizontal: 22
        },
        windowContent: {
            alignSelf: "center",
            width: "100%",
            paddingHorizontal: 22,
            paddingVertical: 22,
            backgroundColor: Colors.white,
            justifyContent: "center",
            borderWidth: 1,
            borderColor: Colors.blue

        },
        textInput: {
            flex: 1,
            backgroundColor: Colors.white,
            color: Colors.blue,
            paddingHorizontal: 10
        },
        dateInput: {
            backgroundColor: Colors.white,
            color: Colors.blue,
            paddingHorizontal: 10,
        },
        textContainer: {
            fontSize: 16,
            color: Colors.red,
            marginBottom: 6,
            textAlign: "left"
        },
        dateContainer: {
            height: 40,
            width: "100%",
            justifyContent: "center",
            alignContent: "center",
            borderWidth: 1,
            marginBottom: 6,
            borderColor: Colors.blue,
            backgroundColor: Colors.white,
        },
        nameContainer: {
            height: 40,
            width: "100%",
            borderWidth: 1,
            marginBottom: 6,
            borderColor: Colors.blue,
            backgroundColor: Colors.white
        },
        buttonsContainer: {
            height: 40,
            flexDirection: "row",
            marginTop: 10
        },
        cancelButtonContainer: {
            flex: 1,
            alignItems: "flex-start",
            justifyContent: "center",
            paddingHorizontal: 10
        },
        confirmButtonContainer: {
            flex: 1,
            alignItems: "flex-end",
            justifyContent: "center",
            paddingHorizontal: 10,
        },
        cancelButtonText: {
            color: Colors.darkGray,
            fontSize: 20
        },
        confirmButtonText: {
            color: Colors.blue,
            fontSize: 20
        }
    });

    useEffect(() => {
        setDateConfirm(new Date(date));
        setNameConfirm(ticketName);
    }, [showSettingsTicket])

    return (
        <GestureHandlerRootView>
            <Modal onRequestClose={onCancelSetting} style={styles.modalContainer} visible={showSettingsTicket} statusBarTranslucent={true} transparent={true} animationType="fade">
                <View style={styles.modalContentContainer}>
                    <View style={[BasicStyles.border, BasicStyles.shadowElements, styles.windowContent]}>
                        <Text style={[BasicStyles.fontSemiBold, styles.textContainer]}>Название магазина</Text>
                        <View style={[BasicStyles.border, BasicStyles.shadowElements, styles.nameContainer]}>
                            <TextInput ref={refNameTicketInput} style={[BasicStyles.border, BasicStyles.fontSemiBold, styles.textInput]} placeholder={`Чек от ${getFormatedDate(dateConfirm)}`}
                                defaultValue={nameConfirm} onChangeText={setNameConfirm}
                            />
                        </View>
                        <Text style={[BasicStyles.fontSemiBold, styles.textContainer]}>Дата</Text>
                        <Pressable onPressOut={() => { setShowDatePickerDay(true) }} style={[BasicStyles.border, BasicStyles.shadowElements, styles.dateContainer]}>
                            <Text ref={refDateInput} style={[BasicStyles.border, BasicStyles.fontSemiBold, styles.dateInput]}>
                                {format(dateConfirm, "dd.MM.yyyy")}
                            </Text>
                        </Pressable>
                        <View style={styles.buttonsContainer}>
                            <View style={styles.cancelButtonContainer}>
                                <Pressable onPressOut={onCancelSetting}>
                                    <Text style={[styles.cancelButtonText]}>Отмена</Text>
                                </Pressable>
                            </View>
                            <View style={styles.confirmButtonContainer}>
                                <Pressable onPressOut={onConfirmSetting}>
                                    <Text style={[styles.confirmButtonText]}>Сохранить</Text>
                                </Pressable>
                            </View>

                        </View>
                    </View>
                </View>

            </Modal>
            <DatePickerDay date={dateConfirm} setDate={(date: Date) => setDateConfirm(date)} setShowDatePickerDay={setShowDatePickerDay} showDatePickerDay={showDatePickerDay} />
        </GestureHandlerRootView>
    )
}