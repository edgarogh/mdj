import {makeStyles} from "@material-ui/core";
import Button from "@material-ui/core/Button";
import IconButton from "@material-ui/core/IconButton";
import Paper from "@material-ui/core/Paper";
import Snackbar from "@material-ui/core/Snackbar";
import Typography from "@material-ui/core/Typography";
import ExitToApp from "@material-ui/icons/ExitToApp";
import FileCopyIcon from "@material-ui/icons/FileCopy";
import Skeleton from "@material-ui/lab/Skeleton";
import copy from "copy-to-clipboard";
import React, {useCallback, useEffect, useMemo, useState} from "react";
import {useApi} from "./Api";

const useStyles = makeStyles({
    paper: {
        borderRadius: 0,
        padding: '8px',
        '&:not(:last-child)': {
            marginBottom: '8px',
        },
    },
    paperInner: {
        display: 'flex',
        flexDirection: 'row',
    },
    linkButton: {
        marginRight: '8px',
        flex: 1,
        fontFamily: 'monospace',
        textTransform: 'none',
        textOverflow: 'ellipsis',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        textAlign: 'left',
        justifyContent: 'start',
    },
    disconnectButtonContainer: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'end',
        margin: '0 8px',
    },
});

export default function Settings() {
    const classes = useStyles();
    const { accountInfo: { id: accountId } } = useApi();

    const icalUrl = useMemo(() => (
        accountId ? (`${location.protocol}//${location.host}` + "/ical/" + accountId) : undefined
    ), [accountId]);

    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarTimeout, setSnackbarTimeout] = useState<number | undefined>(undefined);

    useEffect(() => () => {
        if (snackbarTimeout) clearTimeout(snackbarTimeout);
    }, [snackbarTimeout]);

    const doCopy = useCallback(() => {
        copy(icalUrl!!);
        setSnackbarOpen(true);
        if (snackbarTimeout) clearTimeout(snackbarTimeout);
        setSnackbarTimeout(setTimeout(() => {
            setSnackbarTimeout(undefined);
            setSnackbarOpen(false);
        }, 2000));
    }, [icalUrl, snackbarTimeout]);

    return (
        <div style={{ paddingTop: '8px' }}>
            <Paper className={classes.paper}>
                <Typography component="h2">Importer dans un calendrier</Typography>
                <div className={classes.paperInner}>
                    <Button disabled={!icalUrl} className={classes.linkButton} variant="outlined" onClick={doCopy}>
                        {icalUrl ? (
                            icalUrl
                        ): (
                            <Skeleton width="100%"/>
                        )}
                    </Button>
                    <IconButton disabled={!icalUrl} onClick={doCopy}>
                        <FileCopyIcon/>
                    </IconButton>
                    <Snackbar
                        open={snackbarOpen}
                        message={"URL copié"}
                    />
                </div>
            </Paper>
            <div className={classes.disconnectButtonContainer}>
                <Button startIcon={<ExitToApp/>} href="/logout">Se déconnecter</Button>
            </div>
        </div>
    );
}
