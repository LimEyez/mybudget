import CustomInput from "@/components/ui/CustomInput";
import { defaultMonthBudgetKey, getDefaultMonthBudget, setDefaultMonthBudget } from "@/constants/defaultMonthBudget";
import { Month } from "@/constants/interfaces/Month";
import { MonthToNameMonth } from "@/constants/MonthToNameMonth";
import { Colors } from "@/constants/Сolors";
import DataBase from "@/services/DataBase";
import BasicStyles from "@/styles/BasicStyles";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Button, Modal, Platform, SafeAreaView, StyleSheet, Text, View } from "react-native";
import { GestureHandlerRootView, RectButton, TextInput } from "react-native-gesture-handler";
import { XlsxExporter } from "@/services/XlsxExporter";
import LoadingModal from "@/components/ui/LoadingModal";
import Animated, { LinearTransition, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { getHeightWindow } from "@/constants/sizes";
import ModalMessage, { ModalMessageInterface } from "@/components/ui/ModalMessage";

export default function settings({ route }: { route: any }) {

    const { date, budget } = useLocalSearchParams<{ date: string, budget: string }>();

    const [dateMonth, setDateMonth] = useState<string>(date);
    const [budgetMonth, setBudgetMonth] = useState<string>(budget.toString());
    const [defaultBudget, setDefaultBudget] = useState<string>('0');
    const [saveProcess, setSaveProcess] = useState<boolean>(false);
    const [modalMessage, setModalMessage] = useState<string>('');
    const [backgroundColorModal, setBackgroundColorModal] = useState<string>(Colors.red);

    const refDefaultBudgetInput = useRef<TextInput>(null)
    const refMonthBudgetInput = useRef<TextInput>(null)
    const refModalMessage = useRef<ModalMessageInterface>(null);

    const DB = new DataBase(useSQLiteContext());

    async function getDefaultBudget() {
        const takenBudget = await getDefaultMonthBudget();
        setDefaultBudget(takenBudget.toString());
    };

    useEffect(() => {
        getDefaultBudget();
    }, [date])

    const exportDB = async () => {
        function showLoading() {
            setSaveProcess(true);
            opacityLoader.value = 1;
        }
        function removeLoading() {
            setTimeout(() => {
                opacityLoader.value = 0;
                setSaveProcess(false);
                showModalMessage();
            }, 500)
        }
        try {
            showLoading();
            const xlsxExporter = new XlsxExporter();
            await xlsxExporter.initDB();
            const resExport = await xlsxExporter.exportAll();
            if (resExport instanceof Error) {
                setModalMessage(resExport.message);
                setBackgroundColorModal(Colors.red);
            } else {
                setModalMessage(resExport);
                setBackgroundColorModal(Colors.blue);
            }
            showModalMessage();
            removeLoading();
        }
        // await Sharing.shareAsync(dbPath);
        catch (error) {
            setModalMessage("Ошибка сохранения .xlsx файла");
            setBackgroundColorModal(Colors.red);
            showModalMessage();
            removeLoading();
            console.log("Ошибка при экспорте:", error);
        }
    }

    const opacityLoader = useSharedValue(0);
    const loadingScreenAnimatedStyle = useAnimatedStyle(() => { return { 
        opacity: withTiming(opacityLoader?.value, { duration: 300 })
    } })

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            flexDirection: "column",
            backgroundColor: Colors.green,
            paddingHorizontal: 22,
        },
        containerBlock: {
            height: 85,
            marginTop: 22,
            gap: 6,
            justifyContent: "center",
            alignContent: "center",
        },
        inputTextContainer: {
            height: 50,
            backgroundColor: Colors.white,
        },
        inputText: {
            fontSize: 20,
            color: Colors.blue,
            // color: "red"
        },
        textTitle: {
            color: Colors.white,
            fontSize: 20
        },
        textRuble: {
            color: Colors.blue,
            fontSize: 20
        },
        buttonContainer: {
            height: "auto",
            // paddingVertical: 4,
            // marginTop: 22,
            backgroundColor: Colors.red
        },
        fileFunctionButtonContainer: {
            width: "100%",
            justifyContent: "space-evenly",
            alignItems: "center",
            alignContent: "space-between",
            position: "absolute",
            alignSelf: "center",
            flexDirection: "row",
            bottom: 0,
            paddingHorizontal: 5,
            marginBottom: 20,
        },
        fileFunctionButton: {
            // flex: 1,
            paddingHorizontal: 10,
            // marginVertical: 2,
            // marginHorizontal: 2,
            justifyContent: "center",
            backgroundColor: Colors.white,
            alignItems: "center",
            height: 50,
        },
        loadingContainer: {
            ...StyleSheet.absoluteFillObject,
            height: getHeightWindow(),
            justifyContent: "center",
            alignItems: "center",
            marginTop: 15,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
        },
    })

    function showModalMessage() {
        setTimeout(() => {
            refModalMessage.current?.showMessage();
        }, 100);
    }

    async function saveDefaultBudget(budget: string = defaultBudget.toString()) {
        await setDefaultMonthBudget(Number(budget));
        getDefaultBudget();
        setModalMessage("Бюджет по умолчанию успешно сохранен");
        setBackgroundColorModal(Colors.blue);
        showModalMessage();
    }

    async function saveMonthBudget() {
        const res = await DB.setMonthBudget(date, Number(budgetMonth));
        setModalMessage(`Бюджет для ${date} успешно сохранен сохранен`);
        setBackgroundColorModal(Colors.blue);
        showModalMessage();
    }

    return (
        <GestureHandlerRootView>
            <SafeAreaView style={styles.container}>
                <View style={[BasicStyles.border, styles.containerBlock]}>
                    <Text style={[BasicStyles.fontSemiBold, BasicStyles.shadowElements, styles.textTitle]}>Бюджет по умолчанию:</Text>
                    <CustomInput
                        ref={refDefaultBudgetInput}
                        defaultValue={defaultBudget}
                        fixedNum={2}
                        saveValueFunction={(text: string) => { setDefaultBudget(text) }}
                        mainContainerStyle={[BasicStyles.border, BasicStyles.shadowElements, , styles.inputTextContainer]}
                        inputStyle={[styles.inputText]}
                        symbolCurrencyStyle={[styles.textRuble]}
                        showSymbolCurrency={true}
                        justAText={false}
                    />
                </View>
                <View style={[BasicStyles.border, BasicStyles.shadowElements, styles.containerBlock, styles.buttonContainer]}>
                <RectButton
                        style={[
                            BasicStyles.border,
                            BasicStyles.shadowElements,
                            styles.fileFunctionButton,
                        ]}
                        onPress={() => {saveDefaultBudget()}}
                    >
                        <Text style={[BasicStyles.fontSemiBold, styles.textTitle, { color: Colors.red }]}>Сохранить</Text>
                    </RectButton>
                </View>
                <View style={[BasicStyles.border, styles.containerBlock]}>
                    <Text style={[BasicStyles.fontSemiBold, BasicStyles.shadowElements, styles.textTitle]}>
                        Бюджет на {MonthToNameMonth[dateMonth.slice(-2) as keyof typeof MonthToNameMonth].toLowerCase()} {dateMonth.slice(0, 4)}</Text>
                    <CustomInput
                        ref={refMonthBudgetInput}
                        defaultValue={budgetMonth}
                        fixedNum={2}
                        saveValueFunction={(text: string) => { setBudgetMonth(text) }}
                        mainContainerStyle={[BasicStyles.border, BasicStyles.shadowElements, , styles.inputTextContainer]}
                        inputStyle={[styles.inputText]}
                        symbolCurrencyStyle={[styles.textRuble]}
                        showSymbolCurrency={true}
                        justAText={false}
                    />
                </View>
                <View style={[BasicStyles.border, BasicStyles.shadowElements, styles.containerBlock, styles.buttonContainer]}>
                    <RectButton
                        style={[
                            BasicStyles.border,
                            BasicStyles.shadowElements,
                            styles.fileFunctionButton,
                        ]}
                        onPress={saveMonthBudget}
                    >
                        <Text style={[BasicStyles.fontSemiBold, styles.textTitle, { color: Colors.red }]}>Сохранить</Text>
                    </RectButton>
                </View>
                <View style={[styles.fileFunctionButtonContainer]}>
                    <RectButton
                        style={[
                            BasicStyles.border,
                            BasicStyles.shadowElements,
                            styles.fileFunctionButton,
                        ]}
                        onPress={exportDB}
                    >
                        <Text style={[BasicStyles.fontSemiBold, styles.textTitle, { color: Colors.red }]}>Экспорт чеков</Text>
                    </RectButton>
                </View>
                {
                    saveProcess &&
                    <Animated.View
                    layout={LinearTransition}
                    style={[
                        styles.loadingContainer,
                        loadingScreenAnimatedStyle
                    ]}
                    >
                    <LoadingModal showLoader={saveProcess} />
                </Animated.View>
                }
            </SafeAreaView>
            <ModalMessage
                text={modalMessage}
                backgroundColor={backgroundColorModal}
                ref={refModalMessage}
            >
            </ModalMessage>
        </GestureHandlerRootView>

    )

}