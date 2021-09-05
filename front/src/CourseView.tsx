import "./transitions/chip-fade.scss";
import {CardActions, makeStyles} from "@material-ui/core";
import Chip from "@material-ui/core/Chip";
import CardHeader from "@material-ui/core/CardHeader";
import Card from "@material-ui/core/Card";
import Skeleton from "@material-ui/lab/Skeleton";
import React, {useCallback, useEffect, useMemo, useState} from "react";
import {Link, useHistory} from "react-router-dom";
import {Course, useApi} from "./Api";
import Button from "@material-ui/core/Button";
import Divider from "@material-ui/core/Divider";
import {roundDate, tzOffset} from "./utils";
import {TransitionGroup, CSSTransition} from "react-transition-group";

export interface CourseViewProps {
    course: Course | undefined,
}

const useStyles = makeStyles((theme) => ({
    card: {
        margin: '8px',
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
    date: string,
    marking: string,
}

function OccurrenceChip(props: OccurrenceChipProps) {
    const history = useHistory();

    let onClick = useCallback(() => {
        const id = `tl-event-${props.course.id}-${props.date}`;
        history.push('/#' + id);
    }, [props.course.id, props.date]);

    return (
        <Chip
            disabled={tzOffset(Date.parse(props.date)) < roundDate()}
            onClick={onClick}
            label={(new Date(Date.parse(props.date))).toLocaleDateString()}
        />
    )
}

interface OccurrenceChipSectionProps {
    course: Course,
}

const CHIP_ELLIPSIS = 8;

function OccurrenceChipSection({ course }: OccurrenceChipSectionProps) {
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

    return <>
        <TransitionGroup component={null}>
            {occurrences.map(([date, marking]) => (
                <CSSTransition
                    key={date}
                    timeout={200}
                    classNames="chip-fade"
                >
                    <OccurrenceChip course={course} date={date} marking={marking}/>
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
    </>;
}

export default function CourseView({ course }: CourseViewProps) {
    const classes = useStyles();
    const { deleteCourse } = useApi();

    const isLoaded = !!course?.id;

    const onDeleteButtonClick = useCallback(() => {
        if (course?.id && confirm(`Voulez vous vraiment supprimer "${course.name}" ?`)) {
            deleteCourse(course.id);
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
                <Button disabled={!isLoaded} size="small" to={isLoaded ? `/courses/${course.id}` : undefined} component={isLoaded ? Link : undefined}>Modifier</Button>
                <Button disabled={!isLoaded} size="small" onClick={onDeleteButtonClick}>Supprimer</Button>
            </CardActions>
        </Card>
    );
}
