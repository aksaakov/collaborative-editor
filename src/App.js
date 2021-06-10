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

  useEffect(()=>{
    attachQuillRefs()  
    const awr = webrtcProvider.awareness.getStates().values()
    console.log(awr) 
    for (var item of awr) {
      console.log(item)
    }
    
    yarray.observe(_ => {
      setUsers(yarray.toArray())
      console.log('yarray state: ', yarray.toArray())
    })

    indexeddbProvider.get('username').then((db_username) => {
      if (db_username) {
        return db_username
      } else {
        const newUser = uniqueNamesGenerator({ dictionaries: [adjectives, colors, animals], separator: ' ' , length: 2, });
        indexeddbProvider.set('username', newUser)  
        yarray.push([newUser]) 
        return newUser
      }
    }).then((currentUsername)=>{
      setUsername(currentUsername)
      webrtcProvider.awareness.setLocalStateField('user', {
        name: currentUsername,
        color: randomColor
      })
    
      window.addEventListener("focus", function() {
        if(yarray.toArray > 0) {
          yarray.map((usr)=>{
            console.log('mapping through user yarray', usr)
            if (usr !== currentUsername) {
              console.log('this username not found -> adding it')
              yarray.push([currentUsername])
            }
          })
        } else {
          yarray.push([currentUsername])
        }
        
        console.log('on window')
      });
      window.addEventListener("blur", function() {
        yarray.map((usr, index)=>{
          console.log('blur: mapping through user yarray')
          if (usr === currentUsername) {
            yarray.delete(index, 1)
          }
        })
        console.log('left window')
      });
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
          // onFocus={() => onEditorFoucs()}
        />
        <Button variant="contained" onClick={() => handleClear()}>Clear</Button>
      </Container>
    </React.Fragment>
  );
}

export default App;
