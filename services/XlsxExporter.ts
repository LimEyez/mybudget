import { openDatabaseAsync } from "expo-sqlite";
import DataBase from "./DataBase";
import { DBName } from "@/constants/dbname";
import * as XLSX from "sheetjs-style";
import * as RNF from "react-native-fs";
import { getFormatedDate } from "./DateFunctions";
import { Product } from "@/constants/interfaces/Product";
import { Ticket } from "@/constants/interfaces/Ticket";
import { MonthToNameMonth } from "@/constants/MonthToNameMonth";
import { PermissionsAndroid } from 'react-native';
import * as FileSystem from 'expo-file-system';
import AsyncStorage from "@react-native-async-storage/async-storage";

interface RowData {
    "Название магазина": string;
    "Дата": string;
    "Товар": string;
    "Цена": number;
    "Количество": number;
    "Стоимость": number;
    "Сумма": number;
}

async function requestStoragePermission() {
    const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        {
            title: 'Разрешение на доступ к хранилищу',
            message: 'Пожалуйста, разрешите приложению доступ к хранилищу для сохранения файла.',
            buttonNegative: 'Отмена',
            buttonPositive: 'Разрешить',
        }
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
}


class XlsxExporter {
    DB: null | DataBase

    constructor() {
        this.DB = null;
    }

    async initDB() {
        const db = await openDatabaseAsync(DBName);
        this.DB = new DataBase(db);
    }


    async uniqueName() {
        let baseFilePath = `${RNF.DownloadDirectoryPath}/myBudget.xlsx`;
        let filePath = baseFilePath;
        let counter = 1;

        // Проверяем, существует ли файл
        while (await RNF.exists(filePath)) {
            filePath = `${RNF.DownloadDirectoryPath}/myBudget(${counter}).xlsx`;
            counter++;
        }

        return (filePath)
    }

    parseReadablePath(uri: string): string {
        const decoded = decodeURIComponent(uri);
        const match = decoded.match(/document\/primary:(.+)/);
        return match ? `${match[1]}` : "Неизвестная папка";
      }

    async exportAll() {
        const EXPORT_URI_KEY = "exportDirectoryUri";

        let directoryUri = await AsyncStorage.getItem(EXPORT_URI_KEY);

        // Если нет сохранённого URI, запрашиваем у пользователя
        if (!directoryUri) {
            const permission = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
            if (!permission.granted) {
                // console.log("Нет разрешения на доступ к папке");
                return Error("Нет разрешения на доступ к папке");
            }

            directoryUri = permission.directoryUri;
            await AsyncStorage.setItem(EXPORT_URI_KEY, directoryUri);
        }

        const budgets = await this.DB?.getMonthBudgets();
        const productsFromDB = await this.DB?.getAllProductsGroupedByTicket();
        const products = productsFromDB?.map((item) => ({
            ticketId: item.ticketId,
            info: JSON.parse(item.ticketInfo),
            products: JSON.parse(item.products)
        }));

        products?.sort(
            (ticket1, ticket2) =>
                new Date(ticket1.info.date as string).getTime() -
                new Date(ticket2.info.date as string).getTime()
        );

        const monthlyTickets: Record<string, any[]> = {};
        products?.forEach((ticket) => {
            const keyOfDate = ticket.info.date.slice(0, ticket.info.date.length - 3);
            if (!monthlyTickets[keyOfDate]) {
                monthlyTickets[keyOfDate] = [];
            }
            monthlyTickets[keyOfDate].push(ticket);
        });

        const wb = XLSX.utils.book_new();
        Object.keys(monthlyTickets).forEach((dateKey) => {
            this.createPageInWorkBook(wb, dateKey, monthlyTickets[dateKey], budgets ?? []);
        });

        const wbOut = XLSX.write(wb, { type: "base64", bookType: "xlsx" });

        try {
            const fileUri = await FileSystem.StorageAccessFramework.createFileAsync(
                directoryUri,
                "myBudget.xlsx",
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            );

            await FileSystem.writeAsStringAsync(fileUri, wbOut, {
                encoding: FileSystem.EncodingType.Base64,
            });

            console.log(`Файл успешно сохранён в: ${this.parseReadablePath(fileUri)}`);
            return (`Файл успешно сохранён в: ${this.parseReadablePath(fileUri)}`);

        } catch (error) {
            // console.error("Ошибка при записи файла в SAF:", error);
            return Error("Ошибка при сохранении файла");
        }
    }

