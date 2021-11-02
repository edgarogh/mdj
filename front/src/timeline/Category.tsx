import {makeStyles} from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import Skeleton from "@material-ui/lab/Skeleton";
import { observer } from "mobx-react-lite";
import React from "react";
import {Event} from "../store";
import CategoryName from "./CategoryName";
import EventView from "./EventView";

const CATEGORY_NAMES: Record<CategoryName, string> = {
    'today': "Aujourd'hui",
    'week': "7 prochains jours",
    'rest': "Plus tard",
};

const CATEGORY_SKELETON: Record<CategoryName, [number, number]> = {
    today: [2, 50],
    week: [6, 70],
    rest: [0, 0],
};

const useStyles = makeStyles({
    padded: {
        padding: '12px 8px 8px 8px',
    },
});

interface CategoryProps {
    name: CategoryName;
    events: Event[] | undefined;
    expanded?: string;
    setExpanded?: (id: string | undefined) => void;
}

export default observer(function Category({ name, events, expanded, setExpanded }: CategoryProps) {
    const classes = useStyles();

    let eventComponents;
    if (!events) {
        eventComponents = Array(CATEGORY_SKELETON[name][0])
            .fill(undefined)
            .map((_, idx) => <EventView category={name} key={idx} event={undefined}/>);
    } else {
        eventComponents = events.map((e) => (
            <EventView key={e.key} event={e} category={name} expanded={expanded} setExpanded={setExpanded}/>
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
