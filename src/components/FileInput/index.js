import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import makeStyles from '@material-ui/core/styles/makeStyles';
import CircularProgress from '@material-ui/core/CircularProgress';
import uploadFile from './uploadFile';

export { uploadFile };

const useStyles = makeStyles(() => ({
    root: {
        position: 'relative',
    },
    input: {
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
        opacity: 0,
    },
}));

const FileInput = React.forwardRef(({
    onUploadSuccess,
    onUploadComplete,
    children,
    className,
    ...props
}, ref) => {
    const [uploading, setUploading] = React.useState(false);
    const inputRef = React.useRef(null);

    React.useImperativeHandle(ref, () => ({
        input: inputRef,
        uploading,
    }));

    const classes = useStyles();

    return (
        <>
            <div className={cx(className, classes.root)}>
                {uploading ? <CircularProgress size={15} /> : children}
                <input
                    {...props}
                    type="file"
                    ref={inputRef}
                    value=""
                    className={cx(classes.input)}
                    onChange={e => {
                        setUploading(true);
                        const files = [...e.target.files];
                        const done = (e, rslts = []) => {
                            setUploading(false);
                            if (onUploadSuccess) onUploadSuccess(rslts);
                            if (onUploadComplete) onUploadComplete(rslts);
                        };
                        Promise.all(files.map(f => new Promise((resolve) => {
                            uploadFile(f)
                                .then(res => resolve(res))
                                .catch(e => resolve({ error: e }));
                        })))
                            .then(rslts => done(null, rslts))
                            .catch(done);
                    }}
                />
            </div>
        </>
    );
});

FileInput.propTypes = {
    children: PropTypes.node,
    onUploadSuccess: PropTypes.func,
    onUploadComplete: PropTypes.func,
};

export default FileInput;
