import { PropsWithChildren, useState } from "react";
import { PATH_PREFIX } from "../hooks";
import { Box, CircularProgress } from "@mui/material";


type DocumentThumbnailProps = PropsWithChildren & {
    docId: number;
};

const DocumentThumbnail = (props: DocumentThumbnailProps) => {

    const { docId } = props;
    const [loaded, setLoaded] = useState(false);

    const onImageLoaded = () => {
        setLoaded(true);
    };

    return (
        <div style={{ position: 'relative', width: '50px' }}>
            { !loaded &&
            <Box sx={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                <CircularProgress/>
            </Box>
            }
            <img src={`${PATH_PREFIX}/api/document/${docId}/svg`} width="50px" style={{ backgroundColor: 'white', display: 'block', opacity: loaded ? 1 : 0 }} onLoad={onImageLoaded} loading="lazy"/>
        </div>
    );
};

export default DocumentThumbnail;
