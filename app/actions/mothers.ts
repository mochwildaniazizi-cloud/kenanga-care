"use server";

import { prisma } from "@/lib/prisma";

function determineMotherStatus(uiStatus: string | null, childrenCount: number, children: any[]) {
  let status = uiStatus || "Ibu Balita";
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

    return mothers.map((mother, index) => {
      const children = mother.children || [];
      const childrenCount = mother.number_of_children || children.length || 0;
      const status = determineMotherStatus(mother.ui_status, childrenCount, children);

      const isPregnant = status === "Ibu Hamil";
      let gestationalAge = "-";
      if (isPregnant && mother.estimated_due_date) {
        gestationalAge = "24 Minggu"; 
      } else if (status === "Ibu Nifas") {
        gestationalAge = "Masa Nifas";
      }

      const hpl = mother.estimated_due_date 
        ? new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }).format(mother.estimated_due_date)
        : "-";

      return {
        id: (index + 1).toString().padStart(2, "0"),
        mother_id: mother.mother_id,
        national_id: mother.national_id,
        name: mother.mother_name,
        age: mother.age ? `${mother.age} Tahun` : "-",
        status,
        gestationalAge,
        hpl,
        condition: mother.risk_status || "Normal"
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
    const status = determineMotherStatus(mother.ui_status, childrenCount, children);

    const isPregnant = status === "Ibu Hamil";
    let gestationalAge = "-";
    if (isPregnant && mother.estimated_due_date) {
      gestationalAge = "24 Minggu"; 
    } else if (status === "Ibu Nifas") {
      gestationalAge = "Masa Nifas";
    }

    const hpl = mother.estimated_due_date 
      ? new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }).format(mother.estimated_due_date)
      : "-";

    const dobIndo = mother.birth_date
      ? new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }).format(mother.birth_date)
      : "-";

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
      children: mother.children.map((c: any) => {
        const birthDate = c.birth_date ? new Date(c.birth_date) : null;
        let ageStr = "-";
        if (birthDate) {
          const now = new Date();
          const yearsDiff = now.getFullYear() - birthDate.getFullYear();
          const monthsDiff = now.getMonth() - birthDate.getMonth();
          const totalMonths = yearsDiff * 12 + monthsDiff;
          ageStr = `${totalMonths} Bulan`;
        }
        return {
          child_id: c.child_id,
          name: c.child_name,
          gender: c.gender,
          age: ageStr,
          dob: birthDate ? new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }).format(birthDate) : "-",
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

    return { success: true, id: updated.mother_id };
  } catch (error: any) {
    console.error("Error updating mother:", error);
    return { success: false, error: error.message || "Gagal memperbarui data ibu." };
  }
}



