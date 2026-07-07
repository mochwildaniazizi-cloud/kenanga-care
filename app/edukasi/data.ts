export type CategoryType = "Gizi & MPASI" | "Imunisasi" | "Ibu Hamil" | "Ibu Nifas" | "Tumbuh Kembang";

export interface Article {
  id: string;
  title: string;
  categories: CategoryType[];
  type: "Artikel" | "Video";
  duration: string;
  imageUrl: string;
  isLanjutkanMembaca?: boolean;
}

export const mockArticles: Article[] = [];