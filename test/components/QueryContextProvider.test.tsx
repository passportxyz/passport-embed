import React from "react";
import { render, screen } from "@testing-library/react";
import { QueryContextProvider } from "../../src/components/QueryContextProvider";
import { useQueryContext } from "../../src/hooks/useQueryContext";

// Mock the useQueryContext hook
jest.mock("../../src/hooks/useQueryContext");
const mockUseQueryContext = useQueryContext as jest.Mock;

describe("QueryContextProvider", () => {
  const mockChildren = <div>Test children</div>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("provides context with default embed service URL", () => {
    const TestComponent = () => {
      const context = useQueryContext();
      return <div data-testid="context">{JSON.stringify(context)}</div>;
    };

    mockUseQueryContext.mockReturnValue({
      apiKey: "test-api-key",
      address: "0x123",
      scorerId: "test-scorer",
      embedServiceUrl: "https://api.holonym.id",
    });

    render(
      <QueryContextProvider
        apiKey="test-api-key"
        address="0x123"
        scorerId="test-scorer"
      >
        <TestComponent />
      </QueryContextProvider>
    );

    expect(mockUseQueryContext).toHaveBeenCalled();
  });

  it("provides context with custom embed service URL", () => {
    const TestComponent = () => {
      const context = useQueryContext();
      return <div data-testid="context">{JSON.stringify(context)}</div>;
    };

    mockUseQueryContext.mockReturnValue({
      apiKey: "test-api-key",
      address: "0x123",
      scorerId: "test-scorer",
      embedServiceUrl: "https://custom.api.com",
    });

    render(
      <QueryContextProvider
        apiKey="test-api-key"
        address="0x123"
        scorerId="test-scorer"
        overrideEmbedServiceUrl="https://custom.api.com/"
      >
        <TestComponent />
      </QueryContextProvider>
    );

    expect(mockUseQueryContext).toHaveBeenCalled();
  });

  it("strips trailing slashes from embed service URL", () => {
    const TestComponent = () => {
      const context = useQueryContext();
      return <div data-testid="context">{JSON.stringify(context)}</div>;
    };

    mockUseQueryContext.mockReturnValue({
      apiKey: "test-api-key",
      address: "0x123",
      scorerId: "test-scorer",
      embedServiceUrl: "https://custom.api.com",
    });

    render(
      <QueryContextProvider
        apiKey="test-api-key"
        address="0x123"
        scorerId="test-scorer"
        overrideEmbedServiceUrl="https://custom.api.com///"
      >
        <TestComponent />
      </QueryContextProvider>
    );

    expect(mockUseQueryContext).toHaveBeenCalled();
  });

  it("renders children", () => {
    render(
      <QueryContextProvider
        apiKey="test-api-key"
        address="0x123"
        scorerId="test-scorer"
      >
        {mockChildren}
      </QueryContextProvider>
    );

    expect(screen.getByText("Test children")).toBeInTheDocument();
  });
});
