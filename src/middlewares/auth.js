import db from "../db.js"
import { AppError } from "../utils.js";

async function authenticate(req) {
	const authHeader = req.headers.authorization;
	
	if (!authHeader) return null;
	
	const [type, credentials] = authHeader.split(" ");
	
	if (type !== "Basic" || !credentials) return null;
	
	const decoded = Buffer.from(credentials, "base64").toString("utf-8");
	
	const [email, password] = decoded.split(":");
	
	return await db.users.findByCredentials(email, password);
}

export async function authMiddleware(req, res, next) {
	const authUser = await authenticate(req);
	
	if (!authUser) {
		throw new AppError("Unautorized", 401);
	}
	
	await next();
}