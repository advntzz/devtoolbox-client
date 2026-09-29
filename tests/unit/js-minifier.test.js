import { describe, it, expect } from 'vitest';
import { JavaScriptMinifierTool } from '../../js/tools/js-minifier.js';

describe('JavaScriptMinifierTool', () => {
  it('should export a tool class', () => {
    expect(JavaScriptMinifierTool).toBeDefined();
    expect(typeof JavaScriptMinifierTool).toBe('function');
  });

  it('should beautify basic JavaScript', async () => {
    const tool = new JavaScriptMinifierTool();
    const result = await tool.beautifyCode('function test(){return 1+1}', { indent: '2 spaces' });
    expect(result).toContain('function test()');
    expect(result).toContain('return 1 + 1');
  });

  it('should minify basic JavaScript', async () => {
    const tool = new JavaScriptMinifierTool();
    const result = await tool.minifyCode('function test(){ return 1 + 1; }');
    expect(result).toContain('function test()');
    expect(result).toContain('return 2');
    expect(result.length).toBeLessThan('function test(){ return 1 + 1; }'.length);
  });

  it('should handle ES6 syntax and template literals', async () => {
    const tool = new JavaScriptMinifierTool();
    const input = 'const greet = (name) => `Hello ${name}!`; export default greet;';
    const minified = await tool.minifyCode(input);
    expect(minified).toContain('const greet');
    expect(minified).toContain('Hello');
    expect(minified).toContain('export default');
  });

  it('should preserve regex literals while stripping comments during minify', async () => {
    const tool = new JavaScriptMinifierTool();
    const input = 'const rg = /test/g; // comment\nconst value = rg.test("test");';
    const result = await tool.minifyCode(input);
    expect(result).toContain('/test/g');
    expect(result).not.toContain('comment');
    expect(result).toContain('rg.test');
  });

  it('should reject invalid JavaScript syntax clearly', async () => {
    const tool = new JavaScriptMinifierTool();
    await expect(tool.minifyCode('function broken({')).rejects.toThrow(/invalid|syntax|unexpected/i);
  });

  it('should handle empty input as a safe no-op', async () => {
    const tool = new JavaScriptMinifierTool();
    await expect(tool.minifyCode('')).resolves.toBe('');
    await expect(tool.beautifyCode('')).resolves.toBe('');
  });

  it('should respect indent settings', async () => {
    const tool = new JavaScriptMinifierTool();
    const result = await tool.beautifyCode('function x(){return {a:1,b:2};}', { indent: '4 spaces' });
    expect(result).toContain('    return');
  });

  it('should indent function blocks with 2 spaces', async () => {
    const tool = new JavaScriptMinifierTool();
    const result = await tool.beautifyCode('function hello(name){console.log("Hello, "+name);return true;}', { indent: '2 spaces' });
    expect(result).toContain('function hello(name) {');
    expect(result).toContain('\n  console.log("Hello, " + name);');
    expect(result).toContain('\n  return true;');
  });

  it('should indent object and array entries with 2 spaces', async () => {
    const tool = new JavaScriptMinifierTool();
    const result = await tool.beautifyCode('const user={name:"Dom",age:20,active:true,items:[1,2,3]};', { indent: '2 spaces' });
    expect(result).toContain('const user = {');
    expect(result).toContain('\n  name: "Dom",');
    expect(result).toContain('\n  items: [');
  });

  it('should indent nested blocks and 4 spaces correctly', async () => {
    const tool = new JavaScriptMinifierTool();
    const result = await tool.beautifyCode('if (ok) { doThing(); if (ready) { run(); } }', { indent: '4 spaces' });
    expect(result).toContain('\n    doThing();');
    expect(result).toContain('\n        run();');
  });

  it('should use tabs for tab indentation mode', async () => {
    const tool = new JavaScriptMinifierTool();
    const result = await tool.beautifyCode('function hello(){if (ok){return true;}}', { indent: 'tabs' });
    expect(result).toContain('\n\tif (ok) {');
    expect(result).toContain('\n\t\treturn true;');
  });

  it('should preserve comments, template literals and regex literals while beautifying', async () => {
    const tool = new JavaScriptMinifierTool();
    const result = await tool.beautifyCode('const value = /abc/g; const msg = `hello ${name}`; // comment\nif (value.test(msg)) { console.log(msg); }', { indent: '2 spaces' });
    expect(result).toContain('/abc/g');
    expect(result).toContain('const msg = `hello ${name}`');
    expect(result).toContain('// comment');
    expect(result).toContain('if (value.test(msg)) {');
  });

  it('should provide a reduction percentage for minify', async () => {
    const tool = new JavaScriptMinifierTool();
    const result = await tool.minifyCode('function test(){\n  return 1 + 1;\n}');
    expect(typeof result).toBe('string');
    expect(result.length).toBeLessThan(34);
  });

  it('should keep dangerous HTML/script payload as plain text', async () => {
    const tool = new JavaScriptMinifierTool();
    const payload = 'const payload = "<script>alert(1)</script>";';
    const result = await tool.minifyCode(payload);
    expect(result).toContain('alert(1)');
    expect(result).toContain('<\\/script>');
    expect(result).not.toContain('eval(');
  });
});
