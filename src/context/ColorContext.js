import React, { createContext, useContext, useState, useEffect } from 'react';
import { usePalette } from 'color-thief-react';

const ColorPaletteContext = createContext();

export const useColorPalette = () => useContext(ColorPaletteContext);

export const ColorPaletteProvider = ({ children }) => {
  // This is the central image that will determine the color palette for the entire site.
  const siteImageUrl = "https://res.cloudinary.com/dyv1rtwvh/image/upload/v1763908307/redd-francisco-gdQnsMbhkUs-unsplash_kkahq0.jpg";

  // Use color-thief-react to extract 5 colors from the image.
  const { data: colors, loading, error } = usePalette(siteImageUrl, 5, 'hex', {
    crossOrigin: 'anonymous',
  });

  const [palette, setPalette] = useState({ gradient: null });

  useEffect(() => {
    if (error) {
      console.error("ColorThief Error:", error);
      // Set a fallback gradient if the image fails to load or process
      // Default: dark reddish-pink to greyish-brown (Janmat'26 colors)
      setPalette({ gradient: 'linear-gradient(135deg, rgb(139, 21, 56), rgb(139, 115, 85))' });
      return;
    }

    if (colors && Array.isArray(colors) && colors.length > 0) {
      // Filter out very dark colors to ensure the gradient is vibrant.
      const suitableColors = colors.filter(color => {
        const hex = color.substring(1); // remove #
        const rgb = parseInt(hex, 16);
        const r = (rgb >> 16) & 0xff;
        const g = (rgb >> 8) & 0xff;
        const b = (rgb >> 0) & 0xff;
        const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b; // per ITU-R BT.709
        return luma > 40; // Exclude very dark colors
      });

      // Default fallback: dark reddish-pink to greyish-brown (Janmat'26 colors)
      let newGradient = 'linear-gradient(135deg, rgb(139, 21, 56), rgb(139, 115, 85))';
      if (suitableColors.length >= 2) {
        newGradient = `linear-gradient(135deg, ${suitableColors.join(', ')})`;
      } else if (suitableColors.length === 1) {
        newGradient = `linear-gradient(135deg, ${suitableColors[0]}, rgb(139, 115, 85))`;
      }

      setPalette({ gradient: newGradient });
    }
  }, [colors, error]);

  const value = { palette, loading };

  return (
    <ColorPaletteContext.Provider value={value}>
      {children}
    </ColorPaletteContext.Provider>
  );
};