import { configureStore } from "@reduxjs/toolkit";
import {datesReducer} from '@/redux/datesSlice';
import { ticketReducer } from "./ticketsSlice";
import devtoolsEnhancer from "redux-devtools-expo-dev-plugin";

export const store = configureStore({
    reducer: {
        dates: datesReducer,
        tickets: ticketReducer,
    },
    devTools: false,
    enhancers: getDefaultEnhancers => getDefaultEnhancers().concat(devtoolsEnhancer()),
})

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;