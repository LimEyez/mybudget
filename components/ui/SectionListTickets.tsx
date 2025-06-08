import { Ticket } from "@/constants/interfaces/Ticket";
import { Colors } from "@/constants/Сolors";
import { getFormatedDate } from "@/services/DateFunctions";
import BasicStyles from "@/styles/BasicStyles";
import { BottomSheetSectionList } from "@gorhom/bottom-sheet";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Pressable, SectionList, StyleSheet, Text, View } from "react-native";
import DateContainer from "./Separator";
import { format, parse } from "date-fns";
import SwipeableElement from "./SwipeableElement";
import { RectButton } from "react-native-gesture-handler";
import DataBase from "@/services/DataBase";
import { useSQLiteContext } from "expo-sqlite";
import { useDispatch, useSelector } from "react-redux";
import { fetchTickets } from "@/redux/ticketsSlice";
import { AppDispatch, RootState } from "@/redux/store";
import ModalConfirm from "./ModalConfirm";
import { SwipeableMethods } from "react-native-gesture-handler/lib/typescript/components/ReanimatedSwipeable";
import { useFocusEffect } from "@react-navigation/native";
import Animated, { FadeIn, FadeOut, LinearTransition } from "react-native-reanimated";
// import TicketContainer from "./ticketContainer";

interface SectionsTickets {
  title: string,
  data: Ticket[]
}

export default function SectionListTickets() {

  const { tickets } = useSelector((state: RootState) => state.tickets);

  const ticketsMemo = useMemo(() => tickets, [tickets])

  const router = useRouter();

  const DB = new DataBase(useSQLiteContext());

  const { dates } = useSelector((state: RootState) => state.dates);

  const dispatch = useDispatch<AppDispatch>();

  const grupedTickets = (tickets: Ticket[]): SectionsTickets[] => {
    const grupedticketsArr = tickets.reduce((acc: SectionsTickets[], item) => {
      const existingEntry = acc.find((entry: SectionsTickets) => entry.title === format(new Date(item.date), "dd.MM.yyyy"));
      if (existingEntry) {
        // Если дата уже существует, добавляем чек в массив data
        existingEntry.data.push(item);
      } else {
        // Если даты еще нет, создаем новый объект
        acc.push({
          title: getFormatedDate(item.date),
          data: [item],
        });
      }
      return acc;
    }, []);

    return grupedticketsArr.sort((a, b) => {
      const dateA = parse(a.title, "dd.MM.yyyy", new Date());
      const dateB = parse(b.title, "dd.MM.yyyy", new Date());
      return dateB.getTime() - dateA.getTime();
    });
  }

  const sections = useMemo(() => grupedTickets(ticketsMemo), [ticketsMemo]);

  const styles = StyleSheet.create({

    containerScrollViewListTickets: {
      // width: windowWidth - 42,
      // marginHorizontal: 21,
      alignItems: "center",
      justifyContent: "center"
    },
    containerSectionHeader: {
      marginTop: 14,
      marginHorizontal: 21,
      flex: 1
    },
    containerListTickets: {
      width: "100%"
    },
    swipeableContainer: {
      height: 68,
      justifyContent: "center",
      alignItems: "center"
    },
    contentContainerStyleListTicket: {
      paddingBottom: 100
    },
    containerTicket: {
      height: 50,
      paddingHorizontal: 15,
      marginHorizontal: 21,
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: Colors.white,
    },
    handleIndicatorStyle: {
      backgroundColor: Colors.white,
      width: 55,
      height: 4,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowRadius: 4,
      shadowOpacity: 0.25
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

  const renderSectionHeader = useCallback(
    ({ section }: { section: SectionsTickets }) => (
      <DateContainer title={section.title} />
    ),
    []
  );
  
  const renderItem = useCallback(({ item, index }: { item: Ticket, index: number }) => {

    const delay = 50 + 50 * index

    const deleteTicket = useCallback(async () => {
      await DB.deleteTicket(item.id);
      dispatch(fetchTickets({ dates, DB }));
    }, [dates])

    return (
      <Animated.View
        entering={FadeIn.delay(delay)}
        exiting={FadeOut.duration(300)}
        layout={LinearTransition}
      >
        <SwipeableElement
          swipeableContainerStyle={styles.swipeableContainer}
          deleteFunc={() => { deleteTicket() }}
        >
          <RectButton
            style={[styles.containerTicket, BasicStyles.border,
              // BasicStyles.shadowElements
            ]}
            key={item.name + item.id}
            onPress={() => { router.push({ pathname: '/ticket/[id]', params: { id: item.id, name: item.name, date: item.date } }) }}
          >
            <Text style={[styles.textName, BasicStyles.fontSemiBold]}>{item.name != '' ? item.name : `Чек от ${getFormatedDate(item.date)}`}</Text>
            <Text style={[styles.textSum, BasicStyles.fontSemiBold]}>-{parseFloat(item.amount.toFixed(2))}₽</Text>
          </RectButton>
        </SwipeableElement>
      </Animated.View>
    )
  }, [dates])



  return (
    <BottomSheetSectionList
      sections={sections}
      keyExtractor={(i: Ticket) => `TicketOf${i.date}IDis${i.id}`}
      renderSectionHeader={renderSectionHeader}
      renderItem={renderItem}
      contentContainerStyle={styles.contentContainerStyleListTicket}
      style={styles.containerListTickets}
    >

    </BottomSheetSectionList>
  )
}