type VoidCallBack = () => void;
type CallBack<T> = () => T;
type CallBackWithParams<T, U> = (data: U) => T;
type CallBackWith2Params<T, U, V> = (data1: U, data2: V) => T;
