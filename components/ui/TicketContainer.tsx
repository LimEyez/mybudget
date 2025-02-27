import { Ticket } from "@/constants/interfaces/Ticket"
import { Colors } from "@/constants/Сolors"
import { getFormatedDate } from "@/services/DateFunctions"
import BasicStyles from "@/styles/BasicStyles"
import { router } from "expo-router"
import React from "react"
import { StyleSheet, Text, View } from "react-native"

export default function TicketContainer({id, date, name, amount}: Ticket) {

    const styles = StyleSheet.create({
        containerTicket: {
            flex: 1,
            height: 51,
            marginTop: 9,
            paddingHorizontal: 15,
            marginHorizontal: 21,
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: Colors.white,
        },
        textName: {
            flex: 1,
            fontSize: 16,
            color: Colors.red
        },
        textSum: {
            flex: 1,
            textAlign: "right",
            fontSize: 16,
            color: Colors.green
        },
    })

    return (
        <View style={[styles.containerTicket, BasicStyles.border, BasicStyles.shadowElements]}>
            <Text style={[styles.textName, BasicStyles.fontSemiBold]}>{name}</Text>
            <Text style={[styles.textSum, BasicStyles.fontSemiBold]}>-{amount}₽</Text>
        </View>
    )
}