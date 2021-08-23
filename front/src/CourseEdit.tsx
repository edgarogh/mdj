import {makeStyles} from "@material-ui/core";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import {useCallback, useMemo, useState} from "react";
import {Link, useHistory, useRouteMatch} from "react-router-dom";
import {Course, useApi} from "./Api";
import {WithBottomButton} from "./BottomButton";
import ChevronLeftIcon from "@material-ui/icons/ChevronLeft";

const useStyles = makeStyles({
    backButton: {
        margin: '8px',
    },
});

export default function CourseEdit() {
    const { params: { id } } = useRouteMatch('/courses/:id');
    const history = useHistory();

    const classes = useStyles();
    const { courses, insertOrUpdateCourse } = useApi();

    const isNew = id === 'new';

    const course = useMemo(() => {
        if (!isNew) {
            if (courses === undefined) throw "Unknown course"; // Shouldn't happen in most contexts
            return courses.find((c) => c.id === id);
        } else {
            return undefined;
        }
    }, []);

    const [name, setName] = useState(course?.name || '');
    const [description, setDescription] = useState(course?.description || '');
    const [j0, setJ0] = useState(course?.j_0 || (new Date()).toISOString().substr(0,10));
    const [jEnd, setJEnd] = useState(course?.j_end || '2021-12-18'); // TODO default
    const [recurrence, setRecurrence] = useState(course?.recurrence || '0,1,3'); // TODO default

    const recurrenceValid = useMemo(() => {
        try {
            return recurrence.startsWith('0,')
                && recurrence.split(',').map((n) => parseInt(n, 10)).length >= 2
        } catch (e) {
            return false;
        }
    }, [recurrence]);

    const submit = useCallback(() => {
        insertOrUpdateCourse({
            id: course?.id || '',
            name,
            description,
            j_0: j0,
            j_end: jEnd,
            recurrence,
        })
            .then(() => history.push('/courses'))
            .catch((e) => {
                console.error(e);
                window.location.reload();
            });
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
                <TextField label="Nom" value={name} onChange={(e) => setName(e.target.value)}/>
                <TextField label="Description" value={description} onChange={(e) => setDescription(e.target.value)}/>
                <div>
                    <TextField label="Jour 0" type="date" value={j0} onChange={(e) => setJ0(e.target.value)}/>{/** TODO **/}
                    <TextField label="Jour de fin" type="date" value={jEnd} onChange={(e) => setJEnd(e.target.value)}/>{/** TODO **/}
                </div>
                <TextField label="Jours de récurrence" error={!recurrenceValid} placeholder="0,1,3,7,14,21" value={recurrence} onChange={(e) => setRecurrence(e.target.value)}/>{/** TODO **/}
            </CardContent>
        </Card>
        <WithBottomButton label={isNew ? "Créer le cours" : "Enregistrer"} onClick={submit}/>
    </>
}
