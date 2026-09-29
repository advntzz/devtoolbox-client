import { describe, it, expect } from 'vitest';
import { JSONToXMLConverter } from '../../js/tools/json-to-xml.js';

describe('JSON → XML Converter', () => {
  it('converts nested objects and arrays into XML structure', () => {
    const input = JSON.stringify({
      person: { name: 'Alice', age: 30, tags: ['dev', 'js'] },
      emptyObj: {},
      emptyArr: [],
    });

    const xml = JSONToXMLConverter.convertJsonToXmlString(input, { pretty: false, indent: 0 });
    const parser = new DOMParser();
    const doc = parser.parseFromString(xml, 'application/xml');

    // Ensure no parsererror
    const errs = doc.getElementsByTagName('parsererror');
    expect(errs.length).toBe(0);

    const persons = doc.getElementsByTagName('person');
    expect(persons.length).toBe(1);
    const name = doc.getElementsByTagName('name')[0];
    expect(name.textContent).toBe('Alice');

    const tags = doc.getElementsByTagName('tags')[0];
    expect(tags).toBeDefined();
    const items = tags.getElementsByTagName('item');
    expect(items.length).toBe(2);

    const emptyObj = doc.getElementsByTagName('emptyObj')[0];
    expect(emptyObj).toBeDefined();
    expect(emptyObj.childNodes.length).toBe(0);

    const emptyArr = doc.getElementsByTagName('emptyArr')[0];
    expect(emptyArr).toBeDefined();
    expect(emptyArr.childNodes.length).toBe(0);
  });

  it('handles root primitive JSON values', () => {
    const xml = JSONToXMLConverter.convertJsonToXmlString('"hello"', { pretty: false });
    const parser = new DOMParser();
    const doc = parser.parseFromString(xml, 'application/xml');
    const value = doc.getElementsByTagName('value')[0];
    expect(value).toBeDefined();
    expect(value.getAttribute('type')).toBe('string');
    expect(value.textContent).toBe('hello');
  });

  it('preserves invalid XML names using property wrapper', () => {
    const obj = { '123 invalid': 'x' };
    const xml = JSONToXMLConverter.convertJsonToXmlString(obj, { pretty: false });
    const parser = new DOMParser();
    const doc = parser.parseFromString(xml, 'application/xml');
    const prop = doc.getElementsByTagName('property')[0];
    expect(prop).toBeDefined();
    expect(prop.getAttribute('name')).toBe('123 invalid');
    expect(prop.textContent).toBe('x');
  });

  it('represents null values with nil attribute', () => {
    const xml = JSONToXMLConverter.convertJsonToXmlString(JSON.stringify({ a: null }), { pretty: false });
    const parser = new DOMParser();
    const doc = parser.parseFromString(xml, 'application/xml');
    const a = doc.getElementsByTagName('a')[0];
    expect(a.getAttribute('nil')).toBe('true');
  });

  it('throws when maxDepth exceeded', () => {
    const nested = { a: { b: { c: { d: 1 } } } };
    expect(() => JSONToXMLConverter.convertJsonToXmlString(nested, { maxDepth: 1 })).toThrow();
  });
});

describe('XML → JSON Converter', () => {
  it('parses XML primitives, types and nulls', () => {
    const xml = `<root><a type="number">1</a><b type="string">x</b><c nil="true"/></root>`;
    const json = JSONToXMLConverter.convertXmlToJsonString(xml, { pretty: false });
    const parsed = JSON.parse(json);
    expect(parsed.a).toBe(1);
    expect(parsed.b).toBe('x');
    expect(parsed.c).toBeNull();
  });

  it('round-trips JSON -> XML -> JSON for common structures', () => {
    const obj = { person: { name: 'Bob', tags: ['a', 'b'] } };
    const xml = JSONToXMLConverter.convertJsonToXmlString(obj, { pretty: false });
    const json = JSONToXMLConverter.convertXmlToJsonString(xml, { pretty: false });
    const parsed = JSON.parse(json);
    expect(parsed.person.name).toBe('Bob');
    expect(parsed.person.tags).toEqual(['a', 'b']);
  });
});

describe('Swap behavior', () => {
  it('toggles mode, moves output to input, clears output and runs conversion', () => {
    // Create container
    const container = document.createElement('div');
    container.id = 'tool-root';
    document.body.appendChild(container);

    const inst = new JSONToXMLConverter();
    inst.init('tool-root');

    // Set initial mode json-to-xml and input JSON
    inst.optionMode.value = 'json-to-xml';
    inst.updateModeUI();
    inst.inputArea.value = JSON.stringify({ x: 1 });
    // Perform manual convert
    inst.performConversion(false);
    const xmlOut = inst.outputArea.value;
    expect(xmlOut).toContain('<x');

    // Swap: should switch to xml-to-json, set input to previous output and produce JSON
    inst.swap();
    expect(inst.optionMode.value).toBe('xml-to-json');
    expect(inst.inputArea.value).toBe(xmlOut);
    expect(inst.outputArea.value).toContain('"x"');
    const parsed = JSON.parse(inst.outputArea.value);
    // parsed may be object or wrapper; find x inside
    const foundX = parsed.x || (parsed.root && parsed.root.x) || parsed.person?.x;
    expect(foundX === 1 || foundX === '1' || foundX).toBeTruthy();
  });
});
