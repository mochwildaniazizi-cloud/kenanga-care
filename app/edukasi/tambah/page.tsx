"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { FiArrowLeft } from "react-icons/fi";
import { 
  MdOutlineArticle, MdOutlineVideoLibrary, MdCheckCircleOutline, 
  MdClose, MdLink, MdUploadFile,
  MdFormatBold, MdFormatItalic, MdFormatUnderlined,
  MdFormatListBulleted, MdFormatListNumbered, MdFormatQuote,
  MdUndo, MdRedo, MdInsertPhoto, MdGridOn,
  MdFormatAlignLeft, MdFormatAlignCenter, MdFormatAlignRight, MdFormatAlignJustify
} from "react-icons/md";
import { mockArticles } from "../data";
import { useUserRole } from "@/context/UserRoleContext";

const AVAILABLE_CATEGORIES = [
  "Gizi & MPASI",
  "Imunisasi",
  "Ibu Hamil",
  "Ibu Nifas",
  "Tumbuh Kembang"
];

function TambahArtikelForm() {
  const { role } = useUserRole();
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category");
  const editId = searchParams.get("edit");

  useEffect(() => {
    if (role === "ibu") {
      router.replace("/edukasi");
    }
  }, [role, router]);

  if (role === "ibu") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-10 h-10 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-semibold text-base-text-secondary">Mengalihkan...</p>
      </div>
    );
  }

  // Form State
  const [title, setTitle] = useState("");
  const [type, setType] = useState<"Artikel" | "Video">("Artikel");
  const [durationValue, setDurationValue] = useState("");
  const [imageUrl, setImageUrl] = useState(
    "https://images.unsplash.com/photo-1576086213369-97a306d36557?q=80&w=600&auto=format&fit=crop"
  );
  const [imageSourceType, setImageSourceType] = useState<"url" | "file">("url");
  const [fileName, setFileName] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleEditorInput = (e: React.FormEvent<HTMLDivElement>) => {
    setContent(e.currentTarget.innerHTML);
  };

  // Image editing states
  const [selectedImg, setSelectedImg] = useState<HTMLImageElement | null>(null);
  const [imgWidth, setImgWidth] = useState("");
  const [imgHeight, setImgHeight] = useState("");
  const [imgAlign, setImgAlign] = useState<"left" | "center" | "right" | "none">("none");
  const [imgRatio, setImgRatio] = useState<number>(1);
  const [lockRatio, setLockRatio] = useState<boolean>(true);

  // Table editing states
  const [selectedTable, setSelectedTable] = useState<HTMLTableElement | null>(null);
  const [tableAlign, setTableAlign] = useState<"left" | "center" | "right" | "full">("full");
  const [selectedCell, setSelectedCell] = useState<HTMLTableCellElement | null>(null);
  const [cellAlign, setCellAlign] = useState<"left" | "center" | "right">("left");
  const [columnWidth, setColumnWidth] = useState<string>("");

  const handleEditorClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    
    // Check if clicked image
    if (target.tagName === "IMG") {
      const img = target as HTMLImageElement;
      setSelectedImg(img);
      setSelectedTable(null); // Clear table selection
      setImgWidth(img.style.width || img.width.toString() || "");
      setImgHeight(img.style.height || img.height.toString() || "");
      
      const naturalWidth = img.naturalWidth || img.width || 1;
      const naturalHeight = img.naturalHeight || img.height || 1;
      setImgRatio(naturalWidth / naturalHeight);

      if (img.style.marginLeft === "auto" && img.style.marginRight === "auto") {
        setImgAlign("center");
      } else if (img.style.float === "left") {
        setImgAlign("left");
      } else if (img.style.float === "right") {
        setImgAlign("right");
      } else {
        setImgAlign("none");
      }
      return;
    }

    // Otherwise find table ancestor (also check for cell)
    let currentElement: HTMLElement | null = target;
    let foundTable: HTMLTableElement | null = null;
    let foundCell: HTMLTableCellElement | null = null;
    while (currentElement && currentElement !== editorRef.current) {
      if (currentElement.tagName === "TD" || currentElement.tagName === "TH") {
        foundCell = currentElement as HTMLTableCellElement;
      }
      if (currentElement.tagName === "TABLE") {
        foundTable = currentElement as HTMLTableElement;
        break;
      }
      currentElement = currentElement.parentElement;
    }
    
    if (foundTable) {
      setSelectedTable(foundTable);
      setSelectedImg(null); // Clear image selection
      if (foundCell) {
        setSelectedCell(foundCell);
        setCellAlign((foundCell.style.textAlign as any) || "left");
        setColumnWidth(foundCell.style.width || "");
      } else {
        setSelectedCell(null);
        setColumnWidth("");
      }
      if (foundTable.style.float === "left") {
        setTableAlign("left");
      } else if (foundTable.style.float === "right") {
        setTableAlign("right");
      } else if (foundTable.style.marginLeft === "auto" && foundTable.style.marginRight === "auto") {
        setTableAlign("center");
      } else {
        setTableAlign("full");
      }
    } else {
      setSelectedImg(null);
      setSelectedTable(null);
      setSelectedCell(null);
    }
  };

  const handleEditorMouseUp = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target.tagName === "IMG") {
      const img = target as HTMLImageElement;
      setSelectedImg(img);
      setSelectedTable(null);
      setImgWidth(img.style.width || img.style.width || img.width.toString() || "");
      setImgHeight(img.style.height || img.style.height || img.height.toString() || "");
      
      const naturalWidth = img.naturalWidth || img.width || 1;
      const naturalHeight = img.naturalHeight || img.height || 1;
      setImgRatio(naturalWidth / naturalHeight);
    }
  };

  const handleWidthChange = (val: string) => {
    setImgWidth(val);
    if (selectedImg) {
      if (val) {
        selectedImg.style.width = /^\d+$/.test(val) ? `${val}px` : val;
        
        // Calculate corresponding height if lock ratio is true
        const numericWidth = val.replace(/px$/, "");
        if (lockRatio && /^\d+$/.test(numericWidth) && imgRatio) {
          const calculatedHeight = Math.round(parseInt(numericWidth) / imgRatio);
          setImgHeight(calculatedHeight.toString());
          selectedImg.style.height = `${calculatedHeight}px`;
        }
      } else {
        selectedImg.style.width = "";
        if (lockRatio) {
          setImgHeight("");
          selectedImg.style.height = "";
        }
      }
      if (editorRef.current) {
        setContent(editorRef.current.innerHTML);
      }
    }
  };

  const handleHeightChange = (val: string) => {
    setImgHeight(val);
    if (selectedImg) {
      if (val) {
        selectedImg.style.height = /^\d+$/.test(val) ? `${val}px` : val;

        // Calculate corresponding width if lock ratio is true
        const numericHeight = val.replace(/px$/, "");
        if (lockRatio && /^\d+$/.test(numericHeight) && imgRatio) {
          const calculatedWidth = Math.round(parseInt(numericHeight) * imgRatio);
          setImgWidth(calculatedWidth.toString());
          selectedImg.style.width = `${calculatedWidth}px`;
        }
      } else {
        selectedImg.style.height = "";
        if (lockRatio) {
          setImgWidth("");
          selectedImg.style.width = "";
        }
      }
      if (editorRef.current) {
        setContent(editorRef.current.innerHTML);
      }
    }
  };

  // Table Editing Handlers
  const addRow = () => {
    if (selectedTable) {
      const tbody = selectedTable.querySelector("tbody") || selectedTable;
      const lastRow = tbody.querySelector("tr");
      const cellCount = lastRow ? lastRow.cells.length : 3;
      const newRow = document.createElement("tr");
      for (let i = 0; i < cellCount; i++) {
        const newCell = document.createElement("td");
        newCell.className = "border border-base-border/80 p-2";
        newCell.innerHTML = "";
        newRow.appendChild(newCell);
      }
      tbody.appendChild(newRow);
      if (editorRef.current) {
        setContent(editorRef.current.innerHTML);
      }
    }
  };

  const removeRow = () => {
    if (selectedTable && selectedCell) {
      const row = selectedCell.closest("tr");
      if (row) {
        row.remove();
        setSelectedCell(null);
        if (editorRef.current) setContent(editorRef.current.innerHTML);
      }
    } else if (selectedTable) {
      // Remove last row
      const tbody = selectedTable.querySelector("tbody") || selectedTable;
      const rows = tbody.querySelectorAll("tr");
      if (rows.length > 0) {
        rows[rows.length - 1].remove();
        if (editorRef.current) setContent(editorRef.current.innerHTML);
      }
    }
  };

  const addColumn = () => {
    if (selectedTable) {
      const theadRow = selectedTable.querySelector("thead tr");
      if (theadRow) {
        const th = document.createElement("th");
        th.className = "border border-base-border/80 p-2 font-bold bg-base-bg";
        th.innerHTML = "Kolom Baru";
        theadRow.appendChild(th);
      }
      const rows = selectedTable.querySelectorAll("tbody tr");
      rows.forEach(row => {
        const td = document.createElement("td");
        td.className = "border border-base-border/80 p-2";
        td.innerHTML = "";
        row.appendChild(td);
      });
      if (rows.length === 0) {
        const tbody = selectedTable.querySelector("tbody") || selectedTable;
        const newRow = document.createElement("tr");
        const td = document.createElement("td");
        td.className = "border border-base-border/80 p-2";
        td.innerHTML = "";
        newRow.appendChild(td);
        tbody.appendChild(newRow);
      }
      if (editorRef.current) {
        setContent(editorRef.current.innerHTML);
      }
    }
  };

  const removeColumn = () => {
    if (selectedTable && selectedCell) {
      const cellIndex = selectedCell.cellIndex;
      const allRows = selectedTable.querySelectorAll("tr");
      allRows.forEach(row => {
        if (row.cells[cellIndex]) {
          row.deleteCell(cellIndex);
        }
      });
      setSelectedCell(null);
      if (editorRef.current) setContent(editorRef.current.innerHTML);
    } else if (selectedTable) {
      // Remove last column
      const allRows = selectedTable.querySelectorAll("tr");
      allRows.forEach(row => {
        if (row.cells.length > 0) {
          row.deleteCell(row.cells.length - 1);
        }
      });
      if (editorRef.current) setContent(editorRef.current.innerHTML);
    }
  };

  const handleCellAlignChange = (align: "left" | "center" | "right") => {
    setCellAlign(align);
    if (selectedCell) {
      selectedCell.style.textAlign = align;
      if (editorRef.current) setContent(editorRef.current.innerHTML);
    }
  };

  const handleColumnWidthChange = (val: string) => {
    setColumnWidth(val);
    if (selectedCell && selectedTable) {
      const cellIndex = selectedCell.cellIndex;
      const allRows = selectedTable.querySelectorAll("tr");
      allRows.forEach(row => {
        if (row.cells[cellIndex]) {
          (row.cells[cellIndex] as HTMLElement).style.width = val ? (/^\d+$/.test(val) ? `${val}px` : val) : "";
        }
      });
      if (editorRef.current) setContent(editorRef.current.innerHTML);
    }
  };

  const handleTableAlignChange = (align: "left" | "center" | "right" | "full") => {
    setTableAlign(align);
    if (selectedTable) {
      selectedTable.style.float = "";
      selectedTable.style.marginLeft = "";
      selectedTable.style.marginRight = "";
      selectedTable.style.width = "";
      
      if (align === "left") {
        selectedTable.style.float = "left";
        selectedTable.style.marginRight = "1rem";
        selectedTable.style.marginBottom = "0.5rem";
      } else if (align === "right") {
        selectedTable.style.float = "right";
        selectedTable.style.marginLeft = "1rem";
        selectedTable.style.marginBottom = "0.5rem";
      } else if (align === "center") {
        selectedTable.style.marginLeft = "auto";
        selectedTable.style.marginRight = "auto";
        selectedTable.style.display = "table";
      } else if (align === "full") {
        selectedTable.style.width = "100%";
        selectedTable.style.display = "table";
      }
      if (editorRef.current) {
        setContent(editorRef.current.innerHTML);
      }
    }
  };

  const handleDeleteTable = () => {
    if (selectedTable) {
      selectedTable.remove();
      setSelectedTable(null);
      if (editorRef.current) {
        setContent(editorRef.current.innerHTML);
      }
    }
  };

  const handleAlignChange = (align: "left" | "center" | "right" | "none") => {
    setImgAlign(align);
    if (selectedImg) {
      selectedImg.style.float = "";
      selectedImg.style.display = "";
      selectedImg.style.marginLeft = "";
      selectedImg.style.marginRight = "";
      
      if (align === "left") {
        selectedImg.style.float = "left";
        selectedImg.style.marginRight = "1rem";
        selectedImg.style.marginBottom = "0.5rem";
      } else if (align === "right") {
        selectedImg.style.float = "right";
        selectedImg.style.marginLeft = "1rem";
        selectedImg.style.marginBottom = "0.5rem";
      } else if (align === "center") {
        selectedImg.style.display = "block";
        selectedImg.style.marginLeft = "auto";
        selectedImg.style.marginRight = "auto";
      }
      if (editorRef.current) {
        setContent(editorRef.current.innerHTML);
      }
    }
  };

  const handleDeleteImage = () => {
    if (selectedImg) {
      selectedImg.remove();
      setSelectedImg(null);
      if (editorRef.current) {
        setContent(editorRef.current.innerHTML);
      }
    }
  };

  const runCommand = (command: string, value: string = "") => {
    document.execCommand(command, false, value);
  };

  const triggerInlineImageUpload = () => {
    fileInputRef.current?.click();
  };

  const handleInlineImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("Gambar terlalu besar! Maksimal 2MB untuk gambar di dalam artikel.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        editorRef.current?.focus();
        document.execCommand("insertImage", false, dataUrl);
        if (editorRef.current) {
          setContent(editorRef.current.innerHTML);
        }
      };
      reader.readAsDataURL(file);
      e.target.value = "";
    }
  };

  const insertImage = () => {
    const url = prompt("Masukkan URL Gambar:");
    if (url) {
      editorRef.current?.focus();
      document.execCommand("insertImage", false, url);
      // Pemicu pembaruan state content
      if (editorRef.current) {
        setContent(editorRef.current.innerHTML);
      }
    }
  };

  const insertTable = () => {
    const tableHTML = `<table class="border-collapse border border-base-border/80 my-4 w-full text-xs">
      <thead>
        <tr class="bg-base-bg">
          <th class="border border-base-border/80 p-2 font-bold">Kolom 1</th>
          <th class="border border-base-border/80 p-2 font-bold">Kolom 2</th>
          <th class="border border-base-border/80 p-2 font-bold">Kolom 3</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td class="border border-base-border/80 p-2">Isi baris 1...</td>
          <td class="border border-base-border/80 p-2">Isi baris 1...</td>
          <td class="border border-base-border/80 p-2">Isi baris 1...</td>
        </tr>
        <tr>
          <td class="border border-base-border/80 p-2">Isi baris 2...</td>
          <td class="border border-base-border/80 p-2">Isi baris 2...</td>
          <td class="border border-base-border/80 p-2">Isi baris 2...</td>
        </tr>
      </tbody>
    </table><p></p>`;
    document.execCommand("insertHTML", false, tableHTML);
    // Pemicu pembaruan state content
    if (editorRef.current) {
      setContent(editorRef.current.innerHTML);
    }
  };

  // Set initial category from query param
  useEffect(() => {
    if (initialCategory && AVAILABLE_CATEGORIES.includes(initialCategory)) {
      setSelectedCategories([initialCategory]);
    }
  }, [initialCategory]);

  // Load data for edit mode
  useEffect(() => {
    if (editId) {
      // 1. Check custom articles
      const local = localStorage.getItem("custom_articles");
      let found: any = null;
      if (local) {
        try {
          const parsed = JSON.parse(local);
          found = parsed.find((a: any) => a.id === editId);
        } catch (e) {
          console.error(e);
        }
      }
      
      // 2. If not found in custom, check mock articles
      if (!found) {
        found = mockArticles.find((a) => a.id === editId);
        if (found) {
          const mockContent = getMockContent(found.id, found.title);
          found = { ...found, content: mockContent };
        }
      }

      if (found) {
        setTitle(found.title);
        setType(found.type);
        const durMatch = found.duration.match(/^(\d+)/);
        setDurationValue(durMatch ? durMatch[1] : "");
        
        if (found.imageUrl.startsWith("data:image/")) {
          setImageSourceType("file");
        } else {
          setImageSourceType("url");
        }
        setImageUrl(found.imageUrl);
        setSelectedCategories(found.categories);
        setContent(found.content || "");
        
        if (editorRef.current) {
          editorRef.current.innerHTML = found.content || "";
        }
      }
    }
  }, [editId]);

  const handleCategoryToggle = (cat: string) => {
    setSelectedCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert("Judul artikel wajib diisi!");
      return;
    }
    if (selectedCategories.length === 0) {
      alert("Pilih minimal satu kategori!");
      return;
    }

    setIsSubmitting(true);

    const isEditMode = !!editId;
    const newArticle = {
      id: isEditMode ? editId : "CUSTOM_" + Date.now(),
      title,
      categories: selectedCategories,
      type,
      duration: `${durationValue || "3"} menit ${type === "Artikel" ? "baca" : "tonton"}`,
      imageUrl: imageUrl.trim() || "https://images.unsplash.com/photo-1576086213369-97a306d36557?q=80&w=600&auto=format&fit=crop",
      content
    };

    // Save to localStorage
    try {
      const existing = localStorage.getItem("custom_articles");
      let list = existing ? JSON.parse(existing) : [];
      
      if (isEditMode) {
        const index = list.findIndex((a: any) => a.id === editId);
        if (index > -1) {
          list[index] = newArticle;
        } else {
          list.push(newArticle);
        }
      } else {
        list.push(newArticle);
      }
      
      localStorage.setItem("custom_articles", JSON.stringify(list));

      setShowSuccessModal(true);
    } catch (err) {
      console.error(err);
      alert("Gagal menyimpan artikel.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-[800px] mx-auto pb-12 animate-in fade-in duration-300">
      {/* Header & Back Link */}
      <div className="mb-6">
        <Link 
          href={editId ? `/edukasi/${editId}` : "/edukasi"} 
          className="inline-flex items-center gap-2 text-base-text-primary font-bold hover:text-brand-primary transition"
        >
          <FiArrowLeft className="w-4 h-4" /> {editId ? "Kembali ke Detail Artikel" : "Kembali ke Edukasi"}
        </Link>
      </div>

      <div className="bg-base-white rounded-bento-lg p-8 shadow-sm border border-base-border/30">
        <h1 className="text-2xl font-bold text-base-text-primary mb-2">
          {editId ? "Edit Artikel / Konten" : "Tulis Artikel / Konten Baru"}
        </h1>
        <p className="text-sm text-base-text-secondary mb-8">Berbagi info kesehatan ibu, imunisasi anak, gizi MPASI, dan tumbuh kembang balita.</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Judul */}
          <div className="space-y-2">
            <label className="block text-sm font-bold text-base-text-primary">Judul Konten</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Masukkan judul artikel atau video edukasi..."
              className="w-full px-4 py-3 border border-base-border/50 rounded-lg focus:outline-none focus:border-brand-primary bg-transparent text-base-text-primary transition"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Tipe Konten */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-base-text-primary">Tipe Konten</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setType("Artikel")}
                  className={`flex items-center justify-center gap-2 py-3 rounded-lg border-2 font-bold text-sm transition cursor-pointer ${
                    type === "Artikel"
                      ? "border-brand-primary text-brand-primary bg-brand-soft/40"
                      : "border-base-border/50 text-base-text-secondary hover:border-brand-primary/50"
                  }`}
                >
                  <MdOutlineArticle className="w-5 h-5" /> Artikel
                </button>
                <button
                  type="button"
                  onClick={() => setType("Video")}
                  className={`flex items-center justify-center gap-2 py-3 rounded-lg border-2 font-bold text-sm transition cursor-pointer ${
                    type === "Video"
                      ? "border-status-orange-solid text-status-orange-solid bg-status-orange-light/50"
                      : "border-base-border/50 text-base-text-secondary hover:border-status-orange-solid/50"
                  }`}
                >
                  <MdOutlineVideoLibrary className="w-5 h-5" /> Video
                </button>
              </div>
            </div>

            {/* Durasi */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-base-text-primary">
                Estimasi Waktu ({type === "Artikel" ? "Menit Baca" : "Menit Tonton"})
              </label>
              <input
                type="number"
                min="1"
                value={durationValue}
                onChange={(e) => setDurationValue(e.target.value)}
                placeholder="Contoh: 4"
                className="w-full px-4 py-3 border border-base-border/50 rounded-lg focus:outline-none focus:border-brand-primary bg-transparent text-base-text-primary transition"
                required
              />
            </div>
          </div>

          {/* Kategori (Multiple Selectable Pills) */}
          <div className="space-y-2">
            <label className="block text-sm font-bold text-base-text-primary">Pilih Kategori Konten</label>
            <p className="text-xs text-base-text-secondary mb-2">Pilih satu atau lebih kategori yang relevan:</p>
            <div className="flex flex-wrap gap-2.5">
              {AVAILABLE_CATEGORIES.map(cat => {
                const isSelected = selectedCategories.includes(cat);
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => handleCategoryToggle(cat)}
                    className={`px-4 py-2 rounded-full border text-xs font-bold transition cursor-pointer ${
                      isSelected
                        ? "bg-brand-soft text-brand-primary border-brand-primary"
                        : "bg-base-bg/30 text-base-text-secondary border-base-border/50 hover:bg-base-border/20"
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Gambar Sampul */}
          <div className="space-y-3">
            <label className="block text-sm font-bold text-base-text-primary">Gambar Sampul</label>
            
            {/* Switcher Tipe Input */}
            <div className="flex gap-2 p-1 bg-base-bg/50 border border-base-border/30 rounded-xl w-fit">
              <button
                key="type-url"
                type="button"
                onClick={() => {
                  setImageSourceType("url");
                  setImageUrl("https://images.unsplash.com/photo-1576086213369-97a306d36557?q=80&w=600&auto=format&fit=crop");
                  setFileName("");
                }}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                  imageSourceType === "url"
                    ? "bg-base-white text-brand-primary shadow-sm border border-base-border/20"
                    : "text-base-text-secondary hover:text-base-text-primary"
                }`}
              >
                <MdLink className="w-4 h-4" /> Tautan URL
              </button>
              <button
                key="type-file"
                type="button"
                onClick={() => {
                  setImageSourceType("file");
                  setImageUrl("");
                  setFileName("");
                }}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                  imageSourceType === "file"
                    ? "bg-base-white text-brand-primary shadow-sm border border-base-border/20"
                    : "text-base-text-secondary hover:text-base-text-primary"
                }`}
              >
                <MdUploadFile className="w-4 h-4" /> Unggah File
              </button>
            </div>

            {/* Input Conditional */}
            {imageSourceType === "url" ? (
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="Masukkan link gambar sampul..."
                className="w-full px-4 py-3 border border-base-border/50 rounded-lg focus:outline-none focus:border-brand-primary bg-transparent text-base-text-primary transition text-xs"
              />
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-base-border/60 rounded-xl cursor-pointer hover:bg-brand-soft/5 hover:border-brand-primary/50 transition duration-150">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <MdUploadFile className="w-8 h-8 text-base-text-secondary mb-2" />
                      <p className="text-xs text-base-text-primary font-bold">
                        {fileName ? `File: ${fileName}` : "Klik untuk memilih file gambar"}
                      </p>
                      <p className="text-[10px] text-base-text-secondary mt-1">PNG, JPG, JPEG, WEBP (maks. 5MB)</p>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          if (file.size > 5 * 1024 * 1024) {
                            alert("File terlalu besar! Maksimal ukuran file adalah 5MB.");
                            return;
                          }
                          setFileName(file.name);
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setImageUrl(reader.result as string);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                </div>
                {imageUrl && (
                  <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-base-border/50 group">
                    <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => {
                        setImageUrl("");
                        setFileName("");
                      }}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600 transition"
                    >
                      <MdClose className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Isi Konten */}
          <div className="space-y-2">
            <label className="block text-sm font-bold text-base-text-primary">
              {type === "Artikel" ? "Isi Artikel" : "Deskripsi Video / Link Video"}
            </label>
            
            {type === "Artikel" ? (
              <div className="space-y-1">
                {/* Local Placeholder Styles */}
                <style>{`
                  .rich-editor[contenteditable]:empty::before {
                    content: attr(data-placeholder);
                    color: #94a3b8;
                    cursor: text;
                  }
                  .rich-editor blockquote {
                    border-left: 4px solid #ea2986;
                    padding-left: 1rem;
                    margin: 1.25rem 0;
                    font-style: italic;
                    color: #4b5563;
                  }
                  .rich-editor table {
                    border-collapse: collapse;
                    width: 100%;
                    margin: 1.25rem 0;
                  }
                  .rich-editor th, .rich-editor td {
                    border: 1px solid #cbd5e1;
                    padding: 8px;
                    text-align: left;
                  }
                  .rich-editor th {
                    background-color: #f8fafc;
                    font-weight: bold;
                  }
                  .rich-editor img {
                    max-width: 100%;
                    height: auto;
                    border-radius: 8px;
                    margin: 1.25rem 0;
                  }
                `}</style>
                
                {/* Editor Container */}
                <div className="border border-base-border/50 rounded-lg overflow-hidden focus-within:border-brand-primary transition">
                  {/* Toolbar */}
                  <div className="flex flex-wrap items-center gap-1 p-2 bg-base-bg/50 border-b border-base-border/50">
                    <button
                      key="btn-bold"
                      type="button"
                      onMouseDown={(e) => { e.preventDefault(); runCommand("bold"); }}
                      className="p-1.5 rounded hover:bg-base-border/30 text-base-text-secondary hover:text-base-text-primary transition cursor-pointer"
                      title="Tebal"
                    >
                      <MdFormatBold className="w-5 h-5" />
                    </button>
                    <button
                      key="btn-italic"
                      type="button"
                      onMouseDown={(e) => { e.preventDefault(); runCommand("italic"); }}
                      className="p-1.5 rounded hover:bg-base-border/30 text-base-text-secondary hover:text-base-text-primary transition cursor-pointer"
                      title="Miring"
                    >
                      <MdFormatItalic className="w-5 h-5" />
                    </button>
                    <button
                      key="btn-underline"
                      type="button"
                      onMouseDown={(e) => { e.preventDefault(); runCommand("underline"); }}
                      className="p-1.5 rounded hover:bg-base-border/30 text-base-text-secondary hover:text-base-text-primary transition cursor-pointer"
                      title="Garis Bawah"
                    >
                      <MdFormatUnderlined className="w-5 h-5" />
                    </button>
                    
                    <span className="w-px h-5 bg-base-border/50 mx-1"></span>

                    <button
                      key="btn-h1"
                      type="button"
                      onMouseDown={(e) => { e.preventDefault(); runCommand("formatBlock", "<h1>"); }}
                      className="p-1.5 rounded hover:bg-base-border/30 text-base-text-secondary hover:text-base-text-primary transition text-xs font-bold cursor-pointer"
                      title="Judul Utama (H1)"
                    >
                      H1
                    </button>
                    <button
                      key="btn-h2"
                      type="button"
                      onMouseDown={(e) => { e.preventDefault(); runCommand("formatBlock", "<h2>"); }}
                      className="p-1.5 rounded hover:bg-base-border/30 text-base-text-secondary hover:text-base-text-primary transition text-xs font-bold cursor-pointer"
                      title="Sub Judul (H2)"
                    >
                      H2
                    </button>
                    
                    <span className="w-px h-5 bg-base-border/50 mx-1"></span>

                    <button
                      key="btn-align-left"
                      type="button"
                      onMouseDown={(e) => { e.preventDefault(); runCommand("justifyLeft"); }}
                      className="p-1.5 rounded hover:bg-base-border/30 text-base-text-secondary hover:text-base-text-primary transition cursor-pointer"
                      title="Rata Kiri"
                    >
                      <MdFormatAlignLeft className="w-5 h-5" />
                    </button>
                    <button
                      key="btn-align-center"
                      type="button"
                      onMouseDown={(e) => { e.preventDefault(); runCommand("justifyCenter"); }}
                      className="p-1.5 rounded hover:bg-base-border/30 text-base-text-secondary hover:text-base-text-primary transition cursor-pointer"
                      title="Rata Tengah"
                    >
                      <MdFormatAlignCenter className="w-5 h-5" />
                    </button>
                    <button
                      key="btn-align-right"
                      type="button"
                      onMouseDown={(e) => { e.preventDefault(); runCommand("justifyRight"); }}
                      className="p-1.5 rounded hover:bg-base-border/30 text-base-text-secondary hover:text-base-text-primary transition cursor-pointer"
                      title="Rata Kanan"
                    >
                      <MdFormatAlignRight className="w-5 h-5" />
                    </button>
                    <button
                      key="btn-align-justify"
                      type="button"
                      onMouseDown={(e) => { e.preventDefault(); runCommand("justifyFull"); }}
                      className="p-1.5 rounded hover:bg-base-border/30 text-base-text-secondary hover:text-base-text-primary transition cursor-pointer"
                      title="Rata Kiri Kanan"
                    >
                      <MdFormatAlignJustify className="w-5 h-5" />
                    </button>

                    <button
                      key="btn-bullet"
                      type="button"
                      onMouseDown={(e) => { e.preventDefault(); runCommand("insertUnorderedList"); }}
                      className="p-1.5 rounded hover:bg-base-border/30 text-base-text-secondary hover:text-base-text-primary transition cursor-pointer"
                      title="Daftar Simbol"
                    >
                      <MdFormatListBulleted className="w-5 h-5" />
                    </button>
                    <button
                      key="btn-number"
                      type="button"
                      onMouseDown={(e) => { e.preventDefault(); runCommand("insertOrderedList"); }}
                      className="p-1.5 rounded hover:bg-base-border/30 text-base-text-secondary hover:text-base-text-primary transition cursor-pointer"
                      title="Daftar Angka"
                    >
                      <MdFormatListNumbered className="w-5 h-5" />
                    </button>
                    <button
                      key="btn-quote"
                      type="button"
                      onMouseDown={(e) => { e.preventDefault(); runCommand("formatBlock", "<blockquote>"); }}
                      className="p-1.5 rounded hover:bg-base-border/30 text-base-text-secondary hover:text-base-text-primary transition cursor-pointer"
                      title="Kutipan"
                    >
                      <MdFormatQuote className="w-5 h-5" />
                    </button>

                    <span className="w-px h-5 bg-base-border/50 mx-1"></span>

                    <button
                      key="btn-image-url"
                      type="button"
                      onMouseDown={(e) => { e.preventDefault(); insertImage(); }}
                      className="p-1.5 rounded hover:bg-base-border/30 text-base-text-secondary hover:text-base-text-primary transition cursor-pointer"
                      title="Sisipkan Gambar dari Link"
                    >
                      <MdLink className="w-5 h-5" />
                    </button>

                    <button
                      key="btn-image-file"
                      type="button"
                      onMouseDown={(e) => { e.preventDefault(); triggerInlineImageUpload(); }}
                      className="p-1.5 rounded hover:bg-base-border/30 text-base-text-secondary hover:text-base-text-primary transition cursor-pointer"
                      title="Unggah & Sisipkan Gambar"
                    >
                      <MdInsertPhoto className="w-5 h-5" />
                    </button>

                    <button
                      key="btn-table"
                      type="button"
                      onMouseDown={(e) => { e.preventDefault(); insertTable(); }}
                      className="p-1.5 rounded hover:bg-base-border/30 text-base-text-secondary hover:text-base-text-primary transition cursor-pointer"
                      title="Sisipkan Tabel"
                    >
                      <MdGridOn className="w-5 h-5" />
                    </button>

                    <span className="w-px h-5 bg-base-border/50 mx-1"></span>

                    <button
                      key="btn-undo"
                      type="button"
                      onMouseDown={(e) => { e.preventDefault(); runCommand("undo"); }}
                      className="p-1.5 rounded hover:bg-base-border/30 text-base-text-secondary hover:text-base-text-primary transition cursor-pointer"
                      title="Batal"
                    >
                      <MdUndo className="w-5 h-5" />
                    </button>
                    <button
                      key="btn-redo"
                      type="button"
                      onMouseDown={(e) => { e.preventDefault(); runCommand("redo"); }}
                      className="p-1.5 rounded hover:bg-base-border/30 text-base-text-secondary hover:text-base-text-primary transition cursor-pointer"
                      title="Ulangi"
                    >
                      <MdRedo className="w-5 h-5" />
                    </button>
                  </div>
                  
                  {/* Floating/Inline Image Editor Controls */}
                  {selectedImg && (
                    <div className="bg-brand-soft/20 border-b border-base-border/50 p-3 flex flex-wrap items-center gap-4 text-xs font-semibold text-base-text-primary animate-in slide-in-from-top duration-200">
                      <div className="flex items-center gap-2">
                        <span className="text-brand-primary font-bold">Pengaturan Gambar:</span>
                      </div>
                      
                      {/* Width input */}
                      <div className="flex items-center gap-1.5">
                        <span>Lebar:</span>
                        <input
                          type="text"
                          value={imgWidth}
                          onChange={(e) => handleWidthChange(e.target.value)}
                          placeholder="e.g. 300px atau 50%"
                          className="w-24 px-2 py-1 border border-base-border/50 rounded bg-base-white text-xs text-base-text-primary focus:outline-none focus:border-brand-primary"
                        />
                      </div>

                      {/* Height input */}
                      <div className="flex items-center gap-1.5">
                        <span>Tinggi:</span>
                        <input
                          type="text"
                          value={imgHeight}
                          onChange={(e) => handleHeightChange(e.target.value)}
                          placeholder="e.g. auto"
                          className="w-24 px-2 py-1 border border-base-border/50 rounded bg-base-white text-xs text-base-text-primary focus:outline-none focus:border-brand-primary"
                        />
                      </div>

                      {/* Lock Ratio Checkbox */}
                      <label className="flex items-center gap-1.5 cursor-pointer text-xs select-none">
                        <input
                          type="checkbox"
                          checked={lockRatio}
                          onChange={(e) => setLockRatio(e.target.checked)}
                          className="rounded text-brand-primary border-base-border/50 focus:ring-brand-primary h-3.5 w-3.5 transition"
                        />
                        <span>Kunci Rasio</span>
                      </label>

                      {/* Align buttons */}
                      <div className="flex items-center gap-1">
                        <span>Posisi:</span>
                        <button
                          type="button"
                          onClick={() => handleAlignChange("left")}
                          className={`px-2.5 py-1 border rounded text-[10px] cursor-pointer transition ${
                            imgAlign === "left"
                              ? "bg-brand-primary text-base-white border-brand-primary"
                              : "bg-base-white border-base-border/50 hover:bg-base-bg text-base-text-secondary"
                          }`}
                        >
                          Kiri
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAlignChange("center")}
                          className={`px-2.5 py-1 border rounded text-[10px] cursor-pointer transition ${
                            imgAlign === "center"
                              ? "bg-brand-primary text-base-white border-brand-primary"
                              : "bg-base-white border-base-border/50 hover:bg-base-bg text-base-text-secondary"
                          }`}
                        >
                          Tengah
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAlignChange("right")}
                          className={`px-2.5 py-1 border rounded text-[10px] cursor-pointer transition ${
                            imgAlign === "right"
                              ? "bg-brand-primary text-base-white border-brand-primary"
                              : "bg-base-white border-base-border/50 hover:bg-base-bg text-base-text-secondary"
                          }`}
                        >
                          Kanan
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAlignChange("none")}
                          className={`px-2.5 py-1 border rounded text-[10px] cursor-pointer transition ${
                            imgAlign === "none"
                              ? "bg-brand-primary text-base-white border-brand-primary"
                              : "bg-base-white border-base-border/50 hover:bg-base-bg text-base-text-secondary"
                          }`}
                        >
                          Default
                        </button>
                      </div>

                      {/* Remove Button */}
                      <button
                        type="button"
                        onClick={handleDeleteImage}
                        className="ml-auto px-3 py-1 bg-red-500 hover:bg-red-600 text-base-white rounded text-[10px] font-bold transition cursor-pointer"
                      >
                        Hapus Gambar
                      </button>
                    </div>
                  )}

                  {/* Floating/Inline Table Editor Controls */}
                  {selectedTable && (
                    <div className="bg-brand-soft/20 border-b border-base-border/50 p-3 flex flex-col gap-3 text-xs font-semibold text-base-text-primary animate-in slide-in-from-top duration-200">
                      
                      {/* Row 1: Label + Row/Col actions + table align + delete */}
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-brand-primary font-bold shrink-0">Tabel:</span>

                        {/* Separator */}
                        <span className="text-[10px] text-base-text-secondary font-semibold shrink-0">Baris</span>
                        <button
                          type="button"
                          onClick={addRow}
                          className="px-2 py-1 border border-status-green-solid/50 bg-status-green-light text-status-green-solid hover:bg-status-green-solid hover:text-white rounded text-[10px] transition cursor-pointer font-bold"
                        >
                          + Tambah
                        </button>
                        <button
                          type="button"
                          onClick={removeRow}
                          title={selectedCell ? "Hapus baris sel yang dipilih" : "Hapus baris terakhir"}
                          className="px-2 py-1 border border-red-300 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded text-[10px] transition cursor-pointer font-bold"
                        >
                          − Hapus
                        </button>

                        <span className="w-px h-4 bg-base-border/50 mx-1"></span>

                        <span className="text-[10px] text-base-text-secondary font-semibold shrink-0">Kolom</span>
                        <button
                          type="button"
                          onClick={addColumn}
                          className="px-2 py-1 border border-status-green-solid/50 bg-status-green-light text-status-green-solid hover:bg-status-green-solid hover:text-white rounded text-[10px] transition cursor-pointer font-bold"
                        >
                          + Tambah
                        </button>
                        <button
                          type="button"
                          onClick={removeColumn}
                          title={selectedCell ? "Hapus kolom sel yang dipilih" : "Hapus kolom terakhir"}
                          className="px-2 py-1 border border-red-300 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded text-[10px] transition cursor-pointer font-bold"
                        >
                          − Hapus
                        </button>

                        <span className="w-px h-4 bg-base-border/50 mx-1"></span>

                        {/* Table position align */}
                        <span className="text-[10px] text-base-text-secondary font-semibold shrink-0">Posisi Tabel:</span>
                        {(["left", "center", "right", "full"] as const).map(a => (
                          <button
                            key={a}
                            type="button"
                            onClick={() => handleTableAlignChange(a)}
                            className={`px-2 py-1 border rounded text-[10px] cursor-pointer transition ${
                              tableAlign === a
                                ? "bg-brand-primary text-base-white border-brand-primary"
                                : "bg-base-white border-base-border/50 hover:bg-base-bg text-base-text-secondary"
                            }`}
                          >
                            {a === "left" ? "Kiri" : a === "center" ? "Tengah" : a === "right" ? "Kanan" : "Penuh"}
                          </button>
                        ))}

                        {/* Delete Table */}
                        <button
                          type="button"
                          onClick={handleDeleteTable}
                          className="ml-auto px-3 py-1 bg-red-500 hover:bg-red-600 text-base-white rounded text-[10px] font-bold transition cursor-pointer"
                        >
                          Hapus Tabel
                        </button>
                      </div>

                      {/* Row 2: Cell controls (only show when a cell is selected) */}
                      {selectedCell && (
                        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-base-border/30">
                          <span className="text-brand-primary/80 font-bold shrink-0">Sel Aktif:</span>

                          {/* Cell text align */}
                          <span className="text-[10px] text-base-text-secondary font-semibold">Rata Teks:</span>
                          {(["left", "center", "right"] as const).map(a => (
                            <button
                              key={a}
                              type="button"
                              onClick={() => handleCellAlignChange(a)}
                              className={`px-2 py-1 border rounded text-[10px] cursor-pointer transition ${
                                cellAlign === a
                                  ? "bg-brand-primary text-base-white border-brand-primary"
                                  : "bg-base-white border-base-border/50 hover:bg-base-bg text-base-text-secondary"
                              }`}
                            >
                              {a === "left" ? "Kiri" : a === "center" ? "Tengah" : "Kanan"}
                            </button>
                          ))}

                          <span className="w-px h-4 bg-base-border/50 mx-1"></span>

                          {/* Column width */}
                          <span className="text-[10px] text-base-text-secondary font-semibold">Lebar Kolom:</span>
                          <input
                            type="text"
                            value={columnWidth}
                            onChange={(e) => handleColumnWidthChange(e.target.value)}
                            placeholder="mis. 120px atau 20%"
                            className="w-28 px-2 py-1 border border-base-border/50 rounded bg-base-white text-xs text-base-text-primary focus:outline-none focus:border-brand-primary"
                          />
                          <span className="text-[10px] text-base-text-secondary">berlaku ke seluruh kolom</span>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* contentEditable Div */}
                  <div
                    ref={editorRef}
                    contentEditable
                    suppressContentEditableWarning
                    onInput={handleEditorInput}
                    onClick={handleEditorClick}
                    onMouseUp={handleEditorMouseUp}
                    className="rich-editor min-h-[300px] p-4 focus:outline-none bg-transparent text-base-text-primary text-sm prose max-w-none dark:prose-invert overflow-y-auto"
                    data-placeholder="Tuliskan artikel informatif Anda di sini..."
                  />

                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    className="hidden"
                    onChange={handleInlineImageUpload}
                  />
                </div>
              </div>
            ) : (
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Masukkan deskripsi singkat video edukasi atau tautan video..."
                rows={8}
                className="w-full px-4 py-3 border border-base-border/50 rounded-lg focus:outline-none focus:border-brand-primary bg-transparent text-base-text-primary transition resize-none"
              />
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-base-border/20">
            <Link
              href={editId ? `/edukasi/${editId}` : "/edukasi"}
              className="px-6 py-2.5 rounded-xl border border-base-border/50 hover:bg-base-bg text-base-text-secondary font-bold transition text-xs flex items-center"
            >
              Batal
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-brand-primary text-base-white hover:bg-status-pink-dark rounded-xl text-xs font-bold shadow-md shadow-brand-primary/10 transition cursor-pointer"
            >
              {isSubmitting ? "Menyimpan..." : editId ? "Simpan Perubahan" : "Simpan Konten"}
            </button>
          </div>
        </form>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-base-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden border border-base-border/20 animate-in zoom-in-95 duration-200">
            <div className="p-6 text-center space-y-4">
              <div className="w-16 h-16 bg-status-green-light text-status-green-solid rounded-full flex items-center justify-center mx-auto mb-2">
                <MdCheckCircleOutline className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-base-text-primary">
                {editId ? "Berhasil Diperbarui" : "Berhasil Ditambahkan"}
              </h3>
              <p className="text-sm text-base-text-secondary">
                {editId 
                  ? "Artikel atau video edukasi berhasil diperbarui."
                  : "Artikel atau video edukasi baru berhasil diterbitkan ke katalog posyandu."}
              </p>
            </div>
            <div className="p-4 bg-base-bg/50 border-t border-base-border/30 flex justify-center">
              <button
                type="button"
                onClick={() => {
                  setShowSuccessModal(false);
                  router.push(editId ? `/edukasi/${editId}` : "/edukasi");
                }}
                className="w-full max-w-[200px] py-2.5 rounded-xl bg-status-green-solid text-base-white font-bold hover:bg-status-green-solid/90 transition shadow-sm cursor-pointer text-xs"
              >
                {editId ? "Lihat Artikel" : "Kembali ke Edukasi"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TambahArtikelPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-10 h-10 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-semibold text-base-text-secondary">Memuat formulir...</p>
      </div>
    }>
      <TambahArtikelForm />
    </Suspense>
  );
}

function getMockContent(id: string, title: string): string {
  if (id === "L1") {
    return `
      <p>Memasuki usia 6 bulan, kebutuhan gizi bayi tidak lagi dapat dipenuhi hanya oleh ASI. Disinilah peran MPASI (Makanan Pendamping ASI) pertama sangat krusial untuk mencegah stunting dan melatih keterampilan motorik oral anak.</p>
      
      <h2>1. Jadwal Pemberian MPASI</h2>
      <p>Jadwal makan sebaiknya teratur agar bayi mengenali rasa lapar dan kenyang. Berikut adalah jadwal yang disarankan untuk bayi usia 6 bulan:</p>
      <ul>
        <li><strong>06.00:</strong> ASI</li>
        <li><strong>08.00:</strong> MPASI Utama Pagi (Porsi 2-3 sendok makan)</li>
        <li><strong>10.00:</strong> Selingan buah lumat atau ASI</li>
        <li><strong>12.00:</strong> MPASI Utama Siang</li>
        <li><strong>14.00:</strong> ASI</li>
        <li><strong>16.00:</strong> Selingan sore / ASI</li>
        <li><strong>18.00:</strong> MPASI Utama Sore (opsional/bertahap)</li>
      </ul>

      <h2>2. Tekstur Makanan</h2>
      <p>Untuk bayi 6 bulan, tekstur wajib berupa <strong>puree halus (bubur saring)</strong>. Makanan harus disaring menggunakan saringan kawat agar tidak menyisakan serat kasar yang dapat membuat bayi tersedak.</p>
      
      <blockquote>
        "Jangan memberikan makanan yang terlalu encer. Makanan pendamping harus cukup kental sehingga tidak mudah jatuh dari sendok saat dimiringkan." - Panduan Gizi Kemenkes
      </blockquote>

      <h2>3. Contoh Porsi dan Kandungan Gizi</h2>
      <p>Gunakan konsep menu lengkap (mengandung karbohidrat, protein hewani, lemak, sedikit sayur/buah). Berikut adalah tabel takaran gizi harian yang direkomendasikan:</p>

      <table>
        <thead>
          <tr>
            <th>Bahan Makanan</th>
            <th>Fungsi Utama</th>
            <th>Porsi per Sajian</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Beras Merah/Putih</td>
            <td>Energi & Karbohidrat</td>
            <td>1-1.5 sendok makan</td>
          </tr>
          <tr>
            <td>Hati Ayam / Daging Sapi</td>
            <td>Zat Besi & Protein Hewani</td>
            <td>1 sendok makan (haluskan)</td>
          </tr>
          <tr>
            <td>Minyak Kelapa / Mentega</td>
            <td>Lemak Tambahan (Kalori)</td>
            <td>1/2 sendok teh</td>
          </tr>
          <tr>
            <td>Bayam / Wortel</td>
            <td>Vitamin & Mineral</td>
            <td>Seujung sendok (hanya perkenalan)</td>
          </tr>
        </tbody>
      </table>

      <img src="https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?q=80&w=600&auto=format&fit=crop" alt="MPASI Sehat Bayi 6 Bulan" />

      <h2>Kesimpulan</h2>
      <p>Mulailah dengan sabar dan biarkan bayi menikmati proses belajarnya. Tanda MPASI berhasil adalah ketika kenaikan berat badan bayi sesuai kurva KMS di posyandu.</p>
    `;
  }
  
  if (id === "L2") {
    return `
      <p>Imunisasi adalah langkah preventif paling efektif untuk melindungi anak dari penyakit menular berbahaya. Di Indonesia, Kementerian Kesehatan menetapkan jadwal imunisasi dasar wajib yang harus didapatkan lengkap sebelum anak berusia 1 tahun.</p>
      
      <blockquote>
        "Mencegah jauh lebih baik, lebih murah, dan lebih aman daripada mengobati. Imunisasi lengkap melatih sistem imun anak agar siap menghadapi infeksi nyata."
      </blockquote>

      <h2>Jadwal Imunisasi Lengkap Usia 0 - 12 Bulan</h2>
      <p>Pastikan buah hati Anda mendapatkan imunisasi berikut tepat waktu sesuai dengan bulannya:</p>

      <table>
        <thead>
          <tr>
            <th>Usia Anak</th>
            <th>Jenis Imunisasi Wajib</th>
            <th>Melindungi Dari Penyakit</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Kurang dari 24 Jam</td>
            <td>Hepatitis B (HB-0)</td>
            <td>Kerusakan hati (Hepatitis B)</td>
          </tr>
          <tr>
            <td>1 Bulan</td>
            <td>BCG & Polio 1</td>
            <td>TBC (Tuberkulosis) & Kelumpuhan (Polio)</td>
          </tr>
          <tr>
            <td>2 Bulan</td>
            <td>DPT-HB-Hib 1, Polio 2, PCV 1, Rotavirus 1</td>
            <td>Difteri, Tetanus, Pertusis, Radang Paru, Diare Akut</td>
          </tr>
          <tr>
            <td>3 Bulan</td>
            <td>DPT-HB-Hib 2, Polio 3, Rotavirus 2</td>
            <td>Difteri, Tetanus, Batuk Rejan, Diare Rotavirus</td>
          </tr>
          <tr>
            <td>4 Bulan</td>
            <td>DPT-HB-Hib 3, Polio 4, IPV (Polio suntik), Rotavirus 3</td>
            <td>Perlindungan ganda polio dan tetanus infeksius</td>
          </tr>
          <tr>
            <td>9 Bulan</td>
            <td>Campak-Rubella (MR) 1, PCV 3</td>
            <td>Campak dan kecacatan janin bawaan (Rubella)</td>
          </tr>
          <tr>
            <td>12 Bulan</td>
            <td>PCV Lanjutan</td>
            <td>Penguat kekebalan paru anak</td>
          </tr>
        </tbody>
      </table>

      <h2>Apa yang Harus Dilakukan Setelah Imunisasi?</h2>
      <p>Umumnya anak akan mengalami reaksi ringan atau KIPI (Kejadian Ikutan Pasca Imunisasi) seperti demam ringan atau kemerahan di bekas suntikan. Langkah penanganannya:</p>
      <ol>
        <li>Kompres area bekas suntikan dengan kain bersih yang dibasahi air dingin.</li>
        <li>Berikan ASI lebih sering untuk menjaga hidrasi bayi.</li>
        <li>Berikan obat penurun panas sesuai dosis rekomendasi dokter atau bidan jika suhu tubuh di atas 38°C.</li>
      </ol>
    `;
  }

  return `
    <p>Ini adalah isi artikel tentang <strong>${title}</strong>.</p>
    <p>Artikel ini berisi informasi berharga untuk memantau kesehatan dan asupan nutrisi optimal bagi ibu dan balita Anda di Posyandu.</p>
    
    <blockquote>
      "Keluarga sehat dan bahagia dimulai dari pemahaman gizi dan tumbuh kembang anak sejak 1000 Hari Pertama Kehidupan (HPK)."
    </blockquote>

    <h2>Panduan Kesehatan Praktis</h2>
    <p>Lakukan pemeriksaan rutin di Posyandu setiap bulan untuk memantau status gizi anak secara akurat melalui kurva berat badan dan tinggi badan.</p>

    <table>
      <thead>
        <tr>
          <th>Langkah Pemantauan</th>
          <th>Frekuensi</th>
          <th>Tujuan Utama</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Penimbangan Berat Badan</td>
          <td>Setiap Bulan</td>
          <td>Deteksi dini gagal tumbuh / stunting</td>
        </tr>
        <tr>
          <td>Pengukuran Tinggi Badan</td>
          <td>Setiap Bulan</td>
          <td>Mengukur perkembangan tulang linier anak</td>
        </tr>
        <tr>
          <td>Konsultasi Bidan/Kader</td>
          <td>Setiap Bulan</td>
          <td>Mendapatkan saran pemberian nutrisi MPASI</td>
        </tr>
      </tbody>
    </table>
    
    <p>Selalu penuhi kebutuhan nutrisi hewani, sayuran hijau, dan air putih berkualitas demi menjaga kebugaran tubuh harian.</p>
  `;
}
