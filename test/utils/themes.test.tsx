import React from "react";
import { render } from "@testing-library/react";
import { DarkTheme, LightTheme } from "../../src/utils/themes";
import { Widget } from "../../src/widgets/Widget";
import type { PassportWidgetTheme } from "../../src/widgets/Widget";

describe("Theme Utils", () => {
  describe("DarkTheme", () => {
    it("includes all required color properties", () => {
      expect(DarkTheme.colors).toBeDefined();
      expect(DarkTheme.colors?.primary).toBe("255, 255, 255");
      expect(DarkTheme.colors?.secondary).toBe("109, 109, 109");
      expect(DarkTheme.colors?.background).toBe("0, 0, 0");
      expect(DarkTheme.colors?.success).toBe("164, 255, 169");
      expect(DarkTheme.colors?.failure).toBe("203, 203, 203");
    });

    it("includes accent color for CTAs", () => {
      expect(DarkTheme.colors?.accent).toBe("0, 212, 170"); // #00D4AA
    });

    it("includes padding configuration", () => {
      expect(DarkTheme.padding).toBeDefined();
      expect(DarkTheme.padding?.widget?.x).toBe("20px");
      expect(DarkTheme.padding?.widget?.y).toBe("12px");
    });

    it("includes font configuration", () => {
      expect(DarkTheme.font).toBeDefined();
      expect(DarkTheme.font?.family?.body).toBe('"Poppins", sans-serif');
      expect(DarkTheme.font?.family?.heading).toBe('"Poppins", sans-serif');
      expect(DarkTheme.font?.family?.alt).toBe('"DM Mono", sans-serif');
    });
  });

  describe("LightTheme", () => {
    it("includes all required color properties", () => {
      expect(LightTheme.colors).toBeDefined();
      expect(LightTheme.colors?.primary).toBe("55, 55, 55");
      expect(LightTheme.colors?.secondary).toBe("201, 201, 201");
      expect(LightTheme.colors?.background).toBe("255, 255, 255");
      expect(LightTheme.colors?.success).toBe("36, 212, 83");
      expect(LightTheme.colors?.failure).toBe("55, 55, 55");
    });

    it("includes accent color for CTAs", () => {
      expect(LightTheme.colors?.accent).toBe("0, 212, 170"); // #00D4AA - same as dark theme
    });

    it("uses same padding as dark theme", () => {
      expect(LightTheme.padding).toEqual(DarkTheme.padding);
    });

    it("uses same font configuration as dark theme", () => {
      expect(LightTheme.font).toEqual(DarkTheme.font);
    });
  });
});

