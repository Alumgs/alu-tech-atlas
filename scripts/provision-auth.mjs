import {randomBytes,pbkdf2Sync} from 'node:crypto';
import {spawnSync} from 'node:child_process';
// GitHub injects this through an encrypted Actions secret. Never log its value.
const password=process.env.ATLAS_ACCESS_PASSWORD||'';
if(password.length<12||password.length>256)throw Error('ATLAS_ACCESS_PASSWORD must contain 12–256 characters');
const salt=randomBytes(16).toString('hex');
const data={ATLAS_PASSWORD_HASH:'pbkdf2-sha256$100000$'+salt+'$'+pbkdf2Sync(password,Buffer.from(salt,'hex'),100000,32,'sha256').toString('hex'),ATLAS_SESSION_SECRET:randomBytes(32).toString('hex')};
const result=spawnSync(process.execPath,['node_modules/wrangler/bin/wrangler.js','secret','bulk','--config','dist/server/wrangler.json'],{input:JSON.stringify(data),stdio:['pipe','inherit','inherit'],env:{...process.env,ATLAS_ACCESS_PASSWORD:''}});
if(result.status!==0)process.exit(result.status||1);
