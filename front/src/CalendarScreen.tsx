import React, {useMemo, useState} from "react";
import ReactCalendar from "react-calendar";
import EventView from "./timeline/EventView";
import Day from "./Day";
import {useRootStore} from "./StoreProvider";
import {observer} from "mobx-react-lite";
import BackButton from "./BackButton";
import * as routes from "./routes";
import {styled} from "@mui/material/styles";

const Calendar = styled(ReactCalendar)`
    padding-bottom: 16px;
`;

const Bullet = styled('b')`
    color: blue;
`;

export default observer(function CalendarScreen() {
    const store = useRootStore();
    const timeline = store.eventStore.timeline;

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
    const [expanded, setExpanded] = useState<string | undefined>(undefined);

    return <>
        <BackButton to={routes.TIMELINE}/>
        C'est moche, ça sera MaJ plus tard
        <Calendar
            tileDisabled={() => !timeline}
            showFixedNumberOfWeeks
            activeStartDate={day}
            minDate={start}
            maxDate={end}
            tileContent={(props) => {
                const isEvent = (timeline || []).some((e) => Day.fromUtc(props.date).equals(e.date));
                return isEvent ? <Bullet><br/>•</Bullet> : null;
            }}
            onClickDay={setDay}
            onClickMonth={setDay}
        />
        {(timeline || []).filter((e) => {
            return e.date.equals(Day.fromUtc(day));
        }).map((e) => (
            <EventView key={e.key} event={e} category='today' expanded={expanded} setExpanded={setExpanded}/>
        ))}
    </>;
});
