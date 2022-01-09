import React, {useCallback, useMemo, useState} from "react";
import {makeStyles} from "@mui/styles";
import Divider from "@mui/material/Divider";
import TextField from "@mui/material/TextField";
import MuiCard from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import {useHistory, useRouteMatch} from "react-router-dom";
import {WithBottomButton} from "../BottomButton";
import {useRootStore} from "../StoreProvider";
import {observer} from "mobx-react-lite";
import {styled} from "@mui/material/styles";
import BackButton from "../BackButton";
import * as routes from "../routes";

const Card = styled(MuiCard)`
    margin: 0 8px 8px 8px;
    width: calc(100% - ${({theme}) => theme.spacing(2)}) !important;
`;

const useStyles = makeStyles({
    field: {
        display: 'flex',
        justifyContent: 'space-between',
        gap: '8px',
        width: '100%',
        '&:not(:last-child)': {
            marginBottom: '12px',
        }
    },
    subField: {
        flex: 1,
    },
});

export default observer(function CourseEdit() {
    // @ts-ignore
    const { params: { id } } = useRouteMatch('/courses/:id');
    const history = useHistory();

    const classes = useStyles();
    const { accountInfo } = useRootStore();
    const store = useRootStore();
    const courses = store.courseStore.courses;

    const isNew = id === 'new';
    const instance = useMemo(() => Date.now(), []);

    const defaultRecurrences = useMemo(() => {
        const first = accountInfo.recurrences[0];
        if (first) {
            return first.join(',');
        } else {
            return '0,1,3,7,14,21,30,45,60,75,90,95,110'; // TODO
        }
    }, []);

    const course = useMemo(() => {
        if (!isNew) {
            return courses.find((c) => c.id === id);
        } else {
            return undefined;
        }
    }, []);

    const [name, setName] = useState<string>(course?.name || '');
    const [description, setDescription] = useState<string>(course?.description || '');
    const [j0, setJ0] = useState<string>(course?.j_0?.value || (new Date()).toISOString().substr(0,10));
    const [jEnd, setJEnd] = useState<string>(course?.j_end?.value || '2022-07-01'); // TODO default
    const [recurrence, setRecurrence] = useState<string>(course?.recurrence || defaultRecurrences);

    const nameValid = useMemo(() => name.length >= 1, [name]);
    const recurrenceValid = useMemo(() => !!/^0(?:,\d{1,6})+$/.exec(recurrence), [recurrence]);

    const submit = useCallback(() => {
        const object = {
            id: course?.id || '',
            name,
            description,
        } as any;

        if (course) {
            course.update(object);
            if ((recurrence !== course.recurrence || j0 !== course.j_0.value || jEnd !== course.j_end.value)
                && confirm("Êtes vous sûr·e de vouloir mettre à jour le schéma de récurrence ? Cela effacera les annotations de chaque évènement lié au cours.")) {
                course.updateRecurrence(recurrence, j0, jEnd);
            }
        } else {
            object.j_0 = j0;
            object.j_end = jEnd;
            object.recurrence = recurrence;
            store.courseStore.createCourse(object);
        }

        history.push('/courses');
    }, [course?.id, name, description, j0, jEnd, recurrence, history]);

    return <>
        <BackButton label={"Annuler"} to={routes.COURSES}/>
        <Card>
            <CardContent>
                <TextField
                    label={"Nom"}
                    className={classes.field}
                    variant="outlined"
                    error={!nameValid}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
                <TextField
                    label={"Description"}
                    className={classes.field}
                    variant="outlined"
                    multiline rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />
            </CardContent>
            <Divider/>
            <CardContent>
                <div className={classes.field}>
                    <TextField
                        label={"Jour 0"}
                        className={classes.subField}
                        variant="outlined"
                        type="date"
                        value={j0}
                        onChange={(e) => setJ0(e.target.value)}
                    />{/** TODO **/}
                    <TextField
                        label={"Jour de fin"}
                        className={classes.subField}
                        variant="outlined"
                        type="date"
                        value={jEnd}
                        onChange={(e) => setJEnd(e.target.value)}
                    />{/** TODO **/}
                </div>
                <TextField
                    label={"Jours de récurrence"}
                    className={classes.field}
                    variant="outlined"
                    error={!recurrenceValid}
                    placeholder={defaultRecurrences}
                    value={recurrence}
                    onChange={(e) => setRecurrence(e.target.value)}
                />{/** TODO **/}
            </CardContent>
        </Card>
        <WithBottomButton
            instance={instance}
            label={isNew ? "Créer le cours" : "Enregistrer"}
            disabled={!(nameValid && recurrenceValid)}
            onClick={submit}
        />
    </>
});
