import { useSelector } from 'react-redux';
import Variable, { GetVariablesOfState } from './Variable';
import { Dux, CommonObjectState, CommonSimpleState } from './dux';

const useDuxVariables = <S extends CommonObjectState>(
    dux: Dux<S>,
    selector: (rootState: never) => S
): GetVariablesOfState<S> =>
    Object.fromEntries(
        Object.entries(useSelector(selector)).map(([key, val]) => [
            key as unknown,
            {
                v: val,
                set: dux.setFunctions[key]
            }
        ])
    );

const useSimpleDuxVariables = <S extends CommonSimpleState>(
    dux: Dux<S>,
    selector: (rootState: never) => S
): Variable<S> => ({
    v: useSelector(selector),
    set: dux.setFunctions.set as Variable<S>['set']
});

export default useDuxVariables;
export { useSimpleDuxVariables };
