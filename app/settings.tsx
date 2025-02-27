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
import { Button, Modal, Platform, SafeAreaView, StyleSheet, Text, TextInput, View } from "react-native";
import { GestureHandlerRootView, RectButton } from "react-native-gesture-handler";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system"
import * as DocumentPicker from "expo-document-picker"

export default function settings({ route }: { route: any }) {

    const { date, budget } = useLocalSearchParams<{ date: string, budget: string }>();

    const [dateMonth, setDateMonth] = useState<string>(date);
    const [budgetMonth, setBudgetMonth] = useState<string>(budget.toString());
    const [defaultBudget, setDefaultBudget] = useState<string>('0');

    const refDefaultBudgetInput = useRef<TextInput>(null)
    const refMonthBudgetInput = useRef<TextInput>(null)
    const refBudgetMonth = useRef<TextInput>(null);

    const DB = new DataBase(useSQLiteContext());

    async function getDefaultBudget() {
        const takenBudget = await getDefaultMonthBudget();
        setDefaultBudget(takenBudget.toString());
    };

    useEffect(() => {
        getDefaultBudget();
    }, [date])

    // const importDB = async () => {
    //     try {
    //     const result = await DocumentPicker.getDocumentAsync({
    //         copyToCacheDirectory: true,
    //         type: ['application/x-sqlite3', 'application/octet-stream', 'public.database']
    //     });
    //     if (result.canceled || !result.assets || result.assets.length == 0) {
    //         console.log("Выбор файла отменен");
    //         return;
    //     }
    //     const file = result.assets[0];

    //     // if (!file.name.endsWith('.db')) {
    //     //     console.warn("Выбранный файл не является файлом базы данных");
    //     //     return;
    //     // }

    //     if (!(await FileSystem.getInfoAsync(FileSystem.documentDirectory + "SQLite")).exists) {
    //         await FileSystem.makeDirectoryAsync(FileSystem.documentDirectory + "SQLite", {intermediates: true});
    //     }
    //     const base64 = await FileSystem.readAsStringAsync(
    //         file.uri,
    //         {encoding: FileSystem.EncodingType.Base64}
    //     );

    //     // console.log(base64)
    //     await FileSystem.writeAsStringAsync(
    //         FileSystem.documentDirectory + "SQLite/MyBudgetDatabase.db", 
    //         base64,
    //         {encoding: FileSystem.EncodingType.Base64}
    //     );
    //     await DB.closeDB();
    //     await DB.getLinkDB();
    //     const allTikcets = await DB.getAllTickets()
    //     console.log(allTikcets)
    // } catch(error) {
    //     console.log("Ошибка импорта базы данных: ", error)
    // }
    // }

    // const exportDB = async () => {
    //     if (Platform.OS === "android") {

    //         try {
    //             // Проверяем, есть ли уже сохранённый путь
    //             let directoryUri = await AsyncStorage.getItem('MyBudgetDirectoryUri');
    //             if (!directoryUri) {
    //                 const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
    //                 if (!permissions.granted) {
    //                     console.log("Отсутствует доступ к файлам!");
    //                     return;
    //                 }
    //                 directoryUri = permissions.directoryUri;
    //                 await AsyncStorage.setItem('MyBudgetDirectoryUri', directoryUri);
    //             }
        
    //             // Читаем файл из SQLite
    //             const dbPath = FileSystem.documentDirectory + 'SQLite/MyBudgetDatabase.db';
    //             const base64 = await FileSystem.readAsStringAsync(dbPath, {
    //                 encoding: FileSystem.EncodingType.Base64
    //             });
    //             // console.log(base64)
    //             // Создаём новый файл в выбранной папке
    //             const fileUri = await FileSystem.StorageAccessFramework.createFileAsync(
    //                 directoryUri, 'MyBudgetDatabase', 'application/octet-stream'
    //             );
    
    //             // Записываем данные в файл
    //             await FileSystem.writeAsStringAsync(fileUri, base64, { encoding: FileSystem.EncodingType.Base64 });
    
    //             console.log("Файл успешно экспортирован в:", fileUri);
    //         } catch (error) {
    //             console.error("Ошибка при экспорте БД:", error);
    //         }
    //     } else {
    //         const dbPath = FileSystem.documentDirectory + 'SQLite/MyBudgetDatabase.db';
    //         await Sharing.shareAsync(dbPath);
    //     }
    // };

    // const exportDB = async () => {
    //         const dbPath = FileSystem.documentDirectory + 'SQLite/MyBudgetDatabase';
    //         await Sharing.shareAsync(dbPath);
    // }

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
        importButton: {

        },
        exportButton: {

        }
    })

    async function saveDefaultBudget(budget: string = defaultBudget.toString()) {
        await setDefaultMonthBudget(Number(budget));
        getDefaultBudget();
    }

    async function saveMonthBudget() {
        const res = await DB.setMonthBudget(date, Number(budgetMonth));
    }

    return (
        <GestureHandlerRootView>
            <SafeAreaView style={styles.container}>
                <View style={[BasicStyles.border, styles.containerBlock]}>
                    <Text style={[BasicStyles.fontSemiBold, BasicStyles.shadowElements, styles.textTitle]}>Бюджет по умолчанию:</Text>
                    <CustomInput
                        ref={refDefaultBudgetInput}
                        fixedNum={2}
                        defaultValue={defaultBudget}
                        saveValueFunction={(text: string) => { setDefaultBudget(text) }}
                        mainContainerStyle={[BasicStyles.border, BasicStyles.shadowElements, , styles.inputTextContainer]}
                        inputStyle={[styles.inputText]}
                        symbolCurrencyStyle={[styles.textRuble]}
                        showSymbolCurrency={true}
                        justAText={false}
                    />
                </View>
                <View style={[BasicStyles.border, BasicStyles.shadowElements, styles.containerBlock, styles.buttonContainer]}>
                    <Button color={Colors.blue} title="Сохранить" onPress={() => saveDefaultBudget()} />
                </View>
                <View style={[BasicStyles.border, styles.containerBlock]}>
                    <Text style={[BasicStyles.fontSemiBold, BasicStyles.shadowElements, styles.textTitle]}>Бюджет на {MonthToNameMonth[dateMonth.slice(-2) as keyof typeof MonthToNameMonth].toLowerCase()} {dateMonth.slice(0, 4)}</Text>
                    <CustomInput
                        ref={refBudgetMonth}
                        fixedNum={2}
                        defaultValue={budgetMonth}
                        saveValueFunction={(text: string) => { setBudgetMonth(text) }}
                        mainContainerStyle={[BasicStyles.border, BasicStyles.shadowElements, , styles.inputTextContainer]}
                        inputStyle={[styles.inputText]}
                        symbolCurrencyStyle={[styles.textRuble]}
                        justAText={false}
                    />
                </View>
                <View style={[BasicStyles.border, BasicStyles.shadowElements, styles.containerBlock, styles.buttonContainer]}>
                    <Button color={Colors.blue} title="Сохранить" onPress={saveMonthBudget} />
                </View>
            </SafeAreaView>
                <View style={[styles.fileFunctionButtonContainer]}>

                    <RectButton
                        style={[
                            BasicStyles.border,
                            BasicStyles.shadowElements,
                            styles.fileFunctionButton,
                            styles.exportButton
                        ]}
                        // onPress={exportDB}
                    >
                        <Text style={[BasicStyles.fontSemiBold, styles.textTitle, {color: Colors.red}]}>Экспорт чеков</Text>
                    </RectButton>
                    <RectButton
                        style={[
                            BasicStyles.border,
                            BasicStyles.shadowElements,
                            styles.fileFunctionButton,
                            styles.fileFunctionButton,
                            styles.importButton,
                        ]}
                        // onPress={importDB}
                    >
                        <Text style={[BasicStyles.fontSemiBold, styles.textTitle, {color: Colors.red}]}>Импорт чеков</Text>
                    </RectButton>
                </View>
        </GestureHandlerRootView>

    )

}