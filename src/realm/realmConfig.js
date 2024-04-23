import * as Realm from "realm-web";
import { APP_ID } from "./constants";  // Adjust the path as necessary

const app = new Realm.App({ id: APP_ID });

export default app;
