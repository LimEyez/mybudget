
import { StyleSheet, View } from "react-native";
import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { useEffect, useMemo, useRef, useState } from "react";
import InfoOfDateRange from "./InfoOfDateRange";

import { Colors } from "@/constants/Сolors";
import DataBase from "@/services/DataBase";

import { useSQLiteContext } from "expo-sqlite";
import SectionListTickets from "./SectionListTickets";
import { TotalAmount } from "@/constants/interfaces/TotalAmount";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { fetchTickets } from "@/redux/ticketsSlice";
import { ScrollView } from "react-native-gesture-handler";
import LoadingModal from "./LoadingModal";

interface ListTicketsInterface {
    snapPoints: (number | string)[],
    openDatePickerRange: () => void
}



export default function ListTickets({ snapPoints, openDatePickerRange }: ListTicketsInterface) {

    const dispatch = useDispatch<AppDispatch>();

    const { dates } = useSelector((state: RootState) => state.dates)
    const { amount } = useSelector((state: RootState) => state.tickets);


    const DB = new DataBase(useSQLiteContext());

    const bottomSheetRef = useRef<BottomSheet>(null);

    const styles = StyleSheet.create({
        handleIndicatorStyle: {
            width: 55,
            height: 4,
            backgroundColor: Colors.white,
            shadowOffset: {
                width: 0,
                height: 2,
            },
            shadowRadius: 4,
            shadowOpacity: 0.25
        },
        contentContainer: {
            flex: 1,
            // paddingHorizontal: 22
        },
        listTickets: {
            // flex: 1,
            marginTop: 21,
            borderColor: "#00000025",
            borderWidth: 1,
            alignItems: "center",
            borderRadius: 25
        },
        shodowListTickets: {
            shadowColor: "black",
            shadowOpacity: 0.1,
            shadowOffset: { width: 0, height: -4 },
            shadowRadius: 4.8,
            elevation: 5
        },
    })


    useEffect(() => {

        if (dates.startDate && dates.endDate) {
            dispatch(fetchTickets({ dates, DB }))
        }
    }, [dates]);


    return (
        <BottomSheet
            ref={bottomSheetRef}
            snapPoints={snapPoints}
            index={0}
            enablePanDownToClose={false}
            enableDynamicSizing={false}
            backgroundStyle={
                {
                    backgroundColor: Colors.gray
                }
            }
            handleIndicatorStyle={styles.handleIndicatorStyle}
        >

                    <InfoOfDateRange totalAmount={amount} onPress={openDatePickerRange} />
                    <SectionListTickets />

        </BottomSheet>
    )
};

