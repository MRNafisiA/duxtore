import { SimpleDux } from './simpleDux';
import { CommonObjectState, Dux } from './dux';

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

type GetFullVariablesOfDux<
    S extends CommonObjectState,
    E extends { [key: string]: Dux<any, any> | SimpleDux<any> }
> = GetVariablesOfState<S> & {
    [key in keyof E]: E[key] extends Dux<infer U, infer Y>
        ? GetFullVariablesOfDux<U, Y>
        : E[key] extends SimpleDux<infer T>
        ? T
        : never;
};

type GetFullStateOfDux<
    S extends CommonObjectState,
    E extends { [key: string]: Dux<any, any> | SimpleDux<any> }
> = S & {
    [key in keyof E]: E[key] extends Dux<infer U, infer Y>
        ? GetFullStateOfDux<U, Y>
        : E[key] extends SimpleDux<infer T>
        ? T
        : never;
};

export type {
    Variable,
    GetVariableType,
    GetValuesOfVariables,
    GetVariablesOfState,
    GetFullVariablesOfDux,
    GetFullStateOfDux
};
