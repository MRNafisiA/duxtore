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
type Dux<
    S extends CommonObjectState | CommonSimpleState,
    E extends { [key: string]: Dux<any, any> }
> = {
    slice: Slice<S>;
    setFunctions: SetFunctions<Slice<S>['actions']>;
    dispatchContainer: DispatchContainer;
    extraDuxes: E;
};

const dux = <
    S extends CommonObjectState,
    E extends { [key: string]: (name: string) => Dux<any, any> } = {
        [key in never]: () => Dux<any, any>;
    }
>(
    name: string,
    initialState: S,
    extraDuxes?: E
): Dux<
    S & {
        [key in keyof E]: ReturnType<E[key]> extends Dux<infer U, any>
            ? U
            : never;
    },
    {
        [key in keyof E]: ReturnType<E[key]>;
    }
> => {
    let duxes: {
        [key: string]: Dux<any, any>;
    };
    if (extraDuxes !== undefined) {
        duxes = Object.fromEntries(
            Object.keys(extraDuxes).map(key => [
                key,
                extraDuxes[key](name + '/' + key)
            ])
        );
    } else {
        duxes = {};
    }
    const customDispatchContainer = {
        value: undefined
    } as unknown as DispatchContainer;
    const slice = createSlice({
        name,
        initialState,
        reducers: createReducersByState(initialState),
        extraReducers: builder => {
            for (const key in duxes) {
                builder.addMatcher(
                    ({ type }) =>
                        type.startsWith(duxes[key].slice.name) &&
                        Object.keys(duxes[key].slice.actions).includes(
                            type.substring(duxes[key].slice.name.length + 1)
                        ),
                    (state, action) => {
                        duxes[key].slice.reducer(state[key] as E, action);
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
        dispatchContainer: customDispatchContainer,
        extraDuxes: duxes as any
    };
};

const simpleDux = <S extends CommonSimpleState>(
    name: string,
    initialState: S | (() => S)
): Dux<S, {}> => {
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
        dispatchContainer: customDispatchContainer,
        extraDuxes: {}
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
