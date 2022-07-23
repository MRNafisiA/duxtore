import dispatchContainer, { DispatchContainer } from './dispatch';
import {
    AnyAction,
    createSlice,
    Draft,
    PayloadAction,
    Slice
} from '@reduxjs/toolkit';

type CommonObjectState = Record<string, unknown>;
type CommonSimpleState = unknown;
type Actions = Record<string, (payload: any) => AnyAction>;
type SetFunctions<A extends Actions> = {
    [key in keyof A]: (value: A[key]) => void;
};
type Dux<S extends CommonObjectState | CommonSimpleState> = {
    slice: Slice<S>;
    setFunctions: SetFunctions<Slice<S>['actions']>;
    dispatchContainer: DispatchContainer;
};

const dux = <S extends CommonObjectState>(
    name: string,
    initialState: S
): Dux<S> => {
    const customDispatchContainer = { ...dispatchContainer };
    const slice = createSlice({
        name,
        initialState,
        reducers: createReducersByState(initialState)
    });
    const setFunctions = createSetFunctionsByActions(
        slice.actions,
        customDispatchContainer
    );
    return {
        slice,
        setFunctions,
        dispatchContainer: customDispatchContainer
    };
};

const simpleDux = <S extends CommonSimpleState>(
    name: string,
    initialState: S | (() => S)
): Dux<S> => {
    const customDispatchContainer = { ...dispatchContainer };
    const slice = createSlice({
        name,
        initialState,
        reducers: {
            // @ts-ignore
            set: (state, action) => action.payload
        }
    });
    return {
        slice,
        setFunctions: {
            set: value => {
                customDispatchContainer.value(slice.actions.set(value));
            }
        },
        dispatchContainer: customDispatchContainer
    };
};

const createReducersByState = <S extends CommonObjectState>(
    initialState: S | (() => S)
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
    actions: A,
    dispatchContainer: DispatchContainer
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
