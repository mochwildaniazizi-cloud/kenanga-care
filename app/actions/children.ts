"use server";

import { prisma } from "@/lib/prisma";
import { calculateZScore, getNutritionalStatus } from "@/utils/zScoreCalculator";
import fs from "fs";

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

// Fungsi pembantu untuk menghitung umur dalam bulan
function calculateAgeInMonths(birthDate: Date, targetDate: Date = new Date()) {
  const yearsDifference = targetDate.getFullYear() - birthDate.getFullYear();
  const monthsDifference = targetDate.getMonth() - birthDate.getMonth();
  return yearsDifference * 12 + monthsDifference;
}

// Fungsi pembantu untuk memformat tanggal
function formatDateIndonesian(date: Date) {
  const months = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

export async function getChildrenData() {
  try {
    const children = await prisma.child.findMany({
      include: {
        mother: true,
        measurements: {
          orderBy: {
            visit_date: "asc"
          }
        }
      },
      orderBy: {
        created_at: "desc",
      },
    });

    const avatars = getCustomAvatars();
    const customChildrenAvatars = avatars.children || {};

    return children.map((child: any, index: number) => {
      const ageInMonths = child.birth_date ? calculateAgeInMonths(child.birth_date) : 0;
      let status = "Normal";
      if (child.current_weight && child.current_height && child.birth_date) {
        const zScoreBB = calculateZScore(Number(child.current_weight), ageInMonths, child.gender, "BB");
        const zScoreTB = calculateZScore(Number(child.current_height), ageInMonths, child.gender, "TB");
        status = getNutritionalStatus(zScoreBB, zScoreTB);
      }

      const sortedMeasurements = child.measurements || [];
      let trend: "up" | "down" | "flat" = "flat";
      if (sortedMeasurements.length >= 2) {
        const latestWeight = Number(sortedMeasurements[sortedMeasurements.length - 1].weight || 0);
        const prevWeight = Number(sortedMeasurements[sortedMeasurements.length - 2].weight || 0);
        if (latestWeight > prevWeight) trend = "up";
        else if (latestWeight < prevWeight) trend = "down";
      }

      return {
        id: (index + 1).toString().padStart(2, "0"),
        child_id: child.child_id,
        national_id: child.national_id || "-",
        name: child.child_name,
        age: `${ageInMonths} Bulan`,
        rawAge: ageInMonths,
        gender: child.gender, // 'M' atau 'F'
        birth_place: child.birth_place || "-",
        dob: child.birth_date ? formatDateIndonesian(child.birth_date) : "-",
        mother: child.mother?.mother_name || "-",
        height: child.current_height ? Number(child.current_height) : 0,
        weight: child.current_weight ? Number(child.current_weight) : 0,
        trend,
        status,
        dobRaw: child.birth_date ? child.birth_date.toISOString().split("T")[0] : null,
        avatarUrl: customChildrenAvatars[child.child_id]
          || (child.child_name.includes("Rafi")
            ? "https://images.unsplash.com/photo-1503919545889-aef636e10ad4?q=80&w=150&auto=format&fit=crop"
            : child.child_name.includes("Giselle")
            ? "https://images.unsplash.com/photo-1607990283143-e81e7a2c93ab?q=80&w=150&auto=format&fit=crop"
            : null),
      };
    });
  } catch (error) {
    console.error("Error fetching children:", error);
    return [];
  }
}

export async function getMeasurementHistory() {
  try {
    const measurements = await prisma.childMeasurement.findMany({
      include: {
        child: {
          include: {
            mother: true,
          },
        },
      },
      orderBy: {
        visit_date: "desc",
      },
      take: 50, // Batasi jumlah riwayat
    });

    const childIds = Array.from(new Set(measurements.map((m: any) => m.child_id)));
    const allMeasurementsForChildren = await prisma.childMeasurement.findMany({
      where: { child_id: { in: childIds } },
      orderBy: { visit_date: "asc" }
    });

    const measurementsByChild: Record<string, any[]> = {};
    allMeasurementsForChildren.forEach((m: any) => {
      if (!measurementsByChild[m.child_id]) {
        measurementsByChild[m.child_id] = [];
      }
      measurementsByChild[m.child_id].push(m);
    });

    return measurements.map((measurement: any, index: number) => {
      const ageAtVisit = measurement.child?.birth_date 
        ? calculateAgeInMonths(measurement.child.birth_date, measurement.visit_date)
        : 0;

      let status = "Normal";
      if (measurement.weight && measurement.height && measurement.child?.birth_date) {
        const zScoreBB = calculateZScore(Number(measurement.weight), ageAtVisit, measurement.child.gender, "BB");
        const zScoreTB = calculateZScore(Number(measurement.height), ageAtVisit, measurement.child.gender, "TB");
        status = getNutritionalStatus(zScoreBB, zScoreTB);
      }

      const history = measurementsByChild[measurement.child_id] || [];
      const currentIdx = history.findIndex((h: any) => h.measurement_id === measurement.measurement_id);
      let trend: "up" | "down" | "flat" = "flat";
      if (currentIdx > 0) {
        const prevWeight = Number(history[currentIdx - 1].weight || 0);
        const curWeight = Number(measurement.weight || 0);
        if (curWeight > prevWeight) trend = "up";
        else if (curWeight < prevWeight) trend = "down";
      }

      return {
        id: (index + 1).toString().padStart(2, "0"),
        measurement_id: measurement.measurement_id,
        date: formatDateIndonesian(measurement.visit_date),
        rawDate: measurement.visit_date.toISOString(),
        name: measurement.child?.child_name || "-",
        age: `${ageAtVisit} Bulan`,
        rawAge: ageAtVisit,
        gender: measurement.child?.gender || "M",
        weight: measurement.weight ? Number(measurement.weight) : 0,
        height: measurement.height ? Number(measurement.height) : 0,
        trend,
        status,
        avatarUrl: measurement.child?.child_name.includes("Rafi")
          ? "https://images.unsplash.com/photo-1503919545889-aef636e10ad4?q=80&w=150&auto=format&fit=crop"
          : measurement.child?.child_name.includes("Giselle")
          ? "https://images.unsplash.com/photo-1607990283143-e81e7a2c93ab?q=80&w=150&auto=format&fit=crop"
          : null,
      };
    });
  } catch (error) {
    console.error("Error fetching measurement history:", error);
    return [];
  }
}

export async function getChildMetrics() {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const totalChildren = await prisma.child.count();
    
    const childrenWeighedThisMonth = await prisma.childMeasurement.groupBy({
      by: ['child_id'],
      where: {
        visit_date: {
          gte: startOfMonth,
          lte: endOfMonth
        }
      }
    });
    const notWeighedThisMonth = Math.max(0, totalChildren - childrenWeighedThisMonth.length);

    // Placeholder mock for UI demonstration since complex Z-score calc is missing
    const problematicNutrition = 5; 
    const immunizationScheduled = 24; 
    const downwardTrend = 3;

    return {
      totalChildren,
      notWeighedThisMonth,
      problematicNutrition,
      immunizationScheduled,
      downwardTrend
    };
  } catch (error) {
    console.error("Error fetching child metrics:", error);
    return {
      totalChildren: 0,
      notWeighedThisMonth: 0,
      problematicNutrition: 0,
      immunizationScheduled: 0,
      downwardTrend: 0
    };
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

export async function createChild(data: any) {
  try {
    const child = await prisma.child.create({
      data: {
        national_id: data.national_id || null,
        child_name: data.child_name,
        birth_order: data.birth_order ? parseInt(data.birth_order) : null,
        birth_place: data.birth_place || null,
        birth_date: data.birth_date ? new Date(data.birth_date) : null,
        gender: data.gender,
        birth_weight: data.birth_weight ? parseFloat(data.birth_weight) : null,
        birth_length: data.birth_length ? parseFloat(data.birth_length) : null,
        mother_id: data.mother_id,
        current_weight: data.birth_weight ? parseFloat(data.birth_weight) : null,
        current_height: data.birth_length ? parseFloat(data.birth_length) : null,
        blood_type: (data.blood_type && data.blood_type !== "-") ? data.blood_type : null,
        special_conditions: data.special_conditions ? JSON.stringify(data.special_conditions) : "[]",
        special_conditions_notes: data.special_conditions_notes || null,
      }
    });

    // Update status dan jumlah anak ibu terkait jika ibu ditemukan
    const mother = await prisma.mother.findUnique({
      where: { mother_id: data.mother_id },
      include: { children: true }
    });

    if (mother) {
      const birthDate = data.birth_date ? new Date(data.birth_date) : new Date();
      const diffTime = Math.abs(new Date().getTime() - birthDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      let newStatus = mother.ui_status;
      if (mother.ui_status === "Calon Ibu" || mother.ui_status === "Ibu Hamil") {
        newStatus = diffDays <= 42 ? "Ibu Nifas" : "Ibu Balita";
      }

      await prisma.mother.update({
        where: { mother_id: data.mother_id },
        data: {
          number_of_children: (mother.number_of_children || 0) + 1,
          ui_status: newStatus
        }
      });
    }

    return { success: true, id: child.child_id };
  } catch (error: any) {
    console.error("Error creating child:", error);
    return { success: false, error: error.message || "Gagal menyimpan data anak." };
  }
}

export async function getChildDetail(childId: string) {
  try {
    const child = await prisma.child.findUnique({
      where: { child_id: childId },
      include: {
        mother: true,
        measurements: {
          orderBy: {
            visit_date: "desc",
          },
        },
      },
    });

    if (!child) return null;

    const ageInMonths = child.birth_date ? calculateAgeInMonths(child.birth_date) : 0;

    const avatars = getCustomAvatars();
    const customChildrenAvatars = avatars.children || {};

    return {
      child_id: child.child_id,
      national_id: child.national_id || "-",
      name: child.child_name,
      birth_order: child.birth_order || "-",
      birth_place: child.birth_place || "-",
      dob: child.birth_date ? formatDateIndonesian(child.birth_date) : "-",
      dobRaw: child.birth_date ? child.birth_date.toISOString().split("T")[0] : null,
      gender: child.gender, // 'M' atau 'F'
      avatarUrl: customChildrenAvatars[child.child_id]
        || (child.child_name.includes("Rafi")
          ? "https://images.unsplash.com/photo-1503919545889-aef636e10ad4?q=80&w=150&auto=format&fit=crop"
          : child.child_name.includes("Giselle")
          ? "https://images.unsplash.com/photo-1607990283143-e81e7a2c93ab?q=80&w=150&auto=format&fit=crop"
          : null),
      birth_weight: child.birth_weight ? Number(child.birth_weight) : 0,
      birth_length: child.birth_length ? Number(child.birth_length) : 0,
      current_weight: child.current_weight ? Number(child.current_weight) : 0,
      current_height: child.current_height ? Number(child.current_height) : 0,
      ageInMonths,
      blood_type: child.blood_type || "-",
      special_conditions: child.special_conditions ? JSON.parse(child.special_conditions) : [],
      special_conditions_notes: child.special_conditions_notes || "",
      zScoreBB: child.current_weight ? calculateZScore(Number(child.current_weight), ageInMonths, child.gender, "BB") : 0,
      zScoreTB: child.current_height ? calculateZScore(Number(child.current_height), ageInMonths, child.gender, "TB") : 0,
      status: (child.current_weight && child.current_height) 
        ? getNutritionalStatus(
            calculateZScore(Number(child.current_weight), ageInMonths, child.gender, "BB"),
            calculateZScore(Number(child.current_height), ageInMonths, child.gender, "TB")
          )
        : "Normal",
      mother_id: child.mother?.mother_id,
      mother_name: child.mother?.mother_name || "-",
      measurements: child.measurements.map((m: any) => ({
        measurement_id: m.measurement_id,
        date: formatDateIndonesian(m.visit_date),
        dateRaw: m.visit_date.toISOString().split("T")[0],
        ageAtVisit: child.birth_date ? calculateAgeInMonths(child.birth_date, m.visit_date) : 0,
        weight: m.weight ? Number(m.weight) : 0,
        height: m.height ? Number(m.height) : 0,
        head_circumference: m.head_circumference ? Number(m.head_circumference) : 0,
        vitamin_a_capsule: m.vitamin_a_capsule || "-",
        deworming_pill: m.deworming_pill ? "Ya" : "Tidak",
        immunizations: m.immunizations || "-",
        supplementary_feeding: m.supplementary_feeding ? "Ya" : "Tidak",
        cadre_notes: m.cadre_notes || "-",
      })),
    };
  } catch (error) {
    console.error("Error fetching child detail:", error);
    return null;
  }
}

export async function updateChild(childId: string, data: any) {
  try {
    const updated = await prisma.child.update({
      where: { child_id: childId },
      data: {
        national_id: data.national_id || null,
        child_name: data.child_name,
        birth_order: data.birth_order ? parseInt(data.birth_order) : null,
        birth_place: data.birth_place || null,
        birth_date: data.birth_date ? new Date(data.birth_date) : null,
        gender: data.gender,
        birth_weight: data.birth_weight ? parseFloat(data.birth_weight) : null,
        birth_length: data.birth_length ? parseFloat(data.birth_length) : null,
        current_weight: data.current_weight ? parseFloat(data.current_weight) : null,
        current_height: data.current_height ? parseFloat(data.current_height) : null,
        blood_type: (data.blood_type && data.blood_type !== "-") ? data.blood_type : null,
        special_conditions: data.special_conditions ? JSON.stringify(data.special_conditions) : "[]",
        special_conditions_notes: data.special_conditions_notes || null,
      }
    });

    // Update mother status in case birth date changes
    if (updated.mother_id && updated.birth_date) {
      const mother = await prisma.mother.findUnique({
        where: { mother_id: updated.mother_id },
        include: { children: true }
      });
      if (mother && (mother.ui_status === "Calon Ibu" || mother.ui_status === "Ibu Hamil")) {
        const birthDate = new Date(updated.birth_date);
        const diffTime = Math.abs(new Date().getTime() - birthDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const newStatus = diffDays <= 42 ? "Ibu Nifas" : "Ibu Balita";
        
        await prisma.mother.update({
          where: { mother_id: updated.mother_id },
          data: { ui_status: newStatus }
        });
      }
    }

    // Save custom avatar to local file store
    if (data.avatarUrl !== undefined) {
      saveCustomAvatar("children", childId, data.avatarUrl);
    }

    return { success: true, id: updated.child_id };
  } catch (error: any) {
    console.error("Error updating child:", error);
    return { success: false, error: error.message || "Gagal memperbarui data anak." };
  }
}

export async function createChildMeasurement(data: any) {
  try {
    const measurement = await prisma.childMeasurement.create({
      data: {
        child_id: data.child_id,
        visit_date: data.visit_date ? new Date(data.visit_date) : new Date(),
        weight: data.weight ? parseFloat(data.weight) : null,
        height: data.height ? parseFloat(data.height) : null,
        head_circumference: data.head_circumference ? parseFloat(data.head_circumference) : null,
        vitamin_a_capsule: data.vitamin_a || "Tidak Diberikan",
        deworming_pill: !!data.deworming,
        supplementary_feeding: !!data.pmt,
        immunizations: data.immunization || null,
        cadre_notes: data.notes || null,
      }
    });

    // Update child current weight and height
    await prisma.child.update({
      where: { child_id: data.child_id },
      data: {
        current_weight: data.weight ? parseFloat(data.weight) : undefined,
        current_height: data.height ? parseFloat(data.height) : undefined,
      }
    });

    return { success: true, id: measurement.measurement_id };
  } catch (error: any) {
    console.error("Error creating child measurement:", error);
    return { success: false, error: error.message || "Gagal menyimpan data penimbangan." };
  }
}


