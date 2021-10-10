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
import {observer} from "mobx-react-lite";
import {useRootStore} from "./StoreProvider";
import {Link} from "react-router-dom";
import * as routes from './routes';
import ArchiveDialogs from "./ArchiveDialogs";

const useStyles = makeStyles({
    paper: {
        borderRadius: 0,
        padding: '8px',
        '&:not(:last-child)': {
            marginBottom: '12px',
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
    archiveRow: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        marginTop: '12px',
        '& > *': {
            width: '80%',
        },
    },
    disconnectButtonContainer: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'end',
        margin: '0 8px',
    },
});

export default observer(function Settings() {
    const classes = useStyles();
    const store = useRootStore();
    const accountId = store.accountInfo.id;

    const icalUrl = useMemo(() => (
        accountId ? (`${location.protocol}//${location.host}` + "/ical/" + accountId) : undefined
    ), [accountId]);

    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarTimeout, setSnackbarTimeout] = useState<ReturnType<typeof setTimeout> | undefined>(undefined);

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
                <Typography variant="h6" component="h2">Importer dans un calendrier</Typography>
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
            <Paper className={classes.paper}>
                <Typography variant="h6" component="h2">Archive</Typography>
                <Typography variant="body1" color="textSecondary">Votre archive rassemble les cours manuellement marqués comme archivés. Elle permet de mettre de côté des cours arrivés à leur échéance sans pour autant les supprimer définitivement.</Typography>
                <div className={classes.archiveRow}>
                    <Button variant="outlined" to={routes.ARCHIVE_COURSES} component={Link}>Ouvrir</Button>
                </div>
                <ArchiveDialogs/>
            </Paper>
            <div className={classes.disconnectButtonContainer}>
                <Button startIcon={<ExitToApp/>} href="/logout">Se déconnecter</Button>
            </div>
        </div>
    );
});
