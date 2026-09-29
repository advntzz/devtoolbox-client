import { JSDOM } from 'jsdom';

async function run() {
  const dom = new JSDOM('<!doctype html><html></html>');
  global.window = dom.window;
  global.document = dom.window.document;
  global.DOMParser = dom.window.DOMParser;
  global.XMLSerializer = dom.window.XMLSerializer;

  const { JSONToXMLConverter } = await import('./js/tools/json-to-xml.js');

  try {
    const xml = JSONToXMLConverter.convertJsonToXmlString(JSON.stringify({ a: 1, b: [2,3], c: null }), { pretty: false });
    console.log('Converter output:', xml.slice(0, 200));
    console.log('SUCCESS');
  } catch (e) {
    console.error('ERROR', e);
    process.exitCode = 2;
  }
}

run();
