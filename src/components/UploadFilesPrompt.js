/* global atob, File, alert, Blob */
import React from 'react';
import PropTypes from 'prop-types';
import Dialog from '@material-ui/core/Dialog';
import Button from '@material-ui/core/Button';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import CircularProgress from '@material-ui/core/CircularProgress';
import { uploadFile } from '@/components/FileInput';

export default function UploadFilesPrompt({ data, save }) {
    const [uploading, setUploading] = React.useState(false);

    const getUploadableFiles = () => {
        const { image1, image2, image3 } = data;
        const uploadable = [];
        if (image1 || image2 || image3) {
            const addUploadable = (name, img) => img && !img.fileId && uploadable.push({ name, img });
            addUploadable('image1', image1);
            addUploadable('image2', image2);
            addUploadable('image3', image3);
        }
        return uploadable;
    };
    return (
        <>
            <Dialog
                fullWidth
                maxWidth="sm"
                open={getUploadableFiles().length > 0}
                onClose={() => {}}
            >
                <DialogTitle>These images must be saved in the database</DialogTitle>

                <DialogContent>
                    {getUploadableFiles().map((f, i) => {
                    return (
                        <div key={i}>
                        <div
                            style={{
                            width: '90%',
                            maxWidth: 200,
                            margin: 'auto',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            }}
                        >
                            <img
                            style={{ width: '100%', height: 'auto' }}
                            role="presentation"
                            src={f.img.data}
                            />
                        </div>
                        <br />
                        </div>
                    );
                    })}
                </DialogContent>

                <DialogActions>
                    <Button
                        onClick={() => {
                            const files = getUploadableFiles();
                            setUploading(true);
                            Promise.all(files.map(({ img: f }) => {
                                const dataURI = f.data;
                                const byteString = atob(dataURI.split(',')[1]);
                                const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
                                const ab = new ArrayBuffer(byteString.length);
                                const ia = new Uint8Array(ab);
                                for (let i = 0; i < byteString.length; i++) {
                                    ia[i] = byteString.charCodeAt(i);
                                }
                                const blob = new Blob([ab], { type: mimeString, });
                                return uploadFile(new File([blob], f.filename));
                            }))
                            .catch(e => {
                                setUploading(false);
                                alert(e.msg || e.message || JSON.stringify(e));
                            })
                            .then(rslts => {                              
                                const data = {};
                                rslts.forEach((f, i) => { data[files[i].name] = f; });
                                setUploading(false);
                                save(data);
                            });
                        }}
                    >{uploading ? <CircularProgress size={15} /> : 'Save'}</Button>
                </DialogActions>
            </Dialog>
        </>
    );
}

UploadFilesPrompt.propTypes = {
    data: PropTypes.object.isRequired,
    save: PropTypes.func.isRequired,
};
