import { AppState, Dimensions, SafeAreaView, StatusBar, StyleSheet, 
    TouchableOpacity, Text, Modal, View, Button } from "react-native";
import { OverlayCamera } from "@/components/ui/OverlayCamera";
import { useEffect, useRef, useState } from "react";
import { useHeaderHeight } from "@react-navigation/elements";
import Animated, { Easing, FadeIn, FadeInDown, FadeInUp, FadeOut, FadeOutDown, LinearTransition, 
    useAnimatedStyle, useDerivedValue, useSharedValue, withTiming, 
    ZoomIn, ZoomOut } from "react-native-reanimated";
import { GestureHandlerRootView, RectButton } from "react-native-gesture-handler";
import LoadingModal from "@/components/ui/LoadingModal";
import { LoaderTicketInfo } from "@/services/LoaderTicketInfo";
import { getHeightWindow } from "@/constants/sizes";
import { BarcodeScanningResult, CameraView, useCameraPermissions } from "expo-camera";
import { transform } from "@babel/core";
import ModalMessage, { ModalMessageInterface } from "@/components/ui/ModalMessage";
import { Colors } from "@/constants/Сolors";
import DataBase from "@/services/DataBase";
import { useSQLiteContext } from "expo-sqlite";
import { useRouter } from "expo-router";
import { format } from "date-fns";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { fetchTickets } from "@/redux/ticketsSlice";
import * as ImagePicker from 'expo-image-picker';
import * as RNQRGenerator from 'rn-qr-generator';
import FlashLightIcon from "@/components/ui/FlashLightIcon";
import PhotoLibraryImage from "@/components/ui/PhotoLibraryImage";
import BasicStyles from "@/styles/BasicStyles";

