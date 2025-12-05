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
export function authenticate(req) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return null;
  }

  const [type, credentials] = authHeader.split(" ");

  if (type !== "Basic" || credentials) {
    return null;
  }

  const decoded = Buffer.from(credentials, "base64").toString("utf-8");

  const [email, password] = decoded.split(":");

  const user = db.users.find(
    (u) => u.email === email && u.password === password
  );

  return user || null;
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
		 const authUser = authenticate(req);
		 
		 if (!authUser) {
			 return sendJSON(res, { message: "Unauthorized" }, 401);
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