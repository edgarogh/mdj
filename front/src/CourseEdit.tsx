import React, {useCallback, useMemo, useState} from "react";
import {makeStyles} from "@material-ui/core";
import Button from "@material-ui/core/Button";
import Divider from "@material-ui/core/Divider";
import TextField from "@material-ui/core/TextField";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import {Link, useHistory, useRouteMatch} from "react-router-dom";
import {WithBottomButton} from "./BottomButton";
import ChevronLeftIcon from "@material-ui/icons/ChevronLeft";
import {useRootStore} from "./StoreProvider";
import {observer} from "mobx-react-lite";

const useStyles = makeStyles({
    backButton: {
        margin: '8px',
    },
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
    const [jEnd, setJEnd] = useState<string>(course?.j_end?.value || '2021-12-18'); // TODO default
    const [recurrence, setRecurrence] = useState<string>(course?.recurrence || defaultRecurrences);

    const nameValid = useMemo(() => name.length >= 1, [name]);
    const recurrenceValid = useMemo(() => !!/^0(?:,\d{1,6})+$/.exec(recurrence), [recurrence]);

    const submit = useCallback(() => {
        const object = {
            id: course?.id || '',
            name,
            description,
            j_0: j0,
            j_end: jEnd,
            recurrence,
        };

        if (course) {
            course.update(object);
        } else {
            store.courseStore.createCourse(object);
        }

        history.push('/courses');
    }, [course?.id, name, description, j0, jEnd, recurrence, history]);

    return <>
        <Button
            className={classes.backButton}
            size="small"
            startIcon={<ChevronLeftIcon/>}
            to="/courses"
            component={Link}
        >
            Annuler
        </Button>
        <Card style={{ margin: '0 8px 8px 8px' }}>
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
