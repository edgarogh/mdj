import React, {useMemo, useState} from "react";
import Calendar from "react-calendar";
import {makeStyles} from "@material-ui/core";
import {useApi} from "./Api";
import EventView from "./EventView";
import Day from "./Day";

const useStyles = makeStyles({
    calendar: {
        paddingBottom: '16px',
    },
    bullet: {
        color: 'blue',
    },
});

export default function CalendarScreen() {
    const classes = useStyles();
    const { timeline } = useApi();

    const [start, end] = useMemo(() => {
        if (!timeline) return [undefined, undefined];

        let min, max;
        min = max = timeline[0].date;

        for (const event of timeline) {
            const date = event.date;
            if (date.isBefore(min)) min = date;
            if (date.isAfter(max)) max = date;
        }

        return [min.toUtc(), max.toUtc()];
    }, [timeline]);

    const [day, setDay] = useState(new Date());

    return <>
        C'est moche, ça sera MaJ plus tard
        <Calendar
            className={classes.calendar}
            tileDisabled={() => !timeline}
            showFixedNumberOfWeeks
            activeStartDate={day}
            minDate={start}
            maxDate={end}
            tileContent={(props) => {
                const isEvent = (timeline || []).some((e) => Day.fromUtc(props.date).equals(e.date));
                return isEvent ? <b className={classes.bullet}><br/>•</b> : null;
            }}
            onClickDay={setDay}
            onClickMonth={setDay}
        />
        {(timeline || []).filter((e) => {
            return e.date.equals(Day.fromUtc(day));
        }).map((e) => (
            <EventView key={e.course.id} event={e} />
        ))}
    </>;
}
