// Import font files as base64 data URLs
import SuisseIntlRegular from "../assets/fonts/SuisseIntl-Regular.woff2";
import SuisseIntlMedium from "../assets/fonts/SuisseIntl-Medium.woff2";
import SuisseIntlSemibold from "../assets/fonts/SuisseIntl-Semibold.woff2";
import SuisseIntlBold from "../assets/fonts/SuisseIntl-Bold.woff2";
import SuisseIntlBook from "../assets/fonts/SuisseIntl-Book.woff2";

let fontsInjected = false;

export const injectFonts = () => {
  // Only inject once and only in browser environment
  if (fontsInjected || typeof document === "undefined") {
    return;
  }

  // Create preload links for all font weights to force eager loading
  const fonts = [SuisseIntlRegular, SuisseIntlMedium, SuisseIntlSemibold, SuisseIntlBold, SuisseIntlBook];

  fonts.forEach((fontUrl) => {
    const preloadLink = document.createElement("link");
    preloadLink.rel = "preload";
    preloadLink.as = "font";
    preloadLink.type = "font/woff2";
    preloadLink.href = fontUrl;
    preloadLink.crossOrigin = "anonymous";
    preloadLink.setAttribute("data-passport-font-preload", "true");
    document.head.appendChild(preloadLink);
  });

  const fontStyles = `
    @font-face {
      font-family: 'Suisse Intl';
      src: url('${SuisseIntlRegular}') format('woff2');
      font-weight: 400;
      font-style: normal;
      font-display: block;
    }

    @font-face {
      font-family: 'Suisse Intl';
      src: url('${SuisseIntlBook}') format('woff2');
      font-weight: 450;
      font-style: normal;
      font-display: block;
    }

    @font-face {
      font-family: 'Suisse Intl';
      src: url('${SuisseIntlMedium}') format('woff2');
      font-weight: 500;
      font-style: normal;
      font-display: block;
    }

    @font-face {
      font-family: 'Suisse Intl';
      src: url('${SuisseIntlSemibold}') format('woff2');
      font-weight: 600;
      font-style: normal;
      font-display: block;
    }

    @font-face {
      font-family: 'Suisse Intl';
      src: url('${SuisseIntlBold}') format('woff2');
      font-weight: 700;
      font-style: normal;
      font-display: block;
    }
  `;

  const style = document.createElement("style");
  style.setAttribute("data-passport-fonts", "true");
  style.textContent = fontStyles;
  document.head.appendChild(style);

  fontsInjected = true;
};

