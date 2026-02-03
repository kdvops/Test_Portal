<script lang="ts">
import { Vue, Prop, Emit } from "vue-facing-decorator";
import type { SeoPageInterface } from "~/interfaces/seo.interface";

export interface PageTreeItem {
  name: string;
  path: string;
  children?: PageTreeItem[];
  id?: string | number;
}

@NuxtComponent({
  name: "page-tree-component",
  inheritAttrs: false,
})
class PageTreeComponent extends Vue {
  @Prop({ type: Array, default: () => [] })
  readonly modelValue!: SeoPageInterface[];
  @Prop({ type: Object, required: false }) readonly node?: PageTreeItem;

  @Prop({ type: Number, default: 0 }) readonly depth!: number;
  @Prop({ type: Number, default: 6 }) readonly maxDepth!: number;

  @Prop({ type: String, default: "" }) readonly baseUrl!: string;
  @Prop({ type: Boolean, default: true }) readonly defaultOpen!: boolean;

  @Prop({ type: Number, default: 20 }) readonly indentUnit!: number;
  @Prop({ type: Boolean, default: true }) readonly forceTopAsRoots!: boolean;

  @Prop({ type: Array, default: () => [] }) readonly guides!: number[];
  @Prop({ type: Boolean, default: false }) readonly last!: boolean;
  @Prop({ type: Array, default: () => [] }) readonly cutCols!: number[];

  @Prop({ type: String, default: "rgba(200,150,200,.65)" })
  readonly lineColor!: string;
  @Prop({ type: Number, default: 1 }) readonly lineWidth!: number;

  openedKeys: string[] = [];

  created() {
    if (this.node || !this.defaultOpen || this.openedKeys.length) return;
    const root = this.tree.find((n) => n.path === "/");
    if (root?.children?.length) this.openedKeys = [this.keyFor(root)];
  }

  get tree(): PageTreeItem[] {
    return this.buildTree(this.modelValue ?? []);
  }

  private buildTree(pages: SeoPageInterface[]): PageTreeItem[] {
    type TreeNode = PageTreeItem & { scratch?: Map<string, TreeNode> };

    const normalizePath = (path: string) => {
      if (!path) return "/";
      let cleaned = path.trim();
      if (!cleaned.startsWith("/")) cleaned = "/" + cleaned;
      cleaned = cleaned.replace(/\/+/g, "/");
      if (cleaned !== "/" && cleaned.endsWith("/"))
        cleaned = cleaned.slice(0, -1);
      return cleaned;
    };
    const humanizeSegment = (segment: string) => {
      const text = decodeURIComponent(segment).replace(/-/g, " ");
      return text.charAt(0).toUpperCase() + text.slice(1);
    };

    // Conjunto de paths que SÍ existen como página
    const pagesByPath = new Map<string, SeoPageInterface>();
    for (const p of pages) pagesByPath.set(normalizePath(p.path), p);

    const nodesByPath = new Map<string, TreeNode>();

    // Solo crea nodo si el path existe como página (excepto "/")
    const getOrCreateNode = (path: string): TreeNode | null => {
      if (path !== "/" && !pagesByPath.has(path)) return null;
      if (nodesByPath.has(path)) return nodesByPath.get(path)!;
      const page = pagesByPath.get(path) || null;
      const name =
        page?.meta?.title?.trim() ||
        (path === "/" ? "Home" : humanizeSegment(path.split("/").pop()!));
      const node: TreeNode = {
        name,
        path,
        children: [],
        id: page?._id,
        scratch: new Map(),
      };
      nodesByPath.set(path, node);
      return node;
    };

    // Crea raíz virtual siempre; si "/" no existe, no se mostrará cuando se promueva
    getOrCreateNode("/");

    // Busca el ancestro existente más cercano; si no hay, usa "/"
    const findExistingParentPath = (fullPath: string): string => {
      let p = fullPath;
      while (true) {
        const idx = p.lastIndexOf("/");
        p = idx <= 0 ? "/" : p.substring(0, idx);
        if (p === "/" || pagesByPath.has(p)) return p;
      }
    };

    // Enlaza cada página SOLO con su ancestro existente más cercano
    for (const page of pages) {
      const fullPath = normalizePath(page.path);
      const child = getOrCreateNode(fullPath)!; // existe
      if (fullPath === "/") continue;

      const parentPath = findExistingParentPath(fullPath);
      const parent = getOrCreateNode(parentPath)!; // "/" o página existente

      if (!parent.children!.some((c) => c.path === child.path)) {
        parent.children!.push(child);
      }
    }

    // Limpiar scratch
    const prune = (node: TreeNode) => {
      if (node.scratch) delete node.scratch;
      (node.children || (node.children = [])).forEach(prune);
    };
    nodesByPath.forEach(prune);

    // Orden
    const compareByPath = (a: PageTreeItem, b: PageTreeItem) =>
      a.path.localeCompare(b.path);
    const sortTree = (arr: PageTreeItem[]) => {
      arr.sort(compareByPath);
      for (const child of arr) if (child.children) sortTree(child.children);
    };

    // Armar salida
    const includesRoot = pages.some((p) => normalizePath(p.path) === "/");
    const root = nodesByPath.get("/");

    if (root?.children) sortTree(root.children);

    if (this.forceTopAsRoots && root) {
      const promoted = (root.children ?? []).map((child) => ({
        ...child,
        id:
          child.id ?? pagesByPath.get(child.path)?._id ?? `root:${child.path}`,
      }));
      const shallowRoot = includesRoot ? { ...root, children: [] } : null;
      const topLevel = [
        ...(shallowRoot ? [shallowRoot] : []),
        ...promoted,
      ] as PageTreeItem[];
      topLevel.sort(compareByPath);
      return topLevel;
    }

    return root ? (includesRoot ? [root] : root.children || []) : [];
  }

  hasChildren(node: PageTreeItem) {
    return !!node.children?.length;
  }

  listGroupId(node: PageTreeItem) {
    return `ptg-${encodeURIComponent(node.path || "")}`;
  }

  keyFor(node: PageTreeItem, index?: number) {
    const raw = node.id ?? node.path ?? `idx-${index ?? 0}`;
    return typeof raw === "string"
      ? `k:${encodeURIComponent(raw)}`
      : `k:${String(raw)}`;
  }

  hrefFor(node: PageTreeItem) {
    const base = this.baseUrl?.replace(/\/$/, "") || "";
    return base ? `${base}${node.path}` : node.path;
  }

  get indentPx() {
    return this.depth * this.indentUnit;
  }

  get gutterStyle() {
    return {
      "--indent-unit": `${this.indentUnit}px`,
      "--gutter-color": this.lineColor,
      "--gutter-width": `${this.lineWidth}px`,
      "--pt-bg": "rgb(var(--v-theme-surface))",
    } as Record<string, string>;
  }

  get rootSpineStyle() {
    return {
      backgroundImage:
        "linear-gradient(to bottom, var(--gutter-color), var(--gutter-color))",
      backgroundRepeat: "no-repeat",
      backgroundSize: "var(--gutter-width) 100%",
      backgroundPosition: `calc(calc(var(--indent-unit) / 2) - 2px) 0`,
    } as Record<string, string>;
  }

  branchBackground(depth: number, guideColumns: number[], isLast: boolean) {
    const unit = this.indentUnit,
      width = this.lineWidth,
      color = this.lineColor;
    const layers: string[] = [];

    for (const col of guideColumns || []) {
      if (this.cutCols?.includes(col)) continue;
      const x = col * unit - width / 2;
      layers.push(
        `linear-gradient(to bottom, ${color}, ${color}) ${x}px 0 / ${width}px 100% no-repeat`
      );
    }

    if (depth > 1) {
      const col = depth - 1;
      const x = col * unit - width / 2;
      const heightPct = this.cutCols?.includes(col) ? 50 : isLast ? 50 : 100;
      layers.push(
        `linear-gradient(to bottom, ${color}, ${color}) ${x}px 0 / ${width}px ${heightPct}% no-repeat`
      );
    }

    const xStart = (depth - 1) * unit;
    layers.push(
      `linear-gradient(to right, ${color}, ${color}) ${xStart}px 50% / ${unit}px ${width}px no-repeat`
    );

    return layers.join(", ");
  }

  bridgeBackground(depth: number, guideColumns: number[], isLast: boolean) {
    const unit = this.indentUnit,
      width = this.lineWidth,
      color = this.lineColor;
    const columns = [...(guideColumns || [])];
    if (!isLast && depth > 1) columns.push(depth - 1);

    return columns
      .filter((c) => !(this.cutCols || []).includes(c))
      .map((c) => {
        const x = c * unit - width / 2;
        return `linear-gradient(to bottom, ${color}, ${color}) ${x}px 0 / ${width}px 100% no-repeat`;
      })
      .join(", ");
  }

  guidesForChild(childIndex: number, total: number) {
    const columns = [...(this.guides || [])];
    if (childIndex < total - 1 && this.depth > 1) columns.push(this.depth - 1);
    return columns;
  }

  rootGuides(_index: number, _total: number) {
    return [];
  }

  nextCutColumns(): number[] {
    const next = [...(this.cutCols || [])];
    if (this.last && this.depth > 1) {
      const colToCut = this.depth - 1;
      if (!next.includes(colToCut)) next.push(colToCut);
    }
    return next;
  }

  isExpanded(key: string) {
    const rootComponent = this.getRoot();
    return !!rootComponent?.openedKeys?.includes(key);
  }

  toggleExpanded(key: string) {
    const rootComponent = this.getRoot();
    if (!rootComponent) return;
    const keys = Array.isArray(rootComponent.openedKeys)
      ? rootComponent.openedKeys.slice()
      : [];
    const idx = keys.indexOf(key);
    if (idx >= 0) keys.splice(idx, 1);
    else keys.push(key);
    rootComponent.openedKeys = keys;
  }

  private getRoot(): PageTreeComponent {
    let current: any = this as any;
    let lastTree: any =
      current.$options?.name === "page-tree-component" ? current : null;
    while (current.$parent) {
      const parent: any = current.$parent;
      if (parent?.$options?.name === "page-tree-component") lastTree = parent;
      current = parent;
    }
    return lastTree as PageTreeComponent;
  }

  @Emit("update:modelValue") emitValue(value: SeoPageInterface[]) {
    return value;
  }
  @Emit("edit") emitEdit(item: PageTreeItem) {
    return item;
  }
  @Emit("delete") emitDelete(item: PageTreeItem) {
    return item;
  }

  onDeleteNode(item: PageTreeItem) {
    this.emitDelete(item);
  }
}

export default PageTreeComponent;
</script>

<template>
  <client-only>
    <v-list
      v-if="!node"
      density="comfortable"
      nav
      :style="[gutterStyle, rootSpineStyle]"
    >
      <template v-for="(n, i) in tree" :key="keyFor(n, i)">
        <page-tree-component
          :node="n"
          :depth="1"
          :guides="rootGuides(i, tree.length)"
          :last="i === tree.length - 1"
          :cut-cols="[]"
          :max-depth="maxDepth"
          :base-url="baseUrl"
          :default-open="defaultOpen"
          :indent-unit="indentUnit"
          :force-top-as-roots="forceTopAsRoots"
          :line-color="lineColor"
          :line-width="lineWidth"
          @edit="emitEdit"
          @delete="emitDelete"
          @update:modelValue="emitValue"
        />
      </template>
    </v-list>

    <template v-else>
      <v-list-group
        class="v-page-seo"
        v-if="hasChildren(node) && depth < maxDepth"
        :id="listGroupId(node)"
        :model-value="isExpanded(keyFor(node))"
        :prepend-icon="undefined"
        @update:modelValue="() => toggleExpanded(keyFor(node))"
      >
        <template #activator="{ props }">
          <v-list-item
            class="pt-item"
            v-bind="props"
            :style="{ paddingLeft: '0px' }"
          >
            <template #prepend>
              <v-sheet
                class="pt-gutter shrink-0"
                :width="indentPx"
                :style="gutterStyle"
              >
                <span
                  class="pt-gfx"
                  :style="{
                    background: branchBackground(
                      depth || 1,
                      guides || [],
                      last
                    ),
                  }"
                />
                <span
                  v-if="last && depth > 1"
                  class="pt-mask"
                  :style="{
                    left: `calc(${depth} * ${indentUnit}px - var(--gutter-width)/2)`,
                    top: `calc(50% - ${Math.max(1, lineWidth)}px)`,
                    height: `calc(50% + ${Math.max(2, lineWidth * 2)}px)`,
                  }"
                />
              </v-sheet>
            </template>

            <v-list-item-title class="text-body-1">{{
              node.name
            }}</v-list-item-title>
            <v-list-item-subtitle class="text-medium-emphasis">
              {{ hrefFor(node) }}
            </v-list-item-subtitle>

            <template #append>
              <v-menu location="bottom end" :close-on-content-click="true">
                <template #activator="{ props: m }">
                  <v-btn
                    v-bind="m"
                    icon
                    variant="text"
                    aria-label="Acciones"
                    @click.stop
                  >
                    <v-icon>mdi-dots-vertical</v-icon>
                  </v-btn>
                </template>
                <v-list density="compact">
                  <v-list-item @click="emitEdit(node)">
                    <v-list-item-title>Editar</v-list-item-title>
                  </v-list-item>
                  <v-list-item class="text-error" @click="onDeleteNode(node)">
                    <v-list-item-title>Eliminar</v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-menu>
            </template>
          </v-list-item>
        </template>

        <div
          class="pt-bridge"
          :style="{
            background: bridgeBackground(depth || 1, guides || [], last),
          }"
        />

        <template
          v-for="(child, ci) in node.children || []"
          :key="keyFor(child, ci)"
        >
          <page-tree-component
            :node="child"
            :depth="depth + 1"
            :guides="guidesForChild(ci, (node.children || []).length)"
            :last="ci === (node.children || []).length - 1"
            :cut-cols="nextCutColumns()"
            :max-depth="maxDepth"
            :base-url="baseUrl"
            :default-open="defaultOpen"
            :indent-unit="indentUnit"
            :force-top-as-roots="forceTopAsRoots"
            :line-color="lineColor"
            :line-width="lineWidth"
            @edit="emitEdit"
            @delete="emitDelete"
            @update:modelValue="emitValue"
          />
        </template>
      </v-list-group>

      <v-list-item
        class="pt-item"
        v-else
        :value="node.path"
        :style="{ paddingLeft: '0px' }"
      >
        <template #prepend>
          <v-sheet
            class="pt-gutter shrink-0"
            :width="indentPx"
            :style="gutterStyle"
          >
            <span
              class="pt-gfx"
              :style="{
                background: branchBackground(depth || 1, guides || [], last),
              }"
            />
            <span
              v-if="last && depth > 1"
              class="pt-mask"
              :style="{
                left: `calc(${depth} * ${indentUnit}px - var(--gutter-width)/2)`,
                top: `calc(50% - ${Math.max(1, lineWidth)}px)`,
                height: `calc(50% + ${Math.max(2, lineWidth * 2)}px)`,
              }"
            />
          </v-sheet>
        </template>

        <v-list-item-title class="text-body-1">{{
          node.name
        }}</v-list-item-title>
        <v-list-item-subtitle class="text-medium-emphasis">
          {{ hrefFor(node) }}
        </v-list-item-subtitle>

        <template #append>
          <v-menu location="bottom end" :close-on-content-click="true">
            <template #activator="{ props: m }">
              <v-btn
                v-bind="m"
                icon
                variant="text"
                aria-label="Acciones"
                @click.stop
              >
                <v-icon>mdi-dots-vertical</v-icon>
              </v-btn>
            </template>
            <v-list density="compact">
              <v-list-item @click="emitEdit(node)">
                <v-list-item-title>Editar</v-list-item-title>
              </v-list-item>
              <v-list-item class="text-error" @click="onDeleteNode(node)">
                <v-list-item-title>Eliminar</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </template>
      </v-list-item>
    </template>
  </client-only>
</template>

<style scoped>
:deep(.pt-gfx) {
  position: absolute;
  left: 0;
  right: 0;
  top: -3px;
  bottom: -3px;
  display: block;
  pointer-events: none;
  z-index: 3;
}
:deep(.v-list-item__overlay) {
  z-index: 0 !important;
}

:deep(.v-page-seo > .v-list-group__items),
:deep(.v-list-group--sub-group > .v-list-group__items),
:deep(.v-list-group--opened > .v-list-group__items) {
  padding-block: 0 !important;
  margin-block: 0 !important;
  gap: 0 !important;
  row-gap: 0 !important;
  position: relative;
}

:deep(.pt-bridge) {
  position: absolute;
  left: 0;
  right: 0;
  top: -3px;
  bottom: -3px;
  pointer-events: none;
  z-index: 2;
}

:deep(.v-list--density-default .v-list-item),
:deep(.v-list--density-comfortable .v-list-item),
:deep(.v-list--density-compact .v-list-item) {
  --v-list-item-padding-y: 0px !important;
  padding-top: 0 !important;
  padding-bottom: 0 !important;
  min-height: 0 !important;
}
:deep(.v-list) {
  --v-list-gap: 0px !important;
}
:deep(.v-list .v-list__items) {
  gap: 0 !important;
  row-gap: 0 !important;
}
:deep(.v-list-item) {
  margin: 0 !important;
}

:deep(.pt-mask) {
  position: absolute;
  width: var(--gutter-width);
  pointer-events: none;
}

:deep(.pt-root) {
  position: relative;
  overflow: visible;
  isolation: isolate;
}
:deep(.pt-root .pt-root-spine) {
  position: absolute;
  top: -16px;
  bottom: -16px;
  left: calc(var(--indent-unit) - var(--gutter-width) / 2);
  width: 0;
  border-left: var(--gutter-width) solid var(--gutter-color);
  pointer-events: none;
  z-index: 2;
}
</style>
