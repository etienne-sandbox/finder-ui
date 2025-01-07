import { chemin, pString } from "@dldc/chemin";
import { createFinderStore, TPanelsDefsBase } from "../shared/utils/createFinderStore";
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

export const BASE_PANELS: TPanelsDefsBase<PanelStates> = [
  {
    key: "files",
    fromLocation: (location) => {
      const match = FILES_CHEMIN.matchExact(location.pathname);
      if (match) {
        return {};
      }
      return false;
    },
    toLocation: () => FILES_CHEMIN.serialize(),
    parentPanels: () => ({ key: "home", state: null }),
    preloaded: () => Boolean(queryClient.getQueryData(homeData().queryKey)),
    preload: async () => {
      await queryClient.prefetchQuery(homeData());
    },
  },
  {
    key: "file",
    fromLocation: (location) => {
      const match = FILE_CHEMIN.matchExact(location.pathname);
      if (match) {
        return { id: match.fileId };
      }
      return false;
    },
    toLocation: (state) => FILE_CHEMIN.serialize({ fileId: state.id }),
    parentPanels: () => ({ key: "home", state: null }),
    preloaded: (state) => Boolean(queryClient.getQueryData(fileData(state.id).queryKey)),
    preload: async (state) => {
      await queryClient.prefetchQuery(fileData(state.id));
    },
  },
  {
    key: "users",
    fromLocation: (location) => {
      const match = USERS_CHEMIN.matchExact(location.pathname);
      if (match) {
        return {};
      }
      return false;
    },
    toLocation: () => USERS_CHEMIN.serialize(),
    parentPanels: () => ({ key: "home", state: null }),
    preloaded: () => Boolean(queryClient.getQueryData(usersData().queryKey)),
    preload: async () => {
      await queryClient.prefetchQuery(usersData());
    },
  },
  {
    key: "user",
    fromLocation: (location) => {
      const match = USER_CHEMIN.matchExact(location.pathname);
      if (match) {
        return { id: match.userId };
      }
      return false;
    },
    toLocation: (state) => USER_CHEMIN.serialize({ userId: state.id }),
    parentPanels: () => ({ key: "home", state: null }),
  },
  {
    key: "home",
    fromLocation: (location) => {
      const match = HOME_CHEMIN.matchExact(location.pathname);
      if (match) {
        return null;
      }
      return false;
    },
    toLocation: () => HOME_CHEMIN.serialize(),
  },
  {
    key: "notFound",
    fromLocation: () => null,
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