    createPageInWorkBook(wb: XLSX.WorkBook, monthDate: string, monthlyTickets: any[], budgets: { date: string, budget: number }[]) {
        const budget = budgets.reduce((value, budget) => {
            return budget.date == monthDate ? budget.budget : value;
        }, 0);
        const cellUnionIndexes: number[] = [];
        const rows: RowData[] = [];
        monthlyTickets.forEach((ticket: { info: Ticket, products: Product[] }) => {
            cellUnionIndexes.push(ticket.products.length);
            ticket.products.forEach((product) => {
                const correctStyleDate = getFormatedDate(ticket.info.date);
                rows.push({
                    "Название магазина": ticket.info.name == "" ? `Чек от ${correctStyleDate}` : ticket.info.name,
                    "Дата": correctStyleDate,
                    "Товар": product.name,
                    "Цена": product.price,
                    "Количество": product.quantity,
                    "Стоимость": product.amount,
                    "Сумма": ticket.info.amount
                })
            })
        });

        const ws = XLSX.utils.json_to_sheet(rows, { skipHeader: false });

        ws['I1'] = { v: "Месячный бюджет:", t: "s", s: this.addStyleCell() };
        ws['J1'] = { v: budget, t: "n", s: this.addStyleCell() };
        ws['I2'] = { v: "Сумма расходов:", t: "s", s: this.addStyleCell() };
        ws['J2'] = { f: `SUM(F2:F${ws["!ref"]?.split(':')[1]?.slice(1)})`, t: "n", s: this.addStyleCell() };
        ws['I3'] = { v: "Остаток:", t: "s", s: this.addStyleCell() };
        ws['J3'] = { f: `J1-J2`, t: "n", s: this.addStyleCell() };
        let startIndex = 0;
        ws["!merges"] = []; // Объявление пустого массива для объединения ячеек

        const colorsCells = {
            green: "9DDDB2",
            blue: "9DAFDD"
        };

        //Переменная для смены цвета ячеек чека
        let switchColor = true;

        cellUnionIndexes.forEach((count) => {

            const usedColor = switchColor ? colorsCells.blue : colorsCells.green;

            startIndex += 1; // смещение стартового индекса объединения
            const endIndex = startIndex + count - 1;

            ws["!merges"]?.push(
                { s: { r: startIndex, c: 0 }, e: { r: endIndex, c: 0 } }, // Объединение "Чек1" (A)
                { s: { r: startIndex, c: 1 }, e: { r: endIndex, c: 1 } }, // Объединение "Дата" (B)
                { s: { r: startIndex, c: 6 }, e: { r: endIndex, c: 6 } }  // Объединение "Сумма" (G)
            )

            for (let row = startIndex; row <= endIndex; row++) {
                for (let col = 0; col <= 6; col++) {
                    const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
                    if (!ws[cellAddress]) ws[cellAddress] = {}; // Если ячейка пустая, создаем ее

                    // Задаем стили для области (заливка и обводка)
                    ws[cellAddress].s = this.addStyleCell({ fillColor: usedColor })
                }
            }

            startIndex = endIndex;
            switchColor = !switchColor;
        });

        //Учитываем вручную добавленные ячейки
        ws["!ref"] = ws["!ref"]?.replace("G", "J");

        //Проверка того, что минимальное количество строк учитывается
        if (Number(ws["!ref"]?.slice(-1)) < 3) {
            ws["!ref"] = ws["!ref"]?.slice(0, ws["!ref"].length - 1) + "3"
        }

        const monthKey = monthDate.slice(monthDate.length - 2) as keyof typeof MonthToNameMonth;
        XLSX.utils.book_append_sheet(wb, ws, `${MonthToNameMonth[monthKey]} ${monthDate.slice(0, 4)}`);
    }

    addStyleCell({ fillColor }: { fillColor: string } = { fillColor: "FFFFFF" }) {
        return (
            {
                fill: {
                    fgColor: { rgb: fillColor }, // Цвет фона
                },
                border: {
                    top: { style: "thin", color: { rgb: "000000" } },    // Верхняя граница
                    left: { style: "thin", color: { rgb: "000000" } },   // Левая граница
                    bottom: { style: "thin", color: { rgb: "000000" } }, // Нижняя граница
                    right: { style: "thin", color: { rgb: "000000" } },  // Правая граница
                },
                alignment: {
                    vertical: "center",   // Выравнивание по вертикали
                    horizontal: "center", // Выравнивание по горизонтали
                    wrapText: true,       // Перенос текста, если текст не помещается
                },
            }
        )
    }

}
export { XlsxExporter }