import {makeStyles} from "@material-ui/core";
import Typography from "@material-ui/core/Typography";
import Title from "./Title";
import Skeleton from "@material-ui/lab/Skeleton";
import React, {useState} from "react";
import EventView from "./EventView";
import Button from "@material-ui/core/Button";
import CalendarIcon from "@material-ui/icons/DateRange"
import {Link} from "react-router-dom";
import {Event} from "./store";
import {useRootStore} from "./StoreProvider";
import {observer} from "mobx-react-lite";

const useStyles = makeStyles({
    padded: {
        padding: '12px 8px 8px 8px',
    },
    calendarButtonContainer: {
        width: '100%',
        padding: '24px',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
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

interface CategoryProps {
    name: CategoryName;
    events: Event[] | undefined;
    expanded?: string;
    setExpanded?: (id: string | undefined) => void;
}

const Category = observer(function Category({ name, events, expanded, setExpanded }: CategoryProps) {
    const classes = useStyles();

    const isToday = name === 'today';

    let eventComponents;
    if (!events) {
        eventComponents = Array(CATEGORY_SKELETON[name][0])
            .fill(undefined)
            .map((_, idx) => <EventView key={idx} event={undefined}/>);
    } else {
        eventComponents = events.map((e) => (
            <EventView key={e.key} event={e} hideDate={isToday} expanded={expanded} setExpanded={setExpanded}/>
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
});

export default observer(function Timeline() {
    const classes = useStyles();
    const store = useRootStore();

    const email = store.accountInfo?.email;
    const timeline = store.eventStore.timeline;

    const [expanded, setExpanded] = useState<string | undefined>(undefined);

    const categories =
        store.eventStore.isLoading ? (
            <>
                <Category name='today' events={undefined}/>
                <Category name='week' events={undefined}/>
            </>
        ) : (
            <>
                <Category name="today" events={store.eventStore.timelineToday} expanded={expanded} setExpanded={setExpanded}/>
                <Category name="week" events={store.eventStore.timeline7Days} expanded={expanded} setExpanded={setExpanded}/>
                <Category name="rest" events={store.eventStore.timelineRest} expanded={expanded} setExpanded={setExpanded}/>
            </>
        );

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

        {(timeline.length > 0) && <div className={classes.calendarButtonContainer}>
            <Button
                variant="contained"
                endIcon={<CalendarIcon/>}
                component={Link}
                to="/calendar"
            >
                Voir le calendrier (EXPÉRIMENTAL)
            </Button>
        </div>}
    </>;
});
