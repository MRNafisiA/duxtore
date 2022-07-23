import { Dispatch } from '@reduxjs/toolkit';
import Variable, { GetVariablesOfState } from './Variable';
import { useSelector as defaultUseSelector } from 'react-redux';
import { Dux, CommonObjectState, CommonSimpleState } from './dux';

const useDuxVariables = <S extends CommonObjectState>(
    dux: Dux<S>,
    selector: (rootState: never) => S,
    {
        useSelector = defaultUseSelector,
        dispatch
    }: {
        useSelector?: (selector: (rootState: never) => S) => S;
        dispatch?: Dispatch;
    }
): GetVariablesOfState<S> => {
    if (dispatch !== undefined) {
        dux.dispatchContainer.value = dispatch;
    }
    return Object.fromEntries(
        Object.entries(useSelector(selector)).map(([key, val]) => [
            key as unknown,
            {
                v: val,
                set: dux.setFunctions[key]
            }
        ])
    );
};

const useSimpleDuxVariables = <S extends CommonSimpleState>(
    dux: Dux<S>,
    selector: (rootState: never) => S,
    {
        useSelector = defaultUseSelector,
        dispatch
    }: {
        useSelector?: (selector: (rootState: never) => S) => S;
        dispatch?: Dispatch;
    }
): Variable<S> => {
    if (dispatch !== undefined) {
        dux.dispatchContainer.value = dispatch;
    }
    return {
        v: useSelector(selector),
        set: dux.setFunctions.set as Variable<S>['set']
    };
};

export default useDuxVariables;
export { useSimpleDuxVariables };
