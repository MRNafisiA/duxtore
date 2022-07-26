import { DispatchContainer } from './dispatch';
import {
    AnyAction,
    createSlice,
    Draft,
    PayloadAction,
    Slice
} from '@reduxjs/toolkit';

type CommonSimpleState = unknown;
type CommonObjectState = Record<string, CommonSimpleState>;
type Actions = Record<string, (payload: any) => AnyAction>;
type SetFunctions<A extends Actions> = {
    [key in keyof A]: (value: A[key]) => void;
};
type Dux<S extends CommonObjectState | CommonSimpleState> = {
    slice: Slice<S>;
    setFunctions: SetFunctions<Slice<S>['actions']>;
    dispatchContainer: DispatchContainer;
};

const dux = <
    S extends CommonObjectState,
    E extends { [key: string]: Dux<any> } = { [key in never]: Dux<any> }
>(
    name: string,
    initialState: S,
    extraDuxes?: E
): Dux<
    S & {
        [key in keyof E]: E[key] extends Dux<infer U> ? U : never;
    }
> => {
    const customDispatchContainer = {
        value: undefined
    } as unknown as DispatchContainer;
    const slice = createSlice({
        name,
        initialState,
        reducers: createReducersByState(initialState),
        extraReducers: builder => {
            for (const key in extraDuxes) {
                builder.addMatcher(
                    ({ type }) =>
                        type.startsWith(extraDuxes[key].slice.name) &&
                        Object.keys(extraDuxes[key].slice.actions).includes(
                            type.substring(
                                extraDuxes[key].slice.name.length + 1
                            )
                        ),
                    (state, action) => {
                        extraDuxes[key].slice.reducer(state[key] as E, action);
                    }
                );
            }
        }
    });
    const setFunctions = createSetFunctionsByActions(
        slice.actions,
        customDispatchContainer
    );
    return {
        slice: slice as any,
        setFunctions,
        dispatchContainer: customDispatchContainer
    };
};

const simpleDux = <S extends CommonSimpleState>(
    name: string,
    initialState: S | (() => S)
): Dux<S> => {
    const customDispatchContainer = {
        value: undefined
    } as unknown as DispatchContainer;
    const slice = createSlice({
        name,
        initialState,
        reducers: {
            // @ts-ignore
            set: (state, { payload }) => payload
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
            (state, { payload }) => {
                // @ts-ignore
                state[key] = payload;
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
