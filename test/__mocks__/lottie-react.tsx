// Mock for lottie-react in tests
import React from "react";

const Lottie = ({ ...props }: { animationData?: unknown; [key: string]: unknown }) => {
  return <div data-testid="lottie-animation" {...props} />;
};

export default Lottie;
