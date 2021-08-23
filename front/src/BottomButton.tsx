import {makeStyles} from "@material-ui/core";
import Button from "@material-ui/core/Button";
import {createContext, ReactChildren, useContext, useEffect, useMemo, useState} from "react";

export interface WithBottomButtonProps {
    label: string,
    onClick();
}

export interface BottomButtonContextType {
    buttonProps: WithBottomButtonProps | undefined,
    update(props: WithBottomButtonProps);
}

const BottomButtonContext = createContext<BottomButtonContextType>({
    buttonProps: undefined,
    update(_) {
        throw "No bottom button context available";
    },
});

export interface BottomButtonProviderProps {
    children: ReactChildren,
}

export function BottomButtonProvider({ children }: BottomButtonProviderProps) {
    let [buttonProps, setButtonProps] = useState<WithBottomButtonProps | undefined>();

    const value = useMemo(() => ({
        buttonProps,
        update: setButtonProps,
    }), [buttonProps]);

    return (
        <BottomButtonContext.Provider value={value}>
            {children}
        </BottomButtonContext.Provider>
    );
}

export const useBottomButtonProps = () => useContext(BottomButtonContext).buttonProps;

export function WithBottomButton(props: WithBottomButtonProps) {
    const context = useContext(BottomButtonContext);

    useEffect(() => {
        context.update(props);
        return context.update.bind(undefined, undefined);
    }, [props.label, props.onClick]);

    return false;
}
