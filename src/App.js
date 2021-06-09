import './App.css';
import { makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import React, { useEffect, useState } from 'react';
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
import * as awarenessProtocol from 'y-protocols/awareness.js'
const { uniqueNamesGenerator, colors, animals, adjectives } = require('unique-names-generator');

Quill.register('modules/cursors', QuillCursors)

function App() {
  let quillRef=null;
  let reactQuillRef=null;
  const [username, setUsername] = useState('');

  // name randomiser
  const customColors = [
    'green', 'blue', 'red', 'yellow', 'orange', 'pink', 'purple'
  ]
  const randomColor = uniqueNamesGenerator({ dictionaries: [customColors], length: 1 }); // big_red_donkey

  useEffect(()=>{
    attachQuillRefs()
    const ydoc = new Y.Doc()

    // webrtc
    const webrtcOpts = { 
      filterBcConns: true, 
      awareness: new awarenessProtocol.Awareness(ydoc)
    }
    const webrtcProvider = new WebrtcProvider('text-editor', ydoc, webrtcOpts)
    

    //indexed db
    const indexeddbProvider = new IndexeddbPersistence('text-editor', ydoc)
    indexeddbProvider.on('synced', () => {
      console.log('content from the database is loaded')
    })
    
    indexeddbProvider.get('username').then(function(db_username) {
      if (db_username) {
        setUsername(db_username)
        console.log('received username' + db_username)
      } else {
        const randomName = uniqueNamesGenerator({ dictionaries: [adjectives, colors, animals], separator: ' ' , length: 2, });
        setUsername(randomName)
        indexeddbProvider.set('username', randomName)
        console.log('setting username to ' + randomName)
      }
      webrtcProvider.awareness.setLocalStateField('user', {
        name: username,
        color: randomColor
      })
    }, function(err) {
      console.log('no username', err); // Error: "It broke"
    });
    const ytext = ydoc.getText()
    new QuillBinding(ytext, quillRef)
  }, [])

  const attachQuillRefs = () => {
    if (typeof reactQuillRef.getEditor !== 'function') return;
    quillRef = reactQuillRef.getEditor();
  }

  return (
    <React.Fragment>
      <CssBaseline />
      <Container maxWidth="md" className="container"> 
        <span>You are: {username}</span>
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
