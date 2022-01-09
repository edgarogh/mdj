import MuiButton from "@mui/material/Button";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import {Link} from "react-router-dom";
import React from "react";
import {styled} from "@mui/material/styles";

const Root = styled('div')`
    display: flex;
    align-items: start;
`;

const Button = styled(MuiButton)`
    margin: 8px;
`;

export interface BackButtonProps {
    label?: string;
    to: string;
}

export default function BackButton(props: BackButtonProps) {
    return (
        <Root>
            <Button
                size="small"
                startIcon={<ChevronLeftIcon/>}
                to={props.to}
                component={Link}
            >
                {props.label || "Retour"}
            </Button>
        </Root>
    );
}
