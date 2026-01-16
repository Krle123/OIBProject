import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            res.status(401).json({ error: "No token provided" });
            return;
        }

        const token = authHeader.substring(7);
        const secret = process.env.JWT_SECRET || "OVOJEODPKOVOLIVOLECEKONEZAVOLECEBUDITEUBEDJENIUTODALJENEMAODTOGA";

        const decoded = jwt.verify(token, secret) as any;
        (req as any).user = decoded;

        next();
    } catch (error: any) {
        res.status(401).json({ error: "Invalid token" });
    }
};