export default function Scanner() {
    const qrLock = useRef(false);
    const appState = useRef(AppState.currentState);
    const refCamera = useRef<CameraView>(null);
    const tokenQr = useRef<string | null>(null);
    const lastScanTime = useRef<number | null>(null); // Последнее время сканирования
    const refModalMessage = useRef<ModalMessageInterface>(null);
    const loader = new LoaderTicketInfo();
    const [cameraSize, setCameraSize] = useState({ width: 0, height: 0 });
    const [qrDetected, setQrDetected] = useState(false);
    const [showLoader, setShowLoader] = useState(false);
    const [pressedReqButton, setPressedReqButton] = useState(false);
    const [flashStatus, setFlashStatus] = useState(false);
    const [permission, requestPermission] = useCameraPermissions();
    const DB = new DataBase(useSQLiteContext());
    const router = useRouter();
    const dispatch = useDispatch<AppDispatch>();
    const { dates } = useSelector((state: RootState) => state.dates);
    const opacityLoader = useSharedValue(0);
    const loadingScreenAnimatedStyle = useAnimatedStyle(() => { return { 
        opacity: withTiming(opacityLoader?.value, { duration: 300 }) } 
    })
    const pickerFunction = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
        });

        if (!result.canceled) {
            await loadInfoFromImage(result.assets[0].uri);
        }
    }


    useEffect(() => {
        const checkQrTimeout = setInterval(() => {
            if (lastScanTime.current && Date.now() - lastScanTime.current > 200) {
                setQrDetected(false);
                tokenQr.current = null;
                lastScanTime.current = null;
            }
        }, 1000); // Проверяем каждые 500 мс

        const subscription = AppState.addEventListener("change", (nextAppState) => {
            if (nextAppState === "active" && !showLoader) {
                refCamera.current?.resumePreview();
            }
        });

        return () => {
            subscription.remove(); // Отписываемся от событий AppState при размонтировании
            clearInterval(checkQrTimeout);
        };
    }, []);


    useEffect(() => {
        if (pressedReqButton) {
            opacityLoader.value = 1;
            setShowLoader(true);
            // setPressedReqButton(true); // Показываем анимацию загрузки
        } else {
            opacityLoader.value = 0;
            setShowLoader(false);
            // setTimeout(() => setPressedReqButton(false), 300); // Ждём FadeOut перед удалением
        }
    }, [pressedReqButton]);

    // Функция нажатия кнопки запроса
    const onPressLoadTicket = async () => {
        //Проверяем, что токен активен (является строкой)
        if (typeof tokenQr.current == "string") {
            setPressedReqButton(true);
            //получение информации о чеке
            const result = await getTicketInfo(tokenQr.current);
            if (result == null) {
                refModalMessage.current?.showMessage();
                setPressedReqButton(false);
            }
        }
    }

    const loadInfoFromImage = async (uri: string) => {
        RNQRGenerator.default.detect({ uri }).then((response) => {
            // console.log(response.values);
            tokenQr.current = response.values[0];
            onPressLoadTicket();
        })
    }

    async function addTicketFunc(ticketData: any): Promise<number | null> {
        const date = format(new Date(ticketData.dateTime), "yyyy-MM-dd");
        const nameShop = ticketData.user;
        const products = ticketData.items;

        function convertPrice(price: number) {
            const priceString = String(price);
            const pennies = priceString.slice(-2);
            const rubles = priceString.slice(0, priceString.length - 2);
            const correctPrice = Number(rubles + "." + pennies);
            return correctPrice
        }

        const newTicketId = await DB.addTicket(nameShop, date, 0);

        async function addProduct(newTicketId: number, name: string, 
            quantity: number, price: number, amount: number) {
            await DB.addProduct(newTicketId, name, quantity, price, amount)
        }

        if (typeof newTicketId == "number") {
            products.forEach((product: any) => {
                const name = product.name;
                const quantity = product.quantity;
                const price = convertPrice(product.price);
                const amount = Number((price * quantity).toFixed(2));
                addProduct(newTicketId, name, quantity, price, amount);
            });
            await DB.updateAmountticket({ ticketId: newTicketId });
            return newTicketId;
        } else {
            return null;
        }
    };

    //Получение информации о чеке
    async function getTicketInfo(tokenQr: string) {
        const params = await loader.getParams(tokenQr);
        let ticketData = null;

        if (params == null) {
            return null;
        } else {
            const paramsString = JSON.stringify(params);
            const ticketDataFromDB = await DB.getTicketInfoByToken(paramsString);

            if (ticketDataFromDB == null) {
                const ticketDataFromServer = await loader.fetchRequestTicket(params);
                if (ticketDataFromServer == null) {
                    return null;
                } else {
                    console.log(paramsString, "add to db")
                    const ticketDataFromServerString = JSON.stringify(ticketDataFromServer);
                    await DB.addTicketInfoByToken(paramsString, ticketDataFromServerString);
                    ticketData = ticketDataFromServer;
                }
            } else {
                try {
                    const ticketDataFromDBJson = JSON.parse(ticketDataFromDB);
                    ticketData = ticketDataFromDBJson;
                } catch (error) {
                    console.log("Ошибка преобразования", error);
                    return null;
                }
            }
            const newTicketId = await addTicketFunc(ticketData.json);
            if (newTicketId == null) {
                return null;
            } else {
                dispatch(fetchTickets({ dates, DB }));
                setShowLoader(false);
                setPressedReqButton(false);
                router.push({ pathname: '/ticket/[id]', params: { id: newTicketId, name: '', date: "" } })
                return true;
            }
        }
    }

    //Проверка расположения QR Внутри квадрата
    function onBarcodeScanned(res: BarcodeScanningResult) {
        const hoverZoneHorizontal = (cameraSize.width - 200) / 2;
        const hoverZoneVertical = (cameraSize.height - 200) / 2;

        if (
            cameraSize.width - (res.bounds.origin.y + res.bounds.size.width) > hoverZoneHorizontal &&
            cameraSize.width - res.bounds.origin.y < cameraSize.width - hoverZoneHorizontal &&
            res.bounds.origin.x > hoverZoneVertical &&
            res.bounds.origin.x - res.bounds.size.height / 2 < cameraSize.height - hoverZoneVertical
        ) {
            setQrDetected(true);
            tokenQr.current = res.data;

            lastScanTime.current = Date.now(); // Обновляем время последнего сканирования
        }
    }


    const styles = StyleSheet.create({
        buttonContainer: {
            position: "absolute",
            bottom: 100,
            alignSelf: "center",
        },
        button: {
            backgroundColor: Colors.blue,
            paddingVertical: 12,
            paddingHorizontal: 24,
            borderRadius: 10,
        },
        buttonText: {
            color: "#fff",
            fontSize: 18,
            fontWeight: "bold",
        },
        buttonFlash: {
            backgroundColor: flashStatus ? Colors.white : 'rgba(0, 0, 0, 0)',
            height: 50,
            width: 50,
            borderRadius: 100,
            borderWidth: 1,
            borderColor: Colors.white,
            position: "absolute",
            bottom: 25,
            right: 50,
            justifyContent: "center",
            alignItems: "center"
        },
        buttonLibrary: {
            // backgroundColor: 'rgb(255, 255, 255)',
            height: 50,
            width: 50,
            borderRadius: 100,
            borderWidth: 1,
            borderColor: Colors.white,
            position: "absolute",
            bottom: 25,
            left: 50,
            justifyContent: "center",
            alignItems: "center"
        },
        loadingContainer: {
            ...StyleSheet.absoluteFillObject,
            height: getHeightWindow(),
            justifyContent: "center",
            alignItems: "center",
            marginTop: 15,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
        },
        requestPermissionContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: "center"
        },
        requestPermissionbutton: {
            backgroundColor: Colors.green,
            paddingHorizontal: 10,
            paddingVertical: 10
        }
    });
    if (!permission) {
        return (
            <View style={[StyleSheet.absoluteFill, styles.requestPermissionContainer]}>
                <LoadingModal showLoader={Boolean(!permission)} />
            </View>
        )
    } else if (!permission.granted) {
        return (
            <GestureHandlerRootView>
                <View style={[StyleSheet.absoluteFill, styles.requestPermissionContainer]}>
                    <RectButton onPress={requestPermission} style={[
                        BasicStyles.border, 
                        BasicStyles.shadowElements, 
                        styles.requestPermissionbutton]}>
                        <Text style={[{color: Colors.white}, BasicStyles.fontSemiBold]}>
                            Разрешить доступ к камере
                        </Text>
                    </RectButton>
                </View>
            </GestureHandlerRootView>
        )
    } else {
        return (
            <GestureHandlerRootView>
                <SafeAreaView style={StyleSheet.absoluteFill}>
                    <CameraView
                        ref={refCamera}
                        style={{ flex: 1 }}
                        facing="back"
                        ratio="4:3"
                        enableTorch={flashStatus}
                        onLayout={(event) => {
                            const { width, height } = event.nativeEvent.layout;
                            setCameraSize({ width, height });
                        }}
                        barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
                        onBarcodeScanned={onBarcodeScanned}
                    >
                        <OverlayCamera innerDimension={200} />
                    </CameraView>
                    <RectButton style={styles.buttonFlash} onPress={() => { setFlashStatus(!flashStatus) }}>
                        <FlashLightIcon width="30" height="30" fill={flashStatus ? 'black' : Colors.white} />
                    </RectButton>
                    <RectButton style={styles.buttonLibrary} onPress={pickerFunction}>
                        <PhotoLibraryImage width="30" height="30" fill={Colors.white} />
                    </RectButton>
                    {/* Анимированная кнопка */}
                    {qrDetected && !pressedReqButton && (
                        <Animated.View
                            entering={FadeIn.duration(300).easing(Easing.inOut(Easing.quad))}
                            exiting={FadeOut.duration(300).easing(Easing.inOut(Easing.quad))}
                            layout={LinearTransition}
                            style={styles.buttonContainer}
                        >
                            <RectButton style={styles.button} onPress={onPressLoadTicket}>
                                <Text style={styles.buttonText}>Получить чек</Text>
                            </RectButton>
                        </Animated.View>
                    )}
                </SafeAreaView>
                {/* Экран загрузки с анимацией */}
                {
                    <Animated.View
                        layout={LinearTransition}
                        style={[
                            styles.loadingContainer,
                            loadingScreenAnimatedStyle
                        ]}
                    >
                        <LoadingModal showLoader={showLoader} />
                    </Animated.View>
                }

                {
                    <ModalMessage
                        text="Ошибка при получении чека."
                        backgroundColor={Colors.red}
                        ref={refModalMessage}
                    >
                    </ModalMessage>
                }
            </GestureHandlerRootView>
        );
    }
}

