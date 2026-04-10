export const toTitleCase = (text?: string | null) => {
  if (!text) return "";

  const exceptions = ["de", "del", "y", "en", "la", "el", "a"];

  return text
    .toLowerCase()
    .split(" ")
    .map((word, index) => {
      if (index !== 0 && exceptions.includes(word)) return word;
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");
};