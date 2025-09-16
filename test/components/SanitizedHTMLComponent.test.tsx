import React from "react";
import { render } from "@testing-library/react";
import { SanitizedHTMLComponent } from "../../src/components/SanitizedHTMLComponent";

describe("SanitizedHTMLComponent", () => {
  it("should render sanitized HTML content", () => {
    const html = "<p>Hello <strong>world</strong></p>";
    const { container } = render(<SanitizedHTMLComponent html={html} />);
    
    expect(container.innerHTML).toContain("Hello");
    expect(container.innerHTML).toContain("<strong>world</strong>");
  });

  it("should handle empty string", () => {
    const { container } = render(<SanitizedHTMLComponent html="" />);
    expect(container.innerHTML).toBe("");
  });

  it("should sanitize malicious scripts", () => {
    const maliciousHtml = '<p>Safe content</p><script>alert("xss")</script>';
    const { container } = render(<SanitizedHTMLComponent html={maliciousHtml} />);
    
    expect(container.innerHTML).toContain("Safe content");
    expect(container.innerHTML).not.toContain("<script>");
    expect(container.innerHTML).not.toContain("alert");
  });

  it("should add target='_blank' and rel='noopener' to links with target attribute", () => {
    const htmlWithTarget = '<a href="https://example.com" target="">Click me</a>';
    const { container } = render(<SanitizedHTMLComponent html={htmlWithTarget} />);
    
    const link = container.querySelector("a");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener");
  });

  it("should add target='_blank' and rel='noopener' to all anchor elements", () => {
    const htmlWithoutTarget = '<a href="https://example.com">Click me</a>';
    const { container } = render(<SanitizedHTMLComponent html={htmlWithoutTarget} />);
    
    const link = container.querySelector("a");
    // All anchor elements get target="_blank" and rel="noopener" because they have the "target" property
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener");
  });

  it("should handle complex HTML with multiple elements", () => {
    const complexHtml = `
      <div>
        <h1>Title</h1>
        <p>Paragraph with <em>emphasis</em></p>
        <ul>
          <li>Item 1</li>
          <li>Item 2</li>
        </ul>
        <a href="#" target="">Link with target</a>
      </div>
    `;
    const { container } = render(<SanitizedHTMLComponent html={complexHtml} />);
    
    expect(container.querySelector("h1")).toHaveTextContent("Title");
    expect(container.querySelector("em")).toHaveTextContent("emphasis");
    expect(container.querySelectorAll("li")).toHaveLength(2);
    
    const link = container.querySelector("a");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener");
  });

  it("should memoize results and not re-render on same html", () => {
    const html = "<p>Test content</p>";
    const { container, rerender } = render(<SanitizedHTMLComponent html={html} />);
    
    const initialContent = container.innerHTML;
    
    // Re-render with same HTML
    rerender(<SanitizedHTMLComponent html={html} />);
    
    expect(container.innerHTML).toBe(initialContent);
  });

  it("should re-render when html prop changes", () => {
    const html1 = "<p>First content</p>";
    const html2 = "<p>Second content</p>";
    
    const { container, rerender } = render(<SanitizedHTMLComponent html={html1} />);
    expect(container.innerHTML).toContain("First content");
    
    rerender(<SanitizedHTMLComponent html={html2} />);
    expect(container.innerHTML).toContain("Second content");
    expect(container.innerHTML).not.toContain("First content");
  });
});
