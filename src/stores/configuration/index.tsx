import { findByName } from "@/services/configuration"
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"

interface State {
    layout?: Configuration.ConfigurationItem
}
const initialState: State = {
}
export const LayoutQuery = createAsyncThunk("layout", async () => {
    return findByName("flex-layout")
})

export const ConfigurationSlice = createSlice({
    name: "configuration",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(LayoutQuery.fulfilled, (state, action) => {
            state.layout = action.payload.data
        })
    }
})

export default ConfigurationSlice.reducer
