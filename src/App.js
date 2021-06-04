import './App.css';
import { makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import React, { useEffect } from 'react';
import CssBaseline from '@material-ui/core/CssBaseline';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';

const useStyles = makeStyles((theme) => ({
  root: {
    '& .MuiTextField-root': {
      margin: theme.spacing(1),
      width: '100%',
    },
  },
}));

const URL = 'ws://localhost:3030';

function App() {
  const classes = useStyles();
  const [value, setValue] = React.useState('');
  const handleChange = (event) => {
    setValue(event.target.value);
  };

  const ws = new WebSocket(URL)

  useEffect(() => {
    ws.onopen = () => {
      // on connecting, do nothing but log it to the console
      console.log('connected')
    }

    ws.onmessage = evt => {
      // on receiving a message, add it to the list of messages
      console.log(evt.data)
    }

    ws.onclose = () => {
      console.log('disconnected')
      // automatically try to reconnect on connection loss
    }
  });

  return (
    <React.Fragment>
      <CssBaseline />
      <Container maxWidth="md" className="container"> 
        <form className={classes.root} noValidate autoComplete="off">
        <div>
          <TextField
            id="outlined-multiline-static"
            label="Hello World"
            multiline
            rows={20}
            variant="outlined"
          />
        </div>
     </form>
      </Container>
    </React.Fragment>
  );
}

export default App;
