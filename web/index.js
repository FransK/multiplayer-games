;(() => {
    // expectingMessage is set to true
    // if the user has just submitted a message
    // and so we should scroll the next message into view when received.
    let expectingMessage = false
    let conn

    function dial() {
      if (conn) {
        conn.removeEventListener('close', handleClose);
        conn.removeEventListener('message', handleMessage);
        conn.removeEventListener('open', handleOpen);
        conn.close();
      }

      if (conn && conn.readyState !== WebSocket.CLOSED) {
        console.warn('Attempting to reconnect while WebSocket is not fully closed');
        return;
      }

      conn = new WebSocket(`ws://${location.host}/subscribe`)
  
      function handleClose(ev) {
        appendLog(`WebSocket Disconnected code: ${ev.code}, reason: ${ev.reason}`, true);
        if (ev.code !== 1001) {
          appendLog('Reconnecting in 1s', true);
          setTimeout(dial, 1000);
        }
      }

      function handleMessage(ev) {
        if (typeof ev.data !== 'string') {
          console.error('unexpected message type', typeof ev.data);
          return;
        }
        const p = appendLog(ev.data);
        if (expectingMessage) {
          p.scrollIntoView();
          expectingMessage = false;
        }
      }

      function handleOpen(ev) {
        console.info('WebSocket connected');
      }

      conn.addEventListener('close', handleClose);
      conn.addEventListener('message', handleMessage);
      conn.addEventListener('open', handleOpen);
    }
    dial()
  
    const messageLog = document.getElementById('message-log')
    const publishForm = document.getElementById('publish-form')
    const messageInput = document.getElementById('message-input')
    const messageSend = document.getElementById('message-send')
  
    // appendLog appends the passed text to messageLog.
    function appendLog(text, error) {
      const p = document.createElement('p')
      // Adding a timestamp to each message makes the log easier to read.
      p.innerText = `${new Date().toLocaleTimeString()}: ${text}`
      if (error) {
        p.style.color = 'red'
        p.style.fontStyle = 'bold'
      }
      messageLog.append(p)
      return p
    }
    appendLog('Submit a message to get started!')
  
    // onsubmit publishes the message from the user when the form is submitted.
    publishForm.onsubmit = async ev => {
      ev.preventDefault()
  
      const msg = messageInput.value
      if (msg === '') {
        return
      }
      messageInput.value = ''
  
      expectingMessage = true
      try {
        const resp = await fetch('/publish', {
          method: 'POST',
          body: msg,
        })
        if (resp.status !== 202) {
          throw new Error(`Unexpected HTTP Status ${resp.status} ${resp.statusText}`)
        }
      } catch (err) {
        appendLog(`Publish failed: ${err.message}`, true)
      }
    }

    messageSend.onclick = async ev => {
      ev.preventDefault()
  
      const msg = messageInput.value
      if (msg === '') {
        return
      }
      messageInput.value = ''
  
      if (conn.readyState === WebSocket.OPEN) {
        try {
          conn.send(msg);
        } catch (err) {
          appendLog(`Failed to send message: ${err.message}`, true);
        }
      } else {
        appendLog('WebSocket is not open. Unable to send message.', true);
      }
    }
  })()