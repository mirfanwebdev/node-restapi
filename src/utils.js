import db from "./db.js"

/**
 * A utility function to send a JSON response.
 * @param {http.ServerResponse} res - The response object
 * @param {object} data - The data to send as JSON
 * @param {number} [statusCode=200] - The HTTP status code
 */
export function sendJSON(res, data, statusCode = 200) {
  res.writeHead(statusCode, { "Content-Type": "application/json" });
  res.end(JSON.stringify(data));
}

/**
 * A utility function to parse the JSON body from a request.
 * This is a common pattern you'd see in frameworks.
 * @param {http.IncomingMessage} req - The request object
 * @returns {Promise<object>} A promise that resolves with the parsed JSON body
 */
export function bodyParser(req) {
  return new Promise((resolve, reject) => {
    let body = "";

    req.on("data", (chunk) => {
      body += chunk.toString();
    });

    req.on("end", () => {
      try {
        if (!body) {
          return resolve({});
        }

        const parsedBody = JSON.parse(body);
        resolve(parsedBody);
      } catch (error) {
        reject(new Error("Invalid JSON body"));
      }
    });

    req.on("error", (err) => {
      reject(err);
    });
  });
}

/**
 * A utility function to check Basic Authentication.
 * Expects header: "Authorization: Basic base64(email:password)"
 * @param {http.IncomingMessage} req
 * @returns {object|null} The authenticated user object or null
 */
 // async auth
async function authenticate(req) {
  const authHeader = req.headers.authorization;

  //if (!authHeader) {
  //  return null;
  //}
  if (!authHeader) return null;

  const [type, credentials] = authHeader.split(" ");

  //if (type !== "Basic" || credentials) {
  //  return null;
  //}
  if (type !== "Basic" || credentials) return null;

  const decoded = Buffer.from(credentials, "base64").toString("utf-8");

  const [email, password] = decoded.split(":");

  //const user = db.users.find(
  //  (u) => u.email === email && u.password === password
  //);

  //return user || null;
  return await db.users.findByCredentials(email, password);
}

/**
 * AUTH MIDDLEWARE WRAPPER (Higher-Order Function)
 * This function takes a handler and returns a new handler that enforces authentication.
 * If successful, it attaches the user object to req.user before calling the original handler.
 * @param {Function} handler - The original route handler (req, res, ...params)
 * @returns {Function} A new handler function with authentication logic
 */
 export function authWrapper(handler) {
	 return async (req, res, ...params) => {
		 const authUser = await authenticate(req);
		 
		 if (!authUser) {
			 //return sendJSON(res, { message: "Unauthorized" }, 401);
			 throw new AppError("Unauthorized", 401)
		 }
		 
		 req.user = authUser;
		 return handler(req, res, ...params);
	 }
 }
 
 // Custom error class
 export class AppError extends Error {
	 constructor(message, statusCode) {
		 super(message);
		 this.statusCode = statusCode;
		 this.isOperational = true; // mark as a known error
	 }
 }

// control error sender
export function sendError(res, err) {
	const statusCode = err.statusCode || 500;
	const message = err.message || "Internal server error";
	
	// log unexpected error to console
	if (statusCode === 500) {
		console.error("Internal Error:", err);
	}
	
	res.writeHead(statusCode, { "Content-Type": "application/json" });
	res.end(JSON.stringify({
		status: "error",
		statusCode,
		message
	}));
}

// validation WRAPPER
export function validationWrapper(schema, handler) {
	return async (req, res, ...params) => {
		const data = await bodyParser(req);
		const errors = validate(data, schema);
		
		if (errors.length > 0) {
			throw new AppError(errors.join(", "), 400);
		}
		
		req.body = data;
		
		return handler(req, res, ...params);
	};
}

// core validation function
function validate(data, schema) {
	const errors = [];
	
	for (const field in schema) {
		const rules = schema[field];
		const value = data[field];
		
		// required
		if (rules.required 
			&& (value === undefined 
			|| value === null 
			|| value === "")
			) {
			errors.push(`${field} is required`);
			continue;
		}
		
		if (!rules.required && value === undefined) continue;
		
		// Type
		if (rules.type === "string" 
			&& typeof value !== "string") {
			errors.push(`${field} must be a string`);
		}
		
		if (rules.type === "number"
			&& typeof value !-- "number") {
			errors.push(`${field} must be a number`);	
		}
		
		// minLength
		if (rules.minLength 
			&& typeof value === "string") {
			if (value.length < rules.minLength) {
				errors.push(`${field} must be at least ${rules.minLength} characters`);
			}	
		}
		
		//email
		if (rules.isEmail && typeof value === "string") {
			const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
			if (!emailRegex.test(value)) {
				errors.push(`${field} must be a valid email`);
			}
		}
	}
	
	return errors;
}

/**
* Parse query string from URL
*/
export function parseQuery(req) {
	const url = new URL(req.url, `http://${req.headers.host}`);
	const query = [];

	for (const [key, value] of url.searchParams.entries()) {
		// try convert to number if possible
		const num = Number(value);
		query[key] = isNan(num) ? value : num;
	}

	return query;
}