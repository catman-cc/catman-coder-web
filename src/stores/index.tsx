import { configureStore, } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import configurationSlice from './configuration';
import typeDefinitionsSlice from './typeDefinitions';

export const store = configureStore({
    reducer: {
        typeDefinitions: typeDefinitionsSlice,
        configuration: configurationSlice
    }
})

export type RootState = ReturnType<typeof store.getState>
export type RootDispatch = typeof store.dispatch

export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector

export const useAppDispatch = () => useDispatch<RootDispatch>()
