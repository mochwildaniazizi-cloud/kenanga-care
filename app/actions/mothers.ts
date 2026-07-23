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

    return mothers.map((mother: any, index: number) => {
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
        password: mother.password,
        age: mother.age ? `${mother.age} Tahun` : "-",
        rawAge: mother.age || 0,
        status,
        gestationalAge,
        hpl,
        rawHpl: mother.estimated_due_date ? mother.estimated_due_date.toISOString() : "",
        avatarUrl: mother.avatarUrl 
          || customMothersAvatars[mother.mother_id] 
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
    throw error;
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

    return records.map((record: any, index: number) => {
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
    throw error;
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

        // Additional Identity fields from Buku KIA 2024
        jkn_number: data.jkn_number || null,
        faskes_1: data.faskes_1 || null,
        faskes_referral: data.faskes_referral || null,
        birth_place: data.birth_place || null,
        education: data.education || null,
        occupation: data.occupation || null,
        address: data.address || null,
        other_financing: data.other_financing || null,
        insurance_other: data.insurance_other || null,
        insurance_number: data.insurance_number || null,
        insurance_validity: data.insurance_validity ? new Date(data.insurance_validity) : null,
        faskes_primary: data.faskes_primary || null,
        puskesmas_domicile: data.puskesmas_domicile || null,
        cohort_register_number: data.cohort_register_number || null,
        faskes_secondary: data.faskes_secondary || null,
        medical_record_number: data.medical_record_number || null,

        // Riwayat Singkat Kesehatan Ibu (Brief Health History)
        pregnancy_number: data.pregnancy_number ? parseInt(data.pregnancy_number.toString()) : 1,
        children_born_alive: data.children_born_alive ? parseInt(data.children_born_alive.toString()) : 0,
        miscarriage_history: data.miscarriage_history ? parseInt(data.miscarriage_history.toString()) : 0,
        disease_history: data.disease_history || null,

        // Husband Identity fields
        husband_national_id: data.husband_national_id || null,
        husband_jkn_number: data.husband_jkn_number || null,
        husband_faskes_1: data.husband_faskes_1 || null,
        husband_faskes_referral: data.husband_faskes_referral || null,
        husband_birth_place: data.husband_birth_place || null,
        husband_birth_date: data.husband_birth_date ? new Date(data.husband_birth_date) : null,
        husband_education: data.husband_education || null,
        husband_occupation: data.husband_occupation || null,
        husband_address: data.husband_address || null,
        husband_phone_number: data.husband_phone_number || null,
        husband_blood_type: data.husband_blood_type || null,
        husband_other_financing: data.husband_other_financing || null,
        husband_insurance_other: data.husband_insurance_other || null,
        husband_insurance_number: data.husband_insurance_number || null,
        husband_insurance_validity: data.husband_insurance_validity ? new Date(data.husband_insurance_validity) : null,
        husband_faskes_primary: data.husband_faskes_primary || null,
        husband_puskesmas_domicile: data.husband_puskesmas_domicile || null,
        husband_faskes_secondary: data.husband_faskes_secondary || null,
        husband_medical_record_number: data.husband_medical_record_number || null,
      } as any
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
    const m = mother as any;

    const children = mother.children || [];
    const childrenCount = m.number_of_children || children.length || 0;
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
      avatarUrl: mother.avatarUrl 
        || customMothersAvatars[mother.mother_id] 
        || (mother.mother_name.includes("Dewi") 
          ? "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=150&auto=format&fit=crop" 
          : mother.mother_name.includes("Wulandari")
          ? "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=150&auto=format&fit=crop"
          : mother.mother_name.includes("Fitriani")
          ? "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150&auto=format&fit=crop"
          : null),

      // Buku KIA Additional Identity fields
      jkn_number: m.jkn_number || "-",
      faskes_1: m.faskes_1 || "-",
      faskes_referral: m.faskes_referral || "-",
      birth_place: m.birth_place || "-",
      education: m.education || "-",
      occupation: m.occupation || "-",
      address: m.address || "-",
      other_financing: m.other_financing || "-",
      insurance_other: m.insurance_other || "-",
      insurance_number: m.insurance_number || "-",
      insurance_validity: m.insurance_validity ? m.insurance_validity.toISOString().split("T")[0] : "",
      faskes_primary: m.faskes_primary || "-",
      puskesmas_domicile: m.puskesmas_domicile || "-",
      cohort_register_number: m.cohort_register_number || "-",
      faskes_secondary: m.faskes_secondary || "-",
      medical_record_number: m.medical_record_number || "-",

      // Riwayat Singkat Kesehatan Ibu
      pregnancy_number: m.pregnancy_number ?? 1,
      children_born_alive: m.children_born_alive ?? 0,
      miscarriage_history: m.miscarriage_history ?? 0,
      disease_history: m.disease_history || "-",

      // Husband Identity fields
      husband_national_id: m.husband_national_id || "-",
      husband_jkn_number: m.husband_jkn_number || "-",
      husband_faskes_1: m.husband_faskes_1 || "-",
      husband_faskes_referral: m.husband_faskes_referral || "-",
      husband_birth_place: m.husband_birth_place || "-",
      husband_birth_date: m.husband_birth_date ? m.husband_birth_date.toISOString().split("T")[0] : "",
      husband_education: m.husband_education || "-",
      husband_occupation: m.husband_occupation || "-",
      husband_address: m.husband_address || "-",
      husband_phone_number: m.husband_phone_number || "-",
      husband_blood_type: m.husband_blood_type || "-",
      husband_other_financing: m.husband_other_financing || "-",
      husband_insurance_other: m.husband_insurance_other || "-",
      husband_insurance_number: m.husband_insurance_number || "-",
      husband_insurance_validity: m.husband_insurance_validity ? m.husband_insurance_validity.toISOString().split("T")[0] : "",
      husband_faskes_primary: m.husband_faskes_primary || "-",
      husband_puskesmas_domicile: m.husband_puskesmas_domicile || "-",
      husband_faskes_secondary: m.husband_faskes_secondary || "-",
      husband_medical_record_number: m.husband_medical_record_number || "-",

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
    throw error;
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
        avatarUrl: data.avatarUrl !== undefined ? data.avatarUrl : undefined,

        // Additional Identity fields from Buku KIA 2024
        jkn_number: data.jkn_number !== undefined ? data.jkn_number : undefined,
        faskes_1: data.faskes_1 !== undefined ? data.faskes_1 : undefined,
        faskes_referral: data.faskes_referral !== undefined ? data.faskes_referral : undefined,
        birth_place: data.birth_place !== undefined ? data.birth_place : undefined,
        education: data.education !== undefined ? data.education : undefined,
        occupation: data.occupation !== undefined ? data.occupation : undefined,
        address: data.address !== undefined ? data.address : undefined,
        other_financing: data.other_financing !== undefined ? data.other_financing : undefined,
        insurance_other: data.insurance_other !== undefined ? data.insurance_other : undefined,
        insurance_number: data.insurance_number !== undefined ? data.insurance_number : undefined,
        insurance_validity: data.insurance_validity ? new Date(data.insurance_validity) : (data.insurance_validity === null ? null : undefined),
        faskes_primary: data.faskes_primary !== undefined ? data.faskes_primary : undefined,
        puskesmas_domicile: data.puskesmas_domicile !== undefined ? data.puskesmas_domicile : undefined,
        cohort_register_number: data.cohort_register_number !== undefined ? data.cohort_register_number : undefined,
        faskes_secondary: data.faskes_secondary !== undefined ? data.faskes_secondary : undefined,
        medical_record_number: data.medical_record_number !== undefined ? data.medical_record_number : undefined,

        // Riwayat Singkat Kesehatan Ibu (Brief Health History)
        pregnancy_number: data.pregnancy_number !== undefined ? (data.pregnancy_number ? parseInt(data.pregnancy_number.toString()) : 1) : undefined,
        children_born_alive: data.children_born_alive !== undefined ? (data.children_born_alive ? parseInt(data.children_born_alive.toString()) : 0) : undefined,
        miscarriage_history: data.miscarriage_history !== undefined ? (data.miscarriage_history ? parseInt(data.miscarriage_history.toString()) : 0) : undefined,
        disease_history: data.disease_history !== undefined ? data.disease_history : undefined,

        // Husband Identity fields
        husband_national_id: data.husband_national_id !== undefined ? data.husband_national_id : undefined,
        husband_jkn_number: data.husband_jkn_number !== undefined ? data.husband_jkn_number : undefined,
        husband_faskes_1: data.husband_faskes_1 !== undefined ? data.husband_faskes_1 : undefined,
        husband_faskes_referral: data.husband_faskes_referral !== undefined ? data.husband_faskes_referral : undefined,
        husband_birth_place: data.husband_birth_place !== undefined ? data.husband_birth_place : undefined,
        husband_birth_date: data.husband_birth_date ? new Date(data.husband_birth_date) : (data.husband_birth_date === null ? null : undefined),
        husband_education: data.husband_education !== undefined ? data.husband_education : undefined,
        husband_occupation: data.husband_occupation !== undefined ? data.husband_occupation : undefined,
        husband_address: data.husband_address !== undefined ? data.husband_address : undefined,
        husband_phone_number: data.husband_phone_number !== undefined ? data.husband_phone_number : undefined,
        husband_blood_type: data.husband_blood_type !== undefined ? data.husband_blood_type : undefined,
        husband_other_financing: data.husband_other_financing !== undefined ? data.husband_other_financing : undefined,
        husband_insurance_other: data.husband_insurance_other !== undefined ? data.husband_insurance_other : undefined,
        husband_insurance_number: data.husband_insurance_number !== undefined ? data.husband_insurance_number : undefined,
        husband_insurance_validity: data.husband_insurance_validity ? new Date(data.husband_insurance_validity) : (data.husband_insurance_validity === null ? null : undefined),
        husband_faskes_primary: data.husband_faskes_primary !== undefined ? data.husband_faskes_primary : undefined,
        husband_puskesmas_domicile: data.husband_puskesmas_domicile !== undefined ? data.husband_puskesmas_domicile : undefined,
        husband_faskes_secondary: data.husband_faskes_secondary !== undefined ? data.husband_faskes_secondary : undefined,
        husband_medical_record_number: data.husband_medical_record_number !== undefined ? data.husband_medical_record_number : undefined,
      } as any
    });

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
    // For the default kader account, look up by the reserved NIK
    if (username.toLowerCase() === "kader") {
      const kaderRecord = await prisma.mother.findFirst({
        where: { national_id: "KADER-DEFAULT" },
        include: { children: true }
      });
      if (!kaderRecord) return null;
      return {
        mother_id: kaderRecord.mother_id,
        mother_name: kaderRecord.mother_name,
        national_id: kaderRecord.national_id,
        avatarUrl: kaderRecord.avatarUrl,
        children: []
      };
    }

    let cleanUsername = username.replace(/\s*\(Demo\)\s*/gi, "").trim();
    if (cleanUsername.toLowerCase() === "ibu aminah" || cleanUsername.toLowerCase() === "ibu") {
      cleanUsername = "Siti Aminah";
    }

    const u = cleanUsername.toLowerCase();
    let cleanU = u;
    if (cleanU.startsWith("ibu ")) {
      cleanU = cleanU.substring(4).trim();
    } else if (cleanU.startsWith("kader ")) {
      cleanU = cleanU.substring(6).trim();
    }

    const digitsOnly = u.replace(/\D/g, "");

    // Try to find by name, contains name, cleaned search pattern, national_id, or phone_number
    let mother = await prisma.mother.findFirst({
      where: {
        OR: [
          { mother_name: { equals: cleanUsername, mode: "insensitive" } },
          { mother_name: { contains: cleanUsername, mode: "insensitive" } },
          { mother_name: { contains: cleanU, mode: "insensitive" } },
          { national_id: cleanUsername },
          { phone_number: cleanUsername },
          { phone_number: { contains: digitsOnly && digitsOnly.length > 5 ? digitsOnly : "NONMATCH" } }
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
      avatarUrl: mother.avatarUrl,
      children: mother.children.map((c: any) => ({
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

export async function deleteMother(id: string) {
  try {
    await prisma.mother.delete({
      where: { mother_id: id }
    });
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting mother:", error);
    return { success: false, error: error.message || "Gagal menghapus data ibu." };
  }
}

export async function updateUserPassword(username: string, currentPass: string, newPass: string, role: "kader" | "ibu" | "nakes") {
  try {
    const u = username.trim().toLowerCase();
    
    // Find the user by username (phone_number, national_id, or name)
    const mother = await prisma.mother.findFirst({
      where: {
        OR: [
          { phone_number: { equals: u, mode: 'insensitive' } },
          { national_id: { equals: u, mode: 'insensitive' } },
          { national_id: { equals: "KADER-" + u, mode: 'insensitive' } },
          { national_id: { equals: "NAKES-" + u, mode: 'insensitive' } },
          { mother_name: { equals: u, mode: 'insensitive' } }
        ]
      }
    });

    if (!mother) {
      // Special case: default main accounts bypass (not in DB)
      if (u === "kader" || u === "nakes") {
        return { success: false, error: "Akun bawaan utama tidak dapat diubah kata sandinya. Silakan buat akun baru untuk menggunakan fitur ini." };
      }
      return { success: false, error: "Pengguna tidak ditemukan." };
    }

    // Verify current password
    const dbPassword = mother.password;
    const defaultPassword = (mother.ui_status === "Tenaga Kesehatan" || mother.national_id.startsWith("NAKES-"))
      ? "nakes123"
      : (mother.ui_status === "Kader Posyandu" || mother.national_id.startsWith("KADER-")) 
      ? "kader123" 
      : "ibu123";

    const expectedCurrentPassword = dbPassword || defaultPassword;

    if (currentPass !== expectedCurrentPassword) {
      return { success: false, error: "Kata sandi saat ini salah." };
    }

    // Update password
    await prisma.mother.update({
      where: { mother_id: mother.mother_id },
      data: { password: newPass }
    });

    return { success: true };
  } catch (error: any) {
    console.error("Error updating user password:", error);
    return { success: false, error: error.message || "Gagal mengubah kata sandi." };
  }
}

export async function ensureKaderProfileExists(name: string, phone?: string, password?: string) {
  try {
    const existing = await prisma.mother.findFirst({
      where: { national_id: "KADER-DEFAULT" }
    });

    if (existing) {
      // Update any changed fields
      const updated = await prisma.mother.update({
        where: { mother_id: existing.mother_id },
        data: {
          mother_name: name || existing.mother_name,
          phone_number: phone || existing.phone_number,
          ...(password ? { password } : {})
        }
      });
      return { mother_id: updated.mother_id, avatarUrl: updated.avatarUrl };
    }

    // Create for the first time
    const created = await prisma.mother.create({
      data: {
        national_id: "KADER-DEFAULT",
        mother_name: name || "Kader Siti",
        phone_number: phone || "0812-3456-7890",
        ui_status: "Kader Posyandu",
        risk_status: "Ketua Kader",
        husband_name: "Kader",
        password: password || "kader123",
        number_of_children: 0
      }
    });
    return { mother_id: created.mother_id, avatarUrl: null };
  } catch (error: any) {
    console.error("Error ensuring kader profile:", error);
    return null;
  }
}

export async function ensureNakesProfileExists(name: string, phone?: string, password?: string) {
  try {
    const existing = await prisma.mother.findFirst({
      where: { national_id: "NAKES-DEFAULT" }
    });

    if (existing) {
      const updated = await prisma.mother.update({
        where: { mother_id: existing.mother_id },
        data: {
          mother_name: name || existing.mother_name,
          phone_number: phone || existing.phone_number,
          ...(password ? { password } : {})
        }
      });
      return { mother_id: updated.mother_id, avatarUrl: updated.avatarUrl };
    }

    const created = await prisma.mother.create({
      data: {
        national_id: "NAKES-DEFAULT",
        mother_name: name || "Bidan Widya, A.Md.Keb",
        phone_number: phone || "0813-9988-7766",
        ui_status: "Tenaga Kesehatan",
        risk_status: "Bidan Puskesmas",
        husband_name: "Tenaga Kesehatan",
        password: password || "nakes123",
        number_of_children: 0
      }
    });
    return { mother_id: created.mother_id, avatarUrl: null };
  } catch (error: any) {
    console.error("Error ensuring nakes profile:", error);
    return null;
  }
}

export async function verifyUserLogin(username: string, pass: string, role: "kader" | "ibu" | "nakes") {
  try {
    const u = username.trim().toLowerCase();
    
    // 1. Bypass default kader account — ensure DB record exists
    if (role === "kader" && u === "kader" && pass === "kader123") {
      const kaderProfile = await ensureKaderProfileExists("Kader Siti");
      const kaderName = kaderProfile ? 
        ((await prisma.mother.findFirst({ where: { national_id: "KADER-DEFAULT" }, select: { mother_name: true } }))?.mother_name || "Kader Siti")
        : "Kader Siti";
      return { success: true, name: kaderName, role: "kader" as const, avatarUrl: kaderProfile?.avatarUrl ?? null };
    }

    // 2. Bypass default nakes simulation account — ensure DB record exists
    if (role === "nakes" && (u === "nakes" || u === "bidan" || u === "bidan.widya" || u === "nakes123") && (pass === "nakes123" || pass === "bidan123")) {
      const nakesProfile = await ensureNakesProfileExists("Bidan Widya, A.Md.Keb");
      const nakesName = nakesProfile ? 
        ((await prisma.mother.findFirst({ where: { national_id: "NAKES-DEFAULT" }, select: { mother_name: true } }))?.mother_name || "Bidan Widya, A.Md.Keb")
        : "Bidan Widya, A.Md.Keb";
      return { success: true, name: nakesName, role: "nakes" as const, avatarUrl: nakesProfile?.avatarUrl ?? null };
    }

    let cleanU = u;
    if (cleanU.startsWith("ibu ")) {
      cleanU = cleanU.substring(4).trim();
    } else if (cleanU.startsWith("kader ")) {
      cleanU = cleanU.substring(6).trim();
    } else if (cleanU.startsWith("nakes ") || cleanU.startsWith("bidan ")) {
      cleanU = cleanU.substring(6).trim();
    }

    const digitsOnly = u.replace(/\D/g, "");

    const mother = await prisma.mother.findFirst({
      where: {
        OR: [
          { phone_number: { equals: u, mode: 'insensitive' } },
          { phone_number: { contains: digitsOnly && digitsOnly.length > 5 ? digitsOnly : "NONMATCH" } },
          { national_id: { equals: u, mode: 'insensitive' } },
          { national_id: { equals: "KADER-" + u, mode: 'insensitive' } },
          { national_id: { equals: "NAKES-" + u, mode: 'insensitive' } },
          { mother_name: { equals: u, mode: 'insensitive' } },
          { mother_name: { contains: cleanU, mode: 'insensitive' } }
        ]
      }
    });

    if (!mother) {
      return { success: false, error: "Username / WhatsApp tidak terdaftar." };
    }

    // Role check
    const isDbKader = mother.ui_status === "Kader Posyandu" || mother.national_id.startsWith("KADER-");
    const isDbNakes = mother.ui_status === "Tenaga Kesehatan" || mother.national_id.startsWith("NAKES-");

    if (role === "kader" && !isDbKader) {
      return { success: false, error: "Identitas ini tidak terdaftar sebagai Kader Posyandu." };
    }
    if (role === "nakes" && !isDbNakes && !isDbKader) {
      return { success: false, error: "Identitas ini tidak terdaftar sebagai Tenaga Kesehatan." };
    }
    if (role === "ibu" && (isDbKader || isDbNakes)) {
      return { success: false, error: "Identitas ini tidak terdaftar sebagai Ibu." };
    }

    // Verify password
    const dbPassword = mother.password;
    const defaultPassword = isDbNakes ? "nakes123" : isDbKader ? "kader123" : "ibu123";
    const expectedPassword = dbPassword || defaultPassword;

    if (pass !== expectedPassword) {
      return { success: false, error: "Kata sandi salah." };
    }

    return { success: true, name: mother.mother_name, role, avatarUrl: mother.avatarUrl };
  } catch (error: any) {
    console.error("Error in verifyUserLogin:", error);
    return { success: false, error: error.message || "Gagal melakukan otentikasi." };
  }
}

// ─── AUTO LOGIN: deteksi role otomatis dari database, tanpa pilihan role di frontend ───
export async function verifyUserLoginAuto(username: string, pass: string) {
  try {
    const u = username.trim().toLowerCase();

    // 1. Default kader bypass
    if (u === "kader" && pass === "kader123") {
      const kaderProfile = await ensureKaderProfileExists("Kader Siti");
      const kaderName = (await prisma.mother.findFirst({ where: { national_id: "KADER-DEFAULT" }, select: { mother_name: true } }))?.mother_name || "Kader Siti";
      return { success: true, name: kaderName, role: "kader" as const, avatarUrl: kaderProfile?.avatarUrl ?? null };
    }

    // 2. Default nakes bypass
    if ((u === "nakes" || u === "bidan" || u === "bidan.widya") && (pass === "nakes123" || pass === "bidan123")) {
      const nakesProfile = await ensureNakesProfileExists("Bidan Widya, A.Md.Keb");
      const nakesName = (await prisma.mother.findFirst({ where: { national_id: "NAKES-DEFAULT" }, select: { mother_name: true } }))?.mother_name || "Bidan Widya, A.Md.Keb";
      return { success: true, name: nakesName, role: "nakes" as const, avatarUrl: nakesProfile?.avatarUrl ?? null };
    }

    // 3. Search DB — cari berdasarkan berbagai field
    let cleanU = u;
    if (cleanU.startsWith("ibu ")) cleanU = cleanU.substring(4).trim();
    else if (cleanU.startsWith("kader ")) cleanU = cleanU.substring(6).trim();
    else if (cleanU.startsWith("nakes ") || cleanU.startsWith("bidan ")) cleanU = cleanU.substring(6).trim();

    const digitsOnly = u.replace(/\D/g, "");

    const mother = await prisma.mother.findFirst({
      where: {
        OR: [
          { phone_number: { equals: u, mode: 'insensitive' } },
          { phone_number: { contains: digitsOnly && digitsOnly.length > 5 ? digitsOnly : "NONMATCH" } },
          { national_id: { equals: u, mode: 'insensitive' } },
          { national_id: { equals: "KADER-" + u, mode: 'insensitive' } },
          { national_id: { equals: "NAKES-" + u, mode: 'insensitive' } },
          { mother_name: { equals: u, mode: 'insensitive' } },
          { mother_name: { contains: cleanU, mode: 'insensitive' } },
        ]
      }
    });

    if (!mother) {
      return { success: false, error: "Username tidak ditemukan. Periksa kembali username atau nomor WhatsApp Anda." };
    }

    // 4. Deteksi role dari data DB
    const isDbNakes = mother.ui_status === "Tenaga Kesehatan" || mother.national_id.startsWith("NAKES-");
    const isDbKader = mother.ui_status === "Kader Posyandu" || mother.national_id.startsWith("KADER-");
    const detectedRole: "kader" | "nakes" | "ibu" = isDbNakes ? "nakes" : isDbKader ? "kader" : "ibu";

    // 5. Verifikasi password
    const dbPassword = mother.password;
    const defaultPassword = isDbNakes ? "nakes123" : isDbKader ? "kader123" : "ibu123";
    const expectedPassword = dbPassword || defaultPassword;

    if (pass !== expectedPassword) {
      return { success: false, error: "Kata sandi salah." };
    }

    return { success: true, name: mother.mother_name, role: detectedRole, avatarUrl: mother.avatarUrl };
  } catch (error: any) {
    console.error("Error in verifyUserLoginAuto:", error);
    return { success: false, error: error.message || "Gagal melakukan otentikasi." };
  }
}

export async function updateUserAvatar(username: string, base64Avatar: string) {
  try {
    const u = username.trim().toLowerCase();
    
    let cleanU = u;
    if (cleanU.startsWith("ibu ")) {
      cleanU = cleanU.substring(4).trim();
    } else if (cleanU.startsWith("kader ")) {
      cleanU = cleanU.substring(6).trim();
    }

    const digitsOnly = u.replace(/\D/g, "");

    // Find mother with robust fallback options
    const mother = await prisma.mother.findFirst({
      where: {
        OR: [
          { phone_number: { equals: u, mode: 'insensitive' } },
          { phone_number: { contains: digitsOnly && digitsOnly.length > 5 ? digitsOnly : "NONMATCH" } },
          { national_id: { equals: u, mode: 'insensitive' } },
          { national_id: { equals: "KADER-" + u, mode: 'insensitive' } },
          { mother_name: { equals: u, mode: 'insensitive' } },
          { mother_name: { contains: cleanU, mode: 'insensitive' } }
        ]
      }
    });

    if (!mother) {
      if (u === "kader") {
        return { success: false, error: "Akun Kader utama bawaan tidak dapat diubah foto profilnya. Buat akun Kader baru untuk fitur ini." };
      }
      return { success: false, error: "Pengguna tidak ditemukan." };
    }

    await prisma.mother.update({
      where: { mother_id: mother.mother_id },
      data: { avatarUrl: base64Avatar }
    });

    return { success: true };
  } catch (error: any) {
    console.error("Error updating avatar:", error);
    return { success: false, error: error.message || "Gagal memperbarui foto profil." };
  }
}

export async function getLoggedInMotherDetail(username: string) {
  try {
    if (!username) return null;
    const loggedIn = await getLoggedInMotherData(username);
    if (!loggedIn) return null;
    return await getMotherDetail(loggedIn.mother_id);
  } catch (err) {
    console.error("Error in getLoggedInMotherDetail:", err);
    return null;
  }
}




