import { CSSFormatterTool } from '../js/tools/css-formatter.js';

async function runProgrammatic() {
  const results = {};
  const tool = new CSSFormatterTool();

  async function beautify(input, options){
    try{
      const out = await tool.beautifyCode(input, options);
      return { ok:true, out };
    }catch(e){
      return { ok:false, error: e.message };
    }
  }
  async function minify(input, options){
    try{
      const out = await tool.minifyCode(input, options);
      return { ok:true, out };
    }catch(e){
      return { ok:false, error: e.message };
    }
  }

  results.unitTest = 'MANUAL_RAN_BEFORE';

  const b1 = await beautify('body{margin:0;padding:0;background:#fff;color:#333}.card{padding:20px;color:red}', { indent: '2 spaces', preserveComments: true });
  results.basicBeautify = (b1.ok && b1.out.includes('color: red')) ? 'PASS' : (b1.ok ? `FAIL out:${b1.out}` : `ERROR ${b1.error}`);

  const m1 = await minify('body {\n  margin: 0;\n  padding: 0;\n  background: #fff;\n  color: #333;\n}', { preserveComments: true });
  results.basicMinify = (m1.ok && m1.out.includes('color:') && !m1.out.includes('\n')) ? 'PASS' : (m1.ok ? `FAIL out:${m1.out}` : `ERROR ${m1.error}`);

  const inputIndent = '.card{color:red}@media (max-width:600px){.card .btn{color:blue}}';
  const b2 = await beautify(inputIndent, { indent: '2 spaces' });
  results.indent2 = (b2.ok && b2.out.includes('\n  .card .btn')) ? 'PASS' : (b2.ok ? `FAIL:${b2.out}` : `ERROR ${b2.error}`);
  const b3 = await beautify(inputIndent, { indent: '4 spaces' });
  results.indent4 = (b3.ok && b3.out.includes('\n    .card .btn')) ? 'PASS' : (b3.ok ? `FAIL:${b3.out}` : `ERROR ${b3.error}`);
  const b4 = await beautify(inputIndent, { indent: 'tabs' });
  results.indentTabs = (b4.ok && b4.out.includes('\n\t.card .btn')) ? 'PASS' : (b4.ok ? `FAIL:${b4.out}` : `ERROR ${b4.error}`);

  const inpComment = '/* Important comment */\nbody{margin:0;color:red}';
  const cOn = await beautify(inpComment, { preserveComments: true });
  results.commentsOn = (cOn.ok && cOn.out.includes('/* Important comment */')) ? 'PASS' : (cOn.ok ? `FAIL:${cOn.out}` : `ERROR ${cOn.error}`);
  const cOff = await beautify(inpComment, { preserveComments: false });
  results.commentsOff = (cOff.ok && !cOff.out.includes('Important comment')) ? 'PASS' : (cOff.ok ? `FAIL:${cOff.out}` : `ERROR ${cOff.error}`);

  const mediaIn = 'body{margin:0}@media screen and (max-width:600px){body{margin:10px}.card{display:none}}';
  const mediaB = await beautify(mediaIn, {});
  results.mediaBeautify = (mediaB.ok && mediaB.out.includes('@media') && mediaB.out.includes('.card')) ? 'PASS' : (mediaB.ok ? `FAIL:${mediaB.out}` : `ERROR ${mediaB.error}`);
  const mediaM = await minify(mediaIn, {});
  results.mediaMinify = (mediaM.ok && mediaM.out.includes('@media') && mediaM.out.includes('.card')) ? 'PASS' : (mediaM.ok ? `FAIL:${mediaM.out}` : `ERROR ${mediaM.error}`);

  const kf = '@keyframes slide{from{transform:translateX(0)}50%{transform:translateX(50px)}to{transform:translateX(100px)}}';
  const kfb = await beautify(kf, {});
  results.keyframesBeautify = (kfb.ok && kfb.out.includes('@keyframes')) ? 'PASS' : (kfb.ok ? `FAIL:${kfb.out}` : `ERROR ${kfb.error}`);
  const kfm = await minify(kf, {});
  results.keyframesMinify = (kfm.ok && kfm.out.includes('transform')) ? 'PASS' : (kfm.ok ? `FAIL:${kfm.out}` : `ERROR ${kfm.error}`);

  const vars = ':root{--primary:#2563eb;--gap:16px}.card{color:var(--primary);gap:var(--gap)}';
  const vb = await beautify(vars, {});
  results.variablesBeautify = (vb.ok && vb.out.includes('--primary')) ? 'PASS' : (vb.ok ? `FAIL:${vb.out}` : `ERROR ${vb.error}`);
  const vm = await minify(vars, {});
  results.variablesMinify = (vm.ok && vm.out.includes('--gap')) ? 'PASS' : (vm.ok ? `FAIL:${vm.out}` : `ERROR ${vm.error}`);

  const str = '.content::before{content:"hello {world}; test";font-family:"Arial; sans-serif"}';
  const sb = await beautify(str, {});
  results.stringsBeautify = (sb.ok && sb.out.includes('hello {world}; test')) ? 'PASS' : (sb.ok ? `FAIL:${sb.out}` : `ERROR ${sb.error}`);
  const sm = await minify(str, {});
  results.stringsMinify = (sm.ok && sm.out.includes('hello')) ? 'PASS' : (sm.ok ? `FAIL:${sm.out}` : `ERROR ${sm.error}`);

  const urlIn = '.hero{background-image:url("https://example.com/image.png?a=1&b=2");background-size:cover}';
  const ub = await beautify(urlIn, {});
  results.urlBeautify = (ub.ok && ub.out.includes('https://example.com/image.png?a=1&b=2')) ? 'PASS' : (ub.ok ? `FAIL:${ub.out}` : `ERROR ${ub.error}`);
  const um = await minify(urlIn, {});
  results.urlMinify = (um.ok && um.out.includes('https://example.com/image.png?a=1&b=2')) ? 'PASS' : (um.ok ? `FAIL:${um.out}` : `ERROR ${um.error}`);

  const complex = '.container>.card:hover,.container .card[data-state="open"]{margin:0 10px;padding:calc(100% - 20px)}';
  const cb = await beautify(complex, {});
  results.complexBeautify = (cb.ok && cb.out.includes('calc(100% - 20px)')) ? 'PASS' : (cb.ok ? `FAIL:${cb.out}` : `ERROR ${cb.error}`);
  const cm = await minify(complex, {});
  results.complexMinify = (cm.ok && cm.out.includes('calc(100% - 20px)')) ? 'PASS' : (cm.ok ? `FAIL:${cm.out}` : `ERROR ${cm.error}`);

  const supports = '.card{color:red}@supports (display:grid){.card{display:grid;grid-template-columns:1fr 1fr}}';
  const sbt = await beautify(supports, {});
  results.supportsBeautify = (sbt.ok && sbt.out.includes('@supports')) ? 'PASS' : (sbt.ok ? `FAIL:${sbt.out}` : `ERROR ${sbt.error}`);
  const smt = await minify(supports, {});
  results.supportsMinify = (smt.ok && smt.out.includes('@supports')) ? 'PASS' : (smt.ok ? `FAIL:${smt.out}` : `ERROR ${smt.error}`);

  const invalid = 'body{color:red';
  const invB = await beautify(invalid, {});
  results.invalidBeautify = (!invB.ok && invB.error && invB.error.toLowerCase().includes('invalid')) ? 'PASS' : (invB.ok ? `FAIL produced:${invB.out}` : `WARN:${invB.error}`);
  const invM = await minify(invalid, {});
  results.invalidMinify = (!invM.ok && invM.error && invM.error.toLowerCase().includes('invalid')) ? 'PASS' : (invM.ok ? `FAIL produced:${invM.out}` : `WARN:${invM.error}`);

  const xssIn = "body{--payload:\"<script>alert('xss')</script>\";content:\"</textarea><script>alert(1)</script>\"}";
  const xb = await beautify(xssIn, {});
  results.xss = (xb.ok && !xb.out.includes('<script')) ? 'PASS' : (xb.ok ? `FAIL:${xb.out}` : `ERROR ${xb.error}`);

  results.copy = 'MANUAL_BROWSER';
  results.download = "MANUAL_BROWSER (code uses 'processed.css' filename)";
  results.upload = 'MANUAL_BROWSER';

  results.clear = 'MANUAL_BROWSER';
  results.stats = 'MANUAL_BROWSER';
  results.indentChange = 'MANUAL_BROWSER';
  results.commentsToggle = 'MANUAL_BROWSER';

  results.console = 'MANUAL_BROWSER';

  try{
    const Router = (await import('../js/router-lazy.js')).Router;
    const r = new Router();
    const has = r.routes.has('css-formatter');
    results.router = has ? 'PASS' : 'FAIL:route missing';
  }catch(e){ results.router = `ERROR ${e.message}`; }

  console.log('QA PROGRAMMATIC RESULTS');
  console.log(JSON.stringify(results, null, 2));
}

runProgrammatic();
