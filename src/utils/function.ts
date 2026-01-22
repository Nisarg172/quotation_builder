export async function urlToBase64(url: string): Promise<string> {
    const res = await fetch(url);
    const blob = await res.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(blob);
    });
  }

  export const toTitleCase = (text: string) =>
  text
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
