import Scrubbr, { ScrubbrOptions } from "scrubbr";

declare global {
  namespace Express {
    interface Response {
      /**
       * Set the schema name that scrubbr will use to serialize the data with in the send method.
       * @param schemaName - The name of the schema to serialize to.
       * @param config - Either the scrubbr options or scrubbr instance to use for serialization.
       */
      scrubbr(schemaName: string, config?: Scrubbr | ScrubbrOptions): this;
    }
  }
}
