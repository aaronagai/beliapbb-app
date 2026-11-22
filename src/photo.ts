/** Turns whatever the applicant picks (camera or gallery) into a small 4:5 passport-style JPEG for the form's photo box. */
const OUT_W = 480;
const OUT_H = 600;

export async function photoFromFile(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) throw new Error("not an image");
  const bmp = await createImageBitmap(file, { imageOrientation: "from-image" });
  const scale = Math.max(OUT_W / bmp.width, OUT_H / bmp.height);
  const w = bmp.width * scale;
  const h = bmp.height * scale;
  const canvas = document.createElement("canvas");
  canvas.width = OUT_W;
  canvas.height = OUT_H;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas");
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, OUT_W, OUT_H);
  // Centre-crop, nudged up a little so faces (usually in the upper half) stay in frame.
  ctx.drawImage(bmp, (OUT_W - w) / 2, (OUT_H - h) * 0.3, w, h);
  bmp.close();
  return canvas.toDataURL("image/jpeg", 0.86);
}
