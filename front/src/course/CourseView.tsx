import "../transitions/chip-fade.scss";
import CardActions from "@mui/material/CardActions";
import Chip from "@mui/material/Chip";
import CardHeader from "@mui/material/CardHeader";
import MuiCard from "@mui/material/Card";
import Skeleton from "@mui/material/Skeleton";
import React, {useCallback, useEffect, useMemo, useState} from "react";
import {Link} from "react-router-dom";
import {Course, Occurrence} from "../store";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import {CSSTransition, TransitionGroup} from "react-transition-group";
import {observer} from "mobx-react-lite";
import {markingDecoration} from "../utils";
import OccurrenceMenu from "./OccurrenceMenu";
import {styled} from "@mui/material/styles";

export interface CourseViewProps {
    course: Course | undefined,
}

const Card = styled(MuiCard)`
    width: calc(100% - ${({theme}) => theme.spacing(2)}) !important;
    margin: ${({theme}) => theme.spacing(1)};
    margin-top: 0;
    overflow: initial !important;
    
    &:last-child {
        margin-bottom: 0;
    }
`;

const OccurrenceChipRoot = styled(Chip, { shouldForwardProp(p) { return p !== 'isPast' } })`
    background: ${({isPast}) => isPast ? 'rgb(248, 248, 248)' : 'inherit'};
`;

const CardOccurrences = styled('div')`
    display: flex;
    padding: ${({theme}) => theme.spacing(1)};
    flex-wrap: wrap;

    & > * {
        margin: ${({theme}) => theme.spacing(0.5)};
    }
`;

interface OccurrenceChipProps {
    course: Course,
    occurrence: Occurrence,
    onClick?: (p: [HTMLElement, Occurrence]) => void,
}

const OccurrenceChip = observer(function OccurrenceChip(props: OccurrenceChipProps) {
    const isPast = props.occurrence.event.isPast;

    let onClick = useCallback((e) => {
        props.onClick?.([e.target, props.occurrence]);
    }, [props.course.id]);

    const [markingStyle, markingSuffix] = markingDecoration(props.occurrence.event.marking);

    return (
        <OccurrenceChipRoot
            isPast={isPast}
            style={markingStyle}
            onClick={onClick}
            label={<>{props.occurrence.event.date.value}{markingSuffix}</>}
        />
    )
});

interface OccurrenceChipSectionProps {
    course: Course,
}

const CHIP_ELLIPSIS = 8;

const OccurrenceChipSection = observer(function OccurrenceChipSection({ course }: OccurrenceChipSectionProps) {
    const [expanded, setExpanded] = useState(false);

    const ellipsis = course.occurrences.length > CHIP_ELLIPSIS;

    useEffect(() => {
        setExpanded(false);
    }, [ellipsis]);

    const onSeeMoreLess = useCallback(() => {
        setExpanded(!expanded);
    }, [expanded]);

    const [occurrencesSlice, isMore] = useMemo(() => {
        if (ellipsis) {
            return [course.occurrences.slice(0, CHIP_ELLIPSIS), true];
        } else {
            return [course.occurrences, false];
        }
    }, [course.occurrences]);

    const moreLessLabel = expanded ? "Voir moins" : "Voir plus...";
    const occurrences = expanded ? course.occurrences : occurrencesSlice;

    const [menuAnchor, setMenuAnchor] = useState<undefined | [HTMLElement, Occurrence]>(undefined);
    const onCloseMenu = useCallback(() => setMenuAnchor(undefined), [setMenuAnchor]);

    return <>
        <TransitionGroup component={null}>
            {occurrences.map((occ) => (
                <CSSTransition
                    key={occ.event.key}
                    timeout={200}
                    classNames="chip-fade"
                >
                    <OccurrenceChip course={course} occurrence={occ} onClick={setMenuAnchor}/>
                </CSSTransition>
            ))}
        </TransitionGroup>
        {isMore && <Chip
            key={moreLessLabel}
            variant="outlined"
            clickable
            onClick={onSeeMoreLess}
            label={moreLessLabel}
        />}
        <OccurrenceMenu payload={menuAnchor} onClose={onCloseMenu}/>
    </>;
});

export default observer(function CourseView({ course }: CourseViewProps) {
    const isLoaded = !!course;

    const onArchiveButtonClick = useCallback(() => {
        course?.archive();
    }, [course?.id]);

    const onDeleteButtonClick = useCallback(() => {
        if (course?.id && confirm(`Voulez vous vraiment supprimer "${course.name}" ?`)) {
            course?.delete();
        }
    }, [course?.id]);

    return (
        <Card>
            <CardHeader
                title={!!course ? course.name : <Skeleton/>}
                subheader={course?.description}
            />
            <Divider/>
            {!!course ? (
                <CardOccurrences>
                    <OccurrenceChipSection course={course!}/>
                </CardOccurrences>
            ) : (
                <Skeleton variant="rectangular" height={56}/>
            )}
            <Divider/>
            <CardActions>
                <Button disabled={!isLoaded} size="small" to={isLoaded ? `/courses/${course!!.id}` : undefined} component={isLoaded ? Link : undefined}>Modifier</Button>
                <Button disabled={!isLoaded} size="small" onClick={onArchiveButtonClick}>Archiver</Button>
                <Button disabled={!isLoaded} size="small" onClick={onDeleteButtonClick}>Supprimer</Button>
            </CardActions>
        </Card>
    );
});
