import Separator from "@/components/ui/Separator"
import LoadingModal from "@/components/ui/LoadingModal"
import ModalProductSettings from "@/components/ui/ModalSettingsProduct"
import ModalSettingsTicket from "@/components/ui/ModalSettingsTicket"
import PlusIcon from "@/components/ui/PlusIcon"
import SwipeableElement from "@/components/ui/SwipeableElement"
import { Product } from "@/constants/interfaces/Product"
import { getHeightWindow, Sizes } from "@/constants/sizes"
import { Colors } from "@/constants/Сolors"
import { AppDispatch, RootState } from "@/redux/store"
import { fetchTickets } from "@/redux/ticketsSlice"
import DataBase from "@/services/DataBase"
import { getFormatedDate } from "@/services/DateFunctions"
import BasicStyles from "@/styles/BasicStyles"
import { useHeaderHeight } from "@react-navigation/elements"
import { useRoute } from "@react-navigation/native"
import { format } from "date-fns"
import { useFocusEffect, useLocalSearchParams, useNavigation, useRouter } from "expo-router"
import { useSQLiteContext } from "expo-sqlite"
import { memo, useCallback, useEffect, useRef, useState } from "react"
import { Dimensions, FlatList, PixelRatio, Pressable, SafeAreaView, StatusBar, StyleSheet, Text, View } from "react-native"
import { Gesture, GestureDetector, GestureHandlerRootView, RectButton, TouchableOpacity } from "react-native-gesture-handler"
import Animated, { FadeIn, FadeInDown, FadeInUp, FadeOut, FadeOutUp, LinearTransition, runOnJS, useAnimatedStyle, ZoomIn, ZoomOut } from "react-native-reanimated"
import { initialWindowMetrics, SafeAreaProvider, useSafeAreaInsets } from "react-native-safe-area-context"
import { useDispatch, useSelector } from "react-redux"

