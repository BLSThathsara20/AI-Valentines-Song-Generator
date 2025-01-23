import axios from "axios";

interface SongData {
  url: string;
  title: string;
  sender: string;
}

// Function to create a shareable play URL
export const createPlayUrl = (songData: SongData): string => {
  const encodedData = btoa(JSON.stringify(songData));
  return `${window.location.origin}/lyrics-to-song/#/play/${encodedData}`;
};

// Function to shorten URL using TinyURL API
export const shortenUrl = async (longUrl: string): Promise<string> => {
  try {
    const response = await axios.get(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(longUrl)}`);
    if (typeof response.data === "string" && response.data.startsWith("http")) {
      return response.data;
    }
    throw new Error("Invalid response from TinyURL API");
  } catch (error) {
    console.error("Error shortening URL:", error);
    return longUrl; // Return original URL if shortening fails
  }
};