export { createTable } from "./create_table";
export { dropTable } from "./drop_table";
export { fullQuery } from "./full_query";
export { update } from "./update";
export { batchGet } from "./batch_get";
export { batchWrite } from "./batch_write";

import * as Query from "./query";
import * as Scan from "./scan";
export { Query, Scan };
