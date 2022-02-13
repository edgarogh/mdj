import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import {ButtonBaseActions} from "@mui/material";
import MuiChip from "@mui/material/Chip";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Skeleton from "@mui/material/Skeleton";
import {observer} from "mobx-react-lite";
import React, {useCallback, useMemo, useState} from "react";
import {Event} from "../store";
import {decodeMarkingColor} from "../utils";
import CategoryName from "./CategoryName";
import {styled} from "@mui/material/styles";
import CompletionChip from "./CompletionChip";

let id = 0;

const SCROLL_ARGS: ScrollIntoViewOptions = { behavior: 'auto', block: 'center', inline: 'center' };
const DATE_FORMAT_CLOSER: Intl.DateTimeFormatOptions = { weekday: 'short', day: 'numeric' };
const DATE_FORMAT_FURTHER: Intl.DateTimeFormatOptions = { day:'numeric', month:'numeric', year:'2-digit' };

const AccordionNoPointer = styled(Accordion, { shouldForwardProp(p) { return p !== 'noPointer' } })`
    pointer-events: ${({noPointer}) => noPointer ? 'none' : 'inherit'};
`;

const TypographyHeading = styled(Typography)`
    font-size: ${({theme}) => theme.typography.pxToRem(15)};
`;

const TypographySecondaryHeading = styled(Typography)`
    font-size: ${({theme}) => theme.typography.pxToRem(15)};
    color: ${({theme}) => theme.palette.text.secondary};
`;

const Chip = styled(MuiChip)`
    margin-left: ${({theme}) => theme.spacing(1.5)};
    pointer-events: none;
`;

const AccordionSummaryInner = styled('div')`
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    width: 100%;
`;

export interface EventViewProps {
    category: CategoryName;
    event: Event | undefined;
    expanded?: string;
    setExpanded?: (id: string | undefined) => void;
}

export default observer(function EventView({ category, event, expanded, setExpanded }: EventViewProps) {
    const name = event?.course?.name;
    const marking = event?.marking;
    const previousMarking = event?.previousMarking;

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

    const chipColor = decodeMarkingColor(marking);
    const chipColorPrevious = decodeMarkingColor(previousMarking);

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
        <AccordionNoPointer
            id={id || undefined}
            expanded={!!event && (expanded == id)}
            noPointer={!event}
            onChange={onExpandChanged}
            ref={ref}
        >
            <AccordionSummary expandIcon={event && <ExpandMoreIcon />} action={rippleRef}>
                {event && name ? <AccordionSummaryInner>
                    <TypographyHeading component="h4">
                        {name}
                        <CompletionChip colorPrev={chipColorPrevious} colorCurrent={chipColor} />
                        <Chip variant="outlined" size="small" label={`J+${event.j}`}/>
                    </TypographyHeading>
                    <TypographySecondaryHeading>
                        {formattedDate}
                    </TypographySecondaryHeading>
                </AccordionSummaryInner> : (
                    <Skeleton width="33%"/>
                )}
            </AccordionSummary>
            {event && (
                <AccordionDetails>
                    <EventViewEditMark event={event}/>
                </AccordionDetails>
            )}
        </AccordionNoPointer>
    );
});

const MarkSelectFormControl = styled(FormControl)`
    width: 100%;
`;

const EventViewEditMark = observer(function EventViewEditMark({ event }: { event: Event }) {
    const [mark, setMark] = useState(event.marking || '');

    const onMarkChange = useCallback((e) => {
        setMark(e.target.value);
        event.mark(e.target.value);
    }, [event?.course, event?.j, setMark]);

    return (
        <MarkSelectFormControl variant="outlined">
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
        </MarkSelectFormControl>
    );
});
