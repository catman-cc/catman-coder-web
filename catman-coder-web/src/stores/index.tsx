import { configureStore, } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import configurationSlice from './configuration';
import ParameterSlice from './parameter';
import typeDefinitionsSlice from './typeDefinitions';
import resourceSlice from "./resource";

export const store = configureStore({
    reducer: {
        typeDefinitions: typeDefinitionsSlice,
        parameter: ParameterSlice,
        configuration: configurationSlice,
        resource:resourceSlice
    }
})

export type RootState = ReturnType<typeof store.getState>
export type RootDispatch = typeof store.dispatch

export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector

export const useAppDispatch = () => useDispatch<RootDispatch>()
