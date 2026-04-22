import { cn } from "@/lib/utils"

type Step = "drafts" | "publish" | "releases" | "version" | "change"

const steps: Array<{ key: Step; label: string; description: string }> = [
  { key: "drafts", label: "Draft changes", description: "Saved work waiting for review" },
  { key: "publish", label: "Publish", description: "Make reviewed changes live" },
  { key: "releases", label: "Published versions", description: "What is live or historic" },
  { key: "version", label: "Version details", description: "What changed together" },
  { key: "change", label: "Change details", description: "One item before and after" },
]

export function ChangelogWorkflowRail({ current }: { current: Step }) {
  return (
    <div className="rounded-lg border bg-background p-3">
      <div className="grid gap-2 md:grid-cols-5">
        {steps.map((step, index) => {
          const isCurrent = step.key === current
          return (
            <div
              key={step.key}
              className={cn(
                "rounded-md border px-3 py-2",
                isCurrent ? "border-primary/30 bg-primary/10 text-primary" : "bg-muted/30 text-muted-foreground",
              )}
            >
              <div className="text-xs font-semibold uppercase tracking-wide">
                {index + 1}. {step.label}
              </div>
              <div className="mt-1 text-xs">{step.description}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
