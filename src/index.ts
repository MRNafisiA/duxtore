export {
    dux,
    createReducersByState,
    createSetFunctionsByActions,
    useDuxVariables,
    getDuxVariables,
    type CommonObjectState,
    type Actions,
    type SetFunctions,
    type Dux
} from './dux';
export {
    simpleDux,
    useSimpleDuxVariables,
    type CommonSimpleState,
    type SimpleDux
} from './simpleDux';
export {
    dispatchContainer,
    initDispatch,
    type DispatchContainer
} from './dispatch';
export type {
    Variable,
    GetVariableType,
    GetValuesOfVariables,
    GetVariablesOfState,
    GetFullVariablesOfDux,
    GetFullStateOfDux
} from './typeUtils';
