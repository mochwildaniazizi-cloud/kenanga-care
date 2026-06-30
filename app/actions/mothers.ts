"use server";

import { prisma } from "@/lib/prisma";
import fs from "fs";
import { calculateZScore, getNutritionalStatus } from "@/utils/zScoreCalculator";

const AVATAR_FILE_PATH = "c:/Code/kenanga-care/custom_avatars.json";

function getCustomAvatars() {
  try {
    if (fs.existsSync(AVATAR_FILE_PATH)) {
      const content = fs.readFileSync(AVATAR_FILE_PATH, "utf-8");
      return JSON.parse(content);
    }
  } catch (err) {
    console.error("Error reading custom avatars:", err);
  }
  return { mothers: {}, children: {} };
}

function saveCustomAvatar(type: "mothers" | "children", id: string, url: string | null) {
  try {
    const data = getCustomAvatars();
    if (!data[type]) data[type] = {};
    if (url) {
      data[type][id] = url;
    } else {
      delete data[type][id];
    }
    fs.writeFileSync(AVATAR_FILE_PATH, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("Error saving custom avatar:", err);
  }
}

function determineMotherStatus(uiStatus: string | null, childrenCount: number, children: any[], estimatedDueDate: Date | null) {
  let status = uiStatus || "Ibu Balita";
  if (estimatedDueDate) {
    return "Ibu Hamil";
  }
  if ((status === "Calon Ibu" || status === "Ibu Hamil") && (childrenCount > 0 || children.length > 0)) {
    // Check if any child is born within 42 days (Nifas)
    const hasRecentChild = children.some((c: any) => {
      if (!c.birth_date) return false;
      const birthDate = new Date(c.birth_date);
      const diffTime = Math.abs(new Date().getTime() - birthDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 42;
    });
    status = hasRecentChild ? "Ibu Nifas" : "Ibu Balita";
  }
  return status;
}
function calculateGestationalOrNifasAge(status: string, estimatedDueDate: Date | null, children: any[]) {
  if (status === "Ibu Hamil" && estimatedDueDate) {
    const hplDate = new Date(estimatedDueDate);
    const now = new Date();
    const diffTime = hplDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const diffWeeks = Math.floor(diffDays / 7);
    const gestationalWeeks = Math.max(1, Math.min(42, 40 - diffWeeks));
    return `${gestationalWeeks} Minggu`;
  }
  
  if (status === "Ibu Nifas") {
    let nifasDays = 0;
    if (children.length > 0) {
      const birthDates = children
        .map((c: any) => c.birth_date ? new Date(c.birth_date) : null)
        .filter(Boolean) as Date[];
      if (birthDates.length > 0) {
        const newestBirth = new Date(Math.max(...birthDates.map(d => d.getTime())));
        const diffTime = Math.abs(new Date().getTime() - newestBirth.getTime());
        nifasDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      }
    }
    return nifasDays > 0 ? `Nifas Hari ke-${nifasDays}` : "Masa Nifas";
  }

  return "-";
}

export async function getMothersData() {
  try {
    const mothers = await prisma.mother.findMany({
      orderBy: {
        created_at: "desc",
      },
      include: {
        children: true
      }
    });

    const avatars = getCustomAvatars();
    const customMothersAvatars = avatars.mothers || {};

    return mothers.map((mother, index) => {
      const children = mother.children || [];
      const childrenCount = mother.number_of_children || children.length || 0;
      const status = determineMotherStatus(mother.ui_status, childrenCount, children, mother.estimated_due_date);

      const gestationalAge = calculateGestationalOrNifasAge(status, mother.estimated_due_date, children);

      const hpl = mother.estimated_due_date 
        ? new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }).format(mother.estimated_due_date)
        : "-";

      return {
        id: (index + 1).toString().padStart(2, "0"),
        mother_id: mother.mother_id,
        national_id: mother.national_id,
        name: mother.mother_name,
        age: mother.age ? `${mother.age} Tahun` : "-",
        rawAge: mother.age || 0,
        status,
        gestationalAge,
        hpl,
        rawHpl: mother.estimated_due_date ? mother.estimated_due_date.toISOString() : "",
        avatarUrl: customMothersAvatars[mother.mother_id] 
          || (mother.mother_name.includes("Dewi") 
            ? "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=150&auto=format&fit=crop" 
            : mother.mother_name.includes("Wulandari")
            ? "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=150&auto=format&fit=crop"
            : mother.mother_name.includes("Fitriani")
            ? "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150&auto=format&fit=crop"
            : null),
        condition: mother.risk_status || "Normal",
        phone_number: mother.phone_number || "-"
      };
    });
  } catch (error) {
    console.error("Error fetching mothers:", error);
    return [];
  }
}

