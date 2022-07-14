import useDuxVariables from './useDuxVariables';
import dispatchContainer, { initDispatch } from './dispatch';
import Variable, {
    GetValuesOfVariables,
    GetVariablesOfState,
    GetVariableType
} from './Variable';
import dux, {
    Actions,
    CommonObjectState,
    CommonSimpleState,
    simpleDux,
    createReducersByState,
    createSetFunctionsByActions,
    Dux,
    SetFunctions
} from './dux';

export { dispatchContainer, initDispatch };
export {
    type CommonObjectState,
    type CommonSimpleState,
    type Actions,
    type SetFunctions,
    type Dux,
    dux,
    simpleDux,
    createReducersByState,
    createSetFunctionsByActions
};
export { useDuxVariables };
export type {
    Variable,
    GetVariableType,
    GetValuesOfVariables,
    GetVariablesOfState
};
