import { Dispatch } from '@reduxjs/toolkit';

type DispatchContainer = { value: Dispatch };
const dispatchContainer = { value: undefined } as unknown as DispatchContainer;
const initDispatch = (dispatch: Dispatch) => {
    dispatchContainer.value = dispatch;
};

export { dispatchContainer, initDispatch };
export type { DispatchContainer };
