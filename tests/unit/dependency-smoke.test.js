import { describe, it, expect } from "vitest";

import { load } from "js-yaml";
import { format } from "sql-formatter";
import SparkMD5 from "spark-md5";
import MarkdownIt from "markdown-it";
import DOMPurify from "dompurify";
import aws4 from "aws4-tiny";

describe("Dependency Smoke Test", () => {
  it("js-yaml should work", () => {
    const result = load("name: DevToolbox");
    expect(result.name).toBe("DevToolbox");
  });

  it("sql-formatter should work", () => {
    const result = format("SELECT * FROM users WHERE id = 1");
    expect(result).toContain("SELECT");
  });

  it("spark-md5 should work", () => {
    const hash = SparkMD5.hash("DevToolbox");
    expect(hash).toHaveLength(32);
  });

  it("markdown-it should work", () => {
    const md = new MarkdownIt();
    const result = md.render("# DevToolbox");
    expect(result).toContain("<h1>");
  });

  it("dompurify should work", () => {
    const result = DOMPurify.sanitize("<p>Hello</p>");
    expect(result).toContain("Hello");
  });

  it("aws4-tiny should import", () => {
    expect(aws4).toBeDefined();
  });
});
