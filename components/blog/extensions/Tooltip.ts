import { Mark, mergeAttributes } from "@tiptap/core";

export interface TooltipOptions {
  HTMLAttributes: Record<string, any>;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    tooltip: {
      /**
       * Set a tooltip
       */
      setTooltip: (description: string) => ReturnType;
      /**
       * Unset a tooltip
       */
      unsetTooltip: () => ReturnType;
    };
  }
}

export const Tooltip = Mark.create<TooltipOptions>({
  name: "tooltip",

  addOptions() {
    return {
      HTMLAttributes: {
        class: "tooltip-highlight",
      },
    };
  },

  addAttributes() {
    return {
      description: {
        default: null,
        parseHTML: (element) => element.getAttribute("data-tooltip"),
        renderHTML: (attributes) => {
          if (!attributes.description) {
            return {};
          }

          return {
            "data-tooltip": attributes.description,
          };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "span[data-tooltip]",
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "span",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes),
      0,
    ];
  },

  addCommands() {
    return {
      setTooltip:
        (description) =>
        ({ commands }) => {
          return commands.setMark(this.name, { description });
        },
      unsetTooltip:
        () =>
        ({ commands }) => {
          return commands.unsetMark(this.name);
        },
    };
  },
});
