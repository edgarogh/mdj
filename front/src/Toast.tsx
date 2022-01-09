import MuiSnackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import {observer} from "mobx-react-lite";
import React, {useEffect} from "react";
import {useRootStore} from "./StoreProvider";
import {useNonNullMemo} from "./utils";
import {styled} from "@mui/material/styles";

const Snackbar = styled(MuiSnackbar)`
    bottom: ${(props: ToastProps) => props.bottom}px;
`;

export interface ToastProps {
    bottom: number;
}

export default observer(function Toast(props: ToastProps) {
    const { toasts } = useRootStore();
    const currentToast = toasts.current;

    useEffect(() => {
        currentToast?.startCountdown();
    }, [toasts.current]);

    const severity = useNonNullMemo(currentToast?.severity || "");
    const text = useNonNullMemo(currentToast?.text);

    return (
        <Snackbar
            open={!!currentToast}
            message={severity ? undefined : text}
            bottom={props.bottom}
        >
            {severity ? <Alert variant="filled" severity={severity}>{text}</Alert> : undefined}
        </Snackbar>
    );
});
