import React from "react";
import { render, screen } from "@testing-library/react";
import { SanitizedHTMLComponent } from "../../src/components/SanitizedHTMLComponent";

describe("SanitizedHTMLComponent", () => {
  it("renders simple HTML content", () => {
    render(<SanitizedHTMLComponent html="<p>Hello World</p>" />);
    expect(screen.getByText("Hello World")).toBeInTheDocument();
  });

  it("renders complex HTML content", () => {
    const html = "<div><h1>Title</h1><p>Content with <strong>bold</strong> text</p></div>";
    render(<SanitizedHTMLComponent html={html} />);
    expect(screen.getByText("Title")).toBeInTheDocument();
    expect(screen.getByText("bold")).toBeInTheDocument();
    // Check that the paragraph contains the expected text
    const paragraph = screen.getByText("bold").closest("p");
    expect(paragraph).toHaveTextContent("Content with bold text");
  });

  it("renders empty HTML without crashing", () => {
    render(<SanitizedHTMLComponent html="" />);
    // Should render without throwing
  });

  it("renders HTML with links", () => {
    const html = '<p>Visit <a href="https://example.com">our site</a> for more info</p>';
    render(<SanitizedHTMLComponent html={html} />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "https://example.com");
    expect(link).toHaveTextContent("our site");
  });

  it("renders HTML with images", () => {
    const html = '<img src="https://example.com/image.jpg" alt="Test image" />';
    render(<SanitizedHTMLComponent html={html} />);
    const image = screen.getByRole("img");
    expect(image).toHaveAttribute("src", "https://example.com/image.jpg");
    expect(image).toHaveAttribute("alt", "Test image");
  });

  it("sanitizes potentially dangerous HTML", () => {
    const html = '<script>alert("xss")</script><p>Safe content</p>';
    render(<SanitizedHTMLComponent html={html} />);
    expect(screen.getByText("Safe content")).toBeInTheDocument();
    // Script tag should be sanitized out
    expect(screen.queryByText('alert("xss")')).not.toBeInTheDocument();
  });

  it("handles malformed HTML gracefully", () => {
    const html = "<p>Unclosed paragraph<div>Nested div</div>";
    render(<SanitizedHTMLComponent html={html} />);
    expect(screen.getByText("Unclosed paragraph")).toBeInTheDocument();
    expect(screen.getByText("Nested div")).toBeInTheDocument();
  });
});
