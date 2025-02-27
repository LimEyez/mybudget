import { documentDirectory, deleteAsync } from 'expo-file-system'
import * as SQLite from 'expo-sqlite'
import { Ticket } from '../constants/interfaces/Ticket';
import { TotalAmount } from '@/constants/interfaces/TotalAmount';
import { Product } from '@/constants/interfaces/Product';
import { format } from 'date-fns';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { defaultMonthBudgetKey, getDefaultMonthBudget, setDefaultMonthBudget } from '@/constants/defaultMonthBudget';

type Statements = {
    [key: string]: Awaited<ReturnType<SQLite.SQLiteDatabase['prepareAsync']>>;
};

function isTotalAmount(obj: any): obj is TotalAmount {
    return obj && typeof obj.totalAmount === 'number';
}

class DataBase {

    db!: SQLite.SQLiteDatabase; // Инициализируется позже

    constructor(db?: SQLite.SQLiteDatabase) {
        if (db) {
            this.db = db;
            // console.log(this.db, "!!")
        } else {
            this.getLinkDB();
        }
    }

    // Асинхронная функция для инициализации базы данных
    async getLinkDB() {
        try {
            this.db = await SQLite.openDatabaseAsync('MyBudgetDatabase.db');
            return this.db;
            // console.log(this.db, "!")
        } catch (error) {
            console.error('Ошибка при инициализации базы данных:', error);
            return null
        }
    }

    async initDB(db?: SQLite.SQLiteDatabase) {
        this.db.execAsync(`
        PRAGMA journal_mode = WAL;
        CREATE TABLE IF NOT EXISTS tickets (id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, name TEXT, date INTEGER NOT NULL, amount REAL NOT NULL);
        CREATE TABLE IF NOT EXISTS products (id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, ticketId INTEGER NOT NULL, name TEXT NOT NULL, quantity REAL NOT NULL, price REAL NOT NULL, amount REAL NOT NULL);
        CREATE TABLE IF NOT EXISTS monthBudgets ( date TEXT NOT NULL, budget REAL NOT NULL);
        CREATE TABLE IF NOT EXISTS ticketsReceived (token TEXT NOT NULL, data TEXT NOT NULL);
        CREATE UNIQUE INDEX unique_date_index ON monthBudgets (date);
        `);
    }

    async clearDatabase() {
        this.db.execAsync(`
            DELETE FROM tickets;
            DELETE FROM products;
            DELETE FROM sqlite_sequence WHERE name IN ('tickets', 'products', 'monthBudgets');
            DROP TABLE IF EXISTS monthBudgets;
            DROP TABLE IF EXISTS tickets;
            DROP TABLE IF EXISTS products;
            `)
        // DROP TABLE IF EXISTS ticketsReceived;
    }

    async getProducts(ticketId: number) {
        try {
            const allTickets = await this.db.getAllAsync<Product>(`SELECT * FROM products WHERE ticketId = ?`, ticketId);
            return (allTickets);
        } catch (error) {
            console.log('Ошибка товаров');
            console.log(error);
            return ([])
        }
    }

    async getTicketInfoByToken(tokenQR: string) {
        try {
            const result = await this.db.getFirstAsync<{ data: any }>(`SELECT data FROM ticketsReceived WHERE token = ?`, tokenQR);
            if (result?.data == null || result?.data == undefined) {
                return null;
            } else {
                return result?.data;
            }
        } catch (error) {
            return null
        }
    }

    async getProductsByTicketId(ticketId: number) {
        try {
            const allTickets = await this.db.getAllAsync<Product>(`SELECT * FROM products WHERE ticketId = ?`, ticketId);
            return allTickets
        } catch (error) {
            console.log('Ошибка товаров');
            console.log(error);
            return ([])
        }
    }

    async getAllTickets() {
        try {
            const allTickets = await this.db.getAllAsync<Product>(`SELECT * FROM tickets`);
            console.log(allTickets);
        } catch (error) {
            console.log('Ошибка товаров');
            console.log(error);
            return ([])
        }
    }

