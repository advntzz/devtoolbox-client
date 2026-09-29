import { describe, it, expect, beforeEach } from "vitest";
import { CSSFormatterTool } from "../../js/tools/css-formatter.js";

describe("CSSFormatterTool", () => {
  let tool;

  beforeEach(() => {
    tool = new CSSFormatterTool();

    // Minimal DOM-like refs needed by format/minify/updateStats.
    tool.inputArea = { value: "" };
    tool.outputArea = { value: "" };
    tool.status = {
      textContent: "",
      className: "",
    };
    tool.stats = {
      textContent: "",
    };
    tool.commentsCheckbox = {
      checked: true,
    };
    tool.indentMode = "2";
  });

  it("should export a tool class", () => {
    expect(CSSFormatterTool).toBeDefined();
    expect(typeof CSSFormatterTool).toBe("function");
  });

  it("should beautify basic CSS with 2 spaces", () => {
    const result = tool.beautifyCSS(".box{color:red;background:#fff}", {
      indent: "  ",
    });

    expect(result).toContain(".box {");
    expect(result).toContain("  color:red;");
    expect(result).toContain("  background:#fff;");
  });

  it("should minify basic CSS", () => {
    tool.inputArea.value = "body { color: red; background: #fff; }";

    tool.minify();

    const result = tool.outputArea.value;

    expect(result).toContain("color:red");
    expect(result).toContain("background:#fff");
    expect(result.length).toBeLessThan(tool.inputArea.value.length);
  });

  it("should format separate selectors with indentation", () => {
    const input = ".parent .child{color:red}.parent .sibling{display:block}";

    const result = tool.beautifyCSS(input, {
      indent: "  ",
    });

    expect(result).toContain(".parent .child {");
    expect(result).toContain(".parent .sibling {");
    expect(result).toContain("  color:red;");
    expect(result).toContain("  display:block;");
  });

  it("should format media queries with proper indentation", () => {
    const input = "@media (min-width: 768px){.card{width:50%}}";

    const result = tool.beautifyCSS(input, {
      indent: "  ",
    });

    expect(result).toContain("@media (min-width: 768px) {");
    expect(result).toContain("  .card {");
    expect(result).toContain("    width:50%;");
  });

  it("should preserve custom properties", () => {
    const input = ":root{--primary-color:#0af;--gap:12px;}";

    const result = tool.beautifyCSS(input, {
      indent: "  ",
    });

    expect(result).toContain(":root {");
    expect(result).toContain("  --primary-color:#0af;");
    expect(result).toContain("  --gap:12px;");
  });

  it("should format keyframes blocks", () => {
    const input = "@keyframes fade{0%{opacity:0}100%{opacity:1}}";

    const result = tool.beautifyCSS(input, {
      indent: "  ",
    });

    expect(result).toContain("@keyframes fade {");
    expect(result).toContain("  0% {");
    expect(result).toContain("  100% {");
    expect(result).toContain("    opacity:1;");
  });

  it("should preserve comments during beautify", () => {
    const input = ".btn{color:red;/* comment */background:blue;}";

    const result = tool.beautifyCSS(input, {
      indent: "  ",
      preserveComments: true,
    });

    expect(result).toContain("/* comment */");
    expect(result).toContain("background:blue;");
  });

  it("should strip comments when minifying with preserveComments disabled", () => {
    tool.inputArea.value = ".btn{color:red;/* comment */background:blue;}";

    tool.commentsCheckbox.checked = false;

    tool.minify();

    const result = tool.outputArea.value;

    expect(result).not.toContain("comment");
    expect(result).toContain("background:#00f");
  });

  it("should report invalid CSS without crashing", () => {
    tool.inputArea.value = "body { color red; }";

    tool.minify();

    expect(tool.outputArea.value).toBe("");
    expect(tool.status.textContent).toMatch(/CSS parse error:/i);
    expect(tool.status.className).toContain("red");
  });

  it("should support 4 spaces indentation", () => {
    const valid =
      ".card{color:red}@media (max-width:600px){.card .btn{color:red}}";

    const result = tool.beautifyCSS(valid, {
      indent: "    ",
    });

    expect(result).toContain("\n    .card .btn {");
    expect(result).toContain("\n        color:red;");
  });

  it("should support tab indentation", () => {
    const valid =
      ".card{color:red}@media (max-width:600px){.card .btn{color:red}}";

    const result = tool.beautifyCSS(valid, {
      indent: "\t",
    });

    expect(result).toContain("\n\t.card .btn {");
    expect(result).toContain("\n\t\tcolor:red;");
  });

  it("should calculate output stats through updateStats", () => {
    tool.inputArea.value = ".card {\n  color: red;\n  background: #fff;\n}";

    tool.minify();

    expect(tool.stats.textContent).toContain("Input:");
    expect(tool.stats.textContent).toContain("Output:");
    expect(tool.stats.textContent).toContain("Change:");
    expect(tool.stats.textContent).not.toContain("NaN");
    expect(tool.stats.textContent).not.toContain("Infinity");
  });

  it("should not execute user input as code", () => {
    tool.inputArea.value =
      ':root{--danger:"javascript:alert(1)";content:"alert(2)"}';

    tool.minify();

    const result = tool.outputArea.value;

    expect(result).toContain("javascript:alert(1)");
    expect(result).toContain("alert(2)");
    expect(result).not.toContain("eval(");
  });
});
