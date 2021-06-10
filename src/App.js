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
import { Button } from '@material-ui/core';
const { uniqueNamesGenerator, colors, animals, adjectives } = require('unique-names-generator');

Quill.register('modules/cursors', QuillCursors)

let quillRef=null;
let reactQuillRef=null;

const attachQuillRefs = () => {
  if (typeof reactQuillRef.getEditor !== 'function') return;
  quillRef = reactQuillRef.getEditor();
}

const ydoc = new Y.Doc()
const ytext = ydoc.getText('sometext')
const yarray = ydoc.getArray('somearray')

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

console.log('hello')

  
// // User has switched back to the tab
// const onFocus = () => {
//   console.log('Tab is in focus');
// };

// // User has switched away from the tab (AKA tab is hidden)
// const onBlur = () => {
//   console.log('Tab is blurred');
// };

function App() {
  const [username, setUsername] = useState('');
  const [users, setUsers] = useState([]);

  // name randomiser
  const customColors = [
    'green', 'blue', 'red', 'amber', 'orange', 'pink', 'purple'
  ]
  const randomColor = uniqueNamesGenerator({ dictionaries: [customColors], length: 1, separator: "-" });

  function handleClear() {
    yarray.delete(0, yarray.length)
    // yarray.push([username])
  }

  function onEditorBlur() {
    yarray.map((usr, index) => {
      if (usr === username){
        console.log('deleting: ' + username)
        yarray.delete(index, 1)
      }
      console.log('deleting: ' + username)
      console.log('current users: ' + users)
    })
  }

  function onEditorFoucs() {
    yarray.push([username])
    console.log('adding: ' + username)
    console.log('current users: ' + users)
  }

  useEffect(()=>{
    attachQuillRefs()   

    yarray.observe(_ => {
      setUsers(yarray.toArray())
      console.log(yarray.toArray())
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
      // window.addEventListener('focus', function(){
      //   console.log('eventlistener ' + currentUsername)
      //   yarray.push([currentUsername])
      //   console.log('Tab is in focus')
      // });
      // window.addEventListener('blur', function(){
      //   yarray.map((usr, index) => {
          // if (usr === currentUsername){
          //   console.log()
          //   yarray.delete(index, 1)
          // }
      //   })
      //   webrtcProvider.awareness.off()
      //   console.log('Tab not in focus')
      // });
    });

    new QuillBinding(ytext, quillRef, webrtcProvider.awareness)
  }, [])
 
  return (
    <React.Fragment>
      <CssBaseline />
      <Container maxWidth="md" className="container"> 
        <h3>Your nickname: {username}</h3>
        <h4>Currently editting: {users.join(" ")}</h4>
        {/* <form className={classes.root} noValidate autoComplete="off">
        </form> */}
        <ReactQuill 
          ref={(el) => { reactQuillRef = el }}
          theme={'snow'} 
          modules={{ cursors:true }}  
          onFocus={() => onEditorFoucs()}
          onBlur={() => onEditorBlur()}
        />
        <Button variant="contained" onClick={() => handleClear()}>Clear</Button>
      </Container>
    </React.Fragment>
  );
}

export default App;
