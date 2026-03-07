const delay = (ms = 50) => new Promise((resolve) => setTimeout(resolve, ms));

const data = {
  users: [
    {
      id: "1",
      name: "John Doe",
      email: "john@example.com",
      password: "password123",
    },
    {
      id: "2",
      name: "Jane Smith",
      email: "jane@example.com",
      password: "secretpass",
    },
  ],
  posts: [
    { id: "1", userId: "1", title: "Helo Node", content: "My first post!" },
    {
      id: "2",
      userId: "1",
      title: "Refactoring",
      content: "Makes code better.",
    },
    {
      id: "3",
      userId: "1",
      title: "New Post",
      content: "Checking git history",
    },
  ],
  comments: [
	{
		id: "1", postId: "1", userId: "2", content: "Great first post, John!"
	},
	{
		id: "2", postId: "1", userId: "1", content: "Thanks Jane!",
	}
  ],
};

const db = {
	users: {
		async findAll() {
			await delay();
			return [...data.users];
		},
		async findById(id) {
			await delay();
			return data.users.find((u) => u.id === id) || null;
		},
		async findByCredential(email, password) {
			await delay();
			return (
			  data.users.find(
			    (u) => u.email === email && u.password === password
				) || null
			);
		},
		async create(user) {
			await delay();
			data.users.push(user);
			return user;
		},
		async count() {
			await delay();
			return data.users.length;
		}
	},
	posts: {
		async findAll() {
			await delay();
			return [...data.posts];
		},
		async findById(id) {
			await delay();
			return data.posts.find((u) => u.id === id) || null;
		},
		async create(post) {
			await delay();
			data.posts.push(post);
			return post;
		},
		async count() {
			await delay();
			return data.posts.length;
		}
	},
	cooments: {
		async findByPostId(postId) {
			await delay();
			return data.comments.filter((c) => c.postId === postId);
		},
		async create(comment) {
			await delay();
			data.comments.push(comment);
			return comment;
		},
		async count() {
			await delay();
			return data.comments.length;
		}
	},
};

export default db;
