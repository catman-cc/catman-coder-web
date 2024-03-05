import { fuzzy, save } from "@/services/Parameter";
import { PayloadAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit";
const name = "parameter"
interface ParameterInfo {
    changed: boolean
    isNew: boolean
}
interface ParameterInfos {
    [index: string]: ParameterInfo
}
interface State {
    parameters: Core.Parameter[]
    infos: ParameterInfos
}

const initialState: State = {
    parameters: [],
    infos: {}
}

export const ParameterListQuery = createAsyncThunk(
    "parameter",
    async () => {
        return fuzzy({} as API.FuzzyQuery)
    }
)

export const ParameterSave = createAsyncThunk(
    "parameter/save",
    async (payload: Core.Parameter) => {
        return save(payload)
    }
)

export const ParameterSlice = createSlice({
    name,
    initialState,
    reducers: {

        add(state, action: PayloadAction<Core.Parameter>) {
            const param = action.payload
            state.parameters.push(param)
            state.infos[param.id] = state.infos[param.id] || {
                changed: true, isNew: true
            }
            state.infos[param.id].isNew = true
            return
        },
    },
    extraReducers: (builder) => {
        builder.addCase(ParameterListQuery.fulfilled, (state, action) => {
            state.parameters = action.payload.data
        })
    }
})
export default ParameterSlice.reducer
