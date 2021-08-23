import {makeStyles} from "@material-ui/core";
import IconButton from "@material-ui/core/IconButton";
import Button from "@material-ui/core/Button";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";
import FileCopyIcon from "@material-ui/icons/FileCopy";
import ExitToApp from "@material-ui/icons/ExitToApp";
import Skeleton from "@material-ui/lab/Skeleton";
import copy from 'copy-to-clipboard';
import {useCallback, useMemo} from "react";
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
    },
});

export default function Settings() {
    const classes = useStyles();
    const { accountInfo: { id: accountId } } = useApi();

    const icalUrl = useMemo(() => (
        accountId ? ("webcal://127.0.0.1:8000/ical/" + accountId) : undefined
    ), [accountId]);

    const doCopy = useCallback(() => {
        copy(icalUrl!!);
    }, [icalUrl]);

    return (
        <div style={{ paddingTop: '8px' }}>
            <Paper className={classes.paper}>
                <Typography component="h2">Importer dans un calendrier</Typography>
                <div className={classes.paperInner}>
                    <Button disabled={!icalUrl} className={classes.linkButton} variant="outlined" href={icalUrl}>
                        {icalUrl ? (
                            icalUrl
                        ): (
                            <Skeleton width="100%"/>
                        )}
                    </Button>
                    <IconButton disabled={!icalUrl} onClick={doCopy}>
                        <FileCopyIcon/>
                    </IconButton>
                </div>
            </Paper>
            <div className={classes.disconnectButtonContainer}>
                <Button startIcon={<ExitToApp/>} href="/logout">Se déconnecter</Button>
            </div>
        </div>
    );
}
