import { Dates } from "@/constants/interfaces/Dates";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { format } from "date-fns";

const startAndEndDates = (() => {
    const nowDate = format(Date.now(), "yyyy-MM-dd");
    const date = new Date(nowDate);
    const startDate = new Date(date.getFullYear(), date.getMonth(), 1);
    const endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    return {
        startDate: format(startDate, "yyyy-MM-dd"),
        endDate: format(endDate, "yyyy-MM-dd")
    }
})();

const initialState = {
    dates: startAndEndDates
};

const datesSlice = createSlice({
    name: "dates",
    initialState,
    reducers: {
        setDates: (state, action: PayloadAction<Dates>) => {
            state.dates = action.payload;
        },
        resetDates: (state, action) => {
            state.dates = startAndEndDates
        }
    }
});

export const {setDates, resetDates} = datesSlice.actions;
export const datesReducer = datesSlice.reducer