describe("Widget setTheme functionality", () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  it("applies accent color CSS variable from theme", () => {
    const customTheme: PassportWidgetTheme = {
      colors: {
        primary: "0, 0, 0",
        secondary: "128, 128, 128",
        background: "255, 255, 255",
        accent: "255, 0, 128", // Custom pink accent
      },
    };

    const { container: widgetContainer } = render(
      <Widget theme={customTheme}>
        <div>Test Content</div>
      </Widget>,
      { container }
    );

    const widgetElement = widgetContainer.querySelector("[class*='widget']") as HTMLElement;
    expect(widgetElement).toBeTruthy();

    const style = window.getComputedStyle(widgetElement);
    expect(style.getPropertyValue("--color-accent-c6dbf459")).toBe("255, 0, 128");
  });

  it("applies all color CSS variables including accent", () => {
    const { container: widgetContainer } = render(
      <Widget theme={DarkTheme}>
        <div>Test Content</div>
      </Widget>,
      { container }
    );

    const widgetElement = widgetContainer.querySelector("[class*='widget']") as HTMLElement;
    expect(widgetElement).toBeTruthy();

    const style = window.getComputedStyle(widgetElement);

    // Check all colors are applied
    expect(style.getPropertyValue("--color-primary-c6dbf459")).toBe("255, 255, 255");
    expect(style.getPropertyValue("--color-secondary-c6dbf459")).toBe("109, 109, 109");
    expect(style.getPropertyValue("--color-background-c6dbf459")).toBe("0, 0, 0");
    expect(style.getPropertyValue("--color-accent-c6dbf459")).toBe("0, 212, 170");
    expect(style.getPropertyValue("--color-success-c6dbf459")).toBe("164, 255, 169");
    expect(style.getPropertyValue("--color-failure-c6dbf459")).toBe("203, 203, 203");
  });

  it("handles missing accent color gracefully", () => {
    const themeWithoutAccent: PassportWidgetTheme = {
      colors: {
        primary: "0, 0, 0",
        secondary: "128, 128, 128",
        background: "255, 255, 255",
        accent: undefined as unknown as string, // Explicitly testing undefined
      },
    };

    // Should not throw when accent is missing
    expect(() => {
      render(
        <Widget theme={themeWithoutAccent}>
          <div>Test Content</div>
        </Widget>,
        { container }
      );
    }).not.toThrow();
  });

  it("applies padding variables correctly", () => {
    const { container: widgetContainer } = render(
      <Widget theme={DarkTheme}>
        <div>Test Content</div>
      </Widget>,
      { container }
    );

    const widgetElement = widgetContainer.querySelector("[class*='widget']") as HTMLElement;
    const style = window.getComputedStyle(widgetElement);

    expect(style.getPropertyValue("--widget-padding-x-c6dbf459")).toBe("20px");
    expect(style.getPropertyValue("--widget-padding-y-c6dbf459")).toBe("12px");
    // Header padding is not a configurable property in the theme
  });

  it("applies font variables correctly", () => {
    const { container: widgetContainer } = render(
      <Widget theme={DarkTheme}>
        <div>Test Content</div>
      </Widget>,
      { container }
    );

    const widgetElement = widgetContainer.querySelector("[class*='widget']") as HTMLElement;
    const style = window.getComputedStyle(widgetElement);

    expect(style.getPropertyValue("--font-family-body-c6dbf459")).toBe('"Poppins", sans-serif');
    expect(style.getPropertyValue("--font-family-heading-c6dbf459")).toBe('"Poppins", sans-serif');
    expect(style.getPropertyValue("--font-family-alt-c6dbf459")).toBe('"DM Mono", sans-serif');
  });

  it("allows overriding specific theme properties", () => {
    const { rerender, container: widgetContainer } = render(
      <Widget theme={DarkTheme}>
        <div>Test Content</div>
      </Widget>,
      { container }
    );

    const widgetElement = widgetContainer.querySelector("[class*='widget']") as HTMLElement;
    let style = window.getComputedStyle(widgetElement);

    // Initial theme
    expect(style.getPropertyValue("--color-accent-c6dbf459")).toBe("0, 212, 170");
    expect(style.getPropertyValue("--color-primary-c6dbf459")).toBe("255, 255, 255");

    // Real-world usage: spread existing theme and override specific values
    const customizedTheme: PassportWidgetTheme = {
      ...DarkTheme,
      colors: {
        ...DarkTheme.colors,
        accent: "255, 0, 128", // Hot pink accent
        primary: "230, 230, 230", // Slightly dimmer white
      },
    };

    rerender(
      <Widget theme={customizedTheme}>
        <div>Test Content</div>
      </Widget>
    );

    style = window.getComputedStyle(widgetElement);
    // Accent should be updated to hot pink
    expect(style.getPropertyValue("--color-accent-c6dbf459")).toBe("255, 0, 128");
    // Primary should be updated to dimmer white
    expect(style.getPropertyValue("--color-primary-c6dbf459")).toBe("230, 230, 230");
    // Other theme properties should remain from DarkTheme
    expect(style.getPropertyValue("--color-background-c6dbf459")).toBe("0, 0, 0");
    expect(style.getPropertyValue("--color-secondary-c6dbf459")).toBe("109, 109, 109");
  });

  it("handles theme with all properties defined", () => {
    const completeTheme: PassportWidgetTheme = {
      colors: {
        primary: "10, 20, 30",
        secondary: "40, 50, 60",
        background: "70, 80, 90",
        accent: "100, 110, 120",
        success: "130, 140, 150",
        failure: "160, 170, 180",
      },
      padding: {
        widget: { x: "10px", y: "15px" },
      },
      font: {
        family: {
          body: "Helvetica, sans-serif",
          heading: "Georgia, serif",
          alt: "Arial, sans-serif",
        },
      },
    };

    const { container: widgetContainer } = render(
      <Widget theme={completeTheme}>
        <div>Test Content</div>
      </Widget>,
      { container }
    );

    const widgetElement = widgetContainer.querySelector("[class*='widget']") as HTMLElement;
    const style = window.getComputedStyle(widgetElement);

    // Verify all properties are applied
    expect(style.getPropertyValue("--color-primary-c6dbf459")).toBe("10, 20, 30");
    expect(style.getPropertyValue("--color-secondary-c6dbf459")).toBe("40, 50, 60");
    expect(style.getPropertyValue("--color-background-c6dbf459")).toBe("70, 80, 90");
    expect(style.getPropertyValue("--color-accent-c6dbf459")).toBe("100, 110, 120");
    expect(style.getPropertyValue("--color-success-c6dbf459")).toBe("130, 140, 150");
    expect(style.getPropertyValue("--color-failure-c6dbf459")).toBe("160, 170, 180");
    expect(style.getPropertyValue("--widget-padding-x-c6dbf459")).toBe("10px");
    expect(style.getPropertyValue("--widget-padding-y-c6dbf459")).toBe("15px");
    expect(style.getPropertyValue("--font-family-body-c6dbf459")).toBe("Helvetica, sans-serif");
    expect(style.getPropertyValue("--font-family-heading-c6dbf459")).toBe("Georgia, serif");
    expect(style.getPropertyValue("--font-family-alt-c6dbf459")).toBe("Arial, sans-serif");
  });
});