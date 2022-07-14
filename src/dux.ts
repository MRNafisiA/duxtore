import dispatchContainer from './dispatch';
import { createSlice, Draft, PayloadAction, Slice } from '@reduxjs/toolkit';

type CommonObjectState = Record<string, unknown>;
type CommonSimpleState = unknown;
type Actions = Record<string, (payload: any) => Record<string, unknown>>;
type SetFunctions<A extends Actions> = {
    [key in keyof A]: (value: A[key]) => void;
};
type Dux<S extends CommonObjectState | CommonSimpleState> = {
    slice: Slice<S>;
    setFunctions: SetFunctions<Slice<S>['actions']>;
};

const dux = <S extends CommonObjectState>(
    name: string,
    initialState: S
): Dux<S> => {
    const slice = createSlice({
        name,
        initialState,
        reducers: createReducersByState(initialState)
    });
    const setFunctions = createSetFunctionsByActions(slice.actions);
    return {
        slice,
        setFunctions
    };
};

const simpleDux = <S extends CommonSimpleState>(
    name: string,
    initialState: S
): Dux<S> => {
    const slice = createSlice({
        name,
        initialState,
        reducers: {
            // @ts-ignore
            set: (state, action) => {
                state = action.payload;
            }
        }
    });
    return {
        slice,
        setFunctions: {
            set: value => {
                dispatchContainer.value(slice.actions.set(value));
            }
        }
    };
};

const createReducersByState = <S extends CommonObjectState>(
    initialState: S
): {
    [key in keyof S]: (state: Draft<S>, action: PayloadAction<S[key]>) => void;
} =>
    Object.fromEntries(
        Object.keys(initialState).map(key => [
            key as unknown,
            (state, action) => {
                // @ts-ignore
                state[key] = action.payload;
            }
        ])
    );

const createSetFunctionsByActions = <A extends Actions>(
    actions: A
): SetFunctions<A> =>
    Object.fromEntries(
        Object.entries(actions).map(([key, action]) => [
            key as unknown,
            value => {
                dispatchContainer.value(action(value));
            }
        ])
    );

export default dux;
export { simpleDux, createReducersByState, createSetFunctionsByActions };
export type {
    CommonObjectState,
    CommonSimpleState,
    Actions,
    SetFunctions,
    Dux
};
