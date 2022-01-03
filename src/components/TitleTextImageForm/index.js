import React from 'react';
import TextField from '@material-ui/core/TextField';
import Fab from '@material-ui/core/Fab';
import AddIcon from '@material-ui/icons/Add';
import DeleteIcon from '@material-ui/icons/Delete';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import FileIput from '@/components/FileInput';

function TitleTextImageForm({ labels, value, onChange, noTitle }) {
  value = { text: '', title: '', image: null, ...value };
  labels = { text: 'Text', title: 'Title', image: 'Image', ...labels };
  const _onChange = v => onChange({ ...value, ...v });

  return (
    <>
      {!noTitle && (
          <>
            <div>
              <TextField
                fullWidth
                value={value.title || ''}
                label={labels.title}
                onChange={e => _onChange({ title: e.target.value })}
              />
            </div>
            <br />
          </>
        )}
        
      <Grid container spacing={1} alignItems="flex-end">      
        <Grid item xs={10} sm={10}>
          <TextField
            fullWidth
            rows={5}
            multiline
            value={value.text || ''}
            label={labels.text}
            onChange={e => _onChange({ text: e.target.value })}
          />
        </Grid>

        <Grid item xs={2} sm={2}>
          <div
            style={{
              textAlign: 'center',
              minHeight: 100,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {value.image && value.image.data ? (
              <img
                role="presentation"
                src={value.image.data}
                style={{ width: 100, height: 'auto' }}
              />
            ) : (
              <div stype={{ padding: 20 }}>
                <Typography color="textSecondary" variant="caption">No image</Typography>
              </div>
            )}
          </div>

          <br />

          <Grid container>
            <Grid
              item xs={6}
              sm={6}
              style={{ textAlign: 'center' }}
            >
                <FileIput
                  accept="image/*"
                  onUploadComplete={res => {
                    const f = res[0];
                    if (f && f.error) return alert(f.error.message || f.error);
                    onChange({ image: f });
                  }}
                >
                  <Fab
                    size="small"
                    color="secondary"
                  >
                    <AddIcon fontSize="small" />
                  </Fab>
                </FileIput>              
            </Grid>

            <Grid
              item xs={6}
              sm={6}
              style={{ textAlign: 'center' }}
            >
              <Fab
                size="small"
                disabled={!value.image}
                onClick={() => _onChange({ image: null })}
              >
                <DeleteIcon fontSize="small" />
              </Fab>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      <br /><br />
    </>
  );
}

export default TitleTextImageForm;
