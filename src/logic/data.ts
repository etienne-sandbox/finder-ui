import { queryOptions } from "@tanstack/react-query";

export function filesData() {
  return queryOptions({
    queryKey: ["files-data"],
    queryFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return {};
    },
  });
}

export function homeData() {
  return queryOptions({
    queryKey: ["home-data"],
    queryFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return {};
    },
  });
}

export function usersData() {
  return queryOptions({
    queryKey: ["users-data"],
    queryFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return {};
    },
  });
}

export function fileData(fileId: string) {
  return queryOptions({
    queryKey: ["file-data", fileId],
    queryFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return {};
    },
  });
}
