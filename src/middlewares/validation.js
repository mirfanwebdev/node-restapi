import { bodyParser, AppError } from "../utils.js";

function validate(data = {}, schema) {
	const errors = [];
	
	for (const field in schema) {
		const rules = schema[field];
		const value = data[field];
		
		if (rules.required 
			&& (value === undefined 
				|| value === null 
				|| value === ""
				)) {
			errors.push(`${field} is required`);
			continue;
		}
		
		if (value === undefined) continue;
		
		if (rules.type === "string" 
			&& typeof value !== "string") {
			errors.push(`${field} must be a string`);	
		}
		
		if (rules.type === "number" 
			&& typeof value !== "number") {
			errors.push(`${field} mus be a number`);	
		}
		
		if (rules.min 
			&& typeof value === "number"
			&& value.length < rules.min) {
			errors.push(`${field} must be at least ${rules.min}`);	
		}
		
		if (rules.minLength
			&& typeof value === "string"
			&& value.length < rules.minLength) {
			errors.push(`${field} mus be at least ${rules.minLength} characters`);			
		}
		
		if (rules.isEmail 
			&& typeof value === "string") {
			const emailRegex = /^[^\s@]+@[^\s@]+\.[^s\@]+$/;
			if (!emailRegex.test(value)) {
				errors.push(`${field} must be a valid email`);
			}
		}
	}
	
	return errors;
}

export function validateBody(schema) {
	return async (req, res, next) => {
		const data = await bodyParser(req);
		const errors = validate(data, schema);
		
		if (errors.length > 0) {
			throw new AppError(errors.join(", "), 400);
		}
		
		req.body = data;
		await next();
	};
}

export function validateQuery(schema) {
	return async (req, res, next) => {
		const url = new URL(req.url, `http://${req.headers.host}`);
		const query = {};
		
		for (const [key, value] of url.searchParams.entries()) {
			const num = Number(value);
			query[key] = isNaN(num) ? value : num;
		}
		
		const errors = validate(query, schema);
		
		if (errors.length > 0) {
			throw new AppError(errors.join(", "), 400);
		}
		
		req.query = query;
		await next();
	};
}