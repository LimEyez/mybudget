import { store } from "@/redux/store";
import DataBase from "@/services/DataBase";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen"
import { SQLiteDatabase, SQLiteProvider } from "expo-sqlite";
import { StatusBar } from "expo-status-bar";
import React, { useEffect } from "react";
import { SafeAreaView } from "react-native";
import { initialWindowMetrics, SafeAreaProvider } from "react-native-safe-area-context";
import { Provider } from "react-redux";
import { NativeStack } from "@/services/NativeStack";
import { configureReanimatedLogger, ReanimatedLogLevel } from "react-native-reanimated";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {

    // This is the default configuration
    configureReanimatedLogger({
      level: ReanimatedLogLevel.warn,
      strict: false, // Reanimated runs in strict mode by default
    });

  const [loaded, error] = useFonts({
    'SemiBold': require('@/assets/fonts/SplineSans-SemiBold.ttf'),
  })
  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  };

  async function creareDbIfNeeded(db: SQLiteDatabase) {
    const DB = new DataBase(db);
    await DB.initDB();
    await DB.deleteEmptyTickets();
  }

  
  return (
    <SQLiteProvider databaseName="MyBudgetDatabase" onInit={creareDbIfNeeded}>
      <Provider store={store}>
        <NativeStack
          screenOptions={{ 
            // animation: "slide_from_right", 
            statusBarStyle: 'dark',
            // animationDuration: 100
            
          }}
        >
          <NativeStack.Screen
            name={"index"}
            options={{
              title: "App",
              headerShown: false,

            }}
          />
          <NativeStack.Screen
            name={'ticket/[id]'}
            options={{
              title: "new Ticket",
              headerShown: true,
            }}
          />
          <NativeStack.Screen
            name={'settings'}
            options={{
              title: "Настройки",
              headerShown: true,
            }}
          />
          <NativeStack.Screen
            name={'scanner'}
            options={{
              title: "Сканер",
              headerShown: true,
            }}
          />
        </NativeStack>
        <StatusBar translucent={false} style="auto" animated={true} />
      </Provider>
    </SQLiteProvider>
  );
}
