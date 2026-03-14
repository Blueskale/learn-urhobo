import { TextStyle } from "react-native";

export const typography: Record<string, TextStyle> = {
  h1: { fontSize: 28, fontWeight: "700", lineHeight: 36 },
  h2: { fontSize: 22, fontWeight: "700", lineHeight: 30 },
  h3: { fontSize: 18, fontWeight: "600", lineHeight: 26 },
  body: { fontSize: 16, fontWeight: "400", lineHeight: 24 },
  bodyBold: { fontSize: 16, fontWeight: "600", lineHeight: 24 },
  caption: { fontSize: 13, fontWeight: "400", lineHeight: 18 },
  captionBold: { fontSize: 13, fontWeight: "600", lineHeight: 18 },
  urhobo: { fontSize: 22, fontWeight: "700", lineHeight: 30 },
  pronunciation: { fontSize: 14, fontWeight: "400", fontStyle: "italic", lineHeight: 20 },
};
