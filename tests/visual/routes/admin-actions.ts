type State = { success: boolean; error?: string };

// Browser fixtures must not import real server mutations or touch Supabase.
export async function createRouteAction(_state: State, _form: FormData) {
  return { success: true, data: { id: 1, slug: "fixture-route" } };
}

export async function updateRouteAction(_id: number, _state: State, _form: FormData) {
  return { success: true };
}

export async function updateRouteStopsAction(_id: number, _state: State, _form: FormData) {
  return { success: true };
}

export async function toggleRoutePublishAction(_id: number) {
  return { success: false, error: "QA fixture: ทดสอบการแสดงข้อผิดพลาดเท่านั้น ไม่มีการเผยแพร่จริง" };
}
