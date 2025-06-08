import { Product } from "@/constants/interfaces/Product";
import { Colors } from "@/constants/Сolors";
import { AppDispatch, RootState } from "@/redux/store";
import { fetchTickets } from "@/redux/ticketsSlice";
import DataBase from "@/services/DataBase";
import BasicStyles from "@/styles/BasicStyles";
import { useSQLiteContext } from "expo-sqlite";
import { RefObject, useEffect, useRef, useState } from "react";
import { Modal, Pressable, StyleSheet, Text, TouchableWithoutFeedback, View } from "react-native";
import { GestureHandlerRootView, TextInput } from "react-native-gesture-handler";
import { useDispatch, useSelector } from "react-redux";
import Animated, { FadeIn, FadeInDown, FadeInUp, LinearTransition, Easing, useAnimatedStyle, useSharedValue, withTiming, ZoomIn, ZoomInDown, FadeOut, ZoomOut } from "react-native-reanimated";
import CustomInput from "./CustomInput";
import { useFocusEffect } from "expo-router";

interface ModalProductSettingsInterface {
    showProductSettings: boolean,
    setShowProductSettings: (value: boolean) => void,
    infoProduct: Product | null,
    updateProductsListAndTicketInfo: () => void,
    resetInfo: () => void
}

export default function ModalProductSettings({ showProductSettings, setShowProductSettings, infoProduct, updateProductsListAndTicketInfo, resetInfo }: ModalProductSettingsInterface) {

    const dispatch = useDispatch<AppDispatch>();

    const DB = new DataBase(useSQLiteContext());

    const { dates } = useSelector((state: RootState) => state.dates);

    const styles = StyleSheet.create({
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
            fontSize: 16,
            marginBottom: 6,
            color: Colors.red,
            textAlign: 'left',
            alignSelf: "baseline"
        },
        modalContainer: {
            flex: 1,
            zIndex: 1000,
        },
        modalContentContainer: {
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: "center",
            alignContent: "center",
            alignItems: "center",
        },
        textStyle: {
            color: Colors.blue
        },
        textInput: {
            width: "100%",
            // borderWidth: 1,
            // borderColor: Colors.blue,
            marginBottom: 10,
            backgroundColor: Colors.white,
            color: Colors.blue,
            paddingHorizontal: 10,
        },
        confirmButtonText: {
            color: Colors.blue,
            fontSize: 20
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
        buttonsContainer: {
            height: 40,
            flexDirection: "row",
            marginTop: 10
        },
        popup: {
            position: "absolute",
            bottom: 50,
            backgroundColor: Colors.gray,
            padding: 10,
            borderRadius: 8,
        },
    });

    const refName = useRef<TextInput>(null);
    const refQuantity = useRef<TextInput>(null);
    const refPrice = useRef<TextInput>(null);
    const refAmount = useRef<TextInput>(null);

    const [name, setName] = useState<string>("Отсутствующий продукт");
    const [quantity, setQuantity] = useState<string>('1');
    const [price, setPrice] = useState<string>('0');
    const [amount, setAmount] = useState<string>('0');
    const [errorMessage, setErrorMessage] = useState<null | string>(null)

    const onCancelSetting = () => {
        setName("Отсутствующий продукт");
        setQuantity("1");
        setPrice("0");
        setAmount("0");
        resetInfo();
        setShowProductSettings(false);
    };

    

    const onConfirmSetting = async () => {
        if (name == "") {
            setErrorMessage("Введите наименование товара");
            setTimeout(() => { setErrorMessage(null) }, 2000);
        } else if (Number(quantity) == 0) {
            setErrorMessage("Введите количество товара");
            setTimeout(() => { setErrorMessage(null) }, 2000);
        } else if (Number(price) == 0) {
            setErrorMessage("Введите цену товара");
            setTimeout(() => { setErrorMessage(null) }, 2000);
        } else {
            if (infoProduct?.id == 0) {
                await DB.addProduct(infoProduct.ticketId, name, Number(quantity), Number(price), Number(amount));
            } else {
                await DB.updateProduct(infoProduct?.id, name, Number(quantity), Number(price), Number(amount));
            }
            await DB.updateAmountticket({ ticketId: infoProduct?.ticketId });
            updateProductsListAndTicketInfo();
            dispatch(fetchTickets({ dates, DB }));
            setShowProductSettings(false);
            resetInfo()
        }
    };

    const focuseInput = (ref: RefObject<TextInput>) => {
        ref.current?.focus();
    }

    useEffect(() => {
        const newAmount = (Number(price) * Number(quantity)).toFixed(2).toString();
        if (amount !== newAmount) {
            setAmount(newAmount);
        }
    }, [quantity, price]);

    useEffect(() => {
        if (infoProduct != null) {
            setName(infoProduct.name);
            setQuantity(infoProduct.quantity.toString());
            setPrice(infoProduct.price.toString());
            setAmount(infoProduct.amount.toString());
            setErrorMessage(null)
        }

    }, [infoProduct])

    function updateAmount() {
        const quantity_number = Number(quantity);
        const price_number = Number(price);
        const amount_number = Number(price_number * quantity_number);
        setAmount(amount_number.toFixed(2));
    }

    if (!showProductSettings) return null;

    return (
        <GestureHandlerRootView style={{ position: 'absolute', width: '100%', height: '100%' }}>
            <Animated.View style={[styles.modalContainer]} entering={FadeIn} exiting={FadeOut}>
                <Animated.View style={[styles.modalContentContainer]}>

                    <Animated.View
                        // entering={ZoomIn.delay(100)}
                        // layout={LinearTransition}
                        entering={ZoomIn}
                        exiting={ZoomOut}
                        style={[BasicStyles.border, BasicStyles.shadowElements, styles.content]}
                    >
                        <Text style={[BasicStyles.fontSemiBold, BasicStyles.shadowElements, styles.text]}>Наименование товара</Text>
                        <CustomInput
                            ref={refName}
                            fixedNum={0}
                            // onFocus={() => {refName.current?.focus()}}
                            defaultValue={name}
                            justAText={true}
                            saveValueFunction={(text: string) => { setName(text) }}
                            mainContainerStyle={[BasicStyles.border, BasicStyles.shadowElements, styles.textInput]}
                            inputStyle={[styles.textStyle]}
                            symbolCurrencyStyle={[styles.textStyle]}
                        />
                        <Text style={[BasicStyles.fontSemiBold, styles.text]}>Количество товара</Text>
                        <CustomInput
                            ref={refQuantity}
                            fixedNum={3}
                            // onFocus={() => {refQuantity.current?.focus()}}
                            defaultValue={quantity}
                            justAText={false}
                            showSymbolCurrency={false}
                            saveValueFunction={(text: string) => { setQuantity(isNaN(Number(text)) ? '0' : text); updateAmount() }}
                            mainContainerStyle={[BasicStyles.border, BasicStyles.shadowElements, styles.textInput]}
                            inputStyle={[styles.textStyle]}
                            symbolCurrencyStyle={[styles.textStyle]}
                        />
                        <Text style={[BasicStyles.fontSemiBold, styles.text]}>Цена товара</Text>
                        <CustomInput
                            ref={refPrice}
                            defaultValue={price}
                            // onFocus={() => {refPrice.current?.focus(); console.log("EW")}}
                            justAText={false}
                            fixedNum={2}
                            saveValueFunction={(text: string) => { setPrice(isNaN(Number(text)) ? '0' : text); updateAmount() }}
                            mainContainerStyle={[BasicStyles.border, BasicStyles.shadowElements, styles.textInput]}
                            inputStyle={[styles.textStyle]}
                            symbolCurrencyStyle={[styles.textStyle]}
                        />
                        <Text style={[BasicStyles.fontSemiBold, styles.text]}>Стоимость</Text>
                        <CustomInput
                            ref={refAmount}
                            defaultValue={amount}
                            justAText={false}
                            fixedNum={2}
                            mainContainerStyle={[BasicStyles.border, BasicStyles.shadowElements, styles.textInput]}
                            inputStyle={[styles.textStyle]}
                            symbolCurrencyStyle={[styles.textStyle]}
                            showSymbolCurrency={true}
                            readonly={true}
                        />
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
                        {
                        errorMessage &&
                        <View style={[BasicStyles.border, BasicStyles.shadowElements, styles.popup]}>
                            <Text style={[BasicStyles.fontSemiBold, styles.text]}>{errorMessage}</Text>
                        </View>
                    }
                    </Animated.View >
                </Animated.View>
            </Animated.View>
        </GestureHandlerRootView>
    )

}