export async function getMaternalHistory() {
  try {
    const records = await prisma.maternalHealthRecord.findMany({
      include: {
        mother: true,
      },
      orderBy: {
        visit_date: "desc",
      },
    });

    return records.map((record, index) => {
      const date = new Intl.DateTimeFormat('id-ID', { 
        day: '2-digit', month: 'long', year: 'numeric' 
      }).format(record.visit_date);

      return {
        id: (index + 1).toString().padStart(2, "0"),
        date,
        rawDate: record.visit_date.toISOString(),
        name: record.mother.mother_name,
        weight: record.weight ? Number(record.weight) : null,
        bloodPressure: record.blood_pressure || "-",
        muac: record.muac ? Number(record.muac) : null,
        fundalHeight: record.fundal_height ? Number(record.fundal_height) : null,
        status: record.mother.risk_status || "Normal",
      };
    });
  } catch (error) {
    console.error("Error fetching maternal history:", error);
    return [];
  }
}

export async function getMotherMetrics() {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const [totalMothers, mothersKek, highRiskPregnancies, dueThisMonth] = await Promise.all([
      prisma.mother.count(),
      prisma.mother.count({
        where: { risk_status: { contains: "KEK" } }
      }),
      prisma.mother.count({
        where: { risk_status: "Risiko Tinggi" }
      }),
      prisma.mother.count({
        where: { 
          estimated_due_date: {
            gte: startOfMonth,
            lte: endOfMonth
          }
        }
      })
    ]);

    return {
      totalMothers,
      mothersKek,
      highRiskPregnancies,
      dueThisMonth
    };
  } catch (error) {
    console.error("Error fetching metrics:", error);
    return { totalMothers: 0, mothersKek: 0, highRiskPregnancies: 0, dueThisMonth: 0 };
  }
}

export async function searchMothers(query: string) {
  if (!query || query.length < 2) return [];
  try {
    const mothers = await prisma.mother.findMany({
      where: {
        OR: [
          { mother_name: { contains: query, mode: "insensitive" } },
          { national_id: { contains: query } }
        ]
      },
      take: 10,
    });
    return mothers.map((m: any) => ({ id: m.mother_id, name: m.mother_name, nik: m.national_id }));
  } catch (error) {
    console.error("Error searching mothers:", error);
    return [];
  }
}

export async function createMother(data: any) {
  try {
    const mother = await prisma.mother.create({
      data: {
        national_id: data.national_id,
        mother_name: data.mother_name,
        birth_date: data.birth_date ? new Date(data.birth_date) : null,
        age: data.age ? parseInt(data.age) : null,
        husband_name: data.husband_name || null,
        phone_number: data.phone_number || null,
        blood_type: data.blood_type || null,
        estimated_due_date: data.estimated_due_date ? new Date(data.estimated_due_date) : null,
        risk_status: data.risk_status || "Normal",
        ui_status: data.ui_status || "Ibu Hamil",
        number_of_children: data.number_of_children ? parseInt(data.number_of_children) : 0,
      }
    });
    return { success: true, id: mother.mother_id };
  } catch (error: any) {
    console.error("Error creating mother:", error);
    return { success: false, error: error.message || "Gagal menyimpan data ibu." };
  }
}

