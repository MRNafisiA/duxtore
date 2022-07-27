import { Variable } from './typeUtils';
import { createSlice, Dispatch, Slice } from '@reduxjs/toolkit';
import { dispatchContainer, DispatchContainer } from './dispatch';
import { useSelector as defaultUseSelector } from 'react-redux/es/hooks/useSelector';

type CommonSimpleState = unknown;
type SimpleDux<S extends CommonSimpleState> = {
    slice: Slice<S>;
    setFunction: (value: S) => void;
    dispatchContainer: DispatchContainer;
};

const simpleDux = <S extends CommonSimpleState>(
    name: string,
    initialState: S | (() => S)
): SimpleDux<S> => {
    const customDispatchContainer = {
        value: undefined
    } as unknown as DispatchContainer;
    const slice = createSlice({
        name,
        initialState,
        reducers: {
            set: (_state, { payload }) => payload
        }
    });
    return {
        slice,
        setFunction: value => {
            customDispatchContainer.value(slice.actions.set(value));
        },
        dispatchContainer: customDispatchContainer
    };
};

const useSimpleDuxVariables = <S extends CommonSimpleState>(
    dux: SimpleDux<S>,
    selector: (rootState: any) => S,
    {
        useSelector = defaultUseSelector,
        dispatch = dispatchContainer.value
    } = {} as {
        useSelector?: (selector: (rootState: any) => S) => S;
        dispatch?: Dispatch;
    }
): Variable<S> => {
    if (dux.dispatchContainer.value !== dispatch) {
        dux.dispatchContainer.value = dispatch;
    }
    return {
        v: useSelector(selector),
        set: dux.setFunction
    };
};

export { simpleDux, useSimpleDuxVariables };
export type { CommonSimpleState, SimpleDux };
