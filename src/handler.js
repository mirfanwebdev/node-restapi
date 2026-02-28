import db from "./db.js";
import { sendJSON, bodyParser, AppError } from "./utils.js";

/*
// send json helper (response handler)
function sendJSON(res, data, statusCode = 200) {
	res.writeHead(statusCode, {"Content-Type": "application/json"});
	res.end(JSON.stringify(data))
}
*/

export async function getAllUsers(req, res) {
  const users = await db.users.findAll();
  //sendJSON(res, db.users);
  sendJSON(res, users);
}

export async function getUserById(req, res, id) {
  //const user = db.users.find((u) => u.id === id);
  const user = db.users.findById(id);

  if (!user) {
    //sendJSON(res, { message: "User not found" }, 404);
	throw new AppError("User not found", 404);
  }
  sendJSON(res, user);
}

export async function createUser(req, res) {
  /*
  // check authentication
  const authenticatedUser = authenticate(req);
  if (!authenticatedUser) {
    return sendJSON(res, { message: "Unauthorized" }, 401);
  }
  */
  
  //try {
  //  const { name, email, password } = await bodyParser(req);
  const { name, email, password } = req.body;

    if (!name || !email || !password) {
      //return sendJSON(
      //  res,
      //   { message: "Name, email and password are required" },
      //  400
      //);
	  throw new AppError("Name, email, and password are required", 400);
    }
	
	const count = await db.users.cout();

    const newUser = {
      id: (count + 1).toString(), //(db.users.length + 1).toString(),
      name,
      email,
      password,
    };

    //db.users.push(newUser);
	await db.users.create(newUser);
    sendJSON(res, newUser, 201);
  //} catch (err) {
  //  sendJSON(res, { message: err.message || "Invalid request" }, 400);
  //}
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
export async function getPosts(req, res) {
  const { limit = 10, page = 1 } = req.query;
  
  const parsedLimit = Number(limit);
  const parsedPage = Number(page);
  
  const startIndex = (parsedPage - 1) * parsedLimit;
  const endIndex = startIndex + parsedLimit;
  
  const posts = await db.posts.findAll();
  const paginatedPosts = posts.slice(startIndex, endIndex);
  
  //sendJSON(res, posts) // db.posts);
  sendJSON(res, {
	  total: posts.length,
	  page: parsedPage,
	  limit: parsedLimit,
	  totalPages: Math.ceil(posts.length / parsedLimit),
	  data: paginatedPosts
  });
}

export async function getPostById(req, res, id) {
  const post = db.posts.findById(id); //find((p) => p.id === id);

  if (!post) {
  //return sendJSON(res, { message: "Post not found" }, 404);
    throw new AppError("Post not found", 404);
  }

  sendJSON(res, post);
}

export async function createPost(req, res) {
  /*
  // check authentication
  const authUser = authenticate(req);

  if (!authUser) {
    return sendJSON(res, { message: "Unauthorized" }, 401);
  }
  */
  const user = req.user;

  //try {
  //  const { title, content } = await bodyParser(req);
  const { title, content } = req.body;
	
    if (!title || !content) {
    //  return sendJSON(res, { message: "Title and content are required" }, 400);
	  throw new AppError("Title and content are required", 400);
    }

	const count = db.posts.count();
    const newPost = {
      id: (count + 1).toString(), //(db.posts.length + 1).toString(),
      userId: user.id,
      title,
      content,
    };

    //db.post.push(newPost);
	await db.posts.create(newPost);
    sendJSON(res, newPost, 201);
  //} catch (err) {
  //  sendJSON(res, { message: err.message || "Invalid request" }, 400);
  //}
}

// comments handlers
export async function getCommentByPostId(req, res, postId) {
	const post = db.posts.findById(postId); //find((p) => p.id === postId);
	
	if (!post) {
	//	return sendJSON(res, { message: "Post not found" }, 404);
	  throw new AppError("Post not found", 404);
	}
	
	const comments = db.comments.findByPostId(postId); //filter((c) => c.postId === postId);
	sendJSON(res, comments);
}

export async function createComment(req, res, postId) {
	/*
	// check authentication
	const authUser = authenticate(req);
	if (!authUser) {
		return sendJSON(res, { message: "Unauthorized" }, 401);
	}
	*/
	const user = req.user;
	
	// verify post exists
	const post = db.posts.findByPostId(postId); //find((p) => p.id === postId);
	if (!post) {
	//	return sendJSON(res, { message: "Post not found" }, 404);
	  throw new AppError("Post not found", 404);
	}
	
	//try {
	//	const { content } = await bodyParser(req);
	const { content } = req.body;
	
		if (!content) {
		//	return sendJSON(res, { message: "content is required"}, 400);
		  throw new AppError("Content is required", 400);
		}
		
		const count = db.comments.count();
		const newComment = {
			id: (count + 1).toString(); //(db.comments.length + 1).toString(),
			postId: postId,
			userId: user.id,
			content,
		};
		
		//db.comments.push(newComment);
		await db.comments.create(newComment);
		sendJSON(res, newComment, 201);
	//} catch (err) {
	//	sendJSON(res, { message: err.message || "Invalid request"}, 400)
	//} 
	
}

//export function handleNotFound(req, res) {
//  sendJSON(res, { message: "Route not found" }, 404);
//}
