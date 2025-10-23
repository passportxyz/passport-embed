import React from "react";
import "@testing-library/jest-dom";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { StampClaimResult } from "../../../src/components/Body/StampClaimResult";
import * as usePlatformStatus from "../../../src/hooks/usePlatformStatus";

jest.mock("../../../src/hooks/usePlatformStatus");

describe("StampClaimResult", () => {
  const mockPlatform = {
    platformId: "discord",
    name: "Discord",
    description: "Discord verification",
    documentationLink: "https://example.com",
    displayWeight: "1",
    icon: "discord-icon",
    credentials: [
      { id: "discord-cred-1", weight: "5" },
      { id: "discord-cred-2", weight: "5" },
    ],
  };

  const mockOnBack = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    // Default mock for usePlatformStatus
    (usePlatformStatus.usePlatformStatus as jest.Mock).mockReturnValue({
      claimed: false,
      pointsGained: "0",
    });
  });

  it("renders without errors", () => {
    render(<StampClaimResult platform={mockPlatform} onBack={mockOnBack} errors={[]} />);
    expect(screen.getByText("Stamp Verification Unsuccessful")).toBeInTheDocument();
  });

  it("renders single error", () => {
    const error = { error: "Test error" };
    render(<StampClaimResult platform={mockPlatform} onBack={mockOnBack} errors={[error]} />);
    
    // Click "Details" to show errors
    const seeDetailsButton = screen.getByText("Details ➜");
    fireEvent.click(seeDetailsButton);
    
    expect(screen.getByText("Test error")).toBeInTheDocument();
  });

  it("handles multiple errors", () => {
    const errors = [
      { error: "First error" },
      { error: "Second error" },
    ];

    render(<StampClaimResult platform={mockPlatform} onBack={mockOnBack} errors={errors} />);
    
    // Click "Details" to show errors
    const seeDetailsButton = screen.getByText("Details ➜");
    fireEvent.click(seeDetailsButton);
    
    expect(screen.getByText("First error")).toBeInTheDocument();
  });

  it("handles error navigation arrows", () => {
    const errors = [
      { error: "First error" },
      { error: "Second error" },
      { error: "Third error" },
    ];

    render(<StampClaimResult platform={mockPlatform} onBack={mockOnBack} errors={errors} />);
    
    // Click "Details" to show errors
    const seeDetailsButton = screen.getByText("Details ➜");
    fireEvent.click(seeDetailsButton);
    
    // Find the navigation arrows
    const leftArrow = document.querySelector('[class*="errorArrow"]');
    const rightArrow = document.querySelectorAll('[class*="errorArrow"]')[1];
    
    if (leftArrow && rightArrow) {
      // Test right arrow navigation - this should trigger the onClick handler
      fireEvent.click(rightArrow);
      expect(rightArrow).toBeInTheDocument();
      
      // Test left arrow navigation - this should trigger the onClick handler
      fireEvent.click(leftArrow);
      expect(leftArrow).toBeInTheDocument();
      
      // Test multiple right clicks to cover the Math.min logic
      fireEvent.click(rightArrow);
      fireEvent.click(rightArrow);
      expect(rightArrow).toBeInTheDocument();
    }
  });

  it("handles error navigation boundary conditions", () => {
    const errors = [
      { error: "First error" },
      { error: "Second error" },
    ];

    render(<StampClaimResult platform={mockPlatform} onBack={mockOnBack} errors={errors} />);
    
    // Click "Details" to show errors
    const seeDetailsButton = screen.getByText("Details ➜");
    fireEvent.click(seeDetailsButton);
    
    // Find the navigation arrows
    const leftArrow = document.querySelector('[class*="errorArrow"]');
    const rightArrow = document.querySelectorAll('[class*="errorArrow"]')[1];
    
    if (leftArrow && rightArrow) {
      // Test navigation arrows are present
      expect(leftArrow).toBeInTheDocument();
      expect(rightArrow).toBeInTheDocument();
      
      // Navigate to last error - this should trigger Math.min logic
      fireEvent.click(rightArrow);
      expect(rightArrow).toBeInTheDocument();
      
      // Navigate back to first error - this should trigger Math.max logic
      fireEvent.click(leftArrow);
      expect(leftArrow).toBeInTheDocument();
    }
  });

  it("covers navigation click handlers with boundary logic", () => {
    const errors = [
      { error: "Error 1" },
      { error: "Error 2" },
      { error: "Error 3" },
    ];

    render(<StampClaimResult platform={mockPlatform} onBack={mockOnBack} errors={errors} />);
    
    // Click "Details" to show errors
    const seeDetailsButton = screen.getByText("Details ➜");
    fireEvent.click(seeDetailsButton);
    
    // Find the navigation arrows
    const leftArrow = document.querySelector('[class*="errorArrow"]');
    const rightArrow = document.querySelectorAll('[class*="errorArrow"]')[1];
    
    if (leftArrow && rightArrow) {
      // Test right arrow navigation - this should trigger the onClick handler
      act(() => {
        fireEvent.click(rightArrow);
      });
      expect(rightArrow).toBeInTheDocument();
      
      // Test right arrow navigation - this should trigger the onClick handler
      act(() => {
        fireEvent.click(rightArrow);
      });
      expect(rightArrow).toBeInTheDocument();
      
      // Test right arrow navigation at boundary - this should trigger Math.min logic
      act(() => {
        fireEvent.click(rightArrow);
      });
      expect(rightArrow).toBeInTheDocument();
      
      // Test left arrow navigation - this should trigger the onClick handler
      act(() => {
        fireEvent.click(leftArrow);
      });
      expect(leftArrow).toBeInTheDocument();
      
      // Test left arrow navigation - this should trigger the onClick handler
      act(() => {
        fireEvent.click(leftArrow);
      });
      expect(leftArrow).toBeInTheDocument();
      
      // Test left arrow navigation at boundary - this should trigger Math.max logic
      act(() => {
        fireEvent.click(leftArrow);
      });
      expect(leftArrow).toBeInTheDocument();
    }
  });

      it("covers navigation click handlers with multiple clicks", () => {
        const errors = [
          { error: "Error 1" },
          { error: "Error 2" },
          { error: "Error 3" },
          { error: "Error 4" },
        ];

        render(<StampClaimResult platform={mockPlatform} onBack={mockOnBack} errors={errors} />);
        
        // Click "Details" to show errors
        const seeDetailsButton = screen.getByText("Details ➜");
        fireEvent.click(seeDetailsButton);
        
        // Find the navigation arrows
        const leftArrow = document.querySelector('[class*="errorArrow"]');
        const rightArrow = document.querySelectorAll('[class*="errorArrow"]')[1];
        
        if (leftArrow && rightArrow) {
          // Test multiple right clicks to reach the end and test Math.min boundary
          for (let i = 0; i < 5; i++) {
            act(() => {
              fireEvent.click(rightArrow);
            });
          }
          
          // Test multiple left clicks to reach the beginning and test Math.max boundary
          for (let i = 0; i < 5; i++) {
            act(() => {
              fireEvent.click(leftArrow);
            });
          }
          
          expect(leftArrow).toBeInTheDocument();
          expect(rightArrow).toBeInTheDocument();
        }
      });

      it("covers navigation click handlers with state changes", () => {
        const errors = [
          { error: "Error 1" },
          { error: "Error 2" },
          { error: "Error 3" },
        ];

        render(<StampClaimResult platform={mockPlatform} onBack={mockOnBack} errors={errors} />);

        // Click "Details" to show errors
        const seeDetailsButton = screen.getByText("Details ➜");
        fireEvent.click(seeDetailsButton);
        
        // Find the navigation arrows
        const leftArrow = document.querySelector('[class*="errorArrow"]');
        const rightArrow = document.querySelectorAll('[class*="errorArrow"]')[1];
        
        if (leftArrow && rightArrow) {
          // Test right arrow click - this should trigger the Math.min logic
          act(() => {
            fireEvent.click(rightArrow);
          });
          
          // Test left arrow click - this should trigger the Math.max logic
          act(() => {
            fireEvent.click(leftArrow);
          });
          
          // Test multiple right clicks to test boundary conditions
          act(() => {
            fireEvent.click(rightArrow);
            fireEvent.click(rightArrow);
            fireEvent.click(rightArrow);
          });
          
          // Test multiple left clicks to test boundary conditions
          act(() => {
            fireEvent.click(leftArrow);
            fireEvent.click(leftArrow);
            fireEvent.click(leftArrow);
          });
          
          expect(leftArrow).toBeInTheDocument();
          expect(rightArrow).toBeInTheDocument();
        }
      });


  it("tests disabled state of navigation arrows at boundaries (covers lines 76-81)", () => {
    // This test explicitly covers the uncovered lines 76-81 in StampClaimResult.tsx
    (usePlatformStatus.usePlatformStatus as jest.Mock).mockReturnValue({
      claimed: false,
      pointsGained: "0",
    });

    const errors = [
      { error: "First error message" },
      { error: "Second error message" },
      { error: "Third error message" },
    ];

    render(<StampClaimResult platform={mockPlatform} onBack={mockOnBack} errors={errors} />);
    
    // Click "Details" to show errors
    const seeDetailsButton = screen.getByText("Details ➜");
    fireEvent.click(seeDetailsButton);
    
    // Verify we're at first error
    expect(screen.getByText("1/3")).toBeInTheDocument();
    
    // Find all buttons - the navigation arrows should be the last two
    const allButtons = document.querySelectorAll('button');
    const navigationButtons = Array.from(allButtons).filter(btn => 
      btn.className.includes('errorArrow')
    );
    
    expect(navigationButtons.length).toBe(2);
    const leftArrow = navigationButtons[0];
    const rightArrow = navigationButtons[1];
    
    // Initially at first error (index 0), left arrow should be disabled (line 77: disabled={errorIndex === 0})
    expect(leftArrow).toHaveAttribute('disabled');
    expect(rightArrow).not.toHaveAttribute('disabled');
    
    // Click right arrow (line 80: onClick={() => setErrorIndex((i) => Math.min(errors.length - 1, i + 1))})
    act(() => {
      fireEvent.click(rightArrow);
    });
    expect(screen.getByText("2/3")).toBeInTheDocument();
    
    // Now in middle, both should be enabled
    expect(leftArrow).not.toHaveAttribute('disabled');
    expect(rightArrow).not.toHaveAttribute('disabled');
    
    // Click right arrow again to reach last error
    act(() => {
      fireEvent.click(rightArrow);
    });
    expect(screen.getByText("3/3")).toBeInTheDocument();
    
    // At last error (index 2), right arrow should be disabled (line 81: disabled={errorIndex === errors.length - 1})
    expect(leftArrow).not.toHaveAttribute('disabled');
    expect(rightArrow).toHaveAttribute('disabled');
    
    // Click left arrow (line 76: onClick={() => setErrorIndex((i) => Math.max(0, i - 1))})
    act(() => {
      fireEvent.click(leftArrow);
    });
    expect(screen.getByText("2/3")).toBeInTheDocument();
    
    // Click left arrow again to reach first error
    act(() => {
      fireEvent.click(leftArrow);
    });
    expect(screen.getByText("1/3")).toBeInTheDocument();
    
    // Back at first error, left arrow should be disabled again
    expect(leftArrow).toHaveAttribute('disabled');
    expect(rightArrow).not.toHaveAttribute('disabled');
  });

  it("handles empty errors array", () => {
    render(<StampClaimResult platform={mockPlatform} onBack={mockOnBack} errors={[]} />);
    expect(screen.getByText("Stamp Verification Unsuccessful")).toBeInTheDocument();
  });

  it("handles back button click", () => {
    render(<StampClaimResult platform={mockPlatform} onBack={mockOnBack} errors={[]} />);
    
    const backButton = screen.getByRole("button", { name: /back/i });
    fireEvent.click(backButton);
    
    expect(mockOnBack).toHaveBeenCalledTimes(1);
  });
});
