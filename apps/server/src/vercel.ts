import { app } from "./app";

export default (req: Request) => app.fetch(req);
