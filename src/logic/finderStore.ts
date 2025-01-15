import { chemin, pString } from "@dldc/chemin";
import { createFinderStore } from "../shared/utils/createFinderStore";
import { TMatchLocation, TPanelsDefsBase } from "../shared/utils/createFinderStore.types";
import { fileData, homeData, usersData } from "./data";
import { queryClient } from "./queryClient";

export type HomeActiveId = null | "files" | "users";

export interface PanelStates {
  home: null;
  files: { search?: string };
  file: { id: string };
  users: { search?: string };
  user: { id: string };
  notFound: null;
}

const FILES_CHEMIN = chemin("files");
const FILE_CHEMIN = chemin("file", pString("fileId"));
const USERS_CHEMIN = chemin("users");
const USER_CHEMIN = chemin("user", pString("userId"));
const HOME_CHEMIN = chemin();

export const matchLocation: TMatchLocation<PanelStates> = (location, { withParents }) => {
  if (FILES_CHEMIN.matchExact(location.pathname)) {
    return withParents({ key: "files", state: {} });
  }
  const fileMatch = FILE_CHEMIN.matchExact(location.pathname);
  if (fileMatch) {
    const { fileId } = fileMatch;
    return withParents({ key: "file", state: { id: fileId } });
  }
  if (USERS_CHEMIN.matchExact(location.pathname)) {
    return withParents({ key: "users", state: {} });
  }
  const userMatch = USER_CHEMIN.matchExact(location.pathname);
  if (userMatch) {
    const { userId } = userMatch;
    return withParents({ key: "user", state: { id: userId } });
  }
  if (HOME_CHEMIN.matchExact(location.pathname)) {
    return withParents({ key: "home", state: null });
  }
  return withParents({ key: "notFound", state: null });
};

export const PANELS: TPanelsDefsBase<PanelStates> = [
  {
    key: "files",
    toLocation: () => FILES_CHEMIN.serialize(),
    parentPanels: () => ({ key: "home", state: null }),
    preloaded: () => Boolean(queryClient.getQueryData(homeData().queryKey)),
    preload: async () => {
      await queryClient.prefetchQuery(homeData());
    },
  },
  {
    key: "file",
    toLocation: (state) => FILE_CHEMIN.serialize({ fileId: state.id }),
    parentPanels: () => ({ key: "home", state: null }),
    preloaded: (state) => Boolean(queryClient.getQueryData(fileData(state.id).queryKey)),
    preload: async (state) => {
      await queryClient.prefetchQuery(fileData(state.id));
    },
  },
  {
    key: "users",
    toLocation: () => USERS_CHEMIN.serialize(),
    parentPanels: () => ({ key: "home", state: null }),
    preloaded: () => Boolean(queryClient.getQueryData(usersData().queryKey)),
    preload: async () => {
      await queryClient.prefetchQuery(usersData());
    },
  },
  {
    key: "user",
    toLocation: (state) => USER_CHEMIN.serialize({ userId: state.id }),
    parentPanels: () => ({ key: "home", state: null }),
  },
  {
    key: "home",
    toLocation: () => HOME_CHEMIN.serialize(),
  },
  {
    key: "notFound",
    parentPanels: () => ({ key: "home", state: null }),
  },
];

export const {
  FinderProvider,
  useFinderMaybe,
  useFinderOrFail,
  PanelProvider,
  usePanelMaybe,
  usePanelOrFail,
  usePanelState,
  Panel,
} = createFinderStore<PanelStates>();
