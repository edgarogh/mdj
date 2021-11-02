import "../transitions/chip-fade.scss";
import {makeStyles} from "@material-ui/core/styles";
import CardActions from "@material-ui/core/CardActions";
import Chip from "@material-ui/core/Chip";
import CardHeader from "@material-ui/core/CardHeader";
import Card from "@material-ui/core/Card";
import Skeleton from "@material-ui/lab/Skeleton";
import React, {useCallback, useEffect, useMemo, useState} from "react";
import {Link} from "react-router-dom";
import {Course, Occurrence} from "../store";
import Button from "@material-ui/core/Button";
import Divider from "@material-ui/core/Divider";
import {CSSTransition, TransitionGroup} from "react-transition-group";
import {observer} from "mobx-react-lite";
import {markingDecoration} from "../utils";
import OccurrenceMenu from "./OccurrenceMenu";

export interface CourseViewProps {
    course: Course | undefined,
}

const useStyles = makeStyles((theme) => ({
    occurrenceChipBefore: {
        background: 'rgb(248, 248, 248)',
    },
    card: {
        width: 'calc(100% - 16px) !important',
        margin: '8px',
        marginTop: 0,
    },
    recurrenceSummary: {
        display: 'flex',
        padding: '8px',
        flexWrap: 'wrap',
        '& > *': {
            margin: theme.spacing(0.5),
        },
    },
}));

interface OccurrenceChipProps {
    course: Course,
    occurrence: Occurrence,
    onClick?: (p: [HTMLElement, Occurrence]) => void,
}

const OccurrenceChip = observer(function OccurrenceChip(props: OccurrenceChipProps) {
    const classes = useStyles();
    const isPast = props.occurrence.event.isPast;

    let onClick = useCallback((e) => {
        props.onClick?.([e.target, props.occurrence]);
    }, [props.course.id]);

    const [markingStyle, markingSuffix] = markingDecoration(props.occurrence.event.marking);

    return (
        <Chip
            className={isPast ? classes.occurrenceChipBefore : undefined}
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
    const classes = useStyles();

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
        <Card className={classes.card}>
            <CardHeader
                title={!!course ? course.name : <Skeleton/>}
                subheader={course?.description}
            />
            <Divider/>
            {!!course ? (
                <div className={classes.recurrenceSummary}>
                    <OccurrenceChipSection course={course}/>
                </div>
            ) : (
                <Skeleton variant="rect" height={56}/>
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
