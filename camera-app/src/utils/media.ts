import path from "path";

export const videoExtensions = [".mp4", ".m4v", ".mov"];
export const imageExtensions = [".jpeg", ".jpg", ".png"];

export type MediaType = "image" | "video" | null;

export const getMediaType = (uri: string) => {
  return videoExtensions.includes(path.extname(uri))
    ? "video"
    : imageExtensions.includes(path.extname(uri))
    ? "image"
    : null;
};
