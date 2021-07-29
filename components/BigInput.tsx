import {Dispatch, SetStateAction, KeyboardEvent, forwardRef, ForwardedRef} from "react";

const BigInput = forwardRef(({value, setValue, placeholder, onKeyDown, autoFocus, className, onFocus}: {
    value: string,
    setValue: Dispatch<SetStateAction<string>>,
    placeholder: string,
    onKeyDown: (e: KeyboardEvent<HTMLInputElement>) => any,
    autoFocus: boolean,
    className?: string,
    onFocus?: () => any,
}, ref: ForwardedRef<HTMLInputElement>) => {
    return (
        <input
            type="text"
            className={"font-courier text-xl bg-gray-900 text-white focus:outline-none w-full " + (className || "")}
            placeholder={placeholder}
            value={value}
            onChange={e => setValue(e.target.value)}
            onKeyDown={onKeyDown}
            ref={ref}
            autoFocus={autoFocus}
            onFocus={onFocus}
        />
    );
});

export default BigInput;