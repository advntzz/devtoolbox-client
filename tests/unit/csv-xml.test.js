import { describe, it, expect } from 'vitest';
import { CSVXMLConverter } from '../../js/tools/csv-xml.js';

describe('CSV → XML basic', () => {
  it('converts simple CSV to XML', () => {
    const inst = new CSVXMLConverter();
    // emulate DOM environment
    const csv = 'name,age,city\nDom,20,Yogyakarta\nNayla,20,Jakarta';
    const xml = inst.convertCsvToXml(csv);
    expect(xml).toContain('<rows');
    expect(xml).toContain('<row>');
    expect(xml).toContain('<name>Dom</name>');
  });

  it('handles quoted fields with commas', () => {
    const inst = new CSVXMLConverter();
    const csv = 'name,notes\n"Doe, John","He said ""hello"" to her"';
    const xml = inst.convertCsvToXml(csv);
    expect(xml).toContain('&quot;hello&quot;');
    expect(xml).toContain('Doe, John');
  });

  it('throws on mismatched columns', () => {
    const inst = new CSVXMLConverter();
    const csv = 'a,b\n1,2\n3';
    expect(() => inst.convertCsvToXml(csv)).toThrow();
  });
});

describe('XML → CSV basic', () => {
  it('converts simple XML to CSV', () => {
    const inst = new CSVXMLConverter();
    const xml = `<rows><row><name>Dom</name><age>20</age></row><row><name>Nayla</name><age>20</age></row></rows>`;
    const csv = inst.convertXmlToCsv(xml);
    expect(csv).toContain('name,age');
    expect(csv).toContain('Dom,20');
  });

  it('handles repeated child elements', () => {
    const inst = new CSVXMLConverter();
    const xml = `<rows><row><tag>a</tag><tag>b</tag></row></rows>`;
    const csv = inst.convertXmlToCsv(xml);
    expect(csv).toContain('tag,tag_2');
    expect(csv).toContain('a,b');
  });
});
