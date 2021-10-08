import React, {createContext, useContext, useMemo} from "react";
import {RootStore} from "./store";

const StoreContext = createContext<RootStore>(new RootStore());

export const useRootStore = () => useContext(StoreContext);
