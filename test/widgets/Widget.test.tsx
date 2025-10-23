import React from "react";
import { render } from "@testing-library/react";
import { Widget, PassportWidgetTheme } from "../../src/widgets/Widget";
import { usePassportQueryClient } from "../../src/hooks/usePassportQueryClient";

// Mock the usePassportQueryClient hook
jest.mock("../../src/hooks/usePassportQueryClient");
const mockUsePassportQueryClient = usePassportQueryClient as jest.Mock;

describe("Widget", () => {
  const mockQueryClient = {
    setDefaultOptions: jest.fn(),
    clear: jest.fn(),
    invalidateQueries: jest.fn(),
    mount: jest.fn(),
    unmount: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUsePassportQueryClient.mockReturnValue(mockQueryClient);
  });

  it("renders children", () => {
    const { getByText } = render(
      <Widget>
        <div>Test content</div>
      </Widget>
    );
    expect(getByText("Test content")).toBeInTheDocument();
  });

  it("applies default className", () => {
    const { container } = render(
      <Widget>
        <div>Test content</div>
      </Widget>
    );
    expect(container.firstChild).toHaveClass("widget");
  });

  it("applies custom className", () => {
    const { container } = render(
      <Widget className="custom-class">
        <div>Test content</div>
      </Widget>
    );
    expect(container.firstChild).toHaveClass("widget", "custom-class");
  });

  it("sets theme CSS variables when theme is provided", () => {
    const theme: PassportWidgetTheme = {
      colors: {
        primary: "255, 255, 255",
        secondary: "109, 109, 109",
        background: "0, 0, 0",
        accent: "0, 212, 170",
        error: "235, 48, 45",
      },
      padding: {
        widget: {
          x: "20px",
          y: "12px",
        },
      },
      radius: {
        widget: "16px",
        button: "8px",
      },
      transition: {
        speed: "50ms",
      },
      font: {
        family: {
          body: "Arial, sans-serif",
          heading: "Arial, sans-serif",
          alt: "Arial, sans-serif",
        },
      },
      position: {
        overlayZIndex: "10",
      },
    };

    const { container } = render(
      <Widget theme={theme}>
        <div>Test content</div>
      </Widget>
    );

    const widgetElement = container.firstChild as HTMLElement;
    
    // Check that CSS variables are set
    expect(widgetElement.style.getPropertyValue("--color-primary-c6dbf459")).toBe("255, 255, 255");
    expect(widgetElement.style.getPropertyValue("--color-secondary-c6dbf459")).toBe("109, 109, 109");
    expect(widgetElement.style.getPropertyValue("--color-background-c6dbf459")).toBe("0, 0, 0");
    expect(widgetElement.style.getPropertyValue("--color-accent-c6dbf459")).toBe("0, 212, 170");
    expect(widgetElement.style.getPropertyValue("--color-error-c6dbf459")).toBe("235, 48, 45");
    expect(widgetElement.style.getPropertyValue("--widget-padding-x-c6dbf459")).toBe("20px");
    expect(widgetElement.style.getPropertyValue("--widget-padding-y-c6dbf459")).toBe("12px");
    expect(widgetElement.style.getPropertyValue("--widget-radius-c6dbf459")).toBe("16px");
    expect(widgetElement.style.getPropertyValue("--button-radius-c6dbf459")).toBe("8px");
    expect(widgetElement.style.getPropertyValue("--transition-speed-c6dbf459")).toBe("50ms");
    expect(widgetElement.style.getPropertyValue("--font-family-body-c6dbf459")).toBe("Arial, sans-serif");
    expect(widgetElement.style.getPropertyValue("--font-family-heading-c6dbf459")).toBe("Arial, sans-serif");
    expect(widgetElement.style.getPropertyValue("--font-family-alt-c6dbf459")).toBe("Arial, sans-serif");
    expect(widgetElement.style.getPropertyValue("--overlay-z-index-c6dbf459")).toBe("10");
  });

  it("handles partial theme", () => {
    const partialTheme: PassportWidgetTheme = {
      colors: {
        primary: "255, 255, 255",
        accent: "0, 255, 0",
      },
    };

    const { container } = render(
      <Widget theme={partialTheme}>
        <div>Test content</div>
      </Widget>
    );

    const widgetElement = container.firstChild as HTMLElement;
    
    // Only primary color should be set
    expect(widgetElement.style.getPropertyValue("--color-primary-c6dbf459")).toBe("255, 255, 255");
    // Other colors should not be set
    expect(widgetElement.style.getPropertyValue("--color-secondary-c6dbf459")).toBe("");
  });

  it("handles undefined theme", () => {
    const { container } = render(
      <Widget theme={undefined}>
        <div>Test content</div>
      </Widget>
    );

    const widgetElement = container.firstChild as HTMLElement;
    
    // No CSS variables should be set
    expect(widgetElement.style.getPropertyValue("--color-primary-c6dbf459")).toBe("");
  });

  it("handles null theme", () => {
    const { container } = render(
      <Widget theme={null as unknown as PassportWidgetTheme}>
        <div>Test content</div>
      </Widget>
    );

    const widgetElement = container.firstChild as HTMLElement;
    
    // No CSS variables should be set
    expect(widgetElement.style.getPropertyValue("--color-primary-c6dbf459")).toBe("");
  });

  it("updates theme when theme prop changes", () => {
    const initialTheme: PassportWidgetTheme = {
      colors: {
        primary: "255, 255, 255",
        accent: "0, 255, 0",
      },
    };

    const updatedTheme: PassportWidgetTheme = {
      colors: {
        primary: "0, 0, 0",
        accent: "255, 0, 0",
      },
    };

    const { container, rerender } = render(
      <Widget theme={initialTheme}>
        <div>Test content</div>
      </Widget>
    );

    let widgetElement = container.firstChild as HTMLElement;
    expect(widgetElement.style.getPropertyValue("--color-primary-c6dbf459")).toBe("255, 255, 255");

    rerender(
      <Widget theme={updatedTheme}>
        <div>Test content</div>
      </Widget>
    );

    widgetElement = container.firstChild as HTMLElement;
    expect(widgetElement.style.getPropertyValue("--color-primary-c6dbf459")).toBe("0, 0, 0");
  });

  it("calls setProperty for each color variable (lines 74-78)", () => {
    const initialTheme: PassportWidgetTheme = {
      colors: {
        accent: "0, 212, 170",
      },
    } as PassportWidgetTheme;

    const updatedTheme: PassportWidgetTheme = {
      colors: {
        primary: "255, 255, 255",
        secondary: "109, 109, 109",
        background: "0, 0, 0",
        accent: "0, 212, 170",
        error: "235, 48, 45",
      },
    };

    const { container, rerender } = render(
      <Widget theme={initialTheme}>
        <div>Test content</div>
      </Widget>
    );

    const widgetElement = container.firstChild as HTMLElement;
    const spy = jest.spyOn(widgetElement.style, "setProperty");

    rerender(
      <Widget theme={updatedTheme}>
        <div>Test content</div>
      </Widget>
    );

    expect(spy).toHaveBeenCalledWith("--color-primary-c6dbf459", "255, 255, 255");
    expect(spy).toHaveBeenCalledWith("--color-secondary-c6dbf459", "109, 109, 109");
    expect(spy).toHaveBeenCalledWith("--color-background-c6dbf459", "0, 0, 0");
    expect(spy).toHaveBeenCalledWith("--color-accent-c6dbf459", "0, 212, 170");
    expect(spy).toHaveBeenCalledWith("--color-error-c6dbf459", "235, 48, 45");
  });

  it("handles theme with nested undefined values", () => {
    const themeWithUndefined: PassportWidgetTheme = {
      colors: {
        primary: "255, 255, 255",
        secondary: undefined,
        background: undefined,
        accent: "0, 212, 170",
        error: undefined,
      },
      padding: {
        widget: {
          x: "20px",
          y: undefined,
        },
      },
      radius: {
        widget: undefined,
        button: "8px",
      },
      transition: {
        speed: undefined,
      },
      font: {
        family: {
          body: "Arial, sans-serif",
          heading: undefined,
          alt: undefined,
        },
      },
      position: {
        overlayZIndex: undefined,
      },
    };

    const { container } = render(
      <Widget theme={themeWithUndefined}>
        <div>Test content</div>
      </Widget>
    );

    const widgetElement = container.firstChild as HTMLElement;
    
    // Only defined values should be set
    expect(widgetElement.style.getPropertyValue("--color-primary-c6dbf459")).toBe("255, 255, 255");
    expect(widgetElement.style.getPropertyValue("--color-accent-c6dbf459")).toBe("0, 212, 170");
    expect(widgetElement.style.getPropertyValue("--widget-padding-x-c6dbf459")).toBe("20px");
    expect(widgetElement.style.getPropertyValue("--button-radius-c6dbf459")).toBe("8px");
    expect(widgetElement.style.getPropertyValue("--font-family-body-c6dbf459")).toBe("Arial, sans-serif");
    
    // Undefined values should not be set
    expect(widgetElement.style.getPropertyValue("--color-secondary-c6dbf459")).toBe("");
    expect(widgetElement.style.getPropertyValue("--widget-padding-y-c6dbf459")).toBe("");
    expect(widgetElement.style.getPropertyValue("--widget-radius-c6dbf459")).toBe("");
    expect(widgetElement.style.getPropertyValue("--transition-speed-c6dbf459")).toBe("");
    expect(widgetElement.style.getPropertyValue("--font-family-heading-c6dbf459")).toBe("");
    expect(widgetElement.style.getPropertyValue("--overlay-z-index-c6dbf459")).toBe("");
  });
});
