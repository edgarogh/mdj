import {makeStyles} from "@material-ui/core";
import Snackbar from "@material-ui/core/Snackbar";
import Alert from "@material-ui/lab/Alert";
import {observer} from "mobx-react-lite";
import React, {useEffect} from "react";
import {useRootStore} from "./StoreProvider";
import {useNonNullMemo} from "./utils";

const useStyles = makeStyles({
    snackbar: {
        bottom: (props: ToastProps) => `${props.bottom}px`
    },
});

export interface ToastProps {
    bottom: number;
}

export default observer(function Toast(props: ToastProps) {
    const classes = useStyles(props);
    const { toasts } = useRootStore();
    const currentToast = toasts.current;

    useEffect(() => {
        currentToast?.startCountdown();
    }, [toasts.current]);

    const severity = useNonNullMemo(currentToast?.severity || "");
    const text = useNonNullMemo(currentToast?.text);

    return (
        <Snackbar
            className={classes.snackbar}
            open={!!currentToast}
            message={severity ? undefined : text}
        >
            {severity ? <Alert variant="filled" severity={severity}>{text}</Alert> : undefined}
        </Snackbar>
    );
});
