const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
    addContract:(data) =>{
        ipcRenderer.send('contract:add', data);
    },
    readContract: (data)=> {
        ipcRenderer.send('contract:read');
    },
    listContract: (data) => {
        ipcRenderer.on("contract:list", data);
    },
    setTitle: (title) => ipcRenderer.send('set-title', title)
})