import { DetailsSummary } from "@tiptap/extension-details";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    detailsSummary: {
      /**
       * Set heading level for summary
       */
      setSummaryHeading: (level: 1 | 2 | null) => ReturnType;
    };
  }
}

export const CustomDetailsSummary = DetailsSummary.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      headingLevel: {
        default: null,
        parseHTML: (element) => {
          const level = element.getAttribute("data-heading-level");
          return level ? parseInt(level) : null;
        },
        renderHTML: (attributes) => {
          if (!attributes.headingLevel) {
            return {};
          }
          return {
            "data-heading-level": attributes.headingLevel,
          };
        },
      },
    };
  },

  addCommands() {
    return {
      ...this.parent?.(),
      setSummaryHeading:
        (level) =>
          ({ commands, state, chain }) => {
            const { $from } = state.selection;

            // Find if we're inside a detailsSummary
            for (let depth = $from.depth; depth > 0; depth--) {
              const node = $from.node(depth);
              if (node.type.name === "detailsSummary") {
                const pos = $from.before(depth);
                return commands.updateAttributes("detailsSummary", { headingLevel: level });
              }
            }

            return false;
          },
    };
  },
});
