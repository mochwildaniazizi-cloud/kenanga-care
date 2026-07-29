import { NextResponse } from "next/server";
import { resetSystemData } from "@/app/actions/mothers";

export async function GET() {
  const result = await resetSystemData();
  return NextResponse.json(result);
}

export async function POST() {
  const result = await resetSystemData();
  return NextResponse.json(result);
}
