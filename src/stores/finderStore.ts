import { chemin, pString } from "@dldc/chemin";
import { createFinderStore, TPanelsDefsBase } from "./createFinderStore";

export type HomeActiveId = null | "files" | "users";

export interface PanelStates {
  home: { activeId: HomeActiveId };
  files: { search?: string };
  file: { id: string };
  users: { search?: string };
  user: { id: string };
  notFound: null;
}

const FILE_CHEMIN = chemin("file", pString("fileId"));
const FILES_CHEMIN = chemin("files");
const USERS_CHEMIN = chemin("users");
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
    toLocation: () => {
      return FILES_CHEMIN.serialize();
    },
    parentPanels: () => ({ key: "home", state: { activeId: "files" } }),
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
    toLocation: (state) => {
      return FILE_CHEMIN.serialize({ fileId: state.id });
    },
    parentPanels: () => ({ key: "home", state: { activeId: "files" } }),
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
    toLocation: () => {
      return USERS_CHEMIN.serialize();
    },
    parentPanels: () => ({ key: "home", state: { activeId: "users" } }),
  },
  {
    key: "home",
    fromLocation: (location) => {
      const match = HOME_CHEMIN.matchExact(location.pathname);
      if (match) {
        return { activeId: null };
      }
      return false;
    },
    toLocation: () => {
      return HOME_CHEMIN.serialize();
    },
  },
  {
    key: "notFound",
    fromLocation: () => {
      return null;
    },
    parentPanels: () => ({ key: "home", state: { activeId: null } }),
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
