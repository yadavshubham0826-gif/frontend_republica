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

        let gradient = "linear-gradient(135deg, #e0f2fe, #a8d5e2)";
        if (suitable.length >= 2) {
          gradient = `linear-gradient(135deg, ${suitable
            .map(c => `rgb(${c.join(",")})`)
            .join(", ")})`;
        } else if (suitable.length === 1) {
          gradient = `linear-gradient(135deg, rgb(${suitable[0].join(",")}), #fff)`;
        }

        setPalette({ gradient });
      } catch (err) {
        console.error("ColorThief failed:", err);
        setPalette({ gradient: "linear-gradient(135deg, #e0f2fe, #a8d5e2)" });
      } finally {
        setLoading(false);
      }
    };

    img.onerror = () => {
      console.error("Image load failed:", imageUrl);
      setPalette({ gradient: "linear-gradient(135deg, #e0f2fe, #a8d5e2)" });
      setLoading(false);
    };
  }, [imageUrl]);

  return (
    <ColorPaletteContext.Provider value={{ palette, loading, setImageUrl }}>
      {children}
    </ColorPaletteContext.Provider>
  );
};