    async addProduct(ticketId: number | null | undefined, name: string, quantity: number, price: number, amount: number) {
        try {
            if (ticketId == null || ticketId == undefined) {
                throw (new Error("TicketId не задан"))
            }
            const result = await this.db.runAsync(`INSERT INTO products (ticketId, name, quantity, price, amount) VALUES (?, ?, ?, ?, ?)`, ticketId, name, quantity, price, amount);
            return (result);
        } catch (error) {
            console.log('Ошибка добавления товара');
            console.log(error);
            return (null);
        }
    }

    async addTicketInfoByToken(tokenQR: string, data: string) {
        // console.log(typeof tokenQR)
        const result = await this.db.runAsync(`INSERT INTO ticketsReceived (token, data) VALUES (?, ?)`, tokenQR, data);
        return result;
    }

    async updateProduct(id: number | null | undefined, name: string, quantity: number, price: number, amount: number) {
        try {
            if (id == null || id == undefined) {
                throw (new Error("Некорректный id товара"))
            }
            const result = await this.db.runAsync(`UPDATE products SET name = ?, quantity = ?, price = ?, amount = ? WHERE id = ?`, name, quantity, price, amount, id);
            return (result);
        } catch (error) {
            console.log('Ошибка добавления товара');
            console.log(error);
            return (null);
        }
    }

    async deleteEmptyTickets() {
        try {
            const result = await this.db.runAsync("DELETE FROM tickets WHERE amount = 0");
            return (result);
        } catch (error) {
            console.log("Ошибка удаления пустых чеков: ", error)
        }
    }


    async getTickets(startDate: string, endDate: string | boolean = false) {
        if (endDate == false) {
            endDate = startDate
        }
        try {
            const allTickets = await this.db.getAllAsync<Ticket>("SELECT * FROM tickets WHERE date BETWEEN ? AND ?", startDate, endDate);
            return (allTickets)
        } catch (error) {
            console.log('Ошибка получения чеков');
            console.log(error);
            return ([])
        }
    }

    async getTotalAmount(startDate: string, endDate: string | boolean = false): Promise<TotalAmount> {
        if (endDate == false) {
            endDate = startDate
        }
        try {
            const totalAmountArray = await this.db.getAllAsync<TotalAmount[]>("SELECT IFNULL(SUM(amount), 0) as totalAmount FROM tickets WHERE date BETWEEN $startDate AND $endDate;", startDate, endDate);
            if (isTotalAmount(totalAmountArray[0])) {
                // Если объект соответствует типу TotalAmount, возвращаем его
                return totalAmountArray[0];
            } else {
                return { totalAmount: 0 }
            }


        } catch (error) {
            console.log('Ошибка получения суммы чеков');
            console.log(error);
            return ({ totalAmount: 0 })
        }
    }

    async updateNameAndDateTicket({ ticketId, name = '', date }: { ticketId: number, name: string | null, date: string | Date }) {
        if (date instanceof Date) {
            date = format(date, "yyyy-MM-dd");
        };
        if (ticketId) {
            try {
                const checkMonthBudget = await this.verificationOfExistMonthBudget(date.slice(0, 7));
                const updateInfoTicket = await this.db.runAsync(`UPDATE tickets SET name = ?, date = ? WHERE id = ?`, name, date, ticketId);
                return updateInfoTicket
            } catch (error) {
                console.log("Ошибка обновления данных о чеке: ", error)
            }
        }
    }


    async updateAmountticket({ ticketId = -1 }: { ticketId?: number }) {

        if (ticketId) {
            try {
                const updateInfoTicket = await this.db.runAsync(`UPDATE tickets SET amount = (SELECT IFNULL(SUM(amount), 0) FROM products WHERE ticketId = ?) WHERE id = ?`, ticketId, ticketId);
                return updateInfoTicket
            } catch (error) {
                console.log(error)
            }
        }
    }

