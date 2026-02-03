import { describe, it, expect } from "vitest";
import type {
  FinanciallyGroupInterface,
  FinanciallyInterface,
} from "~/interfaces/financially.interface";
import { shouldDisplayTogglePin } from "../../utils/financiallyPins";

function createGroups(): FinanciallyGroupInterface[] {
  return [
    {
      type: "post::article",
      financially: [
        {
          _id: "1",
          type: "post::article",
          title: "Article 1",
          pinnedAt: null,
          slug: "",
          excerpt: "",
          subtitle: "",
          description: "",
          file: "",
          sections: [],
          disabled: false,
        },
        {
          _id: "2",
          type: "post::article",
          title: "Article 2",
          pinnedAt: null,
          slug: "",
          excerpt: "",
          subtitle: "",
          description: "",
          file: "",
          sections: [],
          disabled: false,
        },
        {
          _id: "3",
          type: "post::article",
          title: "Article 3",
          pinnedAt: null,
          slug: "",
          excerpt: "",
          subtitle: "",
          description: "",
          file: "",
          sections: [],
          disabled: false,
        },
        {
          _id: "4",
          type: "post::article",
          title: "Article 4",
          pinnedAt: null,
          slug: "",
          excerpt: "",
          subtitle: "",
          description: "",
          file: "",
          sections: [],
          disabled: false,
        },
      ],
    },
    {
      type: "post::event",
      financially: [
        {
          _id: "11",
          type: "post::events",
          title: "Event 1",
          pinnedAt: null,
          slug: "",
          excerpt: "",
          subtitle: "",
          description: "",
          file: "",
          sections: [],
          disabled: false,
        },
        {
          _id: "12",
          type: "post::events",
          title: "Event 2",
          pinnedAt: null,
          slug: "",
          excerpt: "",
          subtitle: "",
          description: "",
          file: "",
          sections: [],
          disabled: false,
        },
      ],
    },
  ];
}

describe("shouldDisplayTogglePin", () => {
  it("returns true when no posts of that type are pinned", () => {
    // Arrange
    const groups = createGroups();
    const post = groups[0].financially[0]; // post::article, not pinned

    // Act
    const result = shouldDisplayTogglePin(groups, post);

    // Assert
    expect(result).toBe(true);
  });

  it("returns true while there are less than 3 pinned posts of that type", () => {
    // Arrange
    const groups = createGroups();
    const articleGroup = groups[0];

    articleGroup.financially[0].pinnedAt = "2025-01-01T00:00:00Z";
    articleGroup.financially[1].pinnedAt = "2025-01-02T00:00:00Z";

    const candidate = articleGroup.financially[2]; // same type, not pinned

    // Act
    const result = shouldDisplayTogglePin(groups, candidate);

    // Assert
    expect(result).toBe(true);
  });

  it("returns false for a new post when there are already 3 pinned posts of that type", () => {
    // Arrange
    const groups = createGroups();
    const articleGroup = groups[0];

    articleGroup.financially[0].pinnedAt = "2025-01-01T00:00:00Z";
    articleGroup.financially[1].pinnedAt = "2025-01-02T00:00:00Z";
    articleGroup.financially[2].pinnedAt = "2025-01-03T00:00:00Z";

    const newPost = articleGroup.financially[3]; // same type, not pinned

    // Act
    const result = shouldDisplayTogglePin(groups, newPost);

    // Assert
    expect(result).toBe(false);
  });

  it("returns true for an already pinned post even when there are 3 pinned posts of that type", () => {
    // Arrange
    const groups = createGroups();
    const articleGroup = groups[0];

    articleGroup.financially[0].pinnedAt = "2025-01-01T00:00:00Z";
    articleGroup.financially[1].pinnedAt = "2025-01-02T00:00:00Z";
    articleGroup.financially[2].pinnedAt = "2025-01-03T00:00:00Z";

    const alreadyPinned = articleGroup.financially[0];

    // Act
    const result = shouldDisplayTogglePin(groups, alreadyPinned);

    // Assert
    expect(result).toBe(true);
  });

  it("does not count pinned posts from other types", () => {
    // Arrange
    const groups = createGroups();
    const articleGroup = groups[0];
    const eventGroup = groups[1];

    // Pin 3 events
    eventGroup.financially[0].pinnedAt = "2025-01-01T00:00:00Z";
    eventGroup.financially[1].pinnedAt = "2025-01-02T00:00:00Z";
    eventGroup.financially.push({
      _id: "13",
      type: "post::release",
      title: "Event 3",
      pinnedAt: "2025-01-03T00:00:00Z",
      slug: "",
      excerpt: "",
      subtitle: "",
      description: "",
      file: "",
      sections: [],
      disabled: false,
    });

    const articleCandidate = articleGroup.financially[0]; // article, not pinned

    // Act
    const result = shouldDisplayTogglePin(groups, articleCandidate);

    // Assert
    expect(result).toBe(true);
  });

  it("respects a custom maxPins value", () => {
    // Arrange
    const groups = createGroups();
    const articleGroup = groups[0];

    articleGroup.financially[0].pinnedAt = "2025-01-01T00:00:00Z";
    articleGroup.financially[1].pinnedAt = "2025-01-02T00:00:00Z";

    const candidate = articleGroup.financially[2];
    const maxPins = 2;

    // Act
    const result = shouldDisplayTogglePin(groups, candidate, maxPins);

    // Assert
    expect(result).toBe(false);
  });
});
