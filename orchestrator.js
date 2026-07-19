const { fork } = require("child_process");

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function waitForHealth(url, timeout = 120000) {
  const start = Date.now();

  while (Date.now() - start < timeout) {
    try {
      const res = await fetch(url);
      if (res.ok) return true;
    } catch (e) {}

    await sleep(500);
  }

  throw new Error("❌ Service not ready: " + url);
}

function startProcess({ name, file, env, healthUrl }) {
  console.log(`🚀 Starting ${name}...`);

  let proc;

  const spawn = () => {
    console.log(`[${name}] Launching: ${file}`);
    proc = fork(file, [], {
      cwd: require("path").dirname(file),

      env: {
        ...process.env,
        ...env,
      },
      stdio: "inherit",
    });
    console.log(`[${name}] PID: ${proc.pid}`);

    proc.on("exit", (code) => {
      console.log(`❌ ${name} exited (${code})`);

      console.log(`🔁 Restarting ${name}...`);
      setTimeout(spawn, 2000);
    });
  };

  spawn();

  return {
    waitReady: () => waitForHealth(healthUrl),
    process: () => proc,
  };
}

module.exports = {
  startProcess,
  waitForHealth,
};