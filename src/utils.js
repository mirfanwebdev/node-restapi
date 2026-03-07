import db from "./db.js"

/**
 * A utility function to send a JSON response.
 * @param {http.ServerResponse} res - The response object
 * @param {object} data - The data to send as JSON
 * @param {number} [statusCode=200] - The HTTP status code
 */
export function sendJSON(res, data, statusCode = 200) {
  if (res.writableEnded) return;
  
  res.writeHead(statusCode, { 
    "Content-Type": "application/json" 
  });
  
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
          resolve({});
		  return;
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

 // Custom error class
 export class AppError extends Error {
	 constructor(message, statusCode = 500) {
		 super(message);
		 this.statusCode = statusCode;
		 this.isOperational = true; // mark as a known error
	 }
 }

// control error sender
export function sendError(res, err) {
	const statusCode = err instanceof AppError 
	  ? error.statusCode : 500;
	//const message = err.message || "Internal server error";
	const message = error instanceof AppError 
	  ? error.message : "Internal Server Error";
	
	sendJSON(
	  res,
	  {
	    status: "error",
		statusCode,
		message,
	  },
	  statusCode
	);
}