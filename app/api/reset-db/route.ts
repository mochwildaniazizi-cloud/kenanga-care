import { NextResponse } from "next/server";
import { resetSystemData, deleteOtherMothersExceptIbuIka } from "@/app/actions/mothers";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");
  
  if (type === "all") {
    const result = await resetSystemData();
    return NextResponse.json(result);
  }
  
  const result = await deleteOtherMothersExceptIbuIka();
  return NextResponse.json(result);
}

export async function POST() {
  const result = await deleteOtherMothersExceptIbuIka();
  return NextResponse.json(result);
}
