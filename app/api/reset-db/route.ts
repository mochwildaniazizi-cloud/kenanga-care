import { NextResponse } from "next/server";
import { resetSystemData, deleteOtherMothersExceptIbuIka, deleteAllMothersFromList } from "@/app/actions/mothers";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");
  
  if (type === "all") {
    const result = await resetSystemData();
    return NextResponse.json(result);
  }
  
  if (type === "clear_list") {
    const result = await deleteAllMothersFromList();
    return NextResponse.json(result);
  }

  const result = await deleteOtherMothersExceptIbuIka();
  return NextResponse.json(result);
}

export async function POST() {
  const result = await deleteAllMothersFromList();
  return NextResponse.json(result);
}
