import { dispatchContainer, DispatchContainer } from './dispatch';
import { GetFullStateOfDux, GetFullVariablesOfDux } from './typeUtils';
import { useSelector as defaultUseSelector } from 'react-redux';
import {
    AnyAction,
    createSlice,
    Dispatch,
    Draft,
    PayloadAction,
    Slice
} from '@reduxjs/toolkit';
import { SimpleDux } from './simpleDux';

type CommonObjectState = Record<string, unknown>;
type Actions = Record<string, (payload: unknown) => AnyAction>;
type SetFunctions<A extends Actions> = {
    [key in keyof A]: (value: A[key]) => void;
};
type Dux<
    S extends CommonObjectState,
    E extends { [key: string]: Dux<any, any> | SimpleDux<any> }
> = {
    slice: Slice<GetFullStateOfDux<S, E>>;
    setFunctions: SetFunctions<Slice<S>['actions']>;
    dispatchContainer: DispatchContainer;
    extraDuxes: E;
};

const dux = <
    S extends CommonObjectState,
    E extends {
        [key: string]: (name: string) => Dux<any, any> | SimpleDux<any>;
    } = {
        [key in never]: () => Dux<any, any> | SimpleDux<any>;
    }
>(
    name: string,
    initialState: S,
    extraDuxes?: E
): Dux<
    S,
    {
        [key in keyof E]: ReturnType<E[key]>;
    }
> => {
    let duxes: {
        [key: string]: Dux<any, any> | SimpleDux<any>;
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
        initialState: {
            ...initialState,
            ...Object.fromEntries(
                Object.entries(duxes).map(([key, val]) => [
                    key,
                    val.slice.getInitialState()
                ])
            )
        },
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
                        duxes[key].slice.reducer(state[key], action);
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

const useDuxVariables = <
    S extends CommonObjectState,
    E extends { [key: string]: Dux<any, any> | SimpleDux<any> }
>(
    dux: Dux<S, E>,
    selector: (rootState: any) => GetFullStateOfDux<S, E>,
    {
        useSelector = defaultUseSelector,
        dispatch = dispatchContainer.value
    } = {} as {
        useSelector?: (
            selector: (rootState: any) => GetFullStateOfDux<S, E>
        ) => GetFullStateOfDux<S, E>;
        dispatch?: Dispatch;
    }
): GetFullVariablesOfDux<S, E> =>
    getDuxVariables(dux, dispatch, useSelector(selector)) as any;

const getDuxVariables = (
    dux: Dux<any, any> | SimpleDux<any>,
    dispatch: Dispatch,
    state: CommonObjectState
) => {
    if (dux.dispatchContainer.value !== dispatch) {
        dux.dispatchContainer.value = dispatch;
    }
    if (isSimpleDux(dux)) {
        return {
            v: state,
            set: dux.setFunction
        };
    }
    const variables: { [key: string]: any } = {};
    for (const actionsKey in dux.slice.actions) {
        variables[actionsKey] = {
            v: state[actionsKey],
            set: dux.setFunctions[actionsKey]
        };
    }
    for (const duxKey in dux.extraDuxes) {
        variables[duxKey] = getDuxVariables(
            dux.extraDuxes[duxKey],
            dispatch,
            state[duxKey] as CommonObjectState
        );
    }
    return variables;
};

const isSimpleDux = (
    duxOrSimpleDux: Dux<any, any> | SimpleDux<any>
): duxOrSimpleDux is SimpleDux<any> =>
    (duxOrSimpleDux as Dux<any, any>).extraDuxes === undefined;

export {
    dux,
    createReducersByState,
    createSetFunctionsByActions,
    useDuxVariables,
    getDuxVariables
};
export type { CommonObjectState, Actions, SetFunctions, Dux };
