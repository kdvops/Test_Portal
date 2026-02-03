import type {
  FinanciallyGroupInterface,
  FinanciallyInterface,
} from "~/interfaces/financially.interface";

/**
 * - Looks for the group according to the post type
 * - It counts how many posts of the given type are pinned
 * - Returns:
 *   - true if there are less than `maxPins` or the post is already pinned
 *   - false if there are already `maxPins` pinned of that type and the post is NOT pinned.
 */
export function shouldDisplayTogglePin(
  financiallyGroups: FinanciallyGroupInterface[],
  financiallyPost: FinanciallyInterface,
  maxPins = 3
): boolean {
  const financiallyGroup = financiallyGroups.find(
    (group) => group.type === financiallyPost.type
  );

  const pinCounter = financiallyGroup?.financially?.reduce<
    Record<string, number>
  >((acc, post) => {
    if (!post.pinnedAt) return acc;

    const key = post.type;
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});

  const pinnedCountForType = pinCounter?.[financiallyPost.type] ?? 0;

  return pinnedCountForType < maxPins || !!financiallyPost.pinnedAt;
}
