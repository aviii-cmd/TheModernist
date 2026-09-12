import { createClient } from "@/lib/supabase/server";
import { getSubmissions } from "@/lib/queries/submissions";
import SubmissionCard from "@/components/SubmissionCard";

export const revalidate = 0;
export const metadata = { title: "Submissions" };

export default async function SubmissionsPage() {
  const supabase = await createClient();
  const submissions = await getSubmissions(supabase);

  return (
    <div>
      <h1 className="font-serif text-2xl font-semibold text-ink">Submissions</h1>
      <p className="mt-1 text-ink-secondary">{submissions.length} story tip(s) from the school community.</p>

      <div className="mt-6 space-y-3">
        {submissions.length === 0 && <p className="text-ink-secondary">No submissions yet.</p>}
        {submissions.map((submission) => (
          <SubmissionCard key={submission.id} submission={submission} />
        ))}
      </div>
    </div>
  );
}
