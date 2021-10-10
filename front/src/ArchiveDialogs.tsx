import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import IconButton from "@material-ui/core/IconButton";
import Typography from "@material-ui/core/Typography";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import CircularProgress from "@material-ui/core/CircularProgress";
import React, {useCallback, useEffect, useState} from "react";
import {useHistory, useRouteMatch} from "react-router-dom";
import CloseIcon from '@material-ui/icons/Close';
import RestoreIcon from '@material-ui/icons/Restore';
import * as routes from './routes';
import {makeStyles} from "@material-ui/core/styles";
import {useRootStore} from "./StoreProvider";

const useStyles = makeStyles((theme) => ({
    dialog: {
        '& .MuiDialog-paper': {
            width: '100%',
        }
    },
    dialogTitle: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    closeButton: {
        position: 'absolute',
        right: theme.spacing(1),
        top: theme.spacing(1),
        color: theme.palette.grey[500],
    }
}));

export default function ArchiveDialogs() {
    const classes = useStyles();

    const history = useHistory();
    const route = useRouteMatch([routes.ARCHIVE_COURSES]);
    const isOpen = route != undefined;
    const { api } = useRootStore();

    const [archived, setArchived] = useState<undefined | any[]>();
    useEffect(() => {
        setArchived(undefined);
        if (route?.path == undefined) {
            // Do nothing
        } else if (route.path == routes.ARCHIVE_COURSES) {
            api.fetchCourses(true).then((courses) => setArchived(courses));
        } else {
            throw "Unreachable if comparison is correct";
        }
    }, [route?.path]);

    return (
        <Dialog className={classes.dialog} style={{width: '100%'}} open={!!route} onClose={history.goBack}>
            <DialogTitle disableTypography>
                <Typography variant="h6">Archive</Typography>
                <IconButton className={classes.closeButton} aria-label="close" onClick={history.goBack}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent dividers>
                {archived ? (
                    archived.length > 0 ? (
                        <List>
                            {archived.map((course) => <ArchivedItem key={course.id} course={course} />)}
                        </List>
                    ) : (
                        <i>Aucun cours n'est archivé</i>
                    )
                ) : (
                    isOpen && <CircularProgress />
                )}
            </DialogContent>
        </Dialog>
    );
}

interface ArchivedItemProps {
    course: any;
}

function ArchivedItem({ course }: ArchivedItemProps) {
    const { courseStore } = useRootStore();

    const [restored, setRestored] = useState(false);

    const onRestoreButtonPressed = useCallback(() => {
        setRestored(true);
        courseStore.restoreCourse(course.id);
    }, [course.id]);

    return (
        <ListItem disabled={restored}>
            <ListItemText primary={course.name} secondary={restored ? <b>Restauré</b> : course.description}/>
            <ListItemSecondaryAction>
                <IconButton edge="end" aria-label={"Restaurer"} disabled={restored} onClick={onRestoreButtonPressed}>
                    <RestoreIcon/>
                </IconButton>
            </ListItemSecondaryAction>
        </ListItem>
    )
}
