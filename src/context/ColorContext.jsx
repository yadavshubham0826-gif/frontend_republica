import React, { createContext, useContext, useEffect, useState } from "react";
import ColorThief from "colorthief";

const ColorPaletteContext = createContext();
export const useColorPalette = () => useContext(ColorPaletteContext);

export const ColorPaletteProvider = ({ children }) => {
  const [imageUrl, setImageUrl] = useState(null);
  const [palette, setPalette] = useState({ gradient: null });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!imageUrl) return;

    setLoading(true);

    const img = new Image();
    img.crossOrigin = "anonymous"; // 🔥 REQUIRED FOR FIREBASE
    img.src = imageUrl;

    img.onload = () => {
      try {
        const colorThief = new ColorThief();
        const colors = colorThief.getPalette(img, 5);

        // filter dark colors
        const suitable = colors.filter(([r, g, b]) => {
          const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;
          return luma > 40;
        });

        // Default gradient: dark reddish-pink to greyish-brown (Janmat'26 colors)
        const defaultGradient = "linear-gradient(135deg, rgb(139, 21, 56), rgb(139, 115, 85))";
        
        let gradient = defaultGradient;
        if (suitable.length >= 2) {
          gradient = `linear-gradient(135deg, ${suitable
            .map(c => `rgb(${c.join(",")})`)
            .join(", ")})`;
        } else if (suitable.length === 1) {
          gradient = `linear-gradient(135deg, rgb(${suitable[0].join(",")}), rgb(139, 115, 85))`;
        }

        setPalette({ gradient });
      } catch (err) {
        console.error("ColorThief failed:", err);
        // Default fallback: dark reddish-pink to greyish-brown
        setPalette({ gradient: "linear-gradient(135deg, rgb(139, 21, 56), rgb(139, 115, 85))" });
      } finally {
        setLoading(false);
      }
    };

    img.onerror = () => {
      console.error("Image load failed:", imageUrl);
      // Default fallback: dark reddish-pink to greyish-brown
      setPalette({ gradient: "linear-gradient(135deg, rgb(139, 21, 56), rgb(139, 115, 85))" });
      setLoading(false);
    };
  }, [imageUrl]);

  return (
    <ColorPaletteContext.Provider value={{ palette, loading, setImageUrl }}>
      {children}
    </ColorPaletteContext.Provider>
  );
};
