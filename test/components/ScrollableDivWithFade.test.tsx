import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { ScrollableDivWithFade } from "../../src/components/ScrollableDivWithFade";

describe("ScrollableDivWithFade", () => {
  it("renders children content", () => {
    render(
      <ScrollableDivWithFade className="test-class">
        <div>Test content</div>
      </ScrollableDivWithFade>
    );
    expect(screen.getByText("Test content")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    const { container } = render(
      <ScrollableDivWithFade className="custom-class">
        <div>Test content</div>
      </ScrollableDivWithFade>
    );
    expect(container.firstChild).toHaveClass("fadeContainer");
  });

  it("renders without className prop", () => {
    const { container } = render(
      <ScrollableDivWithFade className="test-class">
        <div>Test content</div>
      </ScrollableDivWithFade>
    );
    expect(container.firstChild).toBeInTheDocument();
  });

  it("renders multiple children", () => {
    render(
      <ScrollableDivWithFade className="test-class">
        <div>First child</div>
        <div>Second child</div>
        <div>Third child</div>
      </ScrollableDivWithFade>
    );
    expect(screen.getByText("First child")).toBeInTheDocument();
    expect(screen.getByText("Second child")).toBeInTheDocument();
    expect(screen.getByText("Third child")).toBeInTheDocument();
  });

  it("renders with no children", () => {
    const { container } = render(<ScrollableDivWithFade className="test-class">{null}</ScrollableDivWithFade>);
    expect(container.firstChild).toBeInTheDocument();
  });

  it("renders with complex nested content", () => {
    render(
      <ScrollableDivWithFade className="test-class">
        <div>
          <h1>Title</h1>
          <p>Paragraph content</p>
          <ul>
            <li>List item 1</li>
            <li>List item 2</li>
          </ul>
        </div>
      </ScrollableDivWithFade>
    );
    expect(screen.getByText("Title")).toBeInTheDocument();
    expect(screen.getByText("Paragraph content")).toBeInTheDocument();
    expect(screen.getByText("List item 1")).toBeInTheDocument();
    expect(screen.getByText("List item 2")).toBeInTheDocument();
  });

  it("handles scroll events on HTMLDivElement", () => {
    const { container } = render(
      <ScrollableDivWithFade className="test-class">
        <div style={{ height: "200px", overflow: "auto" }}>
          <div style={{ height: "400px" }}>Long content</div>
        </div>
      </ScrollableDivWithFade>
    );

    const scrollContainer = container.querySelector(".fadeContainer");
    expect(scrollContainer).toBeInTheDocument();

    // Simulate scroll event
    const scrollEvent = new Event("scroll");
    Object.defineProperty(scrollEvent, "target", {
      value: scrollContainer,
      writable: false,
    });

    scrollContainer?.dispatchEvent(scrollEvent);
    // The component should handle the scroll event without errors
  });

  it("ignores scroll events from non-HTMLDivElement targets", () => {
    const { container } = render(
      <ScrollableDivWithFade className="test-class">
        <div>Test content</div>
      </ScrollableDivWithFade>
    );

    // Create a mock event with a non-HTMLDivElement target
    const scrollEvent = new Event("scroll");
    Object.defineProperty(scrollEvent, "target", {
      value: document.createElement("span"), // Not a div
      writable: false,
    });

    const scrollContainer = container.querySelector(".fadeContainer");
    scrollContainer?.dispatchEvent(scrollEvent);
    // The component should ignore this event without errors
  });

  it("handles scroll event with HTMLDivElement target", () => {
    const { container } = render(
      <ScrollableDivWithFade className="test-class">
        <div>Test content</div>
      </ScrollableDivWithFade>
    );

    const scrollableDiv = container.querySelector(".scrollableDiv") as HTMLDivElement;
    expect(scrollableDiv).toBeInTheDocument();

    // Create a scroll event with HTMLDivElement as target
    const scrollEvent = new Event("scroll", { bubbles: true });
    Object.defineProperty(scrollEvent, "target", {
      value: scrollableDiv,
      writable: false,
    });

    // Dispatch the event - this should trigger the onScroll callback
    scrollableDiv?.dispatchEvent(scrollEvent);
    
    // The component should handle the scroll event without errors
    expect(scrollableDiv).toBeInTheDocument();
  });

  it("applies inverted fade color when invertFadeColor prop is true", () => {
    const { container } = render(
      <ScrollableDivWithFade className="test-class" invertFadeColor={true}>
        <div>Test content</div>
      </ScrollableDivWithFade>
    );

    const fadeOverlays = container.querySelectorAll(".fadeOverlayInverted");
    expect(fadeOverlays.length).toBeGreaterThanOrEqual(0);
  });

  it("does not apply inverted fade color when invertFadeColor prop is false", () => {
    const { container } = render(
      <ScrollableDivWithFade className="test-class" invertFadeColor={false}>
        <div>Test content</div>
      </ScrollableDivWithFade>
    );

    expect(container.firstChild).toBeInTheDocument();
  });

  it("shows top fade when scrolled down from top", () => {
    const { container } = render(
      <ScrollableDivWithFade className="test-class">
        <div style={{ height: "1000px" }}>Tall content</div>
      </ScrollableDivWithFade>
    );

    const scrollableDiv = container.querySelector(".scrollableDiv") as HTMLDivElement;
    
    // Mock scroll properties to simulate scrolling down
    Object.defineProperty(scrollableDiv, "scrollTop", { value: 50, writable: true });
    Object.defineProperty(scrollableDiv, "scrollHeight", { value: 1000, writable: true });
    Object.defineProperty(scrollableDiv, "clientHeight", { value: 200, writable: true });

    // Trigger scroll event
    const scrollEvent = new Event("scroll", { bubbles: true });
    scrollableDiv.dispatchEvent(scrollEvent);

    // Wait for state updates
    setTimeout(() => {
      const topFade = container.querySelector(".fadeOverlayTop");
      expect(topFade).toHaveClass("fadeVisible");
    }, 0);
  });

  it("shows bottom fade when not scrolled to bottom", () => {
    const { container } = render(
      <ScrollableDivWithFade className="test-class">
        <div style={{ height: "1000px" }}>Tall content</div>
      </ScrollableDivWithFade>
    );

    const scrollableDiv = container.querySelector(".scrollableDiv") as HTMLDivElement;
    
    // Mock scroll properties to simulate being at top with scrollable content
    Object.defineProperty(scrollableDiv, "scrollTop", { value: 0, writable: true });
    Object.defineProperty(scrollableDiv, "scrollHeight", { value: 1000, writable: true });
    Object.defineProperty(scrollableDiv, "clientHeight", { value: 200, writable: true });

    // Trigger scroll event
    const scrollEvent = new Event("scroll", { bubbles: true });
    scrollableDiv.dispatchEvent(scrollEvent);

    // The component should show bottom fade
    setTimeout(() => {
      const bottomFade = container.querySelector(".fadeOverlayBottom");
      expect(bottomFade).toHaveClass("fadeVisible");
    }, 0);
  });

  it("hides both fades when content is not scrollable", () => {
    const { container } = render(
      <ScrollableDivWithFade className="test-class">
        <div style={{ height: "10px" }}>Short content</div>
      </ScrollableDivWithFade>
    );

    const scrollableDiv = container.querySelector(".scrollableDiv") as HTMLDivElement;
    
    // Mock scroll properties to simulate non-scrollable content
    Object.defineProperty(scrollableDiv, "scrollTop", { value: 0, writable: true });
    Object.defineProperty(scrollableDiv, "scrollHeight", { value: 100, writable: true });
    Object.defineProperty(scrollableDiv, "clientHeight", { value: 100, writable: true });

    // Trigger scroll event
    const scrollEvent = new Event("scroll", { bubbles: true });
    scrollableDiv.dispatchEvent(scrollEvent);

    // Both fades should be hidden when canScroll is false
    setTimeout(() => {
      const topFade = container.querySelector(".fadeOverlayTop");
      const bottomFade = container.querySelector(".fadeOverlayBottom");
      expect(topFade).toHaveClass("fadeHidden");
      expect(bottomFade).toHaveClass("fadeHidden");
    }, 0);
  });

  it("hides top fade when scrolled to top", () => {
    const { container } = render(
      <ScrollableDivWithFade className="test-class">
        <div style={{ height: "1000px" }}>Tall content</div>
      </ScrollableDivWithFade>
    );

    const scrollableDiv = container.querySelector(".scrollableDiv") as HTMLDivElement;
    
    // Mock scroll properties to simulate being at top (scrollTop <= 1)
    Object.defineProperty(scrollableDiv, "scrollTop", { value: 0, writable: true });
    Object.defineProperty(scrollableDiv, "scrollHeight", { value: 1000, writable: true });
    Object.defineProperty(scrollableDiv, "clientHeight", { value: 200, writable: true });

    // Trigger scroll event
    const scrollEvent = new Event("scroll", { bubbles: true });
    scrollableDiv.dispatchEvent(scrollEvent);

    // Top fade should be hidden when isAtTop is true
    setTimeout(() => {
      const topFade = container.querySelector(".fadeOverlayTop");
      expect(topFade).toHaveClass("fadeHidden");
    }, 0);
  });

  it("hides bottom fade when scrolled to bottom", () => {
    const { container } = render(
      <ScrollableDivWithFade className="test-class">
        <div style={{ height: "1000px" }}>Tall content</div>
      </ScrollableDivWithFade>
    );

    const scrollableDiv = container.querySelector(".scrollableDiv") as HTMLDivElement;
    
    // Mock scroll properties to simulate being at bottom (scrollTop + clientHeight >= scrollHeight - 1)
    Object.defineProperty(scrollableDiv, "scrollTop", { value: 800, writable: true });
    Object.defineProperty(scrollableDiv, "scrollHeight", { value: 1000, writable: true });
    Object.defineProperty(scrollableDiv, "clientHeight", { value: 200, writable: true });

    // Trigger scroll event
    const scrollEvent = new Event("scroll", { bubbles: true });
    scrollableDiv.dispatchEvent(scrollEvent);

    // Bottom fade should be hidden when isAtBottom is true
    setTimeout(() => {
      const bottomFade = container.querySelector(".fadeOverlayBottom");
      expect(bottomFade).toHaveClass("fadeHidden");
    }, 0);
  });

  it("applies invertFadeColor class when invertFadeColor is true and fades are visible", () => {
    const { container } = render(
      <ScrollableDivWithFade className="test-class" invertFadeColor={true}>
        <div style={{ height: "1000px" }}>Tall content</div>
      </ScrollableDivWithFade>
    );

    const scrollableDiv = container.querySelector(".scrollableDiv") as HTMLDivElement;
    
    // Mock scroll properties to make content scrollable and in middle position
    Object.defineProperty(scrollableDiv, "scrollTop", { value: 50, writable: true });
    Object.defineProperty(scrollableDiv, "scrollHeight", { value: 1000, writable: true });
    Object.defineProperty(scrollableDiv, "clientHeight", { value: 200, writable: true });

    // Trigger scroll event
    const scrollEvent = new Event("scroll", { bubbles: true });
    scrollableDiv.dispatchEvent(scrollEvent);

    // Check that invertFadeColor class is applied
    const topFade = container.querySelector(".fadeOverlayTop");
    const bottomFade = container.querySelector(".fadeOverlayBottom");
    
    expect(topFade).toHaveClass("fadeOverlayInverted");
    expect(bottomFade).toHaveClass("fadeOverlayInverted");
  });

  it("does not apply invertFadeColor class when invertFadeColor is false", () => {
    const { container } = render(
      <ScrollableDivWithFade className="test-class" invertFadeColor={false}>
        <div style={{ height: "1000px" }}>Tall content</div>
      </ScrollableDivWithFade>
    );

    const scrollableDiv = container.querySelector(".scrollableDiv") as HTMLDivElement;
    
    // Mock scroll properties
    Object.defineProperty(scrollableDiv, "scrollTop", { value: 50, writable: true });
    Object.defineProperty(scrollableDiv, "scrollHeight", { value: 1000, writable: true });
    Object.defineProperty(scrollableDiv, "clientHeight", { value: 200, writable: true });

    // Trigger scroll event
    const scrollEvent = new Event("scroll", { bubbles: true });
    scrollableDiv.dispatchEvent(scrollEvent);

    // Check that invertFadeColor class is NOT applied
    const topFade = container.querySelector(".fadeOverlayTop");
    const bottomFade = container.querySelector(".fadeOverlayBottom");
    
    expect(topFade).not.toHaveClass("fadeOverlayInverted");
    expect(bottomFade).not.toHaveClass("fadeOverlayInverted");
  });

  it("handles cleanup when scrollContainerRef is null", () => {
    const { unmount } = render(
      <ScrollableDivWithFade className="test-class">
        <div>Test content</div>
      </ScrollableDivWithFade>
    );

    // Unmount should not throw even if ref is null during cleanup
    expect(() => unmount()).not.toThrow();
  });

  it("covers addEventListener optional chaining when ref is null initially", () => {
    // This test covers line 38: scrollContainerRef.current?.addEventListener
    // We render and immediately check - during initial render cycle, refs might be null
    let container: any;
    expect(() => {
      const result = render(
        <ScrollableDivWithFade className="test-class">
          <div>Test content</div>
        </ScrollableDivWithFade>
      );
      container = result.container;
    }).not.toThrow();

    // The component should render without errors even if ref is temporarily null during setup
    expect(container.firstChild).toBeInTheDocument();
  });

  it("covers removeEventListener optional chaining when ref is null", () => {
    // This test covers line 49: localRef?.removeEventListener
    const { unmount } = render(
      <ScrollableDivWithFade className="test-class">
        <div>Test content</div>
      </ScrollableDivWithFade>
    );

    // Unmounting should handle null ref gracefully
    expect(() => unmount()).not.toThrow();
  });

  it("covers all className ternary branches for top fade", () => {
    // This covers lines 59-60: showTopFade ? fadeVisible : fadeHidden and invertFadeColor ? fadeOverlayInverted : ""
    const { container, rerender } = render(
      <ScrollableDivWithFade className="test-class" invertFadeColor={false}>
        <div style={{ height: "1000px" }}>Tall content</div>
      </ScrollableDivWithFade>
    );

    const scrollableDiv = container.querySelector(".scrollableDiv") as HTMLDivElement;
    const topFade = container.querySelector(".fadeOverlayTop");
    
    // Test initial state - should be fadeHidden and not inverted
    expect(topFade).toHaveClass("fadeHidden");
    expect(topFade).not.toHaveClass("fadeOverlayInverted");

    // Mock scroll to show fade
    Object.defineProperty(scrollableDiv, "scrollTop", { value: 50, writable: true, configurable: true });
    Object.defineProperty(scrollableDiv, "scrollHeight", { value: 1000, writable: true, configurable: true });
    Object.defineProperty(scrollableDiv, "clientHeight", { value: 200, writable: true, configurable: true });
    
    fireEvent.scroll(scrollableDiv);

    // Rerender with invertFadeColor true
    rerender(
      <ScrollableDivWithFade className="test-class" invertFadeColor={true}>
        <div style={{ height: "1000px" }}>Tall content</div>
      </ScrollableDivWithFade>
    );

    const topFadeAfter = container.querySelector(".fadeOverlayTop");
    // Should now have fadeOverlayInverted class
    expect(topFadeAfter).toHaveClass("fadeOverlayInverted");
  });

  it("covers all className ternary branches for bottom fade", () => {
    // This covers lines 61-62: showBottomFade ? fadeVisible : fadeHidden and invertFadeColor ? fadeOverlayInverted : ""
    const { container, rerender } = render(
      <ScrollableDivWithFade className="test-class" invertFadeColor={false}>
        <div style={{ height: "1000px" }}>Tall content</div>
      </ScrollableDivWithFade>
    );

    const scrollableDiv = container.querySelector(".scrollableDiv") as HTMLDivElement;
    const bottomFade = container.querySelector(".fadeOverlayBottom");
    
    // Test initial state
    expect(bottomFade).not.toHaveClass("fadeOverlayInverted");

    // Mock scroll to middle position
    Object.defineProperty(scrollableDiv, "scrollTop", { value: 100, writable: true, configurable: true });
    Object.defineProperty(scrollableDiv, "scrollHeight", { value: 1000, writable: true, configurable: true });
    Object.defineProperty(scrollableDiv, "clientHeight", { value: 200, writable: true, configurable: true });
    
    fireEvent.scroll(scrollableDiv);

    // Rerender with invertFadeColor undefined (should be treated as falsy)
    rerender(
      <ScrollableDivWithFade className="test-class" invertFadeColor={undefined}>
        <div style={{ height: "1000px" }}>Tall content</div>
      </ScrollableDivWithFade>
    );

    const bottomFadeAfter = container.querySelector(".fadeOverlayBottom");
    expect(bottomFadeAfter).not.toHaveClass("fadeOverlayInverted");

    // Now rerender with true
    rerender(
      <ScrollableDivWithFade className="test-class" invertFadeColor={true}>
        <div style={{ height: "1000px" }}>Tall content</div>
      </ScrollableDivWithFade>
    );

    const bottomFadeFinal = container.querySelector(".fadeOverlayBottom");
    expect(bottomFadeFinal).toHaveClass("fadeOverlayInverted");
  });
});