function TicketScreen({ route }: { route: any }) {

    const styles = StyleSheet.create(
        {
            contentContainer: {
                height: getHeightWindow(),
                backgroundColor: Colors.white,
                paddingTop: Sizes.mainContainerPaddingTop,
                flexDirection: "column"
            },
            swipeableContainer: {
                height: 80,
                justifyContent: "center",
                alignItems: "center",
                // backgroundColor: Colors.blue
            },
            amountContainer: {
                flex: 1,
                minWidth: 186,
                maxHeight: 60,
                alignItems: "center",
                justifyContent: "center",
                gap: 2,
                marginHorizontal: 21,
                backgroundColor: Colors.red,
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
            containerProduct: {
                flexDirection: "column",
                justifyContent: "center",
                alignContent: "center",
                alignItems: "center",
            },
            containerProductRectButton: {
                height: 68,
                paddingHorizontal: 15,
                marginHorizontal: 21,
                flexDirection: "column",
                justifyContent: "center",
                alignContent: "center",
                alignItems: "center",
                backgroundColor: Colors.white,
                borderWidth: 1,
                borderColor: Colors.blue

            },
            containerNameAmount: {
                flex: 1,
                maxHeight: 22,
                flexDirection: "row",
                // color: 'black'
            },
            containerQuantityPrice: {
                flex: 1,
                maxHeight: 17,
                width: "100%",
                alignSelf: 'flex-start',
            },
            textName: {
                flex: 1,
                fontSize: 16,
                color: Colors.red
            },
            textAmountProduct: {
                color: Colors.green,
                fontSize: 16
            },
            textQuantityPrice: {
                color: Colors.blue,
                fontSize: 14,
            },
            buttonContainer: {
                width: 60,
                height: 60,
                position: "absolute",
                backgroundColor: Colors.white,
                borderColor: Colors.blue,
                borderWidth: 1,
                bottom: 20,
                alignSelf: "center",
                justifyContent: "center",
                alignItems: "center",

            },
            flatList: {
                flex: 1,
                // paddingBottom: 100,
                // backgroundColor: Colors.green
            }
        }
    )

    const AnimatedRectButton = Animated.createAnimatedComponent(RectButton);

    const DB = new DataBase(useSQLiteContext());

    const navigation = useNavigation();
    const router = useRouter();

    const dispatch = useDispatch<AppDispatch>();

    const { dates } = useSelector((state: RootState) => state.dates);

    const { id } = useLocalSearchParams<{ id: string }>();

    const [loading, setLoading] = useState<boolean>(true);
    const [products, setProducts] = useState<Product[]>([]);
    const [showSettingsTicket, setShowSettingsTicket] = useState<boolean>(false);
    const [ticketInfo, setTicketInfo] = useState<{ name: string, date: string, amount: number }>({ name: '', date: format(Date.now(), "yyyy-MM-dd"), amount: 0 });
    const [showProductSettings, setShowProductSettings] = useState<boolean>(false);
    const [infoChangeableTicket, setInfoChangeableTicket] = useState<Product | null>();
    // const infoChangeableTicket = useRef<Product | null>(null);

    function resetInfoChangeableTicket() {
        setInfoChangeableTicket(null);
    }

    function changeNewInfoChangeableTicket() {
        setInfoChangeableTicket(({ ticketId: Number(id), id: 0, name: "", quantity: 1, price: 0, amount: 0 }));
    }

    function changeInfoChangeableTicket(product: Product) {
        setInfoChangeableTicket(product);
    }

    async function getTicketInfo() {
        const ticketInfo = await DB.getTicketInfo(Number(id));
        if (ticketInfo != null) {
            setTicketInfo({ name: ticketInfo?.name, date: format(new Date(ticketInfo?.date), "yyyy-MM-dd"), amount: ticketInfo?.amount });
            if (ticketInfo.name) {
                navigation.setOptions({ title: ticketInfo.name })
            } else {
                navigation.setOptions({ title: `Чек от ${format(new Date(ticketInfo.date), "dd.MM.yyyy")}` })
            }
        };
    }

    async function getProducts() {
        const productFromDB = await DB.getProducts(Number(id));
        if (productFromDB.length >= 0) {
            setProducts(productFromDB);
        }
    }

    async function deleteProduct(productId: number) {
        await DB.deleteProduct(productId);
        await DB.updateAmountticket({ ticketId: Number(id) });
        await getTicketInfo();
        await getProducts();
    }

    const renderItem = useCallback(({ item, index }: { item: Product, index: number }) => {
        const delay = 50 + 20 * index;

        function tapFunction() {
            changeInfoChangeableTicket(item)
        }

        return (
            <Animated.View
                entering={FadeInDown.delay(delay)}
                exiting={FadeOutUp}
                layout={LinearTransition}
            // style={[styles.containerProduct]}
            >
                <SwipeableElement
                    swipeableContainerStyle={styles.swipeableContainer}
                    deleteFunc={() => { deleteProduct(item.id) }}>
                    <RectButton
                        onPress={tapFunction}
                        style={[
                            BasicStyles.border,
                            styles.containerProductRectButton,
                            // BasicStyles.shadowElements
                        ]}
                    >

                        <View style={[styles.containerNameAmount]}>
                            <Text style={[styles.textName, BasicStyles.fontSemiBold]}>{item.name}</Text>
                            <Text style={[styles.textAmountProduct, BasicStyles.fontSemiBold]}>{Number(item.amount.toFixed(2))}₽</Text>
                        </View>
                        <View style={[styles.containerQuantityPrice]}>
                            <Text style={[styles.textQuantityPrice, BasicStyles.fontSemiBold]}>
                                {Number(item.quantity.toFixed(3))} × {Number(item.price.toFixed(2))}₽
                            </Text>
                        </View>
                    </RectButton>
                </SwipeableElement>
            </Animated.View>
        )

    }, []
    )

    useEffect(() => {
        if (infoChangeableTicket != null) {
            setShowProductSettings(true);
        }
    }, [infoChangeableTicket])


    useEffect(() => {

        async function loadInfo(){
            //Получение чеков
            try {
                // Включаем индикатор загрузки
                setLoading(true);
        
                // Получение чеков
                await getProducts();
        
                // Получение информации о чеке из БД
                await getTicketInfo();
        
                // Выключаем индикатор загрузки после завершения всех операций
                setTimeout(() => {
                    setLoading(false); // Выключаем индикатор загрузки в случае ошибки
                }, 1000)
            } catch (error) {
                // Обработка ошибок, если что-то пошло не так
                console.error("Ошибка при загрузке данных:", error);
                setTimeout(() => {
                    setLoading(false); // Выключаем индикатор загрузки в случае ошибки
                }, 500)
            }
        }
        
        if (loading) {
            loadInfo();
        }

        //Функция удаления чека
        async function deleteTicket() {
            const changes = await DB.deleteTicket(Number(id));
            dispatch(fetchTickets({ dates, DB }))

        };

        //Обработка чека при возврате на главный экран (удалить или не удалить)
        const unsubscribe = navigation.addListener("beforeRemove", (event) => {
            // event.preventDefault();
            async function getProducts() {
                const productsByTicketId = await DB.getProductsByTicketId(Number(id));
                if (productsByTicketId.length == 0) {
                    deleteTicket();
                }
            }
            getProducts();
            // router.push('/');
        });
        return unsubscribe
    }, [navigation]);


    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <LoadingModal showLoader={loading} />
            </View>
        )
    }

    return (
        <GestureHandlerRootView>
            <SafeAreaView style={styles.contentContainer}>
                <AnimatedRectButton
                    entering={ZoomIn}
                    exiting={ZoomOut}
                    layout={LinearTransition}
                    onPress={() => { setShowSettingsTicket(true) }}
                    style={[BasicStyles.shadowElements, BasicStyles.border, styles.amountContainer]}
                >
                    <View style={styles.containerText}>
                        <Text style={[styles.textSum, BasicStyles.fontSemiBold]}>{ticketInfo.amount.toFixed(2)}₽</Text>
                    </View>
                    <View style={styles.containerText}>
                        <Text style={[styles.textDate, BasicStyles.fontSemiBold]}>
                            {getFormatedDate(ticketInfo.date)}
                        </Text>
                    </View>
                </AnimatedRectButton>
                <Separator title={"Товары"} />

                <View style={styles.flatList}>
                    <FlatList
                        style={styles.flatList}
                        data={products}
                        renderItem={renderItem}
                        keyExtractor={(item) => `ProductWithId${item.id}`}
                        scrollEnabled={true}
                        contentContainerStyle={{ paddingBottom: 100 }}
                    />
                </View>
                <RectButton onPress={changeNewInfoChangeableTicket} style={[BasicStyles.border, BasicStyles.shadowElements, styles.buttonContainer]}>
                    <PlusIcon strokeWidth="1" stroke={Colors.red} width="40" height="40" fill={Colors.blue} />
                </RectButton>
            </SafeAreaView>
                        <ModalSettingsTicket
                            id={Number(id)}
                            showSettingsTicket={showSettingsTicket}
                            setShowSettingsTicket={(value: boolean) => setShowSettingsTicket(value)}
                            date={ticketInfo.date}
                            ticketName={ticketInfo.name}
                            getTicketInfo={getTicketInfo}
                        />
                        <ModalProductSettings
                            showProductSettings={showProductSettings}
                            setShowProductSettings={(value: boolean) => { setShowProductSettings(value) }}
                            infoProduct={infoChangeableTicket ? infoChangeableTicket : { ticketId: -1, id: 0, name: "", quantity: 1, price: 0, amount: 0 }}
                            updateProductsListAndTicketInfo={() => { getProducts(); getTicketInfo() }}
                            resetInfo={() => resetInfoChangeableTicket()}
                        />
        </GestureHandlerRootView>
    )
}

export default TicketScreen