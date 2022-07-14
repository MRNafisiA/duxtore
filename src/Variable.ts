import { CommonObjectState } from './dux';

type Variable<T> = {
    v: T;
    set: (value: T) => void;
};

type GetVariableType<C extends Variable<any>> = C extends Variable<infer T>
    ? T
    : never;

type GetValuesOfVariables<V extends Record<string, Variable<any>>> = {
    [P in keyof V]: GetVariableType<V[P]>;
};

type GetVariablesOfState<S extends CommonObjectState> = {
    [P in keyof S]: Variable<S[P]>;
};

export default Variable;
export type { GetVariableType, GetValuesOfVariables, GetVariablesOfState };
