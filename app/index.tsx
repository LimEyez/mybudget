import React, { useMemo, useRef, useState } from "react";
import { registerRootComponent } from "expo"
import { AppRegistry } from "react-native";
import { SafeAreaView, StyleSheet, View, LayoutChangeEvent, Modal, Text, Button } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import InfoByMonth from "../components/ui/InfoByMonth";
import { Colors } from "@/constants/Сolors"
import ButtonMainPage from "../components/ui/ButtonMainPage";
import ListTickets from "../components/ui/ListTickets";
import { Sizes } from "@/constants/sizes";
import DatePickerRange from "@/components/ui/DatePickerRange";
import TicketIcon from "@/components/ui/ticketIcon";
import QrIcon from "@/components/ui/qrIcon";
import { useRouter } from "expo-router";
import DataBase from "@/services/DataBase";
import { useSQLiteContext } from "expo-sqlite";
import { SafeAreaProvider } from "react-native-safe-area-context";

// registerRootComponent(Index)

export default function Index() {
  const [contentHeight, setContentHeight] = useState(0); // Храним высоту контента
  const [containerHeight, setContainerHeight] = useState(0); // Храним высоту mainContainer
  const [hasMeasuredContainer, setHasMeasuredContainer] = useState(false);
  const [hasMeasuredContent, setHasMeasuredContent] = useState(false);

  // console.log(contentHeight, containerHeight)
  const refMainContainer = useRef<SafeAreaView>(null);

  const DB = new DataBase(useSQLiteContext());

  const router = useRouter();

  // Обработчик layout для получения высоты mainContainer
  const handleLayoutContainer = (event: LayoutChangeEvent) => {
    if (!hasMeasuredContainer) {
      const { height } = event.nativeEvent.layout;
      setContainerHeight(height);
      setHasMeasuredContainer(true);
    }
  };
    // Обработчик layout для получения высоты контента
  const handleLayoutContent = (event: LayoutChangeEvent) => {
    if (!hasMeasuredContent) {
      const { height } = event.nativeEvent.layout;
      setContentHeight(height);
      setHasMeasuredContent(true);
    }
  };

  const [showDatePickerRange, setShowDatePickerRange] = useState(false)

  //Функция изменения state для отображения окна настройки промежутка дат списка чеков
  const openDatePickerRange = () => {
    setShowDatePickerRange(true);
  }

  // const routeNewTicket = () => { router.push({ pathname: '/ticket/[id]', params: { id: "0", name: '', date: "" } }) };

  //Функция для создания нового чека и открытия экрана его просмотра
  const routeNewTicket = () => {
    const addTicketFunc = async () => {
      const newTicketId = await DB.addTicket();
      if (typeof newTicketId == "number") {
        router.push({
          pathname: '/ticket/[id]',
          params: {
            id: newTicketId,
            name: '',
            date: ""
          }
        })
      } else {
        console.log("Ошибка создания нового чека")
      }
    };
    addTicketFunc();
  };

  const routeScanner = () => {
    router.push({ pathname: '/scanner' })
  };

  const clearDB = () => {
    const deleteFunc = async () => {
      await DB.clearDatabase();
    };
    deleteFunc();
  }

  // clearDB()


  // Мемоизация snapPoints с учетом высоты контейнера и контента
  const snapPoints = useMemo(() => {
    const minHeight = containerHeight - contentHeight - Sizes.mainContainerPaddingTop > 0 ?
      // Разница между высотой контейнера и высотой контента
      containerHeight - contentHeight - Sizes.mainContainerPaddingTop - 20 : "20%";
    return [minHeight, "95%"]; // Мин. высота + 90% от высоты экрана
  }, [contentHeight, containerHeight]); // Запуск при изменении высоты контента или контейнера

  const styles = StyleSheet.create({
    mainContainer: {
      flex: 1,
      paddingTop: Sizes.mainContainerPaddingTop,
      backgroundColor: Colors.white,
    },
    buttonsContainer: {
      height: 84,
      maxWidth: "100%",
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: 21,
      marginHorizontal: 21,
      gap: 21,
    },
    modalContainer: {
      flex: 1,
      justifyContent: "center", // Центрирование по вертикали
      alignItems: "center", // Центрирование по горизонтали
      backgroundColor: "rgba(0, 0, 0, 0.5)", // Прозрачный фон
      padding: 500, // Дополнительные отступы
    }
  });

  return (
    <GestureHandlerRootView>
      <SafeAreaProvider>
        <SafeAreaView
          style={styles.mainContainer}
          ref={refMainContainer}
          onLayout={handleLayoutContainer}
        >
          <View onLayout={handleLayoutContent}>
            <InfoByMonth />
            <View style={styles.buttonsContainer}>
              <ButtonMainPage backgroundColor={Colors.yelow} onPressFunction={routeNewTicket}>
                <TicketIcon width="74" height="74" />
              </ButtonMainPage>
              <ButtonMainPage backgroundColor={Colors.blue} onPressFunction={routeScanner}>
                <QrIcon width="74" height="74" />
              </ButtonMainPage>
            </View>
          </View>
          <ListTickets snapPoints={snapPoints} openDatePickerRange={() => { openDatePickerRange() }} />
          <DatePickerRange
            showDatePickerRange={showDatePickerRange}
            setShowDatePickerRange={(value: boolean) => setShowDatePickerRange(value)} />
        </SafeAreaView>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
