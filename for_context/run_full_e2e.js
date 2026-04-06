#!/usr/bin/env node
const { spawn } = require('child_process');
const http = require('http');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SERVER_PATH = path.join(ROOT, 'server.js');
const HOST = process.env.E2E_HOST || 'localhost';
const PORT = process.env.E2E_PORT || 3000;

function sleep(ms){ return new Promise(r=>setTimeout(r,ms)); }

function isServerUp(){
  return new Promise((resolve)=>{
    const req = http.get({ host: HOST, port: PORT, path: '/', timeout: 1500 }, res => {
      res.resume();
      resolve(true);
    });
    req.on('error', ()=>resolve(false));
    req.on('timeout', ()=>{ req.destroy(); resolve(false); });
  });
}

function runNodeScript(relPath, args = [], opts = {}){
  const script = path.join(__dirname, relPath);
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [script, ...args], Object.assign({ cwd: ROOT }, opts));
    let out = '';
    child.stdout.on('data', d => { process.stdout.write(d); out += d.toString(); });
    child.stderr.on('data', d => { process.stderr.write(d); });
    child.on('error', e => reject(e));
    child.on('close', code => code === 0 ? resolve(out) : reject(new Error(`Exit ${code} for ${relPath}`)));
  });
}

async function waitForServer(trySeconds = 30){
  const deadline = Date.now() + trySeconds * 1000;
  while(Date.now() < deadline){
    if(await isServerUp()) return true;
    await sleep(500);
  }
  return false;
}

async function main(){
  const argv = process.argv.slice(2);
  const facultyId = (argv.find(a=>a.startsWith('--facultyId='))||'--facultyId=21').split('=')[1];
  const adminId = (argv.find(a=>a.startsWith('--adminId='))||'--adminId=4').split('=')[1];

  const serverAlreadyUp = await isServerUp();
  let serverProcess = null;
  if(serverAlreadyUp){
    console.log('Detected server already running on', `${HOST}:${PORT} - will not start a new server.`);
  } else {
    console.log('Starting server...');
    serverProcess = spawn(process.execPath, [SERVER_PATH], { cwd: ROOT, stdio: ['ignore','pipe','pipe'] });
    serverProcess.stdout.on('data', d => process.stdout.write(`[server] ${d}`));
    serverProcess.stderr.on('data', d => process.stderr.write(`[server-err] ${d}`));
    const ready = await waitForServer(30);
    if(!ready){
      if(serverProcess) serverProcess.kill();
      throw new Error('Server did not become ready in time');
    }
    console.log('Server started and ready.');
  }

  try{
    // 1) optional smoke test (may exercise sockets)
    console.log('\n=== Running smoke test (scripts/smoke_test_faculty.js) ===');
    await runNodeScript(path.join('..','scripts','smoke_test_faculty.js')).catch(err => { console.warn('Smoke test failed:', err.message); throw err; });

    // 2) insert pending problem
    console.log('\n=== Inserting a pending problem (for_context/insert_problem_pending_e2e_var.js) ===');
    const insertOut = await runNodeScript('insert_problem_pending_e2e_var.js');
    const m = insertOut.match(/inserted_pending_id\s*=?\s*(\d+)/i);
    if(!m) throw new Error('Could not parse inserted_pending_id from output');
    const pendingId = m[1];
    console.log('Inserted pending id =', pendingId);

    // 3) faculty approve
    console.log(`\n=== Approving pending ${pendingId} as faculty ${facultyId} ===`);
    await runNodeScript('approve_pending.js', [pendingId, facultyId]);

    // 4) auto admin commit events/blogs
    console.log(`\n=== Auto-committing events/blogs as admin ${adminId} ===`);
    await runNodeScript('auto_admin_commit_events_blogs.js', [adminId]);

    // 5) admin commit the problem change
    console.log(`\n=== Admin committing pending change ${pendingId} as admin ${adminId} ===`);
    await runNodeScript('admin_commit_changes.js', [pendingId, adminId]);

    // 6) verify the commit
    console.log(`\n=== Verifying commit for change ${pendingId} ===`);
    await runNodeScript('verify_commit_for_change.js', [pendingId]);

    // 7) verify events/blogs
    console.log('\n=== Verifying events/blogs committed ===');
    await runNodeScript('verify_events_blogs.js');

    console.log('\nE2E completed successfully.');
    process.exit(0);
  }catch(err){
    console.error('\nE2E failed:', err && err.message ? err.message : err);
    if(serverProcess) serverProcess.kill();
    process.exit(2);
  } finally {
    if(serverProcess){
      // give server a moment then kill
      await sleep(400);
      serverProcess.kill();
    }
  }
}

main().catch(e=>{ console.error('Fatal error:', e); process.exit(3); });
