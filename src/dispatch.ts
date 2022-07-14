const dispatchContainer = { value: undefined } as unknown as {
    value: (action: Record<string, unknown>) => void;
};

const initDispatch = (_dispatch: typeof dispatchContainer.value) => {
    dispatchContainer.value = _dispatch;
};

export default dispatchContainer;
export { initDispatch };
