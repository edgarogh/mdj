import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import ExitToApp from "@mui/icons-material/ExitToApp";
import FileCopyIcon from "@mui/icons-material/FileCopy";
import Skeleton from "@mui/material/Skeleton";
import copy from "copy-to-clipboard";
import {observer} from "mobx-react-lite";
import React, {useCallback, useMemo} from "react";
import {Link} from "react-router-dom";
import ArchiveDialogs from "./ArchiveDialogs";
import * as routes from "./routes";
import {useRootStore} from "./StoreProvider";
import {styled} from "@mui/material/styles";

const Root = styled('div')`
    padding-top: ${({theme}) => theme.spacing(1)};
`;

const SettingsSection = styled(Paper)`
    border-radius: 0;
    padding: ${({theme}) => theme.spacing(1)};
    
    &:not(:last-child) {
        margin-bottom: 12px;
    }
`;

const LinkButton = styled(Button)`
    margin-right: ${({theme}) => theme.spacing(1)};
    flex: 1;
    font-family: monospace;
    text-transform: none;
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
    text-align: left;
    justify-content: start;
`;

const CopyLinkContainer = styled('div')`
    display: flex;
    flex-direction: row;
`;

const ArchiveButtonContainer = styled('div')`
    display: flex;
    flex-direction: row;
    justify-content: space-evenly;
    margin-top: ${({theme}) => theme.spacing(1.5)};
    
    & > * {
        width: 80%;
    }
`;

const DisconnectButtonContainer = styled('div')`
    display: flex;
    flex-direction: row;
    justify-content: end;
    margin: 0 ${({theme}) => theme.spacing(1)};
`;

export default observer(function Settings() {
    const store = useRootStore();
    const accountId = store.accountInfo.id;

    const icalUrl = useMemo(() => (
        accountId ? (`${location.protocol}//${location.host}` + "/ical/" + accountId) : undefined
    ), [accountId]);

    const doCopy = useCallback(() => {
        copy(icalUrl!!);
        store.toasts.showToast("URL copié !", undefined, 'copied');
    }, [icalUrl]);

    return (
        <Root>
            <SettingsSection>
                <Typography variant="h6" component="h2">Importer dans un calendrier</Typography>
                <CopyLinkContainer>
                    <LinkButton disabled={!icalUrl} variant="outlined" onClick={doCopy}>
                        {icalUrl ? (
                            icalUrl
                        ): (
                            <Skeleton width="100%"/>
                        )}
                    </LinkButton>
                    <IconButton disabled={!icalUrl} onClick={doCopy}>
                        <FileCopyIcon/>
                    </IconButton>
                </CopyLinkContainer>
            </SettingsSection>
            <SettingsSection>
                <Typography variant="h6" component="h2">Archive</Typography>
                <Typography variant="body1" color="textSecondary">Votre archive rassemble les cours manuellement marqués comme archivés. Elle permet de mettre de côté des cours arrivés à leur échéance sans pour autant les supprimer définitivement.</Typography>
                <ArchiveButtonContainer>
                    <Button variant="outlined" to={routes.ARCHIVE_COURSES} component={Link}>Ouvrir</Button>
                </ArchiveButtonContainer>
                <ArchiveDialogs/>
            </SettingsSection>
            <DisconnectButtonContainer>
                <Button disabled={!accountId} startIcon={<ExitToApp/>} href={routes.LOGOUT}>Se déconnecter</Button>
            </DisconnectButtonContainer>
        </Root>
    );
});
