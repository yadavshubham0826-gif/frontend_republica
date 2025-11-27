import React, { createContext, useContext, useState, useEffect } from 'react';
import { usePalette } from 'color-thief-react';

const ColorPaletteContext = createContext();

export const useColorPalette = () => useContext(ColorPaletteContext);

export const ColorPaletteProvider = ({ children }) => {
  const [imageUrl, setImageUrl] = useState("https://res.cloudinary.com/dyv1rtwvh/image/upload/v1763908307/redd-francisco-gdQnsMbhkUs-unsplash_kkahq0.jpg");

  const { data: colors, loading, error } = usePalette(imageUrl, 5, 'hex', {
    crossOrigin: 'anonymous',
    disabled: !imageUrl, // Don't run the hook until an image URL is set
  });

  const [palette, setPalette] = useState({ gradient: null });

  useEffect(() => {
    if (error) {
      console.error("ColorThief Error:", error);
      // Set a fallback gradient if the image fails to load or process
      setPalette({ gradient: 'linear-gradient(135deg, #e0f2fe, #a8d5e2)' });
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

      let newGradient = 'linear-gradient(135deg, #e0f2fe, #a8d5e2)'; // Default fallback
      if (suitableColors.length >= 2) {
        newGradient = `linear-gradient(135deg, ${suitableColors.join(', ')})`;
      } else if (suitableColors.length === 1) {
        newGradient = `linear-gradient(135deg, ${suitableColors[0]}, #ffffff)`;
      }

      setPalette({ gradient: newGradient });
    }
  }, [colors, error]);

  const value = { palette, loading, setImageUrl }; // Expose the setter function

  return (
    <ColorPaletteContext.Provider value={value}>
      {children}
    </ColorPaletteContext.Provider>
  );
};
