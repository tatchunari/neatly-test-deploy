import type { NextApiRequest, NextApiResponse } from "next";
import multer from "multer";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Multer setup to read file in memory
const multerUpload = multer({ storage: multer.memoryStorage() });
const upload = multerUpload.single("galleryImages");

export const config = {
  api: {
    bodyParser: false, // required for multer
  },
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  upload(req as any, res as any, async (err: any) => {
    // console.log(`Upload Gallery Image | headers: ${JSON.stringify(req.headers)} | body: ${JSON.stringify(req.body)}`)
    if (err)
      return res.status(500).json({ success: false, message: err.message });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const file = (req as any).file;
    if (!file)
      return res
        .status(400)
        .json({ success: false, message: "No file uploaded" });

    const filePath = `rooms/${Date.now()}_${file.originalname}`;
    const { data, error } = await supabase.storage
      .from("neatly")
      .upload(filePath, file.buffer, { contentType: file.mimetype });

    if (error)
      return res.status(500).json({ success: false, message: error.message });

    const { data: publicData } = supabase.storage
      .from("neatly")
      .getPublicUrl(filePath);
    res.status(200).json({ success: true, url: publicData.publicUrl });
  });
}
