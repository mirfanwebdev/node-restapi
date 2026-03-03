import { URL } from "node:url";
import {
  getAllUsers,
  getUserById,
  createUser,
  getPosts,
  getPostById,
  createPost,
  getCommentByPostId,
  createComment,
  handleNotFound,
} from "./handler.js";
//import { authWrapper, AppError, sendError } from "./utils.js";
//import { validateWrapper } from "./utils.js";
import { AppError, sendError } from "./utils.js";
import { authMiddleware } from "./middlewares/auth.js";
import { validateBody, validateQuery } from "./middlewares/validation.js";

const userSchema = {
	name: { required: true, type: "string", minLength: 3 },
	email: { required: true, type: "string", isEmail: true },
	password: { required: true, type: "string", minLenght: 6 }
};

const postSchema = {
	title: { required: true, type: "string", minLength: 3 },
	content: { required: true, type: "string", minLength: 5 },
};

const commentSchema = {
	content: { required: true, type: "string", minLength: 1 }
};

const postQuerySchema = {
	limit: { type: "number", min: 1 },
	page: { type: "number", min: 1 }
};

// Simple Router class to manage routes and dispatch request
class Router {
	constructor() {
		this.routes = [];
	}
	
	/*
	* Internal method to register a Route
	* Converts path strings (e.g. "/users/:id") into regex
	*/
	add(method, path, handlers) {
		const paramNames = [];
		
		// Escape forward slashes ( / => \/)
		let regexPath = path.replace(/\//g, "\\/");
		
		// Replace :param parameter with capture groups
		// e.g., :id => ([a-zA-Z0-9]+)
		regexPath = regexPath.replace(/:([a-zA-Z0-9]+)/g, (_, key) => {
			paramNames.push(key);
			return "([a-zA-Z0-9]+)";
		});
		
		// Create the final regex (anchored start ^ and end $)
		const regex = new RegExp(`^${regexPath}$`);
		
		this.routes.push({
			method,
			regex,
			paramNames,
			handlers,
		});
	}
	
	get(path, ...handlers) {
		this.add("GET", path, handlers);
	}
	
	post(path, ...handlers) {
		this.add("POST", path, handlers);
	}
	
	async serve(req, res) {
		const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
		const { pathname } = parsedUrl;
		
		console.log(`Incoming request: ${req.method} ${pathname}`);
		
		try {
			for (const route of this.routes) {
				if (route.method !== req.method) continue;
				
				const match = pathname.match(route.regex);
				if (match) {
					//const params = match.slice(1);
					//await route.handler(req, res, ...params);
					
					const values = match.slice(1);
					
					req.params = {};
					route.paramNames.forEach((name, i) => {
						req.params[name] = values[i];
					});
					
					await this.runMiddlewares(req, res, route.handlers);
					return;
				}
			}
			
			sendError(res, new AppError("Route Not Found", 404));
		} catch (error) {
			sendError(res, error);
		}
	}
	
	async runMiddlewares(req, res, handlers) {
		let index = 0;
		
		async function next() {
			if (index >= handlers.length) return;
			if (res.writableEnded) return;
			
			const handler = handlers[index++];
			await handler(req, res, next)
		}
		
		await next();
	}
}

const router = new Router();

router.get("/api/users", getAllUsers);
router.post(
  "/api/users",
  authMiddleware,
  validateBody(userSchema),
  createUser  
//  authWrapper(validateWrapper(userSchema, createUser))
);
router.get("/api/users/:id", getUserById);

router.get(
  "/api/posts",
  validateQuery(postQuerySchema),
  getPosts
//  validateWrapper(postQuerySchema, getPosts, "query")
);
router.post(
  "/api/posts",
  authMiddleware,
  validateBody(postSchema),
  createPost  
//  authWrapper(validateWrapper(postSchema, createPost))
);
router.get("/api/posts/:id", getPostById);

router.get("/api/posts/:postId/comments", getCommentByPostId);
router.post(
  "/api/posts/:postId/comments",
  authMiddleware,
  validateBody(commentSchema),
  createComment  
//  authWrapper(validateWrapper(commentSchema, createComment))
);

export default (req, res) => router.serve(req, res);

/*
const routes = [
  {
    // matches /api/users
    path: /^\/api\/users$/,
    handlers: {
      GET: getAllUsers,
      POST: authWrapper(createUser),
    },
  },
  {
    // matches /api/users/:id
    path: /^\/api\/users\/([a-zA-Z0-9]+)$/,
    handlers: {
      GET: getUserById,
    },
  },
  {
    // matches /api/posts
    path: /^\/api\/posts$/,
    handlers: {
      GET: getAllPost,
      POST: authWrapper(createPost),
    },
  },
  {
	  // matches /api/posts/:id
	  path: /^\/api\/posts\/([a-zA-Z0-9]+)$/,
	  handlers: {
		  GET: getPostById,
	  }
  },
  {
	  path: /^\/api\/posts\/([a-zA-Z0-9]+)\/comments$/,
	  handlers: {
		  GET: getCommentByPostId,
		  POST: authWrapper(createComment),
	  }
  }
];

export default async function router(req, res) {
  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
  const { pathname } = parsedUrl;

  console.log(`Incoming request: ${req.method} ${pathname}`);

  try {
    for (const route of routes) {
      const match = pathname.match(route.path);

      if (match) {
        const handler = route.handlers[req.method];

        if (handler) {
          const params = match.slice(1);
          await handler(req, res, ...params);
		  return;
        }
      }
    }
	
	throw new AppError("Route not found", 404);
  } catch (error) {
	  sendError(res, error);
  }
  

  //const userIdRegex = /^\/api\/users\/([a-zA-Z0-9]+)$/;
  //const idMatch = pathname.match(userIdRegex);

  // GET /api/users
  //if (pathname === "/api/users" && req.method === "GET") {
  //	return getAllUsers(req, res);
  //}

  // GET /api/users/:id
  //if (idMatch && req.method === "GET") {
  //	const id = idMatch[1];
  //	return getUserById(req, res, id);
  //}

  // POST /api/users
  //if (pathName === "/api/users" && req.method === "POST") {
  //	return createUser(req, res);
  //}

  //return handleNotFound(req, res);
}
*/
