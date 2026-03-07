import http from "node:http";
import router from "./router.js";

const PORT = process.env.PORT || 8000;

const server = http.createServer((req, res) => {
  await router(req, res);
});

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
