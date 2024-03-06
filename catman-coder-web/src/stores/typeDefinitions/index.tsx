import { API, DefaultTypeDefinition, TypeDefinition } from "catman-coder-core";
import { fuzzy, save } from "@/services/typeDefinitions";
import { PayloadAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit";
const name = "type-definitions";

interface State {
  tds: TypeDefinition[];
  tdMap: {
    [index: string]: TypeDefinition;
  };
  typeDefinitionReferences: {
    [index: string]: string[];
  };
  newTds: TypeDefinition[];
}

const initialState: State = {
  tds: [],
  tdMap: {},
  newTds: [],
  typeDefinitionReferences: {},
};

export const TypeDefinitionListQuery = createAsyncThunk("type", async () => {
  return fuzzy({} as API.FuzzyQuery);
});

export const TypeDefinitionSave = createAsyncThunk(
  "type/save",
  async (payload: TypeDefinition) => {
    return save(payload);
  },
);
export const TypeDefinitionSlice = createSlice({
  name,
  initialState,
  reducers: {
    add(state, action: PayloadAction<TypeDefinition>) {
      state.newTds.push(action.payload);
      return;
    },
    save(state, action: PayloadAction<TypeDefinition>) {
      const td =
        action.payload instanceof DefaultTypeDefinition
          ? JSON.parse(JSON.stringify(action.payload))
          : action.payload;

      // 先判断是否是新的td
      const otd = state.tdMap[td.id!];
      if (otd) {
        const index = state.tds.findIndex((t) => {
          return t.id === td.id;
        });
        state.tds.splice(index, 1, td);
      } else {
        state.tds.push(td);
      }
      state.tdMap[td.id!] = td;
    },
    remove(state, action: PayloadAction<TypeDefinition>) {
      state.tds.push(action.payload);
      return;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(TypeDefinitionListQuery.fulfilled, (state, action) => {
      state.tds = action.payload.data;
      action.payload.data.forEach((td) => {
        if (td.id) {
          state.tdMap[td.id] = td;
        }
      });
    });
    builder.addCase(TypeDefinitionSave.fulfilled, (state, action) => {
      const td =
        action.payload.data instanceof DefaultTypeDefinition
          ? JSON.parse(JSON.stringify(action.payload.data))
          : action.payload.data;

      // 先判断是否是新的td
      const otd = state.tdMap[td.id!];
      if (otd) {
        const index = state.tds.findIndex((t) => {
          return t.id === td.id;
        });
        state.tds.splice(index, 1, td);
      } else {
        state.tds.push(td);
      }
      state.tdMap[td.id!] = td;
    });
  },
});
export default TypeDefinitionSlice.reducer;
