import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    // จะมาเขียน logic logout ทีหลัง
    return res.status(200).json({ message: "Logout endpoint scaffolded" });
  }
  return res.status(405).json({ message: "Method not allowed" });
}