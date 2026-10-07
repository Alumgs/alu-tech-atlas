import {randomBytes,pbkdf2Sync} from 'node:crypto';
import {spawnSync} from 'node:child_process';
// Read hidden password from a TTY; never accept it as a CLI argument or print it.
if(!process.stdin.isTTY){console.error('请在本地终端交互运行 npm run setup:password。');process.exit(1);}
async function hidden(prompt){
 process.stdout.write(prompt);process.stdin.setRawMode(true);process.stdin.resume();let value='';
 return await new Promise((resolve,reject)=>{const onData=buffer=>{for(const c of buffer.toString()){if(c==='\u0003'){done();reject(new Error('cancelled'));return;}if(c==='\r'||c==='\n'){done();resolve(value);return;}if(c==='\u007f')value=value.slice(0,-1);else if(c>=' ')value+=c;}};function done(){process.stdin.off('data',onData);process.stdin.setRawMode(false);process.stdin.pause();process.stdout.write('\n');}process.stdin.on('data',onData);});
}
const password=await hidden('设置网站密码（至少 12 个字符）：');
if(password.length<12||password.length>256)throw Error('密码长度需要在 12–256 个字符之间');
if(password!==await hidden('再输入一次：'))throw Error('两次输入不一致');
const salt=randomBytes(16).toString('hex');const verifier='pbkdf2-sha256$100000$'+salt+'$'+pbkdf2Sync(password,Buffer.from(salt,'hex'),100000,32,'sha256').toString('hex');
for(const [name,value] of [['ATLAS_PASSWORD_HASH',verifier],['ATLAS_SESSION_SECRET',randomBytes(32).toString('hex')]]){
 const r=spawnSync(process.execPath,['node_modules/wrangler/bin/wrangler.js','secret','put',name,'--config','wrangler.jsonc'],{input:value,stdio:['pipe','inherit','inherit']});if(r.status!==0)process.exit(r.status||1);
}
console.log('网站密码已配置。密码更新后，原有登录会话自动失效。');
