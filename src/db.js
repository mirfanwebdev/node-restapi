const db = {
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

export default db;
