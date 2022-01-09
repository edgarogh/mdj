import MuiDialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import ListItemSecondaryAction from "@mui/material/ListItemSecondaryAction";
import CircularProgress from "@mui/material/CircularProgress";
import React, {useCallback, useEffect, useState} from "react";
import {useHistory, useRouteMatch} from "react-router-dom";
import CloseIcon from '@mui/icons-material/Close';
import RestoreIcon from '@mui/icons-material/Restore';
import * as routes from './routes';
import {useRootStore} from "./StoreProvider";
import {styled} from "@mui/material/styles";

const Dialog = styled(MuiDialog)`
    & .MuiDialog-paper {
        width: 100%;
    }
`;

const DialogCloseButton = styled(IconButton)`
    margin: 14px;
    position: absolute;
    right: 0;
    top: 0;
    color: ${({theme}) => theme.palette.grey[500]};
`;

export default function ArchiveDialogs() {
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
        <Dialog style={{width: '100%'}} open={!!route} onClose={history.goBack}>
            <DialogTitle>
                Archive
                <DialogCloseButton aria-label="close" onClick={history.goBack}>
                    <CloseIcon />
                </DialogCloseButton>
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
