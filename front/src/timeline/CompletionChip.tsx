import {styled} from "@mui/material/styles";
import React from "react";
import MuiChip from "@mui/material/Chip";
import RestoreIcon from "@mui/icons-material/Restore";
import CheckIcon from "@mui/icons-material/Check";
import Tooltip from "@mui/material/Tooltip";

const Chip = styled(MuiChip, { shouldForwardProp(p) { return p !== 'backgroundColor' && p !== 'color' } })`
    width: 22px;
    height: 22px;
    background: ${(props) => props.backgroundColor};
    border: none;
    
    & > svg:first-child { margin: 0; fill: ${({ color }) => color}; }
    & > span:last-child { display: none; }
`;

const COLORS = {
    green: '#00a152',
    yellow: '#ffea00',
    orange: '#b26500',
    red: '#ff1744',
};

export type Color = keyof typeof COLORS;

const ICON_PREVIOUS = 'previous';
const ICON_CURRENT = 'current';

interface SingleCompletionChipProps {
    icon: typeof ICON_PREVIOUS | typeof ICON_CURRENT;
    color: Color;
}

function SingleCompletionChip(props: SingleCompletionChipProps) {
    const tooltip = (props.icon === 'previous') ? "Marquage du dernier cours" : "Marquage du cours actuel";

    return (
        <Tooltip title={tooltip}>
            <Chip
                variant="outlined"
                size="small"
                icon={props.icon === 'previous' ? <RestoreIcon/> : <CheckIcon/>}
                backgroundColor={COLORS[props.color]}
                color={props.color === 'yellow' ? 'black' : 'white'}
            />
        </Tooltip>
    );
}

const Container = styled('span')`
    margin-left: ${({theme}) => theme.spacing(1.5)};

    & *:not(:last-child) > svg {
        transition: opacity 0.2s;
    }

    & *:nth-child(2) {
        margin-left: 4px;
        box-shadow: 0 0 0 2px white;

        transition: margin-left 0.2s;
    }

    .Mui-focusVisible & *:nth-child(2) {
        box-shadow: 0 0 0 2px #e0e0e0;
    }

    @media (hover: hover) and (pointer: fine) {
        & *:nth-child(2) {
            margin-left: -14px;
        }

        & *:not(:last-child) > svg {
            opacity: 0;
        }

        &:hover *:nth-child(2) {
            margin-left: inherit;
        }

        &:hover *:not(:last-child) > svg {
            opacity: inherit;
        }
    }
`;

export interface CompletionChipProps {
    colorPrev: Color | null;
    colorCurrent: Color | null;
}

export default function CompletionChip(props: CompletionChipProps) {
    return (
        <Container>
            {props.colorPrev && <SingleCompletionChip icon="previous" color={props.colorPrev} />}
            {props.colorCurrent && <SingleCompletionChip icon="current" color={props.colorCurrent} />}
        </Container>
    );
}
