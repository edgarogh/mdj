import Typography from "@mui/material/Typography";
import Skeleton from "@mui/material/Skeleton";
import { observer } from "mobx-react-lite";
import React from "react";
import {Event} from "../store";
import CategoryName from "./CategoryName";
import EventView from "./EventView";
import {styled} from "@mui/material/styles";

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

const PaddedContainer = styled('div')`
    padding: 12px 8px 8px 8px;
`;

interface CategoryProps {
    name: CategoryName;
    events: Event[] | undefined;
    expanded?: string;
    setExpanded?: (id: string | undefined) => void;
}

export default observer(function Category({ name, events, expanded, setExpanded }: CategoryProps) {
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
        <PaddedContainer>
            <Typography variant="h5" component="h2">
                {events ? CATEGORY_NAMES[name] : <Skeleton width={CATEGORY_SKELETON[name][1] + '%'} />}
            </Typography>
        </PaddedContainer>
        {eventComponents}
    </>;
});
