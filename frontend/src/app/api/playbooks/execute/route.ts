import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { playbookId } = await req.json();
    
    // Simulate API delay for fan-out task creation
    await new Promise(resolve => setTimeout(resolve, 1500));

    let createdTasks = [];
    if (playbookId === "audit") {
      createdTasks = [
        { id: "t_sec_1", title: "Run static code analysis", agent: "SENTRY", status: "inbox" },
        { id: "t_lint_2", title: "Enforce ESLint boundaries", agent: "Bob", status: "inbox" },
        { id: "t_dep_3", title: "Audit NPM dependencies", agent: "SENTRY", status: "inbox" },
      ];
    } else if (playbookId === "deploy") {
      createdTasks = [
        { id: "t_dep_1", title: "Compile production build", agent: "Bob", status: "inbox" },
        { id: "t_dep_2", title: "Run end-to-end smoke tests", agent: "Alex", status: "inbox" },
      ];
    } else {
      createdTasks = [{ id: "t_gen_1", title: "General Playbook execution", agent: "Agent", status: "inbox" }];
    }

    return NextResponse.json({ success: true, tasks: createdTasks }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
