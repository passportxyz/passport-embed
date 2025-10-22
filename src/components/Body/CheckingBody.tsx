import { useMemo } from "react";
import styles from "./Body.module.css";
import { loadingAnimationData } from "../../assets/humanTechLoading";
import Lottie from "lottie-react";
import { useTheme, parseRgbColor } from "../../contexts/ThemeContext";

export const CheckingBody = () => {
  const { theme } = useTheme();
  const primaryColor = parseRgbColor(theme?.colors?.primary);

  return (
    <>
      <div className={`${styles.textBlock} ${styles.textCenter}`}>
        <DynamicAnimation color={primaryColor} />
        <div className={`${styles.heading} ${styles.textCenter}`}>Verifying...</div>
        <div className={styles.loadingText}>
          Please wait a few seconds while we automatically add points to your account based on your web3 history
        </div>
      </div>
    </>
  );
};

function DynamicAnimation({ color = [0, 0, 0] }) {
  // Convert RGB values (0-255) to Lottie format (0-1)
  const normalizedColor = useMemo(() => {
    return color.map((c) => c / 255);
  }, [color]);

  // Create a modified version with the new color
  const animationData = useMemo(() => {
    // Deep clone the original animation data
    const modified = JSON.parse(JSON.stringify(loadingAnimationData));

    // Recursive function to update colors in the animation tree
    const updateColors = (obj: any) => {
      if (Array.isArray(obj)) {
        obj.forEach(updateColors);
      } else if (obj && typeof obj === "object") {
        // Check if this is a fill (ty: 'fl') or stroke (ty: 'st')
        if ((obj.ty === "fl" || obj.ty === "st") && obj.c && obj.c.k) {
          // Update the color value
          obj.c.k = normalizedColor;
        }
        // Recursively check all properties
        Object.values(obj).forEach(updateColors);
      }
    };

    // Update all colors in the animation
    updateColors(modified.layers);

    return modified;
  }, [normalizedColor]);

  return <Lottie animationData={animationData} loop={true} autoplay={true} style={{ width: 100, height: 100 }} />;
}
