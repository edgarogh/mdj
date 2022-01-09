import {Occurrence} from "../store";
import {useHistory} from "react-router-dom";
import {useNonNullMemo} from "../utils";
import React, {useCallback} from "react";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Divider from "@mui/material/Divider";
import {observer} from "mobx-react-lite";

export interface OccurrenceMenuProps {
    payload: [HTMLElement, Occurrence] | undefined,
    onClose: () => void,
}

export default observer(function OccurrenceMenu(props: OccurrenceMenuProps) {
    const history = useHistory();
    const occ = useNonNullMemo(props.payload?.[1]);
    const course = useNonNullMemo(occ?.event?.course);
    const old = useNonNullMemo(occ?.event?.isPast);

    const marking = occ?.event?.marking;

    const onViewInTimelinePressed = useCallback(() => {
        if (!course || !props.payload) throw "course or payload are null";
        const id = `tl-event-${course.id}-${occ?.event?.date?.value}`;
        history.push('/#' + id);
        props.onClose();
    }, [props.onClose, course?.id, props.payload]);

    const onMarkingPressed = useCallback((value) => {
        occ?.event?.mark(value);
        props.onClose();
    }, [props.onClose, props.payload]);

    return <>
        <Menu
            id="simple-menu"
            anchorEl={props.payload?.[0]}
            open={!!props.payload}
            onClose={props.onClose}
        >
            {!old && <MenuItem onClick={onViewInTimelinePressed}>Voir dans le fil</MenuItem>}
            {!old && <Divider/>}
            <OccurrenceMenuItemMarking onMarkingPressed={onMarkingPressed} value="" selection={!marking || marking === ''} label={"À venir"}/>
            <OccurrenceMenuItemMarking onMarkingPressed={onMarkingPressed} value="started" selection={marking} label={"Commencé"}/>
            <OccurrenceMenuItemMarking onMarkingPressed={onMarkingPressed} value="further_learning_required" selection={marking} label={"À approfondir"}/>
            <OccurrenceMenuItemMarking onMarkingPressed={onMarkingPressed} value="done" selection={marking} label={"Terminé"}/>
        </Menu>
    </>;
});

interface OccurrenceMenuItemMarkingProps {
    value: string,
    selection: string | undefined | null | boolean,
    label: string,
    onMarkingPressed: (mark: string) => void,
}

const OccurrenceMenuItemMarking = React.forwardRef<
    HTMLLIElement,
    OccurrenceMenuItemMarkingProps
>(function OccurrenceMenuItemMarking(props, ref) {
    const selected = (typeof props.selection === 'boolean') ? props.selection : props.selection === props.value;

    const onClick = useCallback(() => {
        props.onMarkingPressed(props.value);
    }, [props.onMarkingPressed, props.value]);

    return (
        <MenuItem ref={ref} onClick={onClick} selected={selected}>
            {props.label}
        </MenuItem>
    );
});
