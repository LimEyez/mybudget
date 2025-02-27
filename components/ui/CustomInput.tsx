import { setParams } from "expo-router/build/global-state/routing";
import { forwardRef, RefAttributes, useEffect, useImperativeHandle, useRef, useState } from "react";
import { StyleProp, StyleSheet, Text, TextInput, TextStyle, TouchableOpacity, View, ViewStyle } from "react-native";
import { Pressable, RectButton } from "react-native-gesture-handler";

interface CustomInputInterface {
    fixedNum?: number,
    inputStyle?: StyleProp<TextStyle>,
    symbolCurrencyStyle?: StyleProp<TextStyle>,
    containerSymbolCurrencyStyle?: StyleProp<ViewStyle>,
    mainContainerStyle?: StyleProp<ViewStyle>,
    saveValueFunction?: (value: string) => void
    showSymbolCurrency?: boolean,
    defaultValue?: string,
    justAText?: boolean,
    readonly?: boolean,
    onFocus?: () => void
}

const CustomInput = forwardRef<TextInput, CustomInputInterface>(
    ({
        fixedNum = 2,
        inputStyle,
        symbolCurrencyStyle,
        containerSymbolCurrencyStyle,
        mainContainerStyle,
        saveValueFunction = (value: string) => { },
        showSymbolCurrency = true,
        defaultValue = '0',
        justAText = true,
        readonly = false,
        onFocus = () => {}

    }, ref) => {

        const internalRef = useRef<TextInput>(null);

        useImperativeHandle(ref, () => internalRef.current!, [internalRef]);

        const [textInputWidth, setTextInputWidth] = useState(0);

        const [value, setValue] = useState<string>(defaultValue);
        const [len, setLen] = useState<number>(defaultValue.length);
        const [cursorPos, setCursorPos] = useState<number>(1)

        const styles = StyleSheet.create({
            container: {
                height: 50,
                width: "100%",
                backgroundColor: "rgba(19, 99, 55, 0.57)",
                alignItems: "center",
                flexDirection: "row",
                paddingHorizontal: 10,
                borderRadius: 5,

            },
            textInput: {
                maxWidth: justAText ? "100%" : "80%",
                flex: justAText ? 1 : 0,
                fontSize: 22,
                // minWidth: 10,
                width: textInputWidth || "auto",
                color: "white",
                fontWeight: "bold"
            },
            symbolCurrency: {
                color: "white",
                fontSize: 22,
                fontWeight: "bold"
            },
            symbolCurrencyContainer: {
                height: "100%",
                justifyContent: "center",
                alignItems: "center",
            }
        });

        function setParams(value: string) {
            setLen(value.length);
            setValue(value);
        }

        function changeTextJustAText(text: string) {
            saveValueFunction(text);
        }

        function changeText(key: string) {
            let finalSum = value;
            if (key == 'Backspace') {
                finalSum = finalSum.slice(0, cursorPos - 1) + finalSum.slice(cursorPos);
                if (finalSum == '') {
                    setParams(finalSum);
                    return;
                }
            } else {
                if (len >= 17) {
                    return;
                }
                finalSum = (finalSum.slice(0, cursorPos) + key + finalSum.slice(cursorPos))
                    .replace(/[^0-9,.]/g, '').replace(',', '.');
            }

            const [rubles, pennies] = finalSum.split('.');
            finalSum = (Number(rubles).toString() +
                (key == "." && pennies == '' || key == ',' && pennies == '' || pennies == '' && key != "." && key != ',' ? '.' : '') +
                (pennies?.length > 0 ? '.' + pennies.slice(0, fixedNum) : ''));
            setParams(finalSum);
        };

        function onSubmitEditing() {
            setParams(Number(value).toString());
            saveValueFunction(value);
        }

        function onSubmitEditingJustAText(){
            setParams(value);
            saveValueFunction(value);
        }

        useEffect(() => {
            saveValueFunction(value);
        }, [value])

        useEffect(() => {
            setLen(defaultValue.length)
            setValue(defaultValue);
        }, [defaultValue])


        if (justAText) {
            return (
                <View style={[styles.container, mainContainerStyle]}>
                    <TextInput
                        ref={internalRef}
                        defaultValue={value}
                        style={[styles.textInput, inputStyle]}
                        placeholder={"Название"}
                        maxLength={50}
                        contextMenuHidden={false}
                        onChangeText={changeTextJustAText}
                        onSubmitEditing={onSubmitEditingJustAText}
                        readOnly={readonly}
                    />
                </View>
            )
        }

        return (
            <TouchableOpacity  disabled={readonly} onPress={() => {internalRef.current?.focus()}} style={[styles.container, mainContainerStyle]}>
                <TextInput
                    ref={internalRef}
                    value={value}
                    style={[styles.textInput, inputStyle]}
                    placeholder={"0"}
                    maxLength={len}
                    contextMenuHidden={true}
                    onChangeText={(text) => { saveValueFunction(text) }}
                    onKeyPress={(event) => { changeText(event.nativeEvent.key) }}
                    onSelectionChange={(event) => { setCursorPos(event.nativeEvent.selection.start) }}
                    selection={{ start: cursorPos, end: cursorPos }}
                    onSubmitEditing={() => {onSubmitEditing(); internalRef.current?.blur()}}
                    readOnly={readonly}
                />
                {
                    showSymbolCurrency &&
                    <View style={[styles.symbolCurrencyContainer, containerSymbolCurrencyStyle]}>
                        <Text style={[styles.symbolCurrency, symbolCurrencyStyle]}>₽</Text>
                    </View>
                }
            </TouchableOpacity>
        )
    })


export default CustomInput