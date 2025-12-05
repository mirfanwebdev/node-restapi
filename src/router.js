import { URL } from "node:url";
import {
  getAllUsers,
  getUserById,
  createUser,
  getAllPost,
  getPostById,
  createPost,
  getCommentByPostId,
  createComment,
  handleNotFound,
} from "./handler.js";
import { authWrapper, AppError, sendError } from "./utils.js";

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