export async function createMaternalRecord(data: any) {
  try {
    const record = await prisma.maternalHealthRecord.create({
      data: {
        mother_id: data.mother_id,
        visit_date: data.visit_date ? new Date(data.visit_date) : new Date(),
        weight: data.weight ? parseFloat(data.weight) : null,
        blood_pressure: data.blood_pressure || null,
        muac: data.muac ? parseFloat(data.muac) : null,
        fundal_height: data.fundal_height ? parseFloat(data.fundal_height) : null,
        fetal_heart_rate: data.fetal_heart_rate ? parseInt(data.fetal_heart_rate) : null,
        iron_pills_given: data.iron_pills_given ? parseInt(data.iron_pills_given) : 0,
        cadre_notes: data.cadre_notes || null,
      }
    });
    return { success: true, id: record.record_id };
  } catch (error: any) {
    console.error("Error creating maternal record:", error);
    return { success: false, error: error.message || "Gagal menyimpan data pemeriksaan ibu." };
  }
}

export async function getMotherDetail(motherId: string) {
  try {
    const mother = await prisma.mother.findUnique({
      where: { mother_id: motherId },
      include: {
        children: true,
        maternal_records: {
          orderBy: {
            visit_date: "desc",
          },
        },
      },
    });

    if (!mother) return null;

    const children = mother.children || [];
    const childrenCount = mother.number_of_children || children.length || 0;
    const status = determineMotherStatus(mother.ui_status, childrenCount, children, mother.estimated_due_date);

    const gestationalAge = calculateGestationalOrNifasAge(status, mother.estimated_due_date, children);

    const hpl = mother.estimated_due_date 
      ? new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }).format(mother.estimated_due_date)
      : "-";

    const dobIndo = mother.birth_date
      ? new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }).format(mother.birth_date)
      : "-";

    const avatars = getCustomAvatars();
    const customMothersAvatars = avatars.mothers || {};

    return {
      mother_id: mother.mother_id,
      national_id: mother.national_id,
      name: mother.mother_name,
      dob: dobIndo,
      dobRaw: mother.birth_date ? mother.birth_date.toISOString().split("T")[0] : null,
      age: mother.age ? `${mother.age} Tahun` : "-",
      husband_name: mother.husband_name || "-",
      phone_number: mother.phone_number || "-",
      blood_type: mother.blood_type || "-",
      status,
      gestationalAge,
      hpl,
      condition: mother.risk_status || "Normal",
      number_of_children: childrenCount,
      avatarUrl: customMothersAvatars[mother.mother_id] 
        || (mother.mother_name.includes("Dewi") 
          ? "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=150&auto=format&fit=crop" 
          : mother.mother_name.includes("Wulandari")
          ? "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=150&auto=format&fit=crop"
          : mother.mother_name.includes("Fitriani")
          ? "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150&auto=format&fit=crop"
          : null),
      children: mother.children.map((c: any) => {
        const birthDate = c.birth_date ? new Date(c.birth_date) : null;
        let ageStr = "-";
        let ageInMonths = 0;
        if (birthDate) {
          const now = new Date();
          const yearsDiff = now.getFullYear() - birthDate.getFullYear();
          const monthsDiff = now.getMonth() - birthDate.getMonth();
          ageInMonths = yearsDiff * 12 + monthsDiff;
          ageStr = `${ageInMonths} Bulan`;
        }

        let status = "Normal";
        if (c.current_weight && c.current_height && birthDate) {
          const zScoreBB = calculateZScore(Number(c.current_weight), ageInMonths, c.gender, "BB");
          const zScoreTB = calculateZScore(Number(c.current_height), ageInMonths, c.gender, "TB");
          status = getNutritionalStatus(zScoreBB, zScoreTB);
        }

        return {
          child_id: c.child_id,
          name: c.child_name,
          gender: c.gender,
          age: ageStr,
          dob: birthDate ? new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }).format(birthDate) : "-",
          current_weight: c.current_weight ? Number(c.current_weight) : null,
          current_height: c.current_height ? Number(c.current_height) : null,
          status,
        };
      }),
      maternal_records: mother.maternal_records.map((r: any) => {
        const visitDateStr = new Intl.DateTimeFormat('id-ID', { 
          day: '2-digit', month: 'long', year: 'numeric' 
        }).format(r.visit_date);
        return {
          record_id: r.record_id,
          date: visitDateStr,
          weight: r.weight ? Number(r.weight) : 0,
          blood_pressure: r.blood_pressure || "-",
          muac: r.muac ? Number(r.muac) : 0,
          fundal_height: r.fundal_height ? Number(r.fundal_height) : 0,
          fetal_heart_rate: r.fetal_heart_rate || "-",
          iron_pills_given: r.iron_pills_given || 0,
          cadre_notes: r.cadre_notes || "-",
        };
      }),
    };
  } catch (error) {
    console.error("Error fetching mother detail:", error);
    return null;
  }
}

