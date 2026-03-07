import db from "./db.js";
import { 
	sendJSON, 
//	bodyParser, 
	AppError 
	} from "./utils.js";

export async function getAllUsers(req, res) {
  const users = await db.users.findAll();
  sendJSON(res, users);
}

export async function getUserById(req, res) {
  const { id } = req.params;
  const user = db.users.findById(id);

  if (!user) {
	throw new AppError("User not found", 404);
  }
  
  sendJSON(res, user);
}

export async function createUser(req, res) {
  const { name, email, password } = req.body;

    if (!name || !email || !password) {
	  throw new AppError("Name, email, and password are required", 400);
    }
	
	const count = await db.users.cout();

    const newUser = {
      id: String(count + 1),
      name,
      email,
      password,
    };

	await db.users.create(newUser);
    sendJSON(res, newUser, 201);
}

// post handlers
export async function getPosts(req, res) {
  const { limit = 10, page = 1 } = req.query;
  
  const startIndex = (page -1) * limit;
  const endIndex = startIndex + limit;
  
  const posts = await db.posts.findAll();
  const paginatedPosts = posts.slice(startIndex, endIndex);
  
  //sendJSON(res, posts) // db.posts);
  sendJSON(res, {
	  total: posts.length,
	  page,
	  limit,
	  totalPage: Math.ceil(posts.length / limit),
	  data: paginatedPosts
  });
}

export async function getPostById(req, res) {
  const { id } = req.params;
  const post = db.posts.findById(id);

  if (!post) {
    throw new AppError("Post not found", 404);
  }

  sendJSON(res, post);
}

export async function createPost(req, res) {
  const user = req.user;
  const { title, content } = req.body;
	
    if (!title || !content) {
	  throw new AppError("Title and content are required", 400);
    }

	const count = db.posts.count();
    const newPost = {
      id: String(count + 1),
      userId: user.id,
      title,
      content,
    };

	await db.posts.create(newPost);
    sendJSON(res, newPost, 201);
}

// comments handlers
export async function getCommentByPostId(req, res) {
	const { postId } = req.params;
	const post = db.posts.findById(postId);
	
	if (!post) {
	  throw new AppError("Post not found", 404);
	}
	
	const comments = db.comments.findByPostId(postId);
	sendJSON(res, comments);
}

export async function createComment(req, res, postId) {
	const { postId } = req.params; 
	const user = req.user;
	const post = db.posts.findByPostId(postId);
	
	if (!post) {
	  throw new AppError("Post not found", 404);
	}
	
	const { content } = req.body;
	
	if (!content) {
	  throw new AppError("Content is required", 400);
	}
		
	const count = db.comments.count();
	const newComment = {
		id: String(count + 1),
		postId: postId,
		userId: user.id,
		content,
	};
		
	await db.comments.create(newComment);
	sendJSON(res, newComment, 201);
}
