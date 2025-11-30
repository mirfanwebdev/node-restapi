import db from "./db.js";
import { sendJSON, bodyParser, authenticate } from "./utils.js";

/*
// send json helper (response handler)
function sendJSON(res, data, statusCode = 200) {
	res.writeHead(statusCode, {"Content-Type": "application/json"});
	res.end(JSON.stringify(data))
}
*/

export function getAllUsers(req, res) {
  sendJSON(res, db.users);
}

export function getUserById(req, res, id) {
  const user = db.users.find((u) => u.id === id);

  if (!user) {
    sendJSON(res, { message: "User not found" }, 404);
  } else sendJSON(res, user);
}

export async function createUser(req, res) {
  // check authentication
  const authenticatedUser = authenticate(req);
  if (!authenticatedUser) {
    return sendJSON(res, { message: "Unauthorized" }, 401);
  }

  try {
    const { name, email, password } = await bodyParser(req);

    if (!name || !email || !password) {
      return sendJSON(
        res,
        { message: "Name, email and password are required" },
        400
      );
    }

    const newUser = {
      id: (db.users.length + 1).toString(),
      name,
      email,
      password,
    };

    db.users.push(newUser);
    sendJSON(res, newUser, 201);
  } catch (err) {
    sendJSON(res, { message: err.message || "Invalid request" }, 400);
  }
  /*
	let body = "";
	
	req.on("data", (chunk) => {
		body += chunk.toString();
	});
	
	req.on("end", () => {
		try {
			const {name, email} = JSON.parse(body);
			
			if (!name || !email) {
				return sendJSON(res, {message: "Name and email are required"}, 400);
			}
			
			const newUser = {
				id: (db.users.length + 1).toString(),
				name,
				email,
			};
			
			db.users.push(newUser);
			sendJSON(res, newUser, 201)
		} catch(err) {
			sendJSON(res, {message: "Invalid JSON body"}, 400)
		}
	});
*/
}

// post handlers
export function getAllPost(req, res) {
  sendJSON(res, db.posts);
}

export function getPostById(req, res, id) {
  const post = db.posts.find((p) => p.id === id);

  if (!post) {
    return sendJSON(res, { message: "Post not found" }, 404);
  }

  return sendJSON(res, post);
}

export async function createPost(req, res) {
  // check authentication
  const authUser = authenticate(req);

  if (!authUser) {
    return sendJSON(res, { message: "Unauthorized" }, 401);
  }

  try {
    const { title, content } = await bodyParser(req);

    if (!title || !content) {
      return sendJSON(res, { message: "Title and content are required" }, 400);
    }

    const newPost = {
      id: (db.posts.length + 1).toString(),
      userId: authUser.id,
      title,
      content,
    };

    db.post.push(newPost);
    sendJSON(res, newPost, 201);
  } catch (err) {
    sendJSON(res, { message: err.message || "Invalid request" }, 400);
  }
}

// comments handlers
export function getCommentByPostId(req, res, postId) {
	const post = db.posts.find((p) => p.id === postId);
	
	if (!post) {
		return sendJSON(res, { message: "Post not found" }, 404);
	}
	
	const comments = db.comments.filter((c) => c.postId === postId);
	sendJSON(res, comments);
}

export async function createComment(req, res, postId) {
	// check authentication
	const authUser = authenticate(req);
	if (!authUser) {
		return sendJSON(res, { message: "Unauthorized" }, 401);
	}
	
	// verify post exists
	const post = db.posts.find((p) => p.id === postId);
	if (!post) {
		return sendJSON(res, { message: "Post not found" }, 404);
	}
	
	try {
		const { content } = await bodyParser(req);
		
		if (!content) {
			return sendJSON(res, { message: "content is required"}, 400);
		}
		
		const newComment = {
			id: (db.comments.length + 1).toString(),
			postId: postId,
			userId: authUser.id,
			content,
		};
		
		db.comments.push(newComment);
		sendJSON(res, newComment, 201);
	} catch (err) {
		sendJSON(res, { message: err.message || "Invalid request"}, 400)
	} 
	
}

export function handleNotFound(req, res) {
  sendJSON(res, { message: "Route not found" }, 404);
}
