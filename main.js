const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const Hyperswarm = require('hyperswarm');
const Corestore = require('corestore');
const Hyperbee = require('hyperbee');
const b4a = require('b4a');
const goodbye = require('graceful-goodbye');
const { Node } = require('hyperbee/lib/messages.js');
const {default: installExtension,  REACT_DEVELOPER_TOOLS } = require('electron-devtools-installer');
const NODE_ENV = process.env.NODE_ENV

const key = 'eb262ad276d9a2951a4e89be90c6dcd4150cc34af32433464485b3d8b30fd07a'

const conns = [];


const createWindow = async () => {
    const store = new Corestore('./storage');

    const swarm = new Hyperswarm();
    goodbye(() => swarm.destroy());
  
    swarm.on('connection', (conn) => {
      store.replicate(conn);
      const name = b4a.toString(conn.remotePublicKey, 'hex');
      console.log('*Got Connection:', name, '*');
      conns.push(conn);
    });
  
    const core = store.get({ key: b4a.from(key, 'hex') });
  
    const bee = new Hyperbee(core, {
      keyEncoding: 'utf-8',
      valueEncoding: 'utf-8',
    });
  
    await core.ready();
  
    const foundPeers = store.findingPeers();
    swarm.join(core.discoveryKey);
    swarm.flush().then(() => foundPeers());
  
    await core.update();
    const window = new BrowserWindow({
        width: 1080,
        height: 720,
        webPreferences: {
            preload: path.join(__dirname, './middleware/preload.js'),
        },
    })
    
    // window.loadURL('http://localhost:3000')
    if (NODE_ENV === 'development'){
        console.log("node here")
        // await installExtensions();
    }
    NODE_ENV === 'development'
    ? window.loadURL('http://localhost:3000')
    : window.loadFile(path.join(__dirname) + '/public/index.html')

    core.on('append', () => {
      const seq = core.length - 1;
      core.get(seq).then((block) => {
        const buffer = Node.decode(block)
        const data = JSON.parse(buffer.value)
        const arr = []
        arr.push(data);
        window.webContents.send("contract:list", arr);
      });
    });

    

    ipcMain.on('contract:add', async (event, message) => {
        // console.log("message", message);
        for (const conn of conns) {
          conn.write(`contractAdd${message}`);
        }
      });
    ipcMain.on('contract:read',async (event, title) => {
      const oldValue = []
      for await (const { key, value } of bee.createReadStream()) {
        console.log("value", JSON.parse(JSON.parse(value)));
        oldValue.push(JSON.parse(JSON.parse(value)))
      }
      console.log("oldValue", oldValue);
      oldValue.forEach((c)=> {
        console.log(c);
      })
      window.webContents.send("contract:list", oldValue);
    })
}

app.whenReady().then(() => {
    installExtension(REACT_DEVELOPER_TOOLS)
    .then((name) => console.log(`Added Extension:  ${name}`))
        .catch((err) => console.log('An error occurred: ', err));
    createWindow()
})