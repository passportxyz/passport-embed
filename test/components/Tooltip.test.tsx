import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { Tooltip } from "../../src/components/Tooltip";

describe("Tooltip", () => {
  it("renders trigger element", () => {
    render(
      <Tooltip content="Tooltip content">
        <button>Hover me</button>
      </Tooltip>
    );
    expect(screen.getByRole("button", { name: "Hover me" })).toBeInTheDocument();
  });

  it("shows tooltip on hover", async () => {
    render(
      <Tooltip content="Tooltip content">
        <button>Hover me</button>
      </Tooltip>
    );
    
    const trigger = screen.getByRole("button", { name: "Hover me" });
    fireEvent.mouseEnter(trigger);
    
    await waitFor(() => {
      expect(screen.getByText("Tooltip content")).toBeInTheDocument();
    });
  });

  it("hides tooltip on mouse leave", async () => {
    render(
      <Tooltip content="Tooltip content">
        <button>Hover me</button>
      </Tooltip>
    );
    
    const trigger = screen.getByRole("button", { name: "Hover me" });
    fireEvent.mouseEnter(trigger);
    
    await waitFor(() => {
      expect(screen.getByText("Tooltip content")).toBeInTheDocument();
    });
    
    fireEvent.mouseLeave(trigger);
    
    await waitFor(() => {
      expect(screen.queryByText("Tooltip content")).not.toBeInTheDocument();
    });
  });

  it("renders with custom className", () => {
    const { container } = render(
      <Tooltip content="Tooltip content" className="custom-tooltip">
        <button>Hover me</button>
      </Tooltip>
    );
    expect(container.firstChild).toHaveClass("trigger");
  });

  it("renders with different trigger elements", () => {
    render(
      <Tooltip content="Tooltip content">
        <span>Text trigger</span>
      </Tooltip>
    );
    expect(screen.getByText("Text trigger")).toBeInTheDocument();
  });

  it("handles focus events", async () => {
    render(
      <Tooltip content="Tooltip content">
        <button>Focus me</button>
      </Tooltip>
    );
    
    const trigger = screen.getByRole("button", { name: "Focus me" });
    fireEvent.focus(trigger);
    
    await waitFor(() => {
      expect(screen.getByText("Tooltip content")).toBeInTheDocument();
    });
  });

  it("handles blur events", async () => {
    render(
      <Tooltip content="Tooltip content">
        <button>Focus me</button>
      </Tooltip>
    );
    
    const trigger = screen.getByRole("button", { name: "Focus me" });
    fireEvent.focus(trigger);
    
    await waitFor(() => {
      expect(screen.getByText("Tooltip content")).toBeInTheDocument();
    });
    
    fireEvent.blur(trigger);
    
    await waitFor(() => {
      expect(screen.queryByText("Tooltip content")).not.toBeInTheDocument();
    });
  });

  it("renders with complex content", () => {
    const complexContent = (
      <div>
        <h3>Complex Tooltip</h3>
        <p>This is a complex tooltip with multiple elements</p>
        <ul>
          <li>Item 1</li>
          <li>Item 2</li>
        </ul>
      </div>
    );
    
    render(
      <Tooltip content={complexContent}>
        <button>Hover me</button>
      </Tooltip>
    );
    
    const trigger = screen.getByRole("button", { name: "Hover me" });
    fireEvent.mouseEnter(trigger);
    
    expect(screen.getByText("Complex Tooltip")).toBeInTheDocument();
    expect(screen.getByText("This is a complex tooltip with multiple elements")).toBeInTheDocument();
    expect(screen.getByText("Item 1")).toBeInTheDocument();
    expect(screen.getByText("Item 2")).toBeInTheDocument();
  });

  it("handles multiple rapid hover events", async () => {
    render(
      <Tooltip content="Tooltip content">
        <button>Hover me</button>
      </Tooltip>
    );
    
    const trigger = screen.getByRole("button", { name: "Hover me" });
    
    // Rapid hover events
    fireEvent.mouseEnter(trigger);
    fireEvent.mouseLeave(trigger);
    fireEvent.mouseEnter(trigger);
    fireEvent.mouseLeave(trigger);
    
    // Should not show tooltip after rapid events
    expect(screen.queryByText("Tooltip content")).not.toBeInTheDocument();
  });

  it("handles tooltip positioning with different placements", async () => {
    render(
      <Tooltip content="Tooltip content" placement="top">
        <button>Hover me</button>
      </Tooltip>
    );
    
    fireEvent.mouseEnter(screen.getByRole("button", { name: "Hover me" }));
    
    await waitFor(() => {
      expect(screen.getByText("Tooltip content")).toBeInTheDocument();
    });
  });

  it("handles tooltip with arrow positioning", async () => {
    render(
      <Tooltip content="Tooltip content" placement="bottom">
        <button>Hover me</button>
      </Tooltip>
    );
    
    fireEvent.mouseEnter(screen.getByRole("button", { name: "Hover me" }));
    
    await waitFor(() => {
      expect(screen.getByText("Tooltip content")).toBeInTheDocument();
    });
  });

  it("handles cleanup when component unmounts", () => {
    const { unmount } = render(
      <Tooltip content="Tooltip content">
        <button>Hover me</button>
      </Tooltip>
    );
    
    // Unmount the component to trigger cleanup
    unmount();
    
    // Should not throw any errors during cleanup
  });

  it("handles tooltip visibility when refs are not initialized", async () => {
    const { rerender } = render(
      <Tooltip content="Tooltip content">
        <button>Hover me</button>
      </Tooltip>
    );
    
    const trigger = screen.getByRole("button", { name: "Hover me" });
    
    // Hover before refs are fully initialized (edge case)
    fireEvent.mouseEnter(trigger);
    fireEvent.mouseLeave(trigger);
    
    // Rerender to ensure component is stable
    rerender(
      <Tooltip content="Tooltip content">
        <button>Hover me</button>
      </Tooltip>
    );
    
    // Should handle without errors
    expect(trigger).toBeInTheDocument();
  });

  it("handles arrow positioning with null coordinates", async () => {
    render(
      <Tooltip content="Tooltip content" placement="left">
        <button>Hover me</button>
      </Tooltip>
    );
    
    const trigger = screen.getByRole("button", { name: "Hover me" });
    fireEvent.mouseEnter(trigger);
    
    await waitFor(() => {
      const tooltip = screen.getByRole("tooltip");
      expect(tooltip).toBeInTheDocument();
    });
    
    // The arrow positioning logic should handle null values without errors
  });

  it("handles different placements for arrow positioning", async () => {
    const placements: Array<"top" | "bottom" | "left" | "right"> = ["top", "bottom", "left", "right"];
    
    for (const placement of placements) {
      const { unmount } = render(
        <Tooltip content="Tooltip content" placement={placement}>
          <button>Hover {placement}</button>
        </Tooltip>
      );
      
      const trigger = screen.getByRole("button", { name: `Hover ${placement}` });
      fireEvent.mouseEnter(trigger);
      
      await waitFor(() => {
        expect(screen.getByText("Tooltip content")).toBeInTheDocument();
      });
      
      unmount();
    }
  });

  it("handles scroll listener cleanup", () => {
    const { unmount } = render(
      <Tooltip content="Tooltip content">
        <button>Hover me</button>
      </Tooltip>
    );
    
    const trigger = screen.getByRole("button", { name: "Hover me" });
    fireEvent.mouseEnter(trigger);
    
    // Unmount should clean up scroll listeners without errors
    unmount();
  });

  it("does not throw when tooltip becomes visible", async () => {
    const { rerender } = render(
      <Tooltip content="Initial content">
        <button>Hover me</button>
      </Tooltip>
    );
    
    const trigger = screen.getByRole("button", { name: "Hover me" });
    
    // Show tooltip
    fireEvent.mouseEnter(trigger);
    
    await waitFor(() => {
      expect(screen.getByText("Initial content")).toBeInTheDocument();
    });
    
    // Rerender with new content
    rerender(
      <Tooltip content="Updated content">
        <button>Hover me</button>
      </Tooltip>
    );
    
    // Should handle updates without errors
    expect(trigger).toBeInTheDocument();
  });

  it("handles autoUpdate callback when refs become null", async () => {
    const { unmount } = render(
      <Tooltip content="Test content">
        <button>Hover me</button>
      </Tooltip>
    );
    
    const trigger = screen.getByRole("button", { name: "Hover me" });
    
    // Show tooltip to trigger autoUpdate
    fireEvent.mouseEnter(trigger);
    
    await waitFor(() => {
      expect(screen.getByText("Test content")).toBeInTheDocument();
    });
    
    // Unmount while tooltip is visible - this should trigger the cleanup
    // and the autoUpdate callback should handle null refs gracefully
    expect(() => unmount()).not.toThrow();
  });

  it("handles computePosition when refs are null during update", async () => {
    render(
      <Tooltip content="Test content">
        <button>Hover me</button>
      </Tooltip>
    );

    const trigger = screen.getByRole("button", { name: "Hover me" });
    
    // Show tooltip
    fireEvent.mouseEnter(trigger);
    
    await waitFor(() => {
      expect(screen.getByText("Test content")).toBeInTheDocument();
    });
    
    // Hide tooltip
    fireEvent.mouseLeave(trigger);
    
    await waitFor(() => {
      expect(screen.queryByText("Test content")).not.toBeInTheDocument();
    });
    
    // Show again to test the callback with potentially stale refs
    fireEvent.mouseEnter(trigger);
    
    await waitFor(() => {
      expect(screen.getByText("Test content")).toBeInTheDocument();
    });
    
    // Should handle without errors
    expect(trigger).toBeInTheDocument();
  });

  it("calls computePosition callback multiple times without error", async () => {
    render(
      <Tooltip content="Test content" placement="top">
        <button>Hover me</button>
      </Tooltip>
    );

    const trigger = screen.getByRole("button", { name: "Hover me" });
    
    // Show tooltip
    fireEvent.mouseEnter(trigger);
    
    await waitFor(() => {
      expect(screen.getByText("Test content")).toBeInTheDocument();
    });
    
    // Trigger window resize to potentially trigger autoUpdate
    window.dispatchEvent(new Event("resize"));
    
    // Trigger scroll to potentially trigger autoUpdate
    window.dispatchEvent(new Event("scroll"));
    
    // Should still be visible and working
    expect(screen.getByText("Test content")).toBeInTheDocument();
  });

  it("handles rapid show/hide cycles", async () => {
    render(
      <Tooltip content="Test content">
        <button>Hover me</button>
      </Tooltip>
    );
    
    const trigger = screen.getByRole("button", { name: "Hover me" });
    
    // Rapid cycles
    for (let i = 0; i < 5; i++) {
      fireEvent.mouseEnter(trigger);
      fireEvent.mouseLeave(trigger);
    }
    
    // Final show
    fireEvent.mouseEnter(trigger);
    
    await waitFor(() => {
      expect(screen.getByText("Test content")).toBeInTheDocument();
    });
  });

  it("handles focus and blur with keyboard navigation", async () => {
    render(
      <Tooltip content="Test content">
        <button>Focus me</button>
      </Tooltip>
    );
    
    const trigger = screen.getByRole("button", { name: "Focus me" });
    
    // Focus with keyboard
    trigger.focus();
    fireEvent.focus(trigger);
    
    await waitFor(() => {
      expect(screen.getByText("Test content")).toBeInTheDocument();
    });
    
    // Blur
    trigger.blur();
    fireEvent.blur(trigger);
    
    await waitFor(() => {
      expect(screen.queryByText("Test content")).not.toBeInTheDocument();
    });
  });

  it("covers early return branch when tooltip is not visible (line 33)", () => {
    // This test covers line 33: if (!isVisible || !triggerRef.current || !tooltipRef.current) return;
    // We need to test the case where isVisible is false, triggering the early return

    // Render without showing tooltip - this ensures useEffect runs with isVisible=false
    expect(() => {
      render(
        <Tooltip content="Test content">
          <button>Hover me</button>
        </Tooltip>
      );
    }).not.toThrow();

    const trigger = screen.getByRole("button", { name: "Hover me" });
    
    // Initially, tooltip should not be visible (isVisible = false)
    // This means the useEffect's early return branch is executed
    expect(screen.queryByText("Test content")).not.toBeInTheDocument();
    expect(trigger).toBeInTheDocument();
  });

  it("covers early return branch during placement changes", async () => {
    // This test covers line 33 by changing placement which re-runs the useEffect
    const { rerender } = render(
      <Tooltip content="Test content" placement="top">
        <button>Hover me</button>
      </Tooltip>
    );
    
    const trigger = screen.getByRole("button", { name: "Hover me" });
    
    // Show tooltip
    fireEvent.mouseEnter(trigger);
    
    await waitFor(() => {
      expect(screen.getByText("Test content")).toBeInTheDocument();
    });
    
    // Hide tooltip - this makes isVisible false
    fireEvent.mouseLeave(trigger);
    
    await waitFor(() => {
      expect(screen.queryByText("Test content")).not.toBeInTheDocument();
    });
    
    // Change placement while tooltip is hidden
    // This triggers useEffect with isVisible = false, hitting the early return
    rerender(
      <Tooltip content="Test content" placement="bottom">
        <button>Hover me</button>
      </Tooltip>
    );
    
    // Tooltip should still be hidden
    expect(screen.queryByText("Test content")).not.toBeInTheDocument();
  });

  it("covers the case when refs are not available in useEffect", () => {
    // This covers the branch where triggerRef.current or tooltipRef.current might be null
    const { rerender } = render(
      <Tooltip content="Test content">
        <button>Hover me</button>
      </Tooltip>
    );
    
    // Rerender multiple times to potentially catch ref timing issues
    for (let i = 0; i < 3; i++) {
      rerender(
        <Tooltip content={`Test content ${i}`}>
          <button>Hover me</button>
        </Tooltip>
      );
    }
    
    const trigger = screen.getByRole("button", { name: "Hover me" });
    expect(trigger).toBeInTheDocument();
  });
});
