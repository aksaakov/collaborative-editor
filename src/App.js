import './App.css';
import { makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import React, { useEffect } from 'react';
import CssBaseline from '@material-ui/core/CssBaseline';
import Container from '@material-ui/core/Container';
import * as Y from 'yjs'
import { WebsocketProvider } from 'y-websocket'
import { QuillBinding } from 'y-quill'
import Quill from 'quill';
import QuillCursors from 'quill-cursors'
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const useStyles = makeStyles((theme) => ({
  root: {
    '& .MuiTextField-root': {
      margin: theme.spacing(1),
      width: '100%',
    },
  },
}));

Quill.register('modules/cursors', QuillCursors)

function App() {
  const classes = useStyles();
  let quillRef=null;
  let reactQuillRef=null;
  // const [value, setValue] = React.useState('');
  // const handleChange = (event) => {
  //   setValue(event.target.value);
  // };
  // const editorContainer = document.createElement('div')
  // editorContainer.setAttribute('id', 'editor')
  // document.body.insertBefore(editorContainer, null)

  useEffect(()=>{
    attachQuillRefs()
    const ydoc = new Y.Doc()

    const provider = new WebsocketProvider("wss://localhost:1234", 'collaboration', ydoc)
    provider.on('status', event => {
      console.log('websocket provider: ', event.status) // logs "connected" or "disconnected"
    })
  
    // Define a shared text type on the document
    const ytext = ydoc.getText('editor')
  
    // "Bind" the quill editor to a Yjs text type.
    new QuillBinding(ytext, quillRef, provider.awareness)

    provider.awareness.setLocalStateField('user', {
      name: 'Typing Jimmy',
      color: 'blue'
    })

    provider.on('message', function incoming(data) {
      console.log(data);
    });
  }, [])

  const attachQuillRefs = () => {
    if (typeof reactQuillRef.getEditor !== 'function') return;
    quillRef = reactQuillRef.getEditor();
  }

  return (
    <React.Fragment>
      <CssBaseline />
      <Container maxWidth="md" className="container"> 
        {/* <form className={classes.root} noValidate autoComplete="off">
        </form> */}
        <ReactQuill 
          ref={(el) => { reactQuillRef = el }}
          theme={'snow'} 
          modules={{ cursors:true }}  
        />
      </Container>
    </React.Fragment>
  );
}

export default App;
