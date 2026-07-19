const { app, BrowserWindow } = require("electron");
const path = require("path");
const { startProcess } = require("./orchestrator");

let mainWindow;
console.log("========== MAIN START ==========");
const NEXT_PORT = 3000;
const API_PORT = 8000;

let expressService;
let nextService;
console.log("Calling boot...");
async function boot() {

    console.log("BOOT");
  if (app.isPackaged) {

    const expressPath = path.join(
      app.getAppPath(),
      "express_backend_lafamooai",
      "app.js"
    );
console.log("APP PATH :", app.getAppPath());
console.log("NEXT PATH :", nextPath);
    const nextPath = path.join(
      app.getAppPath(),
      ".next",
      "standalone",
      "server.js"
    );
    const fs = require("fs");

console.log("appPath =", app.getAppPath());
console.log("server exists =", fs.existsSync(nextPath));
console.log(
  "static exists =",
  fs.existsSync(path.join(app.getAppPath(), ".next", "standalone", ".next", "static"))
);
console.log(">>> START EXPRESS");

    expressService = startProcess({
      name: "Express",
      file: expressPath,
      env: {
        PORT: API_PORT,
      },
      healthUrl: `http://127.0.0.1:${API_PORT}/health`,
    });
console.log(">>> START NEXT");
    nextService = startProcess({
      name: "Next",
      file: nextPath,
      env: {
        PORT: NEXT_PORT,
        HOSTNAME: "127.0.0.1",
      },
      healthUrl: `http://127.0.0.1:${NEXT_PORT}`,
    });

    // Wait services
    await expressService.waitReady();
    console.log("✅ Express ready");

    await nextService.waitReady();
    console.log("✅ Next ready");
  }

  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    icon: path.join(__dirname, "public", "icon_.ico"),
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  await mainWindow.loadURL(`http://127.0.0.1:${NEXT_PORT}`);
  if (!app.isPackaged) {
    mainWindow.webContents.openDevTools();
  }
  
}

app.whenReady().then(async () => {
  try {
    await boot();
  } catch (err) {
    console.error("BOOT ERROR:", err);
  }
});