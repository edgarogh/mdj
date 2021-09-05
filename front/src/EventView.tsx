import {makeStyles} from "@material-ui/core";
import Accordion from "@material-ui/core/Accordion";
import Select from "@material-ui/core/Select";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import AccordionSummary from "@material-ui/core/AccordionSummary";
import AccordionDetails from "@material-ui/core/AccordionDetails";
import Typography from "@material-ui/core/Typography";
import Skeleton from "@material-ui/lab/Skeleton";
import {useCallback, useMemo, useState} from "react";
import {Event, useApi} from "./Api";
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import React from "react";

const useStyles = makeStyles((theme) => ({
    skeleton: {
        pointerEvents: 'none',
    },
    heading: {
        fontSize: theme.typography.pxToRem(15),
            flexBasis: '33.33%',
            flexShrink: 0,
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

export default function EventView({ hideDate, event }: EventViewProps) {
    const classes = useStyles();
    const [expanded, setExpanded] = useState(false);

    const started = event?.marking === 'started';
    const furtherLearningRequired = event?.marking === 'further_learning_required';
    const done = event?.marking === 'done';

    const id = useMemo(() => event?.course && (
        `tl-event-${event.course.id}-${event.date}`
    ), [event?.course?.id, event?.date]);

    return (
        <Accordion
            id={id}
            className={!event ? classes.skeleton : ''}
            expanded={!!event && expanded}
            onChange={(_, e) => setExpanded(e)}
        >
            <AccordionSummary className={classes.summary} expandIcon={event && <ExpandMoreIcon />}>
                {event ? <div className={classes.summary}>
                    <Typography style={{ textDecoration: done ? 'line-through' : 'inherit' }} className={classes.heading}>
                        {event.course.name}
                        {started && '*'}
                        {furtherLearningRequired && '?'}
                    </Typography>
                    <Typography className={classes.secondaryHeading}>
                        {!hideDate && formatDate(event.date)}
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
}

function EventViewEditMark({ event }: { event: Event }) {
    const classes = useStyles();
    const { markEvent } = useApi();

    const [mark, setMark] = useState(event.marking || '');

    const onMarkChange = useCallback((e) => {
        setMark(e.target.value);
        markEvent(event.course.id, event.j, e.target.value);
    }, [event?.course, event?.j, setMark]);

    return (
        <FormControl className={classes.markSelect} variant="outlined">
            <InputLabel id={`mark-label-${event.course.id}-${event.j}`}>Marquage</InputLabel>
            <Select
                id={`mark-${event.course.id}-${event.j}`}
                labelId={`mark-label-${event.course.id}-${event.j}`}
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
}

function formatDate(date: string) {
    return (new Date(Date.parse(date))).toDateString();
}
