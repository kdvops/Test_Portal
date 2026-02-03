import { describe, it, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { registerEndpoint } from "@nuxt/test-utils/runtime";
import AuthorsComponent from "~/components/authors-component/index.vue";

const sampleAuthors = [
  {
    name: "John Doe",
    position: "Editor",
    image: { image: "/img1.jpg" },
    socials: {
      x: "https://x.com/john",
      facebook: "",
      linkedin: "",
    },
  },
  {
    name: "Jane Smith",
    position: "Writer",
    image: { image: "/img2.jpg" },
    socials: {
      x: "",
      facebook: "https://facebook.com/jane",
      linkedin: "",
    },
  },
];

function mountComponent(options: any = {}) {
  return mount(AuthorsComponent, {
    props: { modelValue: sampleAuthors, ...options.props },
    global: {
      stubs: {
        "detailed-image-component": true,
      },
    },
  });
}

describe("AuthorsComponent", () => {
  it("computes combinedNames correctly", () => {
    const wrapper = mountComponent({
      props: {
        modelValue: [
          { name: "John Doe" },
          { name: "Jane Smith" },
          { name: "Bob Marley" },
        ],
      },
    });

    const vm = wrapper.vm as any;

    expect(vm.combinedNames).toBe("John Doe, Jane Smith y Bob Marley");
  });

  it("opens the modal", async () => {
    const wrapper = mountComponent();
    expect((wrapper.vm as any).modal.open).toBe(false);

    await wrapper.findComponent({ name: "v-btn" }).trigger("click");
    expect((wrapper.vm as any).modal.open).toBe(true);
  });

  it("opens empty form when creating a new author", () => {
    const wrapper = mountComponent({
      props: { modelValue: sampleAuthors },
    });

    wrapper.vm.openModal();
    wrapper.vm.newAuthor();

    expect(wrapper.vm.modal.form).toEqual({
      name: "",
      position: "",
      image: undefined,
      socials: {},
    });

    expect(wrapper.vm.modal.formIndex).toBe(-1);
  });

  it("can create a new author entry", async () => {
    const wrapper = mountComponent();

    await wrapper.findComponent({ name: "v-btn" }).trigger("click");

    (wrapper.vm as any).newAuthor();
    expect((wrapper.vm as any).modal.form).toEqual({
      name: "",
      position: "",
      image: undefined,
      socials: {},
    });
  });

  it("can edit an existing author", async () => {
    const wrapper = mountComponent();

    await wrapper.findComponent({ name: "v-btn" }).trigger("click");
    (wrapper.vm as any).editAuthor(0);

    expect((wrapper.vm as any).modal.form?.name).toBe("John Doe");
    expect((wrapper.vm as any).modal.formIndex).toBe(0);
  });

  it("removes an author from draft list", async () => {
    const wrapper = mountComponent();

    await wrapper.findComponent({ name: "v-btn" }).trigger("click");

    (wrapper.vm as any).removeAuthor(0);
    expect((wrapper.vm as any).draftList?.length).toBe(1);
  });

  it("saves form and updates model", async () => {
    const spy = vi.fn();

    const wrapper = mount(AuthorsComponent, {
      props: {
        modelValue: sampleAuthors,
        "onUpdate:modelValue": spy,
      },
      global: {
        stubs: {
          "detailed-image-component": true,
        },
      },
    });

    // Open the modal properly
    await wrapper.findComponent({ name: "v-btn" }).trigger("click");

    // Edit first author
    wrapper.vm.editAuthor(0);
    wrapper.vm.modal.form!.name = "Updated Name";
    wrapper.vm.saveForm();

    // Confirm
    wrapper.vm.confirm();

    expect(spy).toHaveBeenCalled();
    expect(spy).toHaveBeenCalledWith(expect.any(Array));
  });

  it("detects if a row has socials", () => {
    const wrapper = mountComponent();

    const vm = wrapper.vm as any;
    expect(vm.hasAnySocial(sampleAuthors[0])).toBe(true);
    expect(
      vm.hasAnySocial({
        name: "X",
        socials: { x: "", facebook: "", linkedin: "" },
      })
    ).toBe(false);
  });
});
