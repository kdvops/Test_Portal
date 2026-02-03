import { computed, ref, unref, type Ref } from "vue";

type EnableToggles = {
  alignment?: boolean;
  direction?: boolean;
  indent?: boolean;
  size?: boolean;
  colorClass?: boolean;
  cleanup?: boolean;
  justifyFallbackInlineStyle?: boolean;
};

type Mappings = {
  align?: Partial<Record<"center" | "right" | "justify", string>>;
  size?: Partial<Record<"small" | "large" | "huge", string>>;
  colorClass?: Record<string, string>;
};

export type QuillToVuetifyOptions = {
  indentRem?: number;
  mappings?: Mappings;
  ssrSafe?: boolean;
  enable?: EnableToggles;
};

const DEFAULT_OPTIONS: Required<QuillToVuetifyOptions> = {
  indentRem: 1.5,
  ssrSafe: true,
  mappings: {
    align: {
      center: "text-center",
      right: "text-end",
      justify: "text-justify",
    },
    size: {
      small: "text-body-2",
      large: "text-h6",
      huge: "text-h4",
    },
    colorClass: {
      // 'ql-color-red': 'text-error',
      // 'ql-color-blue': 'text-primary',
      // 'ql-color-green': 'text-success',
    },
  },
  enable: {
    alignment: true,
    direction: true,
    indent: true,
    size: true,
    colorClass: true,
    cleanup: true,
    justifyFallbackInlineStyle: true,
  },
};
function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

function mergeOptions(
  base: QuillToVuetifyOptions,
  over?: QuillToVuetifyOptions
): Required<QuillToVuetifyOptions> {
  const out = deepClone(base) as Required<QuillToVuetifyOptions>;

  if (!over) return out;
  if (typeof over.indentRem === "number") out.indentRem = over.indentRem;
  if (typeof over.ssrSafe === "boolean") out.ssrSafe = over.ssrSafe;
  out.mappings = {
    align: { ...(out.mappings.align ?? {}), ...(over.mappings?.align ?? {}) },
    size: { ...(out.mappings.size ?? {}), ...(over.mappings?.size ?? {}) },
    colorClass: {
      ...(out.mappings.colorClass ?? {}),
      ...(over.mappings?.colorClass ?? {}),
    },
  };
  out.enable = { ...(out.enable ?? {}), ...(over.enable ?? {}) };
  return out;
}

function doTransform(
  html: string,
  opts: Required<QuillToVuetifyOptions>
): string {
  if (!html || typeof html !== "string") return html || "";
  // SSR-safe: en servidor no hay DOMParser
  if (opts.ssrSafe && typeof window === "undefined") return html;

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  const swapClass = (el: Element, from: string, to?: string) => {
    if (!("classList" in el)) return;
    const cl = (el as HTMLElement).classList;
    if (cl.contains(from)) {
      cl.remove(from);
      if (to) cl.add(to);
    }
  };

  console.log("Validate");
  // === Alineación ===
  if (opts.enable.alignment) {
    doc.querySelectorAll<HTMLElement>('[class*="ql-align-"]').forEach((el) => {
      const cl = Array.from(el.classList);
      const alignClass = cl.find((c) => c.startsWith("ql-align-"));
      if (!alignClass) return;
      const value = alignClass.replace("ql-align-", "") as
        | "center"
        | "right"
        | "justify";
      const vuetifyClass = opts.mappings.align?.[value];
      el.classList.remove(alignClass);

      if (value === "justify") {
        if (vuetifyClass) {
          el.classList.add(vuetifyClass);
        } else if (opts.enable.justifyFallbackInlineStyle) {
          el.style.textAlign = "justify";
        }
      } else if (vuetifyClass) {
        el.classList.add(vuetifyClass);
      }
    });
  }

  // === Direccionalidad ===
  if (opts.enable.direction) {
    doc.querySelectorAll<HTMLElement>(".ql-direction-rtl").forEach((el) => {
      el.classList.remove("ql-direction-rtl");
      el.setAttribute("dir", "rtl");
      el.classList.add("text-end");
    });
  }

  // === Indentación ===
  if (opts.enable.indent) {
    doc.querySelectorAll<HTMLElement>('[class*="ql-indent-"]').forEach((el) => {
      const cl = Array.from(el.classList);
      cl.forEach((cn) => {
        if (/^ql-indent-\d+$/.test(cn)) {
          const level = parseInt(cn.split("-")[2], 10);
          el.classList.remove(cn);
          const current = parseFloat(el.style.marginLeft || "0") || 0;
          el.style.marginLeft = `${current + level * opts.indentRem}rem`;
        }
      });
    });
  }

  // Tamaños
  if (opts.enable.size) {
    doc.querySelectorAll<HTMLElement>('[class*="ql-size-"]').forEach((el) => {
      const cl = Array.from(el.classList);
      cl.forEach((cn) => {
        if (cn.startsWith("ql-size-")) {
          const key = cn.replace("ql-size-", "") as "small" | "large" | "huge";
          const to = opts.mappings.size?.[key];
          el.classList.remove(cn);
          if (to) el.classList.add(to);
        }
      });
    });
  }

  // Colores por clase
  if (
    opts.enable.colorClass &&
    opts.mappings.colorClass &&
    Object.keys(opts.mappings.colorClass).length
  ) {
    Object.entries(opts.mappings.colorClass).forEach(([from, to]) => {
      doc
        .querySelectorAll<HTMLElement>(`.${from}`)
        .forEach((el) => swapClass(el, from, to));
    });
  }

  // Limpieza de clases de Quill
  if (opts.enable.cleanup) {
    doc.querySelectorAll<HTMLElement>(".ql-snow, .ql-editor").forEach((el) => {
      el.classList.remove("ql-snow", "ql-editor");
    });
  }

  return doc.body.innerHTML;
}

export function useQuillToVuetify(initialOptions: QuillToVuetifyOptions = {}) {
  const optsRef = ref<Required<QuillToVuetifyOptions>>(
    mergeOptions(DEFAULT_OPTIONS, initialOptions)
  );

  const setOptions = (over?: QuillToVuetifyOptions) => {
    optsRef.value = mergeOptions(optsRef.value, over);
  };

  const transform = (html: string, over?: QuillToVuetifyOptions) => {
    const merged = mergeOptions(optsRef.value, over);
    return doTransform(html, merged);
  };

  const transformRef = (
    source: Ref<string> | string,
    over?: QuillToVuetifyOptions
  ) => {
    return computed(() => transform(unref(source) || "", over));
  };

  return {
    options: optsRef,
    setOptions,
    transform,
    transformRef,
  };
}
