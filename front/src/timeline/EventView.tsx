import Accordion from "@material-ui/core/Accordion";
import AccordionDetails from "@material-ui/core/AccordionDetails";
import AccordionSummary from "@material-ui/core/AccordionSummary";
import ButtonBaseActions from "@material-ui/core/ButtonBaseActions";
import Chip from "@material-ui/core/Chip";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import Select from "@material-ui/core/Select";
import {makeStyles} from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import Skeleton from "@material-ui/lab/Skeleton";
import {observer} from "mobx-react-lite";
import React, {useCallback, useMemo, useState} from "react";
import {Event} from "../store";
import {markingDecoration} from "../utils";
import CategoryName from "./CategoryName";

let id = 0;

const SCROLL_ARGS: ScrollIntoViewOptions = { behavior: 'auto', block: 'center', inline: 'center' };
const DATE_FORMAT_CLOSER: Intl.DateTimeFormatOptions = { weekday: 'short', day: 'numeric' };
const DATE_FORMAT_FURTHER: Intl.DateTimeFormatOptions = { day:'numeric', month:'numeric', year:'2-digit' };

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
        pointerEvents: 'none',
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
    category: CategoryName;
    event: Event | undefined;
    expanded?: string;
    setExpanded?: (id: string | undefined) => void;
}

export default observer(function EventView({ category, event, expanded, setExpanded }: EventViewProps) {
    const classes = useStyles();

    const name = event?.course?.name;
    const marking = event?.marking;

    const id = useMemo(() => event?.course && (
        `tl-event-${event.course.id}-${event.date.value}`
    ), [event?.course?.id, event?.date]);

    const idInHash = useMemo(() => (
        window.location.hash.substr(1) === id
    ), [id])

    const onExpandChanged = useCallback((_, expanded: boolean) => {
        setExpanded?.(expanded ? id || undefined : undefined);
    }, [id, setExpanded]);

    const ref = (ref: HTMLDivElement | null) => idInHash && ref?.scrollIntoView(SCROLL_ARGS);
    const rippleRef = (ref: ButtonBaseActions | null) => idInHash && ref?.focusVisible();

    const [markingStyle, markingSuffix] = markingDecoration(marking);

    const formattedDate = useMemo(() => {
        let format: Intl.DateTimeFormatOptions;
        switch (category) {
            case 'today': return false;
            case 'week': {
                format = DATE_FORMAT_CLOSER;
                break;
            }
            case 'rest': {
                format = DATE_FORMAT_FURTHER;
                break;
            }
        }

        return event ? event.date.toUtc().toLocaleDateString(undefined, format) : undefined;
    }, [category, event?.date.value]);

    return (
        <Accordion
            id={id || undefined}
            className={!event ? classes.skeleton : ''}
            expanded={!!event && (expanded == id)}
            onChange={onExpandChanged}
            ref={ref}
        >
            <AccordionSummary className={classes.summary} expandIcon={event && <ExpandMoreIcon />} action={rippleRef}>
                {event && name ? <div className={classes.summary}>
                    <Typography
                        component="h4"
                        style={markingStyle}
                        className={classes.heading}
                    >
                        {name}
                        {markingSuffix}
                        <Chip className={classes.chip} variant="outlined" size="small" label={`J+${event.j}`}/>
                    </Typography>
                    <Typography className={classes.secondaryHeading}>
                        {formattedDate}
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
