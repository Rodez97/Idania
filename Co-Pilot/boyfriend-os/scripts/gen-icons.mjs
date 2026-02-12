import sharp from "sharp";

await sharp({
  create: { width: 192, height: 192, channels: 4, background: { r: 124, g: 58, b: 237, alpha: 1 } },
}).png().toFile("public/icons/icon-192x192.png");
console.log("192x192 icon created");

await sharp({
  create: { width: 512, height: 512, channels: 4, background: { r: 124, g: 58, b: 237, alpha: 1 } },
}).png().toFile("public/icons/icon-512x512.png");
console.log("512x512 icon created");
