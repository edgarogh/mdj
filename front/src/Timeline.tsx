import {makeStyles} from "@material-ui/core";
import Typography from "@material-ui/core/Typography";
import Title from "./Title";
import Skeleton from "@material-ui/lab/Skeleton";
import React, {useMemo} from "react";
import {useApi, Event} from "./Api";
import EventView from "./EventView";
import {tzOffset} from "./utils";

const useStyles = makeStyles({
    padded: {
        padding: '12px 8px 8px 8px',
    },
});

const CATEGORY_NAMES = {
    'today': "Aujourd'hui",
    'week': "7 prochains jours",
    'rest': "Plus tard",
} as const;

type CategoryName = keyof typeof CATEGORY_NAMES;

const CATEGORY_SKELETON: Record<CategoryName, [number, number]> = {
    today: [2, 50],
    week: [6, 70],
    rest: [0, 0],
};

function Category({ name, events }: { name: CategoryName, events: Event[] | undefined }) {
    const classes = useStyles();

    const isToday = name === 'today';

    let eventComponents;
    if (!events) {
        eventComponents = Array(CATEGORY_SKELETON[name][0])
            .fill(undefined)
            .map((_, idx) => <EventView key={idx} event={undefined}/>);
    } else {
        eventComponents = events.map((e) => (
            <EventView key={e.course.id + '/' + e.j} event={e} hideDate={isToday}/>
        ));
    }

    if (eventComponents.length === 0) return <></>;

    return <>
        <div className={classes.padded}>
            <Typography variant="h5" component="h2">
                {events ? CATEGORY_NAMES[name] : <Skeleton width={CATEGORY_SKELETON[name][1] + '%'} />}
            </Typography>
        </div>
        {eventComponents}
    </>;
}

export default function Timeline() {
    const classes = useStyles();
    const { accountInfo: { email }, timeline } = useApi();

    const categories = useMemo(() => {
        if (!timeline) {
            return <>
                <Category name='today' events={undefined}/>
                <Category name='week' events={undefined}/>
            </>;
        } else {
            const today = tzOffset(new Date()).toISOString().substr(0, 10);
            const oneWeek = tzOffset(new Date(Date.now() + 1000 * 3600 * 24 * 7)).toISOString().substr(0, 10);

            return <>
                <Category name="today" events={timeline.filter(e => e.date === today)}/>
                <Category name="week" events={timeline.filter(e => e.date > today && e.date <= oneWeek)}/>
                <Category name="rest" events={timeline.filter(e => e.date > oneWeek)}/>
            </>;
        }
    }, [timeline]);

    return <>
        <div className={classes.padded}>
            <Title/>
            <Typography variant="caption" color="textSecondary">
                {email ? (
                    "Connecté en tant que " + email
                ) : (
                    <Skeleton width="60%"/>
                )}
            </Typography>
        </div>

        {categories}
    </>;
}
