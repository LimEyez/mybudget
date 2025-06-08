import { Dates } from "@/constants/interfaces/Dates";
import { Ticket } from "@/constants/interfaces/Ticket";
import DataBase from "@/services/DataBase";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { SQLiteDatabase, useSQLiteContext } from "expo-sqlite";





const initialState : {tickets: Ticket[], amount: number, loading: boolean, error: string | null} = {
    tickets: [],
    amount: 0,
    loading: false,
    error: null,
};

const fetchTickets = createAsyncThunk(
    "tickets/fetchTickets",
    async ({dates, DB} :{dates : Dates, DB: DataBase}) => {
        try {
            const tickets = (await DB.getTickets(dates.startDate, dates.endDate || false))
            const amount = tickets.reduce((sum, ticket : Ticket) => {
                sum += ticket.amount;
                return sum;
            }, 0)
            return {tickets, amount};
        } catch(error) {
            console.log(error)
            return {tickets: [], amount: 0};
        }
    }
);

const ticketsSlice = createSlice({
    name: "tickets",
    initialState,
    reducers:{},
    extraReducers: (builder) => {
        builder
        .addCase(fetchTickets.pending, (state) => {
          state.loading = true;
          state.error = null;

        })
        .addCase(fetchTickets.fulfilled, (state, action : PayloadAction<{tickets: Ticket[], amount: number}>) => {
          state.loading = false;
          state.tickets = Array.isArray(action.payload.tickets)? action.payload.tickets : [];
          state.amount = action.payload.amount
        })
        .addCase(fetchTickets.rejected, (state, action) => {
          state.loading = false;
          state.error = action.error.message || "Ошибка загрузки чеков";
        });
    }
})

export {fetchTickets}
export const ticketReducer = ticketsSlice.reducer