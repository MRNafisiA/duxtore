import dispatchContainer from './dispatch';
import { Dispatch } from '@reduxjs/toolkit';
import Variable, { GetVariablesOfState } from './Variable';
import { useSelector as defaultUseSelector } from 'react-redux';
import { Dux, CommonObjectState, CommonSimpleState } from './dux';

const useDuxVariables = <S extends CommonObjectState>(
    dux: Dux<S, any>,
    selector: (rootState: any) => S,
    {
        useSelector = defaultUseSelector,
        dispatch = dispatchContainer.value
    } = {} as {
        useSelector?: (selector: (rootState: any) => S) => S;
        dispatch?: Dispatch;
    }
): GetVariablesOfState<S> => {
    if (dux.dispatchContainer.value !== dispatch) {
        dux.dispatchContainer.value = dispatch;
    }
    const data = useSelector(selector);
    return Object.fromEntries(
        Object.keys(dux.slice.actions).map(key => [
            key as unknown,
            {
                v: data[key],
                set: dux.setFunctions[key]
            }
        ])
    );
};

const useSimpleDuxVariables = <S extends CommonSimpleState>(
    dux: Dux<S, any>,
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
        set: dux.setFunctions.set as Variable<S>['set']
    };
};

export default useDuxVariables;
export { useSimpleDuxVariables };
