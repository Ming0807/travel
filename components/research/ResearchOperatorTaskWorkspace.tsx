"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { ArrowRight, CheckCircle, Clock, FloppyDisk, Play, SkipForward } from "@phosphor-icons/react";

import { saveResearchOperatorAttemptAction } from "@/app/actions/research-actions";

type Task = {
  taskId: string;
  taskCode: string;
  titleTh: string;
  instructionTh: string;
  maximumMinutes: number | null;
  attempt: {
    status: "not_started" | "in_progress" | "completed" | "skipped" | "abandoned";
    confidence: number | null;
    rationale: string | null;
  } | null;
};

type AttemptStatus = NonNullable<Task["attempt"]>["status"];

function taskStatusClass(status: AttemptStatus) {
  if (status === "completed") return "border-emerald-300 bg-emerald-50 text-emerald-800";
  if (status === "skipped") return "border-slate-300 bg-slate-100 text-slate-700";
  return "border-amber-300 bg-amber-50 text-amber-900";
}

function TaskForm({ task }: { task: Task }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [rationale, setRationale] = useState(task.attempt?.rationale ?? "");
  const [confidence, setConfidence] = useState<number | null>(task.attempt?.confidence ?? null);
  const [error, setError] = useState<string | null>(null);
  const completed = task.attempt?.status === "completed";
  const skipped = task.attempt?.status === "skipped";
  const terminal = completed || skipped || task.attempt?.status === "abandoned";
  const started = Boolean(task.attempt);
  const status = task.attempt?.status ?? "not_started";

  const save = (status: "in_progress" | "completed" | "skipped") => {
    setError(null);
    startTransition(async () => {
      const result = await saveResearchOperatorAttemptAction({
        taskCode: task.taskCode,
        status,
        confidence: status === "completed" ? confidence : null,
        rationale: status === "completed" ? rationale : undefined,
      });
      if (!result.success) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  };

  return (
    <article className="border border-slate-300 bg-white">
      <header className="border-b border-slate-200 p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="font-mono text-xs font-bold text-coral">{task.taskCode}</p>
            <h2 className="mt-1 text-xl font-black text-ink">{task.titleTh}</h2>
          </div>
          <span className={`inline-flex min-h-9 items-center gap-2 border px-3 text-xs font-black ${taskStatusClass(status)}`}>
            {completed ? <CheckCircle aria-hidden="true" weight="fill" /> : null}
            {completed ? "ทำเสร็จแล้ว" : skipped ? "ข้ามแล้ว" : "รอดำเนินการ"}
          </span>
        </div>
        <p className="mt-4 whitespace-pre-line text-sm leading-7 text-slate-700">{task.instructionTh}</p>
        {task.maximumMinutes ? <p className="mt-4 inline-flex items-center gap-2 border-l-2 border-teal bg-teal/5 p-4 text-sm font-bold text-teal"><Clock aria-hidden="true" /> เวลาที่แนะนำไม่เกิน {task.maximumMinutes} นาที</p> : null}
      </header>

      <div className="p-5 sm:p-6">
        {!started ? (
          <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
            <button type="button" disabled={isPending} onClick={() => save("in_progress")} className="inline-flex min-h-12 items-center justify-center gap-2 bg-teal px-5 font-black text-white hover:bg-ink disabled:cursor-wait disabled:opacity-60"><Play aria-hidden="true" weight="fill" /> {isPending ? "กำลังเริ่ม..." : "เริ่มงานและจับเวลา"}</button>
            <button type="button" disabled={isPending} onClick={() => save("skipped")} className="inline-flex min-h-12 items-center justify-center gap-2 border border-slate-300 bg-white px-5 font-bold text-slate-600 hover:bg-slate-50"><SkipForward aria-hidden="true" /> ข้ามงานนี้</button>
          </div>
        ) : terminal ? (
          <div className="border-l-2 border-teal bg-teal/5 p-4">
            <p className="font-black text-teal">
              {completed ? "บันทึกงานนี้เรียบร้อยแล้ว" : skipped ? "เลือกข้ามงานนี้แล้ว" : "งานนี้สิ้นสุดแล้ว"}
            </p>
            {completed && task.attempt?.confidence ? (
              <p className="mt-2 text-sm text-slate-700">ความมั่นใจต่อคำตอบ {task.attempt.confidence}/5</p>
            ) : null}
            {completed && task.attempt?.rationale ? (
              <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-700">{task.attempt.rationale}</p>
            ) : null}
            <p className="mt-2 text-xs text-slate-500">คำตอบที่ส่งแล้วถูกล็อกเพื่อรักษาความถูกต้องของข้อมูลวิจัย</p>
          </div>
        ) : (
          <>
        <label className="block text-sm font-black text-ink">
          เหตุผลประกอบการตัดสินใจ
          <textarea
            rows={5}
            maxLength={4000}
            value={rationale}
            onChange={(event) => setRationale(event.target.value)}
            disabled={isPending}
            placeholder="อธิบายว่าคุณอ่านข้อมูลใดและตัดสินใจอย่างไร โดยไม่ใส่ชื่อ เบอร์โทร หรือข้อมูลส่วนบุคคล"
            className="mt-2 w-full resize-y border border-slate-300 bg-white px-4 py-3 font-normal leading-6 outline-none focus:border-teal focus:ring-2 focus:ring-teal/20"
          />
        </label>

        <fieldset className="mt-5">
          <legend className="text-sm font-black text-ink">ความมั่นใจต่อคำตอบ</legend>
          <div className="mt-2 grid grid-cols-5 gap-2">
            {[1, 2, 3, 4, 5].map((score) => (
              <label key={score} className="cursor-pointer text-center">
                <input type="radio" name={`confidence-${task.taskCode}`} value={score} checked={confidence === score} onChange={() => setConfidence(score)} className="peer sr-only" />
                <span className={`flex min-h-12 items-center justify-center border text-sm font-black peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-teal ${confidence === score ? "border-teal bg-teal text-white" : "border-slate-300 bg-white text-slate-700"}`}>{score}</span>
              </label>
            ))}
          </div>
          <div className="mt-1 flex justify-between text-xs text-slate-500"><span>ไม่มั่นใจ</span><span>มั่นใจมาก</span></div>
        </fieldset>

        {error ? <p role="alert" className="mt-4 border border-rose-300 bg-rose-50 p-3 text-sm font-bold text-rose-800">{error}</p> : null}

        <div className="mt-5 grid gap-2 sm:grid-cols-[1fr_auto]">
          <button type="button" disabled={isPending} onClick={() => save("completed")} className="inline-flex min-h-12 items-center justify-center gap-2 bg-teal px-5 font-black text-white hover:bg-ink disabled:cursor-wait disabled:opacity-60">
            <FloppyDisk aria-hidden="true" /> {isPending ? "กำลังบันทึก..." : completed ? "อัปเดตคำตอบ" : "บันทึกว่างานเสร็จ"}
          </button>
          <button type="button" disabled={isPending} onClick={() => save("skipped")} className="inline-flex min-h-12 items-center justify-center gap-2 border border-slate-300 bg-white px-5 font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-60">
            <SkipForward aria-hidden="true" /> ข้ามงานนี้
          </button>
        </div>
          </>
        )}
      </div>
    </article>
  );
}

export function ResearchOperatorTaskWorkspace({ tasks, completedTasks }: { tasks: Task[]; completedTasks: number }) {
  const allDone = tasks.length > 0 && completedTasks === tasks.length;
  return (
    <div className="space-y-6">
      <div className="sticky top-0 z-10 border border-slate-300 bg-white/95 p-4 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/90">
        <div className="flex items-center justify-between gap-4 text-sm">
          <p className="font-black">ความคืบหน้า {completedTasks}/{tasks.length} งาน</p>
          <p className="text-slate-600">บันทึกทีละงานและกลับมาต่อได้</p>
        </div>
        <div className="mt-3 h-2 bg-slate-200"><div className="h-full bg-coral transition-[width]" style={{ width: `${tasks.length ? (completedTasks / tasks.length) * 100 : 0}%` }} /></div>
      </div>

      {tasks.map((task) => <TaskForm key={task.taskId} task={task} />)}

      <div className="flex flex-wrap gap-3">
        <Link href="/admin/dashboard" target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center border border-slate-300 bg-white px-4 text-sm font-black text-slate-700">เปิด Dashboard</Link>
        <Link href="/admin/attractions" target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center border border-slate-300 bg-white px-4 text-sm font-black text-slate-700">เปิดงานปรับปรุงสถานที่</Link>
      </div>

      <div className="border border-slate-300 bg-white p-5 sm:p-6">
        <p className="text-sm leading-6 text-slate-700">เมื่อทำโจทย์ครบแล้ว กรุณาตอบแบบประเมินการใช้ Dashboard เพื่อวัดความง่าย ประโยชน์ และความมั่นใจในการนำข้อมูลไปตัดสินใจ</p>
        {allDone ? (
          <Link href="/research/operator/evaluation" className="mt-4 inline-flex min-h-12 w-full items-center justify-center gap-2 bg-coral px-5 font-black text-white hover:bg-ink sm:w-auto">
            ไปทำแบบประเมิน <ArrowRight aria-hidden="true" />
          </Link>
        ) : <p className="mt-4 text-sm font-bold text-amber-800">ต้องทำหรือเลือกข้ามทุกงานก่อนเข้าสู่แบบประเมิน</p>}
      </div>
    </div>
  );
}
