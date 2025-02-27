import AsyncStorage from "@react-native-async-storage/async-storage";

export const defaultMonthBudget = 50000;
export const defaultMonthBudgetKey = 'default-month-budget'
export async function setDefaultMonthBudget(value: number = defaultMonthBudget) {
    await AsyncStorage.setItem(defaultMonthBudgetKey, String(value));
}

export async function getDefaultMonthBudget() {
    const defaultBudget = await AsyncStorage.getItem(defaultMonthBudgetKey);
    if (Number.isNaN(defaultBudget) || defaultBudget === undefined || defaultBudget === null) {
        setDefaultMonthBudget();
        return Number(await AsyncStorage.getItem(defaultMonthBudgetKey));
    } else {
        return Number(defaultBudget);
    }
}