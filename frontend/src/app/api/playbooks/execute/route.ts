import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { playbookId } = await req.json();

    await new Promise(resolve => setTimeout(resolve, 1500));

    let createdTasks = [];
    if (playbookId === "runtime-audit") {
      createdTasks = [
        { id: "t_rt_1", title: "Review runtime truth against Mission Control", agent: "OPI", status: "inbox" },
        { id: "t_rt_2", title: "Verify builder board has one clear next task", agent: "Bob", status: "inbox" },
      ];
    } else if (playbookId === "delivery-review") {
      createdTasks = [
        { id: "t_del_1", title: "Implement highest-value Job Hunter OS task", agent: "Bob", status: "inbox" },
        { id: "t_del_2", title: "Review artifact, impact, and blockers", agent: "OPI", status: "inbox" },
      ];
    } else {
      createdTasks = [{ id: "t_gen_1", title: "Mission Control follow-up", agent: "OPI", status: "inbox" }];
    }

    return NextResponse.json({ success: true, tasks: createdTasks }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
