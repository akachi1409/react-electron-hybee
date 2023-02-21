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

const key = '93f9f39bb14592acc35e892296554b5e2d76881ad7d14de0941dfe5c60def8cc'

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
        width: 1480,
        height: 920,
        webPreferences: {
            preload: path.join(__dirname, './middleware/preload.js'),
        },
    })
    
    NODE_ENV === 'development'
    ? window.loadURL('http://localhost:3000')
    : window.loadFile(path.join(__dirname) + '/public/index.html')

    core.on('append', () => {
      const seq = core.length - 1;
      core.get(seq).then((block) => {
        const buffer = Node.decode(block)
        const data = JSON.parse(buffer.value)
        console.log("appended data", data);
        window.webContents.send("contract:append", data);
      });
    });

    core.on('truncate', ()=> {
      console.log("--")
    })


    ipcMain.on('contract:add', async (event, message) => {
        for (const conn of conns) {
          conn.write(`contractAdd${message}`);
        }
      });
    ipcMain.on('contract:del', async (event, message) => {
      console.log('message', message);
      for (const conn of conns) {
        conn.write(`contractDel${message}`);
      }
    });
    ipcMain.on('contract:read',async (event, title) => {
      const oldValue = []
      for await (const { key, value } of bee.createReadStream()) {
        oldValue.push(JSON.parse(value))
      }
      window.webContents.send("contract:list", oldValue);
    })
}

app.whenReady().then(() => {
    createWindow()
})