    async getTicketInfo(ticketId: number) {
        try {
            const info = await this.db.getFirstAsync<Ticket>(`SELECT * FROM tickets WHERE id = ?`, ticketId);
            if (info == null) {
                throw (new Error(`Чек не найден, id чека: ${ticketId}`));
            }
            return info;
        } catch (error) {
            console.log(error);
            return null
        }
    }

    async addTicket(name: string = '', date: string = '', amount: number = 0) {
        if (date == '') {
            date = format(Date.now(), "yyyy-MM-dd");
        };
        try {
            const checkMonthBudget = await this.verificationOfExistMonthBudget(date.slice(0, 7));
            const result = await this.db.runAsync(`INSERT INTO tickets (name, date, amount) VALUES (?, ?, ?)`, name, date, amount);
            return (result.lastInsertRowId)
        } catch (error) {
            console.log("Ошибка добавления чека: ", error)
            return null;
        }
    }

    async deleteTicket(ticketId: number) {
        try {
            const result = await this.db.runAsync(`DELETE FROM tickets WHERE id = ?`, ticketId);
            return result.changes;
        } catch (error) {
            console.log("Ошибка удаления чека: ", error)
            return null;
        }
    }

    async deleteProduct(productId: number) {
        try {
            const result = await this.db.runAsync(`DELETE FROM products WHERE id = ?`, productId);
            return result.changes;
        } catch (error) {
            console.log("Ошибка удаления товара: ", error)
            return null;
        }
    }

    async setMonthBudget(date: string, budget?: number | null) {
        if (budget == null || budget == undefined) {
            budget = await getDefaultMonthBudget();
        }    
        try {
            const result = await this.db.runAsync(
                `INSERT INTO monthBudgets (date, budget) VALUES (?, ?)`,
                date,
                budget
            );
            return result;
        } catch (error: any) {
            // Если ошибка связана с уникальностью (дубликат), обновляем запись
            if (error.message.includes("UNIQUE constraint failed")) {
                console.warn(`⚠️ Запись на ${date} уже существует. Обновляем...`);
                return await this.updateMonthBudget(date, budget);
            } else {
                throw error; // Если ошибка другая — пробрасываем дальше
            }
        }
    }
    

    async updateMonthBudget(date: string, budget?: number | null) {
        if (budget == null || budget == undefined) {
            budget = await getDefaultMonthBudget();
        }
        const result = await this.db.runAsync(`UPDATE monthBudgets SET budget = ? WHERE date = ?`, budget, date);
        return result;
    }

    async verificationOfExistMonthBudget(date: string) {
        const checkMonthBudget = await this.db.getFirstAsync<{ exist: number }>(`SELECT EXISTS (SELECT 1 FROM monthBudgets WHERE date = ?) AS exist`, date);
        if (checkMonthBudget?.exist == 1) {
            return true
        } else {
            const budget = await getDefaultMonthBudget();
            const result = await this.db.runAsync(`INSERT INTO monthBudgets (date, budget) VALUES (?, ?)`, date, budget);
            return result;
        }
    }

    async getMonthBudgets() {
        try {
            const result = await this.db.getAllAsync<{ date: string, budget: number }>(`SELECT * from monthBudgets ORDER BY date`);
            return result;
        } catch (error) {
            console.log("Ошибка получения месячных бюджетов: ", error)
            return null;
        }
    }

    async deleteMonthBudget(date: string) {
        try {
            const result = await this.db.runAsync(`DELETE FROM tickets WHERE date = ?`, date);
            return result;
        } catch (error) {
            console.log("Ошибка удаления месячного бюджета ", error)
            return null;
        }
    }

    async getMonthAmounts() {
        try {
            const result = await this.db.getAllAsync<{ amount: number, year_month: string }>(`SELECT SUBSTR(date, 1,7) AS year_month, SUM(amount) AS amount FROM tickets GROUP BY year_month ORDER BY year_month`)
            return (result);
        } catch (error) {
            console.log("Ошибка получения месячных расходов: ", error);
            return null
        }
    }

}

export default DataBase