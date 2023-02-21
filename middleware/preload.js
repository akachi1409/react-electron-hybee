const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
    addContract:(data) =>{
        ipcRenderer.send('contract:add', data);
    },
    delContract: (data) => {
        ipcRenderer.send('contract:del', data);
    },
    readContract: (data)=> {
        ipcRenderer.send('contract:read');
    },
    appendContract: (data)=> {
        ipcRenderer.on("contract:append", data);
    },
    listContract: (data) => {
        ipcRenderer.on("contract:list", data);
    },
    setTitle: (title) => ipcRenderer.send('set-title', title)
})