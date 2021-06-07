import './App.css';
import { makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import React, { useEffect } from 'react';
import CssBaseline from '@material-ui/core/CssBaseline';
import Container from '@material-ui/core/Container';
import * as Y from 'yjs'
import { IndexeddbPersistence } from 'y-indexeddb'
import { WebrtcProvider } from 'y-webrtc'
import { QuillBinding } from 'y-quill'
import Quill from 'quill';
import QuillCursors from 'quill-cursors'
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
const { uniqueNamesGenerator, colors, animals, adjectives } = require('unique-names-generator');

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

  const ydoc = new Y.Doc()

  // const provider = new WebsocketProvider("ws://localhost:1234", 'collaboration', ydoc)
  const indexeddbProvider = new IndexeddbPersistence('y-text-sync', ydoc)
  const webrtcProvider = new WebrtcProvider('count-demo', ydoc)


  indexeddbProvider.on('synced', () => {
    console.log('content from the database is loaded')
  })

  // Define a shared text type on the document

  useEffect(()=>{
    attachQuillRefs()
   
    const ytext = ydoc.getText('editor')
  
    // "Bind" the quill editor to a Yjs text type.
    new QuillBinding(ytext, quillRef, webrtcProvider.awareness)

    const randomName = uniqueNamesGenerator({ dictionaries: [adjectives, colors, animals], separator: ' ' , length: 2, }); // big_red_donkey
    const randomColor = uniqueNamesGenerator({ dictionaries: [colors], length }); // big_red_donkey

    webrtcProvider.awareness.setLocalStateField('user', {
      name: randomName,
      color: randomColor
    })
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
