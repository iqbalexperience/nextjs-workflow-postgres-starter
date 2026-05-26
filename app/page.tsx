"use client";

import { useState } from "react";
import { toast, Toaster } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ModeToggle } from "@/components/theme-toggle";
import {
  Play,
  ExternalLink,
  Mail,
  Loader2,
  Sparkles,
  CheckCircle2,
  Clock,
  Database,
  Send,
  Workflow
} from "lucide-react";

export default function Home() {
  const [email, setEmail] = useState("developer@workflow.dev");
  const [isTriggering, setIsTriggering] = useState(false);
  const [activeStep, setActiveStep] = useState<number>(0);

  const handleTrigger = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isTriggering) return;

    setIsTriggering(true);
    setActiveStep(1);

    try {
      const response = await fetch("/api/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error("Failed to start workflow");
      }

      const data = await response.json();
      toast.success("Workflow run initiated!", {
        description: data.message || `Started successfully for ${email}`,
      });

      // Visually simulate the timeline steps to demonstrate how a durable workflow runs in the background
      setTimeout(() => setActiveStep(2), 1500);
      setTimeout(() => setActiveStep(3), 3000);
      setTimeout(() => setActiveStep(4), 8000); // Account for 5s sleep in the workflow definition
      setTimeout(() => {
        setActiveStep(0);
        toast.success("Workflow run completed!", {
          description: `All steps successfully processed for ${email}`,
        });
      }, 10000);

    } catch (error) {
      toast.error("Execution failed", {
        description: error instanceof Error ? error.message : "Something went wrong. Please check your workflow server.",
      });
      setActiveStep(0);
    } finally {
      setIsTriggering(false);
    }
  };

  const handleViewWorkflows = () => {
    const workflowUrl = process.env.NEXT_PUBLIC_WORKFLOW_URL || "http://localhost:4200";
    window.open(workflowUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <main className="flex-1 flex flex-col items-center justify-center min-h-screen p-4 md:p-8 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-slate-100 overflow-hidden relative">
      <Toaster position="bottom-right" richColors />

      {/* Premium Ambient Light Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-violet-600/10 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-600/10 blur-[130px] pointer-events-none" />

      <div className="absolute top-4 right-4 z-50">
        <ModeToggle />
      </div>

      <div className="w-full max-w-2xl z-10 space-y-6">
        <div className="backdrop-blur-xl bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 md:p-8 shadow-[0_0_50px_-12px_rgba(99,102,241,0.2)] space-y-6">
          {/* Header */}
          <div className="space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Sparkles className="size-3.5 animate-pulse" />
              Next.js & Vercel Workflow SDK
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-400">
              User Signup Orchestrator Example
            </h1>
            <p className="text-sm md:text-base text-slate-400 max-w-xl leading-relaxed">
              Trigger durable, persistent, step-based workflows that automatically checkpoint state, sleep efficiently, and retry on transient failures.
            </p>
          </div>

          {/* Interaction Area */}
          <form onSubmit={handleTrigger} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-xs font-semibold tracking-wide uppercase text-slate-400 flex items-center gap-1.5">
                <Mail className="size-3.5 text-indigo-400" />
                Email Address
              </label>
              <div className="relative flex items-center">
                <Input
                  id="email"
                  type="email"
                  required
                  placeholder="developer@workflow.dev"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-slate-950/50 border-slate-850 focus:border-indigo-500/50 text-white placeholder:text-slate-600 h-11 px-3 pl-10 transition-all rounded-lg"
                />
                <Mail className="absolute left-3.5 size-4 text-slate-500 pointer-events-none" />
              </div>
              <p className="text-[11px] text-slate-500">
                Provide any valid email address to test the orchestration steps.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button
                type="submit"
                disabled={isTriggering}
                className="flex-1 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white border-0 shadow-lg shadow-indigo-600/10 active:translate-y-0.5 h-11 gap-2 font-semibold tracking-wide rounded-lg cursor-pointer transition-all"
              >
                {isTriggering ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Triggering...
                  </>
                ) : (
                  <>
                    <Play className="size-4 fill-current text-white" />
                    Trigger
                  </>
                )}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={handleViewWorkflows}
                className="border-slate-800 hover:border-slate-700 bg-slate-950/40 hover:bg-slate-900/80 text-slate-300 hover:text-white h-11 gap-2 font-semibold tracking-wide rounded-lg cursor-pointer transition-all"
              >
                View Workflows
                <ExternalLink className="size-4 text-slate-400" />
              </Button>
            </div>
          </form>

          {/* Workflow Step Visualizer */}
          <div className="border-t border-slate-800/60 pt-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Workflow className="size-3.5 text-indigo-400" />
                Workflow Pipeline Execution
              </h3>
              <span className="text-[10px] font-mono text-slate-500 bg-slate-950/60 px-2 py-0.5 rounded border border-slate-850">
                user-signup.ts
              </span>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {/* Step 1 */}
              <div className={`p-3.5 rounded-xl border transition-all duration-300 ${activeStep === 1 ? 'border-indigo-500/60 bg-indigo-500/5 shadow-[0_0_15px_-3px_rgba(99,102,241,0.2)]' : 'border-slate-800/60 bg-slate-950/20'}`}>
                <div className="flex items-center gap-2 mb-1.5">
                  <div className={`size-5.5 rounded-full flex items-center justify-center text-[10px] font-bold transition-all duration-300 ${activeStep === 1 ? 'bg-indigo-500 text-white animate-pulse' : 'bg-slate-800 text-slate-400'}`}>
                    1
                  </div>
                  <span className="text-xs font-semibold text-slate-200">Create User Record</span>
                  <Database className={`size-3.5 ml-auto transition-colors ${activeStep === 1 ? 'text-indigo-400' : 'text-slate-500'}`} />
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Generates a secure cryptographical UUID and commits the record asynchronously.
                </p>
              </div>

              {/* Step 2 */}
              <div className={`p-3.5 rounded-xl border transition-all duration-300 ${activeStep === 2 ? 'border-indigo-500/60 bg-indigo-500/5 shadow-[0_0_15px_-3px_rgba(99,102,241,0.2)]' : 'border-slate-800/60 bg-slate-950/20'}`}>
                <div className="flex items-center gap-2 mb-1.5">
                  <div className={`size-5.5 rounded-full flex items-center justify-center text-[10px] font-bold transition-all duration-300 ${activeStep === 2 ? 'bg-indigo-500 text-white animate-pulse' : 'bg-slate-800 text-slate-400'}`}>
                    2
                  </div>
                  <span className="text-xs font-semibold text-slate-200">Send Welcome Email</span>
                  <Send className={`size-3.5 ml-auto transition-colors ${activeStep === 2 ? 'text-indigo-400' : 'text-slate-500'}`} />
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Triggers mailing API. Handles the 30% mock network failure rate with automatic retries.
                </p>
              </div>

              {/* Step 3 */}
              <div className={`p-3.5 rounded-xl border transition-all duration-300 ${activeStep === 3 ? 'border-indigo-500/60 bg-indigo-500/5 shadow-[0_0_15px_-3px_rgba(99,102,241,0.2)]' : 'border-slate-800/60 bg-slate-950/20'}`}>
                <div className="flex items-center gap-2 mb-1.5">
                  <div className={`size-5.5 rounded-full flex items-center justify-center text-[10px] font-bold transition-all duration-300 ${activeStep === 3 ? 'bg-indigo-500 text-white animate-pulse' : 'bg-slate-800 text-slate-400'}`}>
                    3
                  </div>
                  <span className="text-xs font-semibold text-slate-200">Sleep & Suspend (5s)</span>
                  <Clock className={`size-3.5 ml-auto transition-colors ${activeStep === 3 ? 'text-indigo-400' : 'text-slate-500'}`} />
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Persistent sleep. Stops active serverless execution to save computing cost.
                </p>
              </div>

              {/* Step 4 */}
              <div className={`p-3.5 rounded-xl border transition-all duration-300 ${activeStep === 4 ? 'border-indigo-500/60 bg-indigo-500/5 shadow-[0_0_15px_-3px_rgba(99,102,241,0.2)]' : 'border-slate-800/60 bg-slate-950/20'}`}>
                <div className="flex items-center gap-2 mb-1.5">
                  <div className={`size-5.5 rounded-full flex items-center justify-center text-[10px] font-bold transition-all duration-300 ${activeStep === 4 ? 'bg-indigo-500 text-white animate-pulse' : 'bg-slate-800 text-slate-400'}`}>
                    4
                  </div>
                  <span className="text-xs font-semibold text-slate-200">Onboarding Finish</span>
                  <CheckCircle2 className={`size-3.5 ml-auto transition-colors ${activeStep === 4 ? 'text-indigo-400' : 'text-slate-500'}`} />
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Runs validation constraints, sends final checklist resources, and finishes run.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Reference */}
        <div className="text-center text-xs text-slate-500 flex items-center justify-center gap-1.5 mt-2 animate-fade-in">
          <span>Powered by</span>
          <a
            href="https://workflow-sdk.dev/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-400 hover:text-indigo-300 underline underline-offset-4 font-semibold transition-colors inline-flex items-center gap-0.5"
          >
            Workflow SDK
            <ExternalLink className="size-3" />
          </a>
        </div>
      </div>
    </main>
  );
}
