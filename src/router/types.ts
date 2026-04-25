export type AppRouteHandle = {
  title: string;
  tabs?: {
    items: { id: string; label: string }[];
  };
} | null;
