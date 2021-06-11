import './App.css';
import { makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import React, { useEffect, useState } from 'react';
import CssBaseline from '@material-ui/core/CssBaseline';
import Container from '@material-ui/core/Container';
import { Tooltip } from '@material-ui/core';
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
import { isCompositeComponent } from 'react-dom/test-utils';
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

const customColors = ['blue', 'green', 'amber', 'red', 'purple', 'silver', 'gold', 'orange', 'pink']

function App() {
  const [username, setUsername] = useState('');
  const [userColor, setUserColor] = useState('');
  const [users, setUsers] = useState([]);
  const [canEdit, setCanEdit] = useState();

  function handleClear() {
    yarray.delete(0, yarray.length)
    // yarray.push([username])
  }

  function handleJoinOrLeave() {
    if(canEdit){
      logOff()
    } else {
      logOn()
    }
  }

  function logOn() {
    setCanEdit(true)
    console.log('username', username)
    const containsUsername = (user) => user.uname === username;
    if(!yarray.toArray().some(containsUsername)) {
      console.log('does not contain username')
      yarray.push([{uname: username, ucolor: userColor}])
    }
  }

  function logOff() {
    setCanEdit(false)
    console.log('logging off')
    yarray.toArray().forEach((usr, index)=>{
      if (usr.uname === username) {
        console.log('deleting')
        yarray.delete(index, 1)
      }
    })
  }

  const randomName = uniqueNamesGenerator({ dictionaries: [adjectives, colors, animals], separator: ' ' , length: 2, });

  useEffect(()=>{
    attachQuillRefs()
    yarray.observe(_ => {
      setUsers(yarray.toArray())
      })
    indexeddbProvider.get('user').then((db_user) => {
      if (db_user) {
        return db_user
      } else {
        const newUser = {
          name: randomName,
          colour: customColors[Math.floor(Math.random()*customColors.length)],
        }
        indexeddbProvider.set('user', newUser)  
        return newUser
      }
    }).then((currentUser)=>{
      setUsername(currentUser.name)
      setUserColor(currentUser.colour)
      webrtcProvider.awareness.setLocalStateField('user', {
        name: currentUser.name,
        color: currentUser.colour
      })
      const containsUsername = (user) => user.uname === currentUser.name;
      console.log('array >>>> ', yarray.toArray())
      console.log('user >>>> ', currentUser.name)
      if(yarray.toArray().some(containsUsername)) {
        console.log('user logged in')
        setCanEdit(true)
      }   
    })
    
    new QuillBinding(ytext, quillRef, webrtcProvider.awareness)
  }, [])
 
  return (
    <React.Fragment>
      <CssBaseline />
      <Container maxWidth="md" className="container"> 
        <h3>Your nickname: <span style={{color: userColor}}>{username}</span></h3> 
        <div>
          <h4>Currently editting:</h4>
          <div className="users">
          { yarray.toArray().map((user) => {  
          return <Tooltip title={user.uname} aria-label="add">
            <div className="circle" style={{ backgroundColor: user.ucolor}} ariaLabel="this">{ user.uname.match(/\b(\w)/g).join(' ').toUpperCase() }</div>
            </Tooltip>
          })}
          </div>
          {/* <h4>{ users.map((user) => { return <span style={{color: user.ucolor}}>{user.uname} </span>})}</h4> */}
        </div>
        {/* <Button variant="contained" onClick={() => logOff()}>Leave</Button> */}
        <Button variant="contained" onClick={() => handleJoinOrLeave()}>{canEdit?"Leave":"Join"}</Button>
        <div hidden={!canEdit}>
        <ReactQuill 
          ref={(el) => { reactQuillRef = el }}
          theme={'snow'} 
          modules={{ cursors:true }} 
          style={{ height: '300px', paddingBottom: '50px', paddingTop: '10px' }} 
        />
        </div>
      </Container>
    </React.Fragment>
  );
}

export default App;
