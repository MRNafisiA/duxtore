import { Dux, CommonObjectState } from './dux';
import { useSelector } from 'react-redux';
import { GetVariablesOfState } from './Variable';

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

export default useDuxVariables;
