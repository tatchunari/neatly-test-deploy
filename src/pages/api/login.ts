import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    // จะมาเขียน logic login ทีหลัง
    return res.status(200).json({ message: "Login endpoint scaffolded" });
  }
  return res.status(405).json({ message: "Method not allowed" });
}