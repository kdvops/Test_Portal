<script lang="ts">
import { Vue, Prop, Emit, Ref } from "vue-facing-decorator";

type VVariant = "elevated" | "flat" | "tonal" | "outlined" | "text" | "plain";
type Target = "window" | "parent";
type Anchor = "fixed" | "absolute" | "sticky";
type Horizontal = "end" | "start";

@NuxtComponent({
  name: "go-to-top-component",
})
export default class GoToTopComponent extends Vue {
  @Prop({ default: 200 }) readonly threshold!: number;
  @Prop({ default: "primary" }) readonly color!: string;
  @Prop({ default: "elevated" }) readonly variant!: VVariant;
  @Prop({ default: 12 }) readonly elevation!: number;
  @Prop({ default: "Top" }) readonly label!: string;
  @Prop({ default: true }) readonly iconOnly!: boolean;
  @Prop({ default: "smooth" }) readonly behavior!: ScrollBehavior;
  @Prop({ default: "Scroll to top" }) readonly ariaLabel!: string;
  @Prop({ default: "window" }) readonly target!: Target;
  @Prop({ default: "fixed" }) readonly anchor!: Anchor;
  @Prop({ default: "me-4 mb-4" }) readonly cornerSpacingClasses!: string;
  @Prop({ default: "end" }) readonly horizontal!: Horizontal;

  @Ref("rootEl") readonly rootEl!: HTMLElement | undefined;

  visible = false;
  scrollEl: HTMLElement | Window | null = null;
  ticking = false;

  get containerClasses(): string[] {
    const base = [
      "d-flex",
      "justify-end",
      "align-end",
      this.cornerSpacingClasses,
    ];
    const side = this.horizontal === "start" ? "start-0" : "end-0";
    if (this.anchor === "absolute")
      return ["position-absolute", "bottom-0", side, ...base];
    if (this.anchor === "sticky")
      return ["position-sticky", "bottom-0", ...base];
    return ["position-fixed", "bottom-0", side, ...base];
  }

  @Emit("go-top")
  emitGoTop(): void {}

  @Emit("visible-change")
  emitVisibleChange(value: boolean): boolean {
    return value;
  }

  getMetrics(el: Element | Window) {
    if (el === window) {
      const doc = document.documentElement;
      const scrollTop =
        window.scrollY || doc.scrollTop || document.body.scrollTop || 0;
      const clientHeight = doc.clientHeight;
      const scrollHeight = Math.max(
        doc.scrollHeight,
        doc.offsetHeight,
        document.body?.scrollHeight || 0
      );
      return { scrollTop, clientHeight, scrollHeight };
    } else {
      const e = el as HTMLElement;
      return {
        scrollTop: e.scrollTop,
        clientHeight: e.clientHeight,
        scrollHeight: e.scrollHeight,
      };
    }
  }

  onScroll() {
    if (this.ticking) return;
    this.ticking = true;
    requestAnimationFrame(() => {
      const el = (this.scrollEl || window) as HTMLElement | Window;
      const { scrollTop } = this.getMetrics(el);
      const next = scrollTop > this.threshold;
      if (next !== this.visible) {
        this.visible = next;
        this.emitVisibleChange(this.visible);
      }
      this.ticking = false;
    });
  }

  scrollToTop() {
    if (this.scrollEl && this.scrollEl !== window) {
      (this.scrollEl as HTMLElement).scrollTo({
        top: 0,
        behavior: this.behavior,
      });
    } else {
      window.scrollTo({ top: 0, behavior: this.behavior });
    }
  }

  handleClick() {
    this.scrollToTop();
    this.emitGoTop();
  }

  findScrollParent(node: HTMLElement | null): HTMLElement | null {
    let el: HTMLElement | null = node;
    while (el && el !== document.body) {
      const style = window.getComputedStyle(el);
      const overflowY = style.overflowY;
      if (
        /(auto|scroll|overlay)/.test(overflowY) &&
        el.scrollHeight > el.clientHeight
      )
        return el;
      el = el.parentElement;
    }
    return null;
  }

  mounted() {
    if (this.target === "parent") {
      const hostParent = this.rootEl?.parentElement || null;
      const parent = this.findScrollParent(hostParent);
      this.scrollEl = parent || window;
    } else {
      this.scrollEl = window;
    }
    const target: any = this.scrollEl || window;
    target.addEventListener?.("scroll", this.onScroll as any, {
      passive: true,
    });
    this.onScroll();
  }

  unmounted() {
    const target: any = this.scrollEl || window;
    target.removeEventListener?.("scroll", this.onScroll as any);
  }
}
</script>

<template>
  <ClientOnly>
    <div
      ref="rootEl"
      v-show="visible"
      :class="containerClasses"
      role="button"
      :aria-label="ariaLabel"
      @click="handleClick"
    >
      <v-fab-transition>
        <v-btn
          v-if="visible"
          :icon="iconOnly"
          :variant="variant"
          :elevation="elevation"
          :color="color"
          class="elevation-12"
        >
          <template v-if="iconOnly">
            <v-icon icon="mdi-arrow-up" />
          </template>
          <template v-else>
            <v-icon icon="mdi-arrow-up" class="mr-2" />
            {{ label }}
          </template>
        </v-btn>
      </v-fab-transition>
    </div>
  </ClientOnly>
</template>