export async function updateMother(motherId: string, data: any) {
  try {
    let computedAge = data.age;
    if (data.birth_date) {
      const birthDate = new Date(data.birth_date);
      const now = new Date();
      computedAge = now.getFullYear() - birthDate.getFullYear();
      const monthDiff = now.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birthDate.getDate())) {
        computedAge--;
      }
    }

    const updated = await prisma.mother.update({
      where: { mother_id: motherId },
      data: {
        national_id: data.national_id,
        mother_name: data.mother_name,
        birth_date: data.birth_date ? new Date(data.birth_date) : null,
        age: computedAge ? parseInt(computedAge.toString()) : null,
        husband_name: data.husband_name || null,
        phone_number: data.phone_number || null,
        blood_type: data.blood_type || null,
        estimated_due_date: data.estimated_due_date ? new Date(data.estimated_due_date) : null,
        risk_status: data.risk_status || "Normal",
        ui_status: data.ui_status || "Ibu Hamil",
        number_of_children: data.number_of_children ? parseInt(data.number_of_children.toString()) : 0,
      }
    });

    // Save custom avatar to local file store
    if (data.avatarUrl !== undefined) {
      saveCustomAvatar("mothers", motherId, data.avatarUrl);
    }

    return { success: true, id: updated.mother_id };
  } catch (error: any) {
    console.error("Error updating mother:", error);
    return { success: false, error: error.message || "Gagal memperbarui data ibu." };
  }
}

export async function getLoggedInMotherData(username: string) {
  try {
    if (!username) return null;

    // Clean username (e.g. "Ibu Aminah (Demo)" -> "Siti Aminah")
    let cleanUsername = username.replace(/\s*\(Demo\)\s*/gi, "").trim();
    // Map common demo variants
    if (cleanUsername.toLowerCase() === "ibu aminah" || cleanUsername.toLowerCase() === "ibu") {
      cleanUsername = "Siti Aminah";
    }

    // Try to find by name, national_id, or phone_number
    let mother = await prisma.mother.findFirst({
      where: {
        OR: [
          { mother_name: { equals: cleanUsername, mode: "insensitive" } },
          { mother_name: { contains: cleanUsername, mode: "insensitive" } },
          { national_id: cleanUsername },
          { phone_number: cleanUsername }
        ]
      },
      include: {
        children: true
      }
    });

    // Fallback if not found to "Siti Aminah" or first mother in database
    if (!mother) {
      mother = await prisma.mother.findFirst({
        where: { mother_name: { contains: "Aminah", mode: "insensitive" } },
        include: { children: true }
      });
    }

    if (!mother) {
      mother = await prisma.mother.findFirst({
        include: { children: true }
      });
    }

    if (!mother) return null;

    return {
      mother_id: mother.mother_id,
      mother_name: mother.mother_name,
      national_id: mother.national_id,
      children: mother.children.map(c => ({
        child_id: c.child_id,
        child_name: c.child_name,
        gender: c.gender,
        birth_date: c.birth_date ? c.birth_date.toISOString() : null,
      }))
    };
  } catch (error) {
    console.error("Error in getLoggedInMotherData:", error);
    return null;
  }
}




