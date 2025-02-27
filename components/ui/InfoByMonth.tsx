import { SafeAreaView, StyleSheet, Text, View } from "react-native";
import BasicStyles from "@/styles/BasicStyles";
import { Colors } from "@/constants/Сolors";
import PagerView from "react-native-pager-view";
import { memo, useCallback, useEffect, useState } from "react";
import { MonthToNameMonth } from "@/constants/MonthToNameMonth";
import SettingsIcon from "./settingsIcon";
import DataBase from "@/services/DataBase";
import { useSQLiteContext } from "expo-sqlite";
import { format } from "date-fns";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { Month } from "@/constants/interfaces/Month";
import { Gesture, GestureDetector, RectButton } from "react-native-gesture-handler";
import { runOnJS } from "react-native-reanimated";
import { useFocusEffect, useNavigation, useRouter } from "expo-router";

function InfoByMonth() {

    const DB = new DataBase(useSQLiteContext());

    const router = useRouter();
    const navigation = useNavigation();

    const { tickets } = useSelector((state: RootState) => state.tickets);

    const nowDate = format(Date.now(), "yyyy-MM");

    const [data, setData] = useState<Month[]>([]);

    const [mainIndex, setMainIndex] = useState<number>(0);
    const [activeIndex, setActiveIndex] = useState<number>(0);

    const styles = StyleSheet.create(
        {
            container: {
                height: 144,
                maxWidth: "100%",
                alignItems: "center",
                marginHorizontal: 21,
                backgroundColor: Colors.green,
                overflow: "hidden"
            },
            containerSettings: {
                width: 30,
                height: 30,
                justifyContent: "center",
                alignItems: "center",
                position: "absolute",
                right: 22,
                bottom: 9,
            },
            containerPagerView: {
                flex: 1,
                width: "100%",

            },
            containerMonthElement: {
                flex: 1,
                height: "100%",
                paddingHorizontal: 22,
                borderRadius: 100,
                justifyContent: "center"
            },
            containreMonthTitle: {
                height: 20,
                width: "100%",
            },
            containerAmount: {
                height: 49,
            },
            containerBudget: {
                height: 18,
            },
            containerRemains: {
                height: 18,
            },
            textMonthTitle: {
                fontSize: 16,
                color: Colors.white
            },
            textAmount: {
                fontSize: 40,
                color: Colors.white
            },
            textBudget: {
                fontSize: 16,
                color: Colors.white
            },
            textRemains: {
                fontSize: 16,
                color: Colors.white
            }


        }
    );

    function routeToSettings() {
        router.push({ pathname: '/settings', params: { date: data[activeIndex].date, budget: data[activeIndex].budget } });
    };

    async function getMonthAmounts() {
        const result = await DB.getMonthAmounts();
        return result;
    }
    async function getMonthBudgets() {
        const result = await DB.getMonthBudgets();
        return result;
    }

    async function configurateData() {

        async function setParams(budgets: { date: string, budget: number }[] | null) {
            const amounts = await getMonthAmounts();
            const mergedData = budgets
                ?.map(budgetItem => {
                    // Суммируем все amount для каждого date
                    const totalAmount = amounts
                        ?.filter(amountItem => amountItem.year_month == budgetItem.date)
                        .reduce((sum, amountItem) => sum += amountItem.amount, 0) || 0;
                    return {
                        date: budgetItem.date,
                        budget: budgetItem.budget,
                        amount: totalAmount
                    };
                })
                .sort((itemA, itemB) => itemA.date.localeCompare(itemB.date)) || [];
            const nowDateIndex = mergedData.findIndex(item => item.date === nowDate);
            setData(mergedData);
            setMainIndex(nowDateIndex);
        }

        let budgets = await getMonthBudgets();
        let serchNowDateBudget = budgets?.find((month) => month.date == nowDate);
        if (serchNowDateBudget == null || serchNowDateBudget == undefined) {
            const resSetMonth = await DB.setMonthBudget(nowDate);
            if (resSetMonth != undefined) {
                await new Promise((resolve) => setTimeout(resolve, 300));
                budgets = await getMonthBudgets();
                await setParams(budgets);
            }
        } else {
            await setParams(budgets);
        }
    }

    useFocusEffect(
        useCallback(() => {
            configurateData();
        }, [tickets])
    );

    const containerWithInfo = useCallback((month: Month, index: number) => {
        return (
            <View
                key={index}
                style={[BasicStyles.border, styles.containerMonthElement]}
            >
                <View style={[styles.containreMonthTitle,]}>
                    <Text style={[BasicStyles.fontSemiBold, styles.textMonthTitle,]}>
                        Общие расходы за {MonthToNameMonth[month.date.slice(-2) as keyof typeof MonthToNameMonth].toLowerCase()} {month.date.slice(0, 4)} :
                    </Text>
                </View>
                <View style={[styles.containerAmount,]}>
                    <Text style={[BasicStyles.fontSemiBold, styles.textAmount,]}>
                        {Number(month.amount.toFixed(2))}₽
                    </Text>
                </View>
                <View style={[styles.containerBudget,]}>
                    <Text style={[BasicStyles.fontSemiBold, styles.textBudget,]}>
                        Месячный бюджет: {Number(month.budget.toFixed(2))}₽
                    </Text>
                </View>
                <View style={[styles.containerRemains,]}>
                    <Text style={[BasicStyles.fontSemiBold, styles.textRemains,]}>
                        Остаток: {Number((month.budget - month.amount).toFixed(2))}₽
                    </Text>
                </View>
            </View>
        )
    }, [data]);

    return (
        <View style={[styles.container, BasicStyles.border, BasicStyles.shadowElements]}>
            <PagerView
                style={[styles.containerPagerView]}
                initialPage={mainIndex}
                key={`PagerViewStartIndexIs${mainIndex}`}
                onPageSelected={(event) => { setActiveIndex(event.nativeEvent.position) }}
            >
                {data.map((block, index) => {
                    return (
                        <View style={{ flex: 1 }} key={block.date + index.toString()}>
                            {containerWithInfo(block, index)}
                        </View>
                    )
                })}
            </PagerView>
            <RectButton style={[BasicStyles.border, styles.containerSettings]} onPress={routeToSettings}>
                <SettingsIcon />
            </RectButton>
        </View>
    )
}

export default memo(InfoByMonth)