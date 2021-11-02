export default function preload(url: URL | string) {
    const image = new Image();
    image.src = url as string;
    return image.src;
}
