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
  const [users, setUsers] = useState([]);

  // name randomiser
  const customColors = [
    'green', 'blue', 'red', 'yellow', 'orange', 'pink', 'purple'
  ]
  const randomColor = uniqueNamesGenerator({ dictionaries: [customColors], length: 1, separator: "-" });

  let webrtcProvider
  useEffect(()=>{
    attachQuillRefs()
    const ydoc = new Y.Doc()
    const ytext = ydoc.getText('sometext')
    const yarray = ydoc.getArray('somearray')
    yarray.observe(_ => {
      setUsers(yarray.toArray())
      console.log(yarray.toArray())
    })

    // webrtc
    const webrtcOpts = { 
      filterBcConns: true, 
      awareness: new awarenessProtocol.Awareness(ydoc)
    }
    webrtcProvider = new WebrtcProvider('text-editor', ydoc, webrtcOpts)
    

    //indexed db
    const indexeddbProvider = new IndexeddbPersistence('text-editor', ydoc)
    indexeddbProvider.on('synced', () => {
      console.log('content from the database is loaded')
    })
    
    indexeddbProvider.get('username').then((db_username) => {
      if (db_username) {
        return db_username
      } else {
        const newUser = uniqueNamesGenerator({ dictionaries: [adjectives, colors, animals], separator: ' ' , length: 2, });
        yarray.push([newUser])
        indexeddbProvider.set('username', newUser)
        return newUser
      }
    }).then((currentUsername)=>{
      setUsername(currentUsername)
      webrtcProvider.awareness.setLocalStateField('user', {
        name: currentUsername,
        color: randomColor
      })
    });

    new QuillBinding(ytext, quillRef, webrtcProvider.awareness)
  }, [])

  const attachQuillRefs = () => {
    if (typeof reactQuillRef.getEditor !== 'function') return;
    quillRef = reactQuillRef.getEditor();
  }

  return (
    <React.Fragment>
      <CssBaseline />
      <Container maxWidth="md" className="container"> 
        <h3>Your nickname: {username}</h3>
        <h4>You are collaborating with: {users.join(", ")}</h4>
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
