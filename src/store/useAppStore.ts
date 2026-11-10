import { create } from 'zustand';
import { getDeviceId } from '@/api/deviceId';
import { shoppingListService } from '@/services/shoppingListService';
import { backgroundSnapshot } from '@/services/backgroundSnapshot';
import type { ShoppingItem, ShoppingItemGroups, ShoppingItemPayload } from '@/types/shopping';
import { cleanError } from '@/utils/format';
interface AppState extends ShoppingItemGroups {
  deviceId: string | null;
  busy: boolean;
  error: string | null;
  initialize: () => Promise<void>;
  refresh: () => Promise<void>;
  add: (payload:ShoppingItemPayload) => Promise<void>;
  edit: (id:string,payload:ShoppingItemPayload) => Promise<void>;
  toggle: (id:string) => Promise<void>;
  remove: (id:string) => Promise<void>;
  clearCompleted: () => Promise<void>;
  clearError: () => void;
}
async function mutate(operation:()=>Promise<void>, refresh:()=>Promise<void>, set:(value:Partial<AppState>)=>void) {
  set({busy:true,error:null});
  try { await operation(); await refresh(); }
  catch(err) { set({error:cleanError(err)}); throw err; }
  finally { set({busy:false}); }
}
export const useAppStore = create<AppState>((set,get) => ({
  deviceId:null, pending:[],completed:[],busy:false,error:null,
  async initialize(){
    const id = await getDeviceId();
    set({deviceId:id});
  },
  async refresh(){
    set({busy:true,error:null});
    try {
      const groups = await shoppingListService.getAll();
      set(groups);
      await backgroundSnapshot.savePending(groups.pending);
    } catch(err) { set({error:cleanError(err)}); throw err; }
    finally {set({busy:false});}
  },
  add:payload => mutate(() => shoppingListService.add(payload),get().refresh,set),
  edit:(id,payload) => mutate(() => shoppingListService.update(id,payload),get().refresh,set),
  toggle:id => mutate(() => shoppingListService.toggle(id),get().refresh,set),
  remove:id => mutate(() => shoppingListService.remove(id),get().refresh,set),
  clearCompleted:() => mutate(() => shoppingListService.clearCompleted(),get().refresh,set),
  clearError:() => set({error:null}),
}));
/** Útil para componentes sem acessos diretos às implementações da API. */
export function findItem(id:string):ShoppingItem|undefined {
  const {pending,completed} = useAppStore.getState();
  return [...pending,...completed].find(item=>item.id===id);
}
