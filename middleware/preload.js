const { contextBridge, ipcRenderer } = require('electron')
window.test = function() {
    console.log("test")
}
contextBridge.exposeInMainWorld('electronAPI', {
    addContract:(data) =>{
        console.log('data', data);
        ipcRenderer.send('contract:add', data);
    },
    setTitle: (title) => ipcRenderer.send('set-title', title)
})