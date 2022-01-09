import Button, {ButtonProps} from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import React from "react";
import {styled} from "@mui/material/styles";

export interface EmptyStateProps {
    illustration: string | URL;
    title: string;
    subtitle: string;
    ctaLabel?: string;
    ctaOnClick?: () => void;
    ctaProps?: Partial<ButtonProps>;
}

const Root = styled('div')`
    width: 80%;
    flex: 1;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
`;

const CtaButton = styled(Button)`
    margin: ${({theme}) => theme.spacing(2)},
`;

export default function EmptyState(props: EmptyStateProps) {
    return (
        <Root>
            <img aria-hidden alt="" src={props.illustration as string}/>
            <Typography variant="h5" component="h3">{props.title}</Typography>
            <Typography variant="subtitle1" component="p">{props.subtitle}</Typography>
            {props.ctaLabel && (
                <CtaButton
                    variant="contained"
                    color="primary"
                    onClick={props.ctaOnClick}
                    {...props.ctaProps}
                >
                    {props.ctaLabel}
                </CtaButton>
            )}
        </Root>
    );
}
