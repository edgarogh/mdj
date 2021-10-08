import {ButtonBaseActions, makeStyles} from "@material-ui/core";
import Accordion from "@material-ui/core/Accordion";
import Select from "@material-ui/core/Select";
import Chip from "@material-ui/core/Chip";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import AccordionSummary from "@material-ui/core/AccordionSummary";
import AccordionDetails from "@material-ui/core/AccordionDetails";
import Typography from "@material-ui/core/Typography";
import Skeleton from "@material-ui/lab/Skeleton";
import React, {useCallback, useMemo, useState} from "react";
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import {observer} from "mobx-react-lite";
import {Event} from "./store";

let id = 0;

const SCROLL_ARGS: ScrollIntoViewOptions = { behavior: 'auto', block: 'center', inline: 'center' };

const useStyles = makeStyles((theme) => ({
    skeleton: {
        pointerEvents: 'none',
    },
    heading: {
        fontSize: theme.typography.pxToRem(15),
        flexShrink: 0,
    },
    chip: {
        marginLeft: '12px',
    },
    summary: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    secondaryHeading: {
        fontSize: theme.typography.pxToRem(15),
        color: theme.palette.text.secondary,
    },
    markSelect: {
        width: '100%',
    },
}));

export interface EventViewProps {
    hideDate?: boolean;
    event: Event | undefined;
}

export default observer(function EventView({ hideDate, event }: EventViewProps) {
    const classes = useStyles();
    const [expanded, setExpanded] = useState(false);

    const name = event?.course?.name;
    const marking = event?.marking;

    const started = marking === 'started';
    const furtherLearningRequired = marking === 'further_learning_required';
    const done = marking === 'done';

    const id = useMemo(() => event?.course && (
        `tl-event-${event.course.id}-${event.date.value}`
    ), [event?.course?.id, event?.date]);

    const idInHash = useMemo(() => (
        window.location.hash.substr(1) === id
    ), [id])

    const ref = (ref: HTMLDivElement | null) => idInHash && ref?.scrollIntoView(SCROLL_ARGS);
    const rippleRef = (ref: ButtonBaseActions | null) => idInHash && ref?.focusVisible();

    return (
        <Accordion
            id={id || undefined}
            className={!event ? classes.skeleton : ''}
            expanded={!!event && expanded}
            onChange={(_, e) => setExpanded(e)}
            ref={ref}
        >
            <AccordionSummary className={classes.summary} expandIcon={event && <ExpandMoreIcon />} action={rippleRef}>
                {event && name ? <div className={classes.summary}>
                    <Typography
                        component="h4"
                        style={{ textDecoration: done ? 'line-through' : 'inherit' }}
                        className={classes.heading}
                    >
                        {name}
                        {started && '*'}
                        {furtherLearningRequired && '?'}
                        <Chip className={classes.chip} variant="outlined" size="small" label={`J+${event.j}`}/>
                    </Typography>
                    <Typography className={classes.secondaryHeading}>
                        {!hideDate && event.date.toUtc().toDateString()}
                    </Typography>
                </div> : (
                    <Skeleton width="33%"/>
                )}
            </AccordionSummary>
            {event && (
                <AccordionDetails>
                    <EventViewEditMark event={event}/>
                </AccordionDetails>
            )}
        </Accordion>
    );
});

const EventViewEditMark = observer(function EventViewEditMark({ event }: { event: Event }) {
    const classes = useStyles();

    const [mark, setMark] = useState(event.marking || '');

    const onMarkChange = useCallback((e) => {
        setMark(e.target.value);
        event.mark(e.target.value);
    }, [event?.course, event?.j, setMark]);

    return (
        <FormControl className={classes.markSelect} variant="outlined">
            <InputLabel id={`mark-label-${event.course?.id || id++}-${event.j}`}>Marquage</InputLabel>
            <Select
                id={`mark-${event.course?.id || id++}-${event.j}`}
                labelId={`mark-label-${event.course?.id || id++}-${event.j}`}
                value={mark}
                onChange={onMarkChange}
            >
                <MenuItem value=""><em>Aucun</em></MenuItem>
                <MenuItem value="started">Démarré</MenuItem>
                <MenuItem value="further_learning_required">Approfondir</MenuItem>
                <MenuItem value="done">Terminé</MenuItem>
            </Select>
        </FormControl>
    );
});
