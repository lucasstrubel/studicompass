import { createCn } from "cn/config";

/**
 * Class merger that knows the KONZEPT §12.3 type scale. Without this, "text-meta" would count as a text
 * colour and remove e.g. "text-primary-foreground" (P3-01 review). Import cn only from here.
 */
export const cn = createCn({
  extend: {
    classGroups: {
      "font-size": [
        {
          text: [
            "page-title",
            "section-title",
            "card-title",
            "body",
            "meta",
            "figure",
          ],
        },
      ],
    },
  },
});
