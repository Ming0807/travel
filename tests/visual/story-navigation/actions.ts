export async function saveStoryEditorialChangeAction(input: unknown) {
  window.dispatchEvent(new CustomEvent("fixture-story-save", { detail: input }));
  return { success: true, data: { updatedAt: new Date().toISOString(), revisionNumber: 2 } };
}
export async function saveStoryCoverAction() { return { success: false, error: "Fixture only" }; }
