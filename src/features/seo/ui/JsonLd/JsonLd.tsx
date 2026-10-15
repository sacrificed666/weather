import { serializeJsonLd, type Schema } from "../../model/seo";

// Structured data in a script tag
const JsonLd = ({ data }: { data: Schema }) => (
  <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }} />
);

export default JsonLd